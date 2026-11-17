/**
 * Euclidean algorithm tracer, drawn with EuclidTiling: the |a| x |b| rectangle tiled by the
 * largest squares that fit, next to the table of remainders that the extended form fills back
 * up with its coefficients.
 *
 * Mirrors Algorithms/Mathematical_Algorithms/Number_Theory/Euclidean_Algorithm/Python/euclidean_algorithm.py:
 *   gcd(a, b)            a, b = abs(a), abs(b); if b == 0: return a; return gcd(b, a % b)
 *   gcd_iterative(a, b)  a, b = abs(a), abs(b); while b != 0: a, b = b, a % b; return a
 *   lcm(a, b)            0 if a == 0 or b == 0, else abs(a * b) // gcd(a, b)
 *   extended_gcd(a, b)   _extended_gcd_nonneg(abs(a), abs(b)), then x flips when a < 0 and y when b < 0
 *   _extended_gcd_nonneg(a, b): (a, 1, 0) when b == 0, else with (g, x1, y1) from (b, a % b):
 *                        (g, y1, x1 - (a // b) * y1)
 * One step (a, b) -> (b, a % b) cuts a // b squares of side b off the current rectangle and
 * keeps the a % b strip that is left; the last square side that leaves no strip is the gcd.
 * Golden fixtures (__fixtures__/numberTheory.json, section "euclid") pin every call and the
 * triple each level of the recursion returns.
 *
 * Input: "ext 240 46, gcd 48 18, gcd_iterative 0 5, lcm -4 6"   (also extended_gcd(240, 46))
 * Values from -9999 to 9999 keep every product below 2^53 and the table of remainders on screen.
 */
import { InputError, type Frame, type Role } from '../core/types';
import type { StripData, StripItem } from '../ui/molecules/Strip';
import { callOf, segments, type StripSlot } from './numberTheoryCommon';

export type EuclidKind = 'gcd' | 'gcd_iterative' | 'lcm' | 'extended_gcd';

export interface EuclidCall {
  kind: EuclidKind;
  a: number;
  b: number;
}

export interface EuclidInput {
  calls: EuclidCall[];
}

export const EUCLID_LIMITS = { maxValue: 9999, maxCalls: 8 };

const NAMES: Record<string, EuclidKind> = {
  gcd: 'gcd',
  gcd_iterative: 'gcd_iterative',
  gcdi: 'gcd_iterative',
  iter: 'gcd_iterative',
  iterative: 'gcd_iterative',
  lcm: 'lcm',
  extended_gcd: 'extended_gcd',
  ext: 'extended_gcd',
  egcd: 'extended_gcd',
  xgcd: 'extended_gcd',
};

export function parseEuclid(text: string): EuclidInput {
  const calls: EuclidCall[] = [];
  for (const segment of segments(text)) {
    const call = callOf(segment);
    const kind = call ? NAMES[call.name] : undefined;
    if (!call || !kind) {
      throw new InputError(`Cannot read "${segment}". Write calls like "ext 240 46", "gcd 48 18", "gcd_iterative 48 18" or "lcm 4 6", separated by commas.`);
    }
    if (call.args.length !== 2) throw new InputError(`"${segment}": ${kind} takes two integers, as in "${call.name} 48 18".`);
    const [a, b] = call.args.map((t) => {
      if (!/^[+-]?\d+$/.test(t)) throw new InputError(`"${t}" is not a whole number.`);
      const v = Number(t) || 0;
      if (Math.abs(v) > EUCLID_LIMITS.maxValue) {
        throw new InputError(`Values go from -${EUCLID_LIMITS.maxValue} to ${EUCLID_LIMITS.maxValue} (got ${t}), so every product stays exact and the table of remainders fits on screen.`);
      }
      return v;
    });
    calls.push({ kind, a, b });
  }
  if (calls.length === 0) throw new InputError('Add at least one call, for example "ext 240 46" or "gcd 48 18".');
  if (calls.length > EUCLID_LIMITS.maxCalls) throw new InputError(`At most ${EUCLID_LIMITS.maxCalls} calls, please (got ${calls.length}).`);
  return { calls };
}

