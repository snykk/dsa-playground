import { CLOSEST_CODE, closestTrace, parseClosest } from '../algorithms/closestPair';
import { GRAHAM_CODE, grahamTrace, JARVIS_CODE, jarvisTrace, parseHullPoints } from '../algorithms/convexHull';
import { LI_CODE, liTrace, parseLi, type LiOp } from '../algorithms/lineIntersection';
import { parsePlc, PLC_CODE, plcTrace, type PlcOp, type XY } from '../algorithms/pointLineCircle';
import { CALIPER_CODE, calipersTrace, parseCalipers, type CaliperInput } from '../algorithms/rotatingCalipers';
import type { Example, VizSpec } from '../core/types';
import { PlaneView, stabilizePlane, type PlaneState } from '../renderers/PlaneView';
import { SYM } from '../ui/symbols';

const rint = (lo: number, hi: number) => lo + Math.floor(Math.random() * (hi - lo + 1));
const pick = <T,>(xs: readonly T[]): T => xs[Math.floor(Math.random() * xs.length)];
const pt = (lo: number, hi: number) => `(${rint(lo, hi)},${rint(lo, hi)})`;
const pts = (count: number, lo: number, hi: number) => Array.from({ length: count }, () => pt(lo, hi)).join(' ');
const render = (state: PlaneState) => <PlaneView state={state} />;

/* ---------- point, line and circle ---------- */

function randomPlc(): string {
  const ops = Array.from({ length: rint(2, 4) }, () => {
    const kind = pick(['orientation', 'orientation', 'triangle', 'circle', 'distance', 'dot', 'angle', 'cross', 'line']);
    if (kind === 'circle') return `circle ${pt(-3, 3)} ${rint(1, 6)} ${pt(-6, 6)}`;
    const arity = kind === 'triangle' ? 4 : kind === 'distance' || kind === 'line' ? 2 : 3;
    return `${kind} ${pts(arity, -6, 6)}`;
  });
  return ops.join(', ');
}

export const pointLineCircleSpec: VizSpec<PlcOp[], PlaneState> = {
  id: 'point-line-circle',
  title: 'Point, Line and Circle',
  inputKind: 'point-line-circle',
  inputLabel: 'Operations',
  inputHelp:
    'Operations separated by commas, each a name and its points as (x, y): "orientation (0,0) (4,4) (1,2)", "cross o a b", "dot o a b", "angle o a b", ' +
    '"triangle p a b c" (is p in triangle abc), "circle (0,0) 5 (3,4)" (center, radius, point), "distance p q" and "line p1 p2" (slope and direction). ' +
    'Whole numbers from -9999 to 9999; up to 10 operations.',
  examples: [
    { label: 'Orientation: left, right, straight', value: 'orientation (0,0) (4,4) (1,2), orientation (0,0) (4,4) (2,1), orientation (0,0) (4,4) (2,2)' },
    { label: 'Point in triangle (worked example)', value: 'triangle (2,1) (0,0) (4,0) (2,4), triangle (10,10) (0,0) (4,0) (2,4), triangle (2,0) (0,0) (4,0) (2,4)' },
    { label: 'Cross, dot and angle', value: 'cross (0,0) (3,4) (2,1), dot (0,0) (3,4) (2,1), angle (0,0) (3,4) (2,1), angle (0,0) (5,0) (-3,0)' },
    { label: 'Distance, slope and circle', value: 'distance (0,0) (3,4), line (2,1) (2,7), circle (0,0) 5 (3,4), circle (0,0) 5 (5,1), circle (0,0) -5 (1,1)' },
    { label: 'Degenerate shapes', value: 'triangle (1,1) (0,0) (1,1) (2,2), angle (1,1) (1,1) (4,5), line (4,4) (4,4), orientation (3,3) (3,3) (5,1)' },
  ],
  randomInput: randomPlc,
  parse: parsePlc,
  trace: (ops) => stabilizePlane(plcTrace(ops).frames),
  render,
  pseudocode: PLC_CODE,
  legend: [
    { role: 'compare', label: 'positive cross product: counterclockwise, a left turn' },
    { role: 'active', label: 'negative cross product: clockwise, a right turn' },
    { role: 'done', label: 'the measured result: a distance, an angle' },
    { role: 'good', label: `True: inside, on the circle (${SYM.check})` },
    { role: 'bad', label: `False, or an error (${SYM.cross})` },
    { role: 'muted', label: 'zero: collinear, no area' },
  ],
  complexity: { time: 'O(1) per operation', space: 'O(1)' },
};

