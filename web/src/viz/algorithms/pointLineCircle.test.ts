import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { InputError } from '../core/types';
import { expectWellFormedPlane, rng } from './geometryTestKit';
import { cross, parsePlc, PLC_CODE, plcTrace, pyFloat, readPoints, type PlcKind, type PlcOp, type XY } from './pointLineCircle';

const fixtures = JSON.parse(readFileSync(new URL('./__fixtures__/geometry.json', import.meta.url), 'utf8'));

const KINDS: PlcKind[] = ['distance', 'line', 'cross', 'orientation', 'dot', 'angle', 'triangle', 'circle'];
const ARITY: Record<PlcKind, number> = { distance: 2, line: 2, cross: 3, orientation: 3, dot: 3, angle: 3, triangle: 4, circle: 2 };

function randomOp(rand: () => number): PlcOp {
  const kind = KINDS[Math.floor(rand() * KINDS.length)];
  const span = [3, 6, 20][Math.floor(rand() * 3)];
  const pt = (): XY => [Math.floor(rand() * (2 * span + 1)) - span, Math.floor(rand() * (2 * span + 1)) - span];
  const pts = Array.from({ length: ARITY[kind] }, pt);
  if (rand() < 0.25) pts[pts.length - 1] = [...pts[0]] as XY;
  return kind === 'circle' ? { kind, pts, radius: Math.floor(rand() * (span + 2)) - 1 } : { kind, pts };
}

describe('pyFloat (Python float repr)', () => {
  it('formats like repr()', () => {
    expect(pyFloat(5)).toBe('5.0');
    expect(pyFloat(-0)).toBe('-0.0');
    expect(pyFloat(1 / 3)).toBe('0.3333333333333333');
    expect(pyFloat(Math.sqrt(8))).toBe('2.8284271247461903');
    expect(pyFloat(1e-5)).toBe('1e-05');
    expect(pyFloat(0.0001)).toBe('0.0001');
    expect(pyFloat(1.5e16)).toBe('1.5e+16');
    expect(pyFloat(1234567890123456)).toBe('1234567890123456.0');
    expect(pyFloat(Infinity)).toBe('inf');
    expect(pyFloat(NaN)).toBe('nan');
    expect(pyFloat(-2.5)).toBe('-2.5');
  });
});

