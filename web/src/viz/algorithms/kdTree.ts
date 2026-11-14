/**
 * K-D tree tracer (2D), drawn with KdTreeView: the plane with every node's split line next to
 * the tree.
 *
 * Mirrors Data_Structures/Non_Linear/Trees/K_D_Tree/Python/kd_tree.py:
 * KDTree.__init__ / _build / insert / nearest / range_search and _squared_distance.
 * _build sorts the points by the axis depth % k (a stable sort, so equal coordinates keep their
 * order), takes pts[len // 2] as the node and recurses on the two slices. insert walks down with
 * point[axis] < node.point[axis] going left (ties go right) and attaches a leaf. nearest keeps
 * an explicit stack of (node, bound): it starts with best = the root, pops a node, skips it when
 * its bound (the squared distance to the parent's split line) is >= best_dist, otherwise
 * measures it (a strictly smaller distance wins), then pushes the far child with bound diff^2
 * and the near child on top. range_search pops a node, reports it if lo <= p <= hi on every
 * axis, and pushes the right child if hi[axis] >= p[axis] and the left child if
 * lo[axis] <= p[axis] (left on top, so the result is in preorder).
 * Golden fixtures (__fixtures__/rangeQueries.json) pin the tree shape after the build and
 * every operation, every result, and the points each search measures or visits, in order.
 *
 * Input: "points (7,2) (5,4) (9,6); nearest (6,5), range (3,3) (8,7), insert (3,6)"
 */
import { InputError, type Frame, type Role } from '../core/types';
import type { KdNodeView, KdPointView, KdRect, KdSplitView, KdTreeState } from '../renderers/KdTreeView';
import type { StripItem } from '../ui/molecules/Strip';
import { opStrip } from './segmentTree';
import { scriptSegments } from './hashTable';

export type Pt2 = [number, number];

export type KdOp = { kind: 'insert'; point: Pt2 } | { kind: 'nearest'; point: Pt2 } | { kind: 'range'; lo: Pt2; hi: Pt2 };

export interface KdInput {
  points: Pt2[];
  ops: KdOp[];
}

export const KD_LIMITS = { maxPoints: 10, maxOps: 10, max: 9 };

const KD_NAMES: Record<string, KdOp['kind']> = {
  insert: 'insert',
  ins: 'insert',
  add: 'insert',
  nearest: 'nearest',
  near: 'nearest',
  nn: 'nearest',
  range: 'range',
  range_search: 'range',
  box: 'range',
  rect: 'range',
};

function readPoints(text: string, where: string): Pt2[] {
  const found: Pt2[] = [];
  const rest = text.replace(/\(\s*(-?\d+)\s*,\s*(-?\d+)\s*\)/g, (_, a: string, b: string) => {
    const x = Number(a);
    const y = Number(b);
    if (x < 0 || x > KD_LIMITS.max || y < 0 || y > KD_LIMITS.max) throw new InputError(`Coordinates go from 0 to ${KD_LIMITS.max}, so every point fits on the grid (got (${a}, ${b}) in "${where}").`);
    found.push([x, y]);
    return ' ';
  });
  if (rest.trim()) throw new InputError(`Cannot read "${rest.trim()}" in "${where}". Write points as (x, y) with whole numbers, for example (7, 2).`);
  return found;
}

