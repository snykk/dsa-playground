/**
 * String manipulation tracers: what each one-line function of string_manipulation.py makes
 * Python do, character by character.
 *
 * Mirrors Data_Structures/Linear/String/String_Manipulation/Python/string_manipulation.py:
 *   reverse_string(s) = s[::-1]          a reversed copy, read from the last index with step -1
 *   is_palindrome(s) = s == s[::-1]      the whole reversed copy first, then == from the left
 *   count_vowels(s) = sum(1 for c in s if c in "aeiouAEIOU")
 *   replace_char(s, old, new) = s.replace(old, new)   leftmost matches, never overlapping;
 *     an empty `old` matches before every character and at the end
 *   to_upper(s) = s.upper(), to_lower(s) = s.lower()
 *   split_string(s, sep=" ") = s.split(sep)   empty fields kept; ValueError for sep == ""
 *   join_string(lst, sep=" ") = sep.join(lst)  sizes added up first, one allocation
 * None of them changes s: Python strings are immutable, so each builds (or returns) another one.
 * Golden fixtures (__fixtures__/stringStructures.json) pin every result.
 *
 * Input: "racecar"; reverse, palindrome   /   "Hello World"; vowels, replace "l" "L", upper
 *        "a b  c "; split " ", join "-"
 */
import { InputError, type Frame, type Role } from '../core/types';
import type { StrCellView, StrMarkerView, StrRowView, StringOpsState } from '../renderers/StringOpsView';
import type { StripItem } from '../ui/molecules/Strip';
import { q, qList, readSubject, splitScript, strArg, tokenize, type Tok } from './stringOps';

export type ManipOp =
  | { kind: 'reverse' }
  | { kind: 'palindrome' }
  | { kind: 'vowels' }
  | { kind: 'replace'; old: string; new: string }
  | { kind: 'upper' }
  | { kind: 'lower' }
  | { kind: 'split'; sep: string }
  /** Without `list`, join takes the parts of the latest split. */
  | { kind: 'join'; sep: string; list?: string[] };

/** The three visualizations: reverse and palindrome; vowels, replace and case; split and join. */
export type ManipGroup = 'reverse' | 'count' | 'split';

export interface ManipInput {
  s: string;
  ops: ManipOp[];
}

export interface ManipStep {
  op: ManipOp;
  result: string | number | boolean | string[] | { error: string };
}

export interface ManipRun {
  frames: Array<Frame<StringOpsState>>;
  steps: ManipStep[];
}

export const VOWELS = 'aeiouAEIOU';

export function formatManipOp(op: ManipOp): string {
  switch (op.kind) {
    case 'reverse':
      return 'reverse_string(s)';
    case 'palindrome':
      return 'is_palindrome(s)';
    case 'vowels':
      return 'count_vowels(s)';
    case 'replace':
      return `replace_char(s, ${q(op.old)}, ${q(op.new)})`;
    case 'upper':
      return 'to_upper(s)';
    case 'lower':
      return 'to_lower(s)';
    case 'split':
      return `split_string(s, ${q(op.sep)})`;
    default:
      return `join_string(${op.list ? qList(op.list) : 'parts'}, ${q(op.sep)})`;
  }
}

// ---------------------------------------------------------------- input

const NAMES: Record<string, ManipOp['kind']> = {
  reverse: 'reverse',
  reverse_string: 'reverse',
  rev: 'reverse',
  palindrome: 'palindrome',
  is_palindrome: 'palindrome',
  vowels: 'vowels',
  count: 'vowels',
  count_vowels: 'vowels',
  replace: 'replace',
  replace_char: 'replace',
  upper: 'upper',
  to_upper: 'upper',
  lower: 'lower',
  to_lower: 'lower',
  split: 'split',
  split_string: 'split',
  join: 'join',
  join_string: 'join',
};

const GROUPS: Record<ManipGroup, { kinds: Array<ManipOp['kind']>; defaults: ManipOp[]; help: string }> = {
  reverse: {
    kinds: ['reverse', 'palindrome'],
    defaults: [{ kind: 'reverse' }, { kind: 'palindrome' }],
    help: 'Write reverse and palindrome, separated by commas (with none, both run).',
  },
  count: {
    kinds: ['vowels', 'replace', 'upper', 'lower'],
    defaults: [{ kind: 'vowels' }, { kind: 'upper' }, { kind: 'lower' }],
    help: 'Write operations like vowels, replace "l" "L", upper or lower, separated by commas.',
  },
  split: {
    kinds: ['split', 'join'],
    defaults: [{ kind: 'split', sep: ' ' }, { kind: 'join', sep: ' ' }],
    help: 'Write operations like split " " or join "-" (which joins the parts of the last split), or join ["a", "b"] "-", separated by commas.',
  },
};

