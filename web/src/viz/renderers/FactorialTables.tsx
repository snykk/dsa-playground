import { useId } from 'react';
import type { Role } from '../core/types';
import { ArrowDefs, curvePath, monoW, SvgArrow, SvgBox, SvgFrame, TextLines, type OkText } from './OptimizationKit';
import './FactorialTables.css';

export interface FactCellView {
  value: string;
  role?: Role;
  /** Still the 1 that [1] * (n + 1) put there: drawn dashed until the loop writes it. */
  ghost?: boolean;
}

/** An arrow between two table cells; column 0 is fact, column 1 is inv_fact. */
export interface FactArrowView {
  from: [0 | 1, number];
  to: [0 | 1, number];
  label?: string;
  role?: Role;
}

export interface FactorialTablesState {
  /** What the picture shows, for screen readers. */
  label: string;
  title: string;
  fact: FactCellView[];
  inv: FactCellView[];
  /** Highlighted row indices (the i of the current step, the indices a query reads). */
  rowRoles?: Record<number, Role>;
  arrows: FactArrowView[];
  /** The worked formula of the current step, right of the table. */
  work: OkText[];
  /** Answers so far, under the formula. */
  answers: OkText[];
  /** Widest value of the run in characters, so the table keeps one width. */
  valueChars: number;
  /** Widest work / answer line of the run in characters. */
  workChars: number;
  /** Most answer lines of the run, so the picture keeps one height. */
  answerRows: number;
}

const PAD = 10;
const IDX_W = 26;
const ARC = 30;
const RH = 24;
const BH = 20;
const TOP = 44;
const GAP = 64;
const LINE_H = 18;
/** Lines reserved for the worked formula before the answers start. */
export const FACT_WORK_ROWS = 5;

/**
 * Organism for the factorial tables of Factorials(n, mod): fact[i] on the left, inv_fact[i] on
 * the right, one row per i. Arrows show where each entry comes from: fact[i-1] times i on the
 * left, the one Fermat inverse across the bottom, inv_fact[i+1] times (i+1) on the right, so
 * the left column fills downwards and the right one upwards. The worked formula and the
 * answers of the queries stand beside the table.
 */
export function FactorialTables({ state }: { state: FactorialTablesState }) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const rows = state.fact.length;
  const cellW = Math.max(46, monoW('0'.repeat(state.valueChars)) + 16);
  const factX = PAD + IDX_W + ARC;
  const invX = factX + cellW + GAP;
  const workX = invX + cellW + ARC + 14;
  const workW = Math.max(200, monoW('x'.repeat(state.workChars)) + 8);
  const width = workX + workW + PAD;
  const tableH = TOP + rows * RH + 6;
  const workH = TOP + (FACT_WORK_ROWS + 1 + state.answerRows) * LINE_H + 12;
  const height = Math.max(tableH, workH, 150);
  const rowY = (i: number) => TOP + i * RH;
  const colX = (c: 0 | 1) => (c === 0 ? factX : invX);

  const arrowFor = (a: FactArrowView, k: number) => {
    const [fc, fr] = a.from;
    const [tc, tr] = a.to;
    const role = a.role ?? 'active';
    if (fc === tc) {
      // Down the left side of fact, or up the right side of inv_fact.
      const left = fc === 0;
      const x = left ? colX(0) - 2 : colX(1) + cellW + 2;
      const ay = rowY(fr) + BH / 2;
      const by = rowY(tr) + BH / 2;
      const bend = 16;
      const d = curvePath(x, ay, x, by, bend);
      const lx = left ? x - bend - 4 : x + bend + 4;
      return <SvgArrow key={k} uid={uid} d={d} role={role} label={a.label} lx={lx} ly={(ay + by) / 2} anchor={left ? 'end' : 'start'} />;
    }
    // Across: fact[n] -> inv_fact[n] (the Fermat inverse), or the other way for a query.
    const fromRight = fc === 0;
    const ax = fromRight ? colX(0) + cellW + 2 : colX(1) - 2;
    const bx = fromRight ? colX(1) - 3 : colX(0) + cellW + 3;
    const ay = rowY(fr) + BH / 2;
    const by = rowY(tr) + BH / 2;
    const d = curvePath(ax, ay, bx, by, fr === tr ? -10 : 0);
    return <SvgArrow key={k} uid={uid} d={d} role={role} label={a.label} lx={(ax + bx) / 2} ly={Math.min(ay, by) - 14} />;
  };

  return (
    <SvgFrame width={width} height={height} label={state.label} minWidth={420}>
      <ArrowDefs uid={uid} />
      <text className="ok-title" x={PAD} y={12}>
        {state.title}
      </text>
      <text className="ok-head" x={PAD + IDX_W - 6} y={TOP - 12} style={{ textAnchor: 'end' }}>
        i
      </text>
      <text className="ok-head" x={factX + cellW / 2} y={TOP - 12}>
        fact[i]
      </text>
      <text className="ok-head" x={invX + cellW / 2} y={TOP - 12}>
        inv_fact[i]
      </text>
      {state.fact.map((_, i) => {
        const role = state.rowRoles?.[i];
        return (
          <text key={`i${i}`} className={`ok-head ft-index${role ? ` role-${role}` : ''}`} x={PAD + IDX_W - 6} y={rowY(i) + BH / 2} style={{ textAnchor: 'end' }}>
            {i}
          </text>
        );
      })}
      {state.fact.map((c, i) => (
        <SvgBox key={`f${i}`} x={factX} y={rowY(i)} w={cellW} h={BH} text={c.value} role={c.role} ghost={c.ghost} />
      ))}
      {state.inv.map((c, i) => (
        <SvgBox key={`v${i}`} x={invX} y={rowY(i)} w={cellW} h={BH} text={c.value} role={c.role} ghost={c.ghost} />
      ))}
      {state.arrows.map(arrowFor)}
      <TextLines x={workX} y={TOP} lines={state.work} lineH={LINE_H} />
      {state.answers.length > 0 && (
        <>
          <text className="ok-title" x={workX} y={TOP + FACT_WORK_ROWS * LINE_H + 2}>
            Queries answered from the table
          </text>
          <TextLines x={workX} y={TOP + (FACT_WORK_ROWS + 1) * LINE_H + 2} lines={state.answers} lineH={LINE_H} />
        </>
      )}
    </SvgFrame>
  );
}
