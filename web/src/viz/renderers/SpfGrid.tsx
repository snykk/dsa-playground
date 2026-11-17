import { useId } from 'react';
import type { Role } from '../core/types';
import { ArrowDefs, curvePath, monoW, SvgArrow, SvgBox, SvgFrame, TextLines, type OkText } from './OptimizationKit';
import './SpfGrid.css';

export interface SpfCellView {
  x: number;
  /** spf[x] when it is smaller than x (a composite that has been reached), else null. */
  spf: number | null;
  role?: Role;
}

/**
 * One hop of factorize: n -> n // p. It has no label: an arrow crosses the cells between its
 * ends, and a label there would sit on their numbers. The source cell already shows p (its
 * "spf p" or "prime"), and the worked step beside the grid writes out the division.
 */
export interface SpfHopView {
  from: number;
  to: number;
  role?: Role;
}

export interface SpfGridState {
  /** What the picture shows, for screen readers. */
  label: string;
  n: number;
  cells: SpfCellView[];
  hops: SpfHopView[];
  work: OkText[];
  answers: OkText[];
  /** Number of queries of the run, so the picture keeps one height. */
  answerRows: number;
  /** Widest work / answer line of the run in characters, so the picture keeps one width. */
  workChars: number;
}

const COLS = 10;
const CW = 42;
const CH = 34;
const GAP = 5;
const PAD = 10;
const TOP = 40;
const LINE_H = 18;
const WORK_ROWS = 3;

/**
 * Organism for the smallest-prime-factor table: the numbers 0..n in rows of ten, each with the
 * prime stored for it once a sieve step reaches it, so the multiples of each prime light up as
 * the loop marks them. factorize then hops along the grid from n to n // p, one arrow per
 * division (the source cell names p), while the worked steps and the answers stand to the right.
 */
export function SpfGrid({ state }: { state: SpfGridState }) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const rows = Math.max(1, Math.ceil((state.n + 1) / COLS));
  const gridW = COLS * (CW + GAP) - GAP;
  const panelX = PAD + gridW + 22;
  const panelW = Math.max(230, monoW('x'.repeat(state.workChars)));
  const width = panelX + panelW + PAD;
  const gridH = TOP + rows * (CH + GAP) + 4;
  const panelH = TOP + (WORK_ROWS + 1 + state.answerRows) * LINE_H + 12;
  const height = Math.max(gridH, panelH, 120);
  const pos = (x: number) => ({ x: PAD + (x % COLS) * (CW + GAP), y: TOP + Math.floor(x / COLS) * (CH + GAP) });
  const center = (x: number) => {
    const p = pos(x);
    return { x: p.x + CW / 2, y: p.y + CH / 2 };
  };

  return (
    <SvgFrame width={width} height={height} label={state.label} minWidth={560}>
      <ArrowDefs uid={uid} />
      <text className="ok-title" x={PAD} y={12}>
        {`spf[x] for x = 0..${state.n} (the small number is the stored prime)`}
      </text>
      {state.cells.map((c) => {
        const p = pos(c.x);
        const sub = c.spf !== null ? `spf ${c.spf}` : c.role === 'done' && c.x >= 2 ? 'prime' : undefined;
        return <SvgBox key={c.x} x={p.x} y={p.y} w={CW} h={CH} text={c.x} sub={sub} role={c.role} className={c.spf !== null ? 'spf-marked' : undefined} />;
      })}
      {state.hops.map((h, k) => {
        const a = center(h.from);
        const b = center(h.to);
        const sameRow = Math.floor(h.from / COLS) === Math.floor(h.to / COLS);
        const bend = sameRow ? 18 : 22;
        const d = curvePath(a.x, a.y - 6, b.x + 4, b.y - 6, bend);
        return <SvgArrow key={`h${k}`} uid={uid} d={d} role={h.role ?? 'active'} />;
      })}
      <TextLines x={panelX} y={TOP + 6} lines={state.work} lineH={LINE_H} />
      {state.answers.length > 0 && (
        <>
          <text className="ok-title" x={panelX} y={TOP + WORK_ROWS * LINE_H + 10}>
            Answers
          </text>
          <TextLines x={panelX} y={TOP + (WORK_ROWS + 1) * LINE_H + 10} lines={state.answers} lineH={LINE_H} />
        </>
      )}
    </SvgFrame>
  );
}
