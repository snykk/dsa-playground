/**
 * Segment and line intersection tracer, drawn with PlaneView: the two segments as vectors,
 * the triangle of each orientation test filled by its sign, the bounding-box checks of the
 * collinear cases, and the point the code returns.
 *
 * Mirrors Algorithms/Computational_Geometry/Basic_Geometry/Line_Intersection/Python/line_intersection.py:
 * segments_intersect (o1 = cross(p1, p2, p3), o2 = cross(p1, p2, p4), o3 = cross(p3, p4, p1),
 * o4 = cross(p3, p4, p2); a proper crossing when both pairs have strictly opposite signs,
 * otherwise an endpoint with a zero orientation that lies in the other segment's bounding box,
 * tested in the order o1, o2, o3, o4), segment_intersection (None if they do not meet; for
 * denom == 0 the larger of the two (x, y)-smaller ends; an endpoint with a zero orientation is
 * returned as it is; otherwise line_intersection), line_intersection (None for denom == 0,
 * else p1 + t (p2 - p1)) and point_on_segment. Every test is exact. A point the code builds
 * from floats prints as Point(2.0, 2.0), an endpoint it returns as given prints as Point(2, 0).
 * Golden fixtures (__fixtures__/geometry.json) pin the four orientations and every result.
 *
 * Input: "segments (0,0) (4,4) (0,4) (4,0), lines (0,0) (1,1) (3,0) (3,5), on (1,0) (0,0) (2,0)"
 */
import { InputError, type Frame, type Role } from '../core/types';
import type { PlaneLine, PlanePoint, PlanePolygon, PlaneSegment, PlaneState, XY } from '../renderers/PlaneView';
import { scriptSegments } from './hashTable';
import { approx, cross, lexLess, ptText, pyFloat, readPoints, signed, signRole } from './pointLineCircle';
import { opStrip } from './segmentTree';

export type LiKind = 'segments' | 'lines' | 'on';

export interface LiOp {
  kind: LiKind;
  /** segments, lines: p1, p2, p3, p4; on: p, then the segment's two ends. */
  pts: XY[];
}

export const LI_LIMITS = { maxOps: 8 };

const LI_NAMES: Record<string, LiKind> = {
  segments: 'segments',
  segment: 'segments',
  seg: 'segments',
  intersect: 'segments',
  segment_intersection: 'segments',
  segments_intersect: 'segments',
  lines: 'lines',
  line: 'lines',
  line_intersection: 'lines',
  on: 'on',
  point_on_segment: 'on',
};

const LI_EXAMPLE: Record<LiKind, string> = {
  segments: 'segments (0,0) (4,4) (0,4) (4,0)',
  lines: 'lines (0,0) (1,1) (3,0) (3,5)',
  on: 'on (1,0) (0,0) (2,0)',
};

export function parseLi(text: string): LiOp[] {
  const ops = scriptSegments(text).map((segment): LiOp => {
    const m = segment.match(/^([A-Za-z_]+)\s*(.*)$/);
    const kind = m && LI_NAMES[m[1].toLowerCase()];
    if (!m || !kind) throw new InputError(`Cannot read "${segment}". Use ${Object.values(LI_EXAMPLE).map((e) => `"${e}"`).join(', ')}, separated by commas.`);
    const pts = readPoints(m[2], segment);
    const want = kind === 'on' ? 3 : 4;
    if (pts.length !== want) {
      throw new InputError(
        kind === 'on'
          ? `"${segment}": on takes the point, then the two ends of the segment, as in "${LI_EXAMPLE.on}".`
          : `"${segment}": ${kind} takes four points, p1 p2 of the first and p3 p4 of the second, as in "${LI_EXAMPLE[kind]}".`,
      );
    }
    return { kind, pts };
  });
  if (ops.length === 0) throw new InputError(`Add at least one operation, for example "${LI_EXAMPLE.segments}".`);
  if (ops.length > LI_LIMITS.maxOps) throw new InputError(`At most ${LI_LIMITS.maxOps} operations, please (got ${ops.length}).`);
  return ops;
}

