/**
 * Suffix array tracer, drawn with SuffixArrayView (one gliding row per suffix, with its rank,
 * its start index and the binary-search pointers).
 *
 * Mirrors Algorithms/String_Algorithms/Advanced_String/Suffix_Array/Python/suffix_array.py,
 * class SuffixArray:
 *   __init__ / build_suffix_array  suffixes = [(s[i:], i) for i in range(n)], suffixes.sort(),
 *              return the indices. Tuples compare by the suffix string first, character by
 *              character by code point; suffixes are all different, so the index never decides.
 *              The picture shows the list before and after the sort and then why each
 *              neighbour pair is in that order. It does not replay Python's sort comparison by
 *              comparison (that order depends on the CPython version).
 *   search / search_pattern  binary search 1 for the first rank whose suffix starts with the
 *              pattern (a match moves right to mid - 1; otherwise text[idx:idx + m] < pattern
 *              moves left to mid + 1, else right to mid - 1); first == -1 returns []; binary
 *              search 2 from first for the last rank; then the block's indices, sorted.
 *   longest_common_prefix(i, j)  compares text[i + k] with text[j + k] while both are in range.
 * The code has no LCP array. Golden fixtures (__fixtures__/advancedStrings.json, section
 * suffix) pin the suffix array, every index search_pattern reads from it (the probes, then the
 * block) and every result.
 *
 * Input: "banana; ana na x, lcp 1 3"   (the text; then patterns to search, "" for the empty
 * pattern, and "lcp i j"; "search ana" also works)
 */
import { InputError, type Frame, type Role } from '../core/types';
import type { SaCell, SaRowView, SaState, SaTag } from '../renderers/SuffixArrayView';
import type { StripData, StripItem } from '../ui/molecules/Strip';

/* ---------- input ---------- */

export type SaOp = { kind: 'search'; pattern: string[] } | { kind: 'lcp'; i: number; j: number };

export interface SaInput {
  text: string[];
  ops: SaOp[];
}

export const SA_LIMITS = { textLength: 11, patternLength: 6, maxOps: 6 };

const EXAMPLE = '"banana; ana na x, lcp 1 3"';
const isEmptyToken = (t: string) => t === '""' || t === "''";

/** Parse "banana; ana na x, lcp 1 3". */
export function parseSuffixArray(input: string): SaInput {
  const semi = input.indexOf(';');
  const head = (semi === -1 ? input : input.slice(0, semi)).trim();
  const rest = semi === -1 ? '' : input.slice(semi + 1);
  if (!head) throw new InputError(`Start with the text, then a ";" and the operations, for example ${EXAMPLE}. Write "" for the empty text.`);
  if (/\s/.test(head) && !isEmptyToken(head)) throw new InputError('The text is one word without spaces (use a "$" or "_" to separate parts).');
  const text = isEmptyToken(head) ? [] : Array.from(head);
  if (text.length > SA_LIMITS.textLength) throw new InputError(`Keep the text to ${SA_LIMITS.textLength} characters, so every suffix fits on screen (got ${text.length}).`);
  const n = text.length;
  const tokens = rest.split(/[\s,]+/).filter(Boolean);
  const ops: SaOp[] = [];
  const pattern = (tok: string): string[] => {
    const p = isEmptyToken(tok) ? [] : Array.from(tok);
    if (p.length > SA_LIMITS.patternLength) throw new InputError(`Patterns have at most ${SA_LIMITS.patternLength} characters here (got "${tok}").`);
    return p;
  };
  for (let k = 0; k < tokens.length; k++) {
    const tok = tokens[k];
    const low = tok.toLowerCase();
    if (low === 'lcp') {
      const a = tokens[k + 1];
      const b = tokens[k + 2];
      if (a === undefined || b === undefined || !/^\d+$/.test(a) || !/^\d+$/.test(b)) throw new InputError('Write "lcp i j" with two start indices, for example "lcp 1 3".');
      if (n === 0) throw new InputError('lcp needs a non-empty text: there are no suffixes to compare.');
      const i = Number(a);
      const j = Number(b);
      if (i >= n || j >= n) throw new InputError(`lcp takes start indices from 0 to ${n - 1} (got ${i} and ${j}).`);
      ops.push({ kind: 'lcp', i, j });
      k += 2;
    } else if (low === 'search' || low === 'find') {
      const p = tokens[k + 1];
      if (p === undefined) throw new InputError(`"${tok}" needs a pattern, for example "search ana" (or just "ana").`);
      ops.push({ kind: 'search', pattern: pattern(p) });
      k += 1;
    } else {
      ops.push({ kind: 'search', pattern: pattern(tok) });
    }
  }
  if (ops.length > SA_LIMITS.maxOps) throw new InputError(`At most ${SA_LIMITS.maxOps} operations, please (got ${ops.length}).`);
  return { text, ops };
}

