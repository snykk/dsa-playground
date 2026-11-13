/**
 * Rope tracer: a string kept as a balanced binary tree of short fragments.
 *
 * Mirrors Data_Structures/Linear/String/Rope/Python/rope.py:
 *   Rope(text) = _build(text): halve the text until every piece has at most 10 characters
 *   index(i) = _index(root, i): i < weight -> go left; otherwise go right with i - weight
 *   split(i) = _split(root, i): one root-to-leaf path; a leaf the cut falls inside becomes two
 *     leaves, and every level rebuilds its side bottom-up with _join(piece, hanging subtree)
 *   concat(other) = _join(root, other.root): heights within 1 -> _make(left, right); otherwise
 *     _join_right / _join_left walk down the taller rope's facing spine and rebuild each node on
 *     the way back up, with a single or double rotation where one side got two levels taller
 *   insert(i, text) = split, Rope(text), concat, concat; delete(i, n) = split, split, concat
 * Nodes are never modified: every _make builds a new node, so leaves and shared subtrees keep
 * their identity (and glide) between frames while rebuilt nodes appear in their place.
 * Golden fixtures (__fixtures__/stringStructures.json) pin the tree after every operation.
 *
 * Input: "Hello World!"; insert 5 ",", index 6, delete 5 2, split 4, concat " Bye"
 */
import { InputError, type Frame, type Role } from '../core/types';
import type { RopeNodeView, RopePieceView, RopeViewState } from '../renderers/RopeView';
import type { StripItem } from '../ui/molecules/Strip';
import { numArg, q, readSubject, splitScript, strArg, tokenize } from './stringOps';

/** A rope node, as in rope.py: a leaf holds `data`; an internal node caches weight, length and height. */
export interface RNode {
  /** Identity for the animation: set when the node is created, like a Python object's id(). */
  id: number;
  data: string | null;
  left: RNode | null;
  right: RNode | null;
  weight: number;
  length: number;
  height: number;
}

export type RopeOp =
  | { kind: 'index'; i: number }
  | { kind: 'split'; i: number }
  | { kind: 'insert'; i: number | 'end'; text: string }
  | { kind: 'delete'; i: number; n: number }
  | { kind: 'concat'; text: string };

export interface RopeInput {
  text: string;
  ops: RopeOp[];
}

/** A leaf is its fragment, an internal node the pair of its children (the fixtures' format). */
export type Shape = string | [Shape, Shape] | null;

export interface RopeStep {
  op: RopeOp;
  text: string;
  len: number;
  height: number;
  shape: Shape;
  /** index: the character or the error; split: the two halves; otherwise null. */
  result: string | { error: string } | [Shape, Shape] | null;
}

export interface RopeRun {
  frames: Array<Frame<RopeViewState>>;
  steps: RopeStep[];
  root: RNode | null;
  rotations: { single: number; double: number };
}

const LEAF_SIZE = 10;

export function shapeOf(node: RNode | null): Shape {
  if (node === null) return null;
  if (node.data !== null) return node.data;
  return [shapeOf(node.left), shapeOf(node.right)];
}

/** to_string(): the leaves in order. */
export function textOf(node: RNode | null): string {
  if (node === null) return '';
  if (node.data !== null) return node.data;
  return textOf(node.left) + textOf(node.right);
}

export function leafCount(node: RNode | null): number {
  if (node === null) return 0;
  return node.data !== null ? 1 : leafCount(node.left) + leafCount(node.right);
}

export function formatRopeOp(op: RopeOp): string {
  switch (op.kind) {
    case 'index':
      return `index(${op.i})`;
    case 'split':
      return `split(${op.i})`;
    case 'insert':
      return `insert(${op.i === 'end' ? 'len(r)' : op.i}, ${q(op.text)})`;
    case 'delete':
      return `delete(${op.i}, ${op.n})`;
    default:
      return `concat(Rope(${q(op.text)}))`;
  }
}

// ---------------------------------------------------------------- input

const HELP = 'Write operations like index 4, split 6, insert 5 ",", insert end "!", delete 5 2 or concat " more", separated by commas.';

