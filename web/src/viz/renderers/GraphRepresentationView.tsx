import { useId } from 'react';
import type { Frame, Role } from '../core/types';
import { NodeGlyph } from '../ui/atoms/NodeGlyph';
import { useTween, type Pt } from '../ui/hooks/useTween';
import { Strips, type StripData } from '../ui/molecules/Strip';
import { SYM } from '../ui/symbols';
import { ChainView, stabilizeChain, type ChainState } from './ChainView';
import { Grid, type GridState } from './Grid';
import '../ui/roles.css';
import './GraphRepresentationView.css';

export interface RepVertexView {
  id: number;
  role?: Role;
}

export interface RepEdgeView {
  /** "u>v" for a directed edge, "min~max" for an undirected one. */
  key: string;
  from: number;
  to: number;
  directed: boolean;
  /** The weight as Python prints it, on weighted graphs. */
  label?: string;
  role?: Role;
}

/** One tuple of an edge list. */
export interface RepCellView {
  id: string;
  label: string;
  /** Position in the Python list. */
  index: number;
  role?: Role;
  /** Faded: just dropped by a rebuild, drawn for one step at its old place. */
  ghost?: boolean;
}

export type RepStoreView =
  | { kind: 'chain'; title: string; state: ChainState }
  | { kind: 'grid'; title: string; state: GridState }
  | { kind: 'cells'; title: string; cells: RepCellView[] };

export interface GraphRepState {
  vertices: RepVertexView[];
  edges: RepEdgeView[];
  directed: boolean;
  weighted: boolean;
  /** The representation's own storage, drawn next to the graph. */
  store: RepStoreView;
  strips?: StripData[];
  /** Set by stabilizeGraphRep: every vertex of the run, in drawing order (a fixed place each). */
  layout?: number[];
  /** Set by stabilizeGraphRep: room for the edge-list cells of the whole run. */
  cellExtent?: { count: number; chars: number };
}

const W = 300;
const H = 262;
const R = 17;
const CELL_H = 28;
const CELL_GAP = 6;
const CELL_ROW = CELL_H + 18;
const CELLS_WIDTH = 420;
const ROLES: Role[] = ['idle', 'compare', 'active', 'done', 'good', 'bad', 'muted'];

/** Box width ChainView gives a node label of `chars` characters (ChainView.tsx). */
const chainBoxWidth = (chars: number) => Math.max(40, Math.round(16 + chars * 8.6));

/**
 * Give a run one picture: a fixed place for every vertex, list entries packed side by side
 * like the cells of a Python list (ChainView spaces nodes for arrows), one ChainView extent,
 * and room for the largest edge list. Call it from the spec's trace().
 */
export function stabilizeGraphRep(frames: Array<Frame<GraphRepState>>): Array<Frame<GraphRepState>> {
  const all = new Set<number>();
  let count = 0;
  let chars = 1;
  let chainChars = 1;
  for (const f of frames) {
    for (const v of f.state.vertices) all.add(v.id);
    const s = f.state.store;
    if (s.kind === 'cells') {
      count = Math.max(count, ...s.cells.map((c) => c.index + 1));
      chars = Math.max(chars, ...s.cells.map((c) => c.label.length));
    }
    if (s.kind === 'chain') chainChars = Math.max(chainChars, ...s.state.nodes.map((n) => String(n.label).length));
  }
  const layout = [...all].sort((a, b) => a - b);
  const w = chainBoxWidth(chainChars);
  const step = (w + 4) / (w + 40);
  let out = frames.map((f) => {
    const s = f.state.store;
    const store: RepStoreView =
      s.kind === 'chain' ? { ...s, state: { ...s.state, nodes: s.state.nodes.map((n) => ({ ...n, col: n.col * step })) } } : s;
    return { ...f, state: { ...f.state, store, layout, cellExtent: { count, chars } } };
  });
  if (out.some((f) => f.state.store.kind === 'chain')) {
    const inner = stabilizeChain(out.map((f) => ({ ...f, state: (f.state.store as { state: ChainState }).state })));
    out = out.map((f, i) => ({ ...f, state: { ...f.state, store: { ...(f.state.store as { kind: 'chain'; title: string }), state: inner[i].state } } }));
  }
  return out;
}