/** Python's str comparison: by code point, a proper prefix first. Negative, 0 or positive. */
export function compareCodes(a: string[], b: string[]): number {
  const len = Math.min(a.length, b.length);
  for (let k = 0; k < len; k++) {
    const d = a[k].codePointAt(0)! - b[k].codePointAt(0)!;
    if (d !== 0) return d;
  }
  return a.length - b.length;
}

/* ---------- pseudocode ---------- */

export const SA_CODE = [
  'build_suffix_array(s): suffixes = [(s[i:], i) for i in range(n)]',
  '  suffixes.sort()                      # by the suffix string, by code point',
  '  return [idx for _, idx in suffixes]',
  'search_pattern(sa, text, pattern): left, right = 0, n - 1; first = -1',
  '  while left <= right: mid = (left + right) // 2; suffix_idx = sa[mid]',
  '    if text.startswith(pattern, suffix_idx): first = mid; right = mid - 1',
  '    elif text[suffix_idx:suffix_idx + m] < pattern: left = mid + 1',
  '    else: right = mid - 1',
  '  if first == -1: return []',
  '  left, right = first, n - 1; last = first',
  '  while left <= right: mid = (left + right) // 2; suffix_idx = sa[mid]',
  '    if text.startswith(pattern, suffix_idx): last = mid; left = mid + 1',
  '    else: right = mid - 1',
  '  return sorted(sa[i] for i in range(first, last + 1))',
  'longest_common_prefix(text, i, j): k = 0',
  '  while i + k < n and j + k < n and text[i + k] == text[j + k]: k += 1',
  '  return k',
];

/* ---------- tracer ---------- */

export interface SaSearchStep {
  pattern: string;
  /** Every index search_pattern read from the suffix array, in order. */
  reads: number[];
  result: number[];
}

export interface SaRun {
  frames: Array<Frame<SaState>>;
  sa: number[];
  searches: SaSearchStep[];
  lcp: Array<[number, number, number]>;
}

type Vars = Array<[string, string | number]>;

interface View {
  rows?: Record<number, Role>;
  /** Character roles per suffix (keyed by its start index). */
  cells?: Record<number, Record<number, Role>>;
  /** Pointer tags per slot (left of the row). */
  tags?: Record<number, SaTag[]>;
  /** Marks per slot (after the suffix): first, last. */
  marks?: Record<number, SaTag[]>;
  textRoles?: Record<number, Role>;
  pattern?: SaCell[];
  vars?: Vars;
}

const quote = (cs: string[]) => `'${cs.join('')}'`;
const ch = (c: string) => `'${c}' (${c.codePointAt(0)})`;
const plural = (k: number, w: string) => `${k} ${w}${k === 1 ? '' : 's'}`;

