/**
 * Point, line and circle tracer, drawn with PlaneView: one picture per operation, the points
 * of one operation gliding to those of the next.
 *
 * Mirrors Algorithms/Computational_Geometry/Basic_Geometry/Point_Line_Circle/Python/point_line_circle.py:
 * Point.distance_to / distance_squared, Line.length / slope / is_vertical / is_horizontal,
 * Circle (ValueError for a negative radius) .contains_point / point_on_circle / area /
 * circumference, cross_product, dot_product, orientation (0 collinear, 1 clockwise,
 * 2 counterclockwise), angle_between_points (atan2(|cross|, dot), 0.0 when a vector has no
 * length) and point_in_triangle (False for a triangle without area). Every test is exact:
 * with integer coordinates the products are exact in JavaScript too, as they are in Python.
 * Golden fixtures (__fixtures__/geometry.json) pin every result.
 *
 * This module also holds what the other geometry tracers share: the cross product, Python's
 * float repr and the point syntax.
 *
 * Input: "orientation (0,0) (4,4) (1,2), circle (0,0) 5 (3,4), triangle (2,1) (0,0) (4,0) (2,4)"
 */
import { InputError, type Frame, type Role } from '../core/types';
import type { PlanePoint, PlanePolygon, PlaneSegment, PlaneState, XY } from '../renderers/PlaneView';
import { scriptSegments } from './hashTable';
import { opStrip } from './segmentTree';

export type { XY } from '../renderers/PlaneView';

/* ---------- shared by the geometry tracers ---------- */

/** Whole-number coordinates from -9999 to 9999: every product the code forms stays exact. */
export const COORD_LIMIT = 9999;

/**
 * cross_product(o, a, b) = (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x), in the code's
 * order. Python's ints have no negative zero, so a -0 (from 0 * -3) is turned into 0.
 */
export function cross(o: XY, a: XY, b: XY): number {
  return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]) + 0;
}

/** dot_product(o, a, b) = (a.x - o.x) * (b.x - o.x) + (a.y - o.y) * (b.y - o.y). */
export function dot(o: XY, a: XY, b: XY): number {
  return (a[0] - o[0]) * (b[0] - o[0]) + (a[1] - o[1]) * (b[1] - o[1]) + 0;
}

/** distance_squared(p, q) = (p.x - q.x) ** 2 + (p.y - q.y) ** 2. */
export function dist2(p: XY, q: XY): number {
  const dx = p[0] - q[0];
  const dy = p[1] - q[1];
  return dx * dx + dy * dy;
}

export const samePoint = (a: XY, b: XY) => a[0] === b[0] && a[1] === b[1];

/** (x, y) order, as Python compares tuples. */
export const lexLess = (a: XY, b: XY) => a[0] < b[0] || (a[0] === b[0] && a[1] < b[1]);

/** Python's repr of a float: the shortest digits that round-trip, '5.0', '1e-05', 'inf', 'nan'. */
export function pyFloat(v: number): string {
  if (Number.isNaN(v)) return 'nan';
  if (!Number.isFinite(v)) return v > 0 ? 'inf' : '-inf';
  if (v === 0) return Object.is(v, -0) ? '-0.0' : '0.0';
  const [mant, expText] = v.toExponential().split('e');
  const exp = Number(expText);
  const neg = mant.startsWith('-');
  const digits = mant.replace('-', '').replace('.', '');
  let body: string;
  if (exp < -4 || exp >= 16) {
    body = `${digits[0]}${digits.length > 1 ? `.${digits.slice(1)}` : ''}e${exp < 0 ? '-' : '+'}${String(Math.abs(exp)).padStart(2, '0')}`;
  } else if (exp < 0) {
    body = `0.${'0'.repeat(-exp - 1)}${digits}`;
  } else {
    body = `${digits.slice(0, exp + 1).padEnd(exp + 1, '0')}.${digits.slice(exp + 1) || '0'}`;
  }
  return neg ? `-${body}` : body;
}

/** A value as Python prints it: ints stay ints, floats get the float repr, booleans True / False. */
export function pyRepr(v: number | boolean, isFloat = false): string {
  if (typeof v === 'boolean') return v ? 'True' : 'False';
  return isFloat ? pyFloat(v) : String(v);
}