function textTok(tok: Tok | undefined, op: string, what: string, max: number): string {
  return strArg(tok, op, what, max);
}

function parseOp(segment: string, group: ManipGroup): ManipOp {
  const toks = tokenize(segment);
  const head = toks[0];
  const kind = head?.kind === 'word' ? NAMES[head.text] : undefined;
  const { kinds, help } = GROUPS[group];
  if (!kind) throw new InputError(`Cannot read "${segment}". ${help}`);
  if (!kinds.includes(kind)) throw new InputError(`${head.kind === 'word' ? head.text : segment} belongs to another tab. ${help}`);
  let op: ManipOp;
  let used = 1;
  if (kind === 'replace') {
    op = { kind, old: textTok(toks[1], 'replace', 'old text', 4), new: textTok(toks[2], 'replace', 'new text', 4) };
    used = 3;
  } else if (kind === 'split') {
    op = { kind, sep: toks[1] ? textTok(toks[1], 'split', 'separator', 3) : ' ' };
    used = toks[1] ? 2 : 1;
  } else if (kind === 'join') {
    let k = 1;
    let list: string[] | undefined;
    if (toks[k]?.kind === 'list') {
      list = (toks[k] as Extract<Tok, { kind: 'list' }>).items;
      if (list.length > 6) throw new InputError(`join takes at most 6 items here (got ${list.length}).`);
      list.forEach((item) => textTok({ kind: 'str', value: item }, 'join', 'list item', 6));
      k++;
    }
    const sep = toks[k] ? textTok(toks[k], 'join', 'separator', 3) : ' ';
    used = toks[k] ? k + 1 : k;
    op = { kind, sep, list };
  } else {
    op = { kind } as ManipOp;
  }
  if (toks.length > used) throw new InputError(`Too many arguments in "${segment}". ${help}`);
  return op;
}

export function parseManip(text: string, group: ManipGroup, { maxOps = 6, maxLen = 16, maxResult = 24 } = {}): ManipInput {
  const segments = splitScript(text);
  if (segments.length === 0) throw new InputError(`Start with a string in quotes. ${GROUPS[group].help}`);
  const s = readSubject(segments[0], 'the string', maxLen);
  const ops = segments.length > 1 ? segments.slice(1).map((seg) => parseOp(seg, group)) : GROUPS[group].defaults;
  if (ops.length > maxOps) throw new InputError(`At most ${maxOps} operations, please (got ${ops.length}).`);
  let parts: string[] | null = null;
  for (const op of ops) {
    if (op.kind === 'split' && op.sep !== '') parts = s.split(op.sep);
    if (op.kind === 'join' && !op.list && !parts) throw new InputError('join needs a list: put a split before it, or give one, as in join ["a", "b"] "-".');
    const out =
      op.kind === 'replace' ? s.split(op.old).join(op.new).length : op.kind === 'join' ? (op.list ?? parts ?? []).join(op.sep).length : 0;
    if (op.kind === 'replace' && op.old === '') {
      if (s.length + (s.length + 1) * op.new.length > maxResult) throw new InputError(`${formatManipOp(op)} would build ${s.length + (s.length + 1) * op.new.length} characters; at most ${maxResult} fit on the screen.`);
    } else if (out > maxResult) {
      throw new InputError(`${formatManipOp(op)} would build ${out} characters; at most ${maxResult} fit on the screen.`);
    }
  }
  return { s, ops };
}

// ---------------------------------------------------------------- tracer

const S = 0;
const R1 = 1;
const R2 = 2;

const LINES: Record<ManipGroup, Record<string, number>> = {
  reverse: { reverse: 0, alloc: 1, copy: 2, palindrome: 3, reversed: 4, compare: 5 },
  count: { vowels: 0, vowelStep: 1, replace: 2, find: 3, copy: 4, rest: 5, empty: 6, case: 7, caseStep: 8 },
  split: { split: 0, find: 1, field: 2, last: 3, join: 4, total: 5, alloc: 6, copy: 7 },
};

