/**
 * Longest common substring tracer, drawn with Grid (the dp table fills cell by cell).
 *
 * Mirrors Algorithms/String_Algorithms/Advanced_String/Longest_Common_Substring/Python/
 * longest_common_substring.py, longest_common_substring(s1, s2): dp is (m + 1) x (n + 1) zeros;
 * for i in 1..m, j in 1..n (row by row), equal characters extend the diagonal run,
 * dp[i][j] = dp[i - 1][j - 1] + 1, and a mismatch resets the cell to 0. Only a strictly longer
 * run replaces the best (max_len, end_i, end_j), so among equal lengths the one that ends first
 * in s1 wins, and on the same row the one that ends first in s2. With max_len 0 it returns
 * ("", 0, 0, 0); otherwise (s1[end_i - max_len:end_i], max_len, end_i - max_len, end_j - max_len),
 * start indices in both strings. Strings are compared by code point, as Python does.
 * Golden fixtures (__fixtures__/advancedStrings.json, section lcs) pin every dp cell and the tuple.
 *
 * Input: "ABABC | BABCA"   (either side may be empty)
 */
import { InputError, type Frame, type Role } from '../core/types';
import type { GridState } from '../renderers/Grid';
import type { StripData } from '../ui/molecules/Strip';
import { SYM } from '../ui/symbols';

export interface LcsubInput {
  s1: string[];
  s2: string[];
}

export const LCSUB_MAX = 12;

/** Parse "ABABC | BABCA": two strings separated by "|", each up to 12 characters (spaces at the ends are trimmed). */
export function parseLcsub(text: string): LcsubInput {
  const parts = text.split('|');
  if (parts.length !== 2) throw new InputError('Write two strings separated by one "|", e.g. "ABABC | BABCA". Either side may be empty.');
  const [s1, s2] = parts.map((p) => Array.from(p.trim()));
  for (const [name, s] of [['s1', s1], ['s2', s2]] as const) {
    if (s.length > LCSUB_MAX) throw new InputError(`Keep ${name} to ${LCSUB_MAX} characters, so the table fits on screen (got ${s.length}).`);
  }
  return { s1, s2 };
}

export const LCSUB_CODE = [
  'm, n = len(s1), len(s2); dp = [[0] * (n + 1) for _ in range(m + 1)]',
  'max_len = 0; end_i, end_j = 0, 0',
  'for i in range(1, m + 1):',
  '  for j in range(1, n + 1):',
  '    if s1[i - 1] == s2[j - 1]:',
  '      dp[i][j] = dp[i - 1][j - 1] + 1',
  '      if dp[i][j] > max_len: max_len = dp[i][j]; end_i = i; end_j = j',
  '    else: dp[i][j] = 0',
  'if max_len == 0: return "", 0, 0, 0',
  'return s1[end_i - max_len:end_i], max_len, end_i - max_len, end_j - max_len',
];

export type LcsubResult = [string, number, number, number];

export interface LcsubRun {
  frames: Array<Frame<GridState>>;
  dp: number[][];
  result: LcsubResult;
}

type Vars = Array<[string, string | number]>;

const q = (ch: string) => (ch === ' ' ? "' '" : `'${ch}'`);
const show = (ch: string) => (ch === ' ' ? SYM.openBox : ch);

