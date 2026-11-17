import type { GrundyState } from '../algorithms/gameTheory';
import { StableStrips } from './StableStrips';
import '../ui/molecules/Strip.css';
import '../ui/roles.css';
import { SYM } from '../ui/symbols';
import './GrundyView.css';

export type { GrundyState };

const LEFT = 58;
const CW = 28;
const GAP = 3;
const ARC_TOP = 18;
const ROW_Y = 128; // the row of positions; the arcs of the moves rise above it
const CH = 30;
const PILE_Y = ROW_Y + CH + 40; // pile markers under the P / N line
const MEX_Y = ROW_Y + CH + 76;

/**
 * Organism for a subtraction game: positions 0..n in a row with their Grundy numbers; the moves
 * from the position being computed jump back as arcs to the positions they reach, and the mex
 * scan below tries 0, 1, 2, ... until a value is missing from the reachable set.
 */
export function GrundyView({ state }: { state: GrundyState }) {
  const cx = (i: number) => LEFT + i * (CW + GAP) + CW / 2;
  const width = LEFT + (state.n + 1) * (CW + GAP) + 16;
  const height = MEX_Y + CH + 12;
  const describe = `Grundy numbers: ${state.cells.map((c, i) => `${i}: ${c.value ?? '?'}`).join(', ')}`;
  return (
    <div className="gr-wrap">
      <div className="gr-scroll">
        <svg className="grundy-view" viewBox={`0 0 ${width} ${height}`} style={{ width, maxWidth: '100%', minWidth: Math.min(width, 480) }} role="img" aria-label={describe}>
          <defs>
            <marker id="gr-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" className="gr-arrowhead" />
            </marker>
          </defs>
          {/* Every arc first, then every label, so no arc is drawn across another arc's label. */}
          {(['path', 'label'] as const).map((layer) =>
            state.arcs.map((a, k) => {
              const x1 = cx(a.from);
              const x2 = cx(a.to);
              const h = Math.min(ROW_Y - ARC_TOP - 12, 10 + Math.abs(x1 - x2) * 0.55);
              const mx = (x1 + x2) / 2;
              return (
                <g key={`${layer}${k}`} className={`gr-arc role-${a.role}`}>
                  {layer === 'path' ? (
                    <path d={`M${x1},${ROW_Y - 3} Q${mx},${ROW_Y - 3 - 2 * h} ${x2},${ROW_Y - 3}`} markerEnd="url(#gr-arrow)" />
                  ) : (
                    <text x={mx} y={ROW_Y - 3 - h - 9}>
                      {a.label}
                    </text>
                  )}
                </g>
              );
            }),
          )}
          <text className="gr-row-label" x={LEFT - 10} y={ROW_Y + CH / 2}>
            g(n)
          </text>
          <text className="gr-row-label" x={LEFT - 10} y={ROW_Y + CH + 12}>
            n
          </text>
          {state.cells.map((c, i) => (
            <g key={i} className={`gr-cell role-${c.role}${c.value === null ? ' unknown' : ''}`}>
              <rect x={cx(i) - CW / 2} y={ROW_Y} width={CW} height={CH} rx={5} />
              <text x={cx(i)} y={ROW_Y + CH / 2}>
                {c.value === null ? SYM.middot : c.value}
              </text>
              <text className="gr-index" x={cx(i)} y={ROW_Y + CH + 12}>
                {i}
              </text>
              {c.value !== null && (
                <text className={`gr-pn${c.value === 0 ? ' p' : ''}`} x={cx(i)} y={ROW_Y + CH + 26}>
                  {c.value === 0 ? 'P' : 'N'}
                </text>
              )}
            </g>
          ))}
          {state.piles.length > 0 && (
            <text className="gr-row-label" x={LEFT - 10} y={PILE_Y + 6}>
              piles
            </text>
          )}
          {state.piles.map((p, k) => {
            const below = state.piles.slice(0, k).filter((q) => q.size === p.size).length;
            return (
              <g key={`p${k}`} className={`gr-pile role-${p.role}`}>
                <path d={`M${cx(p.size)},${PILE_Y - 4 + below * 12} l-5,8 h10 z`} />
                <text x={cx(p.size)} y={PILE_Y + 12 + below * 12}>{`p${k}`}</text>
              </g>
            );
          })}
          {state.mex.length > 0 && (
            <g className="gr-mex">
              <text className="gr-row-label" x={LEFT - 10} y={MEX_Y + CH / 2}>
                mex
              </text>
              {state.mex.map((m, k) => (
                <g key={k} className={`gr-cell role-${m.role}`}>
                  <rect x={LEFT + k * (CW + GAP)} y={MEX_Y} width={CW} height={CH} rx={5} />
                  <text x={LEFT + k * (CW + GAP) + CW / 2} y={MEX_Y + CH / 2}>
                    {m.value}
                  </text>
                  <text className="gr-mex-note" x={LEFT + k * (CW + GAP) + CW / 2} y={MEX_Y - 9}>
                    {m.taken ? 'in set' : 'missing'}
                  </text>
                </g>
              ))}
            </g>
          )}
        </svg>
      </div>
      <StableStrips strips={state.strips} ghosts={state.ghosts} />
    </div>
  );
}