interface SnapOpts {
  sRoles?: Record<number, Role>;
  cells?: StrCellView[];
  rows?: StrRowView[];
  markers?: StrMarkerView[];
  vars?: Array<[string, string | number]>;
}

const all = (n: number, role: Role, from = 0): Record<number, Role> => Object.fromEntries(Array.from({ length: n }, (_, k) => [from + k, role]));

/** Columns of list items laid out in one row, one blank column between items (an empty item takes one column). */
function itemCols(items: string[]): number[] {
  const cols: number[] = [];
  let col = 0;
  for (const item of items) {
    cols.push(col);
    col += Math.max(item.length, 1) + 1;
  }
  return cols;
}

class ManipTracer {
  private frames: Array<Frame<StringOpsState>> = [];
  private steps: ManipStep[] = [];
  private current = -1;
  private s: string[] = [];
  /** The parts of the latest split, with the ids of their cells. */
  private parts: { items: string[]; op: number } | null = null;
  private readonly L: Record<string, number>;

  constructor(
    private readonly ops: ManipOp[],
    group: ManipGroup,
  ) {
    this.L = LINES[group];
  }

  private snap(line: number | undefined, caption: string, o: SnapOpts = {}) {
    const n = this.s.length;
    const op = this.ops[this.current];
    this.frames.push({
      line,
      caption,
      vars: [...(op ? ([['call', formatManipOp(op)]] as Array<[string, string | number]>) : []), ...(o.vars ?? []), ['s', q(this.s.join(''))], ['len(s)', n]],
      state: {
        cells: [...this.s.map((ch, k): StrCellView => ({ id: `s:${k}`, ch, row: S, col: k, role: o.sRoles?.[k] })), ...(o.cells ?? [])],
        rows: [{ row: S, label: 's' }, ...(o.rows ?? [])],
        ticks: this.s.map((_, k) => ({ row: S, col: k, text: k, side: 'above' as const, role: o.sRoles?.[k] === 'compare' ? 'compare' : undefined })),
        markers: o.markers,
        strips: [
          {
            label: 'Operations',
            items: this.ops.map((x, i): StripItem => ({ text: formatManipOp(x), role: i === this.current ? 'active' : i < this.current ? 'muted' : undefined })),
          },
        ],
      },
    });
  }

  /** Cells of a list of strings in one row (an empty string shows as a dashed ''). */
  private listCells(items: string[], prefix: string, row: number, roles: Record<number, Role> = {}, from?: (item: number, k: number) => { row: number; col: number } | undefined): StrCellView[] {
    const cols = itemCols(items);
    return items.flatMap((item, i): StrCellView[] =>
      item === ''
        ? [{ id: `${prefix}:${i}:e`, ch: "''", row, col: cols[i], slot: roles[i] === undefined, role: roles[i], from: from?.(i, 0) }]
        : [...item].map((ch, k) => ({ id: `${prefix}:${i}:${k}`, ch, row, col: cols[i] + k, role: roles[i], from: from?.(i, k) })),
    );
  }

  // ---- reverse_string, is_palindrome

