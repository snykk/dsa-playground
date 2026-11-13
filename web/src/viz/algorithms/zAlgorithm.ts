/**
 * Z-algorithm tracer, mirroring the repository Python
 * (Algorithms/String_Algorithms/Advanced_String/Z-Algorithm/Python):
 * build the Z-array of pattern + "$" + text, then report every text position
 * whose Z value is at least the pattern length.
 *
 * Input: "text | pattern". `zTrace(chars, null)` builds only the Z-array of a
 * plain string (used by the golden-fixture tests); like the search tracers it
 * takes an optional `log` of every string index the Python code reads.
 */
import { InputError, type Frame, type Role } from '../core/types';
import type { ScanCell, ScanRow, StringScanState } from '../renderers/StringScan';
import { cell, cellsRow, GAP, indexRow, listOf, matchStrip, quote } from './stringSearch';
import { parseKmp } from './kmp';

export interface ZInput {
  text: string[];
  pattern: string[];
}

export interface ZState extends StringScanState {
  /** Z values computed so far (0 where not yet known). */
  z: number[];
  matches: number[];
}

export const Z_SEPARATOR = '$';
export const Z_MAX_TEXT = 30;
export const Z_MAX_PATTERN = 10;

export function parseZ(input: string): ZInput {
  return parseKmp(input, { maxText: Z_MAX_TEXT, maxPattern: Z_MAX_PATTERN });
}

type Vars = Array<[string, string | number]>;

/**
 * @param s the string to analyse (for a search: pattern + "$" + text)
 * @param m pattern length when searching (the separator sits at index m), or null for a bare Z-array
 */
