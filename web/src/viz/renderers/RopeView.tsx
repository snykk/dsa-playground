import type { Frame, Role } from '../core/types';
import { NodeGlyph } from '../ui/atoms/NodeGlyph';
import { useTween, type Pt } from '../ui/hooks/useTween';
import { Strips, type StripData } from '../ui/molecules/Strip';
import { SYM } from '../ui/symbols';
import '../ui/roles.css';
import './RopeView.css';

export interface RopeNodeView {
  /** Stable identity: a node keeps its id across frames, so it glides when the tree changes shape. */
  id: number;
  /** A leaf's fragment; null for an internal node. */
  text: string | null;
  /** Internal node: the weight drawn in its circle (null while it is not known). */
  weight: number | null;
  left: number | null;
  right: number | null;
  /** The cached height (0 for a leaf); for a pending node, the height it has with its current children. */
  height: number;
  role?: Role;
  /** An old node on a path being rebuilt: drawn dashed until a new node replaces it. */
  pending?: boolean;
}

export interface RopePieceView {
  /** Root of one rope on the stage, or null for an empty rope. */
  root: number | null;
  /** Name under the rope: r, left, right, middle, other... */
  label?: string;
  role?: Role;
}

/** Room the whole run needs, so the picture keeps its size while ropes are cut and joined. */
export interface RopeExtent {
  width: number;
  levels: number;
}

export interface RopeViewState {
  nodes: RopeNodeView[];
  /** The ropes on the stage, side by side in text order. */
  pieces: RopePieceView[];
  /** A cut (from a split) is drawn just before pieces[cut]. */
  cut?: number;
  /** Roles of the edges into a node, keyed by the child's id. */
  edges?: Record<number, Role>;
  /** One character of a leaf picked out (the answer of index). */
  mark?: { leaf: number; at: number; role: Role };
  /** A cut inside a leaf, before character `at` (split). */
  slice?: { leaf: number; at: number };
  /** A label next to a node, such as "i = 5". */
  pointer?: { node: number; text: string; role?: Role };
  strips?: StripData[];
  /** Set by stabilizeRope; never needed by a tracer. */
  extent?: RopeExtent;
}

/** Pixels per character inside a leaf. */
const CH = 10;
const PADX = 6;
const LEAF_H = 26;
const LEAF_GAP = 10;
const PIECE_GAP = 30;
const CUT_GAP = 46;
const EMPTY_W = 46;
const DY = 52;
const R = 15;
const LEFT = 34;
const TOP = 36;
const BOTTOM = 44;
const RIGHT = 56;

export interface RopeLayout {
  /** Center of every node on the stage. */
  pos: Map<number, Pt>;
  /** Width of every leaf box. */
  leafWidth: Map<number, number>;
  /** Position of a leaf's first character within its rope. */
  offset: Map<number, number>;
  /** Horizontal span of each piece. */
  spans: Array<{ x0: number; x1: number }>;
  /** Middle of the cut gap, if there is a cut. */
  cutX?: number;
  /** Right edge of the content. */
  width: number;
  /** Tallest node on the stage. */
  levels: number;
}

/**
 * Lay the ropes out left to right: leaves in text order, each as wide as its characters, all
 * on the bottom row; an internal node sits centered over its two children, at a level given
 * by its height, so sibling heights (what the AVL join balances) can be read off the picture.
 */