  private reverse(): string {
    const { L } = this;
    const n = this.s.length;
    const rows: StrRowView[] = [{ row: R1, label: 's[::-1]', len: n }];
    const id = (k: number) => `r${this.current}:${k}`;
    this.snap(L.reverse, `reverse_string(s) returns s[::-1], a slice with step -1. A str has no in-place reverse (strings are immutable), so the slice builds a reversed copy.`);
    if (n === 0) {
      this.snap(L.alloc, `s is empty, so the slice has no characters: s[::-1] is ''.`, { vars: [['returns', "''"]] });
      return '';
    }
    const slots = (from: number): StrCellView[] => Array.from({ length: n - from }, (_, k) => ({ id: `slot${this.current}:${from + k}`, ch: '', row: R1, col: from + k, slot: true }));
    this.snap(
      L.alloc,
      `The slice has ${n} characters, so Python allocates a new string of ${n}. With a negative step the slice starts at the last index, ${n - 1}.`,
      {
        cells: slots(0),
        rows,
        markers: [
          { name: 'read', text: `i = ${n - 1}`, row: S, col: n - 1, role: 'compare' },
          { name: 'write', row: R1, col: 0, side: 'below', role: 'active' },
        ],
      },
    );
    const done = (upto: number, fresh: number): StrCellView[] =>
      Array.from({ length: upto }, (_, k) => ({ id: id(k), ch: this.s[n - 1 - k], row: R1, col: k, role: k === fresh ? 'active' : 'done', from: k === fresh ? { row: S, col: n - 1 - k } : undefined }));
    for (let k = 0; k < n; k++) {
      const i = n - 1 - k;
      this.snap(
        L.copy,
        `Copy s[${i}] = ${q(this.s[i])} to position ${k} of the copy${i > 0 ? `, then step the read index by -1, to ${i - 1}` : '. The read index has passed index 0, so the slice is complete'}.`,
        {
          sRoles: { [i]: 'compare' },
          cells: [...done(k + 1, k), ...slots(k + 1)],
          rows,
          markers: [
            { name: 'read', text: `i = ${i}`, row: S, col: i, role: 'compare' },
            { name: 'write', row: R1, col: k, side: 'below', role: 'active' },
          ],
          vars: [['read i', i], ['write k', k]],
        },
      );
    }
    const result = [...this.s].reverse().join('');
    this.snap(L.copy, `reverse_string returns ${q(result)}: ${n} reads and ${n} writes, O(n) time, plus O(n) space for the new string. s itself is unchanged.`, {
      cells: done(n, -1),
      rows,
      vars: [['returns', q(result)]],
    });
    return result;
  }

  private palindrome(): boolean {
    const { L } = this;
    const n = this.s.length;
    const rows: StrRowView[] = [{ row: R1, label: 'r', len: n }];
    const rev = [...this.s].reverse();
    this.snap(L.palindrome, 'is_palindrome(s) returns s == s[::-1]: it builds the whole reversed copy first, then compares the two strings.');
    if (n === 0) {
      this.snap(L.compare, `s is empty: '' == '' is True, so is_palindrome('') returns True.`, { rows, vars: [['returns', 'True']] });
      return true;
    }
    const copy = (roles: Record<number, Role>, glide: boolean): StrCellView[] =>
      rev.map((ch, k) => ({ id: `pr${this.current}:${k}`, ch, row: R1, col: k, role: roles[k], from: glide ? { row: S, col: n - 1 - k } : undefined }));
    this.snap(
      L.reversed,
      `r = s[::-1] copies all ${n} characters, last to first, as reverse_string does, before the comparison looks at a single one of them.`,
      { sRoles: all(n, 'compare'), cells: copy(all(n, 'done'), true), rows },
    );
    const roles: Record<number, Role> = {};
    for (let k = 0; k < n; k++) {
      const same = this.s[k] === rev[k];
      roles[k] = same ? 'good' : 'bad';
      const lead = k === 0 ? `== first checks the lengths (both ${n}), then compares from the left. ` : '';
      this.snap(
        L.compare,
        same
          ? `${lead}s[${k}] = ${q(this.s[k])} and r[${k}] = ${q(rev[k])}: equal, so go on.`
          : `${lead}s[${k}] = ${q(this.s[k])} but r[${k}] = ${q(rev[k])}: the strings differ, so == stops here and returns False.`,
        { sRoles: { ...roles }, cells: copy(roles, false), rows, markers: [{ name: 'k', row: S, col: k, role: same ? 'good' : 'bad' }], vars: [['k', k]] },
      );
      if (!same) {
        this.snap(
          L.compare,
          `is_palindrome returns False. The reversed copy of all ${n} characters was built even though the comparison stopped after ${k + 1} of them; a two-pointer loop over s would stop just as early and copy nothing.`,
          { sRoles: { ...roles }, cells: copy(roles, false), rows, vars: [['returns', 'False']] },
        );
        return false;
      }
    }
    this.snap(
      L.compare,
      `All ${n} positions match, so s reads the same backwards: is_palindrome returns True. Comparing s with its full reverse checks every position, twice the ${Math.floor(n / 2)} pairs a two-pointer loop would check.`,
      { sRoles: all(n, 'good'), cells: copy(all(n, 'good'), false), rows, vars: [['returns', 'True']] },
    );
    return true;
  }

  // ---- count_vowels, replace_char, to_upper, to_lower

