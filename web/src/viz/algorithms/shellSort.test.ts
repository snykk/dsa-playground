import { describe, expect, it } from 'vitest';
import { InputError } from '../core/types';
import { parseShellSortInput } from '../specs/shellSort';
import fixtures from './__fixtures__/sorting.json';
import { ciuraGaps, gapSequence, knuthGaps, ordinal, SEQUENCE_NAMES, shellGaps, shellSort, shellSortSummary, type GapSequenceName } from './shellSort';

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

function randomCases(count: number, seed: number) {
  const rand = rng(seed);
  const out: Array<{ values: number[]; sequence: GapSequenceName }> = [];
  for (let t = 0; t < count; t++) {
    const n = 2 + Math.floor(rand() * 23);
    const spread = rand() < 0.3 ? 4 : 1998;
    const lo = spread === 4 ? 0 : -999;
    const values = Array.from({ length: n }, () => lo + Math.floor(rand() * (spread + 1)));
    out.push({ values, sequence: SEQUENCE_NAMES[Math.floor(rand() * 3)] });
  }
  return out;
}

describe('shell sort tracer against the Python implementation', () => {
  it('reproduces the gaps, every pass and the counts of every fixture', () => {
    const cases = fixtures['shell-sort'];
    expect(cases.length).toBeGreaterThanOrEqual(50);
    for (const c of cases) {
      const got = shellSortSummary({ values: c.input, sequence: c.sequence as GapSequenceName });
      expect(got.gaps).toEqual(c.gaps);
      expect(got.passes).toEqual(c.passes);
      expect(got.comparisons).toBe(c.comparisons);
      expect(got.shifts).toBe(c.shifts);
    }
  });

  it('builds the same gap sequences as shell_sort.py', () => {
    // Values printed by the Python gap functions.
    expect(shellGaps(1000)).toEqual([500, 250, 125, 62, 31, 15, 7, 3, 1]);
    expect(knuthGaps(100000)).toEqual([88573, 29524, 9841, 3280, 1093, 364, 121, 40, 13, 4, 1]);
    expect(ciuraGaps(100000)).toEqual([90927, 40412, 17961, 7983, 3548, 1577, 701, 301, 132, 57, 23, 10, 4, 1]);
    expect(ciuraGaps(1578)[0]).toBe(1577);
    expect(ciuraGaps(1577)[0]).toBe(701);
    for (let n = 0; n < 2000; n++) {
      for (const seq of SEQUENCE_NAMES) {
        const gaps = gapSequence(n, seq);
        if (n < 2) expect(gaps).toEqual([]);
        else {
          expect(gaps.at(-1)).toBe(1);
          expect(gaps[0]).toBeLessThan(n);
          for (let k = 1; k < gaps.length; k++) expect(gaps[k]).toBeLessThan(gaps[k - 1]);
        }
      }
    }
  });
});

describe('shell sort frames', () => {
  it('end sorted with every bar done, and keep every frame a permutation of the input', () => {
    const bad: string[] = [];
    for (const input of randomCases(300, 7)) {
      const frames = shellSort(input);
      const last = frames.at(-1)!.state;
      expect(last.items.map((x) => x.value)).toEqual([...input.values].sort((a, b) => a - b));
      expect(last.roles.every((r) => r === 'done')).toBe(true);
      expect(last.done).toBe(last.gaps.length);
      const n = input.values.length;
      for (const f of frames) {
        const seen = new Set(f.state.items.map((x) => x.id));
        const ok = seen.size === n && f.state.roles.length === n && f.state.items.every((it) => it.id >= 0 && it.id < n && it.value === input.values[it.id]);
        if (!ok && bad.length < 3) bad.push(`${JSON.stringify(input)}: ${f.caption}`);
      }
    }
    expect(bad).toEqual([]);
  });

  it('is not stable: [2, 2, 2, 2, 1] carries the first 2 to the end', () => {
    for (const sequence of ['ciura', 'knuth'] as const) {
      const last = shellSort({ values: [2, 2, 2, 2, 1], sequence }).at(-1)!.state.items;
      expect(last.map((x) => x.id)).toEqual([4, 1, 2, 3, 0]);
    }
    const shell = shellSort({ values: [2, 2, 2, 2, 1], sequence: 'shell' }).at(-1)!.state.items;
    expect(shell.map((x) => x.id)).toEqual([4, 1, 0, 3, 2]);
  });

  it('marks the group of the element being inserted', () => {
    for (const input of randomCases(100, 11)) {
      for (const f of shellSort(input)) {
        const { gap, group, pointers } = f.state;
        if (group === null) continue;
        expect(gap).not.toBeNull();
        for (const idx of Object.keys(pointers)) expect(Number(idx) % gap!).toBe(group);
      }
    }
  });
});

describe('shell sort captions', () => {
  it('state numbers that match the frame, with correct plurals, over 3,000 random inputs', () => {
    const bad: string[] = [];
    const check = (ok: boolean, c: string) => {
      if (!ok && bad.length < 5) bad.push(c);
    };
    for (const input of randomCases(3000, 2026)) {
      const frames = shellSort(input);
      for (const f of frames) {
        const c = f.caption;
        const { items, gap } = f.state;
        check(!/undefined|NaN|null|\[object/.test(c), c);
        check(!/\b1 (places|comparisons|shifts|groups)\b/.test(c), c);
        check(!/\b([02-9]|\d{2,}) (place|comparison|shift)\b/.test(c), c);
        const every = /every (\d+\w\w) element/.exec(c);
        if (every) check(every[1] === ordinal(gap!), c);
        const compare = /^Compare a\[(\d+)\] = (-?\d+) with key (-?\d+): (-?\d+) (>|<=) (-?\d+)/.exec(c);
        if (compare) {
          const [, idx, other, key, a, op, b] = compare;
          const vars = Object.fromEntries(f.vars ?? []);
          check(items[Number(idx)].value === Number(other) && a === other && b === key, c);
          check(op === '>' ? Number(other) > Number(key) : Number(other) <= Number(key), c);
          check(vars.key === Number(key) && Number(idx) === Number(vars.j) - gap!, c);
        }
        const pass = /^Pass (\d+), gap (\d+)/.exec(c);
        if (pass) check(Number(pass[2]) === f.state.gaps[Number(pass[1]) - 1], c);
        const place = /^Place key (-?\d+) at index (\d+)/.exec(c);
        if (place) check(items[Number(place[2])].value === Number(place[1]), c);
      }
      const end = frames.at(-1)!;
      const vars = Object.fromEntries(end.vars ?? []);
      check(end.caption.includes(`${vars.comparisons} comparison`) && end.caption.includes(`${vars.shifts} shift`), end.caption);
    }
    expect(bad).toEqual([]);
  });

  it('writes ordinals correctly', () => {
    expect([2, 3, 4, 10, 11, 12, 13, 21, 22, 23].map(ordinal)).toEqual(['2nd', '3rd', '4th', '10th', '11th', '12th', '13th', '21st', '22nd', '23rd']);
  });
});

describe('shell sort input', () => {
  it('reads an optional gap sequence before the list', () => {
    expect(parseShellSortInput('5, 3 8')).toEqual({ values: [5, 3, 8], sequence: 'ciura' });
    expect(parseShellSortInput(' Knuth: 5 3 8')).toEqual({ values: [5, 3, 8], sequence: 'knuth' });
    expect(parseShellSortInput('shell:5,3')).toEqual({ values: [5, 3], sequence: 'shell' });
    expect(() => parseShellSortInput('tokuda: 5, 3')).toThrow(InputError);
    expect(() => parseShellSortInput('knuth: 5')).toThrow(InputError);
  });
});
