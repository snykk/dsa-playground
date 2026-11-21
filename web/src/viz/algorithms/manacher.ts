/**
 * Manacher tracer, drawn with StringScan: the transformed string, the radius array p, the
 * palindrome that reaches furthest right (center, right), the mirror of i, and the mirror's
 * palindrome sliding across the center when p[i] starts from it.
 *
 * Mirrors Algorithms/String_Algorithms/Advanced_String/Longest_Palindromic_Substring_Manachers/
 * Python/manacher.py, manacher(s): an empty s returns ("", 0, 0); otherwise
 * transformed = "#" + "#".join(s) + "#" (no sentinels), and for every i: mirror = 2 * center - i;
 * if i < right, p[i] = min(right - i, p[mirror]); expand while both ends are inside the string
 * and transformed[i + p[i] + 1] == transformed[i - p[i] - 1]; if i + p[i] > right, center = i
 * and right = i + p[i]. The answer is the first index with the largest p (strict >), start
 * (center_index - max_len) // 2 and length max_len: (s[start:start + max_len], start, max_len).
 * Characters are code points, as in Python. Golden fixtures (__fixtures__/advancedStrings.json,
 * section manacher) pin the transformed string, every p[i], (center, right) at the start of
 * every iteration, and the tuple.
 *
 * Input: the string, e.g. "babad" ("" is the empty string)
 */
import { InputError, type Frame, type Role } from '../core/types';
import type { ScanCell, ScanRow, StringScanState } from '../renderers/StringScan';
import { cell, cellsRow, GAP, indexRow } from './stringSearch';

export const MANACHER_MAX = 15;

export interface ManacherInput {
  s: string[];
}

export function parseManacher(text: string): ManacherInput {
  const t = text.trim();
  if (t === '""' || t === "''") return { s: [] };
  if (!t) throw new InputError('Type a string, for example "babad", or "" for the empty string.');
  const s = Array.from(t);
  if (s.length > MANACHER_MAX) throw new InputError(`Keep the string to ${MANACHER_MAX} characters: the transformed string has 2n + 1 cells (got ${s.length}).`);
  return { s };
}

export const MANACHER_CODE = [
  'if not s: return "", 0, 0',
  'transformed = "#" + "#".join(s) + "#"; n = len(transformed)',
  'p = [0] * n; center = 0; right = 0',
  'for i in range(n):',
  '  mirror = 2 * center - i',
  '  if i < right: p[i] = min(right - i, p[mirror])',
  '  while (i - p[i] - 1 >= 0 and i + p[i] + 1 < n',
  '         and transformed[i + p[i] + 1] == transformed[i - p[i] - 1]): p[i] += 1',
  '  if i + p[i] > right: center = i; right = i + p[i]',
  'max_len, center_index = the first largest p[i] (strict >)',
  'start = (center_index - max_len) // 2',
  'return s[start:start + max_len], start, max_len',
];

export interface ManacherState extends StringScanState {
  p: number[];
  center: number;
  right: number;
}

export type ManacherResult = [string, number, number];

export interface ManacherRun {
  frames: Array<Frame<ManacherState>>;
  transformed: string[];
  p: number[];
  /** [center, right] when each iteration starts. */
  starts: Array<[number, number]>;
  result: ManacherResult;
  /** Character comparisons made by the expansion loop. */
  comparisons: number;
}

type Vars = Array<[string, string | number]>;

const q = (ch: string) => `'${ch}'`;

interface View {
  i?: number;
  /** The two ends being compared and whether they are equal. */
  cmp?: { lo: number; hi: number; equal: boolean };
  /** The mirror's palindrome, drawn around `at` (the mirror, then i). */
  copy?: { from: number; radius: number; at: number; slide: boolean; fixed?: boolean };
  mirror?: number;
  /** p cells that are being read (the mirror's radius). */
  readP?: number;
  /** The final answer: the palindrome around center_index. */
  answer?: { center: number; radius: number };
}