/** A short decimal for captions: 2.828 rather than 2.8284271247461903. */
export function approx(v: number, digits = 3): string {
  if (!Number.isFinite(v)) return pyFloat(v);
  return Number.isInteger(v) ? String(v) : String(Number(v.toFixed(digits)));
}

export const ptText = (p: XY) => `(${p[0]}, ${p[1]})`;

/** The letter that names the i-th input point: A, B, ..., Z, then A2, B2... */
export function letter(i: number): string {
  return String.fromCharCode(65 + (i % 26)) + (i >= 26 ? String(Math.floor(i / 26) + 1) : '');
}

/** Read "(x, y)" groups and whole numbers from text, in order; anything else is an error. */
export function readArgs(text: string, where: string): Array<XY | number> {
  const out: Array<XY | number> = [];
  const rest = text.replace(/\(\s*(-?\d+)\s*,\s*(-?\d+)\s*\)|(-?\d+(?:\.\d+)?)/g, (_, a?: string, b?: string, n?: string) => {
    if (n !== undefined) {
      if (!/^-?\d+$/.test(n)) throw new InputError(`Use whole numbers (got ${n} in "${where}"): integer input keeps every test exact.`);
      out.push(Number(n) || 0);
      return ' ';
    }
    const x = Number(a) || 0;
    const y = Number(b) || 0;
    if (Math.abs(x) > COORD_LIMIT || Math.abs(y) > COORD_LIMIT) throw new InputError(`Coordinates go from -${COORD_LIMIT} to ${COORD_LIMIT} (got (${a}, ${b}) in "${where}").`);
    out.push([x, y]);
    return ' ';
  });
  if (rest.trim()) throw new InputError(`Cannot read "${rest.trim()}" in "${where}". Write points as (x, y) with whole numbers, for example (4, 2).`);
  return out;
}

/** A list of points only: "(0,3) (2,2) (1,1)". */
export function readPoints(text: string, what: string): XY[] {
  const args = readArgs(text, text.trim() || what);
  for (const a of args) if (typeof a === 'number') throw new InputError(`"${a}" is not a point: write each point as (x, y), for example (4, 2).`);
  return args as XY[];
}

/* ---------- input ---------- */

export type PlcKind = 'distance' | 'line' | 'cross' | 'orientation' | 'dot' | 'angle' | 'triangle' | 'circle';

export interface PlcOp {
  kind: PlcKind;
  pts: XY[];
  /** circle: the radius (a negative one raises ValueError). */
  radius?: number;
}

export const PLC_LIMITS = { maxOps: 10 };

const PLC_NAMES: Record<string, PlcKind> = {
  distance: 'distance',
  dist: 'distance',
  distance_to: 'distance',
  line: 'line',
  slope: 'line',
  length: 'line',
  cross: 'cross',
  cross_product: 'cross',
  orientation: 'orientation',
  orient: 'orientation',
  turn: 'orientation',
  dot: 'dot',
  dot_product: 'dot',
  angle: 'angle',
  angle_between_points: 'angle',
  triangle: 'triangle',
  tri: 'triangle',
  point_in_triangle: 'triangle',
  circle: 'circle',
  contains: 'circle',
  contains_point: 'circle',
};

const PLC_ARITY: Record<Exclude<PlcKind, 'circle'>, number> = { distance: 2, line: 2, cross: 3, orientation: 3, dot: 3, angle: 3, triangle: 4 };

const PLC_EXAMPLE: Record<PlcKind, string> = {
  distance: 'distance (0,0) (3,4)',
  line: 'line (0,0) (3,4)',
  cross: 'cross (0,0) (4,4) (1,2)',
  orientation: 'orientation (0,0) (4,4) (1,2)',
  dot: 'dot (0,0) (3,4) (2,1)',
  angle: 'angle (0,0) (3,4) (2,1)',
  triangle: 'triangle (2,1) (0,0) (4,0) (2,4)',
  circle: 'circle (0,0) 5 (3,4)',
};