function parseOp(segment: string, maxText: number): RopeOp {
  const toks = tokenize(segment);
  const head = toks[0];
  const name = head?.kind === 'word' ? head.text : '';
  let op: RopeOp;
  let used: number;
  if (name === 'index' || name === 'at') {
    op = { kind: 'index', i: numArg(toks[1], 'index', 'a position', -99, 99) };
    used = 2;
  } else if (name === 'split') {
    op = { kind: 'split', i: numArg(toks[1], 'split', 'a position', -99, 99) };
    used = 2;
  } else if (name === 'insert' || name === 'ins') {
    const at = toks[1];
    const i = at?.kind === 'word' && at.text === 'end' ? 'end' : numArg(at, 'insert', 'a position (or end)', -99, 99);
    op = { kind: 'insert', i, text: strArg(toks[2], 'insert', 'text', maxText) };
    used = 3;
  } else if (name === 'delete' || name === 'del') {
    op = { kind: 'delete', i: numArg(toks[1], 'delete', 'a position', -99, 99), n: numArg(toks[2], 'delete', 'a count', 0, 99) };
    used = 3;
  } else if (name === 'concat' || name === 'cat' || name === '+') {
    op = { kind: 'concat', text: strArg(toks[1], 'concat', 'text', maxText) };
    used = 2;
  } else {
    throw new InputError(`Cannot read "${segment}". ${HELP}`);
  }
  if (toks.length > used) throw new InputError(`Too many arguments in "${segment}". ${HELP}`);
  return op;
}

export function parseRope(text: string, { maxOps = 8, maxLength = 40, maxLeaves = 12, maxText = 24 } = {}): RopeInput {
  const segments = splitScript(text);
  if (segments.length === 0) throw new InputError('Start with the text, then the operations: "Hello World!"; insert 5 ",", index 6.');
  const subject = readSubject(segments[0], 'the text', maxLength);
  const ops = segments.slice(1).map((s) => parseOp(s, maxText));
  if (ops.length > maxOps) throw new InputError(`At most ${maxOps} operations, please (got ${ops.length}).`);
  // Run the script once without frames: the picture must stay small enough to read.
  const run = new RopeTracer(ops, false).run(subject);
  run.steps.forEach((step, k) => {
    if (step.len > maxLength) {
      throw new InputError(`After ${formatRopeOp(step.op)} (operation ${k + 1}) the text has ${step.len} characters; at most ${maxLength} fit on the screen.`);
    }
    const halves = Array.isArray(step.result) ? 1 : 0;
    if (leafCountOfShape(step.shape) + halves > maxLeaves) {
      throw new InputError(`After ${formatRopeOp(step.op)} (operation ${k + 1}) the rope has more than ${maxLeaves} leaves, too many to draw. Use fewer or longer edits.`);
    }
  });
  return { text: subject, ops };
}

function leafCountOfShape(s: Shape): number {
  if (s === null) return 0;
  return typeof s === 'string' ? 1 : leafCountOfShape(s[0]) + leafCountOfShape(s[1]);
}

// ---------------------------------------------------------------- tracer

/** An old node on a spine being rebuilt by a join, shown with the joined subtree hanging in place. */
interface Pending {
  pending: true;
  id: number;
  left: DTree;
  right: DTree;
  /** The old weight, or null when the left subtree changed (so the weight is not known yet). */
  weight: number | null;
}
type DTree = RNode | Pending;

interface Piece {
  tree: DTree | null;
  label?: string;
  role?: Role;
}

interface SnapOpts {
  roles?: Record<number, Role>;
  edges?: Record<number, Role>;
  mark?: RopeViewState['mark'];
  slice?: RopeViewState['slice'];
  pointer?: RopeViewState['pointer'];
  vars?: Array<[string, string | number]>;
}

/** Pseudocode line numbers (see specs/rope.tsx). */
const L = {
  indexWalk: 0,
  indexLeaf: 1,
  splitWalk: 2,
  splitJoin: 3,
  joinMake: 4,
  joinSpine: 5,
  joinUp: 6,
  joinRotate: 7,
  insert: 8,
  delete: 9,
  concat: 10,
  build: 11,
} as const;

const isPending = (t: DTree): t is Pending => 'pending' in t;
const heightOf = (t: DTree): number => (isPending(t) ? 1 + Math.max(heightOf(t.left), heightOf(t.right)) : t.height);
const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

class RopeTracer {
  private nextId = 1;
  private frames: Array<Frame<RopeViewState>> = [];
  private steps: RopeStep[] = [];
  private rotations = { single: 0, double: 0 };
  private root: RNode | null = null;
  private pieces: Piece[] = [];
  private cut: number | undefined;
  private current = -1;

  constructor(
    private readonly ops: RopeOp[],
    private readonly record: boolean,
  ) {}

  // ---- rope.py, node by node

  private leaf(data: string): RNode {
    return { id: this.nextId++, data, left: null, right: null, weight: data.length, length: data.length, height: 0 };
  }

  /** _make(left, right): a new internal node with its cached fields set. */
  private make(left: RNode, right: RNode): RNode {
    return {
      id: this.nextId++,
      data: null,
      left,
      right,
      weight: left.length,
      length: left.length + right.length,
      height: 1 + Math.max(left.height, right.height),
    };
  }