describe('plcTrace', () => {
  it('matches the Python functions (golden fixtures)', () => {
    const cases = fixtures.pointLineCircle as Array<{ op: PlcKind; args: Array<XY | number>; result?: unknown; error?: string }>;
    expect(cases.length).toBeGreaterThanOrEqual(200);
    for (const c of cases) {
      const op: PlcOp = c.op === 'circle' ? { kind: 'circle', pts: [c.args[0] as XY, c.args[2] as XY], radius: c.args[1] as number } : { kind: c.op, pts: c.args as XY[] };
      const step = plcTrace([op]).steps[0];
      if (c.error) {
        expect(step.error).toBe(c.error);
      } else if (c.op === 'angle') {
        expect(step.result as number).toBeCloseTo(c.result as number, 11);
      } else {
        expect(step.result, JSON.stringify(c)).toEqual(c.result);
      }
    }
  });

  it('agrees with a direct reference on random operations, and every frame is well formed', () => {
    const rand = rng(41);
    for (let t = 0; t < 150; t++) {
      const ops = Array.from({ length: 1 + Math.floor(rand() * 6) }, () => randomOp(rand));
      const run = plcTrace(ops);
      expectWellFormedPlane(run.frames, PLC_CODE.length);
      run.steps.forEach((s, i) => {
        const op = ops[i];
        const [a, b, c, d] = op.pts;
        if (op.kind === 'orientation') expect(s.result).toBe(Math.sign(cross(a, b, c)) === 0 ? 0 : cross(a, b, c) > 0 ? 2 : 1);
        if (op.kind === 'cross') expect(s.result).toBe(cross(a, b, c));
        if (op.kind === 'triangle') {
          // Reference: a point is in a non-degenerate triangle iff the three sub-areas add up to its area.
          const area = Math.abs(cross(b, c, d));
          const parts = Math.abs(cross(a, b, c)) + Math.abs(cross(a, c, d)) + Math.abs(cross(a, d, b));
          expect(s.result).toBe(area > 0 && parts === area);
        }
        if (op.kind === 'circle') {
          if (op.radius! < 0) expect(s.error).toMatch(/^ValueError/);
          else expect((s.result as { contains: boolean }).contains).toBe(Math.hypot(a[0] - b[0], a[1] - b[1]) <= op.radius! + 1e-12);
        }
      });
    }
  });

  it('draws the sign of the cross product as the area of a parallelogram', () => {
    const run = plcTrace(parsePlc('cross (0,0) (4,4) (1,2)'));
    const area = run.frames.find((f) => f.state.polygons?.length)!.state.polygons![0];
    expect(area.pts).toEqual([
      [0, 0],
      [4, 4],
      [5, 6],
      [1, 2],
    ]);
    expect([area.role, area.label]).toEqual(['compare', '+4']);
  });

  it('keeps the points of one operation in their slots, so they glide to the next', () => {
    const run = plcTrace(parsePlc('orientation (0,0) (4,4) (1,2), orientation (0,0) (4,4) (2,1)'));
    const r = run.frames.filter((f) => f.state.points.some((p) => p.id === 'arg2')).map((f) => f.state.points.find((p) => p.id === 'arg2')!.at);
    expect(r[0]).toEqual([1, 2]);
    expect(r[r.length - 1]).toEqual([2, 1]);
    expect(run.steps.map((s) => s.result)).toEqual([2, 1]);
  });

  it('runs point_in_triangle sign by sign, and a degenerate triangle contains nothing', () => {
    const run = plcTrace(parsePlc('triangle (2,1) (0,0) (4,0) (2,4), triangle (2,0) (0,0) (4,0) (2,4), triangle (1,1) (0,0) (1,1) (2,2)'));
    expect(run.steps.map((s) => s.result)).toEqual([true, true, false]);
    expect(run.frames.some((f) => f.caption.startsWith('d2 = cross_product(p, b, c) = 6'))).toBe(true);
  });

  it('reports the ValueError of a negative radius and goes on', () => {
    const run = plcTrace(parsePlc('circle (0,0) -5 (1,1), circle (0,0) 5 (3,4)'));
    expect(run.steps[0].error).toBe('ValueError: radius must be non-negative');
    expect(run.steps[1].result).toEqual({ contains: true, on: true, area: Math.PI * 5 * 5, circumference: 2 * Math.PI * 5 });
    const bad = run.frames.find((f) => f.caption.includes('raises ValueError'))!;
    expect(bad.state.points[0].role).toBe('bad');
  });

  it('returns the slope rules of Line exactly', () => {
    const run = plcTrace(parsePlc('line (2,1) (2,7), line (4,4) (4,4), line (0,0) (3,4)'));
    expect(run.steps.map((s) => (s.result as { slope: unknown }).slope)).toEqual(['inf', 'nan', 4 / 3]);
  });
});

describe('parsePlc', () => {
  it('reads every operation and its short forms', () => {
    const ops = parsePlc('dist (0,0) (3,4); orient (0,0) (4,4) (1,2), tri (2,1) (0,0) (4,0) (2,4)\ncircle (0, 0) 5 (3, 4), angle (0,0) (1,0) (0,1)');
    expect(ops.map((o) => o.kind)).toEqual(['distance', 'orientation', 'triangle', 'circle', 'angle']);
    expect(ops[3]).toEqual({ kind: 'circle', pts: [[0, 0], [3, 4]], radius: 5 });
    expect(readPoints('(1,2) (-3, 4)', 'points')).toEqual([
      [1, 2],
      [-3, 4],
    ]);
  });

  it('rejects bad input with a friendly message', () => {
    expect(() => parsePlc('')).toThrow(InputError);
    expect(() => parsePlc('spin (0,0)')).toThrow(/Cannot read/);
    expect(() => parsePlc('orientation (0,0) (1,1)')).toThrow(/takes 3 points/);
    expect(() => parsePlc('circle (0,0) (1,1) 3')).toThrow(/center, a radius/);
    expect(() => parsePlc('distance (0,0) (1.5,2)')).toThrow(InputError);
    expect(() => parsePlc('distance (0,0) (10000,2)')).toThrow(/-9999 to 9999/);
    expect(() => parsePlc(Array.from({ length: 11 }, () => 'dot (0,0) (1,0) (0,1)').join(', '))).toThrow(/At most 10/);
  });
});
