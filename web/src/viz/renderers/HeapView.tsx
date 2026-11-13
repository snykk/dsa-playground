import type { Frame, Role } from '../core/types';
import { NodeGlyph } from '../ui/atoms/NodeGlyph';
import { useTween, type Pt } from '../ui/hooks/useTween';
import { Strips, type StripData } from '../ui/molecules/Strip';
import { SYM } from '../ui/symbols';
import '../ui/roles.css';
import './HeapView.css';

export type HeapId = number | string;

export interface HeapNodeView {
  /** Stable identity: an entry keeps its id across frames, so it glides when a sift moves it. */
  id: HeapId;
  /** The key: drawn in the tree node and in the array cell. */
  label: string | number;
  /** Small text at the node's corner and over the cell, e.g. an insertion counter "#3". */
  badge?: string;
  /** Second line of the array cell, e.g. the item stored with the key. */
  sub?: string;
  role?: Role;
}

export interface HeapFloatView {
  node: HeapNodeView;
  /** Top corner of the tree where it waits: "right" (default), e.g. an entry that just left the heap. */
  side?: 'left' | 'right';
  /** Label over it, e.g. "returned". */
  tag: string;
}

export interface HeapMarkerView {
  /** Array index the marker points at; past the end of the array it marks a slot that does not exist (dashed). */
  index: number;
  name: string;
  role?: Role;
}

/** Space a run keeps for its whole length, so the picture does not resize between steps. */
export interface HeapExtent {
  slots: number;
  markerLines: number;
  subs: boolean;
}

export interface HeapState {
  /** The heap array in index order; null is a hole (a slot whose entry has moved out during a sift). */
  slots: Array<HeapNodeView | null>;
  /** Entries outside the array, drawn in a top corner of the tree. */
  floating?: HeapFloatView[];
  /** Tree edges to highlight, keyed by the child's index (the edge from parent (i - 1) // 2 to i). */
  edgeRoles?: Record<number, Role>;
  /** Named indices under the array cells: i, parent, child... */
  markers?: HeapMarkerView[];
  note?: string;
  strips?: StripData[];
  /** Set by stabilizeHeap; never needed by a tracer. */
  extent?: HeapExtent;
}

const R = 17;
const SPAN = 58;
const DY = 60;
const TOP = 30;
const PAD = 10;
const CW = 40;
const STEP = 44;
const LINE = 13;
const UP = String.fromCodePoint(0x2191);

/** Depth of array index i in a complete binary tree (the root is depth 0). */
export function heapDepth(i: number): number {
  return Math.floor(Math.log2(i + 1));
}

export function heapParent(i: number): number {
  return (i - 1) >> 1;
}

function extentOf(state: HeapState): HeapExtent {
  const stacked = new Map<number, number>();
  for (const m of state.markers ?? []) stacked.set(m.index, (stacked.get(m.index) ?? 0) + 1);
  return {
    slots: Math.max(1, state.slots.length, ...(state.markers ?? []).map((m) => m.index + 1)),
    markerLines: Math.max(0, ...stacked.values()),
    subs: state.slots.some((s) => s?.sub !== undefined),
  };
}

function union(a: HeapExtent, b: HeapExtent | undefined): HeapExtent {
  if (!b) return a;
  return { slots: Math.max(a.slots, b.slots), markerLines: Math.max(a.markerLines, b.markerLines), subs: a.subs || b.subs };
}

/** Give every frame the extent of the whole run, so the tree and the array keep their size. Call it from trace(). */
export function stabilizeHeap<S extends HeapState>(frames: Array<Frame<S>>): Array<Frame<S>> {
  let all: HeapExtent | undefined;
  for (const f of frames) all = union(extentOf(f.state), all);
  if (!all) return frames;
  const extent = all;
  return frames.map((f) => ({ ...f, state: { ...f.state, extent } }));
}

/** Pixel geometry of a run: tree positions by index, the corner spots and the array row. */
export function heapGeometry(ext: HeapExtent) {
  const depth = heapDepth(ext.slots - 1);
  const treeW = Math.max(4, 2 ** depth) * SPAN;
  const width = Math.max(treeW + 2 * PAD, ext.slots * STEP - (STEP - CW) + 2 * PAD);
  const treeX = (width - treeW) / 2;
  const cellH = ext.subs ? 40 : 32;
  const rowTop = TOP + R + depth * DY + R + 28;
  const zone = rowTop + cellH + 27;
  const arrX = (width - (ext.slots * STEP - (STEP - CW))) / 2;
  return {
    width,
    height: ext.markerLines > 0 ? zone + 12 + (ext.markerLines - 1) * LINE + PAD : rowTop + cellH + 22,
    cellH,
    rowTop,
    zone,
    node: (i: number): Pt => {
      const d = heapDepth(i);
      const k = i + 1 - 2 ** d;
      return { x: treeX + ((k + 0.5) * treeW) / 2 ** d, y: TOP + R + d * DY };
    },
    corner: (side: 'left' | 'right'): Pt => ({ x: side === 'left' ? treeX + SPAN / 2 : treeX + treeW - SPAN / 2, y: TOP + R }),
    cell: (i: number): Pt => ({ x: arrX + i * STEP, y: rowTop }),
  };
}

function describe(state: HeapState): string {
  const entries = state.slots.map((s) => (s ? `${s.label}${s.sub ? ` ${s.sub}` : ''}` : 'hole'));
  return `Heap array: ${entries.join(', ') || 'empty'}`;
}

