/**
 * Single-pattern string search tracers that mirror the repository code line by
 * line (Algorithms/String_Algorithms/Pattern_Matching/<topic>/Python): naive
 * search, Rabin-Karp (rolling hash, base 256) and Boyer-Moore with the
 * bad-character rule.
 *
 * Every tracer takes an optional `log` that receives each text index the
 * Python code reads, in order. The golden fixtures
 * (web/scripts/gen_strings_fixtures.py) record the same reads from the Python
 * functions, so tests pin the exact comparisons, hash rolls and shifts.
 *
 * Input: "text | pattern"; Rabin-Karp also accepts "text | pattern | mod 7".
 */
import { InputError, type Frame, type Role } from '../core/types';
import type { ScanCell, ScanRow, StringScanState } from '../renderers/StringScan';
import type { StripData } from '../ui/molecules/Strip';
import { SYM } from '../ui/symbols';
import { parseKmp } from './kmp';

export interface SearchInput {
  text: string[];
  pattern: string[];
  /** Rabin-Karp modulus q (the repository default is 101); the other algorithms ignore it. */
  mod: number;
}

export interface SearchState extends StringScanState {
  /** Occurrences reported so far (all of them on the last frame). */
  matches: number[];
}

type Vars = Array<[string, string | number]>;

export const RK_BASE = 256;
export const RK_DEFAULT_MOD = 101;
export const RK_MAX_MOD = 999;

const MOD_OPTION = /\|\s*(?:mod|q)\b\s*[:=]?\s*([^|]*)$/i;

/** "text | pattern", optionally followed by "| mod N" (Rabin-Karp's modulus). */
export function parseSearch(input: string): SearchInput {
  let rest = input;
  let mod = RK_DEFAULT_MOD;
  const option = MOD_OPTION.exec(input);
  if (option && (input.match(/\|/g) ?? []).length >= 2) {
    const raw = option[1].trim();
    if (!/^\d+$/.test(raw)) throw new InputError(`Write the modulus as a whole number, e.g. "| mod 7" (got "${raw}").`);
    mod = Number(raw);
    if (mod < 1 || mod > RK_MAX_MOD) {
      throw new InputError(`Pick a modulus between 1 and ${RK_MAX_MOD} (got ${mod}). Small values such as 7 provoke spurious hits.`);
    }
    rest = input.slice(0, option.index);
  }
  const { text, pattern } = parseKmp(rest);
  return { text, pattern, mod };
}

// ---------------------------------------------------------------- shared helpers

export const cell = (value: ScanCell['value'], role?: Role, pointer = false): ScanCell => ({ value, role, pointer });
export const cellsRow = (label: string, cells: ScanCell[], offset = 0, slide = false): ScanRow => ({ kind: 'cells', label, cells, offset, slide });
export const indexRow = (count: number, label = 'index', offset = 0): ScanRow => ({ kind: 'index', label, count, offset });
export const GAP: ScanRow = { kind: 'gap' };

