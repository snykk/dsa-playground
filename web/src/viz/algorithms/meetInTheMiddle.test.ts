import { describe, expect, it } from 'vitest';
import { InputError } from '../core/types';
import { stabilizeLanes } from '../renderers/PatternLanes';
import { bisectRight, MITM_CODE, mitmTrace, parseMitm, subsetSums, type MitmRecord } from './meetInTheMiddle';
import { expectLanesWellFormed, FIXTURES, rng } from './patternsMoreTestKit';

/** Brute force: the largest sum over all 2^n subsets that does not exceed the target. */
function bruteForce(nums: number[], target: number): number {
  let best = -1;
  for (let mask = 0; mask < 1 << nums.length; mask++) {
    let s = 0;
    nums.forEach((v, i) => {
      if (mask & (1 << i)) s += v;
    });
    if (s <= target) best = Math.max(best, s);
  }
  return best;
}

const sortedCopy = (xs: number[]) => [...xs].sort((a, b) => a - b);

describe('meet in the middle helpers', () => {
  it('get_subset_sums doubles the list once per number, in generation order', () => {
    expect(subsetSums([])).toEqual([0]);
    expect(subsetSums([5, 3])).toEqual([0, 5, 3, 8]);
    expect(subsetSums([2, 7, 10])).toEqual([0, 2, 7, 9, 10, 12, 17, 19]);
  });

  it('bisect_right returns the first index whose value is above x, like Python', () => {
    const a = [0, 2, 7, 7, 9];
    expect(bisectRight(a, -1).idx).toBe(0);
    expect(bisectRight(a, 7).idx).toBe(4);
    expect(bisectRight(a, 8).idx).toBe(4);
    expect(bisectRight(a, 100).idx).toBe(5);
    expect(bisectRight([], 3).idx).toBe(0);
  });
});

describe('mitmTrace', () => {
  it('reproduces closest_subset_sum on every golden case: halves, sorted sums, each search, the result', () => {
    const cases = FIXTURES.mitm as Array<MitmRecord & { nums: number[]; target: number }>;
    expect(cases.length).toBeGreaterThanOrEqual(90);
    for (const c of cases) {
      const { record } = mitmTrace({ nums: c.nums, target: c.target });
      const label = JSON.stringify([c.nums, c.target]);
      expect(record.error, label).toBe(c.error);
      expect(record.result, label).toBe(c.result);
      expect(record.left, label).toEqual(c.left);
      expect(record.right, label).toEqual(c.right);
      expect(record.sorted, label).toEqual(c.sorted);
      expect(record.visits, label).toEqual(c.visits);
    }
  });

  it('agrees with a brute force over all subsets on random inputs', () => {
    const r = rng(41);
    for (let t = 0; t < 300; t++) {
      const nums = Array.from({ length: r.int(0, 8) }, () => r.int(0, r.pick([9, 40, 999])));
      const target = r.int(0, nums.reduce((a, b) => a + b, 0) + 5);
      const run = mitmTrace({ nums, target });
      expect(run.record.result).toBe(bruteForce(nums, target));
      if (nums.length) {
        const mid = nums.length >> 1;
        expect(sortedCopy(run.record.left!)).toEqual(sortedCopy(subsetSums(nums.slice(0, mid))));
        expect(run.record.sorted).toEqual(sortedCopy(run.record.right!));
        expect(run.record.left!.length).toBe(2 ** mid);
        // Every searched left sum got the largest right sum <= remaining.
        for (const v of run.record.visits!) {
          if (v.skip) expect(v.l).toBeGreaterThan(target);
          else expect(v.total).toBe(v.l + Math.max(...run.record.sorted!.filter((x) => x <= v.remaining!)));
        }
      }
      expectLanesWellFormed(stabilizeLanes(run.frames), MITM_CODE.length);
    }
  });

  it('raises ValueError for a negative number before a negative target, and returns 0 for no numbers', () => {
    expect(mitmTrace({ nums: [3, -1, 2], target: -4 }).record.error).toBe('ValueError: nums must be non-negative');
    expect(mitmTrace({ nums: [1, 2, 3], target: -1 }).record.error).toBe('ValueError: target must be non-negative');
    const bad = mitmTrace({ nums: [3, -1, 2], target: 4 }).frames.at(-1)!;
    expect(bad.state.cells.find((c) => c.id === 'n1')!.role).toBe('bad');
    expect(bad.caption).toContain('ValueError');
    expect(mitmTrace({ nums: [], target: 10 }).record.result).toBe(0);
  });

  it('lights the first pair that reaches the best total (max keeps the earlier one on a tie)', () => {
    const run = mitmTrace(parseMitm('5, 3, 2, 7, 10; target 14'));
    expect(run.record.result).toBe(14);
    const last = run.frames.at(-1)!.state;
    const lit = last.cells.filter((c) => c.role === 'done').map((c) => c.text);
    expect(lit).toEqual(['5', '9']);
    // The right sums glide: the sorted frame keeps every sum's id.
    const sortedFrame = run.frames.find((f) => f.caption.startsWith('right_sums.sort()'))!;
    expect(sortedFrame.state.cells.filter((c) => c.lane === 2).map((c) => c.text)).toEqual(['0', '2', '7', '9', '10', '12', '17', '19']);
  });

  it('stays well under 2000 frames on the largest input', () => {
    const run = mitmTrace(parseMitm('999, 998, 997, 996, 995, 994, 993, 992; target 9999'));
    expect(run.frames.length).toBeLessThan(400);
  });
});

describe('parseMitm', () => {
  it('reads numbers and a target', () => {
    expect(parseMitm('5, 3, 2; target 7')).toEqual({ nums: [5, 3, 2], target: 7 });
    expect(parseMitm('5 3 2 t=7')).toEqual({ nums: [5, 3, 2], target: 7 });
    expect(parseMitm('target 10')).toEqual({ nums: [], target: 10 });
    expect(parseMitm('3, -1; target -2')).toEqual({ nums: [3, -1], target: -2 });
  });

  it('gives friendly errors', () => {
    expect(() => parseMitm('1, 2, 3')).toThrow(InputError);
    expect(() => parseMitm('1, 2, x; target 3')).toThrow(/whole number/);
    expect(() => parseMitm('1, 2, 3, 4, 5, 6, 7, 8, 9; target 3')).toThrow(/At most 8/);
    expect(() => parseMitm('1000; target 3')).toThrow(/-999 to 999/);
    expect(() => parseMitm('1; target 10000')).toThrow(/9999/);
  });
});