  private vowels(): number {
    const { L } = this;
    const n = this.s.length;
    const rows: StrRowView[] = [{ row: R1, label: 'vowels' }];
    const vowelCells = (hit?: number): StrCellView[] => [...VOWELS].map((ch, k) => ({ id: `v:${k}`, ch, row: R1, col: k, role: k === hit ? 'good' : undefined }));
    this.snap(L.vowels, `count_vowels(s) adds 1 for every character of s that is in ${q(VOWELS)}.`, { cells: vowelCells(), rows, vars: [['count', 0]] });
    let count = 0;
    const roles: Record<number, Role> = {};
    for (let k = 0; k < n; k++) {
      const c = this.s[k];
      const hit = VOWELS.indexOf(c);
      if (hit >= 0) {
        count++;
        roles[k] = 'good';
      }
      this.snap(
        L.vowelStep,
        hit >= 0
          ? `c = ${q(c)} is in ${q(VOWELS)} (at position ${hit}): count = ${count}.`
          : `c = ${q(c)} is not in ${q(VOWELS)}: count stays ${count}.`,
        {
          sRoles: { ...roles, [k]: hit >= 0 ? 'good' : 'compare' },
          cells: vowelCells(hit >= 0 ? hit : undefined),
          rows,
          markers: [{ name: 'c', row: S, col: k, role: hit >= 0 ? 'good' : 'compare' }],
          vars: [['c', q(c)], ['count', count]],
        },
      );
      if (hit < 0) roles[k] = 'muted';
    }
    this.snap(
      L.vowelStep,
      `count_vowels returns ${count}. One membership test per character, each against at most 10 vowels, so O(n). Accented vowels and y are not in the list, so they never count.`,
      { sRoles: roles, cells: vowelCells(), rows, vars: [['returns', count]] },
    );
    return count;
  }

  private replace(old: string, rep: string): string {
    const { L } = this;
    const n = this.s.length;
    const text = this.s.join('');
    const m = old.length;
    const rows: StrRowView[] = [{ row: R1, label: 'result' }];
    const out: StrCellView[] = [];
    const add = (ch: string, role: Role, from?: { row: number; col: number }) => {
      out.push({ id: `o${this.current}:${out.length}`, ch, row: R1, col: out.length, role, from });
    };
    const settle = () => out.forEach((c, k) => (out[k] = { ...c, role: 'done', from: undefined }));
    this.snap(
      L.replace,
      `replace_char(s, ${q(old)}, ${q(rep)}) returns s.replace(${q(old)}, ${q(rep)}): every occurrence of ${q(old)}, found from the left, becomes ${q(rep)} in a new string.`,
      { rows },
    );
    if (m === 0) {
      for (let k = 0; k <= n; k++) {
        settle();
        for (const ch of rep) add(ch, 'active');
        if (k < n) add(this.s[k], 'compare', { row: S, col: k });
        this.snap(
          L.empty,
          k < n
            ? `old is the empty string, which occurs before every character: write ${q(rep)}, then copy s[${k}] = ${q(this.s[k])}.`
            : `The empty string also occurs at the very end: write ${q(rep)} once more. That makes ${n + 1} ${n === 0 ? 'insertion' : 'insertions'} for ${n} ${n === 1 ? 'character' : 'characters'}.`,
          { sRoles: k < n ? { [k]: 'compare' } : {}, cells: [...out], rows, vars: [['written', out.length]] },
        );
      }
      const result = [...text].map((c) => rep + c).join('') + rep;
      settle();
      this.snap(L.empty, `replace_char returns ${q(result)}.`, { cells: [...out], rows, vars: [['returns', q(result)]] });
      return result;
    }
    let i = 0;
    let count = 0;
    for (;;) {
      const j = text.indexOf(old, i);
      if (j < 0) break;
      count++;
      this.snap(L.find, `s.find(${q(old)}, ${i}) = ${j}: the next occurrence starts at index ${j}.`, {
        sRoles: { ...all(m, 'good', j) },
        cells: [...out],
        rows,
        markers: [
          { name: 'i', row: S, col: i, side: 'below', role: 'compare' },
          { name: 'j', row: S, col: j, role: 'good' },
        ],
        vars: [['i', i], ['j', j], ['replaced', count - 1]],
      });
      settle();
      for (let k = i; k < j; k++) add(this.s[k], 'compare', { row: S, col: k });
      for (const ch of rep) add(ch, 'active');
      const seg = text.slice(i, j);
      this.snap(
        L.copy,
        `${seg ? `Copy s[${i}:${j}] = ${q(seg)} unchanged, then` : 'Nothing lies between the last match and this one, so just'} write ${q(rep)} in place of ${q(old)}. The search resumes at ${j} + ${m} = ${j + m}, after the match, so matches never overlap.`,
        { sRoles: { ...all(j - i, 'compare', i), ...all(m, 'muted', j) }, cells: [...out], rows, vars: [['i', j + m], ['replaced', count]] },
      );
      i = j + m;
    }
    if (count === 0) {
      this.snap(
        L.rest,
        `s.find(${q(old)}, 0) = -1: ${q(old)} does not occur in s. There is nothing to replace, so the result equals s; CPython returns s itself instead of a copy.`,
        { sRoles: all(n, 'done'), rows, vars: [['returns', q(text)]] },
      );
      return text;
    }
    settle();
    for (let k = i; k < n; k++) add(this.s[k], 'compare', { row: S, col: k });
    const result = text.split(old).join(rep);
    this.snap(
      L.rest,
      i < n
        ? `s.find(${q(old)}, ${i}) = -1: no more occurrences. Copy the rest, s[${i}:] = ${q(text.slice(i))}, and stop.`
        : `The last match ended the string: there is nothing left to copy.`,
      { sRoles: all(n - i, 'compare', i), cells: [...out], rows, vars: [['i', i], ['replaced', count]] },
    );
    settle();
    this.snap(L.rest, `replace_char returns ${q(result)}: ${count} ${count === 1 ? 'occurrence' : 'occurrences'} replaced in one left-to-right pass, O(n).`, {
      cells: [...out],
      rows,
      vars: [['returns', q(result)]],
    });
    return result;
  }