export function formatEuclidCall(c: EuclidCall): string {
  return `${c.kind}(${c.a}, ${c.b})`;
}

/* ---------- pseudocode ---------- */

export const EUCLID_CODE = [
  'extended_gcd(a, b):',
  '  g, x, y = _extended_gcd_nonneg(abs(a), abs(b))',
  '  return (g, -x if a < 0 else x, -y if b < 0 else y)',
  '_extended_gcd_nonneg(a, b):',
  '  if b == 0: return (a, 1, 0)',
  '  g, x1, y1 = _extended_gcd_nonneg(b, a % b)',
  '  return (g, y1, x1 - (a // b) * y1)',
  'gcd(a, b):',
  '  a, b = abs(a), abs(b)',
  '  if b == 0: return a',
  '  return gcd(b, a % b)',
  'gcd_iterative(a, b):',
  '  a, b = abs(a), abs(b)',
  '  while b != 0: a, b = b, a % b',
  '  return a',
  'lcm(a, b):',
  '  if a == 0 or b == 0: return 0',
  '  return abs(a * b) // gcd(a, b)',
];

const L = {
  extStart: 1,
  extReturn: 2,
  egcdBase: 4,
  egcdCall: 5,
  egcdReturn: 6,
  gcdAbs: 8,
  gcdBase: 9,
  gcdCall: 10,
  iterAbs: 12,
  iterLoop: 13,
  iterReturn: 14,
  lcmZero: 16,
  lcmReturn: 17,
};

/* ---------- geometry of the tiling ---------- */

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** A run of `count` squares of side `side`, side by side along `dir`, starting at (x, y). */
export interface TileRun {
  id: string;
  x: number;
  y: number;
  side: number;
  count: number;
  dir: 'x' | 'y';
  role: Role;
}

export interface EuclidPanel {
  /** Which call of the script: shapes of another call never glide into these. */
  call: number;
  /** The rectangle |a| wide and |b| tall, in units (a side may be 0). */
  width: number;
  height: number;
  runs: TileRun[];
  /** The part being worked on: the strip left over, or the rectangle of one recursion level. */
  focus?: Box & { role: Role };
  /** The part of the rectangle the picture shows, in units. */
  camera: Box;
  /** A g x g grid over the whole rectangle (the end of a call). */
  grid?: number;
  /** Shown when there is no rectangle to draw. */
  note?: string;
}

export interface TableCell {
  text: string;
  role?: Role;
}

export interface EuclidTable {
  columns: string[];
  rows: TableCell[][];
}

export interface EuclidState {
  panel: EuclidPanel;
  table: EuclidTable;
  strips: StripData[];
  /** Every strip of the run at its widest (stripSlots in a stabilize step), so the strips keep their room. */
  stripSlots?: StripSlot[];
  /** Same for every frame of a run (stabilizeEuclid): rows, characters per column, the widest table. */
  layout?: { rows: number; cols: number[]; width: number };
}

/** One Euclid step on (a, b) with b > 0, or the base (b = 0), with where it sits in the rectangle. */
export interface EuclidLevel {
  a: number;
  b: number;
  q: number | null;
  r: number | null;
  rect: Box;
  horizontal: boolean;
  run: TileRun | null;
  rest: Box | null;
}

