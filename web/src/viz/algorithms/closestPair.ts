/**
 * Closest pair tracer, drawn with PlaneView: the dividing line of every call, the points
 * outside the current call faded, the pairs a base case compares, the strip of half-width d
 * around the line and the few strip pairs it measures, with the call stack beside the plane.
 *
 * Mirrors Algorithms/Computational_Geometry/Advanced_Geometry/Closest_Pair_of_Points/Python/closest_pair.py:
 * closest_pair (ValueError below two points; points_x and points_y are stable sorts on x alone
 * and on y alone, so ties keep the input order) and closest_pair_recursive (n <= 3: brute force
 * over every pair in points_x order, a strictly smaller distance wins; otherwise mid = n // 2,
 * the line through points_x[mid], points_y split by membership in left_x (coordinates with
 * multiplicity, as split_by_membership does), the right result kept on a tie
 * (dist_left < dist_right picks the left), the strip of points_y with |x - mid_x| < d scanned in
 * y order, each point against the following ones while their y gap is below d).
 * Golden fixtures (__fixtures__/geometry.json) pin every distance computed, in order, and the
 * result.
 *
 * Input: "(0,0) (1,6) (2,2) (4,5) (5,6) (7,1) (8,8) (9,3)"
 */
import { InputError, type Frame, type Role } from '../core/types';
import type { PlaneBand, PlaneLine, PlanePoint, PlaneSegment, PlaneState, XY } from '../renderers/PlaneView';
import type { StripItem } from '../ui/molecules/Strip';
import { approx, letter, ptText, pyFloat, readPoints } from './pointLineCircle';

export const CLOSEST_LIMITS = { maxPoints: 16 };

/** "(0,0) (1,6) (2,2)": up to 16 points; duplicates are legal, fewer than two raise ValueError. */
export function parseClosest(text: string): XY[] {
  const body = text.trim().replace(/^(?:points?|pts)\s*[:=]?\s*/i, '');
  const pts = readPoints(body, 'the points');
  if (pts.length === 0) throw new InputError('Enter some points as (x, y), for example (0,0) (1,6) (2,2) (4,5).');
  if (pts.length > CLOSEST_LIMITS.maxPoints) throw new InputError(`At most ${CLOSEST_LIMITS.maxPoints} points, so the recursion stays readable (got ${pts.length}).`);
  return pts;
}

export const CLOSEST_CODE = [
  'closest_pair(points): if len(points) < 2: raise ValueError("Need at least 2 points")',
  '  points_x = sorted(points, key=lambda p: p[0]); points_y = sorted(points, key=lambda p: p[1])',
  'closest_pair_recursive(points_x, points_y): n = len(points_x)',
  '  if n <= 3: return brute_force_closest_pair(points_x)     # every pair; a smaller distance wins',
  '  mid = n // 2; mid_point = points_x[mid]                  # the dividing line x = mid_point[0]',
  '  left_x, right_x = points_x[:mid], points_x[mid:]; left_y, right_y = split_by_membership(points_y, left_x)',
  '  dist_left, p1_left, p2_left = closest_pair_recursive(left_x, left_y)',
  '  dist_right, p1_right, p2_right = closest_pair_recursive(right_x, right_y)',
  '  min_dist, pair = (dist_left, left pair) if dist_left < dist_right else (dist_right, right pair)',
  '  strip = [p for p in points_y if abs(p[0] - mid_point[0]) < min_dist]',
  '  for i in range(len(strip)): j = i + 1',
  '    while j < len(strip) and (strip[j][1] - strip[i][1]) < min_dist:',
  '      dist = distance(strip[i], strip[j]); if dist < min_dist: min_dist, pair = dist, (strip[i], strip[j])',
  '      j += 1',
  '  return min_dist, pair[0], pair[1]',
];

const K = { entry: 0, sort: 1, call: 2, base: 3, split: 4, divide: 5, left: 6, right: 7, pick: 8, strip: 9, scanI: 10, scanStop: 11, measure: 12, ret: 14 };

export interface ClosestResult {
  /** [distance, p1, p2], or the ValueError. */
  result?: [number, XY, XY];
  error?: string;
  /** Every pair distance() was called on, in order. */
  measured: Array<[XY, XY]>;
}

interface Item {
  p: XY;
  i: number;
}