/** A character as it appears in a caption. */
export const quote = (ch: string) => (ch === ' ' ? "' ' (space)" : `'${ch}'`);
export const listOf = (xs: number[]) => (xs.length ? xs.join(', ') : 'none');
const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? '' : 's'}`;

export function matchStrip(matches: number[], label = 'Matches'): StripData {
  return {
    label,
    items: matches.length ? matches.map((s) => ({ text: String(s), role: 'done' as Role })) : [{ text: 'none yet' }],
  };
}

/** Comparisons naive search makes on this input (for the "versus naive" summaries). */
export function naiveComparisons(text: string[], pattern: string[]): number {
  let count = 0;
  for (let i = 0; i + pattern.length <= text.length; i++) {
    let j = 0;
    while (j < pattern.length) {
      count++;
      if (text[i + j] !== pattern[j]) break;
      j++;
    }
  }
  return count;
}

const posMod = (a: number, q: number) => ((a % q) + q) % q;

/** Bad-character table as the repository builds it: last index of each character, in first-seen order. */
export function badCharTable(pattern: string[]): Map<string, number> {
  const last = new Map<string, number>();
  pattern.forEach((ch, k) => last.set(ch, k));
  return last;
}

// ---------------------------------------------------------------- naive search

export function naiveTrace({ text, pattern }: SearchInput, log?: number[]): Array<Frame<SearchState>> {
  const n = text.length;
  const m = pattern.length;
  const windows = Math.max(0, n - m + 1);
  const frames: Array<Frame<SearchState>> = [];
  const matches: number[] = [];
  const cost: Array<number | null> = Array.from({ length: windows }, () => null);
  let comparisons = 0;

  interface View {
    i?: number;
    /** Comparison of text[i + j] with pattern[j]. */
    cmp?: { j: number; equal: boolean };
    /** pattern[0..matched-1] already matched at this alignment. */
    matched?: number;
    found?: boolean;
  }
  const inMatch = (k: number) => matches.some((s) => k >= s && k < s + m);

  const snap = (line: number | undefined, caption: string, v: View, vars: Vars = []) => {
    const { i, cmp, matched = 0, found } = v;
    const textCells = text.map((ch, k) => {
      let role: Role | undefined;
      if (i !== undefined && cmp && k === i + cmp.j) role = cmp.equal ? 'good' : 'bad';
      else if (i !== undefined && k >= i && k < i + matched) role = found ? 'done' : 'compare';
      else if (inMatch(k)) role = 'done';
      else if (i !== undefined && k < i) role = 'muted';
      return cell(ch, role, i !== undefined && cmp !== undefined && k === i + cmp.j);
    });
    const rows: ScanRow[] = [indexRow(n), cellsRow('text', textCells)];
    if (i !== undefined) {
      const patternCells = pattern.map((ch, k) => {
        let role: Role | undefined;
        if (found) role = 'done';
        else if (cmp && k === cmp.j) role = cmp.equal ? 'good' : 'bad';
        else if (k < matched) role = 'compare';
        return cell(ch, role, cmp !== undefined && k === cmp.j);
      });
      rows.push(cellsRow('pattern', patternCells, i, true));
    }
    if (windows > 0) {
      const costCells = cost.map((c, s) => cell(c, s === i ? 'active' : matches.includes(s) ? 'done' : undefined, s === i));
      rows.push(GAP, cellsRow('compares', costCells));
    }
    frames.push({
      line,
      caption,
      state: { label: 'Naive search: the pattern slides under the text one position at a time', rows, matches: [...matches], strips: [matchStrip(matches)] },
      vars: [...vars, ['comparisons', comparisons]],
    });
  };

  if (m > n) {
    snap(0, `The pattern (${m} characters) is longer than the text (${n}): no alignment fits, so the search returns [] without comparing anything.`, {});
    return frames;
  }

  for (let i = 0; i < windows; i++) {
    cost[i] = 0;
    snap(1,
      i === 0
        ? `Try every alignment i = 0..${n - m} (${windows} in all). Start with the pattern under text[0] and compare left to right from j = 0. The bottom row counts the comparisons each alignment costs.`
        : `Slide the window one step to i = ${i} and start again at j = 0: naive search forgets everything it learned at the previous alignment.`,
      { i },
      [['i', i], ['j', 0]],
    );
    let j = 0;
    while (j < m) {
      log?.push(i + j);
      comparisons++;
      cost[i]! += 1;
      const equal = text[i + j] === pattern[j];
      const caption = equal
        ? `text[${i + j}] = ${quote(text[i + j])} equals pattern[${j}]${j + 1 < m ? `: extend the match to j = ${j + 1}.` : ': that was the last character.'}`
        : `text[${i + j}] = ${quote(text[i + j])} differs from pattern[${j}] = ${quote(pattern[j])}: alignment ${i} fails after ${plural(j, 'matched character')}${i + 1 < windows ? ', so slide one step right.' : '.'}`;
      snap(2, caption, { i, cmp: { j, equal }, matched: j }, [['i', i], ['j', j]]);
      if (!equal) break;
      j++;
    }
    if (j === m) {
      matches.push(i);
      snap(4, `All ${m} characters match: report i = ${i}. The window still moves only one step, so overlapping occurrences are found too.`, { i, matched: m, found: true }, [['i', i], ['j', j]]);
    }
  }

  const worst = windows * m;
  snap(
    undefined,
    `Done: ${matches.length ? `${plural(matches.length, 'match')} at ${listOf(matches)}` : 'no match'}. ${plural(comparisons, 'comparison')} over ${plural(windows, 'alignment')}; the worst case is (n - m + 1) ${SYM.times} m = ${worst}.${comparisons === worst && windows > 1 && m > 1 ? ' This input hits it: every alignment compared all m characters.' : ''}`,
    {},
    [['matches', listOf(matches)]],
  );
  return frames;
}

// ---------------------------------------------------------------- Rabin-Karp

export function rabinKarpTrace({ text, pattern, mod: q }: SearchInput, log?: number[]): Array<Frame<SearchState>> {
  const n = text.length;
  const m = pattern.length;
  const base = RK_BASE;
  const windows = Math.max(0, n - m + 1);
  const code = (ch: string) => ch.codePointAt(0)!;
  const frames: Array<Frame<SearchState>> = [];
  const matches: number[] = [];
  const spurious: number[] = [];
  const hashes: Array<number | null> = Array.from({ length: windows }, () => null);
  let hits = 0;
  let comparisons = 0;
  let h = 1;
  let p = 0;
  let t = 0;
  let hashed = false;

  interface View {
    /** Current window start. */
    i?: number;
    /** This frame compares the pattern hash with the window hash. */
    hashCmp?: boolean;
    /** Verification: text[i + j] against pattern[j]. */
    cmp?: { j: number; equal: boolean };
    matched?: number;
    found?: boolean;
    /** The window just rolled from i - 1 to i. */
    roll?: boolean;
  }
  const inMatch = (k: number) => matches.some((s) => k >= s && k < s + m);

  const snap = (line: number | undefined, caption: string, v: View, vars: Vars = []) => {
    const { i, hashCmp, cmp, matched = 0, found, roll } = v;
    const textCells = text.map((ch, k) => {
      let role: Role | undefined;
      const inWindow = i !== undefined && k >= i && k < i + m;
      if (i !== undefined && cmp && k === i + cmp.j) role = cmp.equal ? 'good' : 'bad';
      else if (i !== undefined && roll && (k === i - 1 || k === i + m - 1)) role = 'active';
      else if (inWindow) role = found ? 'done' : 'compare';
      else if (inMatch(k)) role = 'done';
      else if (i !== undefined && k < i) role = 'muted';
      return cell(ch, role, i !== undefined && ((cmp !== undefined && k === i + cmp.j) || (!!roll && k === i + m - 1)));
    });
    const rows: ScanRow[] = [indexRow(n), cellsRow('text', textCells)];
    if (i !== undefined) {
      const patternCells = pattern.map((ch, k) => {
        let role: Role | undefined;
        if (found) role = 'done';
        else if (cmp && k === cmp.j) role = cmp.equal ? 'good' : 'bad';
        else if (cmp && k < matched) role = 'compare';
        return cell(ch, role, cmp !== undefined && k === cmp.j);
      });
      rows.push(cellsRow('pattern', patternCells, i, true));
    }
    if (hashed) {
      const hashRole = (s: number): Role | undefined => {
        if (s === i && hashCmp) return p === t ? 'good' : 'bad';
        if (spurious.includes(s)) return 'bad';
        if (matches.includes(s)) return 'done';
        if (s === i) return 'active';
        if (hashes[s] !== null) return 'muted';
        return undefined;
      };
      rows.push(GAP, cellsRow('hash t', hashes.map((x, s) => cell(x, hashRole(s), s === i))));
      if (i !== undefined) rows.push(cellsRow('hash p', [cell(p, hashCmp ? (p === t ? 'good' : 'bad') : undefined)], i, true));
    }
    frames.push({
      line,
      caption,
      state: {
        label: 'Rabin-Karp: the window hash rolls along the text and is compared with the pattern hash',
        rows,
        matches: [...matches],
        strips: [matchStrip(matches), { label: 'Spurious hits', items: spurious.length ? spurious.map((s) => ({ text: `window ${s}` })) : [{ text: 'none yet' }] }],
      },
      vars: [...vars, ['q (mod)', q], ['hash hits', hits], ['spurious', spurious.length], ['comparisons', comparisons]],
    });
  };

  if (m > n) {
    snap(0, `The pattern (${m} characters) is longer than the text (${n}): no window fits, so the search returns [] before hashing anything.`, {});
    return frames;
  }

  for (let k = 0; k < m - 1; k++) h = (h * base) % q;
  snap(0,
    m === 1
      ? `m = 1, so the leading character has weight 256^0: h = 1. A window's hash is its characters read as a base-256 number, mod q = ${q}.`
      : `h = 256^(m - 1) mod q = 256^${m - 1} mod ${q} = ${h}: the weight of a window's leading character, needed to remove it when the window rolls. Hashes are base-256 numbers mod q = ${q}.`,
    {},
    [['h', h]],
  );

  for (let k = 0; k < m; k++) {
    p = (base * p + code(pattern[k])) % q;
    log?.push(k);
    t = (base * t + code(text[k])) % q;
  }
  hashes[0] = t;
  hashed = true;
  snap(1, `Hash the pattern and the first window with Horner's rule (hash = hash ${SYM.times} 256 + code, mod ${q}): p = ${p} and t = ${t}.`, { i: 0 }, [['p', p], ['t', t], ['h', h]]);

  for (let i = 0; i < windows; i++) {
    const hit = p === t;
    if (hit) hits++;
    snap(3,
      hit
        ? `Window ${i}: t = ${t} equals p = ${p}, a hash hit. Equal hashes do not prove equal strings, so verify character by character.`
        : `Window ${i}: t = ${t} differs from p = ${p}, so this window cannot match. Skip it without reading its characters.`,
      { i, hashCmp: true },
      [['i', i], ['p', p], ['t', t]],
    );
    if (hit) {
      let j = 0;
      for (; j < m; j++) {
        log?.push(i + j);
        comparisons++;
        const equal = text[i + j] === pattern[j];
        if (!equal) spurious.push(i);
        const caption = equal
          ? `Verify: text[${i + j}] = ${quote(text[i + j])} equals pattern[${j}].`
          : `Verify: text[${i + j}] = ${quote(text[i + j])} differs from pattern[${j}] = ${quote(pattern[j])}. A spurious hit: different strings share the hash ${t} (mod ${q}), and verification caught it.`;
        snap(4, caption, { i, cmp: { j, equal }, matched: j }, [['i', i], ['j', j], ['t', t]]);
        if (!equal) break;
      }
      if (j === m) {
        matches.push(i);
        snap(4, `All ${m} characters agree: report ${i}.`, { i, found: true }, [['i', i], ['t', t]]);
      }
    }
    if (i < windows - 1) {
      const out = code(text[i]);
      log?.push(i);
      const inc = code(text[i + m]);
      log?.push(i + m);
      const before = t;
      t = posMod(base * (t - out * h) + inc, q);
      hashes[i + 1] = t;
      snap(6,
        `Roll the window to ${i + 1}: drop ${quote(text[i])} (code ${out}) and add ${quote(text[i + m])} (code ${inc}): t = (256 ${SYM.times} (${before} - ${out} ${SYM.times} ${h}) + ${inc}) mod ${q} = ${t}. Constant work, instead of rehashing ${plural(m, 'character')}.`,
        { i: i + 1, roll: true },
        [['i', i + 1], ['p', p], ['t', t]],
      );
    }
  }

  const naive = naiveComparisons(text, pattern);
  const hint = spurious.length === 0 && q > 13 ? ` Add "| mod 7" to the input to see spurious hits.` : '';
  snap(
    undefined,
    `Done: ${matches.length ? `${plural(matches.length, 'match')} at ${listOf(matches)}` : 'no match'}. ${plural(hits, 'hash hit')}, ${spurious.length ? `${spurious.length} of them spurious (windows ${listOf(spurious)})` : 'none spurious'}; ${plural(comparisons, 'character comparison')} against ${naive} for naive search.${hint}`,
    {},
    [['matches', listOf(matches)]],
  );
  return frames;
}