/** The levels of Euclid on (A, B), A, B >= 0: level k is the pair (a_k, b_k) and the squares it cuts. */
export function tiling(A: number, B: number, call: number): EuclidLevel[] {
  const levels: EuclidLevel[] = [];
  let a = A;
  let b = B;
  let rect: Box = { x: 0, y: 0, w: A, h: B };
  let horizontal = true;
  for (let k = 0; ; k++) {
    if (b === 0) {
      levels.push({ a, b, q: null, r: null, rect, horizontal, run: null, rest: null });
      return levels;
    }
    const q = Math.floor(a / b);
    const r = a % b;
    const run: TileRun | null = q > 0 ? { id: `c${call}-l${k}`, x: rect.x, y: rect.y, side: b, count: q, dir: horizontal ? 'x' : 'y', role: 'idle' } : null;
    const rest: Box = horizontal ? { x: rect.x + q * b, y: rect.y, w: r, h: b } : { x: rect.x, y: rect.y + q * b, w: b, h: r };
    levels.push({ a, b, q, r, rect, horizontal, run, rest });
    [a, b] = [b, r];
    rect = rest;
    horizontal = !horizontal;
  }
}

/**
 * The view for a level: its whole rectangle, or for a long thin one the leftover strip and the
 * last squares. The base level shows the last cut, and a level that cuts nothing (a < b at the
 * start) shows the next one; a rectangle with a zero side is shown whole.
 */
export function cameraFor(levels: EuclidLevel[], k: number): Box {
  let j = k;
  if (levels[j].b === 0) j -= 1;
  if (j >= 0 && levels[j].q === 0) j += 1;
  if (j < 0 || j >= levels.length || levels[j].b === 0) return levels[0].rect;
  const lv = levels[j];
  const R = lv.rect;
  if (lv.a <= 5 * lv.b) return R;
  const keep = Math.min(lv.q ?? 0, 3) * lv.b + (lv.r ?? 0);
  return lv.horizontal ? { x: R.x + R.w - keep, y: R.y, w: keep, h: R.h } : { x: R.x, y: R.y + R.h - keep, w: R.w, h: keep };
}

/* ---------- tracer ---------- */

export interface EuclidStep {
  call: EuclidCall;
  /** gcd / gcd_iterative / lcm: an int; extended_gcd: [g, x, y]. */
  result: number | [number, number, number];
  /** The pairs (a, b) the recursion or the loop visits, after abs, down to b = 0. */
  pairs: Array<[number, number]>;
  /** extended_gcd: every _extended_gcd_nonneg call, outermost first, with its (g, x, y). */
  levels?: Array<[number, number, number, number, number]>;
}

export interface EuclidRun {
  frames: Array<Frame<EuclidState>>;
  steps: EuclidStep[];
}

const p = (v: number) => (v < 0 ? `(${v})` : String(v));

