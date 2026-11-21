/**
 * Convex hull tracers, drawn with PlaneView: Graham's scan (the angular sort as a fan of rays
 * from the pivot, then the stack scan with every turn test as a filled triangle and every pop)
 * and Jarvis march (the candidate ray swinging clockwise around the current hull vertex).
 *
 * Mirrors Algorithms/Computational_Geometry/Advanced_Geometry/Convex_Hull/Python/convex_hull.py:
 * unique_points (exact duplicates dropped, first copy kept, in input order), graham_scan
 * (fewer than three distinct points come back sorted by (y, x); the pivot is the lowest point,
 * leftmost on a tie; the others are sorted with compare(a, b): a first when
 * cross(bottom, a, b) > 0, nearer first on the same ray; the scan pops while
 * cross(hull[-2], hull[-1], p) <= 0, so collinear boundary points are dropped) and
 * jarvis_march (fewer than three distinct points come back sorted by (x, y); it starts at the
 * leftmost point, lowest on a tie, and from each vertex scans the points in unique order,
 * taking a point that is clockwise of the candidate (cross < 0), or on the same ray and
 * farther; it stops when the best next point is the start, or after len(pts) vertices).
 * Golden fixtures (__fixtures__/geometry.json) pin the pivot, the angular order, every turn
 * test of the scan and every cross product of the gift wrapping, in order, and both hulls.
 *
 * Input: "(0,3) (2,2) (1,1) (2,1) (3,0) (0,0) (3,3)"
 */
import { InputError, type Frame, type Role } from '../core/types';
import type { PlaneLine, PlanePoint, PlanePolygon, PlaneSegment, PlaneState, XY } from '../renderers/PlaneView';
import type { StripItem } from '../ui/molecules/Strip';
import { approx, cross, dist2, letter, lexLess, ptText, readPoints, signed, signRole } from './pointLineCircle';

export const HULL_LIMITS = { maxPoints: 16 };

/** "(0,3) (2,2) (1,1)" or "points (0,3) (2,2)": up to 16 points, duplicates allowed. */
export function parseHullPoints(text: string): XY[] {
  const body = text.trim().replace(/^(?:points?|pts)\s*[:=]?\s*/i, '');
  const pts = readPoints(body, 'the points');
  if (pts.length === 0) throw new InputError('Enter some points as (x, y), for example (0,3) (2,2) (1,1) (3,0).');
  if (pts.length > HULL_LIMITS.maxPoints) throw new InputError(`At most ${HULL_LIMITS.maxPoints} points, so every label stays readable (got ${pts.length}).`);
  return pts;
}

/** unique_points: the first copy of every point, in input order, with its index in the input. */
export function uniquePoints(points: XY[]): Array<{ p: XY; i: number }> {
  const seen = new Set<string>();
  const out: Array<{ p: XY; i: number }> = [];
  points.forEach((p, i) => {
    const key = `${p[0]},${p[1]}`;
    if (!seen.has(key)) {
      seen.add(key);
      out.push({ p, i });
    }
  });
  return out;
}

/* ---------- shared drawing ---------- */

interface Pic {
  roles?: Record<number, Role>;
  tags?: Record<number, string>;
  segments?: PlaneSegment[];
  polygons?: PlanePolygon[];
  lines?: PlaneLine[];
  strips?: Array<{ label: string; items: StripItem[] }>;
}

function hullFrames(points: XY[], title: string) {
  const frames: Array<Frame<PlaneState>> = [];
  const names = points.map((_, i) => letter(i));
  const dup = new Set<number>();
  const firstOf = new Map<string, number>();
  points.forEach((p, i) => {
    const key = `${p[0]},${p[1]}`;
    if (firstOf.has(key)) dup.add(i);
    else firstOf.set(key, i);
  });
  const nameOf = (i: number) => `${names[i]} ${ptText(points[i])}`;
  const snap = (line: number | undefined, caption: string, pic: Pic, vars: Array<[string, string | number]> = []) => {
    const plane: PlanePoint[] = points.map((p, i) => ({
      id: `p${i}`,
      at: p,
      label: dup.has(i) ? undefined : names[i],
      role: pic.roles?.[i],
      ghost: dup.has(i),
      tag: pic.tags?.[i],
    }));
    frames.push({ line, caption, vars, state: { label: title, points: plane, segments: pic.segments, polygons: pic.polygons, lines: pic.lines, strips: pic.strips } });
  };
  return { frames, names, dup, firstOf, nameOf, snap };
}