  /** _build(text): halve until a piece has at most LEAF_SIZE characters. */
  private build(text: string): RNode {
    if (text.length <= LEAF_SIZE) return this.leaf(text);
    const mid = Math.floor(text.length / 2);
    const left = this.build(text.slice(0, mid));
    return this.make(left, this.build(text.slice(mid)));
  }

  // ---- frames

  private snap(line: number | undefined, caption: string, o: SnapOpts = {}) {
    if (!this.record) return;
    const nodes: RopeNodeView[] = [];
    const roles = o.roles ?? {};
    const walk = (t: DTree | null) => {
      if (t === null) return;
      if (isPending(t)) {
        nodes.push({ id: t.id, text: null, weight: t.weight, left: t.left.id, right: t.right.id, height: heightOf(t), role: roles[t.id] ?? 'idle', pending: true });
        walk(t.left);
        walk(t.right);
        return;
      }
      nodes.push({
        id: t.id,
        text: t.data,
        weight: t.data === null ? t.weight : null,
        left: t.left?.id ?? null,
        right: t.right?.id ?? null,
        height: t.height,
        role: roles[t.id] ?? 'idle',
      });
      walk(t.left);
      walk(t.right);
    };
    for (const p of this.pieces) walk(p.tree);
    const pieces: RopePieceView[] = this.pieces.map((p) => ({ root: p.tree?.id ?? null, label: p.label, role: p.role }));
    const op = this.ops[this.current];
    this.frames.push({
      line,
      caption,
      vars: [
        ...(op ? ([['op', formatRopeOp(op)]] as Array<[string, string | number]>) : []),
        ...(o.vars ?? []),
        ['len(r)', this.root?.length ?? 0],
        ['height(r)', this.root?.height ?? -1],
        ['leaves of r', leafCount(this.root)],
      ],
      state: {
        nodes,
        pieces,
        cut: this.cut,
        edges: o.edges,
        mark: o.mark,
        slice: o.slice,
        pointer: o.pointer,
        strips: [
          {
            label: 'Operations',
            items: this.ops.map((x, i): StripItem => ({ text: formatRopeOp(x), role: i === this.current ? 'active' : i < this.current ? 'muted' : undefined })),
          },
        ],
      },
    });
  }

  /** Roles for every node of a subtree (e.g. a freshly built rope). */
  private all(t: DTree | null, role: Role, into: Record<number, Role> = {}): Record<number, Role> {
    if (t === null) return into;
    into[t.id] = role;
    this.all(t.left, role, into);
    this.all(t.right, role, into);
    return into;
  }

  private showRoot(label = 'r') {
    this.pieces = [{ tree: this.root, label }];
    this.cut = undefined;
  }

  // ---- index

  private index(i: number): string | { error: string } {
    const n = this.root?.length ?? 0;
    const vars: Array<[string, string | number]> = [['i', i]];
    let node = this.root;
    if (node === null) {
      this.snap(L.indexLeaf, `index(${i}) on an empty rope: _index(None, ${i}) raises IndexError: index out of range. The next operation runs as if the caller caught it.`, { vars });
      return { error: 'IndexError' };
    }
    let pos = i;
    const roles: Record<number, Role> = {};
    const edges: Record<number, Role> = {};
    this.snap(L.indexWalk, `index(${i}): start at the root and let the weights steer. A node's weight counts the characters in its left subtree, so it says which side holds position ${i}.`, {
      roles: { [node.id]: 'active' },
      pointer: { node: node.id, text: `i = ${pos}` },
      vars,
    });
    while (node.data === null) {
      const goLeft = pos < node.weight;
      const child: RNode = goLeft ? node.left! : node.right!;
      const why = goLeft
        ? `${pos} < weight ${node.weight}: position ${pos} is among the ${plural(node.weight, 'character')} on the left, so go left with i = ${pos}.`
        : `${pos} >= weight ${node.weight}: skip the ${plural(node.weight, 'character')} on the left and go right with i = ${pos} - ${node.weight} = ${pos - node.weight}.`;
      roles[node.id] = 'compare';
      edges[child.id] = 'compare';
      if (!goLeft) pos -= node.weight;
      node = child;
      this.snap(L.indexWalk, why, { roles: { ...roles, [node.id]: 'active' }, edges: { ...edges }, pointer: { node: node.id, text: `i = ${pos}` }, vars: [...vars, ['i in this subtree', pos]] });
    }
    const data = node.data;
    if (pos < 0 || pos >= data.length) {
      const negative = i < 0 ? ' A rope does not count negative positions from the end the way a Python str does.' : '';
      this.snap(
        L.indexLeaf,
        `The leaf ${q(data)} holds positions 0..${data.length - 1} of its own, and ${pos} is not one of them: _index raises IndexError: index out of range (valid positions of r are 0..${n - 1}).${negative} The next operation runs as if the caller caught it.`,
        { roles: { ...roles, [node.id]: 'bad' }, edges, pointer: { node: node.id, text: `i = ${pos}`, role: 'bad' }, vars },
      );
      return { error: 'IndexError' };
    }
    this.snap(
      L.indexLeaf,
      `A leaf: return data[${pos}] = ${q(data[pos])}, which is r[${i}]. The walk visited one node per level, so index costs O(height) = O(log n), where a flat string reads s[i] in O(1).`,
      { roles: { ...roles, [node.id]: 'done' }, edges, mark: { leaf: node.id, at: pos, role: 'done' }, pointer: { node: node.id, text: `i = ${pos}`, role: 'done' }, vars },
    );
    return data[pos];
  }

