/** Visualization registry: Computational geometry (points, lines and circles, segment intersection, convex hull, rotating calipers, closest pair). */
import type { AnyVizSpec } from '../core/types';
import type { VizInfo } from '../catalog';

const BASIC = 'Algorithms/Computational_Geometry/Basic_Geometry';
const ADV = 'Algorithms/Computational_Geometry/Advanced_Geometry';

export const entries: VizInfo[] = [
  {
    id: 'point-line-circle',
    title: 'Point, Line and Circle',
    group: 'Geometry',
    blurb: 'The cross product as a signed area that tells a left turn from a right one, plus distance, dot product, angle, point in triangle and in circle.',
    topics: [`${BASIC}/Point_Line_Circle`, BASIC, 'Algorithms/Computational_Geometry'],
  },
  {
    id: 'line-intersection',
    title: 'Line Intersection',
    group: 'Geometry',
    blurb: 'Four orientation signs decide whether two segments meet; collinear ends fall back on a bounding-box test, and only then is the point computed.',
    topics: [`${BASIC}/Line_Intersection`, BASIC, 'Algorithms/Computational_Geometry'],
  },
  {
    id: 'convex-hull',
    title: "Convex Hull (Graham's scan)",
    group: 'Geometry',
    blurb: 'Sort the points by angle around the lowest one, then keep a stack that pops every point where the walk does not turn left.',
    topics: [`${ADV}/Convex_Hull`, ADV, 'Algorithms/Computational_Geometry'],
  },
  {
    id: 'jarvis-march',
    title: 'Convex Hull (Jarvis march)',
    group: 'Geometry',
    blurb: 'Gift wrapping: from each hull vertex, swing a ray to the most clockwise point, until the wrap returns to the start.',
    topics: [`${ADV}/Convex_Hull`, ADV],
  },
  {
    id: 'rotating-calipers',
    title: 'Rotating Calipers',
    group: 'Geometry',
    blurb: 'Two parallel jaws turn edge by edge around a convex polygon; a pointer that only moves forward finds the diameter and the width in O(n).',
    topics: [`${ADV}/Rotating_Calipers`, ADV, 'Algorithms/Computational_Geometry'],
  },
  {
    id: 'closest-pair',
    title: 'Closest Pair of Points',
    group: 'Geometry',
    blurb: 'Split at a vertical line, solve both halves, then measure only the few strip points within d of the line, in y order.',
    topics: [`${ADV}/Closest_Pair_of_Points`, ADV, 'Algorithms/Computational_Geometry'],
  },
];

export const loaders: Record<string, () => Promise<AnyVizSpec>> = {
  'point-line-circle': () => import('../specs/geometry').then((m) => m.pointLineCircleSpec),
  'line-intersection': () => import('../specs/geometry').then((m) => m.lineIntersectionSpec),
  'convex-hull': () => import('../specs/geometry').then((m) => m.convexHullSpec),
  'jarvis-march': () => import('../specs/geometry').then((m) => m.jarvisMarchSpec),
  'rotating-calipers': () => import('../specs/geometry').then((m) => m.rotatingCalipersSpec),
  'closest-pair': () => import('../specs/geometry').then((m) => m.closestPairSpec),
};
