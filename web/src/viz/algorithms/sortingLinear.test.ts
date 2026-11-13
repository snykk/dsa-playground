import { describe, expect, it } from 'vitest';
import fixtures from './__fixtures__/sortingLinear.json';
import { LINEAR_SORTERS, parseCountingInput, parseUnitInput } from './sortingLinear';

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

type Kind = keyof typeof LINEAR_SORTERS;

function cases(kind: Kind): number[][] {
  const rand = rng(7);
  const out: number[][] = [];
  if (kind === 'bucket-sort') {
    out.push([1], [1, 0], [0.5, 1, 0.25], [0.3, 0.3, 0.3], [0, 0, 0]);
    for (let t = 0; t < 120; t++) {
      const n = 2 + Math.floor(rand() * 15);
      out.push(Array.from({ length: n }, () => (rand() < 0.2 ? Math.floor(rand() * 3) / 2 : Math.floor(rand() * 101) / 100)));
    }
    return out;
  }
  out.push([5], [2, 1], [4, 4, 4], [0, 0], [-1, -3, -2], [10, 1], [-1, 0]);
  for (let t = 0; t < 120; t++) {
    const n = 2 + Math.floor(rand() * 15);
    let lo = Math.floor(rand() * 21) - 10;
    let span = 1 + Math.floor(rand() * 20);
    if (kind === 'radix-sort' && rand() < 0.5) {
      lo = Math.floor(rand() * 1999) - 999;
      span = 1998;
    }
    out.push(Array.from({ length: n }, () => Math.max(-999, Math.min(999, lo + Math.floor(rand() * span)))));
  }
  return out;
}

describe.each(Object.entries(LINEAR_SORTERS))('%s', (name, sort) => {
  const kind = name as Kind;

  it('ends with the sorted array, all bars done, and every frame is a permutation', () => {
    for (const values of cases(kind)) {
      const frames = sort(values);
      const last = frames[frames.length - 1].state;
      expect(last.array.items.map((x) => x.value)).toEqual([...values].sort((a, b) => a - b));
      expect(last.array.roles.every((r) => r === 'done')).toBe(true);
      for (const f of frames) {
        const ids = f.state.array.items.map((x) => x.id).sort((a, b) => a - b);
        expect(ids).toEqual(values.map((_, i) => i));
        for (const it of f.state.array.items) expect(it.value).toBe(values[it.id]);
        expect(f.state.array.roles).toHaveLength(values.length);
        expect(f.caption.length).toBeGreaterThan(0);
      }
    }
  });

  it('is stable: equal values keep their input order', () => {
    for (const values of cases(kind)) {
      const last = sort(values).at(-1)!.state.array.items;
      for (let i = 1; i < last.length; i++) {
        if (last[i - 1].value === last[i].value) expect(last[i - 1].id).toBeLessThan(last[i].id);
      }
    }
  });

  it('matches the golden output of the repository Python implementation', () => {
    for (const c of fixtures[kind]) {
      const got = sort(c.input).at(-1)!.state.array.items.map((x) => x.value);
      expect(got).toEqual(c.output);
    }
  });

  it('keeps frame counts bounded for the largest inputs', () => {
    const values =
      kind === 'bucket-sort'
        ? Array.from({ length: 16 }, () => 0.5)
        : kind === 'counting-sort'
          ? Array.from({ length: 16 }, (_, i) => i + (i % 2) * 8)
          : Array.from({ length: 16 }, (_, i) => (i % 2 ? 999 : -999));
    expect(sort(values).length).toBeLessThan(2000);
  });
});

describe('counting sort details', () => {
  it('ends with count slots equal to the start index of each value', () => {
    const frames = LINEAR_SORTERS['counting-sort']([3, 1, 3, 0]);
    const last = frames.at(-1)!.state.rows!;
    expect(last[2].cells.map((c) => c.value)).toEqual([0, 1, 3, 3]);
    expect(last[1].cells.map((c) => c.value)).toEqual([0, 1, 2, 2]);
  });
});

describe('input parsing', () => {
  it('rejects a spread that needs too many count slots', () => {
    expect(() => parseCountingInput('1, 500')).toThrow(/apart/);
    expect(parseCountingInput('-3, 4, 4')).toEqual([-3, 4, 4]);
  });
  it('accepts decimals in [0, 1] only', () => {
    expect(parseUnitInput('.5 0.25, 1')).toEqual([0.5, 0.25, 1]);
    expect(() => parseUnitInput('0.5 1.5')).toThrow(/above 1/);
    expect(() => parseUnitInput('0.5 -0.1')).toThrow(/not a decimal/);
    expect(() => parseUnitInput('0.5')).toThrow(/between 2 and 16/);
  });
});