  // ---- join

  /** Join pieces[k] and pieces[k + 1] (both non-empty) into one piece; `why` explains the call. */
  private join(k: number, why: string, label?: string): RNode {
    const left = this.pieces[k].tree as RNode;
    const right = this.pieces[k + 1].tree as RNode;
    let merged = false;
    const show = (t: DTree) => {
      if (!merged) {
        this.pieces.splice(k, 2, { tree: t, label });
        if (this.cut !== undefined && k + 1 < this.cut) this.cut -= 1;
        merged = true;
      } else {
        this.pieces[k].tree = t;
      }
    };
    return this.joinRec(left, right, [], show, `${why}: `);
  }

  /** _join(left, right) for two non-empty subtrees; `stack` holds the spine nodes above (pending). */
  private joinRec(left: RNode, right: RNode, stack: Array<{ node: RNode; side: 'left' | 'right' }>, show: (t: DTree) => void, prefix: string): RNode {
    const spine: Record<number, Role> = {};
    for (const s of stack) spine[s.node.id] = 'compare';
    if (left.height > right.height + 1) {
      this.snap(
        L.joinSpine,
        `${prefix}height ${left.height} > ${right.height} + 1. The left rope is more than one level taller, so one new node over both would be unbalanced: _join_right walks down the left rope's right spine to a subtree about as tall as the right rope.`,
        { roles: { ...spine, [left.id]: 'active', ...this.all(right, 'compare') }, vars: [['height(left)', left.height], ['height(right)', right.height]] },
      );
      return this.joinRight(left, right, stack, show);
    }
    if (right.height > left.height + 1) {
      this.snap(
        L.joinSpine,
        `${prefix}height ${right.height} > ${left.height} + 1. The right rope is more than one level taller, so one new node over both would be unbalanced: _join_left walks down the right rope's left spine to a subtree about as tall as the left rope.`,
        { roles: { ...spine, [right.id]: 'active', ...this.all(left, 'compare') }, vars: [['height(left)', left.height], ['height(right)', right.height]] },
      );
      return this.joinLeft(left, right, stack, show);
    }
    const node = this.make(left, right);
    show(this.composite(stack, node));
    this.snap(
      L.joinMake,
      `${prefix}heights ${left.height} and ${right.height} differ by at most 1, so _make puts a new node over the two: weight ${node.weight} (the length of its left side), length ${node.length}, height ${node.height}.${stack.length ? ' The spine nodes above (dashed) are rebuilt next, on the way back up.' : ''}`,
      { roles: { ...spine, [node.id]: 'active' }, vars: [['height(left)', left.height], ['height(right)', right.height]] },
    );
    return node;
  }

  /** Rebuild the pending spine above a freshly joined subtree, for the picture. */
  private composite(stack: Array<{ node: RNode; side: 'left' | 'right' }>, sub: RNode): DTree {
    let t: DTree = sub;
    for (let k = stack.length - 1; k >= 0; k--) {
      const { node, side } = stack[k];
      t =
        side === 'right'
          ? { pending: true, id: node.id, left: node.left!, right: t, weight: node.weight }
          : { pending: true, id: node.id, left: t, right: node.right!, weight: null };
    }
    return t;
  }

