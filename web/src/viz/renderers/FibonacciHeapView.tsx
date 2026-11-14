import { useId } from 'react';
import type { Frame, Role } from '../core/types';
import { NodeGlyph } from '../ui/atoms/NodeGlyph';
import { useTween, type Pt } from '../ui/hooks/useTween';
import { Strips, type StripData } from '../ui/molecules/Strip';
import { SYM } from '../ui/symbols';
import '../ui/roles.css';
import './FibonacciHeapView.css';

export interface FibNodeView {
  /** Stable identity: a node keeps its id, so it glides when it is linked under another root or promoted. */
  id: number;
  label: string | number;
  role?: Role;
  /** Small text at the node's corner, e.g. a root's degree "d2". */
  badge?: string;
  /** Children in the order of the child ring, starting at node.child. */
  children: FibNodeView[];
}

export interface FibPointerView {
  /** min_node, node, other... */
  name: string;
  target: number;
  role?: Role;
}

export interface FibTableCell {
  degree: number;
  /** The root stored under this degree, or null. */
  id: number | null;
  label?: string;
  role?: Role;
}

/** Space a run keeps for its whole length, so the picture does not resize between steps. */
export interface FibExtent {
  units: number;
  depth: number;
  lines: number;
  table: number;
  floating: boolean;
}

export interface FibHeapState {
  /** The root list in drawing order: a circular doubly linked list, drawn as a row with a wrap-around link. */
  roots: FibNodeView[];
  /** Nodes outside the heap (the extracted minimum), drawn after the row with a tag. */
  floating?: Array<{ node: FibNodeView; tag: string }>;
  /** Named references above the nodes they point at. */
  pointers?: FibPointerView[];
  /** degree_table while _consolidate runs: one cell per degree. */
  table?: FibTableCell[];
  note?: string;
  strips?: StripData[];
  /** Set by stabilizeFib; never needed by a tracer. */
  extent?: FibExtent;
}

const R = 16;
const UNIT = 52;
const DY = 50;
const PAD = 12;
const LANE = 12;
const LINE = 13;
const CELL_W = 34;
const CELL_H = 26;
const TABLE_LABEL = 96;
const ROLES: Role[] = ['idle', 'compare', 'active', 'done', 'good', 'bad', 'muted'];

/** Width of a subtree in units: a leaf is one unit, a parent spans its children. */
function widthOf(n: FibNodeView): number {
  return Math.max(1, n.children.reduce((s, c) => s + widthOf(c), 0));
}

function depthOf(n: FibNodeView): number {
  return 1 + Math.max(0, ...n.children.map(depthOf));
}

function extentOf(state: FibHeapState): FibExtent {
  const stacked = new Map<number, number>();
  for (const p of state.pointers ?? []) stacked.set(p.target, (stacked.get(p.target) ?? 0) + 1);
  return {
    units: Math.max(1, state.roots.reduce((s, r) => s + widthOf(r), 0)),
    depth: Math.max(1, ...state.roots.map(depthOf)),
    lines: Math.max(0, ...stacked.values()),
    table: state.table?.length ?? 0,
    floating: (state.floating?.length ?? 0) > 0,
  };
}

function union(a: FibExtent, b: FibExtent | undefined): FibExtent {
  if (!b) return a;
  return {
    units: Math.max(a.units, b.units),
    depth: Math.max(a.depth, b.depth),
    lines: Math.max(a.lines, b.lines),
    table: Math.max(a.table, b.table),
    floating: a.floating || b.floating,
  };
}

/** Give every frame the extent of the whole run, so the forest keeps its size. Call it from trace(). */
export function stabilizeFib<S extends FibHeapState>(frames: Array<Frame<S>>): Array<Frame<S>> {
  let all: FibExtent | undefined;
  for (const f of frames) all = union(extentOf(f.state), all);
  if (!all) return frames;
  const extent = all;
  return frames.map((f) => ({ ...f, state: { ...f.state, extent } }));
}

/** Pixel geometry of a run. */
export function fibGeometry(ext: FibExtent) {
  const rootY = PAD + LANE + 12 + Math.max(1, ext.lines) * LINE + 8 + R;
  const left = PAD + 14;
  const rowW = ext.units * UNIT;
  const floatW = ext.floating ? UNIT * 1.6 : 0;
  const tableW = ext.table ? TABLE_LABEL + ext.table * (CELL_W + 4) : 0;
  const width = Math.max(left + rowW + floatW + 14 + PAD, PAD + tableW + PAD);
  const treeBottom = rootY + (ext.depth - 1) * DY + R;
  const tableY = treeBottom + 22;
  const height = ext.table ? tableY + CELL_H + 18 + PAD : treeBottom + PAD + 8;
  return {
    width,
    height,
    rootY,
    left,
    tableY,
    laneY: PAD + LANE,
    floatAt: (k: number): Pt => ({ x: left + rowW + UNIT * 0.9 + k * UNIT, y: rootY }),
    cell: (d: number): Pt => ({ x: PAD + TABLE_LABEL + d * (CELL_W + 4), y: tableY }),
  };
}

interface Placed {
  node: FibNodeView;
  at: Pt;
  parent: number | null;
}

function describe(state: FibHeapState): string {
  const tree = (n: FibNodeView): string => (n.children.length ? `${n.label}(${n.children.map(tree).join(' ')})` : String(n.label));
  return state.roots.length ? `Root list: ${state.roots.map(tree).join(', ')}` : 'Empty heap';
}

/**
 * Organism: a Fibonacci heap as its root list, a row of heap-ordered trees joined by left /
 * right links with a wrap-around link back to the first root, plus named references (min_node)
 * and, while consolidating, the degree table. Nodes keep their ids, so a link glides a whole
 * tree under its new parent and a promoted child glides up into the row.
 */
