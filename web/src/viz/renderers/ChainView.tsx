import { useId } from 'react';
import type { Frame, Role } from '../core/types';
import { useTween, type Pt } from '../ui/hooks/useTween';
import { Strips, type StripData } from '../ui/molecules/Strip';
import { SYM } from '../ui/symbols';
import '../ui/roles.css';
import './ChainView.css';

export type ChainId = number | string;

export interface ChainNodeView {
  /** Stable identity: a node keeps its id across frames, so it glides when it moves. */
  id: ChainId;
  /** Text in the box: a value, or "key:value". */
  label: string | number;
  /** Column on the grid, 0 first. Fractions are allowed. */
  col: number;
  /** Row on the grid, 0 first. A fraction (0.8, -0.8) lifts a node off its row, e.g. while it is linked in or out. */
  row?: number;
  role?: Role;
  /** Small text at the top-right corner, e.g. "f=2". */
  badge?: string;
  /** "node" (default) is a list node; "slot" is an array cell or a bucket that points into a chain. */
  shape?: 'node' | 'slot';
  /** Dashed outline: a sentinel (dummy) node that holds no value. */
  sentinel?: boolean;
  /** Faded: no longer reachable, drawn for one more step so the reader sees it leave. */
  ghost?: boolean;
}

export interface ChainLinkView {
  from: ChainId;
  /** The node pointed to, or null for a null pointer, drawn as a short arrow to "None". */
  to: ChainId | null;
  /**
   * "next" (default) leaves the right edge and "prev" the left edge. When a frame has both
   * kinds, next arrows run above the middle of the box and prev arrows below it.
   */
  kind?: 'next' | 'prev';
  role?: Role;
}

export interface ChainPointerView {
  /** Variable name: head, tail, top, front, rear, curr, prev, new... */
  name: string;
  /** The node it points to, or null (then it is listed as "name = None" under the picture, in its role's colour). */
  target: ChainId | null;
  role?: Role;
  /** Where the label sits; default "above". */
  side?: 'above' | 'below';
}

export interface ChainLaneView {
  row: number;
  label: string;
  role?: Role;
}

/** Space a run keeps for its whole length, so the picture does not resize between steps. */
export interface ChainExtent {
  cols: number;
  minRow: number;
  maxRow: number;
  chars: number;
  nullLeft: boolean;
  nullRight: boolean;
  lanes: boolean;
  /** Most pointer labels stacked on one node, above and below. */
  linesAbove: number;
  linesBelow: number;
  arcAbove: boolean;
  arcBelow: boolean;
  badges: boolean;
  /** Rows need room between them: pointers, arcs or lifted nodes. */
  spacious: boolean;
}

export interface ChainState {
  nodes: ChainNodeView[];
  links: ChainLinkView[];
  pointers?: ChainPointerView[];
  /** Labels in front of each row: bucket indices, frequencies, skip-list levels. */
  lanes?: ChainLaneView[];
  /** One line under the picture saying what the arrows mean. */
  note?: string;
  strips?: StripData[];
  /** Set by stabilizeChain; never needed by a tracer. */
  extent?: ChainExtent;
}

const H = 32;
/** Box height of a compact table (labelled rows with nothing between them, e.g. hash buckets). */
const H_COMPACT = 26;
const GAP = 40;
const PAD = 12;
const NULL_W = 46;
const LANE_W = 74;
const LABEL_LINE = 13;
const POINTER_ARROW = 14;
const ARC = 30;
const ARROW_ROLES: Role[] = ['idle', 'compare', 'active', 'done', 'good', 'bad', 'muted'];
/** How far two links between the same pair of nodes (next one way, prev back) sit apart. */
const LANE_OFFSET = 4;

type Route = 'straight' | 'back' | 'arc-above' | 'arc-below' | 'loop' | 'cross';

