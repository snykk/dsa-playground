import type { Role } from '../core/types';
import { NodeGlyph } from '../ui/atoms/NodeGlyph';
import { useTween, type Pt } from '../ui/hooks/useTween';
import { Strips, type StripData } from '../ui/molecules/Strip';
import { SYM } from '../ui/symbols';
import '../ui/roles.css';
import './RootedTreeView.css';

/** One vertex of a rooted tree with any number of children. */
export interface RtNode {
  /** Unique within its tree. */
  id: string;
  label: string;
  /** Child ids, left to right. */
  children: string[];
  role?: Role;
  /** Small number at the top-right corner, e.g. a subtree size. */
  badge?: string;
  /** Short text under the vertex, e.g. its position in an array; left out when the levels are too close for it. */
  sub?: string;
  /** Taken out of the tree (a removed centroid): faded, with a dashed outline. */
  removed?: boolean;
  /** Keeps its place in the layout but is not drawn yet (a tree that is still being built). */
  hidden?: boolean;
  /** "treeId/nodeId": for this frame, drawn on top of that vertex of another tree; it glides to its own place next. */
  from?: string;
}

/** heavy: a thick solid edge; light: a thin dashed edge; cut: a faint dotted edge (an endpoint was removed). */
export type RtEdgeKind = 'heavy' | 'light' | 'cut';

export interface RtEdge {
  kind?: RtEdgeKind;
  role?: Role;
}

/** Vertices joined by a shaded tube, top to bottom: a heavy chain. */
export interface RtChain {
  nodes: string[];
}

export interface RtTree {
  id: string;
  title?: string;
  root: string | null;
  nodes: RtNode[];
  /** The edge from a vertex's parent into it, keyed by the child id. */
  edges?: Record<string, RtEdge>;
  chains?: RtChain[];
}

/** A named pointer ("u", "v") pinned beside a vertex; it glides when it moves. */
export interface RtPill {
  name: string;
  /** "treeId/nodeId". */
  at: string;
  role?: Role;
  side?: 'left' | 'right';
}

export interface RtRowCell {
  text: string;
  role?: Role;
}

/** A row of cells under the trees (an array indexed 0..n-1), with brackets that group runs of cells. */
export interface RtRow {
  label: string;
  /** null: a slot not written yet (dashed). */
  cells: Array<RtRowCell | null>;
  groups?: Array<{ lo: number; hi: number; label: string }>;
}

export interface RootedTreeState {
  /** What the picture shows, for screen readers. */
  label: string;
  trees: RtTree[];
  pills?: RtPill[];
  row?: RtRow;
  note?: string;
  strips?: StripData[];
}

const R = 15;
const DX = 44;
const PADX = 26;
const TITLE = 20;
const TOP = 26; // room above the root for pills and badges
const BOTTOM = 20; // room under the deepest vertex for its sub text
const GAP = 28;
/** Trees wider than this together go one under the other (the stage scales a wide picture down, a tall one too). */
const MAX_ROW_W = 1040;
const CW = 34;
const CH = 26;
const ROW_LABEL = 44;
const PILL_H = 15;
/** Text under a vertex needs this much between levels, or it would run into the vertex below. */
const SUB_ROOM = 46;

export interface RtTreeLayout {
  /** Vertex centers relative to the tree's box. */
  pos: Map<string, Pt>;
  width: number;
  height: number;
  levels: number;
  /** Distance between two levels. */
  dy: number;
}

/** Leaves take consecutive slots left to right; a parent sits midway over its first and last child. */
export function layoutRooted(tree: RtTree): RtTreeLayout {
  const byId = new Map(tree.nodes.map((n) => [n.id, n]));
  const raw = new Map<string, { x: number; depth: number }>();
  let slot = 0;
  let maxDepth = 0;
  const place = (id: string, depth: number) => {
    const n = byId.get(id);
    if (!n || raw.has(id)) return;
    maxDepth = Math.max(maxDepth, depth);
    const kids = n.children.filter((c) => byId.has(c));
    if (kids.length === 0) {
      raw.set(id, { x: slot * DX + DX / 2, depth });
      slot += 1;
      return;
    }
    for (const c of kids) place(c, depth + 1);
    const first = raw.get(kids[0])!;
    const last = raw.get(kids[kids.length - 1])!;
    raw.set(id, { x: (first.x + last.x) / 2, depth });
  };
  if (tree.root !== null) place(tree.root, 0);
  const levels = tree.root === null ? 0 : maxDepth + 1;
  // A deep tree gets shorter levels so that it stays near the stage height.
  const dy = levels <= 1 ? 56 : Math.max(34, Math.min(58, Math.floor(330 / (levels - 1))));
  const top = (tree.title ? TITLE : 0) + TOP;
  const pos = new Map<string, Pt>();
  for (const [id, p] of raw) pos.set(id, { x: PADX + p.x, y: top + R + p.depth * dy });
  return {
    pos,
    width: PADX * 2 + Math.max(1, slot) * DX,
    height: top + 2 * R + Math.max(0, levels - 1) * dy + BOTTOM,
    levels,
    dy,
  };
}

