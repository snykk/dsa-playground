import { useId } from 'react';
import type { CombinatoricsState } from '../algorithms/combinatorics';
import { FactorialTables } from './FactorialTables';
import { ArrowDefs, monoW, SvgArrow, SvgBox, SvgFrame, TextLines } from './OptimizationKit';
import './CombinatoricsView.css';

const PAD = 10;
const LABEL_W = 30;
const TOP = 30;
const ROW_H = 32;
const BOX_H = 22;
const GAP = 6;
const LINE_H = 18;

/**
 * Pascal's triangle on OptimizationKit's boxes: row r is shifted half a cell per row, so each
 * cell sits under the two it is the sum of. While a cell is being computed, two arrows come
 * into it from those two cells. Cells the code has not written yet are dashed placeholders.
 */
export function PascalTriangleView({ state }: { state: CombinatoricsState }) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const n = state.n;
  const cellW = Math.max(30, monoW('0'.repeat(state.cellChars)) + 14);
  const pitch = cellW + GAP;
  const left = PAD + LABEL_W;
  const x = (r: number, j: number) => left + ((n - r) * pitch) / 2 + j * pitch;
  const y = (r: number) => TOP + r * ROW_H;
  const triW = (n + 1) * pitch - GAP;
  const linesY = y(n) + BOX_H + 18;
  const width = Math.max(left + triW + PAD, PAD + monoW('x'.repeat(30)) + PAD);
  const height = linesY + 2 * LINE_H;
  const sum = state.sum;
  return (
    <SvgFrame width={width} height={height} label={state.label} minWidth={Math.min(width, 340)}>
      <ArrowDefs uid={uid} />
      <text className="ok-title" x={PAD} y={12}>
        {`Pascal's triangle: row r holds C(r, 0) .. C(r, r)`}
      </text>
      {state.rows.map((row, r) => (
        <g key={`r${r}`}>
          <text className="ok-head cb-rowlabel" x={PAD + LABEL_W - 8} y={y(r) + BOX_H / 2}>
            {r}
          </text>
          {row.map((c, j) => (
            <SvgBox key={`c${r}-${j}`} x={x(r, j)} y={y(r)} w={cellW} h={BOX_H} text={c.value ?? ''} role={c.role} ghost={c.value === null} />
          ))}
        </g>
      ))}
      {sum &&
        [sum[1] - 1, sum[1]].map((j, k) => {
          const [r] = sum;
          const ax = x(r - 1, j) + cellW / 2;
          const bx = x(r, sum[1]) + cellW / 2 + (k === 0 ? -5 : 5);
          return <SvgArrow key={`a${k}`} uid={uid} d={`M${ax.toFixed(1)},${(y(r - 1) + BOX_H).toFixed(1)} L${bx.toFixed(1)},${(y(r) - 1).toFixed(1)}`} role="active" />;
        })}
      <TextLines x={PAD} y={linesY} lines={state.triangleLines} lineH={LINE_H} />
    </SvgFrame>
  );
}

/**
 * Organism for the binomial coefficients: Pascal's triangle filling row by row, and under it
 * the unchanged FactorialTables organism for ModBinomial's fact and inv_fact and the queries.
 */
export function CombinatoricsView({ state }: { state: CombinatoricsState }) {
  return (
    <div className="cb-stack">
      <PascalTriangleView state={state} />
      <FactorialTables state={state.tables} />
    </div>
  );
}
