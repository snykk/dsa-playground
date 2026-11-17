import type { Frame, Role } from '../core/types';
import type { StripData } from '../ui/molecules/Strip';
import '../ui/roles.css';
import { SYM } from '../ui/symbols';
import './BitRows.css';
import { StableStrips, stripsSizer } from './patternStrips';

/** One bit. It keeps its id when its row shifts or moves, so it glides to the new place. */
export interface BitCellView {
  id: string;
  /** Bit position: 0 is the least significant bit, drawn on the right. */
  pos: number;
  v: 0 | 1;
  role?: Role;
}

export interface BitRowView {
  key: string;
  label: string;
  /** Operator drawn left of the row (&, |, ^): this row combines with the row above. */
  op?: string;
  bits: BitCellView[];
  /** The sign bits above the window: Python ints repeat them forever, drawn as "...0" or "...1". */
  sign: 0 | 1;
  /** The value in decimal, right of the bits. */
  value: string;
  /** Emphasis for the whole row (the result); good / bad add a check / cross. */
  role?: Role;
  /** A rule above the row, as under a column of numbers before the result. */
  rule?: boolean;
  muted?: boolean;
  /** A 64-bit row: narrow cells without digits. */
  wide?: boolean;
}

export interface BitRowsState {
  /** What the picture shows, for screen readers. */
  label: string;
  /** Bits in the window of this frame: 16 (or n for a subset mask), or 64 for a masked value. */
  width: number;
  rows: BitRowView[];
  /** A highlighted bit position (bit i), drawn as a band behind every row. */
  column?: { pos: number; role: Role; wide?: boolean };
  /** Rows and value-column characters the picture reserves; set by stabilizeBits. */
  rowSlots?: number;
  valueChars?: number;
  /** The narrow window of the run (16, or n for subsets), so 64-bit frames keep the same size. */
  baseWidth?: number;
  strips?: StripData[];
  /** The largest strips of the run (see stripsSizer); set by stabilizeBits. */
  stripsSizer?: StripData[];
}

const LABEL_W = 118;
const OP_W = 18;
const SIGN_W = 34;
const NARROW_PITCH = 30;
const ROW_H = 36;
const CELL_H = 28;
const TOP = 22;
const PAD = 8;
const CHAR_W = 7.4;

/** One picture size per run: the most rows of any frame and the longest value text. */
export function stabilizeBits<S extends BitRowsState>(frames: Array<Frame<S>>): Array<Frame<S>> {
  const rowSlots = Math.max(1, ...frames.map((f) => f.state.rows.length));
  const valueChars = Math.max(4, ...frames.flatMap((f) => f.state.rows.map((r) => r.value.length)));
  const narrow = frames.map((f) => f.state.width).filter((w) => w !== 64);
  const baseWidth = narrow.length ? Math.max(...narrow) : 16;
  const sizer = stripsSizer(frames.map((f) => f.state.strips));
  return frames.map((f) => ({ ...f, state: { ...f.state, rowSlots, valueChars, baseWidth, stripsSizer: sizer } }));
}

/**
 * Organism for bit manipulation: integers as rows of bits (bit 0 on the right) with the sign
 * bits that Python repeats forever on the left, an operator column, a rule above a result and
 * a band behind the bit being worked on. Bits are keyed, so shifts glide and a mask's single 1
 * slides into place. A 64-bit row uses narrow cells in the same total width.
 */
export function BitRows({ state }: { state: BitRowsState }) {
  const base = state.baseWidth ?? state.width;
  const area = Math.max(base, 1) * NARROW_PITCH;
  const wide = state.width === 64;
  const pitch = wide ? area / 64 : NARROW_PITCH;
  const cellW = wide ? pitch - 1 : pitch - 4;
  const bitsX = LABEL_W + OP_W + SIGN_W;
  const valueX = bitsX + area + 12;
  const width = valueX + (state.valueChars ?? 6) * CHAR_W + 22;
  const slots = state.rowSlots ?? Math.max(1, state.rows.length);
  const height = TOP + slots * ROW_H + PAD;
  const xOf = (pos: number) => bitsX + (state.width - 1 - pos) * pitch;
  const yOf = (row: number) => TOP + row * ROW_H;
  const heads = wide ? [63, 48, 32, 16, 0] : Array.from({ length: state.width }, (_, k) => state.width - 1 - k);

  return (
    <div className="bitrows-wrap">
      <svg
        className="bit-rows"
        viewBox={`0 0 ${width} ${height}`}
        style={{ width, maxWidth: '100%', minWidth: Math.min(width, 520) }}
        role="img"
        aria-label={state.label || 'No rows yet'}
      >
        {heads.map((p) => (
          <text key={`h${p}`} className="bitrows-head" x={xOf(p) + cellW / 2} y={10}>
            {p}
          </text>
        ))}
        {state.column && state.column.pos < state.width && (
          <rect
            className={`bitrows-band role-${state.column.role}`}
            x={xOf(state.column.pos) - (wide ? 1 : 2)}
            y={TOP - 4}
            width={cellW + (wide ? 2 : 4)}
            height={Math.max(1, state.rows.length) * ROW_H - ROW_H + CELL_H + 8}
            rx={5}
          />
        )}
        {state.rows.map((row, r) => {
          const y = yOf(r);
          const mid = y + CELL_H / 2;
          const glyph = row.role === 'good' ? SYM.check : row.role === 'bad' ? SYM.cross : null;
          return (
            <g key={`row-${row.key}`} className={`bitrows-row role-${row.role ?? 'idle'}${row.muted ? ' muted' : ''}`}>
              {row.rule && <line className="bitrows-rule" x1={bitsX - SIGN_W + 4} x2={bitsX + area} y1={y - 5} y2={y - 5} />}
              <text className="bitrows-label" x={LABEL_W - 6} y={mid}>
                {row.label}
              </text>
              {row.op && (
                <text className="bitrows-op" x={LABEL_W + OP_W / 2} y={mid}>
                  {row.op}
                </text>
              )}
              <text className={`bitrows-sign${row.sign ? ' one' : ''}`} x={bitsX - 6} y={mid}>
                {`${SYM.ellipsis}${row.sign}`}
              </text>
              <text className="bitrows-value" x={valueX} y={mid}>
                {row.value}
                {glyph && <tspan className="bitrows-glyph">{` ${glyph}`}</tspan>}
              </text>
            </g>
          );
        })}
        {state.rows.flatMap((row, r) =>
          row.bits.map((b) => {
            const role = b.role ?? 'idle';
            return (
              <g
                key={b.id}
                className={`bitrows-bit role-${role}${b.v ? ' one' : ''}${row.muted ? ' muted' : ''}${wide ? ' wide' : ''}`}
                style={{ transform: `translate(${xOf(b.pos).toFixed(1)}px, ${yOf(r)}px)` }}
              >
                <rect width={cellW} height={CELL_H} rx={wide ? 1.5 : 5} />
                {!wide && (
                  <text x={cellW / 2} y={CELL_H / 2 + 1}>
                    {b.v}
                  </text>
                )}
              </g>
            );
          }),
        )}
        {state.rows.length === 0 && (
          <text className="bitrows-empty" x={bitsX + area / 2} y={TOP + CELL_H / 2}>
            {state.width === 0 ? 'n = 0: no bits' : ''}
          </text>
        )}
      </svg>
      <StableStrips strips={state.strips} sizer={state.stripsSizer} />
    </div>
  );
}