export function layoutRope(state: RopeViewState, levels?: number): RopeLayout {
  const byId = new Map(state.nodes.map((n) => [n.id, n]));
  const xs = new Map<number, number>();
  const leafWidth = new Map<number, number>();
  const offset = new Map<number, number>();
  const spans: Array<{ x0: number; x1: number }> = [];
  let maxHeight = 0;
  let x = LEFT;
  let cutX: number | undefined;

  const place = (id: number, at: number): number => {
    const n = byId.get(id);
    if (!n) return at;
    maxHeight = Math.max(maxHeight, n.height);
    if (n.text !== null) {
      const w = n.text.length * CH + 2 * PADX;
      xs.set(id, x + w / 2);
      leafWidth.set(id, w);
      offset.set(id, at);
      x += w + LEAF_GAP;
      return at + n.text.length;
    }
    let next = at;
    if (n.left !== null) next = place(n.left, next);
    if (n.right !== null) next = place(n.right, next);
    const a = n.left !== null ? xs.get(n.left) : undefined;
    const b = n.right !== null ? xs.get(n.right) : undefined;
    xs.set(id, a !== undefined && b !== undefined ? (a + b) / 2 : (a ?? b ?? x));
    return next;
  };

  state.pieces.forEach((piece, i) => {
    if (i === state.cut) {
      // The cut gets a wider gap, also when it falls before the first piece (a split at 0).
      const gapStart = i > 0 ? x - LEAF_GAP : x;
      cutX = gapStart + CUT_GAP / 2;
      x = gapStart + CUT_GAP;
    } else if (i > 0) {
      x += PIECE_GAP - LEAF_GAP;
    }
    const x0 = x;
    if (piece.root === null) x += EMPTY_W + LEAF_GAP;
    else place(piece.root, 0);
    spans.push({ x0, x1: x - LEAF_GAP });
  });
  if (state.cut !== undefined && state.cut >= state.pieces.length && state.pieces.length > 0) cutX = x - LEAF_GAP + CUT_GAP / 2;

  const top = levels ?? maxHeight;
  const pos = new Map<number, Pt>();
  for (const [id, cx] of xs) pos.set(id, { x: cx, y: TOP + (top - (byId.get(id)?.height ?? 0)) * DY });
  const right = Math.max(x - LEAF_GAP, LEFT + EMPTY_W, cutX !== undefined ? cutX + CUT_GAP / 2 : 0);
  return { pos, leafWidth, offset, spans, cutX, width: right, levels: maxHeight };
}

/**
 * Give every frame of a run the same extent (width and number of levels), so the picture
 * keeps its size while ropes are cut, built and joined. Call it from the spec's trace().
 */
export function stabilizeRope(frames: Array<Frame<RopeViewState>>): Array<Frame<RopeViewState>> {
  let width = 0;
  let levels = 0;
  for (const f of frames) {
    const l = layoutRope(f.state);
    width = Math.max(width, l.width);
    levels = Math.max(levels, l.levels);
  }
  const extent = { width, levels };
  return frames.map((f) => ({ ...f, state: { ...f.state, extent } }));
}

const show = (ch: string) => (ch === ' ' ? SYM.openBox : ch);

function describe(state: RopeViewState): string {
  const byId = new Map(state.nodes.map((n) => [n.id, n]));
  const leaves = (id: number | null): string[] => {
    const n = id === null ? undefined : byId.get(id);
    if (!n) return [];
    return n.text !== null ? [n.text] : [...leaves(n.left), ...leaves(n.right)];
  };
  const parts = state.pieces.map((p) => `${p.label ?? 'rope'}: ${p.root === null ? 'empty' : leaves(p.root).map((t) => `"${t}"`).join(' ')}`);
  return parts.length ? `Rope leaves in order. ${parts.join('; ')}` : 'No rope';
}

/**
 * Organism: one or more ropes side by side. Leaves are boxes holding their fragment, internal
 * nodes are circles holding their weight (the length of their left subtree), and every node
 * sits at the level of its cached height. Nodes keep their ids across frames, so leaves and
 * shared subtrees glide when a split pulls ropes apart or a join regroups them, while nodes
 * the code builds anew appear in their place.
 */
