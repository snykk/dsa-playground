import type { Frame, Role } from '../core/types';
import { NodeGlyph } from '../ui/atoms/NodeGlyph';
import { useTween, type Pt } from '../ui/hooks/useTween';
import { Strips, type StripData } from '../ui/molecules/Strip';
import { SYM } from '../ui/symbols';
import '../ui/roles.css';
import './TreeView.css';

export interface TreeNodeView {
  id: number;
  key: number;
  left: number | null;
  right: number | null;
  role: Role;
  badge?: string;
  outlined?: boolean;
  /** Text drawn in the node instead of the key, e.g. an interval "15,20" (a label longer than 3 characters makes the node a pill). */
  label?: string;
  /** A second line under the node, e.g. a priority or "max 40". */
  sub?: string;
  /** Structural colour of a red-black node: a dark fill (black) or a red ring (red), always with a B / R marker. */
  color?: 'red' | 'black';
  /** Role of the edge from this node's parent to it: a path walked, a pruned subtree... */
  edgeRole?: Role;
  /** A short name over the node: x, p, g, z... */
  tag?: string;
}

/** One cell of the row under the tree, in the column of the node above it (an array). */
export interface TreeAxisCell {
  text: string;
  sub?: string;
  role?: Role;
}

/** Space a run keeps for its whole length (set by stabilizeTree), so the picture does not resize between steps. */
export interface TreeExtent {
  cols: number;
  depth: number;
  labelChars: number;
  sub: boolean;
  tags: boolean;
  forestLabels: boolean;
  colorKey: boolean;
  axis: boolean;
}

export interface TreeState {
  nodes: TreeNodeView[];
  root: number | null;
  /** What the small number next to each node means (e.g. "balance factor"). */
  badgeLabel?: string;
  /** Several trees side by side, left to right (the parts of a split, a detached node); used instead of `root` for the layout. */
  forest?: Array<{ root: number; label?: string }>;
  /** Empty columns between two trees of the forest (default 1). */
  forestGap?: number;
  /** A row of cells under the tree, one per column, e.g. the array a Cartesian tree was built from. */
  axis?: TreeAxisCell[];
  /** Lists under the picture: the output so far, a call stack, a queue. */
  strips?: StripData[];
  /** Set by stabilizeTree; never needed by a tracer. */
  extent?: TreeExtent;
}

const DX = 50;
const DY = 68;
const PAD = 28;
const R = 18;

export interface TreeLayout {
  /** Column and depth of every drawn node (in-order position across the forest). */
  cell: Map<number, { col: number; depth: number }>;
  cols: number;
  depth: number;
  /** Forest labels at the column of each tree's root. */
  labels: Array<{ col: number; text: string }>;
}

/** Columns by in-order position (trees of a forest one after another), depths from each root. */
export function layoutTree(state: TreeState): TreeLayout {
  const byId = new Map(state.nodes.map((n) => [n.id, n]));
  const cell = new Map<number, { col: number; depth: number }>();
  let col = 0;
  let depth = 0;
  const place = (id: number | null, d: number) => {
    if (id === null || cell.has(id)) return;
    const n = byId.get(id);
    if (!n) return;
    place(n.left, d + 1);
    cell.set(id, { col, depth: d });
    col++;
    depth = Math.max(depth, d);
    place(n.right, d + 1);
  };
  const labels: TreeLayout['labels'] = [];
  if (state.forest) {
    const gap = state.forestGap ?? 1;
    state.forest.forEach((t, i) => {
      if (i > 0 && col > 0) col += gap;
      place(t.root, 0);
      if (t.label && cell.has(t.root)) labels.push({ col: cell.get(t.root)!.col, text: t.label });
    });
  } else {
    place(state.root, 0);
  }
  return { cell, cols: Math.max(col, state.axis?.length ?? 0), depth, labels };
}

function extentOf(state: TreeState): TreeExtent {
  const lay = layoutTree(state);
  return {
    cols: lay.cols,
    depth: lay.depth,
    labelChars: Math.max(0, ...state.nodes.map((n) => (n.label ?? String(n.key)).length)),
    sub: state.nodes.some((n) => n.sub !== undefined),
    tags: state.nodes.some((n) => n.tag !== undefined),
    forestLabels: lay.labels.length > 0,
    colorKey: state.nodes.some((n) => n.color !== undefined),
    axis: (state.axis?.length ?? 0) > 0,
  };
}

function union(a: TreeExtent, b: TreeExtent | undefined): TreeExtent {
  if (!b) return a;
  return {
    cols: Math.max(a.cols, b.cols),
    depth: Math.max(a.depth, b.depth),
    labelChars: Math.max(a.labelChars, b.labelChars),
    sub: a.sub || b.sub,
    tags: a.tags || b.tags,
    forestLabels: a.forestLabels || b.forestLabels,
    colorKey: a.colorKey || b.colorKey,
    axis: a.axis || b.axis,
  };
}