export function saTrace({ text, ops }: SaInput): SaRun {
  const n = text.length;
  const frames: Array<Frame<SaState>> = [];
  const suffix = (i: number) => text.slice(i);
  let created = 0;
  let sorted = false;
  let sa: number[] = [];
  const rankOf: number[] = [];
  let current = -1;
  let resultItems: StripItem[] = [];
  const searches: SaSearchStep[] = [];
  const lcps: Array<[number, number, number]> = [];

  const opText = (op: SaOp) => (op.kind === 'search' ? `search(${quote(op.pattern)})` : `lcp(${op.i}, ${op.j})`);
  const strips = (): StripData[] => [
    {
      label: 'Operations',
      items: [
        { text: 'build', role: current === -1 ? 'active' : 'muted' },
        ...ops.map((op, k): StripItem => ({ text: opText(op), role: k === current ? 'active' : k < current ? 'muted' : undefined })),
      ],
    },
    { label: 'Result', items: resultItems.length ? resultItems : [{ text: current === -1 ? 'SA not built yet' : 'none yet' }] },
  ];

  const snap = (line: number | undefined, caption: string, v: View = {}) => {
    const rows: SaRowView[] = [];
    for (let i = 0; i < created; i++) {
      const slot = sorted ? rankOf[i] : i;
      rows.push({
        id: i,
        slot,
        rank: String(slot),
        start: String(i),
        cells: suffix(i).map((c, k) => ({ ch: c, role: v.cells?.[i]?.[k] })),
        role: v.rows?.[i],
        tags: v.tags?.[slot],
        marks: v.marks?.[slot],
      });
    }
    frames.push({
      line,
      caption,
      vars: [...(v.vars ?? []), ['n', n]],
      state: {
        label: `Suffix array of '${text.join('')}': ${sorted ? 'the suffixes in sorted order' : 'the suffixes in text order'}`,
        text: text.map((c, k) => ({ ch: c, role: v.textRoles?.[k] })),
        pattern: v.pattern,
        header: sorted ? { rank: 'k', start: 'SA[k]' } : { rank: 'pos', start: 'i' },
        rows,
        slots: n,
        strips: strips(),
      },
    });
  };

  /* ---------- build ---------- */
  snap(
    0,
    n
      ? `SuffixArray('${text.join('')}') calls build_suffix_array, which lists every suffix with its start index: suffixes = [(s[i:], i) for i in range(${n})], one slice per position.`
      : "SuffixArray(''): the text is empty, so there are no suffixes and the suffix array is [].",
  );
  for (let i = 0; i < n; i++) {
    created = i + 1;
    snap(0, `i = ${i}: s[${i}:] = ${quote(suffix(i))}, a copy of ${plural(n - i, 'character')}, paired with its start index ${i}.`, {
      rows: { [i]: 'active' },
      textRoles: Object.fromEntries(suffix(i).map((_, k) => [i + k, 'compare' as Role])),
      vars: [['i', i]],
    });
  }
  sa = Array.from({ length: n }, (_, i) => i).sort((a, b) => compareCodes(suffix(a), suffix(b)));
  sa.forEach((i, k) => (rankOf[i] = k));
  if (n > 0) {
    sorted = true;
    const moved = sa.filter((i, k) => i !== k).length;
    snap(
      1,
      `suffixes.sort() orders the pairs by their suffix strings: Python compares two strings character by character by code point, and a string that is a prefix of another comes first. ` +
        `The start index would only break a tie, but no two suffixes are equal. ${moved ? `${moved} suffix${moved === 1 ? '' : 'es'} move${moved === 1 ? 's' : ''} to a new rank.` : 'The list was already in order.'}`,
      { rows: Object.fromEntries(sa.filter((i, k) => i !== k).map((i) => [i, 'active' as Role])) },
    );
    for (let k = 1; k < n; k++) {
      const a = sa[k - 1];
      const b = sa[k];
      const sa1 = suffix(a);
      const sb = suffix(b);
      let common = 0;
      while (common < sa1.length && common < sb.length && sa1[common] === sb[common]) common++;
      const cells: Record<number, Record<number, Role>> = { [a]: {}, [b]: {} };
      for (let c = 0; c < common; c++) {
        cells[a][c] = 'compare';
        cells[b][c] = 'compare';
      }
      let why: string;
      if (common === sa1.length) {
        why = `${quote(sa1)} is a prefix of ${quote(sb)}, so it sorts first.`;
      } else {
        cells[a][common] = 'active';
        cells[b][common] = 'active';
        why =
          (common ? `They agree on ${quote(sa1.slice(0, common))}, then ` : 'They differ at the first character: ') +
          `${ch(sa1[common])} < ${ch(sb[common])}.`;
      }
      snap(1, `Why is ${quote(sa1)} (rank ${k - 1}) before ${quote(sb)} (rank ${k})? ${why}`, {
        rows: { [a]: 'compare', [b]: 'compare' },
        cells,
        vars: [['k', k], ['common prefix', common]],
      });
    }
  }
  resultItems = [{ text: `SA = [${sa.join(', ')}]`, role: 'done' }];
  snap(
    2,
    n
      ? `return [idx for _, idx in suffixes]: SA = [${sa.join(', ')}]. The class keeps the text beside it, so each suffix is just its start index. ` +
          'This sort copies every suffix and compares whole strings: O(n^2 log n) time.'
      : 'return []: the suffix array of the empty text is empty.',
    { rows: Object.fromEntries(sa.map((i) => [i, 'done' as Role])) },
  );

  /* ---------- operations ---------- */
  ops.forEach((op, opIndex) => {
    current = opIndex;
    resultItems = [];
    if (op.kind === 'lcp') {
      const { i, j } = op;
      const tags: Record<number, SaTag[]> = {};
      const addTag = (slot: number, t: SaTag) => (tags[slot] = [...(tags[slot] ?? []), t]);
      addTag(rankOf[i], { text: 'i', role: 'compare' });
      addTag(rankOf[j], { text: 'j', role: 'compare' });
      const rows = { [i]: 'compare' as Role, [j]: 'compare' as Role };
      snap(
        14,
        `longest_common_prefix(${i}, ${j}): walk the suffixes ${quote(suffix(i))} and ${quote(suffix(j))} side by side from k = 0 while both are inside the text and their characters agree.` +
          (i === j ? ' Both start at the same index, so they agree all the way to the end.' : ''),
        { rows, tags, vars: [['i', i], ['j', j], ['k', 0]] },
      );
      let k = 0;
      const cellsUpTo = (last?: Role): Record<number, Record<number, Role>> => {
        const c: Record<number, Record<number, Role>> = { [i]: {}, [j]: {} };
        for (let t = 0; t < k; t++) {
          c[i][t] = 'good';
          c[j][t] = 'good';
        }
        if (last) {
          c[i][k] = last;
          c[j][k] = last;
        }
        return c;
      };
      for (;;) {
        if (i + k >= n || j + k >= n) {
          snap(15, `i + k = ${i + k} or j + k = ${j + k} reached n = ${n}: the shorter suffix has ended, so the common prefix cannot grow. k = ${k}.`, {
            rows,
            tags,
            cells: cellsUpTo(),
            vars: [['i', i], ['j', j], ['k', k]],
          });
          break;
        }
        const equal = text[i + k] === text[j + k];
        const textRoles: Record<number, Role> = { [i + k]: equal ? 'good' : 'bad', [j + k]: equal ? 'good' : 'bad' };
        if (!equal) {
          snap(15, `text[${i + k}] = '${text[i + k]}' differs from text[${j + k}] = '${text[j + k]}': the common prefix ends. k = ${k}.`, {
            rows,
            tags,
            cells: cellsUpTo('bad'),
            textRoles,
            vars: [['i', i], ['j', j], ['k', k]],
          });
          break;
        }
        k++;
        snap(15, `text[${i + k - 1}] = '${text[i + k - 1]}' equals text[${j + k - 1}] = '${text[j + k - 1]}': k = ${k}.`, {
          rows,
          tags,
          cells: cellsUpTo(),
          textRoles,
          vars: [['i', i], ['j', j], ['k', k]],
        });
      }
      lcps.push([i, j, k]);
      resultItems = [{ text: String(k), role: 'done' }];
      snap(16, `longest_common_prefix(${i}, ${j}) returns ${k}${k ? `: both suffixes start with ${quote(suffix(i).slice(0, k))}` : ''}. It compares characters one by one, O(n) per call; the code has no LCP array.`, {
        rows,
        tags,
        cells: cellsUpTo(),
        vars: [['i', i], ['j', j], ['k', k]],
      });
      return;
    }

    /* search_pattern */
    const pat = op.pattern;
    const m = pat.length;
    const reads: number[] = [];
    const pv = quote(pat);
    let left = 0;
    let right = n - 1;
    let first = -1;
    let last = -1;
    /** left / mid / right as tags beside the rows, first / last as marks after them (slots outside 0..n-1 are not drawn). */
    const pointerTags = (extra: Record<string, number>, ptrs: Record<string, number>): Pick<View, 'tags' | 'marks'> => {
      const tags: Record<number, SaTag[]> = {};
      const marks: Record<number, SaTag[]> = {};
      const add = (into: Record<number, SaTag[]>, slot: number, t: SaTag) => {
        if (slot >= 0 && slot < n) into[slot] = [...(into[slot] ?? []), t];
      };
      for (const [name, slot] of Object.entries(ptrs)) add(tags, slot, { text: name, role: name === 'mid' ? 'active' : undefined });
      for (const [name, slot] of Object.entries(extra)) add(marks, slot, { text: name, role: 'done' });
      return { tags, marks };
    };
    const outside = (lo: number, hi: number): Record<number, Role> => {
      const r: Record<number, Role> = {};
      sa.forEach((i, k) => {
        if (k < lo || k > hi) r[i] = 'muted';
      });
      return r;
    };
    /** Compare the pattern with the suffix at idx: how many characters agree, and the roles to draw. */
    const probe = (idx: number) => {
      const suf = suffix(idx);
      let j = 0;
      while (j < m && j < suf.length && suf[j] === pat[j]) j++;
      const cells: Record<number, Role> = {};
      const pcells: SaCell[] = pat.map((c, k) => ({ ch: c, role: k < j ? 'good' : k === j ? 'bad' : undefined }));
      for (let k = 0; k < j; k++) cells[k] = 'good';
      if (j < m && j < suf.length) cells[j] = 'bad';
      const match = j === m;
      // Python: text[idx:idx + m] < pattern (the slice clamps at the end of the text).
      const less = !match && compareCodes(suf.slice(0, m), pat) < 0;
      let why: string;
      if (match) why = m ? `${quote(suf)} starts with ${pv}` : `every string starts with ''`;
      else if (j === suf.length) why = `${quote(suf)} is shorter than ${pv} and a prefix of it, so text[${idx}:${idx + m}] = ${quote(suf)} < ${pv}`;
      else why = `${j ? `after ${quote(suf.slice(0, j))}, ` : ''}${ch(suf[j])} ${less ? '<' : '>'} ${ch(pat[j])}, so text[${idx}:${idx + m}] = ${quote(suf.slice(0, m))} ${less ? '<' : '>'} ${pv}`;
      return { cells, pcells, match, less, why };
    };
    const vars = (mid?: number): Vars => [
      ['pattern', pv],
      ['left', left],
      ['right', right],
      ...(mid !== undefined ? ([['mid', mid]] as Vars) : []),
      ['first', first],
      ...(last >= 0 ? ([['last', last]] as Vars) : []),
    ];

    snap(
      3,
      `search(${pv}) calls search_pattern(SA, text, ${pv}). The suffixes that start with ${pv} sit next to each other in sorted order, so two binary searches find the block: ` +
        `the first for its first rank (left = 0, right = ${n - 1}, first = -1).`,
      { pattern: pat.map((c) => ({ ch: c })), ...pointerTags({}, { left, right }), vars: vars() },
    );
    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const idx = sa[mid];
      reads.push(mid);
      const pr = probe(idx);
      const before = outside(left, right);
      const [ol, or] = [left, right];
      let line: number;
      let move: string;
      if (pr.match) {
        first = mid;
        right = mid - 1;
        line = 5;
        move = `first = ${mid}; an earlier rank may match too, so right = mid - 1 = ${right}.`;
      } else if (pr.less) {
        left = mid + 1;
        line = 6;
        move = `the block starts further down: left = mid + 1 = ${left}.`;
      } else {
        right = mid - 1;
        line = 7;
        move = `the block, if any, is further up: right = mid - 1 = ${right}.`;
      }
      snap(line, `mid = (${ol} + ${or}) // 2 = ${mid}, SA[${mid}] = ${idx}: ${pr.why}. ${pr.match ? 'A match: ' : 'No match: '}${move}`, {
        rows: { ...before, [idx]: 'active' },
        cells: { [idx]: pr.cells },
        pattern: pr.pcells,
        ...pointerTags(first >= 0 ? { first } : {}, { left: ol, mid, right: or }),
        vars: vars(mid),
      });
    }
    if (first === -1) {
      searches.push({ pattern: pat.join(''), reads, result: [] });
      resultItems = [{ text: '[]', role: 'done' }];
      snap(
        8,
        n === 0
          ? 'The suffix array is empty: the loop never runs, first stays -1 and search returns [].'
          : `left = ${left} > right = ${right}: the search ran out of ranks and first is still -1. No suffix starts with ${pv}, so it does not occur: search returns [].`,
        { rows: outside(0, -1), pattern: pat.map((c) => ({ ch: c, role: 'bad' as Role })), vars: vars() },
      );
      return;
    }
    left = first;
    right = n - 1;
    last = first;
    snap(9, `Binary search 1 ends: the block starts at rank first = ${first}. Binary search 2 finds where it ends: left = first = ${first}, right = ${n - 1}, last = ${first}.`, {
      rows: { [sa[first]]: 'done' },
      pattern: pat.map((c) => ({ ch: c })),
      ...pointerTags({ first, last }, { left, right }),
      vars: vars(),
    });
    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const idx = sa[mid];
      reads.push(mid);
      const pr = probe(idx);
      const before = outside(left, right);
      const [ol, or] = [left, right];
      let move: string;
      if (pr.match) {
        last = mid;
        left = mid + 1;
        move = `A match: last = ${mid}; a later rank may match too, so left = mid + 1 = ${left}.`;
      } else {
        right = mid - 1;
        move = `No match, so the block ends above it: right = mid - 1 = ${right}.`;
      }
      snap(pr.match ? 11 : 12, `mid = (${ol} + ${or}) // 2 = ${mid}, SA[${mid}] = ${idx}: ${pr.why}. ${move}`, {
        rows: { ...before, [idx]: 'active' },
        cells: { [idx]: pr.cells },
        pattern: pr.pcells,
        ...pointerTags({ first, last }, { left: ol, mid, right: or }),
        vars: vars(mid),
      });
    }
    const block: number[] = [];
    for (let k = first; k <= last; k++) {
      reads.push(k);
      block.push(sa[k]);
    }
    const result = [...block].sort((a, b) => a - b);
    searches.push({ pattern: pat.join(''), reads, result });
    resultItems = [{ text: `[${result.join(', ')}]`, role: 'done' }];
    const blockRows: Record<number, Role> = {};
    const blockCells: Record<number, Record<number, Role>> = {};
    const textRoles: Record<number, Role> = {};
    for (const i of block) {
      blockRows[i] = 'done';
      blockCells[i] = Object.fromEntries(pat.map((_, k) => [k, 'done' as Role]));
      textRoles[i] = 'done';
    }
    snap(
      13,
      `Binary search 2 ends with last = ${last}. Ranks ${first}..${last} hold SA = [${block.join(', ')}]` +
        (block.length > 1 ? `, in suffix order rather than text order, so the result is sorted: [${result.join(', ')}].` : `: search returns [${result.join(', ')}].`) +
        (m === 0 ? " The empty pattern is a prefix of every suffix, so every start index is returned (but not n: the array has no empty suffix)." : ''),
      { rows: blockRows, cells: blockCells, textRoles, pattern: pat.map((c) => ({ ch: c, role: 'done' as Role })), ...pointerTags({ first, last }, {}), vars: vars() },
    );
  });

  current = ops.length;
  if (ops.length) {
    snap(undefined, `Done: ${ops.length} operation${ops.length === 1 ? '' : 's'} on the suffix array [${sa.join(', ')}]. Each search costs two binary searches of O(m) comparisons per probe: O(m log n).`, {});
  }
  return { frames, sa, searches, lcp: lcps };
}
