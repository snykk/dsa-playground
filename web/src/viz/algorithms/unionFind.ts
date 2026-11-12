/**
 * Union-find (disjoint set union) tracer: union by rank plus full path compression.
 *
 * Mirrors Algorithms/Graph_Algorithms/Advanced_Graph/Union_Find_DSU/Python/union_find.py:
 *   find(x): if parent[x] != x: parent[x] = find(parent[x]); return parent[x]
 *   union(x, y): rx, ry = find(x), find(y); equal ranks -> ry goes under rx, rank[rx] += 1
 * Golden fixtures (__fixtures__/graphStructure.json) pin parent/rank after every operation.
 *
 * Input: "n 8; union 0 1, union 2 3, find 3, connected 0 3"  (u / f / c are short forms)
 */
import { InputError, type Frame, type Role } from '../core/types';
import type { ForestState } from '../renderers/ForestView';
import type { StripItem } from '../ui/molecules/Strip';

const ALPHA = String.fromCodePoint(0x3b1);

export type DsuOp = { kind: 'union'; x: number; y: number } | { kind: 'find'; x: number } | { kind: 'connected'; x: number; y: number };

export interface DsuInput {
  n: number;
  ops: DsuOp[];
}

export interface DsuStep {
  op: DsuOp;
  /** union / connected: boolean; find: the root. */
  result: boolean | number;
  parent: number[];
  rank: number[];
  count: number;
}

export interface DsuRun {
  frames: Array<Frame<ForestState>>;
  steps: DsuStep[];
}

const SPLIT = /[;\n]|,(?![^(]*\))/;
const TWO = String.raw`\s*\(?\s*(\d{1,3})\s*[,\s]\s*(\d{1,3})\s*\)?`;
const ONE = String.raw`\s*\(?\s*(\d{1,3})\s*\)?`;
const UNION_RE = new RegExp(`^(?:union|unite|u)${TWO}$`, 'i');
const FIND_RE = new RegExp(`^(?:find|f)${ONE}$`, 'i');
const CONNECTED_RE = new RegExp(`^(?:connected|c)${TWO}$`, 'i');

export function parseDsu(text: string, { maxN = 16, maxOps = 30 } = {}): DsuInput {
  let n: number | undefined;
  const ops: DsuOp[] = [];
  for (const raw of text.split(SPLIT).map((t) => t.trim()).filter(Boolean)) {
    const size = raw.match(/^n\s*[:=]?\s*(\d+)$/i);
    if (size) {
      if (n !== undefined) throw new InputError('Give the number of elements ("n 8") only once.');
      n = Number(size[1]);
      if (n < 1 || n > maxN) throw new InputError(`n must be between 1 and ${maxN} (got ${n}).`);
      continue;
    }
    let m = raw.match(UNION_RE);
    if (m) {
      ops.push({ kind: 'union', x: Number(m[1]), y: Number(m[2]) });
      continue;
    }
    m = raw.match(FIND_RE);
    if (m) {
      ops.push({ kind: 'find', x: Number(m[1]) });
      continue;
    }
    m = raw.match(CONNECTED_RE);
    if (m) {
      ops.push({ kind: 'connected', x: Number(m[1]), y: Number(m[2]) });
      continue;
    }
    throw new InputError(`Cannot read "${raw}". Write operations like "union 0 1", "find 3" or "connected 0 3", separated by commas.`);
  }
  if (ops.length === 0) throw new InputError('Add at least one operation, e.g. "n 6; union 0 1, union 1 2, find 2".');
  if (ops.length > maxOps) throw new InputError(`At most ${maxOps} operations, please (got ${ops.length}).`);
  const largest = Math.max(...ops.flatMap((op) => (op.kind === 'find' ? [op.x] : [op.x, op.y])));
  if (n === undefined) {
    n = Math.max(2, largest + 1);
    if (n > maxN) throw new InputError(`Elements go up to ${maxN - 1} (got ${largest}).`);
  }
  if (largest >= n) throw new InputError(`Element ${largest} is out of range: with n = ${n} the elements are 0..${n - 1}.`);
  return { n, ops };
}

export function formatOp(op: DsuOp): string {
  return op.kind === 'find' ? `find(${op.x})` : `${op.kind}(${op.x}, ${op.y})`;
}