/**
 * Organism: a binary heap shown twice, as a complete binary tree (children of i at 2i + 1
 * and 2i + 2) and as the array that stores it. Entries keep their id, so a sift-up or a
 * sift-down swap glides in both pictures at once. Entries that leave the heap wait in a
 * top corner of the tree. Tree nodes are NodeGlyph atoms.
 */
export function HeapView({ state }: { state: HeapState }) {
  const { slots, floating = [], edgeRoles = {}, markers = [], note, strips } = state;
  const ext = union(extentOf(state), state.extent);
  const g = heapGeometry(ext);

  const target = new Map<string, Pt>();
  slots.forEach((s, i) => {
    if (!s) return;
    target.set(`t:${s.id}`, g.node(i));
    target.set(`a:${s.id}`, g.cell(i));
  });
  const corners = new Map<string, number>();
  const floats = floating.map((f) => {
    const side = f.side ?? 'right';
    const k = corners.get(side) ?? 0;
    corners.set(side, k + 1);
    const c = g.corner(side);
    target.set(`t:${f.node.id}`, { x: c.x + (side === 'left' ? k : -k) * SPAN, y: c.y });
    return f;
  });
  const pos = useTween(target);
  const at = (key: string): Pt => pos.get(key) ?? target.get(key)!;
  const stacked = new Map<number, number>();
  const missing = [...new Set(markers.map((m) => m.index).filter((i) => i >= slots.length))];

  return (
    <div className="heap-wrap">
      <svg
        className="heap-view"
        viewBox={`0 0 ${g.width} ${g.height}`}
        style={{ width: g.width, maxWidth: '100%' }}
        role="img"
        aria-label={describe(state)}
      >
        {slots.map((_, i) => {
          if (i === 0) return null;
          const a = g.node(heapParent(i));
          const b = g.node(i);
          const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
          const ux = (b.x - a.x) / len;
          const uy = (b.y - a.y) / len;
          return (
            <line
              key={`e${i}`}
              className={`h-edge role-${edgeRoles[i] ?? 'idle'}`}
              x1={a.x + ux * R}
              y1={a.y + uy * R}
              x2={b.x - ux * R}
              y2={b.y - uy * R}
            />
          );
        })}
        {slots.map((s, i) => {
          if (s) return null;
          const p = g.node(i);
          return <circle key={`h${i}`} className="h-hole" cx={p.x} cy={p.y} r={R} />;
        })}
        {missing.map((i) => {
          const p = g.node(i);
          const c = g.cell(i);
          return (
            <g key={`x${i}`}>
              <circle className="h-hole" cx={p.x} cy={p.y} r={R} />
              <rect className="h-frame hole" x={c.x} y={c.y} width={CW} height={g.cellH} rx={6} />
              <text className="h-index" x={c.x + CW / 2} y={c.y + g.cellH + 11}>
                {i}
              </text>
            </g>
          );
        })}
        {slots.map((s) => {
          if (!s) return null;
          const p = at(`t:${s.id}`);
          return <NodeGlyph key={`t:${s.id}`} x={p.x} y={p.y} r={R} label={s.label} role={s.role ?? 'idle'} badge={s.badge} badgePlacement="corner" />;
        })}
        {floats.map((f) => {
          const p = at(`t:${f.node.id}`);
          return (
            <g key={`t:${f.node.id}`}>
              <text className="h-tag" x={p.x} y={p.y - R - 9}>
                {f.tag}
              </text>
              <NodeGlyph x={p.x} y={p.y} r={R} label={f.node.label} role={f.node.role ?? 'idle'} badge={f.node.badge} badgePlacement="corner" />
            </g>
          );
        })}
        {slots.map((s, i) => {
          const c = g.cell(i);
          return (
            <g key={`f${i}`}>
              <rect className={`h-frame${s ? '' : ' hole'}`} x={c.x} y={c.y} width={CW} height={g.cellH} rx={6} />
              <text className="h-index" x={c.x + CW / 2} y={c.y + g.cellH + 11}>
                {i}
              </text>
            </g>
          );
        })}
        {slots.map((s) => {
          if (!s) return null;
          const c = at(`a:${s.id}`);
          const role = s.role ?? 'idle';
          const glyph = role === 'good' ? SYM.check : role === 'bad' ? SYM.cross : null;
          return (
            <g key={`a:${s.id}`} className={`h-cell role-${role}`}>
              <rect x={c.x} y={c.y} width={CW} height={g.cellH} rx={6} />
              <text className="h-label" x={c.x + CW / 2} y={c.y + (s.sub !== undefined ? 14 : g.cellH / 2)}>
                {s.label}
              </text>
              {s.sub !== undefined && (
                <text className="h-sub" x={c.x + CW / 2} y={c.y + 30}>
                  {s.sub}
                </text>
              )}
              {s.badge !== undefined && (
                <text className="h-badge" x={c.x + CW / 2} y={c.y - 7}>
                  {s.badge}
                </text>
              )}
              {glyph && (
                <text className="h-badge" x={c.x + CW + 2} y={c.y + 2} style={{ textAnchor: 'start' }}>
                  {glyph}
                </text>
              )}
            </g>
          );
        })}
        {markers.map((m) => {
          const k = stacked.get(m.index) ?? 0;
          stacked.set(m.index, k + 1);
          const c = g.cell(m.index);
          const x = c.x + CW / 2;
          return (
            <g key={`m:${m.name}`} className={`h-marker role-${m.role ?? 'idle'}`}>
              {k === 0 && <text x={x} y={g.zone}>{UP}</text>}
              <text x={x} y={g.zone + 12 + k * LINE}>
                {m.name}
              </text>
            </g>
          );
        })}
      </svg>
      {note && <p className="heap-note">{note}</p>}
      <Strips strips={strips} />
    </div>
  );
}
