import type { Role } from '../core/types';
import { NodeGlyph } from '../ui/atoms/NodeGlyph';
import { Strips, type StripData } from '../ui/molecules/Strip';
import '../ui/roles.css';
import './GraphView.css';

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

export interface GraphState {
  nodes: GraphNodeView[];
  edges: GraphEdgeView[];
  showWeights: boolean;
  /** Labelled token lists under the graph: queue, stack, priority queue, visit order. */
  strips?: StripData[];
}

const R = 20;
const WIDTH = 600;
const HEIGHT = 380;
const MARKER_ROLES: Role[] = ['idle', 'compare', 'active', 'done', 'muted'];

/** Organism: a weighted / directed graph with role-colored vertices and edges. */
export function GraphView({ state }: { state: GraphState }) {
  const pos = new Map(state.nodes.map((n) => [n.id, n]));
  const pairs = new Set(state.edges.filter((e) => e.directed).map((e) => `${e.from}>${e.to}`));
  const anyDirected = state.edges.some((e) => e.directed);

  return (
    <div>
      <svg className="graph" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label="Graph">
        {anyDirected && (
          <defs>
            {MARKER_ROLES.map((role) => (
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
              {bend ? <path d={`M${x1},${y1} Q${mx},${my} ${x2},${y2}`} markerEnd={marker} /> : <line x1={x1} y1={y1} x2={x2} y2={y2} markerEnd={marker} />}
              {state.showWeights && (
                <text className="edge-weight" x={mx - uy * 10} y={my + ux * 10 + 4} textAnchor="middle">
                  {e.weight}
                </text>
              )}
            </g>
          );
        })}
        {state.nodes.map((n) => (
          <NodeGlyph key={n.id} x={n.x} y={n.y} r={R} label={n.id} role={n.role} badge={n.badge} />
        ))}
      </svg>
      <Strips strips={state.strips} />
    </div>
  );
}
