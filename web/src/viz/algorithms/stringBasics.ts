/**
 * String basics tracer: what the five functions of main.py do with the characters.
 *
 * Mirrors Data_Structures/Linear/String/String_Basics/Python/main.py:
 *   access_char(s, i) = s[i]          IndexError unless -len(s) <= i < len(s)
 *   string_length(s) = len(s)         stored in the string object: O(1)
 *   traverse_string(s) = [c for c in s]
 *   concatenate(s1, s2) = s1 + s2     a new string: both operands are copied
 *   substring(s, start, end) = s[start:end]   the bounds are adjusted as Python adjusts any
 *     slice (negative ones count from the end, then both are clamped to 0..len), never raises
 * In the script, concat stores its result back in s (s = concatenate(s, t)).
 * Golden fixtures (__fixtures__/stringStructures.json) pin every result.
 *
 * Input: "hello"; access 1, access -1, length, traverse, substring 1 4, concat " world"
 */
import { InputError, type Frame, type Role } from '../core/types';
import type { StrCellView, StrMarkerView, StrRowView, StrTickView, StringOpsState } from '../renderers/StringOpsView';
import type { StripItem } from '../ui/molecules/Strip';
import { numArg, q, qList, readSubject, splitScript, strArg, tokenize } from './stringOps';

export type BasicsOp =
  | { kind: 'access'; i: number }
  | { kind: 'length' }
  | { kind: 'traverse' }
  | { kind: 'concat'; text: string }
  | { kind: 'substring'; start: number; end: number };

export interface BasicsInput {
  s: string;
  ops: BasicsOp[];
}

export interface BasicsStep {
  op: BasicsOp;
  /** s after the operation (concat rebinds it). */
  s: string;
  result: string | number | string[] | { error: string };
}

export interface BasicsRun {
  frames: Array<Frame<StringOpsState>>;
  steps: BasicsStep[];
}

export function formatBasicsOp(op: BasicsOp): string {
  switch (op.kind) {
    case 'access':
      return `access_char(s, ${op.i})`;
    case 'length':
      return 'string_length(s)';
    case 'traverse':
      return 'traverse_string(s)';
    case 'concat':
      return `concatenate(s, ${q(op.text)})`;
    default:
      return `substring(s, ${op.start}, ${op.end})`;
  }
}

/** How Python adjusts one bound of a slice with step 1 (PySlice_AdjustIndices). */
export function sliceBound(p: number, n: number): number {
  if (p < 0) return Math.max(p + n, 0);
  return Math.min(p, n);
}

// ---------------------------------------------------------------- input

const HELP = 'Write operations like access 1, access -1, length, traverse, substring 1 4 or concat " world" (or s[1], len(s), s[1:4], s + "!"), separated by commas.';

function parseOp(segment: string): BasicsOp {
  const index = segment.match(/^s\s*\[\s*([+-]?\d+)\s*\]$/i);
  if (index) return { kind: 'access', i: numArg({ kind: 'num', value: Number(index[1]), text: index[1] }, 's[i]', 'an index', -99, 99) };
  const slice = segment.match(/^s\s*\[\s*([+-]?\d+)\s*:\s*([+-]?\d+)\s*\]$/i);
  if (slice) {
    const [start, end] = [Number(slice[1]), Number(slice[2])].map((v, k) =>
      numArg({ kind: 'num', value: v, text: String(v) }, 's[start:end]', k === 0 ? 'a start' : 'an end', -99, 99),
    );
    return { kind: 'substring', start, end };
  }
  if (/^len\s*\(\s*s\s*\)$/i.test(segment)) return { kind: 'length' };
  const toks = tokenize(segment.replace(/^s\s*\+/i, '+'));
  const head = toks[0];
  const name = head?.kind === 'word' ? head.text : '';
  let op: BasicsOp;
  let used = 1;
  if (['access', 'access_char', 'at', 'get'].includes(name)) {
    op = { kind: 'access', i: numArg(toks[1], 'access', 'an index', -99, 99) };
    used = 2;
  } else if (['length', 'len', 'string_length'].includes(name)) {
    op = { kind: 'length' };
  } else if (['traverse', 'traverse_string', 'for'].includes(name)) {
    op = { kind: 'traverse' };
  } else if (['concat', 'concatenate', '+'].includes(name)) {
    op = { kind: 'concat', text: strArg(toks[1], 'concat', 'text', 10) };
    used = 2;
  } else if (['substring', 'slice', 'sub'].includes(name)) {
    op = { kind: 'substring', start: numArg(toks[1], 'substring', 'a start', -99, 99), end: numArg(toks[2], 'substring', 'an end', -99, 99) };
    used = 3;
  } else {
    throw new InputError(`Cannot read "${segment}". ${HELP}`);
  }
  if (toks.length > used) throw new InputError(`Too many arguments in "${segment}". ${HELP}`);
  return op;
}