/* ---------- intersection ---------- */

function randomLi(): string {
  const ops: string[] = [];
  for (let i = 0; i < rint(2, 3); i++) {
    const r = Math.random();
    if (r < 0.2) {
      const y = rint(0, 4);
      ops.push(`segments (${rint(0, 2)},${y}) (${rint(3, 5)},${y}) (${rint(1, 4)},${y}) (${rint(4, 7)},${y})`);
    } else if (r < 0.75) ops.push(`segments ${pts(4, 0, 6)}`);
    else if (r < 0.9) ops.push(`lines ${pts(4, 0, 6)}`);
    else ops.push(`on ${pts(3, 0, 4)}`);
  }
  return ops.join(', ');
}

export const lineIntersectionSpec: VizSpec<LiOp[], PlaneState> = {
  id: 'line-intersection',
  title: 'Line Intersection',
  inputKind: 'line-intersection',
  inputLabel: 'Operations',
  inputHelp:
    'Operations separated by commas: "segments p1 p2 p3 p4" runs segment_intersection on the segments p1-p2 and p3-p4, "lines p1 p2 p3 p4" runs line_intersection on the infinite lines, ' +
    'and "on p a b" runs point_on_segment. Points are (x, y) with whole numbers from -9999 to 9999; up to 8 operations.',
  examples: [
    { label: 'Crossing (an X)', value: 'segments (0,0) (4,4) (0,4) (4,0)' },
    { label: 'T-junction, shared end', value: 'segments (0,0) (4,0) (2,0) (2,3), segments (0,0) (1,0) (1,0) (1,1)' },
    { label: 'Collinear cases (v0.2.0 fix)', value: 'segments (0,0) (2,0) (1,0) (3,0), segments (0,0) (1,0) (2,0) (3,0), segments (0,0) (2,0) (1,0) (1,0)' },
    { label: 'Parallel; lines vs segments', value: 'segments (0,0) (2,0) (0,1) (2,1), segments (0,0) (1,1) (3,0) (3,5), lines (0,0) (1,1) (3,0) (3,5)' },
    { label: 'Point on a segment', value: 'on (1,0) (0,0) (2,0), on (3,0) (0,0) (2,0), on (1,1) (0,0) (2,0)' },
  ],
  randomInput: randomLi,
  parse: parseLi,
  trace: (ops) => stabilizePlane(liTrace(ops).frames),
  render,
  pseudocode: LI_CODE,
  legend: [
    { role: 'compare', label: 'positive orientation: left of the line, or the segment being tested' },
    { role: 'active', label: 'negative orientation: right of the line, the endpoint tested' },
    { role: 'done', label: 'bounding box of a collinear test; segments that meet' },
    { role: 'good', label: `the common point, or an endpoint on the other segment (${SYM.check})` },
    { role: 'bad', label: `no common point (${SYM.cross})` },
    { role: 'muted', label: 'zero orientation: collinear' },
  ],
  complexity: { time: 'O(1) per pair', space: 'O(1)' },
};

/* ---------- convex hull ---------- */

function randomHull(): string {
  const r = Math.random();
  if (r < 0.25) return Array.from({ length: rint(6, 12) }, () => pt(0, 5)).join(' ');
  if (r < 0.4) {
    const base = Array.from({ length: rint(5, 9) }, () => pt(0, 8));
    return [...base, pick(base)].join(' ');
  }
  return pts(rint(6, 14), 0, 20);
}