export function formatLiOp(op: LiOp): string {
  const [a, b, c, d] = op.pts.map(ptText);
  if (op.kind === 'on') return `point_on_segment(${a}, ${b}-${c})`;
  return `${op.kind === 'segments' ? 'segment_intersection' : 'line_intersection'}(${a}-${b}, ${c}-${d})`;
}

export const LI_CODE = [
  'cross_product(o, a, b) = (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x)',
  'segments_intersect(l1, l2): o1 = cross_product(p1, p2, p3); o2 = cross_product(p1, p2, p4)',
  '  o3 = cross_product(p3, p4, p1); o4 = cross_product(p3, p4, p2)',
  '  if _sign(o1) * _sign(o2) < 0 and _sign(o3) * _sign(o4) < 0: return True   # proper crossing',
  '  if o1 == 0 and _within_box(p1, p2, p3): return True       # p3 lies on segment 1',
  '  if o2 == 0 and _within_box(p1, p2, p4): return True',
  '  if o3 == 0 and _within_box(p3, p4, p1): return True',
  '  if o4 == 0 and _within_box(p3, p4, p2): return True',
  '  return False',
  'segment_intersection(l1, l2): if not segments_intersect(l1, l2): return None',
  '  denom = (p1.x - p2.x) * (p3.y - p4.y) - (p1.y - p2.y) * (p3.x - p4.x)',
  '  if denom == 0: return max(min(p1, p2), min(p3, p4))      # by (x, y): where the overlap starts',
  '  if cross_product(p1, p2, p3) == 0: return p3   # likewise p4, p1, p2: an endpoint, exactly',
  '  return line_intersection(l1, l2)',
  'line_intersection(l1, l2): denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4)',
  '  if denom == 0: return None                     # parallel, coincident, or no direction',
  '  t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom',
  '  return Point(x1 + t * (x2 - x1), y1 + t * (y2 - y1))',
  'point_on_segment(p, line): if cross_product(line.p1, line.p2, p) != 0: return False',
  '  return _within_box(line.p1, line.p2, p)',
];

const L = { o12: 1, o34: 2, proper: 3, box: [4, 5, 6, 7], none: 8, segEntry: 9, denom: 10, collinear: 11, endpoint: 12, toLine: 13, lineDenom: 14, parallel: 15, t: 16, point: 17, onCross: 18, onBox: 19 };

/** Python's repr of the Point the code returns: ints as given, floats as computed. */
export const pointRepr = (p: XY, isFloat: boolean) => `Point(${isFloat ? pyFloat(p[0]) : p[0]}, ${isFloat ? pyFloat(p[1]) : p[1]})`;

const sign = (v: number) => (v > 0 ? 1 : v < 0 ? -1 : 0);

export function withinBox(a: XY, b: XY, p: XY): boolean {
  return Math.min(a[0], b[0]) <= p[0] && p[0] <= Math.max(a[0], b[0]) && Math.min(a[1], b[1]) <= p[1] && p[1] <= Math.max(a[1], b[1]);
}

/** line_intersection's arithmetic, in the code's order. */
export function lineIntersection(p1: XY, p2: XY, p3: XY, p4: XY): { denom: number; num: number; t: number; point: XY } | { denom: 0 } {
  const [x1, y1] = p1;
  const [x2, y2] = p2;
  const [x3, y3] = p3;
  const [x4, y4] = p4;
  // + 0: Python's int 0 has no sign; a JavaScript -0 would turn 0 / denom into the wrong signed zero.
  const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4) + 0;
  if (denom === 0) return { denom: 0 };
  const num = (x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4) + 0;
  const t = num / denom;
  return { denom, num, t, point: [x1 + t * (x2 - x1), y1 + t * (y2 - y1)] };
}

/* ---------- tracer ---------- */

export interface LiStep {
  op: LiOp;
  /** segments: the four orientations. */
  o?: [number, number, number, number];
  intersect?: boolean;
  /** segments, lines: the repr of the returned Point, or null for None. */
  point?: string | null;
  /** on: point_on_segment. */
  on?: boolean;
}

