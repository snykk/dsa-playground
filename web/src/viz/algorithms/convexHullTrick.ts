/**
 * Convex hull trick tracer: MonotonicCHT for minimum queries, drawn with LineEnvelopeView.
 *
 * Mirrors Algorithms/Dynamic_Programming/DP_Optimizations/Convex_Hull_Trick/Python/cht.py:
 * MonotonicCHT.add_line / _bad / query. add_line first settles equal slopes against the last line
 * (keep the lower intercept), then pops the back while _bad(lines[-2], lines[-1], new) holds:
 * (b3 - b1) * (m1 - m2) <= (b2 - b1) * (m1 - m3), all in integers. query pops the front while
 * the first line's value is >= the second's at x, and raises ValueError on an empty deque. The
 * class does not check its preconditions (non-increasing slopes, non-decreasing x): the run does
 * what Python does and says when an answer differs from the true minimum.
 * Golden fixtures (__fixtures__/advancedDp.json) pin the deque after every operation and every answer.
 *
 * Input: "add 3 0, add 2 4, add 1 3, query 0, query 2"   (a and q for short)
 */
import { InputError, type Frame, type Role } from '../core/types';
import type { EnvelopeState, EnvLine, EnvMark, EnvWindow } from '../renderers/LineEnvelopeView';
import { parseCall, scriptSegments } from './hashTable';

export type ChtOp = { kind: 'add'; m: number; b: number } | { kind: 'query'; x: number };

export interface ChtInput {
  ops: ChtOp[];
}

export const CHT_LIMITS = { maxLines: 8, maxQueries: 12, maxOps: 18, slope: 9, intercept: 99, x: 30 };

const NAMES: Record<string, ChtOp['kind']> = { add: 'add', add_line: 'add', a: 'add', line: 'add', query: 'query', q: 'query' };

export function parseCht(text: string): ChtInput {
  const ops: ChtOp[] = [];
  const int = (tok: string, what: string, lim: number) => {
    if (!/^-?\d+$/.test(tok)) throw new InputError(`"${tok}" is not a whole number (${what}). The code works on integers.`);
    const v = Number(tok) || 0;
    if (Math.abs(v) > lim) throw new InputError(`${what} goes from -${lim} to ${lim} here, so the lines fit on the plot (got ${tok}).`);
    return v;
  };
  for (const seg of scriptSegments(text)) {
    const call = parseCall(seg);
    const kind = call && NAMES[call.name];
    if (!call || !kind) throw new InputError(`Cannot read "${seg}". Write operations like "add 2 4" (the line y = 2x + 4) and "query 3", separated by commas.`);
    if (kind === 'add') {
      if (call.args.length !== 2) throw new InputError(`"${seg}": add takes a slope and an intercept, as in "add 2 4".`);
      ops.push({ kind, m: int(call.args[0], 'A slope', CHT_LIMITS.slope), b: int(call.args[1], 'An intercept', CHT_LIMITS.intercept) });
    } else {
      if (call.args.length !== 1) throw new InputError(`"${seg}": query takes one x, as in "query 3".`);
      ops.push({ kind, x: int(call.args[0], 'A query x', CHT_LIMITS.x) });
    }
  }
  if (ops.length === 0) throw new InputError('Add at least one operation, for example "add 2 4, query 3".');
  if (ops.length > CHT_LIMITS.maxOps) throw new InputError(`At most ${CHT_LIMITS.maxOps} operations, please (got ${ops.length}).`);
  const adds = ops.filter((o) => o.kind === 'add').length;
  if (adds > CHT_LIMITS.maxLines) throw new InputError(`At most ${CHT_LIMITS.maxLines} add operations, so every line keeps a readable label (got ${adds}).`);
  if (ops.length - adds > CHT_LIMITS.maxQueries) throw new InputError(`At most ${CHT_LIMITS.maxQueries} queries, please.`);
  return { ops };
}

export function formatChtOp(op: ChtOp): string {
  return op.kind === 'add' ? `add_line(${op.m}, ${op.b})` : `query(${op.x})`;
}

