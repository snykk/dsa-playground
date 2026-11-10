import type { Role } from '../core/types';

export interface GraphNodeView {
  id: string;
  x: number;
  y: number;
  role: Role;
  badge?: string;
}

export interface GraphEdgeView {
  id: number;
  from: string;
  to: string;
  directed: boolean;
  weight: number;
  role: Role;
}

export interface StripItem {
  text: string;
  role?: Role;
}

export interface GraphState {
  nodes: GraphNodeView[];
  edges: GraphEdgeView[];
  showWeights: boolean;
  /** Labelled token lists under the graph: queue, stack, priority queue, visit order. */
  strips?: Array<{ label: string; items: StripItem[] }>;
}

const R = 20;
const WIDTH = 600;
const HEIGHT = 380;

export function Strips({ strips }: { strips?: GraphState['strips'] }) {
  if (!strips?.length) return null;
  return (
    <>
      {strips.map((s) => (
        <div className="viz-strip" key={s.label}>
          <strong>{s.label}:</strong>
          {s.items.map((it, i) => (
            <span key={`${it.text}-${i}`} className={`viz-token${it.role ? ` role-${it.role}` : ''}`}>
              {it.text}
            </span>
          ))}
        </div>
      ))}
    </>
  );
}

export function GraphView({ state }: { state: GraphState }) {
  const pos = new Map(state.nodes.map((n) => [n.id, n]));
  const pairs = new Set(state.edges.filter((e) => e.directed).map((e) => `${e.from}>${e.to}`));
  const anyDirected = state.edges.some((e) => e.directed);

  return (
    <div>
      <svg className="graph" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label="Graph">
        {anyDirected && (
          <defs>
            {(['idle', 'compare', 'active', 'done', 'muted'] as Role[]).map((role) => (
              <marker
                key={role}
                id={`arrow-${role}`}
                className={`role-${role}`}
                viewBox="0 0 10 10"
                refX="9"
                refY="5"
                markerWidth="7"
                markerHeight="7"
                orient="auto-start-reverse"
              >
                <path d="M0,0 L10,5 L0,10 z" style={{ fill: role === 'idle' || role === 'muted' ? 'var(--axis)' : 'var(--role)' }} />
              </marker>
            ))}
          </defs>
        )}
        {state.edges.map((e) => {
          const a = pos.get(e.from)!;
          const b = pos.get(e.to)!;
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const len = Math.hypot(dx, dy) || 1;
          const ux = dx / len;
          const uy = dy / len;
          // Opposite directed edges bend apart so both stay visible.
          const bend = e.directed && pairs.has(`${e.to}>${e.from}`) ? 22 : 0;
          const x1 = a.x + ux * R;
          const y1 = a.y + uy * R;
          const x2 = b.x - ux * (R + (e.directed ? 4 : 0));
          const y2 = b.y - uy * (R + (e.directed ? 4 : 0));
          const mx = (a.x + b.x) / 2 - uy * bend;
          const my = (a.y + b.y) / 2 + ux * bend;
          const marker = e.directed ? `url(#arrow-${e.role})` : undefined;
          return (
            <g key={e.id} className={`edge role-${e.role}`}>
              {bend ? (
                <path d={`M${x1},${y1} Q${mx},${my} ${x2},${y2}`} markerEnd={marker} />
              ) : (
                <line x1={x1} y1={y1} x2={x2} y2={y2} markerEnd={marker} />
              )}
              {state.showWeights && (
                <text className="edge-weight" x={mx - uy * 10} y={my + ux * 10 + 4} textAnchor="middle">
                  {e.weight}
                </text>
              )}
            </g>
          );
        })}
        {state.nodes.map((n) => (
          <g key={n.id} className={`node role-${n.role}`}>
            <circle cx={n.x} cy={n.y} r={R} />
            <text className="node-label" x={n.x} y={n.y}>
              {n.id}
            </text>
            {n.badge !== undefined && (
              <text className="node-badge" x={n.x} y={n.y - R - 8}>
                {n.badge}
              </text>
            )}
          </g>
        ))}
      </svg>
      <Strips strips={state.strips} />
    </div>
  );
}