/** Give every frame the extent of the whole run, so the tree keeps one size while it changes. Call it from trace(). */
export function stabilizeTree<S extends TreeState>(frames: Array<Frame<S>>): Array<Frame<S>> {
  let all: TreeExtent | undefined;
  for (const f of frames) all = union(extentOf(f.state), all);
  if (!all) return frames;
  const extent = all;
  return frames.map((f) => ({ ...f, state: { ...f.state, extent } }));
}

/** Pixel geometry of a stabilized run: compact rows, wider columns for long labels, bands for the key, tags and the axis. */
function geometry(ext: TreeExtent, badgeLabel: boolean) {
  const pill = ext.labelChars > 3;
  const nodeW = pill ? Math.max(2 * R, ext.labelChars * 7.6 + 14) : 2 * R;
  const dx = Math.max(pill ? nodeW + 10 : DX, ext.sub ? 52 : 0);
  const deep = ext.depth >= 7;
  const dy = 2 * R + (deep ? 14 : 22) + (ext.sub ? 14 : 0) + (ext.tags ? 12 : 0);
  const padX = 22;
  const band = (ext.colorKey || badgeLabel ? 24 : 0) + (ext.forestLabels ? 18 : 0);
  const top = 14 + band + (ext.tags ? 14 : 0) + R;
  const treeBottom = top + ext.depth * dy + R + (ext.sub ? 16 : 0);
  const axisTop = treeBottom + 16;
  const height = (ext.axis ? axisTop + 46 : treeBottom) + 12;
  const width = Math.max(padX * 2 + Math.max(ext.cols, 1) * dx, 260);
  return {
    pill,
    nodeW,
    width,
    height,
    axisTop,
    labelY: 14 + (ext.colorKey || badgeLabel ? 24 : 0) + 8,
    at: (col: number, depth: number): Pt => ({ x: padX + col * dx + dx / 2, y: top + depth * dy }),
    colX: (col: number) => padX + col * dx + dx / 2,
  };
}

function legacyGeometry(lay: TreeLayout) {
  const width = Math.max(PAD * 2 + Math.max(lay.cols, 1) * DX, 260);
  return {
    pill: false,
    nodeW: 2 * R,
    width,
    height: PAD * 2 + 10 + (lay.depth + 1) * DY,
    axisTop: PAD * 2 + 10 + (lay.depth + 1) * DY,
    labelY: 16,
    at: (col: number, depth: number): Pt => ({ x: PAD + col * DX + R, y: PAD + 10 + depth * DY + R }),
    colX: (col: number) => PAD + col * DX + R,
  };
}

function describe(state: TreeState, lay: TreeLayout): string {
  const drawn = state.nodes.filter((n) => lay.cell.has(n.id));
  if (!state.forest || state.forest.length < 2) return `Tree with ${state.nodes.length} keys`;
  return `${state.forest.length} trees with ${drawn.length} ${drawn.length === 1 ? 'node' : 'nodes'}`;
}

/** A pill-shaped node for long labels (intervals), with the same role colours as NodeGlyph. */
function PillGlyph({ p, w, label, role, outlined }: { p: Pt; w: number; label: string; role: Role; outlined?: boolean }) {
  const glyph = role === 'good' ? SYM.check : role === 'bad' ? SYM.cross : null;
  return (
    <g className={`t-pill role-${role}${outlined ? ' outlined' : ''}`}>
      <rect x={p.x - w / 2} y={p.y - 15} width={w} height={30} rx={15} />
      <text className="t-pill-label" x={p.x} y={p.y}>
        {label}
      </text>
      {glyph && (
        <text className="t-mark" x={p.x - w / 2 - 3} y={p.y - 15} style={{ textAnchor: 'end' }}>
          {glyph}
        </text>
      )}
    </g>
  );
}

/** A red-black node: black is a dark disc, red a light disc with a thick red ring; the role is a halo around it. */
function ColorGlyph({ p, label, color, role }: { p: Pt; label: string; color: 'red' | 'black'; role: Role }) {
  const glyph = role === 'good' ? SYM.check : role === 'bad' ? SYM.cross : null;
  return (
    <g className={`t-rb t-rb-${color} role-${role}`}>
      {role !== 'idle' && <circle className="t-rb-halo" cx={p.x} cy={p.y} r={R + 5} />}
      <circle className="t-rb-body" cx={p.x} cy={p.y} r={R} />
      <text className="t-rb-label" x={p.x} y={p.y}>
        {label}
      </text>
      <text className="t-rb-mark" x={p.x + R - 1} y={p.y + R - 1}>
        {color === 'black' ? 'B' : 'R'}
      </text>
      {glyph && (
        <text className="t-mark" x={p.x - R - 6} y={p.y - R + 2} style={{ textAnchor: 'end' }}>
          {glyph}
        </text>
      )}
    </g>
  );
}

/**
 * Organism: a binary tree laid out by in-order position; nodes glide when the shape changes.
 * Optional extras: several trees side by side, a second line and a tag per node, red-black
 * colours, edge roles, a row of cells under the columns and strips under the picture.
 */
