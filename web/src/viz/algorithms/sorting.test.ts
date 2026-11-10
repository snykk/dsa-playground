import { describe, expect, it } from 'vitest';
import { SORTERS } from './sorting';

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

function cases(): number[][] {
  const rand = rng(42);
  const out: number[][] = [[7], [2, 1], [1, 2], [5, 5, 5, 5], [1, 2, 3, 4, 5, 6], [6, 5, 4, 3, 2, 1], [3, -1, 0, -7, 12]];
  for (let t = 0; t < 120; t++) {
    const n = 1 + Math.floor(rand() * 16);
    const spread = rand() < 0.3 ? 4 : 200; // many duplicates sometimes
    out.push(Array.from({ length: n }, () => Math.floor(rand() * spread) - spread / 4));
  }
  return out;
}

const STABLE = new Set(['bubble-sort', 'insertion-sort', 'merge-sort']);

describe.each(Object.entries(SORTERS))('%s', (name, sort) => {
  it('ends with the sorted array, all bars done', () => {
    for (const values of cases()) {
      const frames = sort(values);
      const last = frames[frames.length - 1].state;
      expect(last.items.map((x) => x.value)).toEqual([...values].sort((a, b) => a - b));
      expect(last.roles.every((r) => r === 'done')).toBe(true);
    }
  });

  it('keeps every frame a permutation of the input', () => {
    for (const values of cases()) {
      for (const f of sort(values)) {
        const ids = f.state.items.map((x) => x.id).sort((a, b) => a - b);
        expect(ids).toEqual(values.map((_, i) => i));
        expect(f.state.roles).toHaveLength(values.length);
        for (const it of f.state.items) expect(it.value).toBe(values[it.id]);
        expect(f.caption.length).toBeGreaterThan(0);
      }
    }
  });

  it.runIf(STABLE.has(name))('is stable: equal values keep their input order', () => {
    for (const values of cases()) {
      const last = sort(values).at(-1)!.state.items;
      for (let i = 1; i < last.length; i++) {
        if (last[i - 1].value === last[i].value) expect(last[i - 1].id).toBeLessThan(last[i].id);
      }
    }
  });
});

describe('step counts match the textbook behaviour', () => {
  it('insertion sort needs only n-1 comparisons on sorted input', () => {
    const frames = SORTERS['insertion-sort']([1, 2, 3, 4, 5, 6, 7, 8]);
    const vars = Object.fromEntries(frames.at(-1)!.vars ?? []);
    expect(vars.comparisons).toBe(7);
    expect(vars['swaps / moves']).toBe(0);
  });

  it('bubble sort stops after one pass on sorted input', () => {
    const frames = SORTERS['bubble-sort']([1, 2, 3, 4, 5]);
    expect(frames.some((f) => f.line === 6)).toBe(true);
    expect(Object.fromEntries(frames.at(-1)!.vars ?? []).comparisons).toBe(4);
  });
});