/** Vertex centers on a circle, in layout order, starting at the top. */
export function vertexPositions(layout: number[]): Map<number, Pt> {
  const k = layout.length;
  const pos = new Map<number, Pt>();
  const cx = W / 2;
  const cy = H / 2 + 4;
  layout.forEach((v, i) => {
    if (k === 1) pos.set(v, { x: cx, y: cy });
    else if (k === 2) pos.set(v, { x: cx + (i === 0 ? -80 : 80), y: cy });
    else {
      const a = -Math.PI / 2 + (2 * Math.PI * i) / k;
      pos.set(v, { x: cx + 98 * Math.cos(a), y: cy + 98 * Math.sin(a) });
    }
  });
  return pos;
}

/** Geometry of the edge-list cells: cell width and cells per row. */
export function cellGeometry(ext: { count: number; chars: number }) {
  const cw = Math.max(44, Math.round(14 + ext.chars * 7.4));
  const perRow = Math.max(2, Math.floor((CELLS_WIDTH + CELL_GAP) / (cw + CELL_GAP)));
  const rows = Math.max(1, Math.ceil(ext.count / perRow));
  return {
    cw,
    perRow,
    width: Math.min(ext.count, perRow) * (cw + CELL_GAP) - CELL_GAP + 24,
    height: rows * CELL_ROW + 16,
    at: (i: number): Pt => ({ x: 12 + (i % perRow) * (cw + CELL_GAP), y: 8 + Math.floor(i / perRow) * CELL_ROW }),
  };
}

const glyphOf = (role: Role | undefined) => (role === 'good' ? SYM.check : role === 'bad' ? SYM.cross : null);

function GraphPicture({ state }: { state: GraphRepState }) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const layout = state.layout ?? [...state.vertices.map((v) => v.id)].sort((a, b) => a - b);
  const pos = vertexPositions(layout);
  const center = { x: W / 2, y: H / 2 + 4 };
  const keys = new Set(state.edges.map((e) => `${e.from}>${e.to}`));
  const marker = (role: Role) => `url(#${uid}-gr-${role})`;
  const desc = `${state.directed ? 'Directed' : 'Undirected'} graph: vertices ${state.vertices.map((v) => v.id).join(', ') || 'none'}; edges ${
    state.edges.map((e) => `${e.from}${state.directed ? '->' : '-'}${e.to}${e.label ? ` (${e.label})` : ''}`).join(', ') || 'none'
  }`;

  return (
    <svg className="gr-graph" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={desc}>
      <defs>
        {ROLES.map((role) => (
          <marker
            key={role}
            id={`${uid}-gr-${role}`}
            className={`role-${role}`}
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerUnits="userSpaceOnUse"
            markerWidth="9"
            markerHeight="9"
            orient="auto-start-reverse"
          >
            <path d="M0,0 L10,5 L0,10 z" style={{ fill: role === 'idle' || role === 'muted' ? 'var(--axis)' : 'var(--role)' }} />
          </marker>
        ))}
      </defs>
      {state.edges.map((e) => {
        const a = pos.get(e.from);
        const b = pos.get(e.to);
        if (!a || !b) return null;
        const role = e.role ?? 'idle';
        const end = e.directed ? marker(role) : undefined;
        let d: string;
        let mid: Pt;
        if (e.from === e.to) {
          // A self-loop: a small loop on the outer side of the vertex.
          let dx = a.x - center.x;
          let dy = a.y - center.y;
          const len = Math.hypot(dx, dy);
          if (len < 1) {
            dx = 0;
            dy = -1;
          } else {
            dx /= len;
            dy /= len;
          }
          const rot = (t: number, r: number): Pt => ({ x: a.x + r * (dx * Math.cos(t) - dy * Math.sin(t)), y: a.y + r * (dx * Math.sin(t) + dy * Math.cos(t)) });
          const s = rot(0.5, R);
          const t = rot(-0.5, R + 3);
          const c1 = rot(0.75, R * 3.4);
          const c2 = rot(-0.75, R * 3.4);
          d = `M ${s.x} ${s.y} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${t.x} ${t.y}`;
          mid = rot(0, R * 3.1);
        } else {
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const len = Math.hypot(dx, dy) || 1;
          const ux = dx / len;
          const uy = dy / len;
          // Opposite directed edges bend apart so both stay visible.
          const bend = e.directed && keys.has(`${e.to}>${e.from}`) ? 14 : 0;
          const px = -uy;
          const py = ux;
          const x1 = a.x + ux * R;
          const y1 = a.y + uy * R;
          const x2 = b.x - ux * (R + 2);
          const y2 = b.y - uy * (R + 2);
          const mx = (a.x + b.x) / 2;
          const my = (a.y + b.y) / 2;
          d = bend ? `M ${x1} ${y1} Q ${mx + px * 2 * bend} ${my + py * 2 * bend} ${x2} ${y2}` : `M ${x1} ${y1} L ${x2} ${y2}`;
          mid = { x: mx + px * (bend + 10), y: my + py * (bend + 10) };
        }
        const glyph = glyphOf(role);
        return (
          <g key={`${e.from}>${e.to}`} className={`gr-edge role-${role}`}>
            <path d={d} markerEnd={end} />
            {e.label !== undefined && (
              <text className="gr-weight" x={mid.x} y={mid.y}>
                {e.label}
              </text>
            )}
            {glyph && e.label === undefined && (
              <text className="gr-weight gr-glyph" x={mid.x} y={mid.y}>
                {glyph}
              </text>
            )}
          </g>
        );
      })}
      {state.vertices.map((v) => {
        const p = pos.get(v.id);
        if (!p) return null;
        return <NodeGlyph key={v.id} x={p.x} y={p.y} r={R} label={v.id} role={v.role ?? 'idle'} />;
      })}
    </svg>
  );
}

