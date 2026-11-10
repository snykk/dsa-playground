import type { Role } from '../core/types';
import { useTween, type Pt } from '../core/useTween';

export interface TreeNodeView {
  id: number;
  key: number;
  left: number | null;
  right: number | null;
  role: Role;
  badge?: string;
  outlined?: boolean;
}

export interface TreeState {
  nodes: TreeNodeView[];
  root: number | null;
  /** What the small number next to each node means (e.g. "balance factor"). */
  badgeLabel?: string;
}

const DX = 50;
const DY = 68;
const PAD = 28;
const R = 18;

export function TreeView({ state }: { state: TreeState }) {
  const byId = new Map(state.nodes.map((n) => [n.id, n]));
  const target = new Map<number, Pt>();
  let order = 0;
  let maxDepth = 0;
  const place = (id: number | null, depth: number) => {
    if (id === null) return;
    const n = byId.get(id);
    if (!n) return;
    place(n.left, depth + 1);
    target.set(id, { x: PAD + order * DX + R, y: PAD + 10 + depth * DY + R });
    order++;
    maxDepth = Math.max(maxDepth, depth);
    place(n.right, depth + 1);
  };
  place(state.root, 0);
  const pos = useTween(target);

  const width = Math.max(PAD * 2 + Math.max(order, 1) * DX, 260);
  const height = PAD * 2 + 10 + (maxDepth + 1) * DY;
  const at = (id: number) => pos.get(id) ?? target.get(id)!;

  return (
    <svg
      className="graph tree-view"
      viewBox={`0 0 ${width} ${height}`}
      style={{ width, maxWidth: '100%', margin: '0 auto' }}
      role="img"
      aria-label={`Tree with ${state.nodes.length} keys`}
    >
      {state.badgeLabel && (
        <text className="t-note" x={8} y={16}>
          small numbers: {state.badgeLabel}
        </text>
      )}
      {state.root === null && (
        <text className="t-note" x={width / 2} y={height / 2} textAnchor="middle">
          (empty tree)
        </text>
      )}
      {state.nodes.flatMap((n) =>
        [n.left, n.right]
          .filter((c): c is number => c !== null && target.has(c))
          .map((c) => {
            const a = at(n.id);
            const b = at(c);
            const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
            const ux = (b.x - a.x) / len;
            const uy = (b.y - a.y) / len;
            return <line key={`${n.id}-${c}`} className="t-edge" x1={a.x + ux * R} y1={a.y + uy * R} x2={b.x - ux * R} y2={b.y - uy * R} />;
          }),
      )}
      {state.nodes
        .filter((n) => target.has(n.id))
        .map((n) => {
          const p = at(n.id);
          const glyph = n.role === 'good' ? '\u2713' : n.role === 'bad' ? '\u2715' : null;
          return (
            <g key={n.id} className={`node role-${n.role}${n.outlined ? ' outlined' : ''}`}>
              <circle cx={p.x} cy={p.y} r={R} />
              <text className="node-label" x={p.x} y={p.y}>
                {n.key}
              </text>
              {n.badge !== undefined && (
                <text className="node-badge" x={p.x + R + 2} y={p.y - R + 2} style={{ textAnchor: 'start' }}>
                  {n.badge}
                </text>
              )}
              {glyph && (
                <text className="node-badge" x={p.x - R - 4} y={p.y - R + 2} style={{ textAnchor: 'end' }}>
                  {glyph}
                </text>
              )}
            </g>
          );
        })}
    </svg>
  );
}
