import { describe, expect, it } from 'vitest';
import { InputError } from '../core/types';
import fixtures from './__fixtures__/searching.json';
import { SEARCHERS, formatSearch, parseSearch } from './searching';

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

type Name = keyof typeof SEARCHERS;
const NAMES = Object.keys(SEARCHERS) as Name[];

function last(name: Name, values: number[], target: number) {
  const frames = SEARCHERS[name]({ values, target });
  return frames[frames.length - 1].state;
}

describe('searching tracers vs the Python golden fixtures', () => {
  it('has cases for every search', () => {
    for (const name of NAMES) expect(fixtures.cases.filter((c) => c.search === name).length).toBeGreaterThanOrEqual(80);
  });

  it('returns the same index and makes the same probes as the Python code', () => {
    for (const c of fixtures.cases) {
      const state = last(c.search as Name, c.values, c.target);
      expect({ search: c.search, values: c.values, target: c.target, result: state.result, probes: state.probes }).toEqual({
        search: c.search,
        values: c.values,
        target: c.target,
        result: c.result,
        probes: c.probes,
      });
    }
  });
});

describe('searching tracers vs a reference', () => {
  it('agree with a brute-force answer on 300 random inputs each', () => {
    for (const name of NAMES) {
      const rand = rng(11 + name.length);
      for (let t = 0; t < 300; t++) {
        const n = 1 + Math.floor(rand() * 30);
        const spread = [3, 10, 60, 999][Math.floor(rand() * 4)];
        const values = Array.from({ length: n }, () => Math.floor(rand() * (2 * spread + 1)) - spread);
        if (name !== 'linear-search') values.sort((a, b) => a - b);
        const target = rand() < 0.6 ? values[Math.floor(rand() * n)] : Math.floor(rand() * (2 * spread + 5)) - spread - 2;
        const frames = SEARCHERS[name]({ values, target });
        const state = frames[frames.length - 1].state;
        expect(frames.length).toBeGreaterThan(1);
        if (values.includes(target)) {
          expect(state.result).toBeGreaterThanOrEqual(0);
          expect(values[state.result as number]).toBe(target);
        } else {
          expect(state.result).toBe(-1);
        }
        if (name === 'linear-search') expect(state.result).toBe(values.indexOf(target));
        if (name === 'binary-search') expect(state.probes.length).toBeLessThanOrEqual(32 - Math.clz32(n));
        expect(state.probes.every((i) => i >= 0 && i < n)).toBe(true);
      }
    }
  });
});

describe('parseSearch', () => {
  it('reads values and target and round-trips', () => {
    const input = parseSearch('2, 5, 8; target 8', { sorted: true });
    expect(input).toEqual({ values: [2, 5, 8], target: 8 });
    expect(parseSearch(formatSearch(input), { sorted: true })).toEqual(input);
  });
  it('rejects a missing target and unsorted input for sorted searches', () => {
    expect(() => parseSearch('1, 2, 3', { sorted: true })).toThrow(InputError);
    expect(() => parseSearch('3, 1, 2; 2', { sorted: true })).toThrow(InputError);
    expect(parseSearch('3, 1, 2; 2', { sorted: false }).target).toBe(2);
  });
});