/** "orientation (0,0) (4,4) (1,2), circle (0,0) 5 (3,4)". */
export function parsePlc(text: string): PlcOp[] {
  const ops = scriptSegments(text).map((segment): PlcOp => {
    const m = segment.match(/^([A-Za-z_]+)\s*(.*)$/);
    const kind = m && PLC_NAMES[m[1].toLowerCase()];
    if (!m || !kind) {
      throw new InputError(`Cannot read "${segment}". Start each operation with distance, line, cross, orientation, dot, angle, triangle or circle, then its points.`);
    }
    const args = readArgs(m[2], segment);
    if (kind === 'circle') {
      const [c, r, p] = args;
      if (args.length !== 3 || typeof c === 'number' || typeof r !== 'number' || typeof p === 'number') {
        throw new InputError(`"${segment}": circle takes a center, a radius and a point to test, as in "${PLC_EXAMPLE.circle}".`);
      }
      if (Math.abs(r) > COORD_LIMIT) throw new InputError(`The radius goes from -${COORD_LIMIT} to ${COORD_LIMIT} (got ${r}).`);
      return { kind, pts: [c, p], radius: r };
    }
    if (args.length !== PLC_ARITY[kind] || args.some((a) => typeof a === 'number')) {
      throw new InputError(`"${segment}": ${kind} takes ${PLC_ARITY[kind]} points, as in "${PLC_EXAMPLE[kind]}".`);
    }
    return { kind, pts: args as XY[] };
  });
  if (ops.length === 0) throw new InputError(`Add at least one operation, for example "${PLC_EXAMPLE.orientation}".`);
  if (ops.length > PLC_LIMITS.maxOps) throw new InputError(`At most ${PLC_LIMITS.maxOps} operations, please (got ${ops.length}).`);
  return ops;
}

export function formatPlcOp(op: PlcOp): string {
  const p = op.pts.map(ptText);
  switch (op.kind) {
    case 'distance':
      return `distance(${p.join(', ')})`;
    case 'line':
      return `Line(${p.join(', ')})`;
    case 'cross':
      return `cross_product(${p.join(', ')})`;
    case 'orientation':
      return `orientation(${p.join(', ')})`;
    case 'dot':
      return `dot_product(${p.join(', ')})`;
    case 'angle':
      return `angle_between_points(${p.join(', ')})`;
    case 'triangle':
      return `point_in_triangle(${p.join(', ')})`;
    default:
      return `Circle(${p[0]}, ${op.radius}) and ${p[1]}`;
  }
}

/* ---------- pseudocode ---------- */

export const PLC_CODE = [
  'Point.distance_squared(other): return (x - other.x) ** 2 + (y - other.y) ** 2',
  'Point.distance_to(other): return math.sqrt((x - other.x) ** 2 + (y - other.y) ** 2)',
  'Line.slope(): if p1 == p2: return nan                 # no direction',
  '  if p2.x == p1.x: return inf                          # vertical',
  '  return (p2.y - p1.y) / (p2.x - p1.x)',
  'Line.is_vertical(): p2.x == p1.x and p2.y != p1.y;  is_horizontal(): p2.y == p1.y and p2.x != p1.x',
  'cross_product(o, a, b): return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x)',
  'dot_product(o, a, b): return (a.x - o.x) * (b.x - o.x) + (a.y - o.y) * (b.y - o.y)',
  'orientation(p, q, r): val = cross_product(p, q, r)',
  '  if val == 0: return 0                                # collinear',
  '  return 2 if val > 0 else 1                           # counterclockwise : clockwise',
  'angle_between_points(o, a, b): if a == o or b == o: return 0.0',
  '  return math.atan2(abs(cross), dot)                   # in [0, pi]',
  'point_in_triangle(p, a, b, c): if cross_product(a, b, c) == 0: return False',
  '  d1 = cross_product(p, a, b); d2 = cross_product(p, b, c); d3 = cross_product(p, c, a)',
  '  has_neg = d1 < 0 or d2 < 0 or d3 < 0; has_pos = d1 > 0 or d2 > 0 or d3 > 0',
  '  return not (has_neg and has_pos)',
  'Circle(center, radius): if not radius >= 0: raise ValueError("radius must be non-negative")',
  '  contains_point(p): return center.distance_squared(p) <= radius * radius',
  '  point_on_circle(p): return center.distance_squared(p) == radius * radius',
];

const L = {
  dist2: 0,
  dist: 1,
  slopeNan: 2,
  slopeInf: 3,
  slope: 4,
  vertical: 5,
  cross: 6,
  dot: 7,
  orient: 8,
  orientZero: 9,
  orientSign: 10,
  angleZero: 11,
  angle: 12,
  triDegenerate: 13,
  triD: 14,
  triSigns: 15,
  triResult: 16,
  circle: 17,
  contains: 18,
  onCircle: 19,
};