/** "points (7,2) (5,4); nearest (1,3), range (3,3) (8,7), insert (6,6)". */
export function parseKd(text: string): KdInput {
  const cut = text.search(/[;\n]/);
  const head = (cut < 0 ? text : text.slice(0, cut)).trim();
  const tail = cut < 0 ? '' : text.slice(cut + 1);
  const pointsText = head.replace(/^(?:points?|pts|build)\s*[:=]?\s*/i, '');
  if (/^[A-Za-z]/.test(pointsText)) throw new InputError(`Start with the points to build from, as in "points (7,2) (5,4); nearest (1,3)" (or "points;" for an empty tree).`);
  const points = readPoints(pointsText, head);
  if (points.length > KD_LIMITS.maxPoints) throw new InputError(`At most ${KD_LIMITS.maxPoints} points, so the plane and the tree stay readable (got ${points.length}).`);
  const ops = scriptSegments(tail).map((segment): KdOp => {
    const m = segment.match(/^([A-Za-z_]+)\s*(.*)$/);
    const kind = m && KD_NAMES[m[1].toLowerCase()];
    if (!m || !kind) throw new InputError(`Cannot read "${segment}". Use nearest (x, y), range (x1, y1) (x2, y2) or insert (x, y), separated by commas.`);
    const args = readPoints(m[2], segment);
    if (kind === 'range') {
      if (args.length !== 2) throw new InputError(`"${segment}": range takes two corners, lo and hi, as in "range (3,3) (8,7)".`);
      return { kind, lo: args[0], hi: args[1] };
    }
    if (args.length !== 1) throw new InputError(`"${segment}": ${kind} takes one point, as in "${kind} (6, 5)".`);
    return { kind, point: args[0] };
  });
  if (ops.length > KD_LIMITS.maxOps) throw new InputError(`At most ${KD_LIMITS.maxOps} operations, please (got ${ops.length}).`);
  const total = points.length + ops.filter((o) => o.kind === 'insert').length;
  if (total > KD_LIMITS.maxPoints) throw new InputError(`At most ${KD_LIMITS.maxPoints} points in the tree, inserts included (this script has ${total}).`);
  return { points, ops };
}

const ptText = (p: Pt2) => `(${p[0]},${p[1]})`;

export function formatKdOp(op: KdOp): string {
  return op.kind === 'range' ? `range_search(${ptText(op.lo)}, ${ptText(op.hi)})` : `${op.kind}(${ptText(op.point)})`;
}

export const KD_CODE = [
  'KDTree(points): k = len(points[0]); root = _build(list(points), depth=0)',
  '_build(pts, depth): axis = depth % k; pts.sort(key=lambda p: p[axis]); mid = len(pts) // 2',
  '  node = pts[mid]; left = _build(pts[:mid], depth + 1); right = _build(pts[mid + 1:], depth + 1)',
  'insert(point): if the tree is empty: root = point, axis 0',
  '  walk down: point[axis] < node.point[axis] ? left : right      # ties go right',
  '  attach at the first empty child, with axis (depth + 1) % k',
  'nearest(query): if the tree is empty: return None',
  '  best = root.point; best_dist = dist2(query, best); stack = [(root, None)]',
  '  while stack: node, bound = stack.pop()',
  '    if bound is not None and bound >= best_dist: continue      # the far side cannot be closer',
  '    d = dist2(query, node.point); if d < best_dist: best, best_dist = node.point, d',
  '    diff = query[axis] - node.point[axis]; near, far = (left, right) if diff < 0 else (right, left)',
  '    if far: stack.append((far, diff * diff)); if near: stack.append((near, None))',
  '  return best',
  'range_search(lo, hi): if the tree is empty: return []; stack = [root]',
  '  while stack: node = stack.pop(); if lo[i] <= p[i] <= hi[i] for every i: result.append(p)',
  '    if hi[axis] >= p[axis] and node.right: stack.append(node.right)',
  '    if lo[axis] <= p[axis] and node.left: stack.append(node.left)   # on top: left first',
  '  return result',
];

/** The tree as the fixture stores it: [id, [x, y], axis, left, right]. */
export type KdShape = [number, Pt2, number, KdShape | null, KdShape | null] | null;

export interface KdStep {
  op: KdOp;
  /** insert: null; nearest: the id of the point found (null on an empty tree); range: ids in order. */
  result: number | null | number[];
  tree: KdShape;
  /** nearest: the points measured (the root first, then each node not pruned); range: the nodes popped. */
  visits?: number[];
}

export interface KdRun {
  frames: Array<Frame<KdTreeState>>;
  build: KdShape;
  steps: KdStep[];
  /** Every point by id: the build points first, then the inserted ones. */
  points: Pt2[];
}

