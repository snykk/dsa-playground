import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { InputError } from '../core/types';
import { GRAHAM_CODE, grahamTrace, JARVIS_CODE, jarvisTrace, parseHullPoints, uniquePoints } from './convexHull';
import { expectWellFormedPlane, rng } from './geometryTestKit';
import { cross, lexLess, type XY } from './pointLineCircle';

const fixtures = JSON.parse(readFileSync(new URL('./__fixtures__/geometry.json', import.meta.url), 'utf8'));

/** Brute force: a distinct point is a strict hull vertex unless it lies in a triangle or on a segment of other points. */
function strictVertices(points: XY[]): XY[] {
  const pts = uniquePoints(points).map((u) => u.p);
  const inTri = (p: XY, a: XY, b: XY, c: XY) => {
    const area = cross(a, b, c);
    if (area === 0) return false;
    const d = [cross(p, a, b), cross(p, b, c), cross(p, c, a)];
    return !(d.some((x) => x < 0) && d.some((x) => x > 0));
  };
  const onSeg = (p: XY, a: XY, b: XY) => cross(a, b, p) === 0 && Math.min(a[0], b[0]) <= p[0] && p[0] <= Math.max(a[0], b[0]) && Math.min(a[1], b[1]) <= p[1] && p[1] <= Math.max(a[1], b[1]);
  return pts.filter((p, i) => {
    const rest = pts.filter((_, j) => j !== i);
    for (let a = 0; a < rest.length; a++)
      for (let b = a + 1; b < rest.length; b++) {
        if (onSeg(p, rest[a], rest[b])) return false;
        for (let c = b + 1; c < rest.length; c++) if (inTri(p, rest[a], rest[b], rest[c])) return false;
      }
    return true;
  });
}

const key = (p: XY) => `${p[0]},${p[1]}`;

function randomPoints(rand: () => number): XY[] {
  const n = Math.floor(rand() * 17);
  const kind = rand();
  const span = kind < 0.4 ? 4 : kind < 0.7 ? 10 : 40;
  const pts: XY[] = Array.from({ length: n }, () => [Math.floor(rand() * (span + 1)), Math.floor(rand() * (span + 1))]);
  if (kind > 0.9) return pts.map((p) => [p[0], 2 * p[0] + 1] as XY); // all on one line
  return pts;
}

function expectHull(hull: XY[], points: XY[], start: (pts: XY[]) => XY) {
  const want = strictVertices(points);
  const pts = uniquePoints(points).map((u) => u.p);
  if (pts.length < 3) {
    expect(hull.length).toBe(pts.length);
    return;
  }
  expect(new Set(hull.map(key))).toEqual(new Set(want.map(key)));
  expect(hull.length).toBe(want.length);
  expect(hull[0]).toEqual(start(pts));
  if (hull.length >= 3) for (let k = 0; k < hull.length; k++) expect(cross(hull[k], hull[(k + 1) % hull.length], hull[(k + 2) % hull.length])).toBeGreaterThan(0);
}

const lowest = (pts: XY[]) => pts.reduce((a, b) => (b[1] < a[1] || (b[1] === a[1] && b[0] < a[0]) ? b : a));
const leftmost = (pts: XY[]) => pts.reduce((a, b) => (lexLess(b, a) ? b : a));