/** How a link between two nodes is drawn. */
function routeOf(a: ChainNodeView, b: ChainNodeView, prev: boolean, nodes: ChainNodeView[]): Route {
  if (a.id === b.id) return 'loop';
  const ra = a.row ?? 0;
  if (Math.abs(ra - (b.row ?? 0)) > 0.01) return 'cross';
  const lo = Math.min(a.col, b.col) + 0.01;
  const hi = Math.max(a.col, b.col) - 0.01;
  const blocked = nodes.some((n) => !n.ghost && Math.abs((n.row ?? 0) - ra) < 0.01 && n.col > lo && n.col < hi);
  const forward = b.col > a.col;
  if (forward && !blocked) return 'straight';
  if (!forward && !blocked && prev) return 'back';
  return forward ? 'arc-above' : 'arc-below';
}

function extentOf(state: ChainState): ChainExtent {
  const { nodes, links, pointers = [] } = state;
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const rows = nodes.map((n) => n.row ?? 0);
  const stacks = new Map<string, number>();
  for (const p of pointers) {
    if (p.target === null || !byId.has(p.target)) continue;
    const key = `${String(p.target)}|${p.side ?? 'above'}`;
    stacks.set(key, (stacks.get(key) ?? 0) + 1);
  }
  const lines = (side: string) => Math.max(0, ...[...stacks].filter(([k]) => k.endsWith(`|${side}`)).map(([, v]) => v));
  const routes = links.flatMap((l) => {
    const a = byId.get(l.from);
    const b = l.to === null ? undefined : byId.get(l.to);
    return a && b ? [routeOf(a, b, l.kind === 'prev', nodes)] : [];
  });
  const arcAbove = routes.includes('arc-above');
  const arcBelow = routes.includes('arc-below') || routes.includes('loop');
  return {
    cols: nodes.reduce((m, n) => Math.max(m, n.col + 1), 1),
    minRow: rows.length ? Math.min(0, ...rows) : 0,
    maxRow: rows.length ? Math.max(0, ...rows) : 0,
    chars: nodes.reduce((m, n) => Math.max(m, String(n.label).length), 1),
    nullLeft: links.some((l) => l.to === null && l.kind === 'prev' && byId.has(l.from)),
    nullRight: links.some((l) => l.to === null && l.kind !== 'prev' && byId.has(l.from)),
    lanes: (state.lanes?.length ?? 0) > 0,
    linesAbove: lines('above'),
    linesBelow: lines('below'),
    arcAbove,
    arcBelow,
    badges: nodes.some((n) => n.badge !== undefined),
    spacious: stacks.size > 0 || arcAbove || arcBelow || rows.some((r) => !Number.isInteger(r)),
  };
}

function union(a: ChainExtent, b: ChainExtent | undefined): ChainExtent {
  if (!b) return a;
  return {
    cols: Math.max(a.cols, b.cols),
    minRow: Math.min(a.minRow, b.minRow),
    maxRow: Math.max(a.maxRow, b.maxRow),
    chars: Math.max(a.chars, b.chars),
    nullLeft: a.nullLeft || b.nullLeft,
    nullRight: a.nullRight || b.nullRight,
    lanes: a.lanes || b.lanes,
    linesAbove: Math.max(a.linesAbove, b.linesAbove),
    linesBelow: Math.max(a.linesBelow, b.linesBelow),
    arcAbove: a.arcAbove || b.arcAbove,
    arcBelow: a.arcBelow || b.arcBelow,
    badges: a.badges || b.badges,
    spacious: a.spacious || b.spacious,
  };
}

/**
 * Give every frame of a run the same extent (columns, rows, label width, room for labels),
 * so the picture keeps its size while the structure grows and shrinks. Call it from the
 * spec's trace().
 */
export function stabilizeChain<S extends ChainState>(frames: Array<Frame<S>>): Array<Frame<S>> {
  let all: ChainExtent | undefined;
  for (const f of frames) all = union(extentOf(f.state), all);
  if (!all) return frames;
  const extent = all;
  return frames.map((f) => ({ ...f, state: { ...f.state, extent } }));
}

