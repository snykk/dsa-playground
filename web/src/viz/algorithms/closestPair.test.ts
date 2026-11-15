import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { InputError } from '../core/types';
import { CLOSEST_CODE, closestTrace, parseClosest } from './closestPair';
import { expectWellFormedPlane, rng } from './geometryTestKit';
import type { XY } from './pointLineCircle';

const fixtures = JSON.parse(readFileSync(new URL('./__fixtures__/geometry.json', import.meta.url), 'utf8'));

const dist = (a: XY, b: XY) => Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2);

function bruteForce(points: XY[]): number {
  let best = Infinity;
  for (let i = 0; i < points.length; i++) for (let j = i + 1; j < points.length; j++) best = Math.min(best, dist(points[i], points[j]));
  return best;
}

function randomPoints(rand: () => number): XY[] {
  const n = 2 + Math.floor(rand() * 15);
  const kind = rand();
  if (kind < 0.3) return Array.from({ length: n }, () => [Math.floor(rand() * 5), Math.floor(rand() * 10)] as XY); // repeated x
  if (kind < 0.4) return Array.from({ length: n }, () => [Math.floor(rand() * 4), Math.floor(rand() * 4)] as XY); // duplicates
  if (kind < 0.5) return Array.from({ length: n }, () => [3, Math.floor(rand() * 30)] as XY); // a vertical line
  return Array.from({ length: n }, () => [Math.floor(rand() * 61) - 30, Math.floor(rand() * 61) - 30] as XY);
}

describe('closestTrace', () => {
  it('matches closest_pair (golden fixtures): every distance computed, in order, and the result', () => {
    const cases = fixtures.closestPair as Array<{ points: XY[]; result?: [number, XY, XY]; measured?: Array<[XY, XY]>; error?: string }>;
    expect(cases.length).toBeGreaterThanOrEqual(80);
    for (const c of cases) {
      const { result } = closestTrace(c.points);
      const msg = JSON.stringify(c.points);
      if (c.error) {
        expect(result.error, msg).toBe(c.error);
        continue;
      }
      expect(result.result, msg).toEqual(c.result);
      expect(result.measured, msg).toEqual(c.measured);
    }
  });

  it('finds the brute-force distance on random point sets', () => {
    const rand = rng(53);
    for (let t = 0; t < 200; t++) {
      const points = randomPoints(rand);
      const { frames, result } = closestTrace(points);
      const [d, a, b] = result.result!;
      expect(d).toBe(bruteForce(points));
      expect(dist(a, b)).toBe(d);
      expect(points.some((p) => p[0] === a[0] && p[1] === a[1])).toBe(true);
      expectWellFormedPlane(frames, CLOSEST_CODE.length);
      expect(frames.length).toBeLessThan(2000);
    }
  });

  it('walks the article example: both halves give 2.83, the strip finds D-E at 1.41', () => {
    const { frames, result } = closestTrace(parseClosest('(0,0) (1,6) (2,2) (4,5) (5,6) (7,1) (8,8) (9,3)'));
    expect(result.result).toEqual([Math.SQRT2, [4, 5], [5, 6]]);
    expect(result.measured.length).toBe(9);
    const top = frames.filter((f) => f.caption.startsWith('The strip:'));
    expect(top[top.length - 1].caption).toContain('F, D, E');
    // The strip is a band of half-width d around the dividing line x = 5.
    const band = top[top.length - 1].state.bands![0];
    expect([band.x0, band.x1]).toEqual([5 - 2 * Math.SQRT2, 5 + 2 * Math.SQRT2]);
  });

  it('shows the call stack: it grows into the halves and shrinks on return', () => {
    const { frames } = closestTrace(parseClosest('(0,0) (1,6) (2,2) (4,5) (5,6) (7,1) (8,8) (9,3)'));
    const depths = frames.map((f) => f.state.strips![0].items.filter((it) => it.text !== 'none').length);
    expect(Math.max(...depths)).toBe(3);
    expect(depths[depths.length - 1]).toBe(0);
  });

  it('duplicates give distance 0, and fewer than two points raise ValueError', () => {
    expect(closestTrace(parseClosest('(1,1) (6,2) (1,1) (9,9) (3,7)')).result.result).toEqual([0, [1, 1], [1, 1]]);
    const one = closestTrace(parseClosest('(3,3)'));
    expect(one.result.error).toBe('ValueError: Need at least 2 points');
    expect(one.frames[0].state.points[0].role).toBe('bad');
  });
});

describe('parseClosest', () => {
  it('rejects bad input', () => {
    expect(() => parseClosest('')).toThrow(InputError);
    expect(() => parseClosest('(1,1) (2,x)')).toThrow(InputError);
    expect(() => parseClosest(Array.from({ length: 17 }, (_, i) => `(${i},0)`).join(' '))).toThrow(/At most 16/);
  });
});