export function parseBasics(text: string, { maxOps = 8, maxLen = 12, maxTotal = 16 } = {}): BasicsInput {
  const segments = splitScript(text);
  if (segments.length === 0) throw new InputError('Start with a string, then the operations: "hello"; access 1, substring 1 4.');
  const s = readSubject(segments[0], 'the string', maxLen);
  const ops = segments.slice(1).map(parseOp);
  if (ops.length > maxOps) throw new InputError(`At most ${maxOps} operations, please (got ${ops.length}).`);
  let n = s.length;
  for (const op of ops) {
    if (op.kind !== 'concat') continue;
    n += op.text.length;
    if (n > maxTotal) throw new InputError(`${formatBasicsOp(op)} would make s ${n} characters long; at most ${maxTotal} fit on the screen.`);
  }
  return { s, ops };
}

// ---------------------------------------------------------------- tracer

const S = 0;
const T = 1;
const R = 2;

/** Pseudocode line numbers (see specs/stringBasics.tsx). */
const L = { access: 0, negative: 1, raise: 2, read: 3, length: 4, traverse: 5, concat: 6, copy: 7, substring: 8, adjust: 9, clamp: 10, slice: 11 } as const;

/** Column where a raw index or bound is drawn: its own column, or just beside the string when far out. */
function colOf(p: number, n: number): number {
  return p < 0 ? Math.max(p + n, -2) : Math.min(p, n + 2);
}

interface SnapOpts {
  sRoles?: Record<number, Role>;
  /** Roles for the index labels above s (by column) and the negative ones below it (by column). */
  tickRoles?: Record<number, Role>;
  negRoles?: Record<number, Role>;
  /** Label column len(s) above s (a slice bound may sit there). */
  endTick?: boolean;
  ticks?: StrTickView[];
  cells?: StrCellView[];
  rows?: StrRowView[];
  markers?: StrMarkerView[];
  lenRole?: Role;
  vars?: Array<[string, string | number]>;
}

class BasicsTracer {
  private frames: Array<Frame<StringOpsState>> = [];
  private steps: BasicsStep[] = [];
  private s: string[] = [];
  private ids: string[] = [];
  private current = -1;

  constructor(private readonly ops: BasicsOp[]) {}

  private snap(line: number | undefined, caption: string, o: SnapOpts = {}) {
    const n = this.s.length;
    const cells: StrCellView[] = [...this.s.map((ch, k) => ({ id: this.ids[k], ch, row: S, col: k, role: o.sRoles?.[k] })), ...(o.cells ?? [])];
    const ticks: StrTickView[] = [
      ...this.s.map((_, k): StrTickView => ({ row: S, col: k, text: k, side: 'above', role: o.tickRoles?.[k] })),
      ...this.s.map((_, k): StrTickView => ({ row: S, col: k, text: k - n, side: 'below', role: o.negRoles?.[k] })),
      ...(o.endTick ? [{ row: S, col: n, text: n, side: 'above' as const, role: o.tickRoles?.[n] }] : []),
      ...(o.ticks ?? []),
    ];
    const op = this.ops[this.current];
    this.frames.push({
      line,
      caption,
      vars: [...(op ? ([['call', formatBasicsOp(op)]] as Array<[string, string | number]>) : []), ...(o.vars ?? []), ['s', q(this.s.join(''))], ['len(s)', n]],
      state: {
        cells,
        rows: [{ row: S, label: 's', len: n, lenRole: o.lenRole }, ...(o.rows ?? [])],
        ticks,
        markers: o.markers,
        strips: [
          {
            label: 'Operations',
            items: this.ops.map((x, i): StripItem => ({ text: formatBasicsOp(x), role: i === this.current ? 'active' : i < this.current ? 'muted' : undefined })),
          },
        ],
      },
    });
  }

