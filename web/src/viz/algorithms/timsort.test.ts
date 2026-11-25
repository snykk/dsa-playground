import { describe, expect, it } from 'vitest';
import { InputError } from '../core/types';
import { parseTimsortInput } from '../specs/timsort';
import fixtures from './__fixtures__/sorting.json';
import { computeMinrun, invariantsHold, timsort, timsortSummary, VIZ_MINRUN, type TimsortInput } from './timsort';

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

/** Random inputs of the player's sizes: plain, with many duplicates, or made of sorted blocks. */
function randomCases(count: number, seed: number): TimsortInput[] {
  const rand = rng(seed);
  const out: TimsortInput[] = [];
  for (let t = 0; t < count; t++) {
    const n = 2 + Math.floor(rand() * 23);
    const kind = Math.floor(rand() * 3);
    let values = Array.from({ length: n }, () => (kind === 1 ? Math.floor(rand() * 4) : Math.floor(rand() * 1999) - 999));
    if (kind === 2) {
      const blocks: number[][] = [];
      for (let s = 0; s < n; s += 2 + Math.floor(rand() * 8)) blocks.push(values.slice(s, s + 2 + Math.floor(rand() * 8)));
      values = blocks.flatMap((b) => (rand() < 0.4 ? [...b].sort((x, y) => y - x) : [...b].sort((x, y) => x - y))).slice(0, n);
      while (values.length < n) values.push(0);
    }
    out.push({ values, minrun: [1, 2, 3, 4, 4, 4, 6, 8, 0][Math.floor(rand() * 9)] });
  }
  return out;
}

const stableOrder = (values: number[]) =>
  values
    .map((v, i) => [v, i])
    .sort((x, y) => x[0] - y[0] || x[1] - y[1])
    .map((p) => p[1]);

describe('timsort tracer against the Python implementation', () => {
  it('reproduces the runs, stacks, merges, galloping searches, comparisons and output order of every fixture', () => {
    const cases = fixtures.timsort;
    expect(cases.length).toBeGreaterThanOrEqual(60);
    expect(cases.some((c) => c.gallops > 0 && c.merges.some((m) => Number(m[4]) < 7))).toBe(true);
    for (const c of cases) {
      const got = timsortSummary({ values: c.input, minrun: c.minrun });
      expect(got.runs).toEqual(c.runs);
      expect(got.stacks).toEqual(c.stacks);
      expect(got.merges).toEqual(c.merges);
      expect(got.gallops).toBe(c.gallops);
      expect(got.comparisons).toBe(c.comparisons);
      expect(got.order).toEqual(c.order);
    }
  });

  it('computes minrun as compute_minrun does', () => {
    expect([0, 1, 63, 64, 65, 100, 1000, 2112, 1 << 20, 1000000].map(computeMinrun)).toEqual([0, 1, 63, 32, 33, 50, 63, 33, 32, 62]);
  });
});