describe('grahamTrace', () => {
  it('matches graham_scan (golden fixtures): pivot, angular order, every turn test, hull', () => {
    const cases = fixtures.graham as Array<{ points: XY[]; unique: XY[]; bottom?: XY; sorted?: XY[]; tests?: Array<[XY, XY, XY, number]>; hull: XY[] }>;
    expect(cases.length).toBeGreaterThanOrEqual(80);
    for (const c of cases) {
      const { result } = grahamTrace(c.points);
      const msg = JSON.stringify(c.points);
      expect(result.unique, msg).toEqual(c.unique);
      expect(result.hull, msg).toEqual(c.hull);
      if (c.sorted) {
        expect(result.bottom, msg).toEqual(c.bottom);
        expect(result.sorted, msg).toEqual(c.sorted);
        expect(result.tests, msg).toEqual(c.tests);
      }
    }
  });

  it('returns the strict hull, counterclockwise from the lowest point, on random point sets', () => {
    const rand = rng(17);
    for (let t = 0; t < 200; t++) {
      const points = randomPoints(rand);
      if (points.length === 0) continue;
      const { frames, result } = grahamTrace(points);
      expectHull(result.hull, points, lowest);
      expectWellFormedPlane(frames, GRAHAM_CODE.length);
      // Every point is pushed once and popped at most once.
      const pops = result.tests.filter((x) => x[3] <= 0).length;
      expect(pops).toBeLessThanOrEqual(uniquePoints(points).length - result.hull.length);
    }
  });

  it('walks the article example: D, C and E are popped, the hull is A B F G', () => {
    const pts = parseHullPoints('(0,0) (3,0) (2,1) (1,1) (2,2) (3,3) (0,3)');
    const { frames, result } = grahamTrace(pts);
    expect(result.tests.map((x) => x[3])).toEqual([3, 1, -1, -1, 6, -3, 9, 9]);
    expect(result.hull).toEqual([
      [0, 0],
      [3, 0],
      [3, 3],
      [0, 3],
    ]);
    const popped = frames.filter((f) => f.caption.startsWith('Pop ')).map((f) => f.caption.slice(4, 5));
    expect(popped).toEqual(['D', 'C', 'E']);
    // The turn triangle keeps one id, so it glides from test to test.
    expect(new Set(frames.flatMap((f) => (f.state.polygons ?? []).map((p) => p.id)))).toEqual(new Set(['turn', 'hull']));
  });

  it('drops duplicates and collinear boundary points, and keeps fewer than three points as they are', () => {
    const { frames, result } = grahamTrace(parseHullPoints('(0,0) (2,0) (4,0) (4,2) (4,4) (2,2) (0,4) (0,2) (1,1) (2,0)'));
    expect(result.hull).toEqual([
      [0, 0],
      [4, 0],
      [4, 4],
      [0, 4],
    ]);
    expect(frames[0].state.points[9].ghost).toBe(true);
    expect(grahamTrace([[1, 1], [1, 1]]).result.hull).toEqual([[1, 1]]);
    expect(grahamTrace([[2, 0], [0, 0]]).result.hull).toEqual([
      [0, 0],
      [2, 0],
    ]);
    expect(grahamTrace([[0, 0], [1, 1], [2, 2], [3, 3]]).result.hull).toEqual([
      [0, 0],
      [3, 3],
    ]);
  });
});

describe('jarvisTrace', () => {
  it('matches jarvis_march (golden fixtures): every cross product, in order, and the hull', () => {
    const cases = fixtures.jarvis as Array<{ points: XY[]; tests: Array<[XY, XY, XY, number]>; hull: XY[] }>;
    expect(cases.length).toBeGreaterThanOrEqual(80);
    for (const c of cases) {
      const { result } = jarvisTrace(c.points);
      const msg = JSON.stringify(c.points);
      expect(result.hull, msg).toEqual(c.hull);
      expect(result.tests, msg).toEqual(c.tests);
    }
  });

  it('returns the strict hull, counterclockwise from the leftmost point, on random point sets', () => {
    const rand = rng(23);
    for (let t = 0; t < 200; t++) {
      const points = randomPoints(rand);
      if (points.length === 0) continue;
      const { frames, result } = jarvisTrace(points);
      expectHull(result.hull, points, leftmost);
      expectWellFormedPlane(frames, JARVIS_CODE.length);
      expect(frames.length).toBeLessThan(2000);
      const g = grahamTrace(points).result.hull;
      expect(new Set(result.hull.map(key))).toEqual(new Set(g.map(key)));
    }
  });

  it('swings one candidate ray: it keeps its id while next_point changes', () => {
    const { frames } = jarvisTrace(parseHullPoints('(0,3) (2,2) (1,1) (2,1) (3,0) (0,0) (3,3)'));
    const ends = frames.map((f) => f.state.segments?.find((s) => s.id === 'cand')?.b).filter(Boolean);
    expect(new Set(ends.map((p) => key(p!))).size).toBeGreaterThan(3);
  });
});

describe('parseHullPoints', () => {
  it('reads points, with or without a prefix', () => {
    expect(parseHullPoints('points (0,3) (2, 2) (-1,1)')).toEqual([
      [0, 3],
      [2, 2],
      [-1, 1],
    ]);
  });
  it('rejects bad input', () => {
    expect(() => parseHullPoints('')).toThrow(InputError);
    expect(() => parseHullPoints('(0,3) (2,2) 7')).toThrow(/not a point/);
    expect(() => parseHullPoints(Array.from({ length: 17 }, (_, i) => `(${i},0)`).join(' '))).toThrow(/At most 16/);
  });
});