  private access(i: number): string | { error: string } {
    const n = this.s.length;
    const j = i < 0 ? i + n : i;
    const col = colOf(i, n);
    const inRange = j >= 0 && j < n;
    // A position outside the string is drawn beside it, labelled with the index asked for.
    const far: StrTickView[] = inRange ? [] : [{ row: S, col, text: i, side: i < 0 ? 'below' : 'above' }];
    const marker = (role: Role): StrMarkerView[] => [{ name: 'i', text: `i = ${i}`, row: S, col, role }];
    if (i < 0) {
      this.snap(
        L.negative,
        `access_char(s, ${i}) returns s[${i}]. A negative index counts from the end: Python adds len(s), so ${i} + ${n} = ${j}.${inRange ? '' : ` ${j} is still outside 0..${n - 1}.`}`,
        { sRoles: inRange ? { [j]: 'compare' } : {}, negRoles: inRange ? { [j]: 'compare' } : {}, tickRoles: inRange ? { [j]: 'compare' } : {}, ticks: inRange ? [] : far, markers: marker('compare'), vars: [['i', i], ['i + len(s)', j]] },
      );
    } else {
      this.snap(L.access, `access_char(s, ${i}) returns s[${i}]. Python first checks that 0 <= ${i} < len(s) = ${n}.`, {
        sRoles: inRange ? { [j]: 'compare' } : {},
        tickRoles: inRange ? { [j]: 'compare' } : {},
        ticks: far,
        markers: marker('compare'),
        vars: [['i', i]],
      });
    }
    if (!inRange) {
      this.snap(
        L.raise,
        `There is no character at index ${i}: the valid indexes are ${n ? `0..${n - 1} and -${n}..-1` : 'none, because s is empty'}. s[${i}] raises IndexError: string index out of range. The next operation runs as if the caller caught it.`,
        { cells: [{ id: `ph${this.current}`, ch: '', row: S, col, role: 'bad' }], ticks: far, markers: marker('bad'), vars: [['i', i], ['raises', 'IndexError']] },
      );
      return { error: 'IndexError' };
    }
    const ch = this.s[j];
    this.snap(
      L.read,
      `${j} is in range. The characters sit side by side in one array, so s[${j}] is read directly at position ${j}, with no scan: O(1). access_char returns ${q(ch)}.`,
      {
        sRoles: { [j]: 'done' },
        tickRoles: { [j]: 'done' },
        negRoles: i < 0 ? { [j]: 'done' } : {},
        cells: [{ id: `r${this.current}`, ch, row: R, col: j, role: 'done', from: { row: S, col: j } }],
        rows: [{ row: R, label: 'returns' }],
        markers: marker('done'),
        vars: [['i', i], ['returns', q(ch)]],
      },
    );
    return ch;
  }

  private length(): number {
    const n = this.s.length;
    this.snap(
      L.length,
      `string_length(s) returns len(s) = ${n}. A Python string object stores its length (the box in front of the characters), so no character is visited: O(1), however long s is.`,
      { lenRole: 'done', cells: [{ id: `r${this.current}`, ch: String(n), row: R, col: 0, role: 'done' }], rows: [{ row: R, label: 'returns' }], vars: [['returns', n]] },
    );
    return n;
  }

  private traverse(): string[] {
    const n = this.s.length;
    const list = (upto: number, fresh: number): StrCellView[] =>
      this.s.slice(0, upto).map((ch, k) => ({ id: `l${this.current}:${k}`, ch, row: R, col: k, role: k === fresh ? 'active' : 'done', from: k === fresh ? { row: S, col: k } : undefined }));
    const rows: StrRowView[] = [{ row: R, label: 'list' }];
    if (n === 0) {
      this.snap(L.traverse, 'traverse_string(s) runs [c for c in s], but s is empty: the loop body never runs and the result is the empty list [].', { rows, vars: [['returns', '[]']] });
      return [];
    }
    this.snap(L.traverse, `traverse_string(s) runs [c for c in s]: a loop that visits every character in order and appends it to a new list.`, { rows });
    for (let k = 0; k < n; k++) {
      this.snap(L.traverse, `c = s[${k}] = ${q(this.s[k])}: append it to the list (${k + 1} of ${n}).`, {
        sRoles: { [k]: 'compare' },
        tickRoles: { [k]: 'compare' },
        cells: list(k + 1, k),
        rows,
        markers: [{ name: 'c', row: S, col: k, role: 'compare' }],
        vars: [['c', q(this.s[k])]],
      });
    }
    const result = [...this.s];
    this.snap(L.traverse, `traverse_string returns ${qList(result)}, a list of ${n} one-character strings. One step per character: O(n).`, {
      cells: list(n, -1),
      rows,
      vars: [['returns', qList(result)]],
    });
    return result;
  }