const edge = (id: string, a: XY, b: XY, role: Role = 'done', grow = true): PlaneSegment => ({ id, a, b, role, grow });

/* ---------- Graham's scan ---------- */

export const GRAHAM_CODE = [
  'graham_scan(points): pts = unique_points(points)          # exact (x, y), the first copy is kept',
  '  if len(pts) < 3: return sorted(pts, key=lambda p: (p.y, p.x))',
  '  bottom = min(pts, key=lambda p: (p.y, p.x))               # lowest, then leftmost',
  '  others = sorted(pts minus bottom, key=cmp_to_key(compare)) # a first if cross(bottom, a, b) > 0',
  '    compare on a tie (cross == 0, the same ray): the nearer point first',
  '  hull = []',
  '  for p in [bottom] + others:',
  '    while len(hull) > 1 and cross_product(hull[-2], hull[-1], p) <= 0:',
  '      hull.pop()                                            # not a strict left turn',
  '    hull.append(p)',
  '  return hull',
];

const G = { unique: 0, few: 1, bottom: 2, sort: 3, sortTie: 4, init: 5, loop: 6, test: 7, pop: 8, push: 9, done: 10 };

export interface GrahamResult {
  unique: XY[];
  bottom?: XY;
  /** sorted_points: the pivot, then the others in angular order. */
  sorted?: XY[];
  /** Every turn test of the scan, in order: [hull[-2], hull[-1], p, cross]. */
  tests: Array<[XY, XY, XY, number]>;
  hull: XY[];
}