const distance = (a: XY, b: XY) => Math.sqrt((a[0] - b[0]) * (a[0] - b[0]) + (a[1] - b[1]) * (a[1] - b[1]));

export function closestTrace(points: XY[]): { frames: Array<Frame<PlaneState>>; result: ClosestResult } {
  const frames: Array<Frame<PlaneState>> = [];
  const names = points.map((_, i) => letter(i));
  const measured: Array<[XY, XY]> = [];
  let computed = 0;
  const stack: string[] = [];
  const splits: Array<{ x: number; depth: number }> = [];
  let inCall: Set<number> | null = null;

  interface Pic {
    roles?: Record<number, Role>;
    tags?: Record<number, string>;
    segments?: PlaneSegment[];
    bands?: PlaneBand[];
    current?: { x: number } | null;
  }
  const snap = (line: number | undefined, caption: string, pic: Pic = {}, vars: Array<[string, string | number]> = []) => {
    const pts: PlanePoint[] = points.map((p, i) => ({
      id: `p${i}`,
      at: p,
      label: names[i],
      role: pic.roles?.[i] ?? (inCall && !inCall.has(i) ? 'muted' : undefined),
      tag: pic.tags?.[i],
    }));
    const lines: PlaneLine[] = splits.map((s, k) => ({
      id: `split${k}`,
      at: [s.x, 0],
      dir: [0, 1],
      role: k === splits.length - 1 && pic.current !== null ? 'idle' : 'muted',
      dashed: true,
      label: k === splits.length - 1 && pic.current !== null ? `x = ${s.x}` : undefined,
    }));
    const callStrip = { label: 'Calls', items: stack.length ? stack.map((s, k): StripItem => ({ text: s, role: k === stack.length - 1 ? 'active' : undefined })) : [{ text: 'none' }] };
    frames.push({
      line,
      caption,
      vars: [...vars, ['distances computed', computed]],
      state: { label: 'closest pair of points', points: pts, segments: pic.segments, bands: pic.bands, lines, strips: [callStrip] },
    });
  };
  const nm = (it: Item) => `${names[it.i]} ${ptText(it.p)}`;
  const pairSeg = (id: string, a: Item, b: Item, role: Role, d: number, grow = false): PlaneSegment => ({ id, a: a.p, b: b.p, role, grow, label: approx(d) });

  if (points.length < 2) {
    snap(K.entry, `closest_pair needs at least two points to form a pair: with ${points.length} it raises ValueError: Need at least 2 points.`, { roles: Object.fromEntries(points.map((_, i) => [i, 'bad' as Role])) });
    return { frames, result: { error: 'ValueError: Need at least 2 points', measured } };
  }

  const items: Item[] = points.map((p, i) => ({ p, i }));
  const px = [...items].sort((a, b) => a.p[0] - b.p[0]);
  const py = [...items].sort((a, b) => a.p[1] - b.p[1]);
  const xTags = Object.fromEntries(px.map((it, k) => [it.i, `x${k}`]));
  snap(
    K.sort,
    `${points.length} points, so ${(points.length * (points.length - 1)) / 2} pairs for brute force. Sort once by x (points_x, tagged x0, x1, ...) and once by y (points_y); both sorts are stable, so equal coordinates keep the input order. The recursion only splits these lists.`,
    { tags: xTags },
    [['n', points.length]],
  );

  const rec = (xs: Item[], ys: Item[], depth: number): { d: number; a: Item; b: Item } => {
    const n = xs.length;
    const label = `${names[xs[0].i]}..${names[xs[n - 1].i]} (${n})`;
    stack.push(label);
    const outer = inCall;
    inCall = new Set(xs.map((it) => it.i));
    const keep = () => {
      inCall = new Set(xs.map((it) => it.i));
    };
    let result: { d: number; a: Item; b: Item };
    if (n <= 3) {
      snap(K.base, `Call on ${label}: n = ${n} <= 3, so brute_force_closest_pair compares every pair, in points_x order, starting from min_dist = inf.`, {}, [['n', n]]);
      let min = Infinity;
      let pa: Item | null = null;
      let pb: Item | null = null;
      for (let a = 0; a < n; a++) {
        for (let b = a + 1; b < n; b++) {
          const d = distance(xs[a].p, xs[b].p);
          measured.push([xs[a].p, xs[b].p]);
          computed += 1;
          const better = d < min;
          const was = min;
          if (better) {
            min = d;
            pa = xs[a];
            pb = xs[b];
          }
          snap(
            K.base,
            `distance(${nm(xs[a])}, ${nm(xs[b])}) = ${approx(d)}. ` + (better ? `${approx(d)} < ${was === Infinity ? 'inf' : approx(was)}: the best pair of this call so far.` : `Not below ${approx(min)}: keep ${names[pa!.i]}-${names[pb!.i]}.`),
            { roles: { [xs[a].i]: 'compare', [xs[b].i]: 'compare', [pa!.i]: 'done', [pb!.i]: 'done' }, segments: [pairSeg('local', pa!, pb!, 'done', min), ...(better ? [] : [pairSeg('try', xs[a], xs[b], 'compare', d, true)])] },
            [['n', n], ['min_dist', approx(min)]],
          );
        }
      }
      result = { d: min, a: pa!, b: pb! };
    } else {
      const mid = Math.floor(n / 2);
      const midPoint = xs[mid];
      const leftX = xs.slice(0, mid);
      const rightX = xs.slice(mid);
      // split_by_membership: by coordinates, with multiplicity, keeping the y order.
      const remaining = new Map<string, number>();
      for (const it of leftX) remaining.set(`${it.p[0]},${it.p[1]}`, (remaining.get(`${it.p[0]},${it.p[1]}`) ?? 0) + 1);
      const leftY: Item[] = [];
      const rightY: Item[] = [];
      for (const it of ys) {
        const k = `${it.p[0]},${it.p[1]}`;
        if ((remaining.get(k) ?? 0) > 0) {
          remaining.set(k, remaining.get(k)! - 1);
          leftY.push(it);
        } else rightY.push(it);
      }
      splits.push({ x: midPoint.p[0], depth });
      snap(
        K.split,
        `Call on ${label}: n = ${n} > 3, so divide. mid = ${n} // 2 = ${mid}, and the dividing line goes through points_x[${mid}] = ${nm(midPoint)}: x = ${midPoint.p[0]}. ` +
          `The left half is ${leftX.map((it) => names[it.i]).join(' ')}, the right half ${rightX.map((it) => names[it.i]).join(' ')}` +
          (leftX[leftX.length - 1].p[0] === midPoint.p[0] ? `; both have points on the line, which is why the halves are cut by position in points_x, not by x <= ${midPoint.p[0]}.` : '.'),
        {},
        [['n', n], ['mid', mid], ['mid_point', ptText(midPoint.p)]],
      );
      // A child's dividing line goes when the child returns, so only this call's ancestors stay drawn.
      const splitAt = splits.length;
      const left = rec(leftX, leftY, depth + 1);
      splits.length = splitAt;
      keep();
      const right = rec(rightX, rightY, depth + 1);
      splits.length = splitAt;
      keep();
      let best = left.d < right.d ? left : right;
      const pickText =
        left.d < right.d
          ? `dist_left = ${approx(left.d)} < dist_right = ${approx(right.d)}: keep the left pair ${names[left.a.i]}-${names[left.b.i]}`
          : `dist_left = ${approx(left.d)} is not below dist_right = ${approx(right.d)}: keep the right pair ${names[right.a.i]}-${names[right.b.i]}${left.d === right.d ? ' (a tie goes right)' : ''}`;
      const d = best.d;
      const strip = ys.filter((it) => Math.abs(it.p[0] - midPoint.p[0]) < d);
      const band: PlaneBand = { id: 'strip', x0: midPoint.p[0] - (Number.isFinite(d) ? d : 0), x1: midPoint.p[0] + (Number.isFinite(d) ? d : 0), role: 'active', label: 'strip' };
      snap(
        K.pick,
        `Back in ${label}. ${pickText}, so d = ${approx(d)}. A closer pair would need one point on each side of the line, both within d of it.`,
        { roles: { [left.a.i]: 'compare', [left.b.i]: 'compare', [right.a.i]: 'compare', [right.b.i]: 'compare', [best.a.i]: 'done', [best.b.i]: 'done' }, segments: [pairSeg('local', best.a, best.b, 'done', d), pairSeg('other', best === left ? right.a : left.a, best === left ? right.b : left.b, 'compare', best === left ? right.d : left.d)] },
        [['n', n], ['dist_left', approx(left.d)], ['dist_right', approx(right.d)], ['min_dist', approx(d)]],
      );
      const stripTags = Object.fromEntries(strip.map((it, k) => [it.i, `s${k}`]));
      const stripRoles = (): Record<number, Role> => ({ ...Object.fromEntries(strip.map((it) => [it.i, 'active' as Role])), [best.a.i]: 'done', [best.b.i]: 'done' });
      snap(
        K.strip,
        strip.length
          ? `The strip: the points of points_y with |x - ${midPoint.p[0]}| < ${approx(d)}, already in y order: ${strip.map((it) => names[it.i]).join(', ')} (tagged s0, s1, ...). Nothing outside it can beat d across the line.`
          : `The strip is empty: no point is closer than d = ${approx(d)} to the line${d === 0 ? ' (d is 0, a duplicate pair, which nothing beats)' : ''}.`,
        { roles: stripRoles(), tags: stripTags, bands: [band], segments: [pairSeg('local', best.a, best.b, 'done', d)] },
        [['n', n], ['min_dist', approx(d)], ['strip size', strip.length]],
      );
      let min = d;
      for (let a = 0; a < strip.length; a++) {
        let b = a + 1;
        while (b < strip.length && strip[b].p[1] - strip[a].p[1] < min) {
          const dd = distance(strip[a].p, strip[b].p);
          measured.push([strip[a].p, strip[b].p]);
          computed += 1;
          const better = dd < min;
          const was = min;
          if (better) {
            min = dd;
            best = { d: dd, a: strip[a], b: strip[b] };
          }
          snap(
            K.measure,
            `s${a} ${names[strip[a].i]} and s${b} ${names[strip[b].i]}: the y gap ${strip[b].p[1] - strip[a].p[1]} is below ${approx(was)}, so measure: distance = ${approx(dd)}. ` +
              (better ? `Closer than ${approx(was)}: a new best pair across the line.` : 'Not closer.'),
            {
              roles: { ...stripRoles(), [strip[a].i]: 'compare', [strip[b].i]: 'compare', [best.a.i]: 'done', [best.b.i]: 'done' },
              tags: stripTags,
              bands: [band],
              segments: [pairSeg('local', best.a, best.b, 'done', min), ...(better ? [] : [pairSeg('try', strip[a], strip[b], 'compare', dd, true)])],
            },
            [['n', n], ['min_dist', approx(min)], ['i', a], ['j', b]],
          );
          b += 1;
        }
        if (b < strip.length) {
          snap(
            K.scanStop,
            `s${a} ${names[strip[a].i]}: the next point s${b} ${names[strip[b].i]} is ${strip[b].p[1] - strip[a].p[1]} higher, not below d = ${approx(min)}, so stop. Points further up the strip are higher still: only a handful of neighbours ever get measured.`,
            { roles: { ...stripRoles(), [strip[a].i]: 'compare' }, tags: stripTags, bands: [band], segments: [pairSeg('local', best.a, best.b, 'done', min)] },
            [['n', n], ['min_dist', approx(min)], ['i', a], ['j', b]],
          );
        }
      }
      result = best;
    }
    snap(
      K.ret,
      `${label} returns ${approx(result.d)}, the pair ${nm(result.a)} and ${nm(result.b)}${stack.length > 1 ? ', to its caller' : ''}.`,
      { roles: { [result.a.i]: 'done', [result.b.i]: 'done' }, segments: [pairSeg('local', result.a, result.b, 'done', result.d)], current: null },
      [['n', n], ['min_dist', approx(result.d)]],
    );
    stack.pop();
    inCall = outer;
    return result;
  };

  const r = rec(px, py, 0);
  inCall = null;
  const total = (points.length * (points.length - 1)) / 2;
  snap(
    undefined,
    `Done: the closest pair is ${nm(r.a)} and ${nm(r.b)}, at distance ${pyFloat(r.d)}. The run computed ${computed} distances, against ${total} for brute force.`,
    { roles: { [r.a.i]: 'done', [r.b.i]: 'done' }, segments: [pairSeg('local', r.a, r.b, 'done', r.d)], current: null },
    [['distance', pyFloat(r.d)]],
  );
  return { frames, result: { result: [r.d, r.a.p, r.b.p], measured } };
}