interface KNode {
  id: number;
  p: Pt2;
  axis: number;
  left: KNode | null;
  right: KNode | null;
}

const K = 2;
const AXIS = ['x', 'y'];
const dist2 = (a: Pt2, b: Pt2) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2;

export function kdTrace(input: KdInput): KdRun {
  const all: Pt2[] = [...input.points];
  const lo = -0.5;
  const hi = KD_LIMITS.max + 0.5;
  const whole: KdRect = { x0: lo, y0: lo, x1: hi, y1: hi };
  let root: KNode | null = null;
  /** Points drawn on the plane: the build points always, an inserted point once its insert starts. */
  let shown = input.points.length;
  const frames: Array<Frame<KdTreeState>> = [];
  const names = input.ops.map(formatKdOp);
  let current = -1;

  const regions = (): Map<number, KdRect> => {
    const out = new Map<number, KdRect>();
    const walk = (n: KNode | null, r: KdRect) => {
      if (!n) return;
      out.set(n.id, r);
      const v = n.p[n.axis];
      walk(n.left, n.axis === 0 ? { ...r, x1: v } : { ...r, y1: v });
      walk(n.right, n.axis === 0 ? { ...r, x0: v } : { ...r, y0: v });
    };
    walk(root, whole);
    return out;
  };
  const subtree = (n: KNode | null): number[] => (n ? [n.id, ...subtree(n.left), ...subtree(n.right)] : []);
  const shape = (n: KNode | null): KdShape => (n ? [n.id, [...n.p] as Pt2, n.axis, shape(n.left), shape(n.right)] : null);
  const label = (id: number) => ptText(all[id]);

  interface Snap {
    roles?: Record<number, Role>;
    region?: KdTreeState['region'];
    pruned?: KdRect[];
    query?: Pt2;
    circle?: KdTreeState['circle'];
    box?: KdTreeState['box'];
    gap?: KdTreeState['gap'];
    vars?: Array<[string, string | number]>;
    extra?: Array<{ label: string; items: StripItem[] }>;
    note?: string;
  }
  const snap = (line: number | undefined, caption: string, o: Snap = {}) => {
    const reg = regions();
    const nodes: KdNodeView[] = [];
    const splits: KdSplitView[] = [];
    const walk = (n: KNode | null) => {
      if (!n) return;
      const role = o.roles?.[n.id] ?? 'idle';
      nodes.push({ id: n.id, label: `${n.p[0]},${n.p[1]}`, axis: n.axis, left: n.left?.id ?? null, right: n.right?.id ?? null, role });
      const r = reg.get(n.id)!;
      splits.push({ id: n.id, axis: n.axis, at: n.p[n.axis], from: n.axis === 0 ? r.y0 : r.x0, to: n.axis === 0 ? r.y1 : r.x1, role: role === 'good' || role === 'bad' ? 'done' : role });
      walk(n.left);
      walk(n.right);
    };
    walk(root);
    const points: KdPointView[] = all.slice(0, shown).map((p, id) => ({ id, x: p[0], y: p[1], role: o.roles?.[id] }));
    frames.push({
      line,
      caption,
      vars: [...(o.vars ?? []), ['points', nodes.length]],
      state: {
        label: `${nodes.length} point${nodes.length === 1 ? '' : 's'} in a 2D tree: ${nodes.map((n) => `(${n.label}) splits on ${AXIS[n.axis]}`).join(', ') || 'empty'}`,
        bounds: KD_LIMITS.max,
        points,
        splits,
        region: o.region,
        pruned: o.pruned,
        query: o.query ? { x: o.query[0], y: o.query[1] } : undefined,
        circle: o.circle,
        box: o.box,
        gap: o.gap,
        nodes,
        root: root?.id ?? null,
        note: o.note,
        strips: [opStrip(names, current), ...(o.extra ?? [])],
      },
    });
  };

  // ---- build
  const n0 = input.points.length;
  snap(
    0,
    n0 === 0
      ? 'KDTree(): no points, so the tree starts empty (k is set by the first insert).'
      : `KDTree(points): ${n0} points with k = 2 coordinates. _build(points, depth 0) splits on x first, then y, then x again, one axis per level.`,
  );
  const build = (pts: Array<{ id: number; p: Pt2 }>, depth: number, region: KdRect, attach: (n: KNode) => void) => {
    if (pts.length === 0) return;
    const axis = depth % K;
    const sorted = [...pts].sort((a, b) => a.p[axis] - b.p[axis]);
    const mid = Math.floor(sorted.length / 2);
    const m = sorted[mid];
    const roles: Record<number, Role> = {};
    for (const q of sorted) roles[q.id] = 'compare';
    roles[m.id] = 'active';
    snap(
      1,
      sorted.length === 1
        ? `Depth ${depth}: one point left, ${ptText(m.p)}. It becomes a leaf that splits on ${AXIS[axis]} (axis ${depth} % 2 = ${axis}).`
        : `Depth ${depth}: axis ${depth} % 2 = ${axis}, so sort these ${sorted.length} points by ${AXIS[axis]}: ${sorted.map((q) => ptText(q.p)).join(' ')}. The median is index ${sorted.length} // 2 = ${mid}: ${ptText(m.p)}.`,
      { roles, region: { ...region, role: 'compare' }, vars: [['depth', depth], ['axis', AXIS[axis]]] },
    );
    const node: KNode = { id: m.id, p: m.p, axis, left: null, right: null };
    attach(node);
    const left = sorted.slice(0, mid);
    const right = sorted.slice(mid + 1);
    if (sorted.length > 1) {
      snap(
        2,
        `${ptText(m.p)} becomes the node and its line ${AXIS[axis]} = ${m.p[axis]} cuts this region in two: ${left.length} point${left.length === 1 ? '' : 's'} before it in the sorted order go${left.length === 1 ? 'es' : ''} left, ${right.length} after it go${right.length === 1 ? 'es' : ''} right.`,
        { roles: { [m.id]: 'active' }, region: { ...region, role: 'compare' }, vars: [['depth', depth], ['axis', AXIS[axis]]] },
      );
    }
    const v = m.p[axis];
    build(left, depth + 1, axis === 0 ? { ...region, x1: v } : { ...region, y1: v }, (c) => (node.left = c));
    build(right, depth + 1, axis === 0 ? { ...region, x0: v } : { ...region, y0: v }, (c) => (node.right = c));
  };
  build(
    input.points.map((p, id) => ({ id, p })),
    0,
    whole,
    (n) => (root = n),
  );
  const built = shape(root);
  if (n0 > 0) snap(undefined, `Built: ${n0} points, height ${height(root)}. Each node owns the rectangle its ancestors' lines leave it, and its own line splits that rectangle.`);

  // ---- operations
  const steps: KdStep[] = [];
  input.ops.forEach((op, k) => {
    current = k;
    const name = names[k];
    const vars: Array<[string, string | number]> = [['op', name]];

    if (op.kind === 'insert') {
      const id = all.length;
      all.push(op.point);
      shown = all.length;
      const p = op.point;
      if (!root) {
        root = { id, p, axis: 0, left: null, right: null };
        snap(3, `${name}: the tree is empty, so ${ptText(p)} becomes the root, splitting on x (axis 0).`, { roles: { [id]: 'done' }, vars });
        steps.push({ op, result: null, tree: shape(root) });
        return;
      }
      const path: Record<number, Role> = {};
      let node: KNode = root;
      let depth = 0;
      for (;;) {
        const axis = depth % K;
        const goLeft = p[axis] < node.p[axis];
        const next = goLeft ? node.left : node.right;
        const reg = regions().get(node.id)!;
        snap(
          4,
          `${name}: at ${ptText(node.p)} compare ${AXIS[axis]}: ${p[axis]} ${goLeft ? '<' : p[axis] === node.p[axis] ? '=' : '>'} ${node.p[axis]}, so go ${goLeft ? 'left' : 'right'}` +
            (!goLeft && p[axis] === node.p[axis] ? ' (ties go right)' : '') +
            (next ? '.' : `, where there is no child yet.`),
          { roles: { ...path, [node.id]: 'active', [id]: 'active' }, region: { ...reg, role: 'compare' }, vars: [...vars, ['depth', depth], ['axis', AXIS[axis]]] },
        );
        path[node.id] = 'compare';
        if (!next) {
          const leaf: KNode = { id, p, axis: (depth + 1) % K, left: null, right: null };
          if (goLeft) node.left = leaf;
          else node.right = leaf;
          snap(
            5,
            `${ptText(p)} attaches as the ${goLeft ? 'left' : 'right'} child of ${ptText(node.p)}, splitting on ${AXIS[leaf.axis]} ((depth + 1) % 2 = ${leaf.axis}). There is no rebalancing: height is now ${height(root)}.`,
            { roles: { ...path, [id]: 'done' }, vars: [...vars, ['depth', depth + 1]] },
          );
          break;
        }
        node = next;
        depth += 1;
      }
      steps.push({ op, result: null, tree: shape(root) });
      return;
    }

    if (op.kind === 'nearest') {
      const q = op.point;
      if (!root) {
        snap(6, `${name} returns None: the tree is empty.`, { query: q, vars });
        steps.push({ op, result: null, tree: shape(root), visits: [] });
        return;
      }
      const reg = regions();
      let best: KNode = root;
      let bestDist = dist2(q, root.p);
      const visits = [root.id];
      const roles: Record<number, Role> = {};
      const pruned: KdRect[] = [];
      const stack: Array<{ node: KNode; bound: number | null; parent: KNode | null }> = [{ node: root, bound: null, parent: null }];
      const stackStrip = (): { label: string; items: StripItem[] } => ({
        label: 'Stack (top last)',
        items: stack.length ? stack.map((e) => ({ text: e.bound === null ? ptText(e.node.p) : `${ptText(e.node.p)} bound ${e.bound}` })) : [{ text: 'empty' }],
      });
      const nv = () => [...vars, ['best', ptText(best.p)], ['best_dist', bestDist]] as Array<[string, string | number]>;
      const look = (extra: Record<number, Role> = {}) => ({ ...roles, [best.id]: 'done' as Role, ...extra });
      snap(7, `${name}: start with best = the root ${ptText(root.p)}, best_dist = ${bestDist} (squared distances, so no square roots). The circle shows how far a better point could be. The stack holds the root.`, {
        roles: look(),
        query: q,
        circle: { r2: bestDist },
        vars: nv(),
        extra: [stackStrip()],
      });
      while (stack.length) {
        const { node, bound, parent } = stack.pop()!;
        const gap = parent && bound !== null ? { axis: parent.axis, at: parent.p[parent.axis], label: `diff^2 = ${bound}` } : undefined;
        if (bound !== null && bound >= bestDist) {
          const skipped = subtree(node);
          for (const s of skipped) roles[s] = 'muted';
          pruned.push(reg.get(node.id)!);
          snap(
            9,
            `Pop ${ptText(node.p)}, the far side of ${ptText(parent!.p)}: its bound ${bound} >= best_dist ${bestDist}. The line ${AXIS[parent!.axis]} = ${parent!.p[parent!.axis]} is at least as far as the best point, so nothing beyond it can be closer: skip ${skipped.length === 1 ? 'it' : `its whole subtree (${skipped.length} points)`}.`,
            { roles: look(), pruned: [...pruned], query: q, circle: { r2: bestDist }, gap: gap && { ...gap, role: 'muted' }, vars: [...nv(), ['bound', bound]], extra: [stackStrip()] },
          );
          continue;
        }
        const d = dist2(q, node.p);
        visits.push(node.id);
        const better = d < bestDist;
        const before = bestDist;
        if (better) {
          best = node;
          bestDist = d;
        }
        roles[node.id] = 'compare';
        snap(
          10,
          `Pop ${ptText(node.p)}${bound !== null ? ` (bound ${bound} < best_dist ${before}: the circle crosses the split line, so this side may hold something closer)` : ''}. ` +
            `dist2 = (${q[0]} - ${node.p[0]})^2 + (${q[1]} - ${node.p[1]})^2 = ${d}` +
            (better ? ` < ${before}: the new best, and the circle shrinks.` : node === root ? `, the root itself: not smaller than ${before}.` : `, not smaller than ${before}: keep ${ptText(best.p)}.`),
          {
            roles: look({ [node.id]: better ? 'done' : 'active' }),
            region: { ...reg.get(node.id)!, role: 'compare' },
            pruned: [...pruned],
            query: q,
            circle: { r2: bestDist },
            gap: gap && { ...gap, role: 'compare' },
            vars: [...nv(), ['d', d]],
            extra: [stackStrip()],
          },
        );
        const diff = q[node.axis] - node.p[node.axis];
        const near = diff < 0 ? node.left : node.right;
        const far = diff < 0 ? node.right : node.left;
        if (far) stack.push({ node: far, bound: diff * diff, parent: node });
        if (near) stack.push({ node: near, bound: null, parent: node });
        const side = diff < 0 ? 'left' : 'right';
        snap(
          12,
          `diff = ${AXIS[node.axis]} of q - ${AXIS[node.axis]} of the node = ${q[node.axis]} - ${node.p[node.axis]} = ${diff}${diff < 0 ? ' < 0' : ' >= 0'}, so the near side is the ${side}. ` +
            (!near && !far
              ? 'It is a leaf: nothing to push.'
              : far
                ? `Push the far side ${ptText(far.p)} with bound ${diff < 0 ? `(${diff})` : diff}^2 = ${diff * diff}` +
                  (near ? `, then the near side ${ptText(near.p)} on top, so it is searched first.` : '; there is no near child.')
                : `There is no far child; push the near side ${ptText(near!.p)}.`),
          {
            roles: look({ [node.id]: 'active', ...(near ? { [near.id]: 'compare' as Role } : {}) }),
            region: { ...reg.get(node.id)!, role: 'compare' },
            pruned: [...pruned],
            query: q,
            circle: { r2: bestDist },
            vars: [...nv(), ['diff', diff]],
            extra: [stackStrip()],
          },
        );
      }
      const total = subtree(root).length;
      snap(13, `The stack is empty: nearest(${ptText(q)}) returns ${ptText(best.p)} at squared distance ${bestDist}. ${visits.length - 1} of ${total} points were measured${pruned.length ? '; the hatched regions were never searched' : ''}.`, {
        roles: { ...roles, [best.id]: 'good' },
        pruned: [...pruned],
        query: q,
        circle: { r2: bestDist, role: 'good' },
        vars: nv(),
      });
      steps.push({ op, result: best.id, tree: shape(root), visits });
      return;
    }

    // range_search
    const { lo: boxLo, hi: boxHi } = op;
    const empty = boxLo[0] > boxHi[0] || boxLo[1] > boxHi[1];
    const box = { x0: boxLo[0], y0: boxLo[1], x1: boxHi[0], y1: boxHi[1], empty };
    if (!root) {
      snap(14, `${name} returns []: the tree is empty.`, { box, vars });
      steps.push({ op, result: [], tree: shape(root), visits: [] });
      return;
    }
    const reg = regions();
    const result: number[] = [];
    const visits: number[] = [];
    const roles: Record<number, Role> = {};
    const pruned: KdRect[] = [];
    const stack: KNode[] = [root];
    const strips = () => [
      { label: 'Stack (top last)', items: stack.length ? stack.map((s) => ({ text: ptText(s.p) })) : [{ text: 'empty' }] },
      { label: 'Found', items: result.length ? result.map((id) => ({ text: label(id), role: 'done' as Role })) : [{ text: 'nothing yet' }] },
    ];
    snap(
      14,
      `${name}: report every point with ${boxLo[0]} <= x <= ${boxHi[0]} and ${boxLo[1]} <= y <= ${boxHi[1]}.` +
        (empty ? ` lo is above hi on ${boxLo[0] > boxHi[0] ? 'x' : 'y'}, so no point can be inside; the code does not check, and still walks.` : '') +
        ' The stack starts with the root.',
      { box, vars, extra: strips() },
    );
    while (stack.length) {
      const node = stack.pop()!;
      visits.push(node.id);
      const p = node.p;
      const inside = boxLo[0] <= p[0] && p[0] <= boxHi[0] && boxLo[1] <= p[1] && p[1] <= boxHi[1];
      if (inside) result.push(node.id);
      roles[node.id] = inside ? 'done' : 'compare';
      const why = inside ? 'inside the box: add it to the result' : `outside the box (${!(boxLo[0] <= p[0] && p[0] <= boxHi[0]) ? `x = ${p[0]} is not in ${boxLo[0]}..${boxHi[0]}` : `y = ${p[1]} is not in ${boxLo[1]}..${boxHi[1]}`})`;
      snap(15, `Pop ${ptText(p)}: ${why}.`, { roles: { ...roles, [node.id]: inside ? 'done' : 'active' }, region: { ...reg.get(node.id)!, role: 'compare' }, pruned: [...pruned], box, vars, extra: strips() });
      const a = node.axis;
      const goRight = boxHi[a] >= p[a];
      const goLeft = boxLo[a] <= p[a];
      const parts: string[] = [];
      if (node.right) {
        if (goRight) {
          stack.push(node.right);
          parts.push(`hi.${AXIS[a]} = ${boxHi[a]} >= ${p[a]}: the right side${a === 1 ? ' (above the line)' : ''} may reach the box, push ${ptText(node.right.p)}`);
        } else {
          for (const s of subtree(node.right)) roles[s] = 'muted';
          pruned.push(reg.get(node.right.id)!);
          parts.push(`hi.${AXIS[a]} = ${boxHi[a]} < ${p[a]}: everything on the right has ${AXIS[a]} >= ${p[a]}, skip ${ptText(node.right.p)}${node.right.left || node.right.right ? ' and its subtree' : ''}`);
        }
      }
      if (node.left) {
        if (goLeft) {
          stack.push(node.left);
          parts.push(`lo.${AXIS[a]} = ${boxLo[a]} <= ${p[a]}: the left side${a === 1 ? ' (below the line)' : ''} may reach the box, push ${ptText(node.left.p)} on top`);
        } else {
          for (const s of subtree(node.left)) roles[s] = 'muted';
          pruned.push(reg.get(node.left.id)!);
          parts.push(`lo.${AXIS[a]} = ${boxLo[a]} > ${p[a]}: everything on the left has ${AXIS[a]} <= ${p[a]}, skip ${ptText(node.left.p)}${node.left.left || node.left.right ? ' and its subtree' : ''}`);
        }
      }
      snap(16, parts.length ? `Split on ${AXIS[a]} = ${p[a]}. ${parts.join('; ')}.` : `${ptText(p)} is a leaf: nothing to push.`, {
        roles: { ...roles, [node.id]: 'active' },
        region: { ...reg.get(node.id)!, role: 'compare' },
        pruned: [...pruned],
        box,
        vars,
        extra: strips(),
      });
    }
    const goodRoles: Record<number, Role> = { ...roles };
    for (const id of result) goodRoles[id] = 'good';
    snap(18, `The stack is empty: ${name} returns [${result.map(label).join(', ')}] in preorder. It popped ${visits.length} of ${subtree(root).length} nodes${pruned.length ? '; the hatched regions were skipped' : ''}.`, {
      roles: goodRoles,
      pruned: [...pruned],
      box,
      vars,
      extra: strips(),
    });
    steps.push({ op, result, tree: shape(root), visits });
  });

  current = input.ops.length;
  snap(undefined, root ? `Done: ${subtree(root).length} points, height ${height(root)}.` : 'Done: the tree is empty.');
  return { frames, build: built, steps, points: all };
}

function height(n: KNode | null): number {
  return n ? 1 + Math.max(height(n.left), height(n.right)) : 0;
}