/* ---------- tracer ---------- */

/** The result of one operation, in the shape of the golden fixture. */
export type PlcResult =
  | { distance_to: number; distance_squared: number }
  | { length: number; length_squared: number; slope: number | 'inf' | 'nan'; vertical: boolean; horizontal: boolean }
  | { contains: boolean; on: boolean; area: number; circumference: number }
  | number
  | boolean;

export interface PlcStep {
  op: PlcOp;
  result?: PlcResult;
  error?: string;
}

export interface PlcRun {
  frames: Array<Frame<PlaneState>>;
  steps: PlcStep[];
}

/** The role that shows the sign of a cross product: blue for a left turn, orange for a right turn. */
export const signRole = (v: number): Role => (v > 0 ? 'compare' : v < 0 ? 'active' : 'muted');

export const signed = (v: number) => (v > 0 ? `+${v}` : String(v));

const turnWord = (v: number) => (v > 0 ? 'the walk turns counterclockwise (a left turn)' : v < 0 ? 'the walk turns clockwise (a right turn)' : 'there is no turn: the three points are collinear');

const NAMES: Record<PlcKind, string[]> = {
  distance: ['p', 'q'],
  line: ['p1', 'p2'],
  cross: ['o', 'a', 'b'],
  orientation: ['p', 'q', 'r'],
  dot: ['o', 'a', 'b'],
  angle: ['o', 'a', 'b'],
  triangle: ['p', 'a', 'b', 'c'],
  circle: ['center', 'p'],
};