  private joinRight(left: RNode, right: RNode, stack: Array<{ node: RNode; side: 'left' | 'right' }>, show: (t: DTree) => void): RNode {
    const joined = this.joinRec(left.right!, right, [...stack, { node: left, side: 'right' }], show, `Down the right spine to the node of height ${left.right!.height}: `);
    const sibling = left.left!;
    const spine: Record<number, Role> = {};
    for (const s of stack) spine[s.node.id] = 'compare';
    const vars: Array<[string, string | number]> = [['height(joined)', joined.height], ['height(sibling)', sibling.height]];
    if (joined.height <= sibling.height + 1) {
      const node = this.make(sibling, joined);
      show(this.composite(stack, node));
      this.snap(
        L.joinUp,
        `Back up at the old node of weight ${left.weight}: the joined subtree has height ${joined.height} and its sibling (left.left) ${sibling.height}, within 1, so no rotation: _make(left.left, joined) replaces it (weight ${node.weight}, height ${node.height}).`,
        { roles: { ...spine, [node.id]: 'active' }, vars },
      );
      return node;
    }
    this.snap(
      L.joinRotate,
      `Back up at the old node of weight ${left.weight}: the joined subtree (height ${joined.height}) is two levels taller than its sibling left.left (height ${sibling.height}). A plain _make would leave siblings 2 apart, so the code rotates.`,
      { roles: { ...spine, [left.id]: 'bad', [joined.id]: 'compare', [sibling.id]: 'compare' }, vars },
    );
    const inner = joined.left!;
    const outer = joined.right!;
    if (inner.height <= outer.height) {
      const low = this.make(sibling, inner);
      const node = this.make(low, outer);
      this.rotations.single++;
      show(this.composite(stack, node));
      this.snap(
        L.joinRotate,
        `Single rotation: the joined subtree's outer (right) side is at least as tall as its inner side (${outer.height} >= ${inner.height}), so that side moves up. A new node over left.left and joined.left becomes the left child of a new top, with joined.right on its right. The leaves keep their order.`,
        { roles: { ...spine, [low.id]: 'active', [node.id]: 'active' }, vars },
      );
      return node;
    }
    const a = this.make(sibling, inner.left!);
    const b = this.make(inner.right!, outer);
    const node = this.make(a, b);
    this.rotations.double++;
    show(this.composite(stack, node));
    this.snap(
      L.joinRotate,
      `Double rotation: the joined subtree's inner (left) side is the taller one (${inner.height} > ${outer.height}), so it is shared out between two new nodes, (left.left, its left child) and (its right child, joined.right), under a new top. The leaves keep their order.`,
      { roles: { ...spine, [a.id]: 'active', [b.id]: 'active', [node.id]: 'active' }, vars },
    );
    return node;
  }

  private joinLeft(left: RNode, right: RNode, stack: Array<{ node: RNode; side: 'left' | 'right' }>, show: (t: DTree) => void): RNode {
    const joined = this.joinRec(left, right.left!, [...stack, { node: right, side: 'left' }], show, `Down the left spine to the node of height ${right.left!.height}: `);
    const sibling = right.right!;
    const spine: Record<number, Role> = {};
    for (const s of stack) spine[s.node.id] = 'compare';
    const vars: Array<[string, string | number]> = [['height(joined)', joined.height], ['height(sibling)', sibling.height]];
    if (joined.height <= sibling.height + 1) {
      const node = this.make(joined, sibling);
      show(this.composite(stack, node));
      this.snap(
        L.joinUp,
        `Back up at the old node of weight ${right.weight}: the joined subtree has height ${joined.height} and its sibling (right.right) ${sibling.height}, within 1, so no rotation: _make(joined, right.right) replaces it (weight ${node.weight}, height ${node.height}).`,
        { roles: { ...spine, [node.id]: 'active' }, vars },
      );
      return node;
    }
    this.snap(
      L.joinRotate,
      `Back up at the old node of weight ${right.weight}: the joined subtree (height ${joined.height}) is two levels taller than its sibling right.right (height ${sibling.height}). A plain _make would leave siblings 2 apart, so the code rotates.`,
      { roles: { ...spine, [right.id]: 'bad', [joined.id]: 'compare', [sibling.id]: 'compare' }, vars },
    );
    const outer = joined.left!;
    const inner = joined.right!;
    if (inner.height <= outer.height) {
      const low = this.make(inner, sibling);
      const node = this.make(outer, low);
      this.rotations.single++;
      show(this.composite(stack, node));
      this.snap(
        L.joinRotate,
        `Single rotation: the joined subtree's outer (left) side is at least as tall as its inner side (${outer.height} >= ${inner.height}), so that side moves up. A new node over joined.right and right.right becomes the right child of a new top, with joined.left on its left. The leaves keep their order.`,
        { roles: { ...spine, [low.id]: 'active', [node.id]: 'active' }, vars },
      );
      return node;
    }
    const a = this.make(outer, inner.left!);
    const b = this.make(inner.right!, sibling);
    const node = this.make(a, b);
    this.rotations.double++;
    show(this.composite(stack, node));
    this.snap(
      L.joinRotate,
      `Double rotation: the joined subtree's inner (right) side is the taller one (${inner.height} > ${outer.height}), so it is shared out between two new nodes, (joined.left, its left child) and (its right child, right.right), under a new top. The leaves keep their order.`,
      { roles: { ...spine, [a.id]: 'active', [b.id]: 'active', [node.id]: 'active' }, vars },
    );
    return node;
  }