  private concat(text: string): string {
    const n = this.s.length;
    const t = [...text];
    const m = t.length;
    const tIds = t.map((_, k) => `t${this.current}:${k}`);
    const newIds = Array.from({ length: n + m }, (_, k) => `n${this.current}:${k}`);
    const tRow = (roles: Record<number, Role> = {}): StrCellView[] => t.map((ch, k) => ({ id: tIds[k], ch, row: T, col: k, role: roles[k] }));
    const tLabel: StrRowView = { row: T, label: 't', len: m };
    const vars: Array<[string, string | number]> = [['t', q(text)], ['len(t)', m]];
    this.snap(L.concat, `concatenate(s, ${q(text)}) returns s + t, and the script stores the result back in s.`, { cells: tRow(), rows: [tLabel], vars });
    const result = this.s.join('') + text;
    if (n === 0 || m === 0) {
      const which = n === 0 ? 's' : 't';
      const other = n === 0 ? 't' : 's';
      this.snap(
        L.copy,
        `${which} is empty, so s + t has the same characters as ${other}: CPython returns ${other} itself and copies nothing (sharing is safe, because strings are immutable).`,
        { cells: tRow(n === 0 ? Object.fromEntries(t.map((_, k) => [k, 'done' as Role])) : {}), rows: [tLabel], sRoles: m === 0 ? Object.fromEntries(this.s.map((_, k) => [k, 'done' as Role])) : {}, vars },
      );
      if (n === 0) {
        this.s = t;
        this.ids = tIds;
      }
      this.snap(L.concat, `s = concatenate(s, t): s is now ${q(result)} (${result.length} characters).`, { vars: [['returns', q(result)]] });
      return result;
    }
    const slots = (from: number): StrCellView[] =>
      Array.from({ length: n + m - from }, (_, k) => ({ id: `slot${this.current}:${from + k}`, ch: '', row: R, col: from + k, slot: true }));
    const newRow: StrRowView = { row: R, label: 's + t', len: n + m };
    this.snap(L.copy, `Strings are immutable, so s + t cannot grow s in place: Python allocates a new string with room for ${n} + ${m} = ${n + m} characters.`, {
      cells: [...tRow(), ...slots(0)],
      rows: [tLabel, newRow],
      vars,
    });
    const fromS: StrCellView[] = this.s.map((ch, k) => ({ id: newIds[k], ch, row: R, col: k, role: 'done', from: { row: S, col: k } }));
    this.snap(L.copy, `Copy the ${n} characters of s into positions 0..${n - 1} of the new string.`, {
      sRoles: Object.fromEntries(this.s.map((_, k) => [k, 'compare' as Role])),
      cells: [...tRow(), ...fromS, ...slots(n)],
      rows: [tLabel, newRow],
      vars: [...vars, ['copied', n]],
    });
    const fromT: StrCellView[] = t.map((ch, k) => ({ id: newIds[n + k], ch, row: R, col: n + k, role: 'done', from: { row: T, col: k } }));
    this.snap(L.copy, `Copy the ${m} characters of t into positions ${n}..${n + m - 1}: ${n + m} character copies in all, which is why concatenation costs O(n + m).`, {
      cells: [...tRow(Object.fromEntries(t.map((_, k) => [k, 'compare' as Role]))), ...fromS.map((c) => ({ ...c, from: undefined })), ...fromT],
      rows: [tLabel, newRow],
      vars: [...vars, ['copied', n + m]],
    });
    this.s = [...this.s, ...t];
    this.ids = newIds;
    this.snap(L.concat, `s = concatenate(s, t): s now names the new ${n + m}-character string. The old s and t were never changed (strings are immutable); they are freed once nothing refers to them.`, {
      vars: [['returns', q(result)]],
    });
    return result;
  }

