/**
 * Rotating calipers tracer, drawn with PlaneView: the polygon, the current edge with one jaw
 * of the calipers lying on it and the parallel jaw through the far vertex j, the heights that
 * move j forward, and the antipodal pairs measured (diameter) or the heights over each edge
 * (width).
 *
 * Mirrors Algorithms/Computational_Geometry/Advanced_Geometry/Rotating_Calipers/Python/rotating_calipers.py:
 * clean_polygon (consecutive repeated vertices go, and a last vertex equal to the first; all
 * collinear points shrink to the two ends by (x, y); vertices with a zero turn are popped while
 * building, then across the wrap-around at the end and at the start),
 * rotating_calipers_diameter (fewer than three corners: the distance between them, 0.0 for one
 * and (0, 0) for none; else max_dist = -1.0, p1, p2 = pts[0], pts[1], j = 1; for each edge
 * (i, i + 1) j moves on while |cross(pts[i], pts[i+1], pts[j+1])| > |cross(.., pts[j])|; j + 1
 * joins the candidates on an equal area; a pair replaces the best only when strictly farther,
 * tested from i, then from i + 1) and rotating_calipers_width (0.0 below three corners; the
 * same pointer, width = |cross| / edge length, the minimum over all edges).
 * Golden fixtures (__fixtures__/geometry.json) pin the cleaned polygon, every cross product
 * and every squared distance the two loops compute, in order, and both results.
 *
 * Input: "(0,0) (4,0) (5,2) (2,5) (-1,3); diameter, width"
 */
import { InputError, type Frame, type Role } from '../core/types';
import type { PlaneLine, PlanePoint, PlanePolygon, PlaneSegment, PlaneState, XY } from '../renderers/PlaneView';
import type { StripItem } from '../ui/molecules/Strip';
import { scriptSegments } from './hashTable';
import { approx, cross, dist2, letter, lexLess, ptText, pyFloat, readPoints, samePoint } from './pointLineCircle';
import { opStrip } from './segmentTree';

export type CaliperKind = 'diameter' | 'width';

export interface CaliperInput {
  polygon: XY[];
  ops: CaliperKind[];
}

export const CALIPER_LIMITS = { maxVertices: 12 };

/* ---------- clean_polygon ---------- */

export interface CleanEvent {
  kind: 'repeat' | 'wrapRepeat' | 'collinear' | 'flat' | 'flatEnd' | 'flatStart';
  /** Input indices of the vertices this step removed. */
  removed: number[];
}

/** clean_polygon, keeping the input index of every vertex, and the steps that removed some. */
export function cleanPolygon(polygon: XY[]): { pts: Array<{ p: XY; i: number }>; events: CleanEvent[] } {
  const events: CleanEvent[] = [];
  const pts: Array<{ p: XY; i: number }> = [];
  const repeats: number[] = [];
  polygon.forEach((p, i) => {
    if (pts.length === 0 || !samePoint(p, pts[pts.length - 1].p)) pts.push({ p, i });
    else repeats.push(i);
  });
  if (repeats.length) events.push({ kind: 'repeat', removed: repeats });
  const wrap: number[] = [];
  while (pts.length > 1 && samePoint(pts[0].p, pts[pts.length - 1].p)) wrap.push(pts.pop()!.i);
  if (wrap.length) events.push({ kind: 'wrapRepeat', removed: wrap });
  if (pts.length < 3) return { pts, events };
  if (pts.every((q) => cross(pts[0].p, pts[1].p, q.p) === 0)) {
    let lo = pts[0];
    let hi = pts[0];
    for (const q of pts) if (lexLess(q.p, lo.p)) lo = q; // min(): the first smallest
    for (const q of pts) if (lexLess(hi.p, q.p)) hi = q; // max(): the first largest
    events.push({ kind: 'collinear', removed: pts.filter((q) => q !== lo && q !== hi).map((q) => q.i) });
    return { pts: [lo, hi], events };
  }
  const out: Array<{ p: XY; i: number }> = [];
  for (const q of pts) {
    while (out.length >= 2 && cross(out[out.length - 2].p, out[out.length - 1].p, q.p) === 0) events.push({ kind: 'flat', removed: [out.pop()!.i] });
    out.push(q);
  }
  while (out.length >= 3 && cross(out[out.length - 2].p, out[out.length - 1].p, out[0].p) === 0) events.push({ kind: 'flatEnd', removed: [out.pop()!.i] });
  while (out.length >= 3 && cross(out[out.length - 1].p, out[0].p, out[1].p) === 0) events.push({ kind: 'flatStart', removed: [out.shift()!.i] });
  return { pts: out, events };
}