/** Where the ray from a box center towards `to` leaves the box. */
function boxEdge(c: Pt, to: Pt, w: number, h: number): Pt {
  const dx = to.x - c.x;
  const dy = to.y - c.y;
  if (dx === 0 && dy === 0) return c;
  const t = Math.min(dx !== 0 ? w / 2 / Math.abs(dx) : Infinity, dy !== 0 ? h / 2 / Math.abs(dy) : Infinity);
  return { x: c.x + dx * t, y: c.y + dy * t };
}

/** Pull the end of a segment back so the arrowhead does not overlap the box border. */
function shorten(a: Pt, b: Pt, by: number): Pt {
  const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
  return { x: b.x - ((b.x - a.x) / len) * by, y: b.y - ((b.y - a.y) / len) * by };
}

function describe(state: ChainState): string {
  const byRow = new Map<number, ChainNodeView[]>();
  for (const n of state.nodes) {
    if (n.ghost) continue;
    const r = Math.round(n.row ?? 0);
    byRow.set(r, [...(byRow.get(r) ?? []), n]);
  }
  const lane = new Map((state.lanes ?? []).map((l) => [l.row, l.label]));
  const rows = [...byRow.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([r, ns]) => {
      const text = ns
        .sort((a, b) => a.col - b.col)
        .map((n) => (n.sentinel ? 'sentinel' : String(n.label)))
        .join(', ');
      return lane.has(r) ? `${lane.get(r)}: ${text}` : text;
    });
  return rows.length ? `Linked nodes: ${rows.join('; ')}` : 'No nodes';
}

/**
 * Organism: linked nodes and the references into them. Each node is a box at a grid
 * position (column, row); arrows are its pointers; named references (head, tail, top,
 * curr...) label the node they point at. Nodes and labels glide when a step relinks or
 * moves them, so an insertion visibly makes room and a deletion visibly closes the gap.
 * Rows serve multi-list structures: hash buckets and their chains, LFU frequency lists,
 * skip-list levels.
 */
