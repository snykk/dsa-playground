import type { Role } from '../core/types';
import { Cell } from '../ui/atoms/Cell';
import { NodeGlyph } from '../ui/atoms/NodeGlyph';
import { useTween, type Pt } from '../ui/hooks/useTween';
import { CellGrid, CellRow, IndexRow } from '../ui/molecules/CellRow';
import { Strips, type StripData } from '../ui/molecules/Strip';
import '../ui/roles.css';
import './ForestView.css';

export interface ForestNodeView {
  id: number;
  /** Parent pointer; a node that points to itself is a root. */
  parent: number;
  role: Role;
  badge?: string;
}

export interface ForestCellView {
  value: string | number;
  role?: Role;
}

export interface ForestState {
  /** One node per element 0..n-1, in id order. */
  nodes: ForestNodeView[];
  /** Roles for parent-pointer edges, keyed by the child's id. */
  edgeRoles?: Record<number, Role>;
  /** Arrays drawn under the forest (e.g. parent[] and rank[]), one cell per element. */
  rows?: Array<{ label: string; cells: ForestCellView[] }>;
  strips?: StripData[];
}

const R = 17;
const DX = 46;
const DY = 66;
const PAD = 20;
const TOP = 34;
const TREE_GAP = 0.5;
const ARROW_ROLES: Role[] = ['idle', 'compare', 'active', 'done'];

/** Tidy layout: leaves take consecutive slots, a parent sits centered over its children. */
function layout(nodes: ForestNodeView[]): { target: Map<number, Pt>; slots: number; depth: number } {
  const kids = new Map<number, number[]>();
  const roots: number[] = [];
  for (const n of nodes) {
    if (n.parent === n.id) roots.push(n.id);
    else kids.set(n.parent, [...(kids.get(n.parent) ?? []), n.id]);
  }
  roots.sort((a, b) => a - b);
  for (const list of kids.values()) list.sort((a, b) => a - b);

  const target = new Map<number, Pt>();
  let slot = 0;
  let depth = 0;
  const place = (id: number, d: number): number => {
    depth = Math.max(depth, d);
    // The depth guard only matters for malformed input (a parent cycle); real forests never hit it.
    const children = d < nodes.length ? (kids.get(id) ?? []) : [];
    let x: number;
    if (children.length === 0) {
      x = slot;
      slot += 1;
    } else {
      const xs = children.map((c) => place(c, d + 1));
      x = (xs[0] + xs[xs.length - 1]) / 2;
    }
    target.set(id, { x: PAD + R + x * DX, y: TOP + R + d * DY });
    return x;
  };
  roots.forEach((root, i) => {
    if (i > 0) slot += TREE_GAP;
    place(root, 0);
  });
  return { target, slots: slot, depth };
}

/**
 * Organism: a forest of parent pointers (union-find). Each node is a NodeGlyph with an
 * arrow to its parent; when a pointer changes (a union, path compression) the moved
 * nodes glide to their new place. The parent / rank arrays sit underneath as cell rows.
 */
export function ForestView({ state }: { state: ForestState }) {
  const { nodes, edgeRoles = {}, rows = [] } = state;
  const { target, slots, depth } = layout(nodes);
  const pos = useTween(target);
  const at = (id: number) => pos.get(id) ?? target.get(id)!;
  const width = Math.max(PAD * 2 + 2 * R + Math.max(slots - 1, 0) * DX, 260);
  const height = TOP + 2 * R + depth * DY + PAD;
  const roots = nodes.filter((n) => n.parent === n.id).length;

  return (
    <div>
      <svg
        className="forest-view"
        viewBox={`0 0 ${width} ${height}`}
        style={{ width, maxWidth: '100%', margin: '0 auto' }}
        role="img"
        aria-label={`Forest of ${nodes.length} elements in ${roots} ${roots === 1 ? 'set' : 'sets'}`}
      >
        <defs>
          {ARROW_ROLES.map((role) => (
            <marker
              key={role}
              id={`forest-arrow-${role}`}
              className={`role-${role}`}
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M0,0 L10,5 L0,10 z" style={{ fill: role === 'idle' ? 'var(--axis)' : 'var(--role)' }} />
            </marker>
          ))}
        </defs>
        <text className="f-note" x={8} y={16}>
          arrow: parent pointer &#xB7; r: rank (roots only)
        </text>
        {nodes
          .filter((n) => n.parent !== n.id && target.has(n.id) && target.has(n.parent))
          .map((n) => {
            const a = at(n.id);
            const b = at(n.parent);
            const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
            const ux = (b.x - a.x) / len;
            const uy = (b.y - a.y) / len;
            const role = edgeRoles[n.id] ?? 'idle';
            return (
              <line
                key={n.id}
                className={`f-edge role-${role}`}
                x1={a.x + ux * R}
                y1={a.y + uy * R}
                x2={b.x - ux * (R + 4)}
                y2={b.y - uy * (R + 4)}
                markerEnd={`url(#forest-arrow-${ARROW_ROLES.includes(role) ? role : 'idle'})`}
              />
            );
          })}
        {nodes
          .filter((n) => target.has(n.id))
          .map((n) => {
            const p = at(n.id);
            return <NodeGlyph key={n.id} x={p.x} y={p.y} r={R} label={n.id} role={n.role} badge={n.badge} badgePlacement="corner" />;
          })}
      </svg>
      {rows.length > 0 && (
        <div className="forest-arrays">
          <CellGrid label={rows.map((row) => `${row.label}: ${row.cells.map((c) => c.value).join(' ')}`).join('; ')}>
            <IndexRow count={nodes.length} label="element" />
            {rows.map((row) => (
              <CellRow key={row.label} label={row.label}>
                {row.cells.map((c, i) => (
                  <Cell key={i} value={c.value} role={c.role} />
                ))}
              </CellRow>
            ))}
          </CellGrid>
        </div>
      )}
      <Strips strips={state.strips} />
    </div>
  );
}
