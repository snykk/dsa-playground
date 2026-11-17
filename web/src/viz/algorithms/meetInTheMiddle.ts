/**
 * Meet in the middle tracer, drawn with PatternLanes: the numbers split into two halves, each
 * half's subset sums doubling one number at a time, the right sums gliding into sorted order,
 * then one bisect_right per left sum, with its interval shrinking, and each candidate pair lit.
 *
 * Mirrors Problem_Patterns/Meet_in_the_Middle/Python/meet_in_middle.py: closest_subset_sum
 * and get_subset_sums. Same checks in the same order (a negative number, then a negative target,
 * raise ValueError), the split at n // 2, the sums in generation order (left_sums is never
 * sorted), the stable sort of the right sums, CPython's bisect_right and max() keeping the
 * earlier total on a tie. Golden fixtures (__fixtures__/patternsMore.json, section "mitm") pin
 * both halves, the sorted right sums, every skipped or searched left sum and the result.
 *
 * Input: "5, 3, 2, 7, 10; target 14"
 */
import { InputError, type Frame, type Role } from '../core/types';
import type { LaneArrow, LaneBand, LaneCellView, LaneMarker, PatternLanesState } from '../renderers/PatternLanes';
import type { StripItem } from '../ui/molecules/Strip';
import { SYM } from '../ui/symbols';

export interface MitmInput {
  nums: number[];
  target: number;
}

/** Eight numbers give each half at most 16 sums, so both lanes stay readable. */
export const MITM_LIMITS = { maxNums: 8, maxValue: 999, minValue: -999, maxTarget: 9999, minTarget: -999 };

export function parseMitm(text: string): MitmInput {
  const m = text.match(/^(.*?)(?:[;,]?\s*(?:target|t)\s*[:=]?\s*(-?\d+))\s*$/i);
  if (!m) throw new InputError('Write the numbers, then the target: "5, 3, 2, 7, 10; target 14".');
  const target = Number(m[2]);
  if (target < MITM_LIMITS.minTarget || target > MITM_LIMITS.maxTarget) {
    throw new InputError(`The target goes from ${MITM_LIMITS.minTarget} to ${MITM_LIMITS.maxTarget} here (got ${m[2]}).`);
  }
  const tokens = m[1].split(/[\s,;]+/).filter(Boolean);
  if (tokens.length > MITM_LIMITS.maxNums) {
    throw new InputError(`At most ${MITM_LIMITS.maxNums} numbers, so each half has at most 16 subset sums on screen (got ${tokens.length}).`);
  }
  const nums = tokens.map((t) => {
    if (!/^-?\d+$/.test(t)) throw new InputError(`"${t}" is not a whole number.`);
    const v = Number(t) || 0;
    if (v < MITM_LIMITS.minValue || v > MITM_LIMITS.maxValue) throw new InputError(`Numbers go from ${MITM_LIMITS.minValue} to ${MITM_LIMITS.maxValue} here (got ${t}).`);
    return v;
  });
  return { nums, target };
}

export const MITM_CODE = [
  'closest_subset_sum(nums, target):',
  "  if any(x < 0 for x in nums): raise ValueError('nums must be non-negative')",
  "  if target < 0: raise ValueError('target must be non-negative')",
  '  n = len(nums); if n == 0: return 0',
  '  mid = n // 2; left_part = nums[:mid]; right_part = nums[mid:]',
  '  left_sums = get_subset_sums(left_part)',
  '  right_sums = get_subset_sums(right_part)',
  '  right_sums.sort(); max_sum = 0',
  '  for l_sum in left_sums:            # generation order, not sorted',
  '    if l_sum > target: continue',
  '    remaining = target - l_sum',
  '    idx = bisect.bisect_right(right_sums, remaining)   # first index whose sum > remaining',
  '    if idx > 0:',
  '      current_sum = l_sum + right_sums[idx - 1]; max_sum = max(max_sum, current_sum)',
  '  return max_sum',
  'get_subset_sums(arr): sums = [0]',
  '  for num in arr:',
  '    for i in range(len(sums)): sums.append(sums[i] + num)   # every old subset, now with num',
];

export interface MitmVisit {
  l: number;
  skip?: true;
  remaining?: number;
  idx?: number;
  total?: number;
}

export interface MitmRecord {
  left?: number[];
  right?: number[];
  sorted?: number[];
  visits?: MitmVisit[];
  result?: number;
  error?: string;
}