  private caseMap(upper: boolean): string {
    const { L } = this;
    const n = this.s.length;
    const fn = upper ? 'to_upper' : 'to_lower';
    const method = upper ? 'upper' : 'lower';
    const rows: StrRowView[] = [{ row: R1, label: `s.${method}()`, len: n }];
    const map = (c: string) => (upper ? c.toUpperCase() : c.toLowerCase());
    this.snap(L.case, `${fn}(s) returns s.${method}(): a new string in which every ${upper ? 'lowercase' : 'uppercase'} letter becomes ${upper ? 'uppercase' : 'lowercase'}.`, {
      cells: Array.from({ length: n }, (_, k) => ({ id: `slot${this.current}:${k}`, ch: '', row: R1, col: k, slot: true })),
      rows,
    });
    const out = (upto: number, fresh: number): StrCellView[] => [
      ...Array.from({ length: upto }, (_, k): StrCellView => ({
        id: `c${this.current}:${k}`,
        ch: map(this.s[k]),
        row: R1,
        col: k,
        role: k === fresh ? (map(this.s[k]) !== this.s[k] ? 'active' : 'compare') : 'done',
        from: k === fresh ? { row: S, col: k } : undefined,
      })),
      ...Array.from({ length: n - upto }, (_, k): StrCellView => ({ id: `slot${this.current}:${upto + k}`, ch: '', row: R1, col: upto + k, slot: true })),
    ];
    for (let k = 0; k < n; k++) {
      const c = this.s[k];
      const d = map(c);
      this.snap(
        L.caseStep,
        d !== c
          ? `${q(c)} is ${upper ? 'a lowercase' : 'an uppercase'} letter: write ${q(d)}.`
          : `${q(c)} ${/[a-z]/i.test(c) ? `is already ${upper ? 'uppercase' : 'lowercase'}` : 'has no case'}: copy it as it is.`,
        { sRoles: { [k]: 'compare' }, cells: out(k + 1, k), rows, vars: [['c', q(c)]] },
      );
    }
    const result = this.s.map(map).join('');
    this.snap(L.caseStep, `${fn} returns ${q(result)}: one pass over the ${n} characters, O(n). s itself is unchanged.`, {
      cells: out(n, -1),
      rows,
      vars: [['returns', q(result)]],
    });
    return result;
  }

  // ---- split_string, join_string

