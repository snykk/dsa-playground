import type { Frame } from '../core/types';
import type { ChainCell, MrState } from '../algorithms/millerRabin';
import '../ui/roles.css';
import { SYM } from '../ui/symbols';
import { monoW, StableStrips, stripSlots, SvgCell } from './numberTheoryShared';
import './WitnessChains.css';

const ROW_H = 22;
const GAP = 4;
const LABEL_W = 104;
const VERDICT_W = 160;
const VERDICT_GAP = 14;
const MAX_CELLS = 6;
const TOP = 44;
const MAX_TWOS = 12;

/** One size for a whole run: the most witness rows, chain cells and characters in a cell, and every strip at its widest. */
export function stabilizeWitness(frames: Array<Frame<MrState>>): Array<Frame<MrState>> {
  let rows = 1;
  let cells = 1;
  let chars = 3;
  for (const f of frames) {
    rows = Math.max(rows, f.state.rows.length);
    for (const r of f.state.rows) {
      cells = Math.max(cells, r.cells.length);
      for (const c of r.cells) chars = Math.max(chars, c.text.length);
    }
  }
  const slots = stripSlots(frames);
  return frames.map((f) => ({ ...f, state: { ...f.state, stripSlots: slots, layout: { rows, cells: Math.min(cells, MAX_CELLS), chars } } }));
}

/** The cells a row shows: all of them, or x0, a gap and the last ones when the chain is long. */
function shownCells(cells: ChainCell[], slots: number): Array<{ cell: ChainCell | null; index: number }> {
  if (cells.length <= slots) return cells.map((cell, index) => ({ cell, index }));
  const tail = cells.slice(cells.length - (slots - 2)).map((cell, k) => ({ cell, index: cells.length - (slots - 2) + k }));
  return [{ cell: cells[0], index: 0 }, { cell: null, index: -1 }, ...tail];
}

/**
 * Organism for Miller-Rabin: n - 1 = d * 2^r with the factors of 2 pulled out one by one, then
 * one row per witness a holding its chain x0 = a^d, x1 = x0^2, ... mod n (1 and n - 1 named,
 * long values shortened) and the reason it passes or proves n composite.
 */
export function WitnessChains({ state }: { state: MrState }) {
  const layout = state.layout ?? { rows: Math.max(1, state.rows.length), cells: Math.min(MAX_CELLS, Math.max(1, ...state.rows.map((r) => r.cells.length))), chars: 6 };
  const cellW = Math.max(40, monoW(layout.chars) + 14);
  const width = LABEL_W + layout.cells * (cellW + GAP) + VERDICT_W + 8;
  const height = TOP + 22 + layout.rows * (ROW_H + GAP) + 34;
  const twos = state.split ? Math.min(state.split.r, MAX_TWOS) : 0;
  const describe = `n = ${state.n}${state.split ? `, n - 1 = ${state.split.d} * 2^${state.split.r}` : ''}; ${state.rows.map((r) => `${r.label}: ${r.cells.map((c) => c.text).join(', ')} ${r.verdict?.text ?? ''}`).join('; ')}${state.verdict ? `; ${state.verdict.text}` : ''}`;
  // Sized by n, not by d, so the row does not jitter while d shrinks.
  const dW = Math.max(40, monoW(state.n.length) + 14);
  const nm1 = 'n - 1 =';

  return (
    <div className="wc-wrap">
      <div className="wc-scroll">
        <svg className="nt-svg witness-chains" viewBox={`0 0 ${width} ${height}`} style={{ width, maxWidth: '100%', minWidth: Math.min(width, 460) }} role="img" aria-label={describe}>
          <text className="wc-n" x={0} y={12}>
            n = {state.n}
          </text>
          {state.split && (
            <g className="wc-split" transform="translate(0, 24)">
              <text className="wc-eq" x={0} y={11}>
                {nm1}
              </text>
              <SvgCell x={monoW(nm1.length) + 8} y={0} w={dW} h={22} text={state.split.d} role={state.split.role === 'done' ? 'done' : 'active'} />
              <text className="wc-eq" x={monoW(nm1.length) + 8 + dW + 6} y={11}>
                {SYM.times}
              </text>
              {Array.from({ length: twos }, (_, k) => (
                <g key={`two${k}`} className="wc-two" transform={`translate(${monoW(nm1.length) + dW + 34 + k * 20}, 2)`}>
                  <rect width={17} height={18} rx={4} />
                  <text x={8.5} y={9}>
                    2
                  </text>
                </g>
              ))}
              <text className="wc-eq" x={monoW(nm1.length) + dW + 34 + twos * 20 + 4} y={11}>
                {state.split.r === 0 ? '1 (r = 0 so far)' : `= ${state.split.d} ${SYM.times} 2^${state.split.r}${state.split.r > MAX_TWOS ? ` (${MAX_TWOS} of the ${state.split.r} twos drawn)` : ''}`}
              </text>
            </g>
          )}
          <g transform={`translate(0, ${TOP + 14})`}>
            {state.rows.length > 0 && (
              <>
                <text className="nt-head wc-head" x={LABEL_W - 8} y={0}>
                  witness
                </text>
                {Array.from({ length: layout.cells }, (_, k) => (
                  <text key={`h${k}`} className="nt-head" x={LABEL_W + k * (cellW + GAP) + cellW / 2} y={0}>
                    {k === 0 ? 'a^d' : `x${k}`}
                  </text>
                ))}
                <text className="nt-head wc-vhead" x={LABEL_W + layout.cells * (cellW + GAP) + VERDICT_GAP} y={0}>
                  verdict
                </text>
              </>
            )}
            {state.rows.map((row, r) => {
              const y = 10 + r * (ROW_H + GAP);
              const cells = shownCells(row.cells, layout.cells);
              return (
                <g key={row.key} className={`wc-row${row.role ? ` role-${row.role}` : ''}`}>
                  <text className="wc-label" x={LABEL_W - 8} y={y + ROW_H / 2}>
                    {row.label}
                  </text>
                  {cells.map(({ cell, index }, k) =>
                    cell ? (
                      <SvgCell key={`c${index}`} x={LABEL_W + k * (cellW + GAP)} y={y} w={cellW} h={ROW_H} text={cell.text} role={cell.role} />
                    ) : (
                      <text key="gap" className="nt-note" x={LABEL_W + k * (cellW + GAP) + cellW / 2} y={y + ROW_H / 2}>
                        {`${SYM.ellipsis} ${row.cells.length - layout.cells + 1} more`}
                      </text>
                    ),
                  )}
                  {row.verdict && (
                    <text className={`wc-verdict role-${row.verdict.role}`} x={LABEL_W + layout.cells * (cellW + GAP) + VERDICT_GAP} y={y + ROW_H / 2}>
                      {row.verdict.role === 'good' ? SYM.check : SYM.cross} {row.verdict.text}
                    </text>
                  )}
                </g>
              );
            })}
          </g>
          {state.verdict && (
            <text className={`wc-final role-${state.verdict.role}`} x={0} y={height - 10}>
              {state.verdict.role === 'good' ? `${SYM.check} ` : state.verdict.role === 'bad' ? `${SYM.cross} ` : ''}
              {state.verdict.text}
            </text>
          )}
        </svg>
      </div>
      <StableStrips strips={state.strips} slots={state.stripSlots} />
    </div>
  );
}