export function ChainView({ state }: { state: ChainState }) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const { nodes, links, pointers = [], lanes = [], note, strips } = state;
  const ext = union(extentOf(state), state.extent);
  const w = Math.max(40, Math.round(16 + ext.chars * 8.6));
  // Labelled rows with nothing between them (hash buckets, frequency lists) pack tighter, so a
  // 16-bucket table still fits the stage.
  const compact = ext.lanes && !ext.spacious;
  const h = compact ? H_COMPACT : H;
  const dx = w + GAP;
  const above = Math.max(
    6,
    ext.linesAbove > 0 ? POINTER_ARROW + 8 + ext.linesAbove * LABEL_LINE : 0,
    ext.arcAbove ? ARC + 4 : 0,
    ext.badges ? 14 : 0,
  );
  const below = Math.max(6, ext.linesBelow > 0 ? POINTER_ARROW + 8 + ext.linesBelow * LABEL_LINE : 0, ext.arcBelow ? ARC + 6 : 0);
  const dy = h + (ext.spacious ? Math.max(56, above + below) : compact ? 4 : 22);
  const left = PAD + (ext.lanes ? LANE_W : 0) + (ext.nullLeft ? NULL_W : 0);
  const top = PAD + above;
  const width = left + (ext.cols - 1) * dx + w + (ext.nullRight ? NULL_W : 0) + (ext.badges ? 30 : 0) + PAD;
  const height = top + (ext.maxRow - ext.minRow) * dy + h + below + PAD;
  const cx = (col: number) => left + col * dx + w / 2;
  const cy = (row: number) => top + (row - ext.minRow) * dy + h / 2;

  const target = new Map<string, Pt>();
  for (const n of nodes) target.set(`n:${n.id}`, { x: cx(n.col), y: cy(n.row ?? 0) });

  // Pointer labels: stacked per (node, side), nearest first; they glide like the nodes.
  const placed = new Map<string, number>();
  const labels: Array<{ p: ChainPointerView; index: number; side: 'above' | 'below' }> = [];
  for (const p of pointers) {
    if (p.target === null) continue;
    const base = target.get(`n:${p.target}`);
    if (!base) continue;
    const side = p.side ?? 'above';
    const key = `${String(p.target)}|${side}`;
    const index = placed.get(key) ?? 0;
    placed.set(key, index + 1);
    const y =
      side === 'above'
        ? base.y - h / 2 - 3 - POINTER_ARROW - 5 - index * LABEL_LINE
        : base.y + h / 2 + 3 + POINTER_ARROW + 14 + index * LABEL_LINE;
    target.set(`p:${p.name}`, { x: base.x, y });
    labels.push({ p, index, side });
  }

  const pos = useTween(target);
  const at = (key: string): Pt => pos.get(key) ?? target.get(key)!;
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const hasPrev = links.some((l) => l.kind === 'prev' && l.to !== null);
  const marker = (role: Role | undefined) => `url(#${uid}-arrow-${role && ARROW_ROLES.includes(role) ? role : 'idle'})`;

  const paths = links.flatMap((l, i) => {
    const a = byId.get(l.from);
    if (!a) return [];
    const pa = at(`n:${a.id}`);
    const prev = l.kind === 'prev';
    const off = hasPrev ? (prev ? 6 : -6) : 0;
    const cls = `c-link role-${l.role ?? 'idle'}${a.ghost ? ' ghost' : ''}`;
    if (l.to === null) {
      const sx = prev ? pa.x - w / 2 : pa.x + w / 2;
      const ex = prev ? sx - 18 : sx + 18;
      return [
        <g key={`l${i}`} className={cls}>
          <line x1={sx} y1={pa.y + off} x2={ex} y2={pa.y + off} markerEnd={marker(l.role)} />
          <text className="c-null" x={prev ? ex - 4 : ex + 4} y={pa.y + off} style={{ textAnchor: prev ? 'end' : 'start' }}>
            None
          </text>
        </g>,
      ];
    }
    const b = byId.get(l.to);
    if (!b) return [];
    const pb = at(`n:${b.id}`);
    let d: string;
    switch (routeOf(a, b, prev, nodes)) {
      case 'loop': {
        // A node that points to itself (a one-node circular list): a loop under the box.
        const y0 = pa.y + h / 2;
        d = `M ${pa.x + w / 4} ${y0} C ${pa.x + w / 4 + 16} ${y0 + ARC + 4}, ${pa.x - w / 4 - 16} ${y0 + ARC + 4}, ${pa.x - w / 4} ${y0 + 3}`;
        break;
      }
      case 'straight':
        d = `M ${pa.x + w / 2} ${pa.y + off} L ${pb.x - w / 2 - 3} ${pb.y + off}`;
        break;
      case 'back':
        d = `M ${pa.x - w / 2} ${pa.y + off} L ${pb.x + w / 2 + 3} ${pb.y + off}`;
        break;
      case 'arc-above': {
        // Skipping over a node that is still in the row: arc above it.
        const y0 = pa.y - h / 2;
        d = `M ${pa.x + w / 4} ${y0} C ${pa.x + w / 4} ${y0 - ARC}, ${pb.x - w / 4} ${y0 - ARC}, ${pb.x - w / 4} ${y0 - 3}`;
        break;
      }
      case 'arc-below': {
        // Pointing back along the row (a circular list's tail to its head): arc below it.
        const y0 = pa.y + h / 2;
        const sx = prev ? pa.x - w / 4 : pa.x;
        d = `M ${sx} ${y0} C ${sx} ${y0 + ARC}, ${pb.x} ${y0 + ARC}, ${pb.x} ${y0 + 3}`;
        break;
      }
      default: {
        // Between rows (a node lifted off its row, a tower, a bucket): a straight line. When the
        // frame has prev links, each link keeps to its own side, so next and prev between the
        // same two nodes do not draw as one line.
        const s = boxEdge(pa, pb, w, h);
        const e = shorten(s, boxEdge(pb, pa, w, h), 3);
        const len = Math.hypot(e.x - s.x, e.y - s.y) || 1;
        const k = hasPrev ? LANE_OFFSET : 0;
        const nx = (-(e.y - s.y) / len) * -k;
        const ny = ((e.x - s.x) / len) * -k;
        d = `M ${s.x + nx} ${s.y + ny} L ${e.x + nx} ${e.y + ny}`;
      }
    }
    return [<path key={`l${i}`} className={cls} d={d} markerEnd={marker(l.role)} />];
  });

  const nullPointers = pointers.filter((p) => p.target === null);

  return (
    <div className="chain-view-wrap">
      <svg
        className="chain-view"
        viewBox={`0 0 ${width} ${height}`}
        style={{ width, maxWidth: '100%', minWidth: Math.min(width, 520) }}
        role="img"
        aria-label={describe(state)}
      >
        <defs>
          {ARROW_ROLES.map((role) => (
            <marker
              key={role}
              id={`${uid}-arrow-${role}`}
              className={`role-${role}`}
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerUnits="userSpaceOnUse"
              markerWidth="9"
              markerHeight="9"
              orient="auto-start-reverse"
            >
              <path d="M0,0 L10,5 L0,10 z" style={{ fill: role === 'muted' ? 'var(--axis)' : 'var(--role)' }} />
            </marker>
          ))}
        </defs>
        {lanes.map((lane) => (
          <text key={`lane${lane.row}`} className={`c-lane role-${lane.role ?? 'idle'}`} x={PAD + LANE_W - 12} y={cy(lane.row)}>
            {lane.label}
          </text>
        ))}
        {paths}
        {nodes.map((n) => {
          const p = at(`n:${n.id}`);
          const role = n.role ?? 'idle';
          const glyph = role === 'good' ? SYM.check : role === 'bad' ? SYM.cross : null;
          const cls = ['c-box', `role-${role}`, n.shape === 'slot' && 'slot', n.sentinel && 'sentinel', n.ghost && 'ghost']
            .filter(Boolean)
            .join(' ');
          return (
            <g key={`n:${n.id}`} className={cls}>
              <rect x={p.x - w / 2} y={p.y - h / 2} width={w} height={h} rx={n.shape === 'slot' ? 3 : 7} />
              <text className="c-label" x={p.x} y={p.y}>
                {n.label}
              </text>
              {n.badge !== undefined && (
                <text className="c-badge" x={p.x + w / 2 + 3} y={p.y - h / 2 - 2}>
                  {n.badge}
                </text>
              )}
              {glyph && (
                <text className="c-badge" x={p.x - w / 2 - 3} y={p.y - h / 2 - 2} style={{ textAnchor: 'end' }}>
                  {glyph}
                </text>
              )}
            </g>
          );
        })}
        {labels.map(({ p, index, side }) => {
          const q = at(`p:${p.name}`);
          const role = p.role ?? 'idle';
          const y1 = side === 'above' ? q.y + 5 : q.y - 15;
          const y2 = side === 'above' ? y1 + POINTER_ARROW : y1 - POINTER_ARROW;
          return (
            <g key={`p:${p.name}`} className={`c-ptr role-${role}`}>
              <text x={q.x} y={q.y}>
                {p.name}
              </text>
              {index === 0 && <line x1={q.x} y1={y1} x2={q.x} y2={y2} markerEnd={marker(role)} />}
            </g>
          );
        })}
      </svg>
      {(note || nullPointers.length > 0) && (
        <p className="chain-note">
          {note}
          {nullPointers.map((p, i) => (
            <span key={p.name} className={`c-null-ref role-${p.role ?? 'idle'}`}>
              {note || i > 0 ? ` ${SYM.middot} ` : ''}
              <span className="c-null-name">{p.name} = None</span>
            </span>
          ))}
        </p>
      )}
      <Strips strips={strips} />
    </div>
  );
}