export function TreeView({ state }: { state: TreeState }) {
  const byId = new Map(state.nodes.map((n) => [n.id, n]));
  const lay = layoutTree(state);
  const g = state.extent ? geometry(union(extentOf(state), state.extent), state.badgeLabel !== undefined) : legacyGeometry(lay);
  const target = new Map<number, Pt>();
  for (const [id, c] of lay.cell) target.set(id, g.at(c.col, c.depth));
  const pos = useTween(target);

  const { width, height } = g;
  const at = (id: number) => pos.get(id) ?? target.get(id)!;
  const edgeEnd = (a: Pt, b: Pt, ra: number, rb: number) => {
    const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
    const ux = (b.x - a.x) / len;
    const uy = (b.y - a.y) / len;
    return { x1: a.x + ux * ra, y1: a.y + uy * ra, x2: b.x - ux * rb, y2: b.y - uy * rb };
  };
  const nodeR = g.pill ? 15 : R;
  const empty = target.size === 0;

  const svg = (
    <svg
      className="graph tree-view"
      viewBox={`0 0 ${width} ${height}`}
      style={{ width, maxWidth: '100%', margin: '0 auto', ...(state.extent ? { minWidth: Math.min(width, 520) } : {}) }}
      role="img"
      aria-label={describe(state, lay)}
    >
      {state.badgeLabel && (
        <text className="t-note" x={8} y={16}>
          small numbers: {state.badgeLabel}
        </text>
      )}
      {state.extent?.colorKey && !state.badgeLabel && (
        <g className="t-key" aria-label="Key: B is a black node, R is a red node">
          <g className="t-rb t-rb-black role-idle">
            <circle className="t-rb-body" cx={18} cy={17} r={9} />
          </g>
          <text className="t-note" x={32} y={21}>
            B = black node
          </text>
          <g className="t-rb t-rb-red role-idle">
            <circle className="t-rb-body" cx={140} cy={17} r={9} />
          </g>
          <text className="t-note" x={154} y={21}>
            R = red node
          </text>
        </g>
      )}
      {empty && (
        <text className="t-note" x={width / 2} y={state.extent ? Math.min(height / 2, 60) : height / 2} textAnchor="middle">
          (empty tree)
        </text>
      )}
      {lay.labels.map((l) => (
        <text key={`fl${l.col}`} className="t-forest" x={g.colX(l.col)} y={g.labelY}>
          {l.text}
        </text>
      ))}
      {state.nodes.flatMap((n) =>
        [n.left, n.right]
          .filter((c): c is number => c !== null && target.has(c) && target.has(n.id))
          .map((c) => {
            const e = edgeEnd(at(n.id), at(c), nodeR, nodeR);
            const role = byId.get(c)?.edgeRole;
            return <line key={`${n.id}-${c}`} className={`t-edge${role ? ` role-${role}` : ''}`} {...e} />;
          }),
      )}
      {state.nodes
        .filter((n) => target.has(n.id))
        .map((n) => {
          const p = at(n.id);
          const label = n.label ?? String(n.key);
          const glyph = n.color ? (
            <ColorGlyph key={n.id} p={p} label={label} color={n.color} role={n.role} />
          ) : g.pill ? (
            <PillGlyph key={n.id} p={p} w={g.nodeW} label={label} role={n.role} outlined={n.outlined} />
          ) : (
            <NodeGlyph key={n.id} x={p.x} y={p.y} r={R} label={n.label ?? n.key} role={n.role} badge={n.badge} badgePlacement="corner" outlined={n.outlined} />
          );
          const pillBadge = g.pill && n.badge !== undefined;
          // Legacy runs (BST, AVL) keep their exact markup; stabilized runs always wrap, so a tag coming and going never remounts a node.
          if (!state.extent && !pillBadge && n.sub === undefined && n.tag === undefined) return glyph;
          return (
            <g key={n.id}>
              {glyph}
              {pillBadge && (
                <text className="t-sub" x={p.x + g.nodeW / 2 + 2} y={p.y - 15} style={{ textAnchor: 'start' }}>
                  {n.badge}
                </text>
              )}
              {n.sub !== undefined && (
                <text className="t-sub" x={p.x} y={p.y + nodeR + 11}>
                  {n.sub}
                </text>
              )}
              {n.tag !== undefined && (
                <text className="t-tag" x={p.x} y={p.y - nodeR - 7}>
                  {n.tag}
                </text>
              )}
            </g>
          );
        })}
      {state.axis?.map((c, i) => {
        const x = g.colX(i);
        return (
          <g key={`ax${i}`} className={`t-cell role-${c.role ?? 'idle'}`}>
            <rect x={x - 17} y={g.axisTop} width={34} height={26} rx={5} />
            <text className="t-cell-label" x={x} y={g.axisTop + 13}>
              {c.text}
            </text>
            {c.sub !== undefined && (
              <text className="t-cell-sub" x={x} y={g.axisTop + 38}>
                {c.sub}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
  if (!state.strips?.length) return svg;
  return (
    <div className="tree-wrap">
      <div className="tree-scroll">{svg}</div>
      <Strips strips={state.strips} />
    </div>
  );
}