const HULL_EXAMPLES: Example[] = [
  { label: 'Seven points (README)', value: '(0,3) (2,2) (1,1) (2,1) (3,0) (0,0) (3,3)' },
  { label: 'Three pops (article)', value: '(0,0) (3,0) (2,1) (1,1) (2,2) (3,3) (0,3)' },
  { label: 'Collinear edges, a duplicate', value: '(0,0) (2,0) (4,0) (4,2) (4,4) (2,2) (0,4) (0,2) (1,1) (2,0)' },
  { label: 'All on one line', value: '(0,0) (1,1) (2,2) (3,3)' },
  { label: 'Twelve scattered points', value: '(9,1) (14,4) (17,9) (12,15) (6,16) (2,11) (1,5) (8,8) (11,6) (5,9) (13,11) (7,4)' },
];

const HULL_HELP =
  'Points as (x, y), separated by spaces, with whole numbers from -9999 to 9999; up to 16 points. Repeated points are allowed (unique_points drops them), and so are collinear ones. ' +
  'Both tabs run the same points.';

export const convexHullSpec: VizSpec<XY[], PlaneState> = {
  id: 'convex-hull',
  title: "Convex Hull (Graham's scan)",
  inputKind: 'convex-hull',
  inputLabel: 'Points',
  inputHelp: HULL_HELP,
  examples: HULL_EXAMPLES,
  randomInput: randomHull,
  parse: parseHullPoints,
  trace: (points) => stabilizePlane(grahamTrace(points).frames),
  render,
  pseudocode: GRAHAM_CODE,
  legend: [
    { role: 'active', label: 'the pivot, or the point being added; a right turn (orange fill)' },
    { role: 'compare', label: 'the last two stack points; a left turn (blue fill)' },
    { role: 'done', label: 'on the stack: the hull so far' },
    { role: 'bad', label: `popped: not a strict left turn (${SYM.cross})` },
    { role: 'muted', label: 'inside the hull, or on an edge; a zero turn' },
  ],
  complexity: { time: 'O(n log n): the sort; the scan is O(n)', space: 'O(n)' },
};

export const jarvisMarchSpec: VizSpec<XY[], PlaneState> = {
  id: 'jarvis-march',
  title: 'Convex Hull (Jarvis march)',
  inputKind: 'convex-hull',
  inputLabel: 'Points',
  inputHelp: HULL_HELP,
  examples: HULL_EXAMPLES,
  randomInput: randomHull,
  parse: parseHullPoints,
  trace: (points) => stabilizePlane(jarvisTrace(points).frames),
  render,
  pseudocode: JARVIS_CODE,
  legend: [
    { role: 'active', label: 'the current hull vertex; a negative cross product (orange fill)' },
    { role: 'compare', label: 'the candidate next_point and its ray; a positive cross product (blue fill)' },
    { role: 'done', label: 'hull vertices and edges found so far' },
    { role: 'muted', label: 'zero cross product: the same ray' },
  ],
  complexity: { time: 'O(n h), O(n^2) when every point is on the hull', space: 'O(n)' },
};

/* ---------- rotating calipers ---------- */

function randomPolygon(): string {
  for (let attempt = 0; attempt < 50; attempt++) {
    const cloud: XY[] = Array.from({ length: rint(5, 10) }, () => [rint(-8, 8), rint(-8, 8)]);
    let hull = grahamTrace(cloud).result.hull;
    if (hull.length < 3) continue;
    const s = rint(0, hull.length - 1);
    hull = [...hull.slice(s), ...hull.slice(0, s)];
    if (Math.random() < 0.4) hull.reverse();
    return hull.map((p) => `(${p[0]},${p[1]})`).join(' ');
  }
  return '(0,0) (4,0) (5,2) (2,5) (-1,3)';
}