/* ---------- input ---------- */

const OP_NAMES: Record<string, CaliperKind> = { diameter: 'diameter', diam: 'diameter', d: 'diameter', width: 'width', w: 'width' };

/** True when the cleaned vertices turn the same way at every corner and wind around once. */
export function isConvexPolygon(pts: XY[]): boolean {
  const n = pts.length;
  if (n < 3) return true;
  let sign = 0;
  let turning = 0;
  for (let k = 0; k < n; k++) {
    const a = pts[k];
    const b = pts[(k + 1) % n];
    const c = pts[(k + 2) % n];
    const v = cross(a, b, c);
    if (v === 0) return false;
    if (sign === 0) sign = Math.sign(v);
    else if (Math.sign(v) !== sign) return false;
    const u = [b[0] - a[0], b[1] - a[1]];
    const w = [c[0] - b[0], c[1] - b[1]];
    turning += Math.atan2(u[0] * w[1] - u[1] * w[0], u[0] * w[0] + u[1] * w[1]);
  }
  return Math.abs(Math.abs(turning) - 2 * Math.PI) < 1e-6;
}

/** "(0,0) (4,0) (5,2) (2,5) (-1,3); diameter, width": a convex polygon in order, then the functions to run. */
export function parseCalipers(text: string): CaliperInput {
  const cut = text.search(/[;\n]/);
  const head = (cut < 0 ? text : text.slice(0, cut)).trim().replace(/^(?:polygon|hull|points?)\s*[:=]?\s*/i, '');
  const tail = cut < 0 ? '' : text.slice(cut + 1);
  const polygon = readPoints(head, 'the polygon');
  if (polygon.length > CALIPER_LIMITS.maxVertices) throw new InputError(`At most ${CALIPER_LIMITS.maxVertices} vertices, so every step stays readable (got ${polygon.length}).`);
  const ops = scriptSegments(tail).map((s): CaliperKind => {
    const kind = OP_NAMES[s.toLowerCase()];
    if (!kind) throw new InputError(`Cannot read "${s}". After the semicolon, list diameter and / or width.`);
    return kind;
  });
  const { pts } = cleanPolygon(polygon);
  if (pts.length >= 3 && !isConvexPolygon(pts.map((q) => q.p))) {
    throw new InputError(
      'These vertices are not a convex polygon in order. rotating_calipers expects the hull, walked once around (clockwise or counterclockwise), for example what graham_scan returns.',
    );
  }
  return { polygon, ops: ops.length ? ops : ['diameter', 'width'] };
}

/* ---------- pseudocode ---------- */

export const CALIPER_CODE = [
  'clean_polygon(hull): drop repeated vertices (in a row, and a last one equal to the first)',
  '  if every point is collinear: return [min(pts), max(pts)]        # by (x, y)',
  '  drop every vertex with cross(prev, v, next) == 0, also across the wrap-around',
  'rotating_calipers_diameter(hull): pts = clean_polygon(hull)',
  '  if len(pts) <= 2: return the distance between them (0.0 for one point or none)',
  '  max_dist = -1.0; p1, p2 = pts[0], pts[1]; j = 1',
  '  for i in range(n): next_i = (i + 1) % n                         # the edge (i, i+1)',
  '    while abs(cross(pts[i], pts[next_i], pts[j+1])) > abs(cross(pts[i], pts[next_i], pts[j])): j = j + 1',
  '    candidates = [j], plus j + 1 if its abs(cross) is equal         # an edge parallel to (i, i+1)',
  '    for k in candidates: for m in (i, next_i):',
  '      if distance_squared(pts[m], pts[k]) > max_dist: max_dist = it; p1, p2 = pts[m], pts[k]',
  '  return math.sqrt(max_dist), p1, p2',
  'rotating_calipers_width(hull): pts = clean_polygon(hull); if len(pts) < 3: return 0.0',
  '  min_width = inf; j = 1',
  '  for i in range(n): next_i = (i + 1) % n; move j on exactly as in the diameter',
  '    width = abs(cross(pts[i], pts[next_i], pts[j])) / math.sqrt(distance_squared(pts[i], pts[next_i]))',
  '    min_width = min(min_width, width)',
  '  return min_width',
];