export function grahamTrace(points: XY[]): { frames: Array<Frame<PlaneState>>; result: GrahamResult } {
  const { frames, names, dup, firstOf, nameOf, snap } = hullFrames(points, "Graham's scan");
  const uniq = uniquePoints(points);
  const result: GrahamResult = { unique: uniq.map((u) => u.p), tests: [], hull: [] };

  snap(
    G.unique,
    `${points.length} point${points.length === 1 ? '' : 's'}. graham_scan first calls unique_points, which compares coordinates exactly and keeps the first copy of each point.` +
      (dup.size ? ` ${[...dup].map((i) => `${names[i]} repeats ${names[firstOf.get(`${points[i][0]},${points[i][1]}`)!]}`).join(', ')}: dropped (drawn hollow).` : ' There are no duplicates.'),
    {},
    [['points', points.length], ['distinct', uniq.length]],
  );

  if (uniq.length < 3) {
    const sorted = [...uniq].sort((a, b) => a.p[1] - b.p[1] || a.p[0] - b.p[0]);
    result.hull = sorted.map((u) => u.p);
    const roles: Record<number, Role> = {};
    for (const u of sorted) roles[u.i] = 'done';
    snap(
      G.few,
      `Only ${uniq.length} distinct point${uniq.length === 1 ? '' : 's'}: there is no polygon to build, so graham_scan returns them in a new list, sorted by (y, x): ${sorted.map((u) => nameOf(u.i)).join(', ') || 'an empty list'}.`,
      { roles, segments: sorted.length === 2 ? [edge('h0', sorted[0].p, sorted[1].p)] : [] },
      [['distinct', uniq.length]],
    );
    return { frames, result };
  }

  // bottom = min(pts, key=(y, x)): the first minimum in pts order.
  let bottom = uniq[0];
  for (const u of uniq) if (u.p[1] < bottom.p[1] || (u.p[1] === bottom.p[1] && u.p[0] < bottom.p[0])) bottom = u;
  result.bottom = bottom.p;
  const floor: PlaneLine = { id: 'floor', at: bottom.p, dir: [1, 0], role: 'muted', dashed: true };
  snap(
    G.bottom,
    `The pivot is ${nameOf(bottom.i)}, the lowest point (leftmost on a tie). It is surely a hull vertex, and every other point lies above its horizontal line or on it to the right, so angles around it go from 0 up to (not including) 180 degrees.`,
    { roles: { [bottom.i]: 'active' }, lines: [floor] },
    [['bottom', names[bottom.i]]],
  );

  const others = uniq.filter((u) => u !== bottom);
  const compare = (a: XY, b: XY) => {
    const c = cross(bottom.p, a, b);
    if (c > 0) return -1;
    if (c < 0) return 1;
    const da = dist2(bottom.p, a);
    const db = dist2(bottom.p, b);
    return da < db ? -1 : da > db ? 1 : 0;
  };
  const order = [...others].sort((a, b) => compare(a.p, b.p));
  const sortedPts = [bottom, ...order];
  result.sorted = sortedPts.map((u) => u.p);

  const tags: Record<number, string> = { [bottom.i]: '0' };
  const fan: PlaneSegment[] = [];
  order.forEach((u, k) => {
    tags[u.i] = String(k + 1);
    const prev = k === 0 ? undefined : order[k - 1];
    const c = prev ? cross(bottom.p, prev.p, u.p) : 0;
    let why: string;
    if (!prev) {
      why = `${nameOf(u.i)} comes first: every other point is counterclockwise of it, or farther along the same ray, as seen from the pivot.`;
    } else if (c > 0) {
      why = `${nameOf(u.i)} is next: cross(${names[bottom.i]}, ${names[prev.i]}, ${names[u.i]}) = ${c} > 0, so it lies counterclockwise of ${names[prev.i]}.`;
    } else {
      why = `${nameOf(u.i)} is next: cross(${names[bottom.i]}, ${names[prev.i]}, ${names[u.i]}) = 0 puts it on the same ray as ${names[prev.i]}, and it is farther (squared distance ${dist2(bottom.p, u.p)} > ${dist2(bottom.p, prev.p)}), so the nearer one goes first.`;
    }
    const roles: Record<number, Role> = { [bottom.i]: 'active', [u.i]: 'compare' };
    snap(
      prev && c === 0 ? G.sortTie : G.sort,
      `Sort by angle around the pivot, position ${k + 1}: ${why}`,
      { roles, tags: { ...tags }, segments: [...fan, { id: 'ray', a: bottom.p, b: u.p, role: 'compare' }], lines: [floor] },
      [['sorted', `${k + 1} of ${order.length}`]],
    );
    fan.push({ id: `fan${u.i}`, a: bottom.p, b: u.p, role: 'muted', thin: true });
  });

  // The stack scan.
  const hull: Array<{ p: XY; i: number }> = [];
  const popped = new Set<number>();
  let pops = 0;
  const orderStrip = (cur: number) => ({
    label: 'Order',
    items: sortedPts.map((u, k): StripItem => ({
      text: names[u.i],
      role: k === cur ? 'active' : popped.has(u.i) ? 'muted' : hull.includes(u) ? 'done' : undefined,
    })),
  });
  const stackStrip = () => ({ label: 'Stack (hull)', items: hull.length ? hull.map((u): StripItem => ({ text: names[u.i], role: 'done' })) : [{ text: 'empty' }] });
  const chain = (): PlaneSegment[] => hull.slice(1).map((u, k) => edge(`e${hull[k].i}-${u.i}`, hull[k].p, u.p));
  const scanRoles = (cur: number, extra: Record<number, Role> = {}): Record<number, Role> => {
    const roles: Record<number, Role> = {};
    for (const i of popped) roles[i] = 'muted';
    for (const u of hull) roles[u.i] = 'done';
    roles[sortedPts[cur].i] = 'active';
    return { ...roles, ...extra };
  };
  const scanVars = (k: number): Array<[string, string | number]> => [
    ['p', names[sortedPts[k].i]],
    ['len(hull)', hull.length],
    ['pops so far', pops],
  ];

  snap(G.init, `The scan walks the points in this order with a stack, hull. A counterclockwise walk around a convex polygon only turns left, so a point that makes the walk turn right or go straight is popped.`, {
    roles: { [bottom.i]: 'active' },
    tags,
    segments: fan,
    strips: [orderStrip(-1), stackStrip()],
  });

  sortedPts.forEach((u, k) => {
    for (;;) {
      if (hull.length <= 1) break;
      const a = hull[hull.length - 2];
      const b = hull[hull.length - 1];
      const c = cross(a.p, b.p, u.p);
      result.tests.push([a.p, b.p, u.p, c]);
      const turn: PlanePolygon = { id: 'turn', pts: [a.p, b.p, u.p], role: signRole(c), label: signed(c) };
      snap(
        G.test,
        `Turn test for ${nameOf(u.i)}: cross(${names[a.i]}, ${names[b.i]}, ${names[u.i]}) = ${c}. ` +
          (c > 0
            ? `Positive: ${names[a.i]} -> ${names[b.i]} -> ${names[u.i]} turns left, so ${names[b.i]} can stay.`
            : c < 0
              ? `Negative: the walk would turn right at ${names[b.i]}, so ${names[b.i]} lies inside the hull or on an edge.`
              : `Zero: ${names[a.i]}, ${names[b.i]} and ${names[u.i]} are collinear, so ${names[b.i]} would sit on an edge; <= 0 pops it too.`),
        { roles: scanRoles(k, { [a.i]: 'compare', [b.i]: 'compare' }), tags, segments: [...fan, ...chain(), edge('probe', b.p, u.p, 'active', false)], polygons: [turn], strips: [orderStrip(k), stackStrip()] },
        [...scanVars(k), ['cross', c]],
      );
      if (c > 0) break;
      hull.pop();
      popped.add(b.i);
      pops += 1;
      snap(
        G.pop,
        `Pop ${names[b.i]}: it is not a strict left turn, so it cannot be a corner of the hull. The stack is now ${hull.map((h) => names[h.i]).join(' ')}; test ${names[u.i]} against the new top.`,
        {
          roles: scanRoles(k, { [b.i]: 'bad' }),
          tags,
          segments: [...fan, ...chain(), { id: `gone${b.i}`, a: a.p, b: b.p, role: 'bad', dashed: true }, edge('probe', a.p, u.p, 'active', false)],
          strips: [orderStrip(k), stackStrip()],
        },
        [...scanVars(k), ['cross', c]],
      );
    }
    hull.push(u);
    snap(
      G.push,
      hull.length === 1
        ? `Push the pivot ${nameOf(u.i)}: the stack holds fewer than two points, so there is no turn to test yet.`
        : hull.length === 2
          ? `Push ${nameOf(u.i)}: with one point on the stack there is no turn to test yet; only a farther point on the same ray from the pivot can pop it.`
          : `Push ${nameOf(u.i)}. The stack ${hull.map((h) => names[h.i]).join(' ')} is a chain that turns left at every point.`,
      { roles: scanRoles(k, { [u.i]: 'done' }), tags, segments: [...fan, ...chain()], strips: [orderStrip(k), stackStrip()] },
      scanVars(k),
    );
  });

  result.hull = hull.map((u) => u.p);
  const roles: Record<number, Role> = {};
  for (const i of popped) roles[i] = 'muted';
  for (const u of hull) roles[u.i] = 'done';
  snap(
    G.done,
    `Done: the hull is ${hull.map((u) => nameOf(u.i)).join(', ')}, counterclockwise from the pivot. ` +
      `${points.length} points needed ${result.tests.length} turn tests and ${pops} pop${pops === 1 ? '' : 's'}: every point is pushed once and popped at most once, so the scan is linear and the sort dominates.`,
    {
      roles,
      segments: [...chain(), edge(`e${hull[hull.length - 1].i}-${hull[0].i}`, hull[hull.length - 1].p, hull[0].p)],
      polygons: [{ id: 'hull', pts: hull.map((u) => u.p), role: 'done' }],
      strips: [orderStrip(-1), stackStrip()],
    },
    [['hull size', hull.length], ['turn tests', result.tests.length], ['pops', pops]],
  );
  return { frames, result };
}