export interface RtGeometry {
  width: number;
  height: number;
  /** Absolute vertex centers keyed "treeId/nodeId". */
  pos: Map<string, Pt>;
  boxes: Array<{ id: string; x: number; y: number; width: number; height: number; dy: number }>;
  rowTop: number;
  rowLeft: number;
}

/** Place the trees side by side when they fit in one row, else one under the other; the row goes underneath. */
export function rootedGeometry(state: Pick<RootedTreeState, 'trees' | 'row'>): RtGeometry {
  const layouts = state.trees.map(layoutRooted);
  const sideBySide = layouts.reduce((s, l) => s + l.width, 0) + GAP * Math.max(0, layouts.length - 1) <= MAX_ROW_W;
  const rowCells = state.row?.cells.length ?? 0;
  const rowW = state.row ? ROW_LABEL + Math.max(1, rowCells) * CW + 12 : 0;
  const treesW = sideBySide ? layouts.reduce((s, l) => s + l.width, 0) + GAP * Math.max(0, layouts.length - 1) : Math.max(0, ...layouts.map((l) => l.width));
  const width = Math.max(treesW, rowW, 120);
  const pos = new Map<string, Pt>();
  const boxes: RtGeometry['boxes'] = [];
  let x = sideBySide ? (width - treesW) / 2 : 0;
  let y = 0;
  let treesH = 0;
  state.trees.forEach((t, i) => {
    const l = layouts[i];
    const bx = sideBySide ? x : (width - l.width) / 2;
    const by = sideBySide ? 0 : y;
    boxes.push({ id: t.id, x: bx, y: by, width: l.width, height: l.height, dy: l.dy });
    for (const [id, p] of l.pos) pos.set(`${t.id}/${id}`, { x: bx + p.x, y: by + p.y });
    if (sideBySide) {
      x += l.width + GAP;
      treesH = Math.max(treesH, l.height);
    } else {
      y += l.height + 6;
      treesH = y;
    }
  });
  // The row: index numbers (rowTop + 5), cells from rowTop + 14, then the group brackets and their labels.
  const rowTop = treesH + 6;
  const rowBottom = state.row ? rowTop + 14 + CH + (state.row.groups ? 5 + 13 + 9 : 6) : treesH;
  return { width, height: rowBottom + 2, pos, boxes, rowTop, rowLeft: (width - rowW) / 2 + ROW_LABEL };
}

function pillWidth(text: string): number {
  return Math.max(18, text.length * 7 + 10);
}

/**
 * Organism: one or more rooted trees with any number of children per vertex (a tree being
 * decomposed, the tree its decomposition builds), drawn from NodeGlyph atoms. Heavy edges are
 * thick and solid, light edges thin and dashed, and a shaded tube joins the vertices of one
 * chain, so chains read without colour. Removed vertices fade behind a dashed outline. Named
 * pointers glide from vertex to vertex, a vertex can fly from one tree into another, and an
 * optional row of cells (an array the decomposition fills) sits underneath.
 */