  // ---- split

  /** _split(pieces[k], i): replaces pieces[k] by its two halves (empty halves are left out) with the cut between. */
  private split(k: number, i: number, names: [string, string], who = 'r'): [RNode | null, RNode | null] {
    const root = this.pieces[k].tree as RNode | null;
    if (root === null) {
      this.pieces.splice(k, 1);
      this.cut = k;
      this.snap(L.splitWalk, `The rope is empty: _split(None, ${i}) returns (None, None), two empty ropes.`, { vars: [['i', i]] });
      return [null, null];
    }
    const path: Array<{ node: RNode; goLeft: boolean }> = [];
    const roles: Record<number, Role> = {};
    const edges: Record<number, Role> = {};
    let node = root;
    let pos = i;
    this.snap(L.splitWalk, `${who}.split(${i}): walk down ${who} by the weights, as index does, to the leaf or node where position ${i} begins.`, {
      roles: { [node.id]: 'active' },
      pointer: { node: node.id, text: `i = ${pos}` },
      vars: [['i', i]],
    });
    while (node.data === null && pos !== node.weight) {
      const goLeft = pos < node.weight;
      const child: RNode = goLeft ? node.left! : node.right!;
      const other: RNode = goLeft ? node.right! : node.left!;
      path.push({ node, goLeft });
      roles[node.id] = 'compare';
      edges[child.id] = 'compare';
      const why = goLeft
        ? `${pos} < weight ${node.weight}: the cut is in the left subtree, so go left. The right subtree (${plural(other.length, 'character')}) lies wholly after the cut and will belong to the right half.`
        : `${pos} > weight ${node.weight}: the cut is in the right subtree, so go right with ${pos} - ${node.weight} = ${pos - node.weight}. The left subtree lies wholly before the cut and will belong to the left half.`;
      if (!goLeft) pos -= node.weight;
      node = child;
      this.snap(L.splitWalk, why, { roles: { ...roles, [node.id]: 'active' }, edges: { ...edges }, pointer: { node: node.id, text: `i = ${pos}` }, vars: [['i', i], ['i in this subtree', pos]] });
    }

    let lp: RNode | null;
    let rp: RNode | null;
    const fresh: Record<number, Role> = {};
    if (node.data !== null) {
      const data = node.data;
      if (pos <= 0) {
        [lp, rp] = [null, node];
        this.snap(L.splitWalk, `A leaf, and the cut is at ${pos} <= 0, its very start: the whole leaf ${q(data)} goes to the right half. Nothing is copied.`, {
          roles: { ...roles, [node.id]: 'active' },
          edges,
          slice: { leaf: node.id, at: 0 },
        });
      } else if (pos >= data.length) {
        [lp, rp] = [node, null];
        this.snap(L.splitWalk, `A leaf, and the cut is at ${pos} >= ${data.length}, its end: the whole leaf ${q(data)} goes to the left half. Nothing is copied.`, {
          roles: { ...roles, [node.id]: 'active' },
          edges,
          slice: { leaf: node.id, at: data.length },
        });
      } else {
        this.snap(L.splitWalk, `The cut falls inside the leaf ${q(data)}, before its character ${pos}. This leaf is the only thing a split copies (at most 10 characters).`, {
          roles: { ...roles, [node.id]: 'active' },
          edges,
          slice: { leaf: node.id, at: pos },
        });
        lp = this.leaf(data.slice(0, pos));
        rp = this.leaf(data.slice(pos));
        fresh[lp.id] = 'active';
        fresh[rp.id] = 'active';
      }
    } else {
      [lp, rp] = [node.left, node.right];
      this.snap(L.splitWalk, `${pos} == weight ${node.weight}: the cut falls exactly between this node's children, so its left child ends the left half and its right child starts the right half. No leaf is cut.`, {
        roles: { ...roles, [node.id]: 'active' },
        edges,
        pointer: { node: node.id, text: `i = ${pos}` },
      });
    }

    // Lay the pieces out: hanging subtrees left of the cut, then right of it, in text order.
    const leftSide: RNode[] = path.filter((p) => !p.goLeft).map((p) => p.node.left!);
    const rightSide: RNode[] = path
      .filter((p) => p.goLeft)
      .map((p) => p.node.right!)
      .reverse();
    if (lp) leftSide.push(lp);
    if (rp) rightSide.unshift(rp);
    this.pieces.splice(k, 1, ...leftSide.map((t) => ({ tree: t })), ...rightSide.map((t) => ({ tree: t })));
    this.cut = k + leftSide.length;
    const levels = path.length;
    const why =
      levels === 0
        ? node.data !== null && lp && rp
          ? `The two new leaves ${q(lp.data!)} and ${q(rp.data!)} are the two halves.`
          : 'The two halves are ready; there is nothing to rebuild.'
        : `Every subtree hanging off the path left of the cut belongs to the left half, every one right of it to the right half. The ${plural(levels, 'node')} on the path ${levels === 1 ? 'is' : 'are'} not reused: on the way back up, each level joins its hanging subtree onto the half built so far (where that half is still empty, _join simply returns the subtree).`;
    this.snap(L.splitJoin, why, { roles: fresh });

    let lAcc = lp;
    let rAcc = rp;
    for (let d = path.length - 1; d >= 0; d--) {
      const { node: n, goLeft } = path[d];
      if (goLeft) {
        // return (left_part, _join(right_part, node.right))
        if (rAcc === null) rAcc = n.right!;
        else rAcc = this.join(this.cut!, `Back at the old node of weight ${n.weight} (cut in its left subtree): _join(right half so far, its right subtree)`);
      } else if (lAcc === null) {
        // return (_join(node.left, left_part), right_part)
        lAcc = n.left!;
      } else {
        lAcc = this.join(this.cut! - 2, `Back at the old node of weight ${n.weight} (cut in its right subtree): _join(its left subtree, left half so far)`);
      }
    }
    const setLabel = (t: RNode | null, name: string) => {
      const p = this.pieces.find((x) => x.tree === t);
      if (p && t) p.label = name;
    };
    setLabel(lAcc, names[0]);
    setLabel(rAcc, names[1]);
    return [lAcc, rAcc];
  }