export function FibonacciHeapView({ state }: { state: FibHeapState }) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const { roots, floating = [], pointers = [], table, note, strips } = state;
  const ext = union(extentOf(state), state.extent);
  const g = fibGeometry(ext);

  const placed: Placed[] = [];
  const place = (n: FibNodeView, x0: number, depth: number, parent: number | null) => {
    const w = widthOf(n);
    placed.push({ node: n, at: { x: x0 + (w * UNIT) / 2, y: g.rootY + depth * DY }, parent });
    let x = x0;
    for (const c of n.children) {
      place(c, x, depth + 1, n.id);
      x += widthOf(c) * UNIT;
    }
  };
  let x = g.left;
  for (const r of roots) {
    place(r, x, 0, null);
    x += widthOf(r) * UNIT;
  }
  floating.forEach((f, k) => placed.push({ node: f.node, at: g.floatAt(k), parent: null }));

  const target = new Map<number, Pt>();
  for (const p of placed) target.set(p.node.id, p.at);
  const pos = useTween(target);
  const at = (id: number): Pt => pos.get(id) ?? target.get(id)!;
  const marker = (role: Role) => `url(#${uid}-fh-${role})`;

  const rootPts = roots.map((r) => at(r.id));
  const stacked = new Map<number, number>();

  return (
    <div className="fib-wrap">
      <svg className="fib-view" viewBox={`0 0 ${g.width} ${g.height}`} style={{ width: g.width, maxWidth: '100%', minWidth: Math.min(g.width, 480) }} role="img" aria-label={describe(state)}>
        <defs>
          {ROLES.map((role) => (
            <marker
              key={role}
              id={`${uid}-fh-${role}`}
              className={`role-${role}`}
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerUnits="userSpaceOnUse"
              markerWidth="8"
              markerHeight="8"
              orient="auto-start-reverse"
            >
              <path d="M0,0 L10,5 L0,10 z" style={{ fill: role === 'idle' || role === 'muted' ? 'var(--axis)' : 'var(--role)' }} />
            </marker>
          ))}
        </defs>
        {/* The root list: left / right links between neighbours, and the wrap-around link. */}
        {rootPts.slice(1).map((b, i) => {
          const a = rootPts[i];
          return <line key={`r${i}`} className="fh-ring" x1={a.x + R + 2} y1={a.y} x2={b.x - R - 2} y2={b.y} markerStart={marker('idle')} markerEnd={marker('idle')} />;
        })}
        {rootPts.length > 0 && (
          <path
            className="fh-wrap"
            d={(() => {
              const a = rootPts[rootPts.length - 1];
              const b = rootPts[0];
              const xr = a.x + R + 10;
              const xl = b.x - R - 10;
              return `M ${a.x + R + 2} ${a.y} L ${xr} ${a.y} L ${xr} ${g.laneY} L ${xl} ${g.laneY} L ${xl} ${b.y} L ${b.x - R - 2} ${b.y}`;
            })()}
            markerEnd={marker('idle')}
          />
        )}
        {/* Parent-child edges. */}
        {placed
          .filter((p) => p.parent !== null)
          .map((p) => {
            const a = at(p.parent!);
            const b = at(p.node.id);
            const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
            const ux = (b.x - a.x) / len;
            const uy = (b.y - a.y) / len;
            const role = p.node.role ?? 'idle';
            return (
              <line
                key={`e${p.node.id}`}
                className={`fh-edge role-${role}`}
                x1={a.x + ux * R}
                y1={a.y + uy * R}
                x2={b.x - ux * R}
                y2={b.y - uy * R}
              />
            );
          })}
        {placed.map((p) => {
          const q = at(p.node.id);
          return <NodeGlyph key={`n${p.node.id}`} x={q.x} y={q.y} r={R} label={p.node.label} role={p.node.role ?? 'idle'} badge={p.node.badge} badgePlacement="corner" />;
        })}
        {floating.map((f, k) => {
          const q = at(f.node.id);
          return (
            <text key={`tag${k}`} className="fh-tag" x={q.x} y={q.y - R - 10}>
              {f.tag}
            </text>
          );
        })}
        {pointers.map((p) => {
          if (!target.has(p.target)) return null;
          const q = at(p.target);
          const k = stacked.get(p.target) ?? 0;
          stacked.set(p.target, k + 1);
          const y = q.y - R - 10 - k * LINE;
          return (
            <text key={`p:${p.name}`} className={`fh-ptr role-${p.role ?? 'idle'}`} x={q.x} y={y}>
              {k === 0 ? `${p.name} ${String.fromCodePoint(0x2193)}` : p.name}
            </text>
          );
        })}
        {table && (
          <g className="fh-table">
            <text className="fh-table-label" x={PAD} y={g.tableY + CELL_H / 2}>
              degree_table
            </text>
            {table.map((c) => {
              const p = g.cell(c.degree);
              const role = c.role ?? 'idle';
              const filled = c.id !== null;
              return (
                <g key={`c${c.degree}`} className={`fh-cell role-${role}${filled ? ' filled' : ''}`}>
                  <rect x={p.x} y={p.y} width={CELL_W} height={CELL_H} rx={5} />
                  <text className="fh-cell-label" x={p.x + CELL_W / 2} y={p.y + CELL_H / 2}>
                    {filled ? c.label : SYM.middot}
                  </text>
                  <text className="fh-index" x={p.x + CELL_W / 2} y={p.y + CELL_H + 10}>
                    {c.degree}
                  </text>
                </g>
              );
            })}
          </g>
        )}
      </svg>
      {note && <p className="fib-note">{note}</p>}
      <Strips strips={strips} />
    </div>
  );
}
