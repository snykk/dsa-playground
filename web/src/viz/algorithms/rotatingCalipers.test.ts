import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { InputError } from '../core/types';
import { grahamTrace } from './convexHull';
import { closeTo, planeFrameProblems, rng } from './geometryTestKit';
import { cross, dist2, type XY } from './pointLineCircle';
import { CALIPER_CODE, calipersTrace, cleanPolygon, isConvexPolygon, parseCalipers } from './rotatingCalipers';

const fixtures = JSON.parse(readFileSync(new URL('./__fixtures__/geometry.json', import.meta.url), 'utf8'));

/** A random convex polygon in order: a hull, rotated, maybe reversed, maybe with a repeat or a point on an edge. */
function randomPolygon(rand: () => number): XY[] {
  for (;;) {
    const pts: XY[] = Array.from({ length: 3 + Math.floor(rand() * 10) }, () => [Math.floor(rand() * 41) - 20, Math.floor(rand() * 41) - 20]);
    let poly = grahamTrace(pts).result.hull;
    if (poly.length < 3) continue;
    const s = Math.floor(rand() * poly.length);
    poly = [...poly.slice(s), ...poly.slice(0, s)];
    if (rand() < 0.5) poly.reverse();
    if (rand() < 0.3) {
      const k = Math.floor(rand() * poly.length);
      poly.splice(k, 0, [...poly[k]] as XY);
    }
    if (rand() < 0.3) {
      const k = Math.floor(rand() * poly.length);
      const a = poly[k];
      const b = poly[(k + 1) % poly.length];
      if ((a[0] + b[0]) % 2 === 0 && (a[1] + b[1]) % 2 === 0) poly.splice(k + 1, 0, [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]);
    }
    return poly.slice(0, 12);
  }
}