function EdgeCells({ cells, ext }: { cells: RepCellView[]; ext: { count: number; chars: number } }) {
  const g = cellGeometry(ext);
  const target = new Map<string, Pt>();
  for (const c of cells) target.set(c.id, g.at(c.index));
  const pos = useTween(target);
  const at = (id: string): Pt => pos.get(id) ?? target.get(id)!;
  const live = cells.filter((c) => !c.ghost).sort((a, b) => a.index - b.index);
  return (
    <svg
      className="gr-cells"
      viewBox={`0 0 ${Math.max(g.width, 120)} ${g.height}`}
      style={{ width: Math.max(g.width, 120), maxWidth: '100%' }}
      role="img"
      aria-label={`Edge list: ${live.map((c) => c.label).join(', ') || 'empty'}`}
    >
      {Array.from({ length: Math.max(ext.count, 1) }, (_, i) => {
        const p = g.at(i);
        return (
          <g key={`f${i}`}>
            <rect className="gr-frame" x={p.x} y={p.y} width={g.cw} height={CELL_H} rx={5} />
            <text className="gr-index" x={p.x + g.cw / 2} y={p.y + CELL_H + 9}>
              {i}
            </text>
          </g>
        );
      })}
      {cells.map((c) => {
        const p = at(c.id);
        const role = c.role ?? 'idle';
        const glyph = glyphOf(role);
        return (
          <g key={c.id} className={`gr-cell role-${role}${c.ghost ? ' ghost' : ''}`}>
            <rect x={p.x} y={p.y} width={g.cw} height={CELL_H} rx={5} />
            <text className="gr-cell-label" x={p.x + g.cw / 2} y={p.y + CELL_H / 2}>
              {c.label}
            </text>
            {glyph && (
              <text className="gr-cell-glyph" x={p.x + g.cw - 2} y={p.y + 1}>
                {glyph}
              </text>
            )}
          </g>
        );
      })}
      {cells.length === 0 && (
        <text className="gr-empty" x={12} y={8 + CELL_H / 2}>
          []
        </text>
      )}
    </svg>
  );
}

/**
 * Organism: one graph drawn as vertices and edges, next to the structure that stores it:
 * a ChainView row per vertex for a dict of lists, a Grid for a matrix, a row of tuple cells
 * for an edge list. Vertices keep a fixed place; list entries and tuples glide when a Python
 * list is rebuilt, so the reader sees what each operation touches in the stored form.
 */
export function GraphRepresentationView({ state }: { state: GraphRepState }) {
  const s = state.store;
  return (
    <div className="grep-wrap">
      <div className="grep-row">
        <figure className="grep-panel grep-graph">
          <figcaption className="grep-title">the graph</figcaption>
          <GraphPicture state={state} />
        </figure>
        <figure className="grep-panel grep-store">
          <figcaption className="grep-title">{s.title}</figcaption>
          {s.kind === 'chain' && <ChainView state={s.state} />}
          {s.kind === 'grid' && <Grid state={s.state} />}
          {s.kind === 'cells' && <EdgeCells cells={s.cells} ext={state.cellExtent ?? { count: s.cells.length, chars: Math.max(1, ...s.cells.map((c) => c.label.length)) }} />}
        </figure>
      </div>
      <Strips strips={state.strips} />
    </div>
  );
}