export interface LiRun {
  frames: Array<Frame<PlaneState>>;
  steps: LiStep[];
}

const signWord = (v: number) => (v > 0 ? 'left of' : v < 0 ? 'right of' : 'on');

export function liTrace(ops: LiOp[]): LiRun {
  const frames: Array<Frame<PlaneState>> = [];
  const steps: LiStep[] = [];
  const names = ops.map(formatLiOp);
  let current = -1;

  interface Pic {
    points: PlanePoint[];
    segments?: PlaneSegment[];
    polygons?: PlanePolygon[];
    lines?: PlaneLine[];
    include?: XY[];
    note?: string;
  }
  const snap = (line: number | undefined, caption: string, pic: Pic, vars: Array<[string, string | number]> = [], extra: Array<{ label: string; items: Array<{ text: string; role?: Role }> }> = []) => {
    frames.push({
      line,
      caption,
      vars,
      state: { label: current >= 0 && current < ops.length ? names[current] : 'two segments', ...pic, strips: [opStrip(names, current), ...extra] },
    });
  };

  const endpoints = (op: LiOp, roles: Record<number, Role> = {}): PlanePoint[] => {
    const tags = op.kind === 'on' ? ['p', 'a', 'b'] : ['p1', 'p2', 'p3', 'p4'];
    return op.pts.map((p, i) => ({ id: `arg${i}`, at: p, label: `${tags[i]} ${ptText(p)}`, role: roles[i] }));
  };
  const vectors = (op: LiOp, roles: Role[] = ['idle', 'idle']): PlaneSegment[] =>
    op.kind === 'on'
      ? [{ id: 'l1', a: op.pts[1], b: op.pts[2], arrow: true, grow: true, role: roles[0], label: 'segment' }]
      : [
          { id: 'l1', a: op.pts[0], b: op.pts[1], arrow: true, grow: true, role: roles[0], label: 'l1' },
          { id: 'l2', a: op.pts[2], b: op.pts[3], arrow: true, grow: true, role: roles[1], label: 'l2' },
        ];
  const boxOf = (a: XY, b: XY): PlanePolygon => {
    const x0 = Math.min(a[0], b[0]);
    const x1 = Math.max(a[0], b[0]);
    const y0 = Math.min(a[1], b[1]);
    const y1 = Math.max(a[1], b[1]);
    return { id: 'box', pts: [[x0, y0], [x1, y0], [x1, y1], [x0, y1]], role: 'done', dashed: true };
  };
  const orientStrip = (o: Array<number | null>) => ({ label: 'Orientations', items: o.map((v, k) => ({ text: `o${k + 1} ${v === null ? '?' : signed(v)}`, role: v === null ? undefined : signRole(v) })) });

  snap(undefined, `${ops.length} operation${ops.length === 1 ? '' : 's'}. Every decision is the sign of a cross product, compared with 0 exactly, so touching, T-shaped and collinear segments are all decided correctly.`, {
    points: endpoints(ops[0]),
    segments: vectors(ops[0]),
  });

  ops.forEach((op, index) => {
    current = index;
    const head = names[index];
    if (op.kind === 'on') {
      const [p, a, b] = op.pts;
      const c = cross(a, b, p);
      snap(
        L.onCross,
        `${head}: cross_product(a, b, p) = ${c}. ` + (c !== 0 ? `It is not 0, so p is ${signWord(c)} the line through the segment, not on it: return False.` : 'It is 0: p lies on the infinite line through a and b. Whether it is between them is a separate question.'),
        { points: endpoints(op, { 0: c !== 0 ? 'bad' : 'compare' }), segments: vectors(op), polygons: [{ id: 'o', pts: [a, b, p], role: signRole(c), label: signed(c) }] },
        [['cross', c]],
      );
      let on = false;
      if (c === 0) {
        on = withinBox(a, b, p);
        const xIn = Math.min(a[0], b[0]) <= p[0] && p[0] <= Math.max(a[0], b[0]);
        const yIn = Math.min(a[1], b[1]) <= p[1] && p[1] <= Math.max(a[1], b[1]);
        snap(
          L.onBox,
          `_within_box(a, b, p): x = ${p[0]} ${xIn ? 'is' : 'is not'} in [${Math.min(a[0], b[0])}, ${Math.max(a[0], b[0])}] and y = ${p[1]} ${yIn ? 'is' : 'is not'} in [${Math.min(a[1], b[1])}, ${Math.max(a[1], b[1])}]. ` +
            (on ? 'p is on the segment: return True.' : 'p is on the line but beyond the segment: return False.'),
          { points: endpoints(op, { 0: on ? 'good' : 'bad' }), segments: vectors(op), polygons: [boxOf(a, b)] },
          [['cross', c], ['within box', on ? 'True' : 'False']],
        );
      }
      steps.push({ op, on });
      return;
    }

    const [p1, p2, p3, p4] = op.pts;
    if (op.kind === 'lines') {
      const lines = (
        [
          { id: 'line1', at: p1, dir: [p2[0] - p1[0], p2[1] - p1[1]], role: 'idle', dashed: true },
          { id: 'line2', at: p3, dir: [p4[0] - p3[0], p4[1] - p3[1]], role: 'idle', dashed: true },
        ] as PlaneLine[]
      ).filter((l) => l.dir[0] !== 0 || l.dir[1] !== 0);
      const r = lineIntersection(p1, p2, p3, p4);
      const [x1, y1] = p1;
      const [x2, y2] = p2;
      const [x3, y3] = p3;
      const [x4, y4] = p4;
      snap(
        L.lineDenom,
        `${head}: the infinite lines through p1, p2 and through p3, p4. denom = (${x1} - ${x2}) * (${y3} - ${y4}) - (${y1} - ${y2}) * (${x3} - ${x4}) = ${r.denom}, the cross product of the two directions.`,
        { points: endpoints(op), segments: vectors(op), lines },
        [['denom', r.denom]],
      );
      if (r.denom === 0) {
        snap(
          L.parallel,
          `denom == 0: the directions are parallel${samePair(p1, p2) || samePair(p3, p4) ? ' (a Line whose two ends are equal has no direction at all)' : ''}. Parallel and coincident lines have no single meeting point, so line_intersection returns None.`,
          { points: endpoints(op), segments: vectors(op, ['bad', 'bad']), lines },
          [['denom', 0]],
        );
        steps.push({ op, point: null });
        return;
      }
      const { num, t, point } = r as { num: number; t: number; point: XY };
      const local = [p1, p2, p3, p4];
      const span = Math.max(4, ...local.map((p) => Math.abs(p[0] - p1[0])), ...local.map((p) => Math.abs(p[1] - p1[1])));
      const near = Math.abs(point[0] - p1[0]) <= 2 * span && Math.abs(point[1] - p1[1]) <= 2 * span;
      snap(
        L.t,
        `t = ((${x1} - ${x3}) * (${y3} - ${y4}) - (${y1} - ${y3}) * (${x3} - ${x4})) / denom = ${num} / ${r.denom} = ${pyFloat(t)}. ` +
          `t says how far along p1 -> p2 the lines meet: ${t >= 0 && t <= 1 ? 'between 0 and 1, so inside the first segment' : 'outside [0, 1], so beyond the first segment; line_intersection does not care'}.`,
        { points: endpoints(op), segments: [...vectors(op), ...(near ? [{ id: 'walk', a: p1, b: point, role: 'compare' as Role, grow: true, label: `t ${approx(t)}` }] : [])], lines, include: near ? [point] : [] },
        [['denom', r.denom], ['t', pyFloat(t)]],
      );
      const repr = pointRepr(point, true);
      snap(
        L.point,
        `x = x1 + t * (x2 - x1) and y = y1 + t * (y2 - y1) give ${repr}. The point is built from floats, so it prints with decimals even when it is a whole number.` +
          (near ? '' : ` It lies far outside this picture.`),
        { points: [...endpoints(op), ...(near ? [{ id: 'x', at: point, label: `${approx(point[0])}, ${approx(point[1])}`, role: 'good' as Role, labelDir: 'n' as const }] : [])], segments: vectors(op), lines, include: near ? [point] : [] },
        [['denom', r.denom], ['t', pyFloat(t)], ['result', repr]],
      );
      steps.push({ op, point: repr });
      return;
    }

    // segment_intersection, which first calls segments_intersect.
    const o1 = cross(p1, p2, p3);
    const o2 = cross(p1, p2, p4);
    const o3 = cross(p3, p4, p1);
    const o4 = cross(p3, p4, p2);
    const o: [number, number, number, number] = [o1, o2, o3, o4];
    const tests: Array<{ base: [XY, XY]; tip: XY; tipIndex: number; text: string }> = [
      { base: [p1, p2], tip: p3, tipIndex: 2, text: 'o1 = cross_product(p1, p2, p3)' },
      { base: [p1, p2], tip: p4, tipIndex: 3, text: 'o2 = cross_product(p1, p2, p4)' },
      { base: [p3, p4], tip: p1, tipIndex: 0, text: 'o3 = cross_product(p3, p4, p1)' },
      { base: [p3, p4], tip: p2, tipIndex: 1, text: 'o4 = cross_product(p3, p4, p2)' },
    ];
    snap(
      L.segEntry,
      `${head}: first ask segments_intersect whether the segments share any point at all. Four orientations decide it: where each end of one segment lies relative to the other segment's line.`,
      { points: endpoints(op), segments: vectors(op) },
      [],
      [orientStrip([null, null, null, null])],
    );
    tests.forEach((t, k) => {
      const v = o[k];
      const roles: Role[] = k < 2 ? ['compare', 'idle'] : ['idle', 'compare'];
      const which = k < 2 ? 'p1 -> p2' : 'p3 -> p4';
      snap(
        k < 2 ? L.o12 : L.o34,
        `${t.text} = ${v}: p${t.tipIndex + 1} is ${signWord(v)} the line ${which}` + (v === 0 ? ', collinear with it.' : ` (${v > 0 ? 'a left turn' : 'a right turn'}).`),
        { points: endpoints(op, { [t.tipIndex]: 'active' }), segments: vectors(op, roles), polygons: [{ id: 'o', pts: [t.base[0], t.base[1], t.tip], role: signRole(v), label: `o${k + 1} ${signed(v)}` }] },
        o.slice(0, k + 1).map((x, j): [string, number] => [`o${j + 1}`, x]),
        [orientStrip(o.map((x, j) => (j <= k ? x : null)))],
      );
    });
    const allVars = o.map((x, j): [string, number] => [`o${j + 1}`, x]);
    const strip = [orientStrip(o)];
    let intersect = false;
    const proper = sign(o1) * sign(o2) < 0 && sign(o3) * sign(o4) < 0;
    if (proper) {
      intersect = true;
      snap(
        L.proper,
        `o1 and o2 have opposite signs, so p3 and p4 lie on opposite sides of l1; o3 and o4 have opposite signs, so p1 and p2 lie on opposite sides of l2. Each segment straddles the other's line: a proper crossing, True.`,
        { points: endpoints(op), segments: vectors(op, ['compare', 'compare']) },
        allVars,
        strip,
      );
    } else {
      const why =
        sign(o1) * sign(o2) > 0
          ? 'o1 and o2 have the same sign, so p3 and p4 are on the same side of l1'
          : sign(o3) * sign(o4) > 0
            ? 'o3 and o4 have the same sign, so p1 and p2 are on the same side of l2'
            : 'at least one orientation is 0';
      snap(L.proper, `No proper crossing: ${why}. What is left are the touching cases, where an endpoint lies on the other segment.`, { points: endpoints(op), segments: vectors(op) }, allVars, strip);
      for (let k = 0; k < 4 && !intersect; k++) {
        if (o[k] !== 0) continue;
        const t = tests[k];
        const inside = withinBox(t.base[0], t.base[1], t.tip);
        const seg = k < 2 ? 'l1' : 'l2';
        snap(
          L.box[k],
          `o${k + 1} == 0, so p${t.tipIndex + 1} is on the line of ${seg}. _within_box checks it is also between that segment's ends: ` +
            (inside ? `it is, so p${t.tipIndex + 1} lies on ${seg} and the segments meet: True.` : `it is not, so p${t.tipIndex + 1} is on the line but beyond ${seg}.`),
          { points: endpoints(op, { [t.tipIndex]: inside ? 'good' : 'bad' }), segments: vectors(op, k < 2 ? ['compare', 'idle'] : ['idle', 'compare']), polygons: [boxOf(t.base[0], t.base[1])] },
          allVars,
          strip,
        );
        intersect = inside;
      }
      if (!intersect) {
        snap(
          L.none,
          `No rule applies, so segments_intersect returns False and segment_intersection returns None.${o.every((v) => v === 0) ? ' All four orientations are 0: the segments are collinear but do not overlap.' : ''}`,
          { points: endpoints(op), segments: vectors(op, ['bad', 'bad']) },
          allVars,
          strip,
        );
        steps.push({ op, o, intersect, point: null });
        return;
      }
    }
    const denom = (p1[0] - p2[0]) * (p3[1] - p4[1]) - (p1[1] - p2[1]) * (p3[0] - p4[0]) + 0;
    let repr: string;
    if (denom === 0) {
      const lo1 = lexLess(p2, p1) ? p2 : p1;
      const lo2 = lexLess(p4, p3) ? p4 : p3;
      const pick = lexLess(lo1, lo2) ? lo2 : lo1;
      repr = pointRepr(pick, false);
      snap(
        L.collinear,
        `They meet, and denom = 0: the segments are collinear (or one is a single point), so they may share a whole stretch. ` +
          `Ordering points by (x, y), the lower ends are ${ptText(lo1)} and ${ptText(lo2)}; the overlap starts at the larger one, ${ptText(pick)}. Return ${repr}.`,
        { points: [...endpoints(op), { id: 'x', at: pick, label: 'result', role: 'good', labelDir: 'n' }], segments: vectors(op, ['done', 'done']) },
        [...allVars, ['denom', 0], ['result', repr]],
        strip,
      );
    } else {
      const k = o.findIndex((v) => v === 0);
      if (k >= 0) {
        const t = tests[k];
        repr = pointRepr(t.tip, false);
        snap(
          L.endpoint,
          `They meet, and denom = ${denom} is not 0, so there is one common point. o${k + 1} = 0 puts p${t.tipIndex + 1} on the other segment's line: it is the common point, returned exactly as given, ${repr}.`,
          { points: endpoints(op, { [t.tipIndex]: 'good' }), segments: vectors(op, ['done', 'done']) },
          [...allVars, ['denom', denom], ['result', repr]],
          strip,
        );
      } else {
        const r = lineIntersection(p1, p2, p3, p4) as { num: number; t: number; point: XY };
        repr = pointRepr(r.point, true);
        snap(
          L.toLine,
          `They cross properly, so no endpoint is the answer: line_intersection computes it. denom = ${denom}, t = ${r.num} / ${denom} = ${pyFloat(r.t)}, and p1 + t (p2 - p1) = ${repr}.`,
          {
            points: [...endpoints(op), { id: 'x', at: r.point, label: `${approx(r.point[0])}, ${approx(r.point[1])}`, role: 'good', labelDir: 'n' }],
            segments: [...vectors(op, ['done', 'done']), { id: 'walk', a: p1, b: r.point, role: 'compare', grow: true, label: `t ${approx(r.t)}` }],
          },
          [...allVars, ['denom', denom], ['t', pyFloat(r.t)], ['result', repr]],
          strip,
        );
      }
    }
    steps.push({ op, o, intersect, point: repr });
  });

  current = ops.length;
  const last = frames[frames.length - 1].state;
  snap(undefined, `Done: ${ops.length} operation${ops.length === 1 ? '' : 's'}. No step divided before the orientations had decided, so no case needed a tolerance.`, {
    points: last.points,
    segments: last.segments,
    lines: last.lines,
    include: last.include,
  });
  return { frames, steps };
}

const samePair = (a: XY, b: XY) => a[0] === b[0] && a[1] === b[1];