export function euclidTrace(input: EuclidInput): EuclidRun {
  const frames: Array<Frame<EuclidState>> = [];
  const steps: EuclidStep[] = [];
  const { calls } = input;
  let current = -1;

  const callStrip = (): StripData => ({
    label: 'Calls',
    items: calls.map((c, i): StripItem => ({ text: formatEuclidCall(c), role: i === current ? 'active' : i < current ? 'muted' : undefined })),
  });

  calls.forEach((call, ci) => {
    current = ci;
    const A = Math.abs(call.a);
    const B = Math.abs(call.b);
    const levels = tiling(A, B, ci);
    const K = levels.length - 1; // levels[K] is the base (b = 0)
    const g = levels[K].a;
    const name = formatEuclidCall(call);
    const ext = call.kind === 'extended_gcd';
    const recursive = call.kind !== 'gcd_iterative';
    const degenerate = A === 0 || B === 0;
    const overview = cameraFor(levels, 0);

    // Coefficients of the extended form, filled bottom-up.
    const xs: Array<number | null> = levels.map(() => null);
    const ys: Array<number | null> = levels.map(() => null);
    const columns = ext ? ['a', 'b', 'a//b', 'a%b', 'x', 'y', 'a*x+b*y'] : ['a', 'b', 'a//b', 'a%b'];

    interface Snap {
      shown: number; // table rows shown (levels 0..shown-1)
      rowRoles?: Record<number, Role>;
      cellRoles?: Record<string, Role>;
      runRoles?: Record<number, Role>;
      runsUpTo: number; // runs of levels < runsUpTo are drawn
      focus?: Box & { role: Role };
      camera: Box;
      grid?: number;
      stack?: string[];
      stackLabel?: string;
      stackTop?: Role;
      vars?: Array<[string, string | number]>;
      note?: string;
      /** extended_gcd's answer: the top row shows the call's own a, b and the sign-fixed x, y. */
      signed?: { a: number; b: number; x: number; y: number };
    }

    const snap = (line: number | undefined, caption: string, o: Snap) => {
      const runs: TileRun[] = [];
      for (let k = 0; k < Math.min(o.runsUpTo, K); k++) {
        const run = levels[k].run;
        if (run) runs.push({ ...run, role: o.runRoles?.[k] ?? 'idle' });
      }
      const rows: TableCell[][] = [];
      for (let k = 0; k < o.shown; k++) {
        const lv = levels[k];
        const rowRole = o.rowRoles?.[k];
        const cell = (col: string, text: string): TableCell => ({ text, role: o.cellRoles?.[`${k}:${col}`] ?? rowRole });
        const top = k === 0 ? o.signed : undefined;
        const a = top ? top.a : lv.a;
        const b = top ? top.b : lv.b;
        const row = [cell('a', String(a)), cell('b', String(b)), cell('q', lv.q === null ? '' : String(lv.q)), cell('r', lv.r === null ? '' : String(lv.r))];
        if (ext) {
          const x = top ? top.x : xs[k];
          const y = top ? top.y : ys[k];
          row.push(cell('x', x === null ? '' : String(x)), cell('y', y === null ? '' : String(y)), cell('check', x === null || y === null ? '' : `${a * x + b * y}`));
        }
        rows.push(row);
      }
      const strips: StripData[] = [callStrip()];
      if (o.stack) {
        strips.push({
          label: o.stackLabel ?? 'Open calls',
          items: o.stack.map((t, i): StripItem => ({ text: t, role: i === o.stack!.length - 1 ? (o.stackTop ?? 'active') : undefined })),
        });
      }
      frames.push({
        line,
        caption,
        vars: [['call', name], ...(o.vars ?? [])],
        state: {
          panel: {
            call: ci,
            width: A,
            height: B,
            runs,
            focus: o.focus,
            camera: o.camera,
            grid: o.grid,
            note: o.note ?? (degenerate ? (A === 0 && B === 0 ? 'a = b = 0: no rectangle at all' : `${A} x ${B}: a rectangle with no area`) : undefined),
          },
          table: { columns, rows },
          strips,
        },
      });
    };

    const pairs: Array<[number, number]> = levels.map((lv) => [lv.a, lv.b]);
    const stackLabel = ext ? 'Open calls of _extended_gcd_nonneg' : 'Open calls of gcd';
    const stackOf = (depth: number) => levels.slice(0, depth + 1).map((lv) => `(${lv.a}, ${lv.b})`);
    const cutCaption = (lv: EuclidLevel): string => {
      if (lv.q === 0) {
        return `${lv.a} < ${lv.b}, so ${lv.a} // ${lv.b} = 0: no ${lv.b} x ${lv.b} square fits and nothing is cut. ${lv.a} % ${lv.b} = ${lv.a}, so the next pair is (${lv.b}, ${lv.a}): the arguments just swap.`;
      }
      const left = lv.r === 0 ? 'nothing is left over' : `a strip ${lv.r} wide is left over (${lv.a} % ${lv.b} = ${lv.r})`;
      const cut = lv.q === 1 ? `cut one ${lv.b} x ${lv.b} square` : `cut ${lv.q} squares of side ${lv.b}`;
      return `${lv.b} fits ${lv.q} time${lv.q === 1 ? '' : 's'} into ${lv.a} (${lv.a} // ${lv.b} = ${lv.q}): ${cut}, and ${left}. Any square that tiles the strip also tiles those squares, so gcd(${lv.a}, ${lv.b}) = gcd(${lv.b}, ${lv.r}).`;
    };

    // ----- lcm's zero check -----
    if (call.kind === 'lcm') {
      if (call.a === 0 || call.b === 0) {
        snap(L.lcmZero, `${name}: one argument is 0, and the only common multiple of 0 is 0, so lcm returns 0 without calling gcd.`, {
          shown: 0,
          runsUpTo: 0,
          camera: overview,
          vars: [['returns', 0]],
        });
        steps.push({ call, result: 0, pairs: [] });
        return;
      }
      snap(L.lcmReturn, `${name}: neither argument is 0, so lcm computes abs(a * b) = ${Math.abs(call.a * call.b)} and divides it by gcd(${call.a}, ${call.b}). First the gcd, by tiling the ${A} x ${B} rectangle.`, {
        shown: 0,
        runsUpTo: 0,
        camera: overview,
        vars: [['abs(a * b)', Math.abs(call.a * call.b)]],
      });
    }

    // ----- start -----
    const signNote = call.a < 0 || call.b < 0 ? ` The signs do not change the divisors, so the work runs on ${A} and ${B}.` : '';
    if (ext) {
      snap(L.extStart, `${name}: run _extended_gcd_nonneg on abs(a) = ${A} and abs(b) = ${B}; the signs of x and y are fixed at the end.${degenerate ? '' : ` Each call cuts the largest squares that fit off a ${A} x ${B} rectangle and recurses on the strip left over.`}`, {
        shown: 0,
        runsUpTo: 0,
        camera: overview,
      });
    } else if (call.kind !== 'lcm') {
      snap(
        call.kind === 'gcd' ? L.gcdAbs : L.iterAbs,
        `${name}: a, b = abs(a), abs(b) = ${A}, ${B}.${signNote}${degenerate ? '' : ` Each step cuts the largest squares that fit off a ${A} x ${B} rectangle; the side of the last square that leaves nothing over is the gcd.`}`,
        { shown: 0, runsUpTo: 0, camera: overview, vars: [['a', A], ['b', B]] },
      );
    }

    // ----- down: one level per call (or loop iteration) -----
    for (let k = 0; k < K; k++) {
      const lv = levels[k];
      const line = ext ? L.egcdCall : call.kind === 'gcd_iterative' ? L.iterLoop : L.gcdCall;
      const callText = ext
        ? `_extended_gcd_nonneg(${lv.a}, ${lv.b}): b is not 0. `
        : call.kind === 'gcd_iterative' || (k === 0 && call.kind === 'gcd')
          ? `b = ${lv.b} is not 0. `
          : k === 0
            ? `gcd(${call.a}, ${call.b}): a, b = abs(a), abs(b) = ${lv.a}, ${lv.b}, and b is not 0. `
            : `gcd(${lv.a}, ${lv.b}): b is not 0. `;
      const next = ext ? ` Call _extended_gcd_nonneg(${lv.b}, ${lv.r}).` : call.kind === 'gcd_iterative' ? ` a, b = ${lv.b}, ${lv.r}.` : ` Return gcd(${lv.b}, ${lv.r}).`;
      snap(line, callText + cutCaption(lv) + next, {
        shown: k + 1,
        rowRoles: { [k]: 'active' },
        runsUpTo: k + 1,
        runRoles: { [k]: 'active' },
        focus: lv.rest && (lv.rest.w > 0 && lv.rest.h > 0) ? { ...lv.rest, role: 'compare' } : undefined,
        camera: cameraFor(levels, k),
        stack: recursive ? stackOf(k + 1) : undefined,
        stackLabel,
        stackTop: 'compare',
        vars: [
          ['a', lv.a],
          ['b', lv.b],
          ['a // b', lv.q!],
          ['a % b', lv.r!],
        ],
      });
    }

    // ----- base: b == 0 -----
    const base = levels[K];
    const lastRun = K > 0 ? K - 1 : -1;
    const gRoles: Record<number, Role> = lastRun >= 0 ? { [lastRun]: 'done' } : {};
    const tiles = K > 0 && levels[K - 1].q ? ` The last cut (${levels[K - 1].q === 1 ? `one ${g} x ${g} square` : `${levels[K - 1].q} squares of side ${g}`}) left nothing over, so a ${g} x ${g} square tiles every square cut before it: it is the largest square that tiles the whole rectangle.` : '';
    if (ext) {
      xs[K] = 1;
      ys[K] = 0;
      snap(L.egcdBase, `_extended_gcd_nonneg(${base.a}, 0): b = 0, and every number divides 0, so g = ${base.a}.${tiles} Return (${base.a}, 1, 0), because ${base.a}*1 + 0*0 = ${base.a}.`, {
        shown: K + 1,
        rowRoles: { [K]: 'done' },
        runsUpTo: K,
        runRoles: gRoles,
        camera: K > 0 ? cameraFor(levels, K - 1) : overview,
        stack: stackOf(K),
        stackLabel,
        vars: [
          ['g', g],
          ['x', 1],
          ['y', 0],
        ],
      });
    } else {
      snap(
        call.kind === 'gcd_iterative' ? L.iterReturn : L.gcdBase,
        `${call.kind === 'gcd_iterative' ? `b = 0 ends the loop` : `gcd(${base.a}, 0): b = 0`}, and every number divides 0, so the answer is a = ${g}.${tiles}`,
        {
          shown: K + 1,
          rowRoles: { [K]: 'done' },
          runsUpTo: K,
          runRoles: gRoles,
          camera: K > 0 ? cameraFor(levels, K - 1) : overview,
          stack: recursive ? stackOf(K) : undefined,
          stackLabel,
          vars: [['returns', g]],
        },
      );
    }

    // ----- up: the recursion returns -----
    if (recursive) {
      for (let k = K - 1; k >= 0; k--) {
        const lv = levels[k];
        const done: Record<number, Role> = {};
        for (let t = k + 1; t <= K; t++) done[t] = 'done';
        if (ext) {
          const x1 = xs[k + 1]!;
          const y1 = ys[k + 1]!;
          xs[k] = y1;
          ys[k] = x1 - lv.q! * y1;
          snap(
            L.egcdReturn,
            `Back in _extended_gcd_nonneg(${lv.a}, ${lv.b}): the call below returned (g, x1, y1) = (${g}, ${x1}, ${y1}). ` +
              `Since ${lv.a} % ${lv.b} = ${lv.a} - ${lv.q}*${lv.b}, the identity ${lv.b}*x1 + (${lv.a} % ${lv.b})*y1 = ${g} regroups into ${lv.a}*y1 + ${lv.b}*(x1 - ${lv.q}*y1) = ${g}: ` +
              `x = y1 = ${y1}, y = ${x1} - ${lv.q}*${p(y1)} = ${ys[k]}. Check: ${lv.a}*${p(xs[k]!)} + ${lv.b}*${p(ys[k]!)} = ${g}.`,
            {
              shown: K + 1,
              rowRoles: { ...done, [k]: 'active' },
              cellRoles: { [`${k + 1}:x`]: 'compare', [`${k + 1}:y`]: 'compare' },
              runsUpTo: K,
              runRoles: gRoles,
              focus: { ...lv.rect, role: 'compare' },
              camera: cameraFor(levels, k),
              stack: stackOf(k),
              stackLabel,
              vars: [
                ['a', lv.a],
                ['b', lv.b],
                ['a // b', lv.q!],
                ['x1, y1', `${x1}, ${y1}`],
                ['x, y', `${xs[k]}, ${ys[k]}`],
              ],
            },
          );
        } else {
          snap(L.gcdCall, `gcd(${lv.a}, ${lv.b}) returns the ${g} it got from gcd(${lv.b}, ${lv.r}): one step up the stack, and the view widens to the ${lv.horizontal ? `${lv.a} x ${lv.b}` : `${lv.b} x ${lv.a}`} rectangle of that call.`, {
            shown: K + 1,
            rowRoles: { ...done, [k]: 'active' },
            runsUpTo: K,
            runRoles: gRoles,
            focus: { ...lv.rect, role: 'compare' },
            camera: cameraFor(levels, k),
            stack: stackOf(k),
            stackLabel,
            vars: [['returns', g]],
          });
        }
      }
    }

    // ----- the result -----
    const allDone: Record<number, Role> = {};
    for (let t = 0; t <= K; t++) allDone[t] = 'done';
    const grid = degenerate || g === 0 ? undefined : g;
    let result: EuclidStep['result'] = g;
    if (ext) {
      const x0 = xs[0]!;
      const y0 = ys[0]!;
      // 0 - v, not -v: Python has no negative zero.
      const x = call.a < 0 ? 0 - x0 : x0;
      const y = call.b < 0 ? 0 - y0 : y0;
      result = [g, x, y];
      const flips = [call.a < 0 ? `a = ${call.a} is negative, so x flips to ${x}` : '', call.b < 0 ? `b = ${call.b} is negative, so y flips to ${y}` : ''].filter(Boolean);
      // The top row switches to the call's own signs, so the flipped coefficient and the check read as the caption says.
      const cellRoles: Record<string, Role> = {};
      if (call.a < 0) cellRoles['0:a'] = cellRoles['0:x'] = 'active';
      if (call.b < 0) cellRoles['0:b'] = cellRoles['0:y'] = 'active';
      snap(
        L.extReturn,
        `${flips.length ? `${flips.join(', and ')} (a negative number times a flipped coefficient gives the same product as before)` : 'Neither a nor b is negative, so x and y stay as they are'}: extended_gcd returns (${g}, ${x}, ${y}). Check with the original signs: ${p(call.a)}*${p(x)} + ${p(call.b)}*${p(y)} = ${call.a * x + call.b * y} = g.` +
          (grid ? ` The ${g} x ${g} grid tiles the whole ${A} x ${B} rectangle.` : ''),
        {
          shown: K + 1,
          rowRoles: allDone,
          cellRoles,
          signed: { a: call.a, b: call.b, x, y },
          runsUpTo: K,
          runRoles: gRoles,
          camera: overview,
          grid,
          vars: [
            ['g', g],
            ['x', x],
            ['y', y],
            ['a*x + b*y', call.a * x + call.b * y],
          ],
        },
      );
      steps.push({ call, result, pairs, levels: levels.map((lv, k): [number, number, number, number, number] => [lv.a, lv.b, g, xs[k]!, ys[k]!]) });
      return;
    }
    if (call.kind === 'lcm') {
      const prod = Math.abs(call.a * call.b);
      result = prod / g;
      snap(L.lcmReturn, `gcd(${call.a}, ${call.b}) = ${g}, so lcm = abs(${call.a} * ${call.b}) // ${g} = ${prod} // ${g} = ${result}. That is ${A} // ${g} = ${A / g} times ${B}: the smallest number both ${A} and ${B} divide.`, {
        shown: K + 1,
        rowRoles: allDone,
        runsUpTo: K,
        runRoles: gRoles,
        camera: overview,
        grid,
        vars: [
          ['gcd', g],
          ['returns', result],
        ],
      });
      steps.push({ call, result, pairs });
      return;
    }
    snap(
      call.kind === 'gcd_iterative' ? L.iterReturn : L.gcdBase,
      g === 0
        ? `${name} returns 0: gcd(0, 0) is 0 by convention.`
        : `${name} returns ${g}.${grid ? ` The ${g} x ${g} grid tiles the whole ${A} x ${B} rectangle, and no larger square does: ${g} is the greatest common divisor.` : ` One side is 0, and every number divides 0, so the gcd is the other side, ${g}.`}`,
      { shown: K + 1, rowRoles: allDone, runsUpTo: K, runRoles: gRoles, camera: overview, grid, vars: [['returns', g]] },
    );
    steps.push({ call, result, pairs });
  });

  current = calls.length;
  return { frames, steps };
}