  private split(sep: string): string[] | { error: string } {
    const { L } = this;
    const n = this.s.length;
    const text = this.s.join('');
    const m = sep.length;
    const rows: StrRowView[] = [{ row: R1, label: 'parts' }];
    this.snap(L.split, `split_string(s, ${q(sep)}) returns s.split(${q(sep)}): cut s at every ${q(sep)} and keep what lies between, empty fields included.`, { rows });
    if (m === 0) {
      this.snap(L.split, `The separator is empty, and str.split refuses to cut at nothing: s.split('') raises ValueError: empty separator, and no list is made. The next operation runs as if the caller caught it.`, {
        cells: [{ id: `err${this.current}`, ch: '', row: R1, col: 0, role: 'bad' }],
        rows,
        vars: [['raises', 'ValueError']],
      });
      return { error: 'ValueError' };
    }
    const parts: string[] = [];
    const starts: number[] = [];
    const cells = (fresh: number) =>
      this.listCells(
        parts,
        `p${this.current}`,
        R1,
        Object.fromEntries(parts.map((_, k) => [k, (k === fresh ? 'active' : 'done') as Role])),
        (item, k) => (item === fresh ? { row: S, col: Math.min(starts[item] + k, Math.max(n - 1, 0)) } : undefined),
      );
    const seps: Record<number, Role> = {};
    let i = 0;
    for (;;) {
      const j = text.indexOf(sep, i);
      if (j < 0) break;
      this.snap(L.find, `s.find(${q(sep)}, ${i}) = ${j}: a separator at index ${j}.`, {
        sRoles: { ...seps, ...all(j - i, 'compare', i), ...all(m, 'active', j) },
        cells: cells(-1),
        rows,
        markers: [
          { name: 'i', row: S, col: i, side: 'below', role: 'compare' },
          { name: 'j', row: S, col: j, role: 'active' },
        ],
        vars: [['i', i], ['j', j]],
      });
      parts.push(text.slice(i, j));
      starts.push(i);
      Object.assign(seps, all(m, 'muted', j));
      const field = parts[parts.length - 1];
      this.snap(
        L.field,
        field
          ? `parts.append(s[${i}:${j}]) adds ${q(field)}. The next field starts after the separator: i = ${j} + ${m} = ${j + m}.`
          : `s[${i}:${j}] is empty (${i === 0 ? 's starts with a separator' : 'two separators touch'}), and split(sep) keeps empty fields: parts.append('') . Then i = ${j + m}.`,
        { sRoles: { ...seps }, cells: cells(parts.length - 1), rows, vars: [['i', j + m], ['parts', parts.length]] },
      );
      i = j + m;
    }
    const last = text.slice(i);
    parts.push(last);
    starts.push(i);
    const reused = parts.length === 1;
    this.snap(
      L.last,
      reused
        ? `s.find(${q(sep)}, 0) = -1: s has no separator, so the only field is all of s (CPython puts s itself in the list).`
        : `No separator at or after ${i}: the rest, s[${i}:] = ${q(last)}, is the last field${last === '' ? ' (empty, because s ends with a separator)' : ''}.`,
      { sRoles: { ...seps, ...all(n - i, 'compare', i) }, cells: cells(parts.length - 1), rows, vars: [['parts', parts.length]] },
    );
    this.parts = { items: [...parts], op: this.current };
    this.snap(L.last, `split_string returns ${qList(parts)}: ${parts.length - 1} ${parts.length === 2 ? 'separator gives' : 'separators give'} ${parts.length} ${parts.length === 1 ? 'field' : 'fields'}. join_string with the same separator would rebuild s.`, {
      sRoles: seps,
      cells: cells(-1),
      rows,
      vars: [['returns', qList(parts)]],
    });
    return parts;
  }