export function RopeView({ state }: { state: RopeViewState }) {
  const levels = Math.max(state.extent?.levels ?? 0, layoutRope(state).levels);
  const layout = layoutRope(state, levels);
  const width = Math.max(state.extent?.width ?? 0, layout.width) + RIGHT;
  const leafY = TOP + levels * DY;
  const height = leafY + LEAF_H / 2 + BOTTOM;

  const target = new Map<string, Pt>();
  for (const [id, p] of layout.pos) target.set(`n${id}`, p);
  const ptrNode = state.pointer ? layout.pos.get(state.pointer.node) : undefined;
  if (state.pointer && ptrNode) target.set('ptr', { x: ptrNode.x + R + 4, y: ptrNode.y - R - 4 });
  const pos = useTween(target);
  const at = (key: string): Pt => pos.get(key) ?? target.get(key)!;

  const byId = new Map(state.nodes.map((n) => [n.id, n]));
  const shown = state.nodes.filter((n) => layout.pos.has(n.id));
  const edges = state.edges ?? {};

  return (
    <div className="rope-view-wrap">
      <svg
        className="rope-view"
        viewBox={`0 0 ${width} ${height}`}
        style={{ width, maxWidth: '100%', minWidth: Math.min(width, 480) }}
        role="img"
        aria-label={describe(state)}
      >
        {levels > 0 &&
          Array.from({ length: levels + 1 }, (_, h) => (
            <text key={`h${h}`} className="r-level" x={4} y={TOP + (levels - h) * DY}>
              h={h}
            </text>
          ))}
        {layout.cutX !== undefined && <line className="r-cut-gap" x1={layout.cutX} y1={8} x2={layout.cutX} y2={leafY + LEAF_H / 2 + 6} />}
        {shown.flatMap((n) =>
          [n.left, n.right]
            .filter((c): c is number => c !== null && layout.pos.has(c))
            .map((c) => {
              const a = at(`n${n.id}`);
              const b = at(`n${c}`);
              const leaf = byId.get(c)?.text != null;
              const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
              const ux = (b.x - a.x) / len;
              const uy = (b.y - a.y) / len;
              // An edge ends on the top side of a leaf box, or on the rim of a child circle.
              const yTop = b.y - LEAF_H / 2 - 2;
              const t = b.y - a.y > 1 ? (yTop - a.y) / (b.y - a.y) : 1;
              const end = leaf ? { x: a.x + (b.x - a.x) * t, y: yTop } : { x: b.x - ux * (R + 2), y: b.y - uy * (R + 2) };
              const role = edges[c] ?? 'idle';
              return <line key={`${n.id}-${c}`} className={`r-edge role-${role}`} x1={a.x + ux * R} y1={a.y + uy * R} x2={end.x} y2={end.y} />;
            }),
        )}
        {shown.map((n) => {
          const p = at(`n${n.id}`);
          const role = n.role ?? 'idle';
          if (n.text === null) {
            return (
              <NodeGlyph
                key={`n${n.id}`}
                x={p.x}
                y={p.y}
                r={R}
                label={n.weight === null ? '?' : n.weight}
                role={role}
                outlined={n.pending}
              />
            );
          }
          const w = layout.leafWidth.get(n.id) ?? 0;
          const x0 = p.x - w / 2;
          const mark = state.mark?.leaf === n.id ? state.mark : undefined;
          const slice = state.slice?.leaf === n.id ? state.slice : undefined;
          const glyph = role === 'good' ? SYM.check : role === 'bad' ? SYM.cross : null;
          return (
            <g key={`n${n.id}`} className={`r-leaf role-${role}${n.pending ? ' pending' : ''}`}>
              <rect x={x0} y={p.y - LEAF_H / 2} width={w} height={LEAF_H} rx={5} />
              {mark && (
                <rect
                  className={`r-mark role-${mark.role}`}
                  x={x0 + PADX + mark.at * CH - 1}
                  y={p.y - LEAF_H / 2 + 3}
                  width={CH + 2}
                  height={LEAF_H - 6}
                  rx={3}
                />
              )}
              {[...n.text].map((ch, k) => (
                <text
                  key={k}
                  className={`r-char${mark && mark.at === k ? ' marked' : ''}`}
                  x={x0 + PADX + k * CH + CH / 2}
                  y={p.y}
                >
                  {show(ch)}
                </text>
              ))}
              {slice && <line className="r-slice" x1={x0 + PADX + slice.at * CH} y1={p.y - LEAF_H / 2 - 6} x2={x0 + PADX + slice.at * CH} y2={p.y + LEAF_H / 2 + 6} />}
              <text className="r-offset" x={x0 + 2} y={p.y + LEAF_H / 2 + 12}>
                {layout.offset.get(n.id)}
              </text>
              {glyph && (
                <text className="r-glyph" x={x0 - 3} y={p.y - LEAF_H / 2 - 3}>
                  {glyph}
                </text>
              )}
            </g>
          );
        })}
        {state.pieces.map((piece, i) => {
          const span = layout.spans[i];
          if (!span) return null;
          const mid = (span.x0 + span.x1) / 2;
          return (
            <g key={`piece${i}`} className={`r-piece role-${piece.role ?? 'idle'}`}>
              {piece.root === null && (
                <>
                  <rect className="r-empty" x={span.x0} y={leafY - LEAF_H / 2} width={EMPTY_W} height={LEAF_H} rx={5} />
                  <text className="r-empty-text" x={span.x0 + EMPTY_W / 2} y={leafY}>
                    empty
                  </text>
                </>
              )}
              {piece.label && (
                <text className="r-piece-label" x={mid} y={leafY + LEAF_H / 2 + 30}>
                  {piece.label}
                </text>
              )}
            </g>
          );
        })}
        {state.pointer && ptrNode && (
          <text className={`r-pointer role-${state.pointer.role ?? 'active'}`} x={at('ptr').x} y={at('ptr').y}>
            {state.pointer.text}
          </text>
        )}
      </svg>
      <Strips strips={state.strips} />
    </div>
  );
}
