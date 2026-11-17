import type { GameGraphState } from '../algorithms/gameTheory';
import type { Role } from '../core/types';
import { NodeGlyph } from '../ui/atoms/NodeGlyph';
import { StableStrips } from './StableStrips';
import '../ui/molecules/Strip.css';
import '../ui/roles.css';
import './GameGraphView.css';

export type { GameGraphState };

const R = 20;
const WIDTH = 600;
const HEIGHT = 360;
const MARKER_ROLES: Role[] = ['idle', 'compare', 'active'];

/**
 * Organism for a game on a directed graph: the token's moves as arrows (a move back to the same
 * node as a loop), each node labelled with its outcome once settled (WIN, LOSE, DRAW) or with the
 * moves it has left; outcomes are also coloured (WIN good, LOSE bad, DRAW muted).
 */
export function GameGraphView({ state }: { state: GameGraphState }) {
  const pos = new Map(state.nodes.map((n) => [n.id, n]));
  const pairs = new Set(state.edges.map((e) => `${e.from}>${e.to}`));
  const seen = new Map<string, number>();
  const cx = WIDTH / 2;
  const cy = HEIGHT / 2;
  const describe = state.nodes.map((n) => `node ${n.id}: ${n.badge}`).join('; ');
  return (
    <div>
      <svg className="game-graph" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={describe}>
        <defs>
          {MARKER_ROLES.map((role) => (
            <marker key={role} id={`gg-arrow-${role}`} className={`role-${role}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" style={{ fill: role === 'idle' ? 'var(--axis)' : 'var(--role)' }} />
            </marker>
          ))}
        </defs>
        {state.edges.map((e) => {
          const a = pos.get(e.from)!;
          const b = pos.get(e.to)!;
          const role = MARKER_ROLES.includes(e.role) ? e.role : 'idle';
          const key = `${e.from}>${e.to}`;
          const dup = seen.get(key) ?? 0;
          seen.set(key, dup + 1);
          if (e.from === e.to) {
            // A loop on the outside of the node, away from the centre of the picture.
            const ang = Math.atan2(a.y - cy, a.x - cx) || -Math.PI / 2;
            const ux = Math.cos(ang);
            const uy = Math.sin(ang);
            const px = -uy;
            const py = ux;
            const s = { x: a.x + (ux * R + px * 9), y: a.y + (uy * R + py * 9) };
            const t = { x: a.x + (ux * R - px * 9), y: a.y + (uy * R - py * 9) };
            const c1 = { x: a.x + ux * (R + 38 + dup * 10) + px * 26, y: a.y + uy * (R + 38 + dup * 10) + py * 26 };
            const c2 = { x: a.x + ux * (R + 38 + dup * 10) - px * 26, y: a.y + uy * (R + 38 + dup * 10) - py * 26 };
            return (
              <g key={e.id} className={`gg-edge role-${e.role}`}>
                <path d={`M${s.x},${s.y} C${c1.x},${c1.y} ${c2.x},${c2.y} ${t.x},${t.y}`} markerEnd={`url(#gg-arrow-${role})`} />
              </g>
            );
          }
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const len = Math.hypot(dx, dy) || 1;
          const ux = dx / len;
          const uy = dy / len;
          // Opposite moves bend apart; a repeated move bends a little further.
          const bend = (pairs.has(`${e.to}>${e.from}`) ? 22 : 0) + dup * 14;
          const x1 = a.x + ux * R;
          const y1 = a.y + uy * R;
          const x2 = b.x - ux * (R + 4);
          const y2 = b.y - uy * (R + 4);
          const mx = (a.x + b.x) / 2 - uy * bend;
          const my = (a.y + b.y) / 2 + ux * bend;
          return (
            <g key={e.id} className={`gg-edge role-${e.role}`}>
              {bend ? <path d={`M${x1},${y1} Q${mx},${my} ${x2},${y2}`} markerEnd={`url(#gg-arrow-${role})`} /> : <line x1={x1} y1={y1} x2={x2} y2={y2} markerEnd={`url(#gg-arrow-${role})`} />}
            </g>
          );
        })}
        {state.nodes.map((n) => {
          const ang = Math.atan2(n.y - cy, n.x - cx);
          const below = state.nodes.length > 1 && Math.sin(ang) > 0.5;
          return (
            <g key={n.id}>
              <NodeGlyph x={n.x} y={n.y} r={R} label={n.id} role={n.role} />
              <text className={`gg-badge${/^(WIN|LOSE|DRAW)$/.test(n.badge) ? ' settled' : ''}`} x={n.x} y={below ? n.y + R + 14 : n.y - R - 10}>
                {n.badge}
              </text>
            </g>
          );
        })}
      </svg>
      <StableStrips strips={state.strips} ghosts={state.ghosts} />
    </div>
  );
}