  private join(sep: string, literal?: string[]): string {
    const { L } = this;
    const items = literal ?? this.parts?.items ?? [];
    const prefix = literal ? `lst${this.current}` : `p${this.parts?.op ?? 0}`;
    const label = literal ? 'lst' : 'parts';
    const listRow: StrRowView = { row: R1, label };
    const list = (roles: Record<number, Role> = {}) => this.listCells(items, prefix, R1, roles);
    const m = sep.length;
    const k = items.length;
    const name = literal ? qList(items) : 'parts';
    this.snap(L.join, `join_string(${name}, ${q(sep)}) returns ${q(sep)}.join(${name}): the items in order, with ${q(sep)} between neighbours.`, { cells: list(), rows: [listRow] });
    if (k === 0) {
      this.snap(L.total, `The list is empty, so there is nothing to join: the result is ''.`, { rows: [listRow], vars: [['returns', "''"]] });
      return '';
    }
    if (k === 1) {
      this.snap(L.copy, `With one item there is no separator to insert: the result equals the item, ${q(items[0])} (CPython returns that very string, without copying).`, {
        cells: list({ 0: 'done' }),
        rows: [listRow],
        vars: [['returns', q(items[0])]],
      });
      return items[0];
    }
    const total = items.reduce((a, x) => a + x.length, 0) + (k - 1) * m;
    this.snap(
      L.total,
      `First, join adds up the sizes: ${items.map((x) => x.length).join(' + ')} = ${total - (k - 1) * m} characters of items, plus ${k - 1} ${k === 2 ? 'separator' : 'separators'} of ${m}: ${total} in all.`,
      { cells: list(Object.fromEntries(items.map((_, i) => [i, 'compare' as Role]))), rows: [listRow], vars: [['total', total]] },
    );
    const resRow: StrRowView = { row: R2, label: 'result', len: total };
    const out: StrCellView[] = [];
    const slots = () => Array.from({ length: total - out.length }, (_, x): StrCellView => ({ id: `slot${this.current}:${out.length + x}`, ch: '', row: R2, col: out.length + x, slot: true }));
    this.snap(L.alloc, `So it allocates the result once, ${total} characters, before copying anything.`, { cells: [...list(), ...slots()], rows: [listRow, resRow], vars: [['total', total]] });
    const cols = itemCols(items);
    const roles: Record<number, Role> = {};
    items.forEach((item, i) => {
      out.forEach((c, x) => (out[x] = { ...c, role: 'done', from: undefined }));
      if (i > 0) for (const ch of sep) out.push({ id: `j${this.current}:${out.length}`, ch, row: R2, col: out.length, role: 'active' });
      [...item].forEach((ch, x) => out.push({ id: `j${this.current}:${out.length}`, ch, row: R2, col: out.length, role: 'compare', from: { row: R1, col: cols[i] + x } }));
      roles[i] = 'compare';
      this.snap(
        L.copy,
        `${i > 0 ? `Write the separator ${q(sep)}, then copy` : 'Copy'} item ${i}, ${q(item)}${item === '' ? ' (empty: nothing to copy)' : ''}.`,
        { cells: [...list({ ...roles }), ...out, ...slots()], rows: [listRow, resRow], vars: [['item', i], ['written', out.length]] },
      );
      roles[i] = 'done';
    });
    out.forEach((c, x) => (out[x] = { ...c, role: 'done', from: undefined }));
    const result = items.join(sep);
    this.snap(
      L.copy,
      `join_string returns ${q(result)}. Every character was written once into the one allocation: O(total length). Adding the items with += in a loop would copy the growing prefix again on every step.`,
      { cells: [...list(), ...out], rows: [listRow, resRow], vars: [['returns', q(result)]] },
    );
    return result;
  }

  run(s: string): ManipRun {
    this.s = [...s];
    this.snap(undefined, s ? `s = ${q(s)}, ${s.length} characters. Strings are immutable, so no function below changes s: each one builds (or returns) another string.` : `s = '': the empty string.`);
    this.ops.forEach((op, k) => {
      this.current = k;
      let result: ManipStep['result'];
      if (op.kind === 'reverse') result = this.reverse();
      else if (op.kind === 'palindrome') result = this.palindrome();
      else if (op.kind === 'vowels') result = this.vowels();
      else if (op.kind === 'replace') result = this.replace(op.old, op.new);
      else if (op.kind === 'upper' || op.kind === 'lower') result = this.caseMap(op.kind === 'upper');
      else if (op.kind === 'split') result = this.split(op.sep);
      else result = this.join(op.sep, op.list);
      this.steps.push({ op, result });
    });
    this.current = this.ops.length;
    this.snap(undefined, `Done. s is still ${q(s)}: every call returned a new value and left s as it was.`);
    return { frames: this.frames, steps: this.steps };
  }
}

export function stringManipulationTrace({ s, ops }: ManipInput, group: ManipGroup): ManipRun {
  return new ManipTracer(ops, group).run(s);
}