/* ---------- Jarvis march ---------- */

export const JARVIS_CODE = [
  'jarvis_march(points): pts = unique_points(points)',
  '  if len(pts) < 3: return sorted(pts, key=lambda p: (p.x, p.y))',
  '  leftmost = min(pts, key=lambda p: (p.x, p.y)); hull = [leftmost]',
  '  while len(hull) <= len(pts):                 # a hull never has more vertices than points',
  '    current = hull[-1]; next_point = None',
  '    for point in pts: if point is current: continue',
  '      if next_point is None: next_point = point; continue',
  '      cross = cross_product(current, next_point, point)',
  '      if cross < 0 or (cross == 0 and dist2(current, point) > dist2(current, next_point)): next_point = point',
  '    if next_point is leftmost: break',
  '    hull.append(next_point)',
  '  return hull',
];

const J = { unique: 0, few: 1, start: 2, round: 4, first: 6, test: 7, take: 8, closed: 9, append: 10, done: 11 };

export interface JarvisResult {
  /** Every cross product of the wrapping, in order: [current, next_point, point, cross]. */
  tests: Array<[XY, XY, XY, number]>;
  hull: XY[];
}

export function jarvisTrace(points: XY[]): { frames: Array<Frame<PlaneState>>; result: JarvisResult } {
  const { frames, names, dup, firstOf, nameOf, snap } = hullFrames(points, 'Jarvis march');
  const uniq = uniquePoints(points);
  const result: JarvisResult = { tests: [], hull: [] };

  snap(
    J.unique,
    `${points.length} point${points.length === 1 ? '' : 's'}. jarvis_march first calls unique_points, which keeps the first copy of each point.` +
      (dup.size ? ` ${[...dup].map((i) => `${names[i]} repeats ${names[firstOf.get(`${points[i][0]},${points[i][1]}`)!]}`).join(', ')}: dropped (drawn hollow).` : ' There are no duplicates.'),
    {},
    [['points', points.length], ['distinct', uniq.length]],
  );
  if (uniq.length < 3) {
    const sorted = [...uniq].sort((a, b) => a.p[0] - b.p[0] || a.p[1] - b.p[1]);
    result.hull = sorted.map((u) => u.p);
    const roles: Record<number, Role> = {};
    for (const u of sorted) roles[u.i] = 'done';
    snap(
      J.few,
      `Only ${uniq.length} distinct point${uniq.length === 1 ? '' : 's'}: jarvis_march returns them in a new list, sorted by (x, y): ${sorted.map((u) => nameOf(u.i)).join(', ') || 'an empty list'}.`,
      { roles, segments: sorted.length === 2 ? [edge('h0', sorted[0].p, sorted[1].p)] : [] },
      [['distinct', uniq.length]],
    );
    return { frames, result };
  }

  let leftmost = uniq[0];
  for (const u of uniq) if (lexLess(u.p, leftmost.p)) leftmost = u;
  const hull = [leftmost];
  let tests = 0;
  const hullStrip = () => ({ label: 'Hull', items: hull.map((u): StripItem => ({ text: names[u.i], role: 'done' })) });
  const chain = (): PlaneSegment[] => hull.slice(1).map((u, k) => edge(`e${k}`, hull[k].p, u.p));
  const baseRoles = (): Record<number, Role> => Object.fromEntries(hull.map((u) => [u.i, 'done' as Role]));
  snap(
    J.start,
    `Start at ${nameOf(leftmost.i)}, the leftmost point (lowest on a tie). Nothing lies to its left, so it is a hull vertex. From each vertex, the next one is the point with every other point on its left: wrap the set like a string.`,
    { roles: { [leftmost.i]: 'active' }, strips: [hullStrip()] },
    [['hull', names[leftmost.i]]],
  );

  while (hull.length <= uniq.length) {
    const current = hull[hull.length - 1];
    let next: { p: XY; i: number } | null = null;
    snap(
      J.round,
      `From ${nameOf(current.i)}: scan every point and keep the most clockwise one as next_point. Every point it beats then lies on the left of the line ${names[current.i]} -> next_point, or on it.`,
      { roles: { ...baseRoles(), [current.i]: 'active' }, segments: chain(), strips: [hullStrip()] },
      [['current', names[current.i]], ['hull size', hull.length]],
    );
    for (const u of uniq) {
      if (u === current) continue;
      if (next === null) {
        next = u;
        snap(
          J.first,
          `next_point is None, so the first other point, ${nameOf(u.i)}, becomes the candidate.`,
          { roles: { ...baseRoles(), [current.i]: 'active', [u.i]: 'compare' }, segments: [...chain(), { id: 'cand', a: current.p, b: u.p, role: 'compare' }], strips: [hullStrip()] },
          [['current', names[current.i]], ['next_point', names[u.i]]],
        );
        continue;
      }
      const c = cross(current.p, next.p, u.p);
      result.tests.push([current.p, next.p, u.p, c]);
      tests += 1;
      const farther = c === 0 && dist2(current.p, u.p) > dist2(current.p, next.p);
      const take = c < 0 || farther;
      const before: { p: XY; i: number } = next;
      const why =
        c < 0
          ? `negative: ${names[u.i]} is clockwise of ${names[before.i]}, so ${names[before.i]} cannot be next (${names[u.i]} would lie on its right). ${names[u.i]} becomes the candidate.`
          : c > 0
            ? `positive: ${names[u.i]} is on the left of ${names[current.i]} -> ${names[before.i]}, as it should be. Keep ${names[before.i]}.`
            : farther
              ? `zero: same ray, and ${names[u.i]} is farther (squared distance ${dist2(current.p, u.p)} > ${dist2(current.p, before.p)}), so it takes over: ${names[before.i]} lies between ${names[current.i]} and ${names[u.i]}.`
              : `zero: same ray, but ${names[u.i]} is not farther, so keep ${names[before.i]}.`;
      if (take) next = u;
      snap(
        take ? J.take : J.test,
        `cross(${names[current.i]}, ${names[before.i]}, ${names[u.i]}) = ${c}, ${why}`,
        {
          roles: { ...baseRoles(), [current.i]: 'active', [before.i]: 'compare', [u.i]: take ? 'compare' : 'idle' },
          segments: [...chain(), { id: 'probe', a: current.p, b: u.p, role: 'idle', dashed: true }, { id: 'cand', a: current.p, b: next.p, role: 'compare' }],
          polygons: [{ id: 'turn', pts: [current.p, before.p, u.p], role: signRole(c), label: signed(c) }],
          strips: [hullStrip()],
        },
        [['current', names[current.i]], ['next_point', names[next.i]], ['cross', c], ['tests so far', tests]],
      );
    }
    if (next === leftmost) {
      snap(
        J.closed,
        `next_point is ${names[leftmost.i]}, the starting point: the wrap is closed. jarvis_march returns ${hull.length} vertices after ${hull.length} rounds of ${uniq.length - 1} points each.`,
        { roles: baseRoles(), segments: [...chain(), edge('close', current.p, leftmost.p)], polygons: [{ id: 'hull', pts: hull.map((u) => u.p), role: 'done' }], strips: [hullStrip()] },
        [['hull size', hull.length], ['cross products', tests]],
      );
      break;
    }
    hull.push(next!);
    snap(
      J.append,
      `${nameOf(next!.i)} has every other point on its left, or nearer on the same ray: append it. It is the next hull vertex counterclockwise.`,
      { roles: { ...baseRoles(), [next!.i]: 'done' }, segments: chain(), strips: [hullStrip()] },
      [['hull size', hull.length], ['cross products', tests]],
    );
  }
  result.hull = hull.map((u) => u.p);
  const total = result.hull.length;
  snap(
    J.done,
    `Done: ${total} hull vertices, counterclockwise from the leftmost point: ${hull.map((u) => names[u.i]).join(', ')}. The cost is one pass over the points per vertex, O(n h): ${tests} cross products here, against ${approx(uniq.length * Math.log2(uniq.length), 0)} for n log2 n.`,
    { roles: baseRoles(), segments: [...chain(), edge('close', hull[hull.length - 1].p, leftmost.p)], polygons: [{ id: 'hull', pts: result.hull, role: 'done' }], strips: [hullStrip()] },
    [['hull size', total], ['cross products', tests]],
  );
  return { frames, result };
}