describe('timsort frames', () => {
  it('keep every frame a permutation of the input and end sorted, stable and all done', () => {
    const bad: string[] = [];
    for (const input of randomCases(400, 7)) {
      const frames = timsort(input);
      const last = frames.at(-1)!.state;
      expect(last.items.map((x) => x.id)).toEqual(stableOrder(input.values));
      expect(last.roles.every((r) => r === 'done')).toBe(true);
      const n = input.values.length;
      for (const f of frames) {
        const ids = new Set(f.state.items.map((x) => x.id));
        const ok = ids.size === n && f.state.roles.length === n && f.state.items.every((it) => it.value === input.values[it.id]);
        if (!ok && bad.length < 3) bad.push(`${JSON.stringify(input)}: ${f.caption}`);
      }
    }
    expect(bad).toEqual([]);
  });

  it('makes n - 1 comparisons on sorted and strictly descending input', () => {
    for (let n = 2; n <= 24; n++) {
      for (const minrun of [0, 1, 4, 8]) {
        const up = Array.from({ length: n }, (_, i) => i);
        expect(timsortSummary({ values: up, minrun }).comparisons).toBe(n - 1);
        expect(timsortSummary({ values: [...up].reverse(), minrun }).comparisons).toBe(n - 1);
      }
    }
  });

  it('keeps the stack invariants after every collapse, and brackets that cover the runs', () => {
    const bad: string[] = [];
    for (const input of randomCases(400, 11)) {
      const log = timsortSummary(input);
      for (const s of log.stacks) if (!invariantsHold(s) && bad.length < 3) bad.push(JSON.stringify([input, s]));
      for (const f of timsort(input)) {
        const { marks, stack } = f.state;
        for (let k = 1; k < marks.length; k++) if (marks[k].lo < marks[k - 1].hi && bad.length < 3) bad.push(`overlap: ${f.caption}`);
        const stackMarks = marks.filter((m) => m.kind === 'stack');
        const notMerging = stack.filter((r) => !r.merging);
        if (stackMarks.length !== notMerging.length && bad.length < 3) bad.push(`marks: ${f.caption}`);
        stackMarks.forEach((m, k) => {
          if (m.hi - m.lo !== notMerging[k].length && bad.length < 3) bad.push(`bracket length: ${f.caption}`);
        });
      }
    }
    expect(bad).toEqual([]);
  });

  it('marks the values of the temporary copy only during a merge', () => {
    const frames = timsort({ values: [9, 15, 24, 31, 37, 43, 6, 12, 28, 40], minrun: 4 });
    const during = frames.filter((f) => f.state.tmp.length > 0);
    expect(during.length).toBeGreaterThan(0);
    for (const f of during) expect(f.state.marks.some((m) => m.kind === 'merge')).toBe(true);
    expect(frames.at(-1)!.state.tmp).toEqual([]);
  });

  it('shows galloping in the status and the caption', () => {
    const frames = timsort(parseTimsortInput('2, 3, 7, 10, 12, 14, 17, 22, 23, 57, 58, 5, 6, 26, 27, 33, 34, 35, 37, 45, 47, 49, 50, 54'));
    const galloping = frames.filter((f) => f.state.galloping);
    expect(galloping.length).toBeGreaterThan(0);
    for (const f of galloping) expect(f.caption).toMatch(/^Galloping|goes next/);
    expect(frames.some((f) => /switch to galloping/.test(f.caption))).toBe(true);
  });
});

