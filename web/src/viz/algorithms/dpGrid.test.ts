import { describe, expect, it } from 'vitest';
import { InputError, type Frame } from '../core/types';
import type { GridState } from '../renderers/Grid';
import fixtures from './__fixtures__/dynamicProgramming.json';
import { editDistanceTrace, matrixChainTrace, parenthesize, parseEditDistance, parseMatrixChain } from './dpGrid';

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

const answerOf = (frames: Array<Frame<GridState>>): number => Number(frames[frames.length - 1].vars?.find(([k]) => k === 'answer')?.[1]);

function wellFormed(frames: Array<Frame<GridState>>, lines: number) {
  expect(frames.length).toBeGreaterThan(0);
  expect(frames.length).toBeLessThan(2000);
  for (const f of frames) {
    expect(f.caption.length).toBeGreaterThan(10);
    if (f.line !== undefined) {
      expect(f.line).toBeGreaterThanOrEqual(0);
      expect(f.line).toBeLessThan(lines);
    }
    expect(f.state.cells.length).toBe(f.state.rowHeaders.length);
    for (const row of f.state.cells) expect(row.length).toBe(f.state.colHeaders.length);
  }
}

function editRef(a: string, b: string): number {
  const memo = new Map<string, number>();
  const go = (i: number, j: number): number => {
    if (i === a.length) return b.length - j;
    if (j === b.length) return a.length - i;
    const k = `${i},${j}`;
    const hit = memo.get(k);
    if (hit !== undefined) return hit;
    const v = a[i] === b[j] ? go(i + 1, j + 1) : 1 + Math.min(go(i + 1, j + 1), go(i + 1, j), go(i, j + 1));
    memo.set(k, v);
    return v;
  };
  return go(0, 0);
}

/** Apply the edit list shown in the final strip to a and check it produces b. */
function applyEdits(a: string, ops: string[]): string {
  let i = 0;
  let out = '';
  for (const op of ops) {
    if (op.startsWith('keep ')) {
      out += a[i++];
    } else if (op.startsWith('del ')) {
      i++;
    } else if (op.startsWith('ins ')) {
      out += op.slice(4);
    } else {
      out += op[2];
      i++;
    }
  }
  return out;
}

describe('Edit distance', () => {
  it('matches the memoized recursion, and its edit list really turns a into b (200 random cases)', () => {
    const rand = rng(41);
    for (let t = 0; t < 200; t++) {
      const word = (n: number) => Array.from({ length: n }, () => 'abc'[Math.floor(rand() * 3)]).join('');
      const a = word(Math.floor(rand() * 8));
      const b = word(Math.floor(rand() * 8));
      const frames = editDistanceTrace(parseEditDistance(`${a} | ${b}`));
      wellFormed(frames, 7);
      const d = editRef(a, b);
      expect(answerOf(frames)).toBe(d);
      const ops = (frames[frames.length - 1].state.strips?.[0]?.items ?? []).map((i) => i.text);
      expect(ops.filter((o) => !o.startsWith('keep ')).length).toBe(d);
      expect(applyEdits(a, ops)).toBe(b);
    }
  });
  it('matches the Python fixtures', () => {
    for (const c of fixtures.edit) expect(answerOf(editDistanceTrace({ a: Array.from(c.a), b: Array.from(c.b) }))).toBe(c.distance);
  });
  it('handles the classic example, empty sides and bad input', () => {
    expect(answerOf(editDistanceTrace(parseEditDistance('kitten | sitting')))).toBe(3);
    expect(answerOf(editDistanceTrace(parseEditDistance(' | abc')))).toBe(3);
    expect(answerOf(editDistanceTrace(parseEditDistance(' | ')))).toBe(0);
    expect(() => parseEditDistance('abc')).toThrow(InputError);
    expect(() => parseEditDistance('abcdefghijk | a')).toThrow(InputError);
  });
});

/** Cheapest cost over every parenthesization (plain recursion, no table). */
function mcmRef(dims: number[], i = 1, j = dims.length - 1): number {
  if (i >= j) return 0;
  let best = Infinity;
  for (let k = i; k < j; k++) best = Math.min(best, mcmRef(dims, i, k) + mcmRef(dims, k + 1, j) + dims[i - 1] * dims[k] * dims[j]);
  return best;
}

/** Cost of multiplying in the order described by "((A1 A2) A3)". */
function costOfOrder(order: string, dims: number[]): number {
  let pos = 0;
  const parse = (): { r: number; c: number; cost: number } => {
    if (order[pos] === '(') {
      pos++;
      const l = parse();
      pos++; // space
      const r = parse();
      pos++; // close
      return { r: l.r, c: r.c, cost: l.cost + r.cost + l.r * l.c * r.c };
    }
    pos++; // 'A'
    let num = '';
    while (pos < order.length && /\d/.test(order[pos])) num += order[pos++];
    const k = Number(num);
    return { r: dims[k - 1], c: dims[k], cost: 0 };
  };
  return parse().cost;
}

describe('Matrix chain', () => {
  it('matches the recursive reference and its bracketing achieves that cost (150 random cases)', () => {
    const rand = rng(53);
    for (let t = 0; t < 150; t++) {
      const dims = Array.from({ length: 2 + Math.floor(rand() * 6) }, () => 1 + Math.floor(rand() * 30));
      const frames = matrixChainTrace(dims);
      wellFormed(frames, 7);
      const expected = mcmRef(dims);
      expect(answerOf(frames)).toBe(expected);
      if (dims.length > 2) {
        const order = frames[frames.length - 1].state.strips?.find((s) => s.label === 'Best order')?.items[0].text ?? '';
        expect(costOfOrder(order, dims)).toBe(expected);
      }
    }
  });
  it('matches the Python fixtures and the CLRS example', () => {
    for (const c of fixtures.mcm) expect(answerOf(matrixChainTrace(c.dims))).toBe(c.cost);
    expect(answerOf(matrixChainTrace([30, 35, 15, 5, 10, 20, 25]))).toBe(15125);
    const order = matrixChainTrace([30, 35, 15, 5, 10, 20, 25]).slice(-1)[0].state.strips?.[1].items[0].text;
    expect(order).toBe('((A1 (A2 A3)) ((A4 A5) A6))');
  });
  it('stays within the frame budget for the largest input, handles one matrix, validates', () => {
    expect(matrixChainTrace([99, 98, 97, 96, 95, 94, 93, 92, 91]).length).toBeLessThan(200);
    expect(answerOf(matrixChainTrace([4, 7]))).toBe(0);
    expect(parenthesize([[0], [0, 1]], 1, 1)).toBe('A1');
    expect(() => parseMatrixChain('5')).toThrow(InputError);
    expect(() => parseMatrixChain('1 2 3 4 5 6 7 8 9 10')).toThrow(InputError);
    expect(() => parseMatrixChain('0 5')).toThrow(InputError);
  });
});