describe('calipersTrace', () => {
  it('matches rotating_calipers_diameter and _width (golden fixtures): every cross product and distance, in order', () => {
    const cases = fixtures.calipers as Array<{
      polygon: XY[];
      clean: XY[];
      diameter: [number, XY, XY];
      diameterCross: Array<[XY, XY, XY, number]>;
      diameterDist: Array<[XY, XY, number]>;
      width: number;
      widthCross: Array<[XY, XY, XY, number]>;
      widthDist: Array<[XY, XY, number]>;
    }>;
    expect(cases.length).toBeGreaterThanOrEqual(60);
    for (const c of cases) {
      const run = calipersTrace({ polygon: c.polygon, ops: ['diameter', 'width'] });
      const [d, w] = run.steps;
      const msg = JSON.stringify(c.polygon);
      expect(d.clean, msg).toEqual(c.clean);
      expect(d.result, msg).toEqual(c.diameter);
      expect(d.cross, msg).toEqual(c.diameterCross);
      expect(d.dist, msg).toEqual(c.diameterDist);
      expect(w.result, msg).toBe(c.width);
      expect(w.cross, msg).toEqual(c.widthCross);
      expect(w.dist, msg).toEqual(c.widthDist);
    }
  });

  it('agrees with brute force on random convex polygons', () => {
    const rand = rng(31);
    for (let t = 0; t < 200; t++) {
      const polygon = randomPolygon(rand);
      const run = calipersTrace({ polygon, ops: ['diameter', 'width'] });
      const problems = planeFrameProblems(run.frames, CALIPER_CODE.length);
      const pts = cleanPolygon(polygon).pts.map((q) => q.p);
      if (!isConvexPolygon(pts)) problems.push(`the cleaned polygon ${JSON.stringify(pts)} is not convex`);
      let far = 0;
      for (const a of polygon) for (const b of polygon) far = Math.max(far, dist2(a, b));
      const [d, a, b] = run.steps[0].result as [number, XY, XY];
      if (!Object.is(d, Math.sqrt(far))) problems.push(`diameter ${d}, brute force ${Math.sqrt(far)}`);
      if (!Object.is(dist2(a, b), far)) problems.push(`the diameter pair (${a}) (${b}) is ${dist2(a, b)} apart squared, brute force ${far}`);
      // Width of a convex polygon: over every edge, the farthest vertex from its line; the least of those.
      let width = Infinity;
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        const q = pts[(i + 1) % pts.length];
        const h = Math.max(...pts.map((v) => Math.abs(cross(p, q, v)))) / Math.sqrt(dist2(p, q));
        width = Math.min(width, h);
      }
      if (!closeTo(run.steps[1].result as number, width, 9)) problems.push(`width ${run.steps[1].result}, brute force ${width}`);
      // The far pointer goes around at most twice.
      const moves = run.frames[run.frames.length - 2].vars?.find((v) => v[0] === 'j moves')?.[1] as number;
      if (!(moves <= 2 * pts.length)) problems.push(`j moved ${moves} times, more than twice around ${pts.length} vertices`);
      expect(problems, JSON.stringify(polygon)).toEqual([]);
    }
  });

  it('turns the jaws: both keep their ids and stay parallel to the current edge', () => {
    const run = calipersTrace(parseCalipers('(0,0) (4,0) (5,2) (2,5) (-1,3); diameter'));
    const withJaws = run.frames.filter((f) => f.state.lines?.length === 2);
    expect(withJaws.length).toBeGreaterThan(10);
    for (const f of withJaws) {
      const [a, b] = f.state.lines!;
      expect([a.id, b.id]).toEqual(['jaw1', 'jaw2']);
      expect(a.dir).toEqual(b.dir);
    }
    expect(new Set(withJaws.map((f) => f.state.lines![0].dir.join(','))).size).toBe(5);
    expect(run.steps[0].result).toEqual([Math.sqrt(37), [5, 2], [-1, 3]]);
  });

  it('cleans repeated and collinear vertices first, so the width is not 0', () => {
    const run = calipersTrace(parseCalipers('(0,0) (2,0) (4,0) (4,3) (0,3); width'));
    expect(run.steps[0].clean).toEqual([
      [0, 0],
      [4, 0],
      [4, 3],
      [0, 3],
    ]);
    expect(run.steps[0].result).toBe(3);
    expect(run.frames.some((f) => f.caption.startsWith('B (2, 0) has a zero turn'))).toBe(true);
    const square = calipersTrace(parseCalipers('(0,0) (4,0) (4,4) (4,4) (0,4) (0,0)'));
    expect(square.steps.map((s) => (Array.isArray(s.result) ? s.result[0] : s.result))).toEqual([Math.sqrt(32), 4]);
  });

  it('handles the fan-shaped hull that defeated the old distance hill-climb', () => {
    const run = calipersTrace(parseCalipers('(0,0) (1048,58) (1033,181) (1029,208) (897,524) (888,520); diameter'));
    expect(run.steps[0].result).toEqual([1049.8118879113533, [1029, 208], [0, 0]]);
  });

  it('degenerate input: no polygon, one point, a segment', () => {
    expect(calipersTrace(parseCalipers('(3,1) (3,1) (3,1)')).steps.map((s) => s.result)).toEqual([[0, [3, 1], [3, 1]], 0]);
    expect(calipersTrace(parseCalipers('(0,0) (2,0) (4,0)')).steps.map((s) => s.result)).toEqual([[4, [0, 0], [4, 0]], 0]);
    expect(calipersTrace({ polygon: [], ops: ['diameter', 'width'] }).steps.map((s) => s.result)).toEqual([[0, [0, 0], [0, 0]], 0]);
  });
});

describe('parseCalipers', () => {
  it('reads the polygon and the functions, both by default', () => {
    expect(parseCalipers('(0,0) (4,0) (4,3) (0,3)')).toEqual({
      polygon: [
        [0, 0],
        [4, 0],
        [4, 3],
        [0, 3],
      ],
      ops: ['diameter', 'width'],
    });
    expect(parseCalipers('polygon (0,0) (4,0) (4,3); w').ops).toEqual(['width']);
  });

  it('rejects polygons that are not convex or not in order', () => {
    expect(() => parseCalipers('(0,0) (4,0) (0,3) (4,3)')).toThrow(/not a convex polygon/);
    expect(() => parseCalipers('(0,0) (4,0) (2,1) (4,3) (0,3)')).toThrow(/not a convex polygon/);
    expect(() => parseCalipers('(0,0) (4,0) (4,3); spin')).toThrow(/Cannot read/);
    expect(() => parseCalipers(Array.from({ length: 13 }, (_, i) => `(${i},${i * i})`).join(' '))).toThrow(InputError);
  });
});
