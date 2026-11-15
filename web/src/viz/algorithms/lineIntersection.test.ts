import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { InputError } from '../core/types';
import { expectWellFormedPlane, rng } from './geometryTestKit';
import { LI_CODE, liTrace, parseLi, type LiOp } from './lineIntersection';
import { cross, lexLess, type XY } from './pointLineCircle';

const fixtures = JSON.parse(readFileSync(new URL('./__fixtures__/geometry.json', import.meta.url), 'utf8'));

/** A point with rational coordinates X / D, Y / D (D > 0). */
type Rat = [number, number, number];

function onSegmentExact(p: Rat, a: XY, b: XY): boolean {
  const [X, Y, D] = p;
  if ((b[0] - a[0]) * (Y - a[1] * D) - (b[1] - a[1]) * (X - a[0] * D) !== 0) return false;
  return Math.min(a[0], b[0]) * D <= X && X <= Math.max(a[0], b[0]) * D && Math.min(a[1], b[1]) * D <= Y && Y <= Math.max(a[1], b[1]) * D;
}

/** Reference: the common points that matter are the endpoints and the meeting point of the lines. */
function reference(p1: XY, p2: XY, p3: XY, p4: XY): { meet: boolean; common: Rat[] } {
  const candidates: Rat[] = [p1, p2, p3, p4].map((p) => [p[0], p[1], 1]);
  const denom = (p1[0] - p2[0]) * (p3[1] - p4[1]) - (p1[1] - p2[1]) * (p3[0] - p4[0]);
  if (denom !== 0) {
    const num = (p1[0] - p3[0]) * (p3[1] - p4[1]) - (p1[1] - p3[1]) * (p3[0] - p4[0]);
    const s = denom > 0 ? 1 : -1;
    candidates.push([s * (p1[0] * denom + num * (p2[0] - p1[0])), s * (p1[1] * denom + num * (p2[1] - p1[1])), s * denom]);
  }
  const common = candidates.filter((c) => onSegmentExact(c, p1, p2) && onSegmentExact(c, p3, p4));
  return { meet: common.length > 0, common };
}

function randomPair(rand: () => number): XY[] {
  const span = [2, 3, 6][Math.floor(rand() * 3)];
  const pt = (): XY => [Math.floor(rand() * (2 * span + 1)) - span, Math.floor(rand() * (2 * span + 1)) - span];
  const pts = [pt(), pt(), pt(), pt()];
  const r = rand();
  if (r < 0.2) pts[2] = [...pts[Math.floor(rand() * 2)]] as XY;
  else if (r < 0.35) {
    const d = [pts[1][0] - pts[0][0], pts[1][1] - pts[0][1]];
    const k = () => Math.floor(rand() * 5) - 2;
    const a = k();
    const b = k();
    pts[2] = [pts[0][0] + a * d[0], pts[0][1] + a * d[1]];
    pts[3] = [pts[0][0] + b * d[0], pts[0][1] + b * d[1]];
  } else if (r < 0.45) pts[3] = [...pts[2]] as XY;
  return pts;
}