export function manacherTrace({ s }: ManacherInput): ManacherRun {
  const frames: Array<Frame<ManacherState>> = [];
  if (s.length === 0) {
    frames.push({
      line: 0,
      caption: 's is empty, so manacher returns ("", 0, 0) at once: there is no string to transform.',
      state: { label: "Manacher's algorithm on the empty string", rows: [indexRow(0)], p: [], center: 0, right: 0 },
    });
    return { frames, transformed: [], p: [], starts: [], result: ['', 0, 0], comparisons: 0 };
  }

  const t: string[] = ['#'];
  for (const ch of s) t.push(ch, '#');
  const n = t.length;
  const p: number[] = Array.from({ length: n }, () => 0);
  const known: boolean[] = Array.from({ length: n }, () => false);
  const starts: Array<[number, number]> = [];
  let center = 0;
  let right = 0;
  let comparisons = 0;

  const snap = (line: number | undefined, caption: string, v: View = {}, vars: Vars = []) => {
    const { i, cmp, copy, mirror, answer } = v;
    const inWindow = (k: number) => right > 0 && k >= 2 * center - right && k <= right;
    const inAnswer = (k: number) => answer !== undefined && k >= answer.center - answer.radius && k <= answer.center + answer.radius;
    const sCells: ScanCell[] = t.map((_, k) =>
      k % 2 === 1 ? cell(s[(k - 1) / 2], inAnswer(k) ? 'done' : undefined) : { value: null, blank: true },
    );
    const tCells: ScanCell[] = t.map((ch, k) => {
      let role: Role | undefined;
      if (answer) role = inAnswer(k) ? 'done' : undefined;
      else if (cmp && (k === cmp.lo || k === cmp.hi)) role = cmp.equal ? 'good' : 'bad';
      else if (k === i) role = 'active';
      else if (inWindow(k)) role = 'compare';
      return cell(ch, role, cmp !== undefined && (k === cmp.lo || k === cmp.hi));
    });
    const copyCells: ScanCell[] = copy ? t.slice(copy.from - copy.radius, copy.from + copy.radius + 1).map((ch) => cell(ch, 'compare')) : [];
    const pCells: ScanCell[] = p.map((v2, k) => {
      let role: Role | undefined;
      if (answer) role = k === answer.center ? 'done' : undefined;
      else if (k === i) role = 'active';
      else if (k === v.readP) role = 'compare';
      return cell(known[k] || k === i ? v2 : null, role, k === v.readP);
    });
    const crCells: ScanCell[] = t.map((_, k) => {
      if (right > 0 && k === center) return cell('C', 'compare');
      if (right > 0 && k === right) return cell('R', 'compare');
      return { value: null, blank: true };
    });
    const imCells: ScanCell[] = t.map((_, k) => {
      if (k === i && !answer) return cell('i', 'active');
      if (mirror !== undefined && k === mirror) return cell("i'", 'compare', true);
      return { value: null, blank: true };
    });
    const rows: ScanRow[] = [
      indexRow(n),
      cellsRow('s', sCells),
      cellsRow('s with #', tCells),
      copy ? cellsRow('mirror copy', copyCells, copy.at - copy.radius, copy.slide && !copy.fixed) : cellsRow('mirror copy', []),
      cellsRow('p (radius)', pCells),
      GAP,
      cellsRow('center, right', crCells),
      cellsRow('i, mirror', imCells),
    ];
    frames.push({
      line,
      caption,
      vars: [...vars, ['center', center], ['right', right], ['comparisons', comparisons]],
      state: {
        label: "Manacher's algorithm: the transformed string, the radius array p, the rightmost palindrome (center, right) and the mirror of i",
        rows,
        p: p.slice(),
        center,
        right,
      },
    });
  };

  snap(
    1,
    `transformed = "#" + "#".join(s) + "#" = "${t.join('')}" (${n} characters). s[k] sits at index 2k + 1, and every palindrome, even or odd, now has one center cell. ` +
      'p[i] will be the radius of the longest palindrome centered at i, which is also its length in s.',
  );
  snap(2, 'p = [0] * n, center = right = 0: no palindrome is known yet. (center, right) will be the palindrome that reaches furthest right; empty p cells are not reached yet.');

  for (let i = 0; i < n; i++) {
    starts.push([center, right]);
    const mirror = 2 * center - i;
    const base = (): Vars => [['i', i], ['p[i]', p[i]]];
    let fromMirror: { value: number; clipped: boolean } | null = null;
    if (i < right) {
      const radius = Math.min(right - i, p[mirror]);
      snap(
        4,
        `i = ${i} is inside the palindrome around center = ${center}, which reaches right = ${right}. Its mirror is 2 * ${center} - ${i} = ${mirror}, where p[${mirror}] = ${p[mirror]}. ` +
          'Inside that palindrome both sides read the same, so whatever is around the mirror is also around i.',
        { i, mirror, readP: mirror, copy: { from: mirror, radius, at: mirror, slide: true } },
        [...base(), ['mirror', mirror]],
      );
      p[i] = radius;
      known[i] = true;
      fromMirror = { value: radius, clipped: p[mirror] > right - i };
      snap(
        5,
        `p[${i}] = min(right - i, p[mirror]) = min(${right - i}, ${p[mirror]}) = ${radius}, copied across the center without a comparison.` +
          (p[mirror] > right - i
            ? ` Only ${right - i} of the mirror's radius ${p[mirror]} is known to hold at i: beyond right = ${right} no comparison has matched yet.`
            : p[mirror] < right - i
              ? ' The mirror\'s palindrome ends strictly inside the boundary, so this is already the exact radius.'
              : ' It reaches the boundary exactly, so the next comparison goes past right.'),
        { i, mirror, readP: mirror, copy: { from: mirror, radius, at: i, slide: true } },
        [...base(), ['mirror', mirror]],
      );
    } else {
      known[i] = true;
      snap(
        5,
        i === 0
          ? 'i = 0: right = 0, so no palindrome covers i and nothing can be copied. p[0] starts at 0 and must be found by comparing.'
          : `i = ${i} is not inside the rightmost palindrome (i >= right = ${right}), so nothing can be copied from a mirror: p[${i}] starts at 0 and must be found by comparing.`,
        { i },
        base(),
      );
    }
    const keep = fromMirror ? { from: mirror, radius: fromMirror.value, at: i, slide: false, fixed: true } : undefined;
    const tail = () => {
      if (i + p[i] > right) return '';
      return ` i + p[i] = ${i + p[i]} does not pass right = ${right}, so center and right stay.`;
    };
    for (;;) {
      const lo = i - p[i] - 1;
      const hi = i + p[i] + 1;
      if (lo < 0 || hi >= n) {
        snap(
          6,
          `${lo < 0 ? `i - p[i] - 1 = ${lo} is before the start` : `i + p[i] + 1 = ${hi} is past the end`} of the transformed string: the palindrome around ${i} touches the edge and cannot grow. p[${i}] = ${p[i]}.` +
            tail(),
          { i, copy: keep },
          base(),
        );
        break;
      }
      comparisons++;
      const equal = t[hi] === t[lo];
      if (!equal) {
        snap(
          6,
          `transformed[${hi}] = ${q(t[hi])} differs from transformed[${lo}] = ${q(t[lo])}: the palindrome around ${i} stops at radius ${p[i]}.` +
            (fromMirror && !fromMirror.clipped && p[i] === fromMirror.value && p[i] < right - i
              ? ' This was certain: the mirror\'s palindrome stopped strictly inside, so the same pair differs here.'
              : '') +
            tail(),
          { i, cmp: { lo, hi, equal }, copy: keep },
          base(),
        );
        break;
      }
      p[i] += 1;
      snap(
        7,
        `transformed[${hi}] = ${q(t[hi])} equals transformed[${lo}] = ${q(t[lo])}: the palindrome around ${i} grows to radius ${p[i]}.` +
          (hi > right ? ` Index ${hi} lies past right = ${right}, outside every palindrome found so far: this match is new ground.` : ''),
        { i, cmp: { lo, hi, equal }, copy: keep },
        base(),
      );
    }
    if (i + p[i] > right) {
      const old = right;
      center = i;
      right = i + p[i];
      snap(
        8,
        `i + p[i] = ${i} + ${p[i]} = ${right} > right = ${old}: this palindrome reaches further right, so center = ${i} and right = ${right}. Later indices up to ${right} can start from their mirror.`,
        { i },
        base(),
      );
    }
  }

  let maxLen = 0;
  let centerIndex = 0;
  for (let i = 0; i < n; i++) {
    if (p[i] > maxLen) {
      maxLen = p[i];
      centerIndex = i;
    }
  }
  const start = Math.floor((centerIndex - maxLen) / 2);
  const sub = s.slice(start, start + maxLen).join('');
  const ties = p.filter((v) => v === maxLen).length;
  snap(
    9,
    `p is complete. The largest radius is ${maxLen}, first reached at index ${centerIndex}` +
      (ties > 1 ? ` (${ties} indices reach it; only a strictly larger one replaces the best, so the first wins)` : '') +
      `: center_index = ${centerIndex}, max_len = ${maxLen}.`,
    { answer: { center: centerIndex, radius: maxLen } },
    [['max_len', maxLen], ['center_index', centerIndex]],
  );
  snap(
    11,
    `start = (${centerIndex} - ${maxLen}) // 2 = ${start}: the palindrome '${sub}' starts at ${start} in s and has length ${maxLen}, its radius in the transformed string. manacher returns ('${sub}', ${start}, ${maxLen}) after ${comparisons} character comparisons for ${n} centers.`,
    { answer: { center: centerIndex, radius: maxLen } },
    [['start', start], ['max_len', maxLen]],
  );
  return { frames, transformed: t, p, starts, result: [sub, start, maxLen], comparisons };
}