describe('timsort captions', () => {
  it('state numbers that match the frame, with correct plurals, over 3,000 random inputs', () => {
    const bad: string[] = [];
    const check = (ok: boolean, c: string) => {
      if (!ok && bad.length < 6) bad.push(c);
    };
    const num = (s: string) => Number(s);
    const seen = { galloping: 0, leave: 0, hi: 0, lo: 0, insert: 0, reverse: 0 };
    for (const input of randomCases(3000, 2026)) {
      const frames = timsort(input);
      for (const f of frames) {
        const c = f.caption;
        const { items, stack } = f.state;
        const at = (i: number) => items[i].value;
        check(!/undefined|NaN|null|\[object|Infinity/.test(c), c);
        check(!/\b1 (comparisons|values|times|larger values)\b/.test(c), c);
        check(!/\b([02-9]|\d{2,}) (comparison|value|time|larger value shifts)\b/.test(c), c);
        // count_run: the two values compared are where the caption says, and the sign is right.
        for (const m of c.matchAll(/a\[(\d+)\] = (-?\d+) (<|>=) a\[(\d+)\] = (-?\d+)/g)) {
          const [, i, u, op, j, w] = m;
          check(at(num(i)) === num(u) && at(num(j)) === num(w), c);
          check(op === '<' ? num(u) < num(w) : num(u) >= num(w), c);
        }
        const search = /^Binary search for (-?\d+) in a\[\d+\.\.\d+\]: (-?\d+) (<|>=) a\[(\d+)\] = (-?\d+)/.exec(c);
        if (search) {
          const [, p, p2, op, mid, x] = search;
          check(p === p2 && at(num(mid)) === num(x), c);
          check(op === '<' ? num(p) < num(x) : num(p) >= num(x), c);
        }
        const insert = /^Insert (-?\d+) at index (\d+)/.exec(c);
        if (insert) check(at(num(insert[2])) === num(insert[1]), c);
        const goes = /(-?\d+) goes (?:to index|next, to index) (\d+)/.exec(c);
        if (goes) check(at(num(goes[2])) === num(goes[1]), c);
        for (const m of c.matchAll(/(-?\d+) (<|<=) A's (-?\d+)|A's (-?\d+) (<=) B's (-?\d+)|B's (-?\d+) (<) A's (-?\d+)/g)) {
          const nums = m.slice(1).filter((x) => x !== undefined);
          const [x, op, y] = nums;
          check(op === '<' ? num(x) < num(y) : num(x) <= num(y), c);
        }
        const sum = /A = (\d+) (<=|>) B \+ C = (\d+) \+ (\d+) = (\d+)/.exec(c);
        if (sum) {
          const [, a, op, b, cc, s] = sum.map(Number) as unknown as number[];
          check(num(String(b)) + num(String(cc)) === s && (sum[2] === '<=' ? a <= s : a > s), c);
          const letters = Object.fromEntries(stack.filter((r) => r.letter).map((r) => [r.letter, r.length]));
          check(letters.A === a && letters.B === b && letters.C === cc, c);
        }
        const pushed = /^Push the run a\[(\d+)\.\.(\d+)\] on the stack as R(\d+) \(length (\d+)\)/.exec(c);
        if (pushed) {
          const [, lo, hi, k, len] = pushed.map(Number);
          check(hi - lo + 1 === len && stack[k - 1]?.length === len && stack.length === k, c);
        }
        const merged = /one sorted run of length (\d+), R(\d+) on the stack/.exec(c);
        if (merged) check(stack[num(merged[2]) - 1]?.length === num(merged[1]), c);
        const tie = /(-?\d+) <= B's (-?\d+): .* On a tie/.exec(c);
        if (tie) check(tie[1] === tie[2], c);
        if (/<= B's/.test(c) && !/On a tie/.test(c)) check(!/A's (-?\d+) <= B's \1\b/.test(c), c);
        const block = /: (\d+) \(\d+ comparisons?\)\.( They move)?/.exec(c);
        if (block) check((num(block[1]) > 0) === (block[2] !== undefined), c);
      }
      frames.forEach((f, k) => {
        if (f.state.galloping) seen.galloping++;
        if (/leave galloping/.test(f.caption)) seen.leave++;
        if (/^merge_hi/.test(f.caption)) seen.hi++;
        if (/^merge_lo/.test(f.caption)) seen.lo++;
        if (/^Insert/.test(f.caption)) seen.insert++;
        if (/^Reverse/.test(f.caption)) seen.reverse++;
        if (/switch to galloping/.test(f.caption)) check(frames[k + 1]?.state.galloping === true, f.caption);
        const leave = /min_gallop goes up to (\d+)/.exec(f.caption);
        if (leave) check(frames[k + 1]?.state.minGallop === num(leave[1]) && !frames[k + 1].state.galloping, f.caption);
        if (f.state.galloping) check(/^Galloping|goes next/.test(f.caption), f.caption);
      });
      const end = frames.at(-1)!;
      const vars = Object.fromEntries(end.vars ?? []);
      if (input.values.length >= 2) check(end.caption.startsWith(`Sorted with ${vars.comparisons} comparison`), end.caption);
    }
    expect(bad).toEqual([]);
    for (const [what, count] of Object.entries(seen)) expect(count, what).toBeGreaterThan(20);
  });
});

describe('timsort input', () => {
  it('reads an optional minrun before the list', () => {
    expect(parseTimsortInput('5, 3 8')).toEqual({ values: [5, 3, 8], minrun: VIZ_MINRUN });
    expect(parseTimsortInput(' minrun 8: 5 3 8')).toEqual({ values: [5, 3, 8], minrun: 8 });
    expect(parseTimsortInput('MinRun=2:5,3')).toEqual({ values: [5, 3], minrun: 2 });
    expect(() => parseTimsortInput('minrun 0: 5, 3')).toThrow(InputError);
    expect(() => parseTimsortInput('minrun 33: 5, 3')).toThrow(InputError);
    expect(() => parseTimsortInput('gallop: 5, 3')).toThrow(InputError);
    expect(() => parseTimsortInput('minrun 4: 5')).toThrow(InputError);
  });
});