export const CHT_CODE = [
  'add_line(m, b):',
  '  if lines and lines[-1][0] == m:       # equal slopes',
  '    if lines[-1][1] <= b: return        # the new line is never lower',
  '    lines.pop()',
  '  while len(lines) >= 2 and _bad(lines[-2], lines[-1], (m, b)):',
  '    lines.pop()                         # lines[-1] is never the minimum',
  '  lines.append((m, b))',
  '_bad(l1, l2, l3):                       # slopes m1 > m2 > m3',
  '  return (b3 - b1) * (m1 - m2) <= (b2 - b1) * (m1 - m3)',
  'query(x):                               # x never decreases',
  '  if not lines: raise ValueError("no lines in CHT")',
  '  while len(lines) >= 2:',
  '    if m1 * x + b1 >= m2 * x + b2: lines.popleft()   # the front line lost for good',
  '    else: break',
  '  m, b = lines[0]; return m * x + b',
];

export interface ChtStep {
  op: ChtOp;
  /** The deque after the operation, front first, as (m, b). */
  lines: Array<[number, number]>;
  result?: number;
  error?: string;
}

export interface ChtRun {
  frames: Array<Frame<EnvelopeState>>;
  steps: ChtStep[];
}

interface Line {
  id: number;
  m: number;
  b: number;
}

const val = (l: { m: number; b: number }, x: number) => l.m * x + l.b;
const tup = (l: { m: number; b: number }) => `(${l.m}, ${l.b})`;
const name = (l: Line) => `L${l.id + 1}`;
const show = (v: number) => String(Math.round(v * 100) / 100);

/** Pointwise minimum of the lines over [x0, x1] as a polyline (breakpoints are pairwise intersections). */
export function lowerEnvelope(lines: Array<{ m: number; b: number }>, x0: number, x1: number): Array<[number, number]> {
  if (lines.length === 0) return [];
  const xs = new Set<number>([x0, x1]);
  for (let i = 0; i < lines.length; i++) {
    for (let j = i + 1; j < lines.length; j++) {
      if (lines[i].m === lines[j].m) continue;
      const x = (lines[j].b - lines[i].b) / (lines[i].m - lines[j].m);
      if (x > x0 && x < x1) xs.add(x);
    }
  }
  const pts = [...xs].sort((a, b) => a - b).map((x): [number, number] => [x, Math.min(...lines.map((l) => val(l, x)))]);
  // Keep only the corners: drop a point that lies on the segment between its neighbours.
  return pts.filter((p, i) => {
    if (i === 0 || i === pts.length - 1) return true;
    const [a, c] = [pts[i - 1], pts[i + 1]];
    return Math.abs((p[0] - a[0]) * (c[1] - a[1]) - (p[1] - a[1]) * (c[0] - a[0])) > 1e-9;
  });
}

/** One window for the whole run: the queries (and 0) widened to at least 8 units, then the envelope's values. */
export function chtWindow(ops: ChtOp[]): EnvWindow {
  const qs = ops.flatMap((o) => (o.kind === 'query' ? [o.x] : []));
  const all = ops.flatMap((o) => (o.kind === 'add' ? [{ m: o.m, b: o.b }] : []));
  let x0 = Math.min(0, ...qs) - 1;
  let x1 = Math.max(0, ...qs) + 1;
  if (qs.length === 0) {
    // No query: show where the lines cross.
    const env = lowerEnvelope(all, -12, 12).map(([x]) => x);
    x0 = Math.min(-2, ...env.filter((x) => x > -12)) - 1;
    x1 = Math.max(2, ...env.filter((x) => x < 12)) + 1;
  }
  if (x1 - x0 < 8) {
    const grow = 8 - (x1 - x0);
    x0 -= Math.floor(grow / 2);
    x1 += Math.ceil(grow / 2);
  }
  x0 = Math.floor(x0);
  x1 = Math.ceil(x1);
  const env = lowerEnvelope(all, x0, x1).map(([, y]) => y);
  let y0 = env.length ? Math.min(...env) : -5;
  let y1 = env.length ? Math.max(...env) : 5;
  // Keep every line in view somewhere, unless it is far above the envelope.
  const span = Math.max(4, y1 - y0);
  for (const l of all) {
    const lo = Math.min(val(l, x0), val(l, x1));
    if (lo <= y1 + span) y1 = Math.max(y1, Math.min(lo + span / 3, y1 + span));
  }
  const pad = Math.max(1, 0.1 * (y1 - y0));
  y0 = Math.floor(y0 - pad);
  y1 = Math.ceil(y1 + pad);
  if (y1 - y0 < 8) {
    const grow = 8 - (y1 - y0);
    y0 -= Math.floor(grow / 2);
    y1 += Math.ceil(grow / 2);
  }
  return { x0, x1, y0, y1 };
}