export function plcTrace(ops: PlcOp[]): PlcRun {
  const frames: Array<Frame<PlaneState>> = [];
  const steps: PlcStep[] = [];
  const names = ops.map(formatPlcOp);
  let current = -1;

  interface Pic {
    points?: PlanePoint[];
    segments?: PlaneSegment[];
    polygons?: PlanePolygon[];
    circles?: PlaneState['circles'];
    arcs?: PlaneState['arcs'];
    texts?: PlaneState['texts'];
  }

  const snap = (line: number | undefined, caption: string, pic: Pic, vars: Array<[string, string | number]> = []) => {
    frames.push({
      line,
      caption,
      vars,
      state: {
        label: current >= 0 && current < ops.length ? names[current] : 'the plane',
        points: pic.points ?? [],
        segments: pic.segments,
        polygons: pic.polygons,
        circles: pic.circles,
        arcs: pic.arcs,
        texts: pic.texts,
        strips: [opStrip(names, current)],
      },
    });
  };

  /** The points of an operation, named as the Python parameters, with ids by argument slot so they glide. */
  const pointsOf = (op: PlcOp, roles: Record<number, Role> = {}): PlanePoint[] =>
    op.pts.map((p, i) => ({ id: `arg${i}`, at: p, label: `${NAMES[op.kind][i]} ${ptText(p)}`, role: roles[i] }));

  const vec = (id: string, a: XY, b: XY, role: Role = 'idle', label?: string): PlaneSegment => ({ id, a, b, arrow: true, grow: true, role, label });

  snap(
    undefined,
    `${ops.length} operation${ops.length === 1 ? '' : 's'} on the plane. Each one runs a function of point_line_circle.py on whole-number points, so every product is exact and every sign test is reliable.`,
    { points: pointsOf(ops[0]) },
  );

  ops.forEach((op, index) => {
    current = index;
    const P = op.pts;
    const n = NAMES[op.kind];
    const head = names[index];
    let result: PlcResult | undefined;
    let error: string | undefined;

    if (op.kind === 'distance') {
      const [p, q] = P;
      const dx = p[0] - q[0];
      const dy = p[1] - q[1];
      const d2 = dist2(p, q);
      const d = Math.sqrt(d2);
      const corner: XY = [q[0], p[1]];
      const legs: PlaneSegment[] = [
        { id: 'leg-x', a: p, b: corner, role: 'compare', dashed: true, label: `dx ${dx === 0 ? 0 : -dx}` },
        { id: 'leg-y', a: corner, b: q, role: 'compare', dashed: true, label: `dy ${dy === 0 ? 0 : -dy}` },
      ];
      snap(
        L.dist2,
        `${head}: distance_squared adds the squares of the two differences, (${p[0]} - ${q[0]}) ** 2 + (${p[1]} - ${q[1]}) ** 2 = ${dx * dx} + ${dy * dy} = ${d2}. ` +
          'Squaring drops the sign, and comparing squared distances needs no square root.',
        { points: pointsOf(op), segments: legs },
        [['distance_squared', d2]],
      );
      snap(
        L.dist,
        `distance_to takes the square root: math.sqrt(${d2}) = ${pyFloat(d)}${Number.isInteger(d) ? '' : `, about ${approx(d)}`}. That is the length of the hypotenuse of the right triangle with legs |dx| = ${Math.abs(dx)} and |dy| = ${Math.abs(dy)}.`,
        { points: pointsOf(op, { 0: 'done', 1: 'done' }), segments: [...legs, { id: 'hyp', a: p, b: q, role: 'done', grow: true, label: approx(d) }] },
        [['distance_squared', d2], ['distance_to', pyFloat(d)]],
      );
      result = { distance_to: d, distance_squared: d2 };
    } else if (op.kind === 'line') {
      const [p1, p2] = P;
      const rise = p2[1] - p1[1];
      const run = p2[0] - p1[0];
      const len2 = dist2(p1, p2);
      const len = Math.sqrt(len2);
      const same = samePoint(p1, p2);
      const slope = same ? NaN : run === 0 ? Infinity : rise / run;
      const vertical = run === 0 && rise !== 0;
      const horizontal = rise === 0 && run !== 0;
      const corner: XY = [p2[0], p1[1]];
      const legs: PlaneSegment[] = same
        ? []
        : [
            { id: 'leg-x', a: p1, b: corner, role: 'compare', dashed: true, label: `run ${run}` },
            { id: 'leg-y', a: corner, b: p2, role: 'compare', dashed: true, label: `rise ${rise}` },
          ];
      const seg: PlaneSegment = { id: 'hyp', a: p1, b: p2, role: 'idle', grow: true };
      snap(
        same ? L.slopeNan : run === 0 ? L.slopeInf : L.slope,
        same
          ? `${head}: p1 == p2, so the line has length 0 and no direction. slope() returns nan instead of dividing 0 by 0.`
          : run === 0
            ? `${head}: p2.x == p1.x, so the run is 0 and the line is vertical. slope() returns inf instead of dividing by zero; the test is exact, so it does not depend on the scale.`
            : `${head}: slope = rise / run = (${p2[1]} - ${p1[1]}) / (${p2[0]} - ${p1[0]}) = ${rise} / ${run} = ${pyFloat(slope)}.` +
              (rise === 0 ? ' The rise is 0, so the line is horizontal.' : slope > 0 ? ' Positive: the line goes up to the right.' : ' Negative: the line goes down to the right.'),
        { points: pointsOf(op, { 0: 'compare', 1: 'compare' }), segments: [seg, ...legs] },
        [['slope', pyFloat(slope)]],
      );
      snap(
        L.vertical,
        `is_vertical() is ${pyRepr(vertical)} and is_horizontal() is ${pyRepr(horizontal)}: both compare coordinates exactly, and both are False for a zero-length line. ` +
          `length() = math.sqrt(${len2}) = ${pyFloat(len)}.`,
        { points: pointsOf(op, { 0: 'done', 1: 'done' }), segments: [{ ...seg, role: 'done', label: `length ${approx(len)}` }, ...legs] },
        [['slope', pyFloat(slope)], ['is_vertical', pyRepr(vertical)], ['is_horizontal', pyRepr(horizontal)], ['length', pyFloat(len)]],
      );
      result = { length: len, length_squared: len2, slope: Number.isNaN(slope) ? 'nan' : slope === Infinity ? 'inf' : slope, vertical, horizontal };
    } else if (op.kind === 'cross' || op.kind === 'orientation') {
      const [o, a, b] = P;
      const left = (a[0] - o[0]) * (b[1] - o[1]);
      const right = (a[1] - o[1]) * (b[0] - o[0]);
      const v = left - right + 0;
      const isOrient = op.kind === 'orientation';
      const arrows = isOrient ? [vec('u', o, a, 'idle', 'u'), vec('w', a, b, 'idle')] : [vec('u', o, a, 'idle', 'u'), vec('v', o, b, 'idle', 'v')];
      snap(
        isOrient ? L.orient : L.cross,
        isOrient
          ? `${head}: walk from ${n[0]} to ${n[1]}, then on to ${n[2]}. Which way the walk turns is the sign of val = cross_product(${n.join(', ')}).`
          : `${head}: the vectors u = a - o = (${a[0] - o[0]}, ${a[1] - o[1]}) and v = b - o = (${b[0] - o[0]}, ${b[1] - o[1]}) both start at o.`,
        { points: pointsOf(op, { 0: 'compare' }), segments: arrows },
      );
      const area: PlanePolygon = isOrient
        ? { id: 'area', pts: [o, a, b], role: signRole(v), label: signed(v) }
        : { id: 'area', pts: [o, a, [a[0] + b[0] - o[0], a[1] + b[1] - o[1]], b], role: signRole(v), label: signed(v) };
      const products = `(${a[0]} - ${o[0]}) * (${b[1]} - ${o[1]}) - (${a[1]} - ${o[1]}) * (${b[0]} - ${o[0]}) = ${left} - ${right} = ${v}`;
      snap(
        L.cross,
        `cross_product(${n.join(', ')}) = ${products}. ` +
          (isOrient
            ? `Its absolute value is twice the area of the triangle; its sign says ${turnWord(v)}.`
            : `Its absolute value, ${Math.abs(v)}, is the area of the parallelogram spanned by u and v. ` +
              (v > 0 ? 'Positive: b lies to the left of the ray from o through a.' : v < 0 ? 'Negative: b lies to the right of the ray from o through a.' : 'Zero: o, a and b lie on one line.')),
        { points: pointsOf(op, { 0: 'compare' }), segments: arrows, polygons: [area] },
        [['cross', v]],
      );
      if (isOrient) {
        const code = v === 0 ? 0 : v > 0 ? 2 : 1;
        snap(
          v === 0 ? L.orientZero : L.orientSign,
          v === 0
            ? `val == 0: the three points are collinear, so orientation returns 0. The test is exact, so a tiny triangle is not mistaken for a flat one.`
            : `val = ${v} ${v > 0 ? '> 0' : '< 0'}: the turn is ${v > 0 ? 'counterclockwise' : 'clockwise'}, so orientation returns ${code}.`,
          { points: pointsOf(op, { 0: 'compare', 2: v === 0 ? 'muted' : 'done' }), segments: arrows, polygons: [area] },
          [['val', v], ['orientation', code]],
        );
        result = code;
      } else {
        result = v;
      }
    } else if (op.kind === 'dot') {
      const [o, a, b] = P;
      const v = dot(o, a, b);
      const ua: XY = [a[0] - o[0], a[1] - o[1]];
      const l2 = ua[0] * ua[0] + ua[1] * ua[1];
      const arrows = [vec('u', o, a, 'idle', 'u'), vec('v', o, b, 'idle', 'v')];
      snap(L.dot, `${head}: u = a - o = (${ua[0]}, ${ua[1]}) and v = b - o = (${b[0] - o[0]}, ${b[1] - o[1]}). The dot product multiplies matching coordinates and adds them.`, {
        points: pointsOf(op, { 0: 'compare' }),
        segments: arrows,
      });
      const segs = [...arrows];
      if (l2 > 0) {
        const t = v / l2;
        const foot: XY = [o[0] + t * ua[0], o[1] + t * ua[1]];
        segs.push({ id: 'drop', a: b, b: foot, role: 'muted', dashed: true, thin: true }, { id: 'shadow', a: o, b: foot, role: signRole(v === 0 ? 0 : v), grow: true, label: 'shadow of v' });
      }
      snap(
        L.dot,
        `dot_product = (${a[0]} - ${o[0]}) * (${b[0]} - ${o[0]}) + (${a[1]} - ${o[1]}) * (${b[1]} - ${o[1]}) = ${ua[0] * (b[0] - o[0])} + ${ua[1] * (b[1] - o[1])} = ${v}. ` +
          (l2 === 0
            ? 'u has length 0 here, so it has no direction and the dot product is 0.'
            : `It equals |u| times the signed length of v's shadow on u. ${v > 0 ? 'Positive: the angle between them is below 90 degrees.' : v < 0 ? 'Negative: the angle is above 90 degrees, so the shadow points backwards.' : 'Zero: u and v are perpendicular.'}`),
        { points: pointsOf(op, { 0: 'compare' }), segments: segs },
        [['dot', v]],
      );
      result = v;
    } else if (op.kind === 'angle') {
      const [o, a, b] = P;
      const arrows = [vec('u', o, a, 'idle', 'oa'), vec('v', o, b, 'idle', 'ob')];
      if (samePoint(a, o) || samePoint(b, o)) {
        snap(
          L.angleZero,
          `${head}: ${samePoint(a, o) ? 'a' : 'b'} coincides with o, so that vector has no direction and there is no angle to measure. angle_between_points returns 0.0.`,
          { points: pointsOf(op, { 0: 'compare', [samePoint(a, o) ? 1 : 2]: 'bad' }), segments: arrows },
          [['angle', '0.0']],
        );
        result = 0;
      } else {
        // cross and dot never return -0 (Python's int 0 has no sign), so atan2(0, 0) stays 0, not pi.
        const c = cross(o, a, b);
        const d = dot(o, a, b);
        snap(
          L.angle,
          `${head}: the cross product of oa and ob is ${c} (|oa| |ob| sin) and the dot product is ${d} (|oa| |ob| cos). Their ratio fixes the angle, and the lengths cancel.`,
          { points: pointsOf(op, { 0: 'compare' }), segments: arrows, polygons: [{ id: 'area', pts: [o, a, b], role: signRole(c), label: `cross ${c}` }] },
          [['cross', c], ['dot', d]],
        );
        const angle = Math.atan2(Math.abs(c), d);
        snap(
          L.angle,
          `math.atan2(abs(${c}), ${d}) = ${pyFloat(angle)} radians, about ${approx((angle * 180) / Math.PI, 2)} degrees. abs() keeps the result between 0 and pi, and atan2 stays accurate near 0 and pi, where acos of the cosine would lose digits.`,
          { points: pointsOf(op, { 0: 'compare', 1: 'done', 2: 'done' }), segments: arrows, arcs: [{ id: 'angle', c: o, a, b, role: 'done', label: `${approx((angle * 180) / Math.PI, 1)} deg` }] },
          [['cross', c], ['dot', d], ['angle (rad)', pyFloat(angle)]],
        );
        result = angle;
      }
    } else if (op.kind === 'triangle') {
      const [p, a, b, c] = P;
      const abc = cross(a, b, c);
      const tri: PlanePolygon = { id: 'tri', pts: [a, b, c], role: abc === 0 ? 'muted' : 'idle', dashed: abc === 0 };
      const outline: PlaneSegment[] = [
        { id: 'ab', a, b, role: 'idle' },
        { id: 'bc', a: b, b: c, role: 'idle' },
        { id: 'ca', a: c, b: a, role: 'idle' },
      ];
      if (abc === 0) {
        snap(
          L.triDegenerate,
          `${head}: cross_product(a, b, c) = 0, so the triangle has no area (its corners are collinear or repeated). A degenerate triangle contains no point: return False.`,
          { points: pointsOf(op, { 0: 'bad' }), polygons: [tri], segments: outline },
          [['cross(a, b, c)', 0]],
        );
        result = false;
      } else {
        snap(
          L.triDegenerate,
          `${head}: cross_product(a, b, c) = ${abc}, not 0, so the triangle has an area and the test can go on. It works for either orientation of a, b, c.`,
          { points: pointsOf(op, { 0: 'compare' }), polygons: [tri], segments: outline },
          [['cross(a, b, c)', abc]],
        );
        const ds = [cross(p, a, b), cross(p, b, c), cross(p, c, a)];
        const edges: Array<[XY, XY, string]> = [
          [a, b, 'a, b'],
          [b, c, 'b, c'],
          [c, a, 'c, a'],
        ];
        const subs: PlanePolygon[] = [];
        ds.forEach((d, k) => {
          subs.push({ id: `d${k + 1}`, pts: [p, edges[k][0], edges[k][1]], role: signRole(d), label: `d${k + 1} ${signed(d)}` });
          snap(
            L.triD,
            `d${k + 1} = cross_product(p, ${edges[k][2]}) = ${d}: ` +
              (d > 0 ? 'p sees that edge turn counterclockwise.' : d < 0 ? 'p sees that edge turn clockwise.' : 'p lies on the line through that edge.'),
            { points: pointsOf(op, { 0: 'compare' }), polygons: [tri, ...subs], segments: outline },
            [['d1', ds[0]], ...(k >= 1 ? [['d2', ds[1]] as [string, number]] : []), ...(k >= 2 ? [['d3', ds[2]] as [string, number]] : [])],
          );
        });
        const hasNeg = ds.some((d) => d < 0);
        const hasPos = ds.some((d) => d > 0);
        result = !(hasNeg && hasPos);
        snap(
          L.triResult,
          `has_neg is ${pyRepr(hasNeg)} and has_pos is ${pyRepr(hasPos)}. ` +
            (result
              ? `The signs never disagree, so p is on the same side of all three edges${ds.includes(0) ? ' (a 0 means it is on an edge, which counts)' : ''}: return True.`
              : 'Mixed signs: p is on the outer side of at least one edge, so it is outside: return False.'),
          { points: pointsOf(op, { 0: result ? 'good' : 'bad' }), polygons: [tri, ...subs], segments: outline },
          [['d1', ds[0]], ['d2', ds[1]], ['d3', ds[2]], ['has_neg', pyRepr(hasNeg)], ['has_pos', pyRepr(hasPos)]],
        );
      }
    } else {
      const [c, p] = P;
      const r = op.radius!;
      if (!(r >= 0)) {
        error = 'ValueError: radius must be non-negative';
        snap(
          L.circle,
          `Circle(${ptText(c)}, ${r}) raises ValueError: radius must be non-negative. A negative radius would still give a positive area, so the constructor refuses it. The run goes on with the next operation.`,
          { points: [{ id: 'arg0', at: c, label: `center ${ptText(c)}`, role: 'bad' }] },
        );
      } else {
        const d2 = dist2(c, p);
        const rr = r * r;
        const area = Math.PI * r * r;
        const circumference = 2 * Math.PI * r;
        const circle = { id: 'circle', c, r, role: 'compare' as Role, label: `r ${r}` };
        snap(
          L.circle,
          `${head}: radius ${r} is not negative, so the circle is valid: area = pi * r * r = ${approx(area)}, circumference = 2 * pi * r = ${approx(circumference)}.`,
          { points: pointsOf(op), circles: [circle] },
          [['radius * radius', rr]],
        );
        const contains = d2 <= rr;
        const on = d2 === rr;
        const seg: PlaneSegment = { id: 'radius', a: c, b: p, role: 'compare', grow: true, dashed: true, label: `dist2 ${d2}` };
        snap(
          L.contains,
          `contains_point: center.distance_squared(p) = ${d2} and radius * radius = ${rr}. ${d2} ${contains ? '<=' : '>'} ${rr}, so p is ${contains ? 'inside or on' : 'outside'} the circle: ${pyRepr(contains)}. Squared values need no square root and compare exactly.`,
          { points: pointsOf(op, { 1: contains ? 'good' : 'bad' }), circles: [circle], segments: [seg] },
          [['distance_squared', d2], ['radius * radius', rr], ['contains_point', pyRepr(contains)]],
        );
        snap(
          L.onCircle,
          `point_on_circle: ${d2} ${on ? '==' : '!='} ${rr}, so it returns ${pyRepr(on)}. The comparison is exact, with no tolerance${on ? ': p is exactly on the boundary.' : '.'}`,
          { points: pointsOf(op, { 1: on ? 'good' : 'bad' }), circles: [{ ...circle, role: on ? 'done' : 'compare' }], segments: [seg] },
          [['distance_squared', d2], ['radius * radius', rr], ['point_on_circle', pyRepr(on)]],
        );
        result = { contains, on, area, circumference };
      }
    }
    steps.push(error ? { op, error } : { op, result });
  });

  current = ops.length;
  const last = frames[frames.length - 1].state;
  snap(
    undefined,
    `Done: ${ops.length} operation${ops.length === 1 ? '' : 's'}. Every yes or no answer came from a sign or an exact comparison; only distances, slopes, angles and the circle's area and circumference are rounded.`,
    { points: last.points.map((p) => ({ ...p, role: undefined })), segments: last.segments, polygons: last.polygons, circles: last.circles, arcs: last.arcs },
  );
  return { frames, steps };
}
