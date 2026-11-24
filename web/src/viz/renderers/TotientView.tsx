import { useId } from 'react';
import type { TotientFactorState, TotientSieveState } from '../algorithms/eulersTotient';
import { CANDIDATE_GAP, candidateBoxW, primesLine } from '../algorithms/eulersTotient';
import { SYM } from '../ui/symbols';
import { ArrowDefs, monoW, SvgArrow, SvgBox, SvgFrame, TextLines } from './OptimizationKit';
import './TotientView.css';

/* ---------- the linear sieve ---------- */

const COLS = 10;
const CW = 50;
const CH = 46;
const GAP = 4;
const PAD = 10;
const TOP = 28;
const LINE_H = 18;
const WORK_ROWS = 3;

/**
 * Organism for the linear sieve: the numbers 0..n in rows of ten. Each cell shows its number,
 * the pair i x p that crossed it out (or "prime"), and phi once it is known; a crossed-out cell
 * is shaded. The worked step, the primes and the count of crossings stand under the grid.
 * Composed from OptimizationKit's frame, text lines and box styles, like SpfGrid.
 */
export function TotientSieveGrid({ state }: { state: TotientSieveState }) {
  const rows = Math.max(1, Math.ceil((state.n + 1) / COLS));
  const gridW = COLS * (CW + GAP) - GAP;
  const width = PAD * 2 + Math.max(gridW, monoW('x'.repeat(state.workChars)));
  const gridBottom = TOP + rows * (CH + GAP);
  const height = gridBottom + 10 + (WORK_ROWS + 2) * LINE_H;
  return (
    <SvgFrame width={width} height={height} label={state.label} minWidth={460}>
      <text className="ok-title" x={PAD} y={12}>
        {`phi[x] for x = 0..${state.n}; a shaded cell was crossed out by i ${SYM.times} p`}
      </text>
      {state.cells.map((c) => {
        const x = PAD + (c.x % COLS) * (CW + GAP);
        const y = TOP + Math.floor(c.x / COLS) * (CH + GAP);
        const role = c.role ?? 'idle';
        const crossed = c.by !== null;
        const how = crossed ? `${c.by![0]}${SYM.times}${c.by![1]}` : c.x >= 2 && c.spf === c.x ? 'prime' : '';
        return (
          <g key={c.x} className={`ok-box tt-cell role-${role}${crossed ? ' tt-crossed' : ''}`} style={{ transform: `translate(${x}px, ${y}px)` }}>
            <rect width={CW} height={CH} rx={5} />
            <text className="ok-val" x={CW / 2} y={11}>
              {c.x}
            </text>
            {how && (
              <text className="ok-sub" x={CW / 2} y={25}>
                {how}
              </text>
            )}
            {c.phi !== null && (
              <text className="ok-sub tt-phi" x={CW / 2} y={CH - 8}>
                {`phi ${c.phi}`}
              </text>
            )}
          </g>
        );
      })}
      <TextLines x={PAD} y={gridBottom + 14} lines={state.work} lineH={LINE_H} />
      <TextLines
        x={PAD}
        y={gridBottom + 14 + WORK_ROWS * LINE_H}
        lines={[{ text: primesLine(state.primes) }, { text: `crossings: ${state.crossings}` }]}
        lineH={LINE_H}
      />
    </SvgFrame>
  );
}

/* ---------- phi(n) by trial division ---------- */

const RUNG_W = 62;
const RUNG_H = 30;
const RUNG_GAP = 44;
const CAND_H = 36;

/**
 * Organism for phi(n) by trial division: a ladder of what is left of n, one rung per prime
 * divided out; the candidates p tried, a run of candidates that divide nothing in one box;
 * then the product formula step by step and the inverses from Euler's theorem.
 */
export function TotientFactorView({ state }: { state: TotientFactorState }) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const { slots } = state;
  const ladderW = slots.rungs * (RUNG_W + RUNG_GAP) - RUNG_GAP;
  const width = PAD * 2 + Math.max(ladderW, slots.candidatesW, monoW('x'.repeat(slots.chars)), 260);
  const ladderY = 24;
  const candTitleY = ladderY + RUNG_H + 22;
  const candY = candTitleY + 10;
  const linesY = candY + CAND_H + 24;
  const answersY = linesY + slots.formula * LINE_H;
  const height = answersY + Math.max(1, slots.answers) * LINE_H + 4;
  let cx = PAD;
  return (
    <SvgFrame width={width} height={height} label={state.label} minWidth={420}>
      <ArrowDefs uid={uid} />
      <text className="ok-title" x={PAD} y={10}>
        {`What is left of n = ${state.n}`}
      </text>
      {state.ladder.map((r, k) => {
        const x = PAD + k * (RUNG_W + RUNG_GAP);
        return (
          <g key={`r${k}`}>
            {k > 0 && (
              <SvgArrow
                uid={uid}
                d={`M${x - RUNG_GAP + 3},${ladderY + RUNG_H / 2} L${x - 3},${ladderY + RUNG_H / 2}`}
                role={r.role === 'active' ? 'active' : 'idle'}
                label={r.via}
                lx={x - RUNG_GAP / 2}
                ly={ladderY - 2}
              />
            )}
            <SvgBox x={x} y={ladderY} w={RUNG_W} h={RUNG_H} text={r.value} role={r.role} />
          </g>
        );
      })}
      <text className="ok-title" x={PAD} y={candTitleY}>
        {state.candidates.length ? 'Candidates p, and how many times each divided n' : ''}
      </text>
      {state.candidates.map((c, k) => {
        const w = candidateBoxW(c.label);
        const x = cx;
        cx += w + CANDIDATE_GAP;
        return <SvgBox key={`c${k}`} x={x} y={candY} w={w} h={CAND_H} text={c.label} sub={c.sub} role={c.role} />;
      })}
      <TextLines x={PAD} y={linesY} lines={state.formula} lineH={LINE_H} />
      <TextLines x={PAD} y={answersY} lines={state.answers} lineH={LINE_H} />
    </SvgFrame>
  );
}
