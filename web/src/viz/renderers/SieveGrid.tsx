import type { Frame } from '../core/types';
import type { SieveState } from '../algorithms/sieveOfEratosthenes';
import '../ui/roles.css';
import { SYM } from '../ui/symbols';
import { monoW, StableStrips, stripSlots } from './numberTheoryShared';
import './SieveGrid.css';

const GAP = 3;
const WORK_H = 40;

/** One size for a whole run: room for every strip (the primes found, the lookups) at its widest. */
export function stabilizeSieve(frames: Array<Frame<SieveState>>): Array<Frame<SieveState>> {
  const slots = stripSlots(frames);
  return frames.map((f) => ({ ...f, state: { ...f.state, stripSlots: slots } }));
}

/**
 * Organism for the Sieve of Eratosthenes: the flags 0..n as a grid of numbers (10 per row up to
 * 109, so multiples of 2 and 5 line up in columns; 20 per row beyond). A struck number gets a
 * diagonal stroke and, in its corner, the prime that struck it first; the prime at work, the
 * numbers it strikes, the primes found and the lookups take the role colours.
 */
export function SieveGrid({ state }: { state: SieveState }) {
  const { cols } = state;
  const cw = cols === 10 ? 40 : 30;
  const ch = cols === 10 ? 30 : 23;
  const rows = Math.max(1, Math.ceil(state.cells.length / cols));
  const width = cols * (cw + GAP) - GAP;
  const height = WORK_H + rows * (ch + GAP) + 4;
  // The badge for a lookup outside the list, as wide as its text (11px bold mono).
  const outsideLabel = state.outside ? `${SYM.cross} k = ${state.outside.k}: ${state.outside.text}` : '';
  const outside = state.outside ? { label: outsideLabel, w: monoW(outsideLabel.length, 11) + 18 } : null;
  const describe = `Flags 0 to ${state.n}: primes ${state.cells.filter((c) => !c.crossed).map((c) => c.v).join(' ') || 'none'}; ${state.work.join('; ')}`;

  return (
    <div className="sg-wrap">
      <div className="sg-scroll">
        <svg className={`nt-svg sieve-grid${cols === 10 ? ' roomy' : ''}`} viewBox={`0 0 ${width} ${height}`} style={{ width, maxWidth: '100%', minWidth: Math.min(width, cols === 10 ? 300 : 460) }} role="img" aria-label={describe}>
          {state.work.slice(0, 2).map((w, k) => (
            <text key={`w${k}`} className={`sg-work${k === 0 ? ' first' : ''}`} x={0} y={11 + k * 16}>
              {w}
            </text>
          ))}
          {outside && (
            <g className="sg-outside role-bad" transform={`translate(${width - outside.w}, 2)`}>
              <rect width={outside.w} height={22} rx={5} />
              <text x={outside.w / 2} y={11}>
                {outside.label}
              </text>
            </g>
          )}
          {state.cells.length === 0 && (
            <text className="nt-note" x={width / 2} y={WORK_H + ch / 2}>
              the list is empty: there are no flags to draw
            </text>
          )}
          {state.cells.map((c) => {
            const x = (c.v % cols) * (cw + GAP);
            const y = WORK_H + Math.floor(c.v / cols) * (ch + GAP);
            const role = c.role ?? 'idle';
            const glyph = role === 'good' ? SYM.check : role === 'bad' ? SYM.cross : '';
            return (
              <g key={c.v} className={`sg-cell role-${role}${c.crossed ? ' crossed' : ''}`} transform={`translate(${x},${y})`}>
                <rect width={cw} height={ch} rx={4} />
                <text className="sg-num" x={cw / 2} y={ch / 2}>
                  {c.v}
                </text>
                {c.crossed && <line key={`s${c.v}`} className="sg-strike" x1={4} y1={ch - 4} x2={cw - 4} y2={4} />}
                {c.crossed && c.by !== undefined && (
                  <text className="sg-by" x={cw - 2} y={ch - 5}>
                    {c.by}
                  </text>
                )}
                {glyph && (
                  <text className="sg-glyph" x={cw - 5} y={6}>
                    {glyph}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
      <StableStrips strips={state.strips} slots={state.stripSlots} />
    </div>
  );
}
