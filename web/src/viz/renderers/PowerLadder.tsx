import type { Frame } from '../core/types';
import type { PowState } from '../algorithms/modularExponentiation';
import '../ui/roles.css';
import { monoW, StableStrips, stripSlots, SvgTable, tableHeight, tableWidth } from './numberTheoryShared';
import './PowerLadder.css';

const LABEL_W = 78;
const CW = 22;
const BH = 24;
const DIV = 12;
const DROPPED = 3;
const ROW_H = 18;
const MAX_ROWS = 13;
const TOP = 16;

/** One size for a whole run: the most bit slots, table rows, the widest text of each column and every strip at its widest. */
export function stabilizePower(frames: Array<Frame<PowState>>): Array<Frame<PowState>> {
  let slots = 1;
  let rows = 0;
  const cols: number[] = [];
  for (const f of frames) {
    for (const b of f.state.bits) slots = Math.max(slots, b.slot + 1);
    rows = Math.max(rows, f.state.table.rows.length);
    f.state.table.columns.forEach((c, i) => {
      cols[i] = Math.max(cols[i] ?? 0, c.length, ...f.state.table.rows.map((r) => r[i].text.length));
    });
  }
  const strips = stripSlots(frames);
  return frames.map((f) => ({ ...f, state: { ...f.state, stripSlots: strips, layout: { slots, rows, cols } } }));
}

/**
 * Organism for modular exponentiation: the exponent's bits in a row, lowest on the right, that
 * slides right as bits are consumed (the last three shifted-out bits fade past a divider), and
 * under it a table that grows one row per bit or per recursive call. A long table shows a
 * window around the row being worked on.
 */
export function PowerLadder({ state }: { state: PowState }) {
  const layout = state.layout ?? { slots: Math.max(1, ...state.bits.map((b) => b.slot + 1)), rows: state.table.rows.length, cols: state.table.columns.map((c) => c.length) };
  const fieldRight = LABEL_W + 4 + layout.slots * CW;
  const bitsW = fieldRight + DIV + DROPPED * CW;
  const colW = layout.cols.map((n) => Math.max(30, monoW(n) + 14));
  const windowed = layout.rows > MAX_ROWS;
  const shownRows = Math.min(layout.rows, MAX_ROWS);
  const tableTop = TOP + BH + 30;
  const tw = tableWidth(colW);
  const width = Math.max(bitsW, tw) + 4;
  const height = tableTop + tableHeight(Math.max(shownRows, 1), ROW_H) + (windowed ? 30 : 4);

  // The window: keep the row being worked on (the last one with a role in its first cells) in view.
  const rows = state.table.rows;
  let focus = rows.length - 1;
  rows.forEach((r, i) => {
    if (r.some((c) => c.role === 'active' || c.role === 'compare')) focus = i;
  });
  const start = windowed ? Math.max(0, Math.min(focus - Math.floor(MAX_ROWS / 2), rows.length - MAX_ROWS)) : 0;
  const visible = rows.slice(start, start + MAX_ROWS);
  const dropped = state.bits.some((b) => b.slot < 0);
  const bitX = (slot: number) => (slot >= 0 ? fieldRight - (slot + 1) * CW : fieldRight + DIV + (-slot - 1) * CW);
  const describe = `${state.bitsLabel}; table ${state.table.columns.join(', ')}: ${rows.map((r) => r.map((c) => c.text || '-').join(' ')).join('; ')}`;

  return (
    <div className="pl-wrap">
      <div className="pl-scroll">
        <svg className="nt-svg power-ladder" viewBox={`0 0 ${width} ${height}`} style={{ width, maxWidth: '100%', minWidth: Math.min(width, 440) }} role="img" aria-label={describe}>
          <text className="nt-label pl-rowlabel" x={LABEL_W - 4} y={TOP + BH / 2}>
            exponent
          </text>
          {dropped && <line className="pl-divider" x1={fieldRight + DIV / 2} y1={TOP - 3} x2={fieldRight + DIV / 2} y2={TOP + BH + 3} />}
          {state.bits.map((b) => (
            <g key={b.id} className={`pl-bit role-${b.role}${b.v ? ' one' : ''}${b.slot < 0 ? ' gone' : ''}`} style={{ transform: `translate(${bitX(b.slot)}px, ${TOP}px)` }}>
              <rect width={CW - 3} height={BH} rx={4} />
              <text x={(CW - 3) / 2} y={BH / 2}>
                {b.v}
              </text>
            </g>
          ))}
          <text className="pl-bitslabel" x={LABEL_W + 4} y={TOP + BH + 14}>
            {state.bitsLabel}
          </text>
          {dropped && (
            <text className="pl-dropped" x={fieldRight + DIV} y={TOP - 7}>
              shifted out
            </text>
          )}
          {windowed && (
            <text className="nt-note pl-more" x={0} y={tableTop - 2}>
              {start > 0 ? `${start} earlier row${start === 1 ? '' : 's'} above` : ''}
            </text>
          )}
          <SvgTable x={0} y={tableTop + (windowed ? 6 : 0)} columns={state.table.columns} colW={colW} rows={visible} rowH={ROW_H} />
          {windowed && (
            <text className="nt-note pl-more" x={0} y={height - 8}>
              {rows.length - start - visible.length > 0 ? `${rows.length - start - visible.length} more row${rows.length - start - visible.length === 1 ? '' : 's'} below` : ''}
            </text>
          )}
        </svg>
      </div>
      <StableStrips strips={state.strips} slots={state.stripSlots} />
    </div>
  );
}
