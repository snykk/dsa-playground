import type { Role } from '../core/types';
import { glyphOf, monoW, SvgFrame } from './OptimizationKit';
import './MaskRows.css';

/** One bit of one row. A bit keeps its id while its row shifts, so it glides to the new column. */
export interface MaskBitView {
  id: string;
  row: number;
  /** Bit position: 0 is the rightmost column; -1 and -2 are bits falling off the end. */
  pos: number;
  v: 0 | 1;
  role?: Role;
}

export interface MaskRowView {
  label: string;
  /** The value as text ("1011 = 11"); empty for a row not computed in this step. */
  value: string;
  role?: Role;
  empty?: boolean;
}

export interface MaskRowsState {
  /** What the picture shows, for screen readers. */
  label: string;
  /** Number of bit columns. */
  width: number;
  rows: MaskRowView[];
  bits: MaskBitView[];
  /** The masks yielded so far. */
  found: { title: string; items: Array<{ text: string; role?: Role }> };
  /** How many masks the run yields in all, so the list keeps its size. */
  foundCap: number;
}

const PAD = 10;
const LABEL_W = 132;
const BP = 26;
const BW = 22;
const BH = 24;
const ROW_P = 31;
const TOP = 30;
const ITEM_H = 19;

/**
 * Organism for bit tricks on masks: one row of bits per intermediate value (sub - 1, the lowest
 * set bit, the carry, the shifts), bit 0 on the right. A changed bit is filled, a shifted row
 * glides right and its lowest bits fall off the end, and the masks the loop yields collect in a
 * list underneath.
 */
export function MaskRows({ state }: { state: MaskRowsState }) {
  const { width, rows } = state;
  const x0 = PAD + LABEL_W + 10;
  const colX = (pos: number) => x0 + (width - 1 - pos) * BP;
  const valueX = colX(-3) + 6;
  const valueW = monoW('0'.repeat(width) + ' = 000', 12);
  const itemW = monoW('0'.repeat(width), 11) + 14;
  const rowsW = valueX + valueW - PAD;
  const perRow = Math.max(1, Math.floor(rowsW / (itemW + 6)));
  const listTop = TOP + rows.length * ROW_P + 18;
  const listRows = Math.max(1, Math.ceil(state.foundCap / perRow));
  const width2 = PAD + rowsW + PAD;
  const height = listTop + 16 + listRows * ITEM_H + 8;

  return (
    <SvgFrame width={width2} height={height} label={state.label} minWidth={440}>
      {Array.from({ length: width }, (_, pos) => (
        <text key={`h${pos}`} className="ok-head" x={colX(pos) + BW / 2} y={TOP - 12}>
          {pos}
        </text>
      ))}
      <text className="ok-head mr-headlabel" x={PAD + LABEL_W} y={TOP - 12}>
        bit
      </text>
      {rows.map((r, k) => {
        const y = TOP + k * ROW_P;
        const glyph = glyphOf(r.role);
        return (
          <g key={`row${k}`} className={`mr-row${r.empty ? ' empty' : ''}${r.role ? ` role-${r.role}` : ''}`}>
            <text className="mr-label" x={PAD + LABEL_W} y={y + BH / 2}>
              {r.label}
            </text>
            {!r.empty && <rect className="mr-track" x={colX(width - 1) - 3} y={y - 3} width={width * BP + 2} height={BH + 6} rx={6} />}
            <text className="mr-value" x={valueX} y={y + BH / 2}>
              {r.value}
              {glyph && <tspan className="mr-glyph">{` ${glyph}`}</tspan>}
            </text>
          </g>
        );
      })}
      {state.bits.map((b) => {
        const role = b.role ?? 'idle';
        return (
          <g
            key={b.id}
            className={`mr-bit role-${role}${b.v ? ' one' : ''}${b.pos < 0 ? ' fallen' : ''}`}
            style={{ transform: `translate(${colX(b.pos)}px, ${TOP + b.row * ROW_P}px)` }}
          >
            <rect width={BW} height={BH} rx={5} />
            <text x={BW / 2} y={BH / 2}>
              {b.v}
            </text>
          </g>
        );
      })}
      <text className="ok-title" x={PAD} y={listTop}>
        {state.found.title}
      </text>
      {state.found.items.map((it, i) => (
        <g key={`f${i}`} className={`mr-item role-${it.role ?? 'idle'}`}>
          <rect x={PAD + (i % perRow) * (itemW + 6)} y={listTop + 10 + Math.floor(i / perRow) * ITEM_H} width={itemW} height={ITEM_H - 3} rx={4} />
          <text x={PAD + (i % perRow) * (itemW + 6) + itemW / 2} y={listTop + 10 + Math.floor(i / perRow) * ITEM_H + (ITEM_H - 3) / 2}>
            {it.text}
          </text>
        </g>
      ))}
    </SvgFrame>
  );
}