  // ---- operations

  private splitOp(i: number): [Shape, Shape] {
    const [lp, rp] = this.split(0, i, ['left', 'right']);
    this.snap(
      L.splitJoin,
      `split(${i}) returns two new ropes, ${q(textOf(lp))} and ${q(textOf(rp))}. They share every untouched subtree with r, and r itself still holds ${q(textOf(this.root))}: nodes are never modified, so the next operation starts from r again.`,
      { vars: [['len(left)', lp?.length ?? 0], ['len(right)', rp?.length ?? 0]] },
    );
    return [shapeOf(lp), shapeOf(rp)];
  }

  private insertOp(at: number | 'end', text: string) {
    const i = at === 'end' ? (this.root?.length ?? 0) : at;
    this.snap(L.insert, `insert(${at === 'end' ? `len(r) = ${i}` : i}, ${q(text)}): split r at ${i}, build a rope from the new text, then join the three pieces in order. r gets the result.`, {
      roles: this.root ? { [this.root.id]: 'active' } : {},
    });
    const [lp, rp] = this.split(0, i, ['left', 'right']);
    const middle = text ? this.build(text) : null;
    if (middle) this.pieces.splice(this.cut ?? 0, 0, { tree: middle, label: 'middle', role: 'active' });
    this.cut = undefined;
    this.snap(
      L.build,
      middle
        ? `Rope(${q(text)}) builds the middle rope: ${text.length <= LEAF_SIZE ? 'at most 10 characters fit in one leaf' : `the text is halved until every piece has at most 10 characters (${plural(leafCount(middle), 'leaf', 'leaves')}, height ${middle.height})`}.`
        : `Rope('') is an empty rope: there is nothing to put between the halves.`,
      { roles: this.all(middle, 'active') },
    );
    const piece = this.pieces.find((p) => p.tree === middle);
    if (piece) piece.role = undefined;
    let merged: RNode | null;
    if (lp && middle) merged = this.join(0, 'left.concat(middle): _join(left, middle)', 'left + middle');
    else merged = lp ?? middle;
    let result: RNode | null;
    if (merged && rp) result = this.join(0, '.concat(right): _join(that, right)', 'r');
    else result = merged ?? rp;
    this.root = result;
    this.showRoot();
    this.snap(L.insert, `r now holds ${q(textOf(result))}: ${plural(result?.length ?? 0, 'character')}, height ${result?.height ?? -1}. Only nodes on the cut path and the joined spines were built; everything else is shared with the old rope.`, {
      roles: {},
    });
  }