export interface MitmRun {
  frames: Array<Frame<PatternLanesState>>;
  record: MitmRecord;
}

/** Python's get_subset_sums: start from [0] and append sums[i] + num for every old sum. */
export function subsetSums(arr: number[]): number[] {
  const sums = [0];
  for (const num of arr) {
    const n = sums.length;
    for (let i = 0; i < n; i++) sums.push(sums[i] + num);
  }
  return sums;
}

/** CPython's bisect_right, step by step: the probes (lo, hi, mid) and the final index. */
export function bisectRight(a: number[], x: number): { idx: number; probes: Array<{ lo: number; hi: number; mid: number }> } {
  let lo = 0;
  let hi = a.length;
  const probes: Array<{ lo: number; hi: number; mid: number }> = [];
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    probes.push({ lo, hi, mid });
    if (x < a[mid]) hi = mid;
    else lo = mid + 1;
  }
  return { idx: lo, probes };
}

const list = (xs: number[]) => `[${xs.join(', ')}]`;

export function mitmTrace({ nums, target }: MitmInput): MitmRun {
  const frames: Array<Frame<PatternLanesState>> = [];
  const record: MitmRecord = {};
  const n = nums.length;
  const mid = n >> 1;
  const leftPart = nums.slice(0, mid);
  const rightPart = nums.slice(mid);
  // Sums as cells: an id per sum in generation order, so a sum keeps its id when sorted.
  const left: Array<{ id: string; v: number }> = [];
  let right: Array<{ id: string; v: number }> = [];
  let maxSum = 0;
  let best: { l: string; r: string; total: number; lv: number; rv: number } | null = null;
  let split = false;
  let failure: string | null = null;

  const snap = (
    line: number | undefined,
    caption: string,
    o: {
      nums?: Record<number, Role>;
      cells?: Record<string, Role>;
      ghosts?: Set<string>;
      arrows?: LaneArrow[];
      markers?: LaneMarker[];
      vars?: Array<[string, string | number]>;
    } = {},
  ) => {
    const cells: LaneCellView[] = nums.map((v, i) => ({ id: `n${i}`, lane: 0, col: i, text: String(v), role: o.nums?.[i] }));
    left.forEach((s, col) => cells.push({ id: s.id, lane: 1, col, text: String(s.v), role: o.cells?.[s.id], ghost: o.ghosts?.has(s.id) }));
    right.forEach((s, col) => cells.push({ id: s.id, lane: 2, col, text: String(s.v), role: o.cells?.[s.id], ghost: o.ghosts?.has(s.id) }));
    const bands: LaneBand[] = [];
    if (split && n > 0) {
      if (mid > 0) bands.push({ lane: 0, from: 0, to: mid - 1, role: 'compare', label: `left half (${mid})` });
      bands.push({ lane: 0, from: mid, to: n - 1, role: 'active', label: `right half (${n - mid})` });
    }
    const strip: StripItem[] = failure
      ? [{ text: `${SYM.cross} ${failure}`, role: 'bad' }]
      : best
        ? [{ text: `${best.total} = ${best.lv} + ${best.rv}`, role: 'done' }]
        : [{ text: '0 (empty subset)' }];
    frames.push({
      line,
      caption,
      vars: [['target', target], ...(o.vars ?? []), ['max_sum', maxSum]],
      state: {
        label: `nums ${list(nums)}, left sums ${list(left.map((s) => s.v))}, right sums ${list(right.map((s) => s.v))}, target ${target}`,
        lanes: [
          { label: 'nums', sub: !n ? 'empty' : split ? `mid = ${n} // 2 = ${mid}` : `n = ${n}` },
          { label: 'left_sums', sub: 'generation order' },
          { label: 'right_sums', sub: record.sorted ? 'sorted' : 'generation order' },
        ],
        cells,
        bands,
        arrows: o.arrows,
        markers: o.markers,
        strips: [{ label: failure ? 'raises' : 'max_sum', items: strip }],
      },
    });
  };

  snap(
    0,
    `closest_subset_sum(${list(nums)}, ${target}): the largest subset sum that does not exceed ${target}. ` +
      (n > 0 ? `Trying all 2^${n} = ${2 ** n} subsets directly is what meet in the middle avoids.` : 'The list is empty.'),
  );

  const negative = nums.findIndex((x) => x < 0);
  if (negative >= 0) {
    record.error = 'ValueError: nums must be non-negative';
    failure = 'ValueError';
    snap(
      1,
      `nums[${negative}] = ${nums[negative]} is negative, so closest_subset_sum raises ValueError('nums must be non-negative'). ` +
        'The search below skips every left sum above the target, which is only safe when no number can bring a sum back down.',
      { nums: { [negative]: 'bad' } },
    );
    return { frames, record };
  }
  if (target < 0) {
    record.error = 'ValueError: target must be non-negative';
    failure = 'ValueError';
    snap(2, `target = ${target} is negative: even the empty subset (sum 0) is above it, so no subset qualifies and the code raises ValueError('target must be non-negative').`, {
      vars: [['target < 0', 'True']],
    });
    return { frames, record };
  }
  if (n === 0) {
    record.result = 0;
    snap(3, 'nums is empty: the only subset is the empty one, so closest_subset_sum returns 0 without splitting anything.', { vars: [['result', 0]] });
    return { frames, record };
  }

  split = true;
  snap(
    4,
    `Split at mid = ${n} // 2 = ${mid}: left_part = ${list(leftPart)}, right_part = ${list(rightPart)}. ` +
      `Every subset of nums is one subset of the left half plus one of the right half, so 2^${mid} + 2^${n - mid} = ${2 ** mid + 2 ** (n - mid)} half-sums replace ${2 ** n} subsets.`,
    { vars: [['mid', mid]] },
  );

  // get_subset_sums for each half: the list doubles once per number.
  const build = (part: number[], into: Array<{ id: string; v: number }>, prefix: string, lane: string, line: number, offset: number) => {
    into.push({ id: `${prefix}0`, v: 0 });
    snap(line, `${lane} = get_subset_sums(${list(part)}): sums starts as [0], the empty subset.${part.length ? '' : ' The half is empty, so that is all.'}`, {
      cells: { [`${prefix}0`]: 'active' },
    });
    part.forEach((num, k) => {
      const count = into.length;
      const arrows: LaneArrow[] = [];
      const roles: Record<string, Role> = {};
      for (let i = 0; i < count; i++) {
        const id = `${prefix}${into.length}`;
        into.push({ id, v: into[i].v + num });
        roles[id] = 'active';
        roles[into[i].id] = 'compare';
        arrows.push({ from: into[i].id, to: id, role: 'active', label: i === 0 ? `+${num}` : undefined });
      }
      snap(
        17,
        (count === 1
          ? `num = ${num} (element ${offset + k} of nums): the only subset so far, the empty one, can skip it or take it, so sums[0] + ${num} = ${num} is appended.`
          : `num = ${num} (element ${offset + k} of nums): each of the ${count} subsets so far can skip it or take it, so sums[i] + ${num} is appended for i = 0..${count - 1}.`) +
          ` The list doubles to ${into.length}.`,
        { cells: roles, arrows, vars: [['num', num], ['len(sums)', into.length]] },
      );
    });
  };
  build(leftPart, left, 'L', 'left_sums', 5, 0);
  record.left = left.map((s) => s.v);
  build(rightPart, right, 'R', 'right_sums', 6, mid);
  record.right = right.map((s) => s.v);

  // right_sums.sort(): stable, so equal sums keep their generation order.
  right = right.map((s, i) => ({ s, i })).sort((a, b) => a.s.v - b.s.v || a.i - b.i).map(({ s }) => s);
  record.sorted = right.map((s) => s.v);
  snap(
    7,
    `right_sums.sort(): the ${right.length} right sums glide into increasing order, so a binary search can find the largest one that still fits. ` +
      'left_sums stays in generation order: it is only walked, never searched.',
    { cells: Object.fromEntries(right.map((s) => [s.id, 'compare' as Role])), vars: [['max_sum', 0]] },
  );

  const visits: MitmVisit[] = [];
  const sortedVals = right.map((s) => s.v);
  const skipped = new Set<string>();
  left.forEach((ls) => {
    const l = ls.v;
    if (l > target) {
      visits.push({ l, skip: true });
      skipped.add(ls.id);
      snap(9, `l_sum = ${l} > target ${target}: every right sum is at least 0, so no partner can bring the total down to ${target}. continue.`, {
        cells: { [ls.id]: 'bad' },
        ghosts: new Set(skipped),
        vars: [['l_sum', l]],
      });
      return;
    }
    const remaining = target - l;
    const { idx, probes } = bisectRight(sortedVals, remaining);
    snap(10, `l_sum = ${l}: remaining = ${target} - ${l} = ${remaining}. The best partner is the largest right sum <= ${remaining}; bisect_right searches all ${right.length} (lo = 0, hi = ${right.length}).`, {
      cells: { [ls.id]: 'active' },
      ghosts: new Set(skipped),
      vars: [['l_sum', l], ['remaining', remaining], ['lo', 0], ['hi', right.length]],
    });
    probes.forEach(({ lo, hi, mid: m }) => {
      const roles: Record<string, Role> = { [ls.id]: 'active' };
      const ghosts = new Set(skipped);
      right.forEach((s, j) => {
        if (j < lo || j >= hi) ghosts.add(s.id);
      });
      roles[right[m].id] = 'compare';
      const goLeft = remaining < sortedVals[m];
      snap(
        11,
        `Search right_sums[${lo}:${hi}]: mid = (${lo} + ${hi}) // 2 = ${m}, right_sums[${m}] = ${sortedVals[m]}. ` +
          (goLeft
            ? `${remaining} < ${sortedVals[m]}, so this sum and everything after it is too big: hi = ${m}.`
            : `${sortedVals[m]} <= ${remaining} fits, and so does everything before it: lo = ${m + 1}.`),
        {
          cells: roles,
          ghosts,
          // The open interval [lo, hi) is what is not faded; only mid needs a label.
          markers: [{ lane: 2, col: m, text: 'mid', role: 'active' }],
          vars: [['l_sum', l], ['remaining', remaining], ['lo', lo], ['hi', hi], ['mid', m]],
        },
      );
    });
    const visit: MitmVisit = { l, remaining, idx };
    if (idx > 0) {
      const partner = right[idx - 1];
      const total = l + partner.v;
      visit.total = total;
      const better = total > maxSum;
      const before = maxSum;
      maxSum = Math.max(maxSum, total);
      if (better) best = { l: ls.id, r: partner.id, total, lv: l, rv: partner.v };
      snap(
        13,
        `bisect_right returns idx = ${idx}, so right_sums[${idx - 1}] = ${partner.v} is the largest sum <= ${remaining}. ` +
          `current_sum = ${l} + ${partner.v} = ${total}` +
          (better ? ` beats max_sum ${before}: max_sum = ${total}.` : `, not above max_sum ${before}: max() keeps ${before}.`) +
          (total === target ? ' It hits the target exactly.' : ''),
        {
          cells: { [ls.id]: better ? 'good' : 'active', [partner.id]: better ? 'good' : 'compare' },
          ghosts: new Set(skipped),
          arrows: [{ from: ls.id, to: partner.id, role: better ? 'done' : 'compare', label: `= ${total}` }],
          markers: [{ lane: 2, col: idx - 1, text: 'idx-1', role: 'active' }],
          vars: [['l_sum', l], ['remaining', remaining], ['idx', idx], ['current_sum', total]],
        },
      );
    } else {
      snap(12, `bisect_right returns 0: no right sum is <= ${remaining}, so l_sum = ${l} has no partner.`, {
        cells: { [ls.id]: 'bad' },
        ghosts: new Set(skipped),
        vars: [['l_sum', l], ['idx', 0]],
      });
    }
    visits.push(visit);
  });
  record.visits = visits;
  record.result = maxSum;
  const pair = best as { l: string; r: string; total: number; lv: number; rv: number } | null;
  const final: Record<string, Role> = pair ? { [pair.l]: 'done', [pair.r]: 'done' } : {};
  const lval = pair ? left.find((s) => s.id === pair.l)!.v : 0;
  const rval = pair ? right.find((s) => s.id === pair.r)!.v : 0;
  snap(
    14,
    pair
      ? `Done: return ${maxSum}, from the left sum ${lval} plus the right sum ${rval}. ${left.length} lookups in ${right.length} sorted sums replaced ${2 ** n} subsets.`
      : `Done: return 0. No subset with a positive sum stays within ${target}, so the answer is the empty subset's 0.`,
    { cells: final, ghosts: new Set(skipped), arrows: pair ? [{ from: pair.l, to: pair.r, role: 'done', label: `= ${maxSum}` }] : [], vars: [['result', maxSum]] },
  );
  return { frames, record };
}