describe('liTrace', () => {
  it('matches the Python functions (golden fixtures)', () => {
    const cases = fixtures.intersection as Array<{ s1: XY[]; s2: XY[]; o: number[]; intersect: boolean; segment: string | null; line: string | null; point?: XY; on?: boolean }>;
    expect(cases.length).toBeGreaterThanOrEqual(200);
    for (const c of cases) {
      const pts = [...c.s1, ...c.s2];
      const ops: LiOp[] = [
        { kind: 'segments', pts },
        { kind: 'lines', pts },
      ];
      if (c.point) ops.push({ kind: 'on', pts: [c.point, ...c.s1] });
      const run = liTrace(ops);
      const msg = JSON.stringify(c);
      expect(run.steps[0].o, msg).toEqual(c.o);
      expect(run.steps[0].intersect, msg).toBe(c.intersect);
      expect(run.steps[0].point, msg).toBe(c.segment);
      expect(run.steps[1].point, msg).toBe(c.line);
      if (c.point) expect(run.steps[2].on, msg).toBe(c.on);
    }
  });

  it('agrees with an exact rational reference on random segments', () => {
    const rand = rng(7);
    for (let t = 0; t < 400; t++) {
      const [p1, p2, p3, p4] = randomPair(rand);
      const run = liTrace([{ kind: 'segments', pts: [p1, p2, p3, p4] }]);
      const ref = reference(p1, p2, p3, p4);
      const step = run.steps[0];
      const msg = JSON.stringify([p1, p2, p3, p4]);
      expect(step.intersect, msg).toBe(ref.meet);
      expect(step.point === null, msg).toBe(!ref.meet);
      if (ref.meet) {
        const m = step.point!.match(/^Point\((-?[\d.e+-]+), (-?[\d.e+-]+)\)$/)!;
        const got: XY = [Number(m[1]), Number(m[2])];
        // The returned point lies on both segments (exactly for the integer answers).
        expect(ref.common.some((c) => Math.abs(c[0] / c[2] - got[0]) < 1e-9 && Math.abs(c[1] / c[2] - got[1]) < 1e-9), msg).toBe(true);
        const denom = (p1[0] - p2[0]) * (p3[1] - p4[1]) - (p1[1] - p2[1]) * (p3[0] - p4[0]);
        if (denom === 0) {
          // Collinear: the first common point in (x, y) order.
          const ints = ref.common.filter((c) => c[2] === 1).map((c): XY => [c[0], c[1]]);
          const first = ints.reduce((a, b) => (lexLess(b, a) ? b : a));
          expect(got, msg).toEqual(first);
        }
      }
      expectWellFormedPlane(run.frames, LI_CODE.length);
    }
  });

  it('point_on_segment agrees with the exact reference', () => {
    const rand = rng(9);
    for (let t = 0; t < 200; t++) {
      const [a, b, p] = randomPair(rand);
      const step = liTrace([{ kind: 'on', pts: [p, a, b] }]).steps[0];
      expect(step.on).toBe(onSegmentExact([p[0], p[1], 1], a, b));
    }
  });

  it('shows the four orientations one by one, each as a triangle filled by its sign', () => {
    const run = liTrace(parseLi('segments (0,0) (4,4) (0,4) (4,0)'));
    const tris = run.frames.filter((f) => f.state.polygons?.some((p) => p.id === 'o')).map((f) => f.state.polygons!.find((p) => p.id === 'o')!);
    expect(tris.map((p) => p.label)).toEqual(['o1 +16', 'o2 -16', 'o3 -16', 'o4 +16']);
    expect(tris.map((p) => p.role)).toEqual(['compare', 'active', 'active', 'compare']);
    expect(run.steps[0]).toMatchObject({ o: [16, -16, -16, 16], intersect: true, point: 'Point(2.0, 2.0)' });
  });

  it('handles the cases v0.2.0 fixed: collinear overlap, touching ends, a point segment', () => {
    const run = liTrace(parseLi('seg (0,0) (2,0) (1,0) (3,0), seg (0,0) (1,0) (1,0) (2,0), seg (0,0) (2,0) (1,0) (1,0), seg (0,0) (1,0) (2,0) (3,0), seg (0,0) (4,0) (2,0) (2,3)'));
    expect(run.steps.map((s) => s.point)).toEqual(['Point(1, 0)', 'Point(1, 0)', 'Point(1, 0)', null, 'Point(2, 0)']);
    expect(run.steps[3].o).toEqual([0, 0, 0, 0]);
  });

  it('line_intersection: None for parallel lines, a float point otherwise, even outside the segments', () => {
    const run = liTrace(parseLi('lines (0,0) (2,0) (0,1) (2,1), lines (0,0) (1,1) (3,0) (3,5), lines (2,2) (2,2) (0,0) (1,0)'));
    expect(run.steps.map((s) => s.point)).toEqual([null, 'Point(3.0, 3.0)', null]);
  });
});

describe('parseLi', () => {
  it('reads the operations', () => {
    expect(parseLi('segments (0,0) (4,4) (0,4) (4,0); lines (0,0) (1,1) (3,0) (3,5)\non (1,0) (0,0) (2,0)').map((o) => o.kind)).toEqual(['segments', 'lines', 'on']);
  });

  it('rejects bad input', () => {
    expect(() => parseLi('')).toThrow(InputError);
    expect(() => parseLi('cross (0,0)')).toThrow(/Cannot read/);
    expect(() => parseLi('segments (0,0) (4,4) (0,4)')).toThrow(/four points/);
    expect(() => parseLi('on (0,0) (4,4)')).toThrow(/the point, then the two ends/);
    expect(() => parseLi('segments (0,0) (4,4) (0,4) (4,x)')).toThrow(InputError);
  });
});

it('cross is the code expression', () => {
  expect(cross([0, 0], [4, 4], [0, 4])).toBe(16);
});