  private deleteOp(i: number, n: number) {
    this.snap(L.delete, `delete(${i}, ${n}): split r at ${i}, split the rest at ${n}, then join the outer two pieces. The ${plural(n, 'character')} in the middle are dropped.`, {
      roles: this.root ? { [this.root.id]: 'active' } : {},
    });
    const [left, rest] = this.split(0, i, ['left', 'rest']);
    const restAt = left ? 1 : 0;
    let mid: RNode | null = null;
    let right: RNode | null = null;
    if (rest) {
      this.cut = undefined;
      [mid, right] = this.split(restAt, n, ['deleted', 'right'], 'rest');
    } else {
      this.snap(L.delete, `The rest is empty, so rest.split(${n}) returns two empty ropes: nothing is deleted.`, {});
    }
    if (mid) {
      this.snap(L.delete, `The middle piece ${q(textOf(mid))} is the deleted text. The code built it like any split half, and now drops it: delete keeps only left and right.`, {
        roles: this.all(mid, 'muted'),
      });
      const k = this.pieces.findIndex((p) => p.tree === mid);
      this.pieces.splice(k, 1);
    }
    this.cut = undefined;
    let result: RNode | null;
    if (left && right) result = this.join(0, 'left.concat(right): _join(left, right)', 'r');
    else result = left ?? right;
    this.root = result;
    this.showRoot();
    this.snap(L.delete, `r now holds ${q(textOf(result))}: ${plural(result?.length ?? 0, 'character')}, height ${result?.height ?? -1}.`, {});
  }

  private concatOp(text: string) {
    const other = text ? this.build(text) : null;
    this.pieces = [{ tree: this.root, label: 'r' }, ...(other ? [{ tree: other as DTree, label: 'other' }] : [])];
    this.cut = undefined;
    this.snap(
      L.concat,
      other
        ? `concat(Rope(${q(text)})): first Rope(${q(text)}) builds the other rope (height ${other.height}); then _join(r, other) makes the result, a new rope. Neither input changes.`
        : `concat(Rope('')): the other rope is empty, so _join(r, None) returns r's root unchanged.`,
      { roles: this.all(other, 'active') },
    );
    let result: RNode | null;
    if (this.root && other) result = this.join(0, '_join(r, other)', 'r');
    else result = this.root ?? other;
    this.root = result;
    this.showRoot();
    this.snap(L.concat, `r = r.concat(other) holds ${q(textOf(result))}: ${plural(result?.length ?? 0, 'character')}, height ${result?.height ?? -1}.`, {});
  }

  run(text: string): RopeRun {
    this.root = text ? this.build(text) : null;
    this.showRoot();
    this.snap(
      L.build,
      text
        ? `Rope(${q(text)}): ${text.length <= LEAF_SIZE ? 'the text fits in one leaf (at most 10 characters)' : `the text is halved until every piece has at most 10 characters: ${plural(leafCount(this.root), 'leaf', 'leaves')}`}. A circle holds its weight, the length of its left subtree; levels show the cached heights.`
        : `Rope(''): an empty rope has no root at all (height -1).`,
    );
    this.ops.forEach((op, k) => {
      this.current = k;
      this.showRoot();
      let result: RopeStep['result'] = null;
      if (op.kind === 'index') result = this.index(op.i);
      else if (op.kind === 'split') result = this.splitOp(op.i);
      else if (op.kind === 'insert') this.insertOp(op.i, op.text);
      else if (op.kind === 'delete') this.deleteOp(op.i, op.n);
      else this.concatOp(op.text);
      this.steps.push({ op, text: textOf(this.root), len: this.root?.length ?? 0, height: this.root?.height ?? -1, shape: shapeOf(this.root), result });
    });
    this.current = this.ops.length;
    this.showRoot();
    const r = this.root;
    this.snap(
      undefined,
      `Done: r holds ${q(textOf(r))}, ${plural(r?.length ?? 0, 'character')} in ${plural(leafCount(r), 'leaf', 'leaves')}, height ${r?.height ?? -1}. Every join kept sibling heights within 1, so the height stays O(log n), and with it the cost of index, split and join.`,
    );
    return { frames: this.frames, steps: this.steps, root: this.root, rotations: this.rotations };
  }
}

export function ropeTrace({ text, ops }: RopeInput): RopeRun {
  return new RopeTracer(ops, true).run(text);
}

/** The same run without frames (for tests and limits). */
export function ropeRun({ text, ops }: RopeInput): RopeRun {
  return new RopeTracer(ops, false).run(text);
}