export function chtTrace({ ops }: ChtInput): ChtRun {
  const win = chtWindow(ops);
  const frames: Array<Frame<EnvelopeState>> = [];
  const steps: ChtStep[] = [];
  let deque: Line[] = [];
  const added: Line[] = [];
  let lastSlope: number | null = null;
  let lastX: number | null = null;
  let current = -1;

  interface Look {
    lines?: Record<number, Role>;
    /** Lines drawn although they are not in the deque (the new one, one just popped). */
    extra?: Array<{ line: Line; role: Role; dashed?: boolean }>;
    cells?: Record<number, Role>;
    probe?: { x: number; role?: Role };
    marks?: EnvMark[];
  }
  const snap = (line: number | undefined, caption: string, look: Look = {}, vars: Array<[string, string | number]> = []) => {
    const drawn: EnvLine[] = deque.map((l) => ({ id: `l${l.id}`, m: l.m, b: l.b, label: name(l), role: look.lines?.[l.id] }));
    for (const e of look.extra ?? []) {
      if (!deque.includes(e.line)) drawn.push({ id: `l${e.line.id}`, m: e.line.m, b: e.line.b, label: name(e.line), role: e.role, dashed: e.dashed });
    }
    // Lines that left the deque (or never entered it) stay as faint dashes, so a query can be checked against them.
    for (const l of added) {
      if (!drawn.some((d) => d.id === `l${l.id}`)) drawn.unshift({ id: `l${l.id}`, m: l.m, b: l.b, label: name(l), role: 'muted', dashed: true });
    }
    frames.push({
      line,
      caption,
      vars: [...(current >= 0 && current < ops.length ? [['op', formatChtOp(ops[current])] as [string, string]] : []), ...vars, ['lines in deque', deque.length]],
      state: {
        label: 'Lines, their lower envelope and the deque of the monotonic convex hull trick',
        window: win,
        lines: drawn,
        hull: lowerEnvelope(deque, win.x0, win.x1),
        probe: look.probe ? { x: look.probe.x, label: `x = ${look.probe.x}`, role: look.probe.role } : undefined,
        marks: look.marks,
        deque: deque.map((l) => ({ text: `${name(l)} ${tup(l)}`, role: look.cells?.[l.id] })),
        dequeLabel: 'lines',
        strips: [
          {
            label: 'Operations',
            items: ops.map((o, i) => ({ text: formatChtOp(o), role: i === current ? 'active' : i < current ? 'muted' : undefined })),
          },
        ],
      },
    });
  };

  snap(
    undefined,
    'MonotonicCHT(): an empty deque of lines. It keeps only lines that are the minimum somewhere, ordered by decreasing slope, so the minimum at x moves from the front line to later ones as x grows.',
  );

  ops.forEach((op, i) => {
    current = i;
    if (op.kind === 'add') {
      const nl: Line = { id: added.length, m: op.m, b: op.b };
      added.push(nl);
      const broken = lastSlope !== null && op.m > lastSlope;
      snap(
        0,
        `add_line(${op.m}, ${op.b}): the line ${name(nl)}, y = ${op.m}x ${op.b < 0 ? '-' : '+'} ${Math.abs(op.b)}.` +
          (broken
            ? ` Its slope ${op.m} is larger than the previous slope ${lastSlope}: the class requires non-increasing slopes and does not check, so from here on the deque can be wrong.`
            : lastSlope === null
              ? ' Slopes must arrive in non-increasing order.'
              : ` Its slope ${op.m} <= ${lastSlope}, the previous one, as required.`),
        { extra: [{ line: nl, role: broken ? 'bad' : 'active' }] },
        [
          ['m', op.m],
          ['b', op.b],
        ],
      );
      lastSlope = op.m;
      let rejected = false;
      const last = deque[deque.length - 1];
      if (last && last.m === op.m) {
        if (last.b <= op.b) {
          rejected = true;
          snap(
            2,
            `The last line ${name(last)} ${tup(last)} has the same slope ${op.m} and intercept ${last.b} <= ${op.b}: parallel and never above the new line, so ${name(nl)} can never be the minimum. add_line returns without adding it.`,
            { lines: { [last.id]: 'compare' }, cells: { [last.id]: 'compare' }, extra: [{ line: nl, role: 'muted', dashed: true }] },
            [
              ['m', op.m],
              ['b', op.b],
            ],
          );
        } else {
          deque = deque.slice(0, -1);
          snap(
            3,
            `The last line ${name(last)} ${tup(last)} has the same slope ${op.m} but a larger intercept ${last.b} > ${op.b}: the new line is lower everywhere, so pop ${name(last)}. ` +
              '(Equal slopes are settled here, because the cross-multiplied test needs strictly decreasing slopes.)',
            {
              extra: [
                { line: nl, role: 'active' },
                { line: last, role: 'muted', dashed: true },
              ],
            },
            [
              ['m', op.m],
              ['b', op.b],
            ],
          );
        }
      }
      if (!rejected) {
        while (deque.length >= 2) {
          const l1 = deque[deque.length - 2];
          const l2 = deque[deque.length - 1];
          const lhs = (nl.b - l1.b) * (l1.m - l2.m);
          const rhs = (l2.b - l1.b) * (l1.m - nl.m);
          const bad = lhs <= rhs;
          const marks: EnvMark[] = [];
          let geo = '';
          if (l1.m !== nl.m && l1.m !== l2.m) {
            const x13 = (nl.b - l1.b) / (l1.m - nl.m);
            const x12 = (l2.b - l1.b) / (l1.m - l2.m);
            marks.push({ id: 'x13', x: x13, y: val(l1, x13), label: `${name(nl)} meets ${name(l1)}`, role: 'active' });
            marks.push({ id: 'x12', x: x12, y: val(l1, x12), label: `${name(l2)} meets ${name(l1)}`, role: 'compare' });
            // "Takes over" reads the slopes as decreasing; out of order it would not be true.
            if (l1.m > l2.m && l2.m > nl.m) {
              geo = bad
                ? ` ${name(nl)} takes over from ${name(l1)} at x = ${show(x13)}, no later than ${name(l2)} does (x = ${show(x12)}), so ${name(l2)} is never strictly the lowest.`
                : ` ${name(nl)} takes over from ${name(l1)} only at x = ${show(x13)}, after ${name(l2)} does (x = ${show(x12)}), so ${name(l2)} is the minimum in between.`;
            }
          }
          snap(
            8,
            `_bad(${name(l1)}, ${name(l2)}, ${name(nl)}): (b3 - b1) * (m1 - m2) = (${nl.b} - ${l1.b}) * (${l1.m} - ${l2.m}) = ${lhs}, ` +
              `(b2 - b1) * (m1 - m3) = (${l2.b} - ${l1.b}) * (${l1.m} - ${nl.m}) = ${rhs}. ${lhs} <= ${rhs} is ${bad ? 'True' : 'False'}.${geo}` +
              (bad ? ` Pop ${name(l2)}.` : ` Keep ${name(l2)} and stop.`),
            {
              lines: { [l1.id]: 'compare', [l2.id]: bad ? 'bad' : 'good' },
              cells: { [l1.id]: 'compare', [l2.id]: bad ? 'bad' : 'good' },
              extra: [{ line: nl, role: 'active' }],
              marks,
            },
            [
              ['lhs', lhs],
              ['rhs', rhs],
              ['_bad', bad ? 'True' : 'False'],
            ],
          );
          if (!bad) break;
          deque = deque.slice(0, -1);
          snap(
            5,
            `lines.pop(): ${name(l2)} ${tup(l2)} leaves the back of the deque for good. ${deque.length >= 2 ? 'Test the new last two lines against ' + name(nl) + ' again.' : 'Fewer than two lines remain, so the loop ends.'}`,
            {
              extra: [
                { line: nl, role: 'active' },
                { line: l2, role: 'muted', dashed: true },
              ],
            },
            [['popped', `${name(l2)} ${tup(l2)}`]],
          );
        }
        deque = [...deque, nl];
        snap(
          6,
          `lines.append(${tup(nl)}): ${name(nl)} joins the back of the deque. The broad band is the lower envelope of the lines kept: ${deque.map(name).join(', ')}.`,
          { lines: { [nl.id]: 'active' }, cells: { [nl.id]: 'active' } },
          [['deque size', deque.length]],
        );
      }
      steps.push({ op, lines: deque.map((l) => [l.m, l.b]) });
      return;
    }

    // query(x)
    const x = op.x;
    if (deque.length === 0) {
      snap(
        10,
        `query(${x}): the deque is empty, so there is no line to evaluate: raise ValueError("no lines in CHT"). The run goes on with the next operation.`,
        { probe: { x, role: 'bad' } },
        [['x', x]],
      );
      steps.push({ op, lines: [], error: 'no lines in CHT' });
      lastX = x;
      return;
    }
    const down = lastX !== null && x < lastX;
    if (down) {
      snap(
        9,
        `query(${x}): x went down from ${lastX}. The class requires non-decreasing x and does not check: lines already popped from the front might be the minimum here, and they are gone.`,
        { probe: { x, role: 'bad' } },
        [
          ['x', x],
          ['previous x', lastX!],
        ],
      );
    }
    lastX = x;
    while (deque.length >= 2) {
      const [l1, l2] = deque;
      const v1 = val(l1, x);
      const v2 = val(l2, x);
      const pop = v1 >= v2;
      // Only slopes added out of order can leave a front line that is not the steeper one.
      const steeper = l1.m > l2.m;
      const disorder = `(Its slope ${l1.m} is not above ${l2.m}: slopes were added out of order, so the deque may be wrong.)`;
      snap(
        12,
        `query(${x}): the first two lines give ${name(l1)} = ${l1.m} * ${x} + ${l1.b} = ${v1} and ${name(l2)} = ${l2.m} * ${x} + ${l2.b} = ${v2}. ` +
          (pop
            ? steeper
              ? `${v1} >= ${v2}: ${name(l1)} is no better here, and being steeper it only gets worse as x grows, so it can never win a later query: popleft.`
              : `${v1} >= ${v2}: ${name(l1)} is no better here, so popleft. ${disorder}`
            : steeper
              ? `${v1} < ${v2}: ${name(l1)} is still the lowest, and the lines behind it have smaller slopes, so stop.`
              : `${v1} < ${v2}: ${name(l1)} beats ${name(l2)} here, so stop. ${disorder}`),
        {
          probe: { x },
          lines: { [l1.id]: pop ? 'bad' : 'good', [l2.id]: 'compare' },
          cells: { [l1.id]: pop ? 'bad' : 'good', [l2.id]: 'compare' },
          marks: [
            { id: 'v1', x, y: v1, label: String(v1), role: pop ? 'bad' : 'good' },
            { id: 'v2', x, y: v2, label: String(v2), role: 'compare' },
          ],
        },
        [
          ['x', x],
          [`${name(l1)}(x)`, v1],
          [`${name(l2)}(x)`, v2],
        ],
      );
      if (!pop) break;
      deque = deque.slice(1);
      snap(
        13,
        `lines.popleft(): ${name(l1)} ${tup(l1)} leaves the front of the deque for good. Every line is popped at most once, which is why a query is O(1) amortized.`,
        {
          probe: { x },
          extra: [{ line: l1, role: 'muted', dashed: true }],
        },
        [['popped', `${name(l1)} ${tup(l1)}`]],
      );
    }
    const front = deque[0];
    const ans = val(front, x);
    const truth = Math.min(...added.map((l) => val(l, x)));
    const right = ans === truth;
    snap(
      14,
      `return ${name(front)}(${x}) = ${front.m} * ${x} + ${front.b} = ${ans}.` +
        (right
          ? ` That is the minimum over every line added so far (${added.length}), found without looking at the others.`
          : ` But the true minimum over every line added is ${truth}: a precondition was broken, so the deque no longer holds the right line.`),
      {
        probe: { x, role: right ? 'compare' : 'bad' },
        lines: { [front.id]: right ? 'good' : 'bad' },
        cells: { [front.id]: right ? 'good' : 'bad' },
        marks: [{ id: 'ans', x, y: ans, label: `min = ${ans}`, role: right ? 'good' : 'bad' }],
      },
      [
        ['x', x],
        ['answer', ans],
        ['true minimum', truth],
      ],
    );
    steps.push({ op, lines: deque.map((l) => [l.m, l.b]), result: ans });
  });

  current = ops.length;
  const answers = steps.filter((s) => s.result !== undefined).map((s) => s.result);
  snap(
    undefined,
    `Done: ${deque.length} line${deque.length === 1 ? '' : 's'} left in the deque` +
      (answers.length ? `, answers ${answers.join(', ')}.` : '.') +
      ' Each line entered once and left at most once, so n operations cost O(n) in total.',
  );
  return { frames, steps };
}