const C = { clean: 0, collinear: 1, flat: 2, dEntry: 3, dFew: 4, dInit: 5, edge: 6, advance: 7, candidates: 8, measure: 10, dDone: 11, wEntry: 12, wInit: 13, wEdge: 14, wHeight: 15, wMin: 16, wDone: 17 };

/* ---------- tracer ---------- */

export interface CaliperStep {
  op: CaliperKind;
  clean: XY[];
  /** Every cross product of the loop after cleaning, in order: [o, a, b, value]. */
  cross: Array<[XY, XY, XY, number]>;
  /** Every squared distance of the loop, in order: [a, b, value]. */
  dist: Array<[XY, XY, number]>;
  /** diameter: [distance, p1, p2]; width: the width. */
  result: [number, XY, XY] | number;
}

export interface CaliperRun {
  frames: Array<Frame<PlaneState>>;
  steps: CaliperStep[];
}

/** The foot of the perpendicular from v to the line through a and b. */
function foot(v: XY, a: XY, b: XY): XY {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const l2 = dx * dx + dy * dy;
  if (l2 === 0) return a;
  const t = ((v[0] - a[0]) * dx + (v[1] - a[1]) * dy) / l2;
  return [a[0] + t * dx, a[1] + t * dy];
}

export function calipersTrace(input: CaliperInput): CaliperRun {
  const { polygon, ops } = input;
  const frames: Array<Frame<PlaneState>> = [];
  const steps: CaliperStep[] = [];
  const names = polygon.map((_, i) => letter(i));
  const opNames = ops.map((k) => `rotating_calipers_${k}`);
  let current = -1;
  const removed = new Set<number>();
  let live: Array<{ p: XY; i: number }> = polygon.map((p, i) => ({ p, i }));

  interface Pic {
    roles?: Record<number, Role>;
    segments?: PlaneSegment[];
    lines?: PlaneLine[];
    polygons?: PlanePolygon[];
    strips?: Array<{ label: string; items: StripItem[] }>;
  }
  const outline = (role: Role = 'idle'): PlaneSegment[] =>
    live.length < 2 ? [] : live.map((q, k) => ({ id: `e${q.i}`, a: q.p, b: live[(k + 1) % live.length].p, role, thin: true })).slice(0, live.length === 2 ? 1 : live.length);
  const snap = (line: number | undefined, caption: string, pic: Pic, vars: Array<[string, string | number]> = []) => {
    const points: PlanePoint[] = polygon.map((p, i) => ({ id: `v${i}`, at: p, label: removed.has(i) ? undefined : names[i], role: pic.roles?.[i] ?? (removed.has(i) ? 'muted' : undefined), ghost: removed.has(i) }));
    frames.push({
      line,
      caption,
      vars,
      state: {
        label: current >= 0 && current < ops.length ? opNames[current] : 'a convex polygon',
        points,
        segments: [...outline(), ...(pic.segments ?? [])],
        lines: pic.lines,
        polygons: pic.polygons,
        strips: [opStrip(opNames, current), ...(pic.strips ?? [])],
      },
    });
  };
  const nm = (q: { p: XY; i: number }) => names[q.i];
  const full = (q: { p: XY; i: number }) => `${names[q.i]} ${ptText(q.p)}`;

  snap(
    undefined,
    `A polygon with ${polygon.length} vertices, given in order. The calipers are two parallel lines that touch the polygon from opposite sides; the code turns them edge by edge and keeps a pointer j on the vertex the far jaw touches.`,
    {},
    [['vertices', polygon.length]],
  );

  ops.forEach((op, index) => {
    current = index;
    removed.clear();
    live = polygon.map((p, i) => ({ p, i }));
    const isDiam = op === 'diameter';
    snap(
      isDiam ? C.dEntry : C.wEntry,
      `${opNames[index]} starts by cleaning the polygon: repeated vertices and vertices with a zero turn would make the area test stall on a plateau (that is how the old width returned 0).`,
      {},
    );

    // clean_polygon, step by step.
    const cleaned = cleanPolygon(polygon);
    for (const ev of cleaned.events) {
      for (const i of ev.removed) removed.add(i);
      live = live.filter((q) => !ev.removed.includes(q.i));
      const list = ev.removed.map((i) => `${names[i]} ${ptText(polygon[i])}`).join(', ');
      const caption =
        ev.kind === 'repeat'
          ? `${list} repeat${ev.removed.length === 1 ? 's' : ''} the vertex before: a zero-length edge. Dropped.`
          : ev.kind === 'wrapRepeat'
            ? `${list} equal${ev.removed.length === 1 ? 's' : ''} the first vertex: the polygon is closed already, so the copy at the end is dropped.`
            : ev.kind === 'collinear'
              ? `Every point lies on one line, so the "polygon" is a segment: only its two ends by (x, y) are kept${ev.removed.length ? ` (${list} dropped)` : ''}.`
              : `${list} has a zero turn (cross == 0): it lies on the edge between its neighbours${ev.kind === 'flat' ? '' : ' across the wrap-around'}, so it is not a corner. Dropped.`;
      snap(ev.kind === 'collinear' ? C.collinear : ev.kind === 'repeat' || ev.kind === 'wrapRepeat' ? C.clean : C.flat, caption, { roles: Object.fromEntries(ev.removed.map((i) => [i, 'bad' as Role])) });
    }
    const pts = cleaned.pts;
    const P = pts.map((q) => q.p);
    const n = pts.length;
    const crossLog: CaliperStep['cross'] = [];
    const distLog: CaliperStep['dist'] = [];
    const lc = (o: XY, a: XY, b: XY) => {
      const v = cross(o, a, b);
      crossLog.push([o, a, b, v]);
      return v;
    };
    const ld = (a: XY, b: XY) => {
      const v = dist2(a, b);
      distLog.push([a, b, v]);
      return v;
    };
    const cleanList = pts.map((q) => nm(q)).join(' ') || 'nothing';
    const cornerVars: Array<[string, string | number]> = [['corners', n]];

    if (isDiam && n <= 2) {
      let result: [number, XY, XY];
      if (n === 0) result = [0, [0, 0], [0, 0]];
      else if (n === 1) result = [0, P[0], P[0]];
      else result = [Math.sqrt(ld(P[0], P[1])), P[0], P[1]];
      snap(
        C.dFew,
        n === 0
          ? 'No vertex at all: the diameter is 0.0, between two placeholder points (0, 0).'
          : n === 1
            ? `One distinct point: the diameter is 0.0, from ${full(pts[0])} to itself.`
            : `Two corners left: the diameter is simply their distance, math.sqrt(${distLog[0][2]}) = ${pyFloat(result[0])}.`,
        { roles: Object.fromEntries(pts.map((q) => [q.i, 'done' as Role])), segments: n === 2 ? [{ id: 'best', a: P[0], b: P[1], role: 'done', grow: true, label: approx(result[0]) }] : [] },
        [['diameter', pyFloat(result[0])]],
      );
      steps.push({ op, clean: P, cross: crossLog, dist: distLog, result });
      return;
    }
    if (!isDiam && n < 3) {
      snap(C.wEntry, `Only ${n} corner${n === 1 ? '' : 's'} after cleaning (${cleanList}): a point or a segment fits between two parallel lines at distance 0, so the width is 0.0.`, {
        roles: Object.fromEntries(pts.map((q) => [q.i, 'done' as Role])),
      });
      steps.push({ op, clean: P, cross: crossLog, dist: distLog, result: 0 });
      return;
    }

    let j = 1;
    let maxDist = -1;
    let best: [XY, XY] = [P[0], P[1]];
    let bestIdx: [number, number] = [0, 1];
    let minWidth = Infinity;
    let minAt = -1;
    let minJ = 0;
    let moves = 0;
    snap(
      isDiam ? C.dInit : C.wInit,
      isDiam
        ? `Strictly convex corners: ${cleanList}. Start with max_dist = -1.0, the pair (${nm(pts[0])}, ${nm(pts[1])}) as a placeholder, and j = 1.`
        : `Strictly convex corners: ${cleanList}. Start with min_width = inf and j = 1.`,
      { roles: { [pts[1].i]: 'compare' } },
      cornerVars,
    );

    const jaws = (i: number, jj: number): PlaneLine[] => {
      const a = P[i];
      const b = P[(i + 1) % n];
      const dir: XY = [b[0] - a[0], b[1] - a[1]];
      return [
        { id: 'jaw1', at: a, dir, role: 'active' },
        { id: 'jaw2', at: P[jj], dir, role: 'active', dashed: true },
      ];
    };
    const bestSeg = (): PlaneSegment[] => (isDiam && maxDist >= 0 ? [{ id: 'best', a: best[0], b: best[1], role: 'done', label: `best ${approx(Math.sqrt(maxDist))}` }] : []);
    const widthSeg = (): PlaneSegment[] => {
      if (isDiam || minAt < 0) return [];
      const [i, jj] = [minAt, minJ];
      const f = foot(P[jj], P[i], P[(i + 1) % n]);
      return [{ id: 'best', a: P[jj], b: f, role: 'done', label: `min ${approx(minWidth)}` }];
    };
    const edgeSeg = (i: number): PlaneSegment => ({ id: 'edge', a: P[i], b: P[(i + 1) % n], role: 'active' });
    const pairVars = (i: number): Array<[string, string | number]> => [
      ['i', `${i} (${nm(pts[i])})`],
      ['j', `${j} (${nm(pts[j])})`],
      ['j moves', moves],
      isDiam ? ['max_dist', maxDist < 0 ? '-1.0' : maxDist] : ['min_width', minWidth === Infinity ? 'inf' : approx(minWidth, 4)],
    ];

    for (let i = 0; i < n; i++) {
      const ni = (i + 1) % n;
      const ei = `${nm(pts[i])}${nm(pts[ni])}`;
      snap(
        isDiam ? C.edge : C.wEdge,
        `Edge ${ei}: lay one jaw of the calipers along it. The other jaw is parallel and touches the polygon at the vertex farthest from this edge, which j has to find.`,
        { roles: { [pts[i].i]: 'active', [pts[ni].i]: 'active', [pts[j].i]: 'compare' }, segments: [edgeSeg(i), ...bestSeg(), ...widthSeg()], lines: jaws(i, j) },
        pairVars(i),
      );
      for (;;) {
        const nj = (j + 1) % n;
        const aNext = Math.abs(lc(P[i], P[ni], P[nj]));
        const aCur = Math.abs(lc(P[i], P[ni], P[j]));
        const heights: PlaneSegment[] = [
          { id: 'hj', a: P[j], b: foot(P[j], P[i], P[ni]), role: 'compare', dashed: true, label: String(aCur) },
          ...(nj !== j ? [{ id: 'hn', a: P[nj], b: foot(P[nj], P[i], P[ni]), role: 'compare' as Role, dashed: true, label: String(aNext) }] : []),
        ];
        if (aNext > aCur) {
          j = nj;
          moves += 1;
          snap(
            C.advance,
            `|cross(${ei}, ${nm(pts[nj])})| = ${aNext} > |cross(${ei}, ${nm(pts[(nj + n - 1) % n])})| = ${aCur}: ${nm(pts[nj])} is farther from the line of ${ei} (the value is twice a triangle's area, so it grows with the height). j moves on to ${nm(pts[nj])}.`,
            { roles: { [pts[i].i]: 'active', [pts[ni].i]: 'active', [pts[nj].i]: 'compare' }, segments: [edgeSeg(i), ...heights, ...bestSeg(), ...widthSeg()], lines: jaws(i, j) },
            pairVars(i),
          );
          continue;
        }
        snap(
          C.advance,
          `|cross(${ei}, ${nm(pts[nj])})| = ${aNext} is not more than ${aCur} for ${nm(pts[j])}: the height over the edge has peaked (on a convex polygon it rises, then falls), so ${nm(pts[j])} is the far vertex and the second jaw rests on it.`,
          { roles: { [pts[i].i]: 'active', [pts[ni].i]: 'active', [pts[j].i]: 'compare' }, segments: [edgeSeg(i), ...heights, ...bestSeg(), ...widthSeg()], lines: jaws(i, j) },
          pairVars(i),
        );
        break;
      }
      if (isDiam) {
        const nj = (j + 1) % n;
        const candidates = [j];
        const tieNext = Math.abs(lc(P[i], P[ni], P[nj]));
        const tieCur = Math.abs(lc(P[i], P[ni], P[j]));
        if (tieNext === tieCur) candidates.push(nj);
        if (candidates.length === 2) {
          snap(
            C.candidates,
            `|cross| for ${nm(pts[nj])} equals that of ${nm(pts[j])} (${tieCur}): the edge ${nm(pts[j])}${nm(pts[nj])} is parallel to ${ei}, so the far jaw touches both ends and both are antipodal to the edge.`,
            { roles: { [pts[i].i]: 'active', [pts[ni].i]: 'active', [pts[j].i]: 'compare', [pts[nj].i]: 'compare' }, segments: [edgeSeg(i), { id: 'par', a: P[j], b: P[nj], role: 'compare' }, ...bestSeg()], lines: jaws(i, j) },
            pairVars(i),
          );
        }
        for (const k of candidates) {
          for (const m of [i, ni]) {
            const d = ld(P[m], P[k]);
            const better = d > maxDist;
            const was = maxDist;
            if (better) {
              maxDist = d;
              best = [P[m], P[k]];
              bestIdx = [m, k];
            }
            snap(
              C.measure,
              `Antipodal pair (${nm(pts[m])}, ${nm(pts[k])}): distance_squared = ${d}. ` +
                (better ? `${d} > ${was < 0 ? '-1.0' : was}: the farthest pair so far, length ${approx(Math.sqrt(d))}.` : `Not more than max_dist = ${maxDist}, so the best pair stays.`),
              {
                roles: { [pts[i].i]: 'active', [pts[ni].i]: 'active', [pts[m].i]: 'compare', [pts[k].i]: 'compare', [pts[bestIdx[0]].i]: 'done', [pts[bestIdx[1]].i]: 'done' },
                segments: [edgeSeg(i), ...bestSeg(), ...(better ? [] : [{ id: 'try', a: P[m], b: P[k], role: 'compare' as Role, grow: true, label: approx(Math.sqrt(d)) }])],
                lines: jaws(i, j),
              },
              pairVars(i),
            );
          }
        }
      } else {
        const len2 = ld(P[i], P[ni]);
        const lineLength = Math.sqrt(len2);
        const area = Math.abs(lc(P[i], P[ni], P[j]));
        const width = area / lineLength;
        const better = width < minWidth;
        if (better) {
          minWidth = width;
          minAt = i;
          minJ = j;
        }
        const f = foot(P[j], P[i], P[ni]);
        snap(
          better ? C.wMin : C.wHeight,
          `width = |cross(${ei}, ${nm(pts[j])})| / |${ei}| = ${area} / math.sqrt(${len2}) = ${approx(width, 4)}: the distance between the two jaws. ` +
            (better ? 'The narrowest strip so far.' : `Not less than min_width = ${approx(minWidth, 4)}.`),
          {
            roles: { [pts[i].i]: 'active', [pts[ni].i]: 'active', [pts[j].i]: better ? 'done' : 'compare' },
            segments: [edgeSeg(i), ...widthSeg(), ...(better ? [] : [{ id: 'try', a: P[j], b: f, role: 'compare' as Role, grow: true, label: approx(width) }])],
            lines: jaws(i, j),
          },
          pairVars(i),
        );
      }
    }

    if (isDiam) {
      const d = Math.sqrt(maxDist);
      snap(
        C.dDone,
        `Every edge has had its antipodal vertices measured, and j went around the polygon once (${moves} moves), so the loop is O(n). The diameter is math.sqrt(${maxDist}) = ${pyFloat(d)}, between ${nm(pts[bestIdx[0]])} ${ptText(best[0])} and ${nm(pts[bestIdx[1]])} ${ptText(best[1])}.`,
        { roles: { [pts[bestIdx[0]].i]: 'done', [pts[bestIdx[1]].i]: 'done' }, segments: bestSeg() },
        [['diameter', pyFloat(d)], ['j moves', moves]],
      );
      steps.push({ op, clean: P, cross: crossLog, dist: distLog, result: [d, best[0], best[1]] });
    } else {
      snap(
        C.wDone,
        `Every edge has had its height measured, with j moving ${moves} times in all. The width is ${pyFloat(minWidth)}: the polygon fits between two parallel lines that far apart, one of them along ${nm(pts[minAt])}${nm(pts[(minAt + 1) % n])}.`,
        { roles: { [pts[minAt].i]: 'done', [pts[(minAt + 1) % n].i]: 'done', [pts[minJ].i]: 'done' }, segments: widthSeg(), lines: jaws(minAt, minJ).map((l) => ({ ...l, role: 'done' as Role })) },
        [['width', pyFloat(minWidth)], ['j moves', moves]],
      );
      steps.push({ op, clean: P, cross: crossLog, dist: distLog, result: minWidth });
    }
  });

  current = ops.length;
  removed.clear();
  live = polygon.map((p, i) => ({ p, i }));
  snap(
    undefined,
    `Done: ${steps.map((s) => `${s.op} ${pyFloat(Array.isArray(s.result) ? s.result[0] : s.result)}`).join(', ')}. Both loops look at O(n) antipodal pairs instead of all n^2 pairs of vertices.`,
    {},
  );
  return { frames, steps };
}
