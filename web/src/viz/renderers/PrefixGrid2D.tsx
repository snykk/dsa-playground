import type { Role } from '../core/types';
import { glyphOf, monoW, SvgBox, SvgFrame, TextLines, type OkText } from './OptimizationKit';
import './PrefixGrid2D.css';

export interface PrefixCellView {
  value: string;
  role?: Role;
  /** Still the 0 the constructor put there. */
  ghost?: boolean;
  /** "+" or "-": how the formula of this step uses the entry. */
  sign?: string;
}

/** A block of grid cells (rows r1..r2, columns c1..c2) drawn as a frame over the grid. */
export interface RectOverlay {
  /** Stable identity, so a block that changes size glides to it. */
  id: string;
  r1: number;
  c1: number;
  r2: number;
  c2: number;
  role: Role;
  label?: string;
}

export interface Prefix2DState {
  /** What the picture shows, for screen readers. */
  label: string;
  grid: Array<Array<{ value: string; role?: Role }>>;
  prefix: PrefixCellView[][];
  overlays: RectOverlay[];
  work: OkText[];
  answers: OkText[];
  /** Number of queries of the run, so the picture keeps one height. */
  answerRows: number;
  /** Widest work / answer line of the run in characters. */
  workChars: number;
}

const CW = 40;
const CH = 26;
const GAP = 4;
const PAD = 10;
const HEAD = 16;
const TITLE = 18;
const LINE_H = 18;
const WORK_ROWS = 3;
/** Row and column numbers sit this far from the cells, outside the block frames (which reach 5 px out). */
const LABEL_OFF = 14;

/**
 * Organism for 2D prefix sums: the grid on the left and the prefix table P (one row and one
 * column larger) on the right. A frame over the grid shows the block a P entry sums; while P
 * is built it grows cell by cell, and during a query the four corner blocks appear in turn with
 * their signs, so the inclusion-exclusion is visible. The worked formula and the answers sit
 * under the two tables.
 */
export function PrefixGrid2D({ state }: { state: Prefix2DState }) {
  const n = state.grid.length;
  const m = state.grid[0]?.length ?? 0;
  const step = CW + GAP;
  const gx = PAD + 18;
  const top = PAD + TITLE + HEAD;
  const gridW = m * step - GAP;
  const px = gx + gridW + 84;
  const pW = (m + 1) * step - GAP;
  const tablesH = top + (n + 1) * (CH + GAP);
  const textW = monoW('x'.repeat(state.workChars));
  const width = Math.max(px + pW + PAD, gx + Math.max(textW, gridW) + 20 + textW + PAD);
  const panelY = tablesH + 14;
  const height = panelY + (1 + Math.max(WORK_ROWS, state.answerRows)) * LINE_H + 6;
  const ansX = Math.max(px, gx + textW + 20);
  const cellX = (x0: number, c: number) => x0 + c * step;
  const cellY = (r: number) => top + r * (CH + GAP);

  return (
    <SvgFrame width={width} height={height} label={state.label} minWidth={520}>
      <text className="ok-title" x={gx} y={PAD + 6}>
        {`grid (${n} ${String.fromCodePoint(0xd7)} ${m})`}
      </text>
      <text className="ok-title" x={px} y={PAD + 6}>
        {`prefix P: P[i][j] = sum of the top-left i ${String.fromCodePoint(0xd7)} j block`}
      </text>
      {Array.from({ length: m }, (_, c) => (
        <text key={`gc${c}`} className="ok-head" x={cellX(gx, c) + CW / 2} y={top - LABEL_OFF}>
          {c}
        </text>
      ))}
      {Array.from({ length: n }, (_, r) => (
        <text key={`gr${r}`} className="ok-head" x={gx - LABEL_OFF} y={cellY(r) + CH / 2}>
          {r}
        </text>
      ))}
      {Array.from({ length: m + 1 }, (_, c) => (
        <text key={`pc${c}`} className="ok-head" x={cellX(px, c) + CW / 2} y={top - LABEL_OFF}>
          {c}
        </text>
      ))}
      {Array.from({ length: n + 1 }, (_, r) => (
        <text key={`pr${r}`} className="ok-head" x={px - LABEL_OFF} y={cellY(r) + CH / 2}>
          {r}
        </text>
      ))}
      {state.grid.flatMap((row, r) => row.map((c, k) => <SvgBox key={`g${r},${k}`} x={cellX(gx, k)} y={cellY(r)} w={CW} h={CH} text={c.value} role={c.role} />))}
      {state.prefix.flatMap((row, r) =>
        row.map((c, k) => (
          <g key={`p${r},${k}`}>
            <SvgBox x={cellX(px, k)} y={cellY(r)} w={CW} h={CH} text={c.value} role={c.role} ghost={c.ghost} className={r === 0 || k === 0 ? 'pg-border' : undefined} />
            {c.sign && (
              <text className={`pg-sign${c.sign === '-' ? ' minus' : ''}`} x={cellX(px, k) - 1} y={cellY(r) + 1}>
                {c.sign === '-' ? String.fromCodePoint(0x2212) : '+'}
              </text>
            )}
          </g>
        )),
      )}
      {state.overlays.map((o, k) => {
        const inset = 3 + (k % 3);
        const x = cellX(gx, o.c1) - inset;
        const y = cellY(o.r1) - inset;
        const w = (o.c2 - o.c1 + 1) * step - GAP + 2 * inset;
        const h = (o.r2 - o.r1 + 1) * (CH + GAP) - GAP + 2 * inset;
        return (
          <g key={o.id} className={`pg-overlay role-${o.role}`}>
            <rect style={{ x, y, width: Math.max(0, w), height: Math.max(0, h) }} rx={7} />
          </g>
        );
      })}
      {state.overlays
        .filter((o) => o.label)
        .map((o, k) => {
          const glyph = glyphOf(o.role);
          return (
            <text key={`l${o.id}`} className={`pg-overlay-label role-${o.role}`} x={gx + gridW + 9} y={top + 6 + k * 14}>
              {o.label}
              {glyph ? ` ${glyph}` : ''}
            </text>
          );
        })}
      <TextLines x={gx - 10} y={panelY + 4} lines={state.work} lineH={LINE_H} />
      {state.answers.length > 0 && (
        <>
          <text className="ok-title" x={ansX} y={panelY + 4}>
            Answers
          </text>
          <TextLines x={ansX} y={panelY + 4 + LINE_H} lines={state.answers} lineH={LINE_H} />
        </>
      )}
    </SvgFrame>
  );
}