export function lcsubTrace({ s1, s2 }: LcsubInput): LcsubRun {
  const m = s1.length;
  const n = s2.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array.from({ length: n + 1 }, () => 0));
  /** Cells the loops have visited (row 0 and column 0 are never written, but they are the zeros the diagonal reads). */
  const seen: boolean[][] = Array.from({ length: m + 1 }, (_, i) => Array.from({ length: n + 1 }, (_, j) => i === 0 || j === 0));
  const frames: Array<Frame<GridState>> = [];
  let maxLen = 0;
  let endI = 0;
  let endJ = 0;

  /** The cells of the best run so far: the diagonal that ends at (end_i, end_j). */
  const bestRun = (): Record<string, Role> => {
    const r: Record<string, Role> = {};
    for (let k = 0; k < maxLen; k++) r[`${endI - k},${endJ - k}`] = 'done';
    return r;
  };
  const strips = (ci: number, cj: number): StripData[] => [
    { label: 's1', items: s1.map((ch, k) => ({ text: show(ch), role: k === ci ? 'active' : maxLen > 0 && k >= endI - maxLen && k < endI ? 'done' : undefined })) },
    { label: 's2', items: s2.map((ch, k) => ({ text: show(ch), role: k === cj ? 'active' : maxLen > 0 && k >= endJ - maxLen && k < endJ ? 'done' : undefined })) },
  ];
  const push = (line: number | undefined, caption: string, roles: Record<string, Role>, ci = -1, cj = -1, vars: Vars = []) => {
    frames.push({
      line,
      caption,
      vars: [...vars, ['max_len', maxLen], ['end_i', endI], ['end_j', endJ]],
      state: {
        corner: 's1 \\ s2',
        rowHeaders: [SYM.emptySet, ...s1.map(show)],
        colHeaders: [SYM.emptySet, ...s2.map(show)],
        cells: dp.map((row, i) => row.map((v, j) => (seen[i][j] ? v : null))),
        roles,
        strips: m || n ? strips(ci, cj) : undefined,
      },
    });
  };

  push(
    0,
    `dp[i][j] is the length of the longest common run that ends exactly at s1[i - 1] and s2[j - 1]. The table has ${m + 1} rows and ${n + 1} columns of zeros; ` +
      'row 0 and column 0 stay 0 because an empty prefix has no run. A blank cell is one the loops have not reached yet.',
    {},
    -1,
    -1,
    [['m', m], ['n', n]],
  );

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      seen[i][j] = true;
      const a = s1[i - 1];
      const b = s2[j - 1];
      const vars: Vars = [['i', i], ['j', j], ['s1[i-1]', q(a)], ['s2[j-1]', q(b)]];
      if (a === b) {
        const diag = dp[i - 1][j - 1];
        dp[i][j] = diag + 1;
        const v = dp[i][j];
        const better = v > maxLen;
        push(
          5,
          `s1[${i - 1}] = ${q(a)} equals s2[${j - 1}] = ${q(b)}: the run that ended one step back on the diagonal, dp[${i - 1}][${j - 1}] = ${diag}, grows by one, so dp[${i}][${j}] = ${v}.` +
            (better ? ` That beats max_len = ${maxLen}.` : v === maxLen ? ` That only ties max_len = ${maxLen}; a tie does not replace the best, so the earlier run stays.` : ` max_len = ${maxLen} stays.`),
          { ...bestRun(), [`${i - 1},${j - 1}`]: 'compare', [`${i},${j}`]: 'active' },
          i - 1,
          j - 1,
          vars,
        );
        if (better) {
          maxLen = v;
          endI = i;
          endJ = j;
          push(
            6,
            `New best: max_len = ${v}, end_i = ${i}, end_j = ${j}. The run is s1[${i - v}:${i}] = '${s1.slice(i - v, i).join('')}', the ${v} cell${v === 1 ? '' : 's'} on the diagonal ending here.`,
            bestRun(),
            -1,
            -1,
            vars,
          );
        }
      } else {
        dp[i][j] = 0;
        push(
          7,
          `s1[${i - 1}] = ${q(a)} differs from s2[${j - 1}] = ${q(b)}: a substring cannot skip a character, so no common run ends at this pair and dp[${i}][${j}] = 0.`,
          { ...bestRun(), [`${i},${j}`]: 'active' },
          i - 1,
          j - 1,
          vars,
        );
      }
    }
  }

  let result: LcsubResult;
  if (maxLen === 0) {
    result = ['', 0, 0, 0];
    push(
      8,
      m === 0 || n === 0
        ? `${m === 0 ? 's1' : 's2'} is empty, so the loops never run: max_len is 0 and the function returns ('', 0, 0, 0).`
        : 'No character of s1 occurs in s2, so every cell is 0: max_len is 0 and the function returns (\'\', 0, 0, 0).',
      {},
    );
  } else {
    const sub = s1.slice(endI - maxLen, endI).join('');
    result = [sub, maxLen, endI - maxLen, endJ - maxLen];
    push(
      9,
      `The table is full. The longest run has length ${maxLen} and ends at s1[${endI - 1}] and s2[${endJ - 1}], so it starts at ${endI - maxLen} in s1 and at ${endJ - maxLen} in s2: ` +
        `the function returns ('${sub}', ${maxLen}, ${endI - maxLen}, ${endJ - maxLen}). The answer is the largest cell anywhere, not dp[${m}][${n}].`,
      bestRun(),
      -1,
      -1,
      [['substring', `'${sub}'`]],
    );
  }
  return { frames, dp, result };
}
