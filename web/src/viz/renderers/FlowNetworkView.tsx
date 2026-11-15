import { useId } from 'react';
import type { Role } from '../core/types';
import { NodeGlyph } from '../ui/atoms/NodeGlyph';
import '../ui/roles.css';
import { ArrowMarkers, edgeShapes, ReservedStrips, type ReservedStrip } from './advancedGraphShared';
import './FlowNetworkView.css';

export interface FlowNodeView {
  id: string;
  x: number;
  y: number;
  role: Role;
  /** Above the vertex, e.g. a BFS layer "d=2". */
  badge?: string;
  /** Under the vertex: "source" or "sink". */
  tag?: string;
}

export interface FlowEdgeView {
  id: string;
  from: string;
  to: string;
  /** 'edge': an edge of the input, drawn as a pipe that fills with its flow; 'residual': a dashed reverse edge. */
  kind: 'edge' | 'residual';
  /** "flow/capacity" on an edge, the residual capacity on a reverse edge. */
  label: string;
  /** Filled share of the pipe, 0..1 (flow / capacity). */
  fill: number;
  role: Role;
  /** Not drawn yet (a reverse edge with nothing to cancel); it keeps its place so nothing moves when it appears. */
  hidden?: boolean;
  /** Bold, underlined label: the bottleneck of an augmenting path. */
  emphasis?: boolean;
}

export interface FlowNetworkState {
  width: number;
  height: number;
  nodes: FlowNodeView[];
  edges: FlowEdgeView[];
  /** Token lists under the network: the DFS stack or BFS queue, the augmenting paths so far. */
  strips: ReservedStrip[];
}

const R = 19;

/**
 * Organism: a flow network. Every edge is a pipe whose filled part is its flow (the fill
 * slides when flow is pushed), with a "flow/capacity" label; the reverse edges of the residual
 * graph appear as dashed arrows once they hold flow that a later path could cancel.
 */
export function FlowNetworkView({ state }: { state: FlowNetworkState }) {
  const uid = `flow-${useId().replace(/:/g, '')}`;
  const pos = new Map(state.nodes.map((n) => [n.id, { x: n.x, y: n.y }]));
  const shapes = edgeShapes(state.edges, pos, R, { center: { x: state.width / 2, y: state.height / 2 } });
  const pipes = state.edges.filter((e) => e.kind === 'edge');

  return (
    <div className="flow-net">
      <svg className="flow-svg" viewBox={`0 0 ${state.width} ${state.height}`} style={{ width: state.width }} role="img" aria-label="Flow network">
        <ArrowMarkers prefix={uid} />
        {pipes.map((e) => {
          const d = shapes.get(e.id)!.d;
          return (
            <g key={`pipe-${e.id}`} className="flow-pipe">
              <path className="flow-track" d={d} />
              <path className="flow-fill" d={d} pathLength={100} style={{ strokeDasharray: `${(e.fill * 100).toFixed(2)} 100` }} />
            </g>
          );
        })}
        {state.edges.map((e) => (
          <g key={e.id} className={`flow-edge ${e.kind} role-${e.role}${e.hidden ? ' is-hidden' : ''}`}>
            <path className="flow-line" d={shapes.get(e.id)!.d} markerEnd={`url(#${uid}-${e.role})`} />
          </g>
        ))}
        {state.edges.map((e) => {
          const at = shapes.get(e.id)!.label;
          return (
            <text
              key={`label-${e.id}`}
              className={`flow-label ${e.kind}${e.emphasis ? ' em' : ''}${e.hidden ? ' is-hidden' : ''}`}
              x={at.x.toFixed(1)}
              y={at.y.toFixed(1)}
            >
              {e.label}
            </text>
          );
        })}
        {state.nodes.map((n) => (
          <g key={n.id}>
            <NodeGlyph x={n.x} y={n.y} r={R} label={n.id} role={n.role} badge={n.badge} />
            {n.tag && (
              <text className="flow-tag" x={n.x} y={n.y + R + 14}>
                {n.tag}
              </text>
            )}
          </g>
        ))}
      </svg>
      <ReservedStrips strips={state.strips} />
    </div>
  );
}