  private substring(start: number, end: number): string {
    const n = this.s.length;
    const vars: Array<[string, string | number]> = [['start', start], ['end', end]];
    const tickFor = (p: number): StrTickView[] => {
      const col = colOf(p, n);
      const natural = p < 0 ? p + n : p;
      return col === natural && natural >= 0 && natural <= n ? [] : [{ row: S, col, text: p, side: p < 0 ? 'below' : 'above', role: 'compare' }];
    };
    const markers = (a: number, aText: string, b: number, bText: string, role: Role = 'compare'): StrMarkerView[] => [
      { name: 'start', text: aText, row: S, col: a, role },
      { name: 'end', text: bText, row: S, col: b, role },
    ];
    let a = start;
    let b = end;
    let aCol = colOf(a, n);
    let bCol = colOf(b, n);
    this.snap(
      L.substring,
      `substring(s, ${start}, ${end}) returns s[${start}:${end}]: the characters from index ${start} up to, but not including, ${end}. A slice never raises; it adjusts both bounds first.`,
      { endTick: true, ticks: [...tickFor(start), ...tickFor(end)], markers: markers(aCol, `start = ${start}`, bCol, `end = ${end}`), vars },
    );
    // Negative bounds count from the end; anything still outside 0..len(s) is clamped.
    const steps: Array<{ which: 'start' | 'end'; from: number; to: number }> = [];
    if (sliceBound(start, n) !== start) steps.push({ which: 'start', from: start, to: sliceBound(start, n) });
    if (sliceBound(end, n) !== end) steps.push({ which: 'end', from: end, to: sliceBound(end, n) });
    for (const step of steps) {
      const p = step.from;
      let why: string;
      let line: number = L.clamp;
      if (p < 0 && p + n >= 0) {
        why = `${step.which} = ${p} is negative, so it counts from the end: ${p} + len(s) = ${p} + ${n} = ${p + n}.`;
        line = L.adjust;
      } else if (p < 0) {
        why = `${step.which} = ${p} is negative: ${p} + ${n} = ${p + n} is still before the start, so it becomes 0.`;
        line = L.adjust;
      } else {
        why = `${step.which} = ${p} is past the end of s, so it becomes len(s) = ${n}.`;
      }
      if (step.which === 'start') {
        a = step.to;
        aCol = a;
      } else {
        b = step.to;
        bCol = b;
      }
      this.snap(line, why, {
        endTick: true,
        tickRoles: { [step.to]: 'compare' },
        markers: markers(aCol, `start = ${a}`, bCol, `end = ${b}`),
        vars: [...vars, ['start (adjusted)', a], ['end (adjusted)', b]],
      });
    }
    const adjusted: Array<[string, string | number]> = [...vars, ['start (adjusted)', a], ['end (adjusted)', b]];
    if (b <= a) {
      this.snap(L.slice, `end ${b} <= start ${a}: the range is empty, so the result is the empty string ''. An empty range is not an error.`, {
        endTick: true,
        rows: [{ row: R, label: `s[${start}:${end}]` }],
        markers: markers(aCol, `start = ${a}`, bCol, `end = ${b}`, 'bad'),
        vars: [...adjusted, ['returns', "''"]],
      });
      return '';
    }
    const result = this.s.slice(a, b).join('');
    const inRange = Object.fromEntries(Array.from({ length: b - a }, (_, k) => [a + k, 'done' as Role]));
    if (a === 0 && b === n) {
      this.snap(L.slice, `The range 0..${n} is all of s, so the result equals s: CPython returns s itself rather than a copy (safe, because strings are immutable).`, {
        endTick: true,
        sRoles: inRange,
        markers: markers(aCol, `start = ${a}`, bCol, `end = ${b}`, 'done'),
        vars: [...adjusted, ['returns', q(result)]],
      });
      return result;
    }
    this.snap(
      L.slice,
      `Copy the ${b - a} characters at indexes ${a}..${b - 1} into a new string: O(k) for k = ${b - a} characters. substring returns ${q(result)}.`,
      {
        endTick: true,
        sRoles: inRange,
        tickRoles: inRange,
        cells: this.s.slice(a, b).map((ch, k) => ({ id: `r${this.current}:${k}`, ch, row: R, col: a + k, role: 'done', from: { row: S, col: a + k } })),
        rows: [{ row: R, label: `s[${start}:${end}]`, len: b - a }],
        markers: markers(aCol, `start = ${a}`, bCol, `end = ${b}`, 'done'),
        vars: [...adjusted, ['returns', q(result)]],
      },
    );
    return result;
  }

  run(s: string): BasicsRun {
    this.s = [...s];
    this.ids = this.s.map((_, k) => `s:${k}`);
    this.snap(
      undefined,
      s
        ? `s = ${q(s)}: ${s.length} characters in one array. The numbers above are the indexes 0..${s.length - 1}; the ones below are the negative indexes Python also accepts.`
        : `s = '': the empty string, length 0. It has no valid index at all.`,
    );
    this.ops.forEach((op, k) => {
      this.current = k;
      let result: BasicsStep['result'];
      if (op.kind === 'access') result = this.access(op.i);
      else if (op.kind === 'length') result = this.length();
      else if (op.kind === 'traverse') result = this.traverse();
      else if (op.kind === 'concat') result = this.concat(op.text);
      else result = this.substring(op.start, op.end);
      this.steps.push({ op, s: this.s.join(''), result });
    });
    this.current = this.ops.length;
    this.snap(undefined, `Done: s is ${q(this.s.join(''))}. Reading and measuring were O(1); traversing, copying and slicing cost one step per character involved.`);
    return { frames: this.frames, steps: this.steps };
  }
}

export function stringBasicsTrace({ s, ops }: BasicsInput): BasicsRun {
  return new BasicsTracer(ops).run(s);
}