export const rotatingCalipersSpec: VizSpec<CaliperInput, PlaneState> = {
  id: 'rotating-calipers',
  title: 'Rotating Calipers',
  inputKind: 'rotating-calipers',
  inputLabel: 'Convex polygon and functions',
  inputHelp:
    'The vertices of a convex polygon in order, clockwise or counterclockwise, as (x, y) with whole numbers; up to 12. Repeated vertices and vertices on an edge are fine (clean_polygon drops them). ' +
    'Optionally add a semicolon and the functions to run: "; diameter", "; width" or both (the default).',
  examples: [
    { label: 'Pentagon (article example)', value: '(0,0) (4,0) (5,2) (2,5) (-1,3)' },
    { label: 'Rectangle: parallel edges', value: '(0,0) (4,0) (4,3) (0,3)' },
    { label: 'Repeated and collinear vertices', value: '(0,0) (2,0) (4,0) (4,3) (4,3) (0,3)' },
    { label: 'Fan hull (old local maximum)', value: '(0,0) (1048,58) (1033,181) (1029,208) (897,524) (888,520); diameter' },
    { label: 'Clockwise triangle', value: '(0,0) (3,5) (6,0)' },
  ],
  randomInput: randomPolygon,
  parse: parseCalipers,
  trace: (input) => stabilizePlane(calipersTrace(input).frames),
  render,
  pseudocode: CALIPER_CODE,
  legend: [
    { role: 'active', label: 'the current edge and the two jaws of the calipers' },
    { role: 'compare', label: 'the far vertex j, its height over the edge, a pair measured' },
    { role: 'done', label: 'the best so far: the farthest pair, or the narrowest strip' },
    { role: 'bad', label: `removed by clean_polygon (${SYM.cross})` },
    { role: 'muted', label: 'not a corner: a repeat or a point on an edge' },
  ],
  complexity: { time: 'O(n) on the hull: j goes around once', space: 'O(n) for the cleaned copy' },
};

/* ---------- closest pair ---------- */

export const closestPairSpec: VizSpec<XY[], PlaneState> = {
  id: 'closest-pair',
  title: 'Closest Pair of Points',
  inputKind: 'closest-pair',
  inputLabel: 'Points',
  inputHelp: 'Points as (x, y), separated by spaces, with whole numbers from -9999 to 9999; 2 to 16 points (one point shows the ValueError). Duplicates and repeated x values are fine.',
  examples: [
    { label: 'Eight points (article example)', value: '(0,0) (1,6) (2,2) (4,5) (5,6) (7,1) (8,8) (9,3)' },
    { label: 'README example', value: '(2,3) (12,30) (40,50) (5,1) (12,10) (3,4)' },
    { label: 'Many points on the line', value: '(5,1) (5,9) (5,4) (6,6) (5,2) (4,8) (5,7) (6,0)' },
    { label: 'A duplicate: distance 0', value: '(1,1) (6,2) (1,1) (9,9) (3,7)' },
    { label: 'Sixteen points', value: '(2,14) (5,3) (8,11) (11,6) (14,15) (17,2) (20,9) (3,8) (13,10) (9,1) (16,12) (6,17) (19,5) (1,1) (12,4) (18,16)' },
  ],
  randomInput: () => pts(rint(5, 14), 0, 20),
  parse: parseClosest,
  trace: (points) => stabilizePlane(closestTrace(points).frames),
  render,
  pseudocode: CLOSEST_CODE,
  legend: [
    { role: 'compare', label: 'the pair being measured' },
    { role: 'active', label: 'the strip: within d of the dividing line' },
    { role: 'done', label: 'the best pair of the current call' },
    { role: 'muted', label: 'outside the current call' },
    { role: 'bad', label: `ValueError: fewer than two points (${SYM.cross})` },
  ],
  complexity: { time: 'O(n log n): sort once, linear work per level', space: 'O(n)' },
};