export function RootedTreeView({ state }: { state: RootedTreeState }) {
  const { trees, pills = [], row, note, strips } = state;
  const g = rootedGeometry(state);

  const target = new Map<string, Pt>();
  for (const t of trees) {
    for (const n of t.nodes) {
      if (n.hidden) continue;
      const own = g.pos.get(`${t.id}/${n.id}`);
      const p = (n.from && g.pos.get(n.from)) || own;
      if (p) target.set(`${t.id}/${n.id}`, p);
    }
  }
  for (const pl of pills) {
    const p = g.pos.get(pl.at);
    if (!p) continue;
    const w = pillWidth(pl.name);
    const dx = R + 2 + w / 2;
    target.set(`pill:${pl.name}`, { x: p.x + (pl.side === 'right' ? dx : -dx), y: p.y - R - 2 });
  }
  const tween = useTween(target);
  const at = (key: string): Pt | undefined => tween.get(key) ?? target.get(key);

  return (
    <div className="rt-wrap">
      <svg
        className="rt-view"
        viewBox={`0 0 ${g.width} ${g.height}`}
        style={{ width: g.width, maxWidth: '100%', minWidth: Math.min(g.width, 560) }}
        role="img"
        aria-label={state.label}
      >
        {trees.map((t, ti) => {
          const box = g.boxes[ti];
          const byId = new Map(t.nodes.map((n) => [n.id, n]));
          const shown = (id: string) => {
            const n = byId.get(id);
            return n !== undefined && !n.hidden && target.has(`${t.id}/${id}`);
          };
          return (
            <g key={t.id} className="rt-tree">
              {t.title && (
                <text className="rt-title" x={box.x + 6} y={box.y + 12}>
                  {t.title}
                </text>
              )}
              {(t.chains ?? []).map((c, ci) => {
                const pts = c.nodes.filter(shown).map((id) => at(`${t.id}/${id}`)!);
                if (pts.length === 0) return null;
                const d = pts.map((p, k) => `${k ? 'L' : 'M'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join('') + (pts.length === 1 ? `L${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)}` : '');
                return <path key={`ch${ci}`} className="rt-chain" d={d} />;
              })}
              {t.nodes.flatMap((n) =>
                n.children
                  .filter((c) => shown(n.id) && shown(c) && !byId.get(c)!.from && !n.from)
                  .map((c) => {
                    const a = at(`${t.id}/${n.id}`)!;
                    const b = at(`${t.id}/${c}`)!;
                    const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
                    const ux = (b.x - a.x) / len;
                    const uy = (b.y - a.y) / len;
                    const e = t.edges?.[c];
                    return (
                      <line
                        key={`e${n.id}-${c}`}
                        className={`rt-edge${e?.kind ? ` ${e.kind}` : ''} role-${e?.role ?? 'idle'}`}
                        x1={a.x + ux * R}
                        y1={a.y + uy * R}
                        x2={b.x - ux * R}
                        y2={b.y - uy * R}
                      />
                    );
                  }),
              )}
              {t.nodes
                .filter((n) => shown(n.id))
                .map((n) => {
                  const p = at(`${t.id}/${n.id}`)!;
                  return (
                    <g key={n.id} className={`rt-node${n.removed ? ' removed' : ''}`}>
                      <NodeGlyph x={p.x} y={p.y} r={R} label={n.label} role={n.role ?? 'idle'} badge={n.badge} badgePlacement="corner" outlined={n.removed} />
                      {n.sub && box.dy >= SUB_ROOM && (
                        <text className="rt-sub" x={p.x} y={p.y + R + 10}>
                          {n.sub}
                        </text>
                      )}
                    </g>
                  );
                })}
            </g>
          );
        })}
        {pills.map((pl) => {
          const p = at(`pill:${pl.name}`);
          if (!p) return null;
          const w = pillWidth(pl.name);
          return (
            <g key={`pill:${pl.name}`} className={`rt-pill role-${pl.role ?? 'active'}`}>
              <rect x={p.x - w / 2} y={p.y - PILL_H / 2} width={w} height={PILL_H} rx={PILL_H / 2} />
              <text x={p.x} y={p.y}>
                {pl.name}
              </text>
            </g>
          );
        })}
        {row && (
          <g className="rt-row">
            <text className="rt-rowlabel" x={g.rowLeft - 8} y={g.rowTop + 14 + CH / 2}>
              {row.label}
            </text>
            {row.cells.map((c, i) => {
              const x = g.rowLeft + i * CW;
              const y = g.rowTop + 14;
              const role = c?.role ?? 'idle';
              const glyph = role === 'good' ? SYM.check : role === 'bad' ? SYM.cross : null;
              return (
                <g key={i} className={`rt-cell role-${role}${c ? '' : ' empty'}`}>
                  <text className="rt-index" x={x + CW / 2} y={g.rowTop + 5}>
                    {i}
                  </text>
                  <rect x={x + 2} y={y} width={CW - 4} height={CH} rx={5} />
                  {c && (
                    <text className="rt-celltext" x={x + CW / 2} y={y + CH / 2}>
                      {c.text}
                    </text>
                  )}
                  {glyph && (
                    <text className="rt-glyph" x={x + CW - 3} y={y - 2}>
                      {glyph}
                    </text>
                  )}
                </g>
              );
            })}
            {(row.groups ?? []).map((gr, k) => {
              const x1 = g.rowLeft + gr.lo * CW + 4;
              const x2 = g.rowLeft + (gr.hi + 1) * CW - 4;
              const y = g.rowTop + 14 + CH + 5;
              return (
                <g key={`grp${k}`} className="rt-group">
                  <path d={`M${x1},${y}v4H${x2}v-4`} />
                  <text x={(x1 + x2) / 2} y={y + 13}>
                    {gr.label}
                  </text>
                </g>
              );
            })}
          </g>
        )}
      </svg>
      {note && <p className="rt-note">{note}</p>}
      <Strips strips={strips} />
    </div>
  );
}