export function zTrace(s: string[], m: number | null, log?: number[]): Array<Frame<ZState>> {
  const n = s.length;
  const z: number[] = Array.from({ length: n }, () => 0);
  const known: boolean[] = Array.from({ length: n }, () => false);
  const matches: number[] = [];
  const frames: Array<Frame<ZState>> = [];
  let l = 0;
  let r = 0;
  let comparisons = 0;

  interface View {
    i?: number;
    /** s[z[i]] against s[i + z[i]]. */
    cmp?: { equal: boolean };
    /** The Z-box [l, r] to draw (omitted before the first box exists). */
    box?: boolean;
    /** z[i] is final. */
    settled?: boolean;
  }

  const snap = (line: number | undefined, caption: string, v: View, vars: Vars = []) => {
    const { i, cmp, box, settled } = v;
    const k0 = i !== undefined ? z[i] : 0;
    const sCells: ScanCell[] = s.map((ch, k) => {
      let role: Role | undefined;
      if (i !== undefined && cmp && k === i + k0) role = cmp.equal ? 'good' : 'bad';
      else if (i === k) role = 'active';
      else if (box && r > 0 && k >= l && k <= r) role = 'compare';
      else if (m !== null && k === m) role = 'muted';
      return cell(ch, role, i !== undefined && cmp !== undefined && k === i + k0);
    });
    const rows: ScanRow[] = [indexRow(n), cellsRow(m === null ? 'string' : 'pattern$text', sCells)];
    if (i !== undefined) {
      // The prefix of the string, drawn under position i: the Z value is how far it keeps agreeing.
      const shown = Math.min(n - i, cmp ? k0 + 1 : k0);
      const prefix = s.slice(0, Math.max(shown, 1)).map((ch, k) => {
        let role: Role | undefined;
        if (cmp && k === k0) role = cmp.equal ? 'good' : 'bad';
        return cell(ch, role, cmp !== undefined && k === k0);
      });
      rows.push(cellsRow('prefix', prefix, i, true));
    }
    const zCells = s.map((_, k) => {
      let role: Role | undefined;
      if (k === i) role = settled ? (m !== null && k > m && z[k] >= m ? 'done' : 'active') : 'active';
      else if (known[k] && m !== null && k > m && z[k] >= m) role = 'done';
      else if (known[k]) role = 'muted';
      return cell(k === 0 ? '-' : known[k] || k === i ? z[k] : null, role, k === i);
    });
    rows.push(GAP, cellsRow('Z', zCells));
    const strips = [
      { label: 'Z-box [l, r]', items: [{ text: r > 0 ? `[${l}, ${r}]` : 'empty', role: r > 0 ? ('compare' as Role) : undefined }] },
      ...(m !== null ? [matchStrip(matches)] : []),
    ];
    frames.push({
      line,
      caption,
      state: {
        label: 'Z-algorithm: the Z-array of the string, with the Z-box and the prefix being compared',
        rows,
        strips,
        z: z.slice(),
        matches: [...matches],
      },
      vars: [...vars, ['comparisons', comparisons]],
    });
  };

  if (n > 1) {
    snap(
      0,
      m === null
        ? `z[i] = length of the longest substring starting at i that is also a prefix of the string. z[0] is skipped. The Z-box [l, r] is the rightmost such prefix match found so far; it is empty at first.`
        : `Search by building the Z-array of pattern + "${Z_SEPARATOR}" + text (${n} characters; the separator at index ${m} is shaded). z[i] is how much of the string starting at i agrees with its own beginning, so z[i] >= ${m} means the pattern occurs at text position i - ${m + 1}. The Z-box [l, r] is the rightmost prefix match so far; it starts empty.`,
      {},
      [['l', 0], ['r', 0]],
    );
  }

  for (let i = 1; i < n; i++) {
    const insideBox = i <= r;
    if (insideBox) {
      z[i] = Math.min(r - i + 1, z[i - l]);
      snap(
        2,
        `i = ${i} lies inside the Z-box [${l}, ${r}], where the string repeats its own prefix. s[${i}..${r}] equals s[${i - l}..${r - l}], so z[${i}] starts at min(r - i + 1, z[${i - l}]) = min(${r - i + 1}, ${z[i - l]}) = ${z[i]} with no comparisons.`,
        { i, box: true },
        [['i', i], ['l', l], ['r', r], ['z[i]', z[i]]],
      );
    } else {
      snap(
        1,
        i === 1
          ? `i = 1 is outside the (empty) Z-box, so z[1] has to be found by comparing characters, starting from 0.`
          : `i = ${i} is to the right of the Z-box [${l}, ${r}], so nothing is known: compare characters from scratch, starting at z[${i}] = 0.`,
        { i, box: r > 0 },
        [['i', i], ['l', l], ['r', r], ['z[i]', 0]],
      );
    }
    // The extension loop.
    for (;;) {
      if (i + z[i] >= n) {
        snap(3, `i + z[${i}] = ${i + z[i]} reached the end of the string, so the match cannot grow further.`, { i, box: true }, [['i', i], ['z[i]', z[i]]]);
        break;
      }
      log?.push(z[i]);
      log?.push(i + z[i]);
      comparisons++;
      const equal = s[z[i]] === s[i + z[i]];
      const caption = equal
        ? `s[${z[i]}] = ${quote(s[z[i]])} equals s[${i + z[i]}] = ${quote(s[i + z[i]])}: the prefix match grows, z[${i}] becomes ${z[i] + 1}.`
        : `s[${z[i]}] = ${quote(s[z[i]])} differs from s[${i + z[i]}] = ${quote(s[i + z[i]])}: the match stops, z[${i}] = ${z[i]}.`;
      snap(3, caption, { i, cmp: { equal }, box: true }, [['i', i], ['z[i]', z[i]], ['l', l], ['r', r]]);
      if (!equal) break;
      z[i]++;
    }
    known[i] = true;
    if (i + z[i] - 1 > r) {
      l = i;
      r = i + z[i] - 1;
      snap(
        4,
        `i + z[i] - 1 = ${r} is past the old right end, so the Z-box becomes [${l}, ${r}]: the string now repeats its prefix up to ${r}, and later positions can reuse it.`,
        { i, box: true, settled: true },
        [['i', i], ['z[i]', z[i]], ['l', l], ['r', r]],
      );
    } else {
      snap(
        undefined,
        z[i] === 0
          ? `z[${i}] = 0: nothing here repeats the prefix, and the Z-box [${l}, ${r}] stays.`
          : `z[${i}] = ${z[i]}: s[${i}..${i + z[i] - 1}] repeats the prefix s[0..${z[i] - 1}] but ends at ${i + z[i] - 1} <= r = ${r}, so the Z-box [${l}, ${r}] stays.`,
        { i, box: true, settled: true },
        [['i', i], ['z[i]', z[i]], ['l', l], ['r', r]],
      );
    }
    if (m !== null && i > m && z[i] >= m) {
      matches.push(i - m - 1);
      snap(
        5,
        `z[${i}] = ${z[i]} >= m = ${m}: the pattern occurs at text position ${i} - ${m} - 1 = ${i - m - 1}. (Z can exceed m when the text or pattern itself contains "${Z_SEPARATOR}", which is why the test is ">=".)`,
        { i, box: true, settled: true },
        [['i', i], ['z[i]', z[i]]],
      );
    }
  }

  snap(
    undefined,
    m === null
      ? `Done: the Z-array is [${z.map((v, k) => (k === 0 ? '-' : v)).join(', ')}]. Every character was the right-hand side of a comparison at most once on a successful extension, so the work is O(n): ${comparisons} comparisons for ${n} characters.`
      : `Done: ${matches.length ? `the pattern occurs at ${listOf(matches)}` : 'no occurrence'} after ${comparisons} comparisons on a string of ${n} characters. Z values inside the Z-box were copied instead of re-compared, which makes the whole search O(n + m).`,
    {},
    [['matches', listOf(matches)]],
  );
  return frames;
}

/** Search trace: the Z-array of pattern + "$" + text, reporting every position with z >= m. */
export function zSearchTrace({ text, pattern }: ZInput, log?: number[]): Array<Frame<ZState>> {
  const m = pattern.length;
  if (m > text.length) {
    return [
      {
        line: 0,
        caption: `The pattern (${m} characters) is longer than the text (${text.length}): it cannot occur, so the search returns [] without building anything.`,
        state: {
          label: 'Z-algorithm: pattern longer than the text',
          rows: [indexRow(text.length), cellsRow('text', text.map((ch) => cell(ch)))],
          strips: [matchStrip([])],
          z: [],
          matches: [],
        },
        vars: [['m', m], ['n', text.length]],
      },
    ];
  }
  if (m === 0) throw new InputError('The pattern is empty.');
  return zTrace([...pattern, Z_SEPARATOR, ...text], m, log);
}