interface SnapOpts {
  roles?: Record<number, Role>;
  /** Parent-pointer edges to highlight, keyed by child. */
  edges?: Record<number, Role>;
  /** parent[] cells to highlight. */
  cells?: Record<number, Role>;
  vars?: Array<[string, string | number]>;
}

/** Height of the tallest tree (a lone root has height 0). */
function maxDepth(parent: number[]): number {
  let best = 0;
  for (let i = 0; i < parent.length; i++) {
    let d = 0;
    for (let x = i; parent[x] !== x && d <= parent.length; x = parent[x]) d++;
    best = Math.max(best, d);
  }
  return best;
}

export function unionFind({ n, ops }: DsuInput): DsuRun {
  const parent = Array.from({ length: n }, (_, i) => i);
  const rank = new Array<number>(n).fill(0);
  let count = n;
  let current = -1;
  const frames: Array<Frame<ForestState>> = [];
  const steps: DsuStep[] = [];

  const opStrip = () => ({
    label: 'Operations',
    items: ops.map(
      (op, i): StripItem => ({ text: formatOp(op), role: i === current ? 'active' : i < current ? 'muted' : undefined }),
    ),
  });

  const snap = (line: number | undefined, caption: string, o: SnapOpts = {}) => {
    frames.push({
      line,
      caption,
      vars: [...(o.vars ?? []), ['sets (count)', count], ['tallest tree', maxDepth(parent)]],
      state: {
        nodes: parent.map((p, id) => ({
          id,
          parent: p,
          role: o.roles?.[id] ?? 'idle',
          badge: p === id ? `r=${rank[id]}` : undefined,
        })),
        edgeRoles: o.edges,
        rows: [
          { label: 'parent', cells: parent.map((p, i) => ({ value: p, role: o.cells?.[i] })) },
          { label: 'rank', cells: rank.map((r, i) => ({ value: r, role: parent[i] === i ? undefined : ('muted' as Role) })) },
        ],
        strips: [opStrip()],
      },
    });
  };

  /** Recursive find with full path compression, one frame per step up and per re-pointed node. */
  const find = (x: number, base: Record<number, Role>, vars: Array<[string, string | number]>): number => {
    const path = [x];
    while (parent[path[path.length - 1]] !== path[path.length - 1]) path.push(parent[path[path.length - 1]]);
    const root = path[path.length - 1];
    const walked: Record<number, Role> = { ...base };
    const walkedEdges: Record<number, Role> = {};
    for (const w of path) {
      if (w === root) {
        snap(
          3,
          path.length === 1
            ? `${w} is its own parent: ${w} is a root, so find(${x}) = ${w}.`
            : `${w} is its own parent: it is the root, the representative of ${x}'s set. find(${x}) = ${w}.`,
          { roles: { ...walked, [w]: 'done' }, edges: walkedEdges, cells: Object.fromEntries(path.map((p) => [p, 'compare' as Role])), vars: [...vars, ['x', x], ['root', w]] },
        );
        break;
      }
      snap(1, `parent[${w}] = ${parent[w]}, not ${w} itself, so ${w} is not a root: follow the pointer up to ${parent[w]}.`, {
        roles: { ...walked, [w]: 'active' },
        edges: { ...walkedEdges, [w]: 'compare' },
        cells: { [w]: 'compare' },
        vars: [...vars, ['x', x], ['at', w]],
      });
      walked[w] = 'compare';
      walkedEdges[w] = 'compare';
    }
    // The recursion unwinds from the root's child down to x: each node now points at the root.
    for (let i = path.length - 2; i >= 0; i--) {
      const w = path[i];
      if (parent[w] === root) continue;
      const old = parent[w];
      parent[w] = root;
      delete walkedEdges[w];
      snap(
        2,
        `Path compression: as the recursion returns, set parent[${w}] = ${root} (it was ${old}). ${w} now hangs directly under the root, so the next find from ${w} or below takes fewer steps.`,
        { roles: { ...walked, [w]: 'active', [root]: 'done' }, edges: { ...walkedEdges, [w]: 'active' }, cells: { [w]: 'active' }, vars: [...vars, ['x', x], ['root', root]] },
      );
    }
    return root;
  };

  snap(undefined, `${n} singletons: every element is its own parent (a root) with rank 0, so there are ${n} sets. Arrows point from a child to its parent.`);

  ops.forEach((op, i) => {
    current = i;
    if (op.kind === 'find') {
      snap(0, `find(${op.x}): follow parent pointers up to the root, then point every node on the way directly at it.`, { roles: { [op.x]: 'active' }, vars: [['op', formatOp(op)]] });
      const root = find(op.x, {}, [['op', formatOp(op)]]);
      steps.push({ op, result: root, parent: [...parent], rank: [...rank], count });
      return;
    }

    const { x, y } = op;
    const label = formatOp(op);
    snap(op.kind === 'union' ? 4 : 11, op.kind === 'union' ? `${label}: find the roots of both sets, then hang one tree under the other.` : `${label}: x and y are in the same set exactly when they have the same root.`, {
      roles: { [x]: 'active', [y]: 'active' },
      vars: [['op', label]],
    });
    const rx = find(x, {}, [['op', label]]);
    const ry = find(y, { [rx]: 'done' }, [['op', label], ['root of x', rx]]);
    const vars: Array<[string, string | number]> = [['op', label], ['rx', rx], ['ry', ry]];

    if (op.kind === 'connected') {
      const same = rx === ry;
      snap(
        11,
        same ? `find(${x}) = find(${y}) = ${rx}: same root, so ${x} and ${y} are connected.` : `find(${x}) = ${rx} but find(${y}) = ${ry}: different roots, so ${x} and ${y} are not connected.`,
        { roles: { [rx]: 'done', [ry]: 'done', [x]: same ? 'good' : 'bad', [y]: same ? 'good' : 'bad' }, vars },
      );
      steps.push({ op, result: same, parent: [...parent], rank: [...rank], count });
      return;
    }

    if (rx === ry) {
      snap(5, `Both roots are ${rx}: ${x} and ${y} are already in the same set, so union returns False. (In a graph, the edge ${x}-${y} would close a cycle.)`, {
        roles: { [rx]: 'done', [x]: 'bad', [y]: 'bad' },
        vars,
      });
      steps.push({ op, result: false, parent: [...parent], rank: [...rank], count });
      return;
    }

    let child: number;
    let top: number;
    let line: number;
    let why: string;
    if (rank[rx] < rank[ry]) {
      child = rx;
      top = ry;
      line = 7;
      why = `rank[${rx}] = ${rank[rx]} < rank[${ry}] = ${rank[ry]}: hang the lower tree under the taller one, so ${rx} now points to ${ry} and the height does not grow.`;
      parent[rx] = ry;
    } else if (rank[rx] > rank[ry]) {
      child = ry;
      top = rx;
      line = 8;
      why = `rank[${rx}] = ${rank[rx]} > rank[${ry}] = ${rank[ry]}: hang the lower tree under the taller one, so ${ry} now points to ${rx} and the height does not grow.`;
      parent[ry] = rx;
    } else {
      child = ry;
      top = rx;
      line = 9;
      why = `Both ranks are ${rank[rx]}: hang ${ry} under ${rx} (the root of ${x}'s set) and raise rank[${rx}] to ${rank[rx] + 1}. Only a tie can make a tree taller.`;
      parent[ry] = rx;
      rank[rx]++;
    }
    count--;
    snap(line, `${why} One set fewer: ${count} left.`, {
      roles: { [child]: 'active', [top]: 'done' },
      edges: { [child]: 'active' },
      cells: { [child]: 'active' },
      vars: [...vars, ['rank[rx]', rank[rx]], ['rank[ry]', rank[ry]]],
    });
    steps.push({ op, result: true, parent: [...parent], rank: [...rank], count });
  });

  current = ops.length;
  const sets = new Map<number, number[]>();
  for (let i = 0; i < n; i++) {
    let r = i;
    while (parent[r] !== r) r = parent[r];
    sets.set(r, [...(sets.get(r) ?? []), i]);
  }
  const listing = [...sets.values()].map((s) => `{${s.join(', ')}}`).join(' ');
  snap(
    undefined,
    `Done: ${count} ${count === 1 ? 'set' : 'sets'}: ${listing}. Union by rank keeps every tree at most log2(n) tall, and path compression flattens the paths that finds walk, so each operation costs O(${ALPHA}(n)) amortized.`,
  );
  return { frames, steps };
}
