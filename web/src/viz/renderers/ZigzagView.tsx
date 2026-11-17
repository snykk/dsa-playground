import type { ZigzagState } from '../algorithms/constructive';
import { StableStrips } from './StableStrips';
import '../ui/molecules/Strip.css';
import '../ui/roles.css';
import { SYM } from '../ui/symbols';
import './ZigzagView.css';

export type { ZigzagState };

const LEFT = 44;
const TOP = 34; // room above the plot for the result label, clear of the highest point
const PLOT_W = 540;
const PLOT_H = 190;
const NUM_Y = PLOT_H + TOP + 48; // the row of numbers 1..n
const CELL = 26;
const WIDTH = LEFT + PLOT_W + 24;
const HEIGHT = NUM_Y + CELL + 22;
const R = 12;

/**
 * Organism for construct_permutation: the permutation as a chart (position across, value up), so
 * the zig-zag is a line whose swings shrink by one each step, every segment labelled with its
 * difference; below it the numbers 1..n with the zig-zag range lo..hi still to place.
 */
export function ZigzagView({ state }: { state: ZigzagState }) {
  const n = Math.max(state.n, 1);
  const sx = n > 1 ? PLOT_W / (n - 1) : 0;
  const sy = n > 1 ? PLOT_H / (n - 1) : 0;
  const px = (i: number) => LEFT + (n > 1 ? i * sx : PLOT_W / 2);
  const py = (v: number) => TOP + (n > 1 ? PLOT_H - (v - 1) * sy : PLOT_H / 2);
  const cellX = (v: number) => LEFT + PLOT_W / 2 - (n * (CELL + 3)) / 2 + (v - 1) * (CELL + 3);
  const used = new Set(state.perm);
  const status = state.status;
  const describe = `Permutation so far: [${state.perm.join(', ')}]; differences ${state.diffs.map((d) => d.value).join(', ') || 'none'}; ${state.distinct.length} distinct.`;
  return (
    <div className="zz-wrap">
      <div className="zz-scroll">
        <svg className="zigzag-view" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} style={{ width: WIDTH, maxWidth: '100%', minWidth: 420 }} role="img" aria-label={describe}>
          <line className="zz-axis" x1={LEFT - 14} y1={TOP + PLOT_H + 14} x2={LEFT + PLOT_W + 10} y2={TOP + PLOT_H + 14} />
          <line className="zz-axis" x1={LEFT - 14} y1={TOP - 6} x2={LEFT - 14} y2={TOP + PLOT_H + 14} />
          <text className="zz-axis-label" x={LEFT - 20} y={TOP + PLOT_H / 2} transform={`rotate(-90 ${LEFT - 30} ${TOP + PLOT_H / 2})`}>
            value
          </text>
          {Array.from({ length: n }, (_, i) => (
            <text key={`x${i}`} className="zz-tick" x={px(i)} y={TOP + PLOT_H + 26}>
              {i}
            </text>
          ))}
          <text className="zz-axis-label" x={LEFT + PLOT_W} y={TOP + PLOT_H + 38}>
            position
          </text>
          {state.diffs.map((d, i) => {
            const a = { x: px(i), y: py(state.perm[i]) };
            const b = { x: px(i + 1), y: py(state.perm[i + 1]) };
            const mx = (a.x + b.x) / 2;
            const my = (a.y + b.y) / 2;
            return (
              <g key={`s${i}`} className={`zz-seg role-${d.role}${d.fresh ? ' fresh' : ''}`}>
                <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} />
                <g className="zz-diff">
                  <rect x={mx - 11} y={my - 9} width={22} height={18} rx={9} />
                  <text x={mx} y={my}>
                    {d.value}
                  </text>
                </g>
              </g>
            );
          })}
          {state.perm.map((v, i) => {
            const role = state.roles[i];
            return (
              <g key={`p${i}`} className={`zz-point role-${role}`}>
                <circle cx={px(i)} cy={py(v)} r={R} />
                <text x={px(i)} y={py(v)}>
                  {v}
                </text>
              </g>
            );
          })}
          {status && (
            <text className={`zz-status role-${status}`} x={LEFT + PLOT_W + 10} y={14}>
              {status === 'good' ? `${SYM.check} returned` : `${SYM.cross} None`}
            </text>
          )}
          <text className="zz-row-label" x={cellX(1) - 8} y={NUM_Y + CELL / 2}>
            1..n
          </text>
          {Array.from({ length: n }, (_, k) => {
            const v = k + 1;
            const inPool = state.pool && v >= state.pool.lo && v <= state.pool.hi;
            const role = used.has(v) ? 'muted' : inPool ? 'compare' : 'idle';
            return (
              <g key={`n${v}`} className={`zz-num role-${role}`}>
                <rect x={cellX(v)} y={NUM_Y} width={CELL} height={CELL} rx={5} />
                <text x={cellX(v) + CELL / 2} y={NUM_Y + CELL / 2}>
                  {v}
                </text>
              </g>
            );
          })}
          {state.pool && state.pool.lo <= state.pool.hi && (
            <g className="zz-marks">
              <text x={cellX(state.pool.lo) + CELL / 2} y={NUM_Y + CELL + 11}>
                lo
              </text>
              <text x={cellX(state.pool.hi) + CELL / 2} y={NUM_Y + CELL + 11} dx={state.pool.lo === state.pool.hi ? 14 : 0}>
                hi
              </text>
            </g>
          )}
        </svg>
      </div>
      <StableStrips
        strips={[{ label: 'Distinct differences', items: state.distinct.length ? state.distinct.map((d) => ({ text: String(d), role: 'done' as const })) : [{ text: SYM.emptySet, role: 'muted' as const }] }]}
        ghosts={state.ghostDistinct && [{ label: 'Distinct differences', items: state.ghostDistinct.map((d) => ({ text: String(d) })) }]}
      />
    </div>
  );
}