// ---------------------------------------------------------------- Boyer-Moore

export function boyerMooreTrace({ text, pattern }: SearchInput, log?: number[]): Array<Frame<SearchState>> {
  const n = text.length;
  const m = pattern.length;
  const frames: Array<Frame<SearchState>> = [];
  const matches: number[] = [];
  const last = new Map<string, number>();
  const read = new Set<number>();
  let alignments = 0;
  let comparisons = 0;

  interface View {
    s?: number;
    /** Comparison of pattern[j] with text[s + j]. */
    cmp?: { j: number; equal: boolean };
    /** pattern[from..m-1] matches text[s + from..s + m - 1]. */
    from?: number;
    found?: boolean;
    /** Text index whose character is looked up in the table (bad: it is the mismatching character). */
    lookup?: { index: number; bad: boolean };
    /** After a bad-character shift, text[t] sits over pattern[p]. */
    aligned?: { t: number; p: number };
    /** Table construction: pattern index just recorded. */
    building?: number;
  }
  const inMatch = (k: number) => matches.some((s) => k >= s && k < s + m);

  const tableRows = (v: View): ScanRow[] => {
    const key = v.building !== undefined ? pattern[v.building] : v.lookup ? text[v.lookup.index] : undefined;
    const keys = [...last.keys()];
    const chars = keys.map((c) => cell(c, c === key ? 'active' : undefined, c === key));
    const values = keys.map((c) => cell(last.get(c)!, c === key ? 'active' : undefined));
    if (key !== undefined && !last.has(key)) {
      chars.push({ value: null, blank: true }, cell(key, 'active', true));
      values.push({ value: null, blank: true }, cell(-1, 'active'));
    }
    return [cellsRow('char', chars), cellsRow('last', values)];
  };

  const snap = (line: number | undefined, caption: string, v: View, vars: Vars = []) => {
    const { s, cmp, from, found, lookup, aligned, building } = v;
    const textCells = text.map((ch, k) => {
      let role: Role | undefined;
      if (s !== undefined && cmp && k === s + cmp.j) role = cmp.equal ? 'good' : 'bad';
      else if (lookup && k === lookup.index) role = lookup.bad ? 'bad' : 'active';
      else if (aligned && k === aligned.t) role = 'active';
      else if (s !== undefined && from !== undefined && k >= s + from && k < s + m) role = found ? 'done' : 'compare';
      else if (inMatch(k)) role = 'done';
      else if (s !== undefined && k < s) role = 'muted';
      return cell(ch, role, (s !== undefined && cmp !== undefined && k === s + cmp.j) || lookup?.index === k);
    });
    const rows: ScanRow[] = [indexRow(n), cellsRow('text', textCells)];
    const at = s ?? (building !== undefined ? 0 : undefined);
    if (at !== undefined) {
      const patternCells = pattern.map((ch, k) => {
        let role: Role | undefined;
        if (building !== undefined) role = k === building ? 'active' : undefined;
        else if (found) role = 'done';
        else if (cmp && k === cmp.j) role = cmp.equal ? 'good' : 'bad';
        else if (from !== undefined && k >= from) role = 'compare';
        else if (aligned && k === aligned.p) role = 'active';
        return cell(ch, role, (cmp !== undefined && k === cmp.j) || building === k);
      });
      rows.push(cellsRow('pattern', patternCells, at, true));
    }
    frames.push({
      line,
      caption,
      state: {
        label: 'Boyer-Moore: the pattern is compared right to left and jumps by the bad-character rule',
        rows,
        table: last.size ? { title: 'Bad-character table: last index of each character in the pattern (-1 if absent)', rows: tableRows(v) } : undefined,
        matches: [...matches],
        strips: [matchStrip(matches)],
      },
      vars: [...vars, ['alignments', alignments], ['comparisons', comparisons]],
    });
  };

  if (m > n) {
    snap(0, `The pattern (${m} characters) is longer than the text (${n}): no alignment fits, so the search returns [] right away.`, {});
    return frames;
  }

  for (let k = 0; k < m; k++) {
    const prev = last.get(pattern[k]);
    last.set(pattern[k], k);
    const intro = k === 0 ? 'Build the bad-character table: for each character of the pattern, the index of its rightmost occurrence. ' : '';
    snap(0,
      prev === undefined
        ? `${intro}last[${quote(pattern[k])}] = ${k}.`
        : `${intro}last[${quote(pattern[k])}] = ${k}, replacing ${prev}: only the rightmost occurrence counts.`,
      { building: k },
      [['k', k]],
    );
  }

  let s = 0;
  let aligned: View['aligned'];
  while (s <= n - m) {
    alignments++;
    snap(3,
      alignments === 1
        ? `Start with the pattern under text[0] (s = 0) and compare right to left, from j = m - 1 = ${m - 1}.`
        : `Alignment s = ${s}: compare right to left from j = ${m - 1}.${aligned ? ` The text's ${quote(text[aligned.t])} now sits over the pattern's last ${quote(pattern[aligned.p])}.` : ''}`,
      { s, from: m, aligned },
      [['s', s], ['j', m - 1]],
    );
    let j = m - 1;
    while (j >= 0) {
      log?.push(s + j);
      read.add(s + j);
      comparisons++;
      const equal = pattern[j] === text[s + j];
      const caption = equal
        ? `pattern[${j}] = ${quote(pattern[j])} matches text[${s + j}]${j > 0 ? `; move left to j = ${j - 1}.` : '.'}`
        : `pattern[${j}] = ${quote(pattern[j])} differs from text[${s + j}] = ${quote(text[s + j])}: ${quote(text[s + j])} is the bad character.`;
      snap(4, caption, { s, cmp: { j, equal }, from: j + 1 }, [['s', s], ['j', j]]);
      if (!equal) break;
      j--;
    }
    if (j < 0) {
      matches.push(s);
      if (s + m < n) {
        log?.push(s + m);
        read.add(s + m);
        const c = text[s + m];
        const k = last.get(c) ?? -1;
        const shift = m - k;
        snap(
          7,
          `All ${m} characters match: report s = ${s}. To move on, look at the next text character, text[${s + m}] = ${quote(c)}: ${
            k >= 0 ? `its last occurrence in the pattern is ${k}, so shift by m - ${k} = ${shift} to line them up.` : `it is not in the pattern, so shift by m + 1 = ${shift}, past it.`
          }`,
          { s, found: true, from: 0, lookup: { index: s + m, bad: false } },
          [['s', s], ['next char', quote(c)], ['last[c]', k], ['shift', shift]],
        );
        aligned = k >= 0 ? { t: s + m, p: k } : undefined;
        s += shift;
      } else {
        snap(7, `All ${m} characters match: report s = ${s}. The pattern ends at the end of the text, so shift by 1 and the loop ends.`, { s, found: true, from: 0 }, [['s', s], ['shift', 1]]);
        aligned = undefined;
        s += 1;
      }
    } else {
      log?.push(s + j);
      const c = text[s + j];
      const k = last.get(c) ?? -1;
      const raw = j - k;
      const shift = Math.max(1, raw);
      let caption: string;
      if (k < 0) caption = `${quote(c)} does not occur in the pattern (last = -1): shift by j + 1 = ${shift}, so the pattern starts just past it.`;
      else if (k < j) caption = `The last ${quote(c)} in the pattern is at ${k}: shift by j - ${k} = ${shift} to put it under the text's ${quote(c)}.`;
      else caption = `The last ${quote(c)} in the pattern is at ${k}, right of j = ${j}: lining it up would move the pattern backwards (j - ${k} = ${raw}), so shift by 1.`;
      snap(9, caption, { s, from: j + 1, lookup: { index: s + j, bad: true } }, [['s', s], ['j', j], ['bad char', quote(c)], ['last[c]', k], ['shift', shift]]);
      aligned = k >= 0 && k < j ? { t: s + j, p: k } : undefined;
      s += shift;
    }
  }

  const windows = n - m + 1;
  const worst = comparisons === windows * m && windows > 1 && m > 1;
  snap(
    undefined,
    `Done: ${matches.length ? `${plural(matches.length, 'match')} at ${listOf(matches)}` : 'no match'}. ${plural(alignments, 'alignment')} (naive search tries all ${windows}) and ${plural(comparisons, 'comparison')}; ${n - read.size} of ${n} text characters were never read.${
      worst ? ' This input is the worst case for the bad-character rule: every shift is 1 and every alignment compares all m characters, O(nm).' : ''
    }`,
    {},
    [['matches', listOf(matches)]],
  );
  return frames;
}
