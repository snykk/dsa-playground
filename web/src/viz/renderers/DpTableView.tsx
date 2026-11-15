import type { Role } from '../core/types';
import { Strips, type StripData } from '../ui/molecules/Strip';
import '../ui/roles.css';
import { SYM } from '../ui/symbols';
import './DpTableView.css';

/** One cell of a table; null in a table means "not written yet" (a faint dot). */
export interface DtCell {
  text: string;
  role?: Role;
}

/** A labelled table of cells: a DP table, a memo, a distance matrix. */
export interface DtTable {
  id: string;
  title?: string;
  corner?: string;
  rowHeaders: string[];
  colHeaders: string[];
  cells: Array<Array<DtCell | null>>;
  /** Roles of row / column headers (the current mask, the column being read). */
  rowRoles?: Record<number, Role>;
  colRoles?: Record<number, Role>;
  /** Cell width in px (default 32). */
  cellW?: number;
}

/** A chip: one bit of a mask, one digit of a number. */
export interface DtChip {
  text: string;
  /** Small text under the chip (its index, its city name). */
  sub?: string;
  role?: Role;
}

export interface DtChipRow {
  label: string;
  chips: DtChip[];
}

export interface DpTableState {
  /** What the picture shows, for screen readers. */
  label: string;
  /** Rows of chips above the tables. */
  chips?: DtChipRow[];
  /** Tables, left to right; a row that would get too wide wraps. */
  tables: DtTable[];
  note?: string;
  strips?: StripData[];
}

const PAD = 8;
const CELL_H = 22;
const HEAD_H = 18;
const TITLE_H = 18;
const GAP = 22;
const ROW_GAP = 14;
const MAX_ROW_W = 820;
const CHIP_W = 30;
const CHIP_H = 24;
const CHIP_GAP = 5;
const CHAR = 7;

const textW = (s: string) => s.length * CHAR;

interface TableBox {
  table: DtTable;
  x: number;
  y: number;
  headW: number;
  cellW: number;
  width: number;
  height: number;
}

interface ChipBox {
  row: DtChipRow;
  y: number;
  labelW: number;
  chipW: number[];
  hasSub: boolean;
}

export interface DtGeometry {
  width: number;
  height: number;
  chips: ChipBox[];
  tables: TableBox[];
}

/** Chip rows on top, then the tables in rows (left to right, wrapping past MAX_ROW_W), each row centred. */
export function dpTableGeometry(state: Pick<DpTableState, 'chips' | 'tables'>): DtGeometry {
  const chipRows = state.chips ?? [];
  const labelW = Math.max(0, ...chipRows.map((r) => textW(r.label) + 12));
  let y = PAD;
  const chips: ChipBox[] = chipRows.map((row) => {
    const hasSub = row.chips.some((c) => c.sub !== undefined);
    const box = { row, y, labelW, chipW: row.chips.map((c) => Math.max(CHIP_W, textW(c.text) + 12)), hasSub };
    y += CHIP_H + (hasSub ? 13 : 0) + 8;
    return box;
  });
  const chipsW = Math.max(0, ...chips.map((c) => c.labelW + c.chipW.reduce((s, w) => s + w + CHIP_GAP, 0)));
  if (chips.length) y += 4;

  const sized = state.tables.map((table) => {
    const cellW = table.cellW ?? 32;
    const headW = Math.max(textW(table.corner ?? ''), ...table.rowHeaders.map(textW)) + 12;
    const width = Math.max(headW + table.colHeaders.length * cellW, table.title ? textW(table.title) * 0.95 : 0);
    const height = (table.title ? TITLE_H : 0) + HEAD_H + table.rowHeaders.length * CELL_H;
    return { table, cellW, headW, width, height };
  });
  // Pack the tables into rows.
  const rows: Array<typeof sized> = [];
  for (const t of sized) {
    const last = rows[rows.length - 1];
    const used = last ? last.reduce((s, u) => s + u.width, 0) + GAP * last.length : 0;
    if (last && used + t.width <= MAX_ROW_W) last.push(t);
    else rows.push([t]);
  }
  const rowWidths = rows.map((r) => r.reduce((s, u) => s + u.width, 0) + GAP * Math.max(0, r.length - 1));
  const width = Math.max(chipsW, ...rowWidths, 120) + 2 * PAD;
  const tables: TableBox[] = [];
  rows.forEach((r, k) => {
    let x = PAD + (width - 2 * PAD - rowWidths[k]) / 2;
    const h = Math.max(...r.map((u) => u.height));
    for (const u of r) {
      tables.push({ ...u, x, y });
      x += u.width + GAP;
    }
    y += h + ROW_GAP;
  });
  return { width, height: y - ROW_GAP + PAD, chips, tables };
}

const glyphOf = (role: Role | undefined) => (role === 'good' ? SYM.check : role === 'bad' ? SYM.cross : null);

function Table({ box }: { box: TableBox }) {
  const { table, x, y, headW, cellW } = box;
  const top = y + (table.title ? TITLE_H : 0);
  const cellsTop = top + HEAD_H;
  return (
    <g className="dt-table">
      {table.title && (
        <text className="dt-title" x={x} y={y + 8}>
          {table.title}
        </text>
      )}
      {table.corner && (
        <text className="dt-corner" x={x + headW - 8} y={top + HEAD_H / 2}>
          {table.corner}
        </text>
      )}
      {table.colHeaders.map((h, c) => (
        <text key={`c${c}`} className={`dt-head role-${table.colRoles?.[c] ?? 'idle'}`} x={x + headW + c * cellW + cellW / 2} y={top + HEAD_H / 2}>
          {h}
        </text>
      ))}
      {table.rowHeaders.map((h, r) => {
        const role = table.rowRoles?.[r];
        return (
          <g key={`r${r}`} className={`dt-rowhead role-${role ?? 'idle'}`}>
            {role && role !== 'idle' && <rect x={x} y={cellsTop + r * CELL_H + 1} width={headW - 4} height={CELL_H - 2} rx={4} />}
            <text x={x + headW - 8} y={cellsTop + r * CELL_H + CELL_H / 2}>
              {h}
            </text>
          </g>
        );
      })}
      {table.cells.map((row, r) =>
        row.map((cell, c) => {
          const cx = x + headW + c * cellW;
          const cy = cellsTop + r * CELL_H;
          const role = cell?.role ?? 'idle';
          const glyph = glyphOf(cell?.role);
          return (
            <g key={`${r},${c}`} className={`dt-cell role-${role}${cell ? '' : ' empty'}`}>
              <rect x={cx + 1} y={cy + 1} width={cellW - 2} height={CELL_H - 2} rx={4} />
              <text x={cx + cellW / 2} y={cy + CELL_H / 2}>
                {cell ? cell.text : SYM.middot}
              </text>
              {glyph && (
                <text className="dt-glyph" x={cx + cellW - 3} y={cy + 3}>
                  {glyph}
                </text>
              )}
            </g>
          );
        }),
      )}
    </g>
  );
}

/**
 * Organism: one or more DP tables drawn as SVG cells (a memo, a mask x city table, a distance
 * matrix), with rows of chips above them (the bits of a mask, the digits of a bound). Cells and
 * chips carry roles; a cell being written pops, a cell being read gets a strong outline, and a
 * check / cross marks status cells, so colour never carries the meaning alone. Everything is one
 * SVG, so a large table scales down with the stage instead of overflowing it.
 */
export function DpTableView({ state }: { state: DpTableState }) {
  const g = dpTableGeometry(state);
  return (
    <div className="dt-wrap">
      <svg className="dt-view" viewBox={`0 0 ${g.width} ${g.height}`} style={{ width: g.width, maxWidth: '100%' }} role="img" aria-label={state.label}>
        {g.chips.map((cb, k) => {
          let x = PAD + cb.labelW;
          return (
            <g key={`chips${k}`} className="dt-chips">
              <text className="dt-chiplabel" x={PAD + cb.labelW - 10} y={cb.y + CHIP_H / 2}>
                {cb.row.label}
              </text>
              {cb.row.chips.map((chip, i) => {
                const w = cb.chipW[i];
                const x0 = x;
                x += w + CHIP_GAP;
                const glyph = glyphOf(chip.role);
                return (
                  <g key={i} className={`dt-chip role-${chip.role ?? 'idle'}`}>
                    <rect x={x0} y={cb.y} width={w} height={CHIP_H} rx={12} />
                    <text x={x0 + w / 2} y={cb.y + CHIP_H / 2}>
                      {chip.text}
                    </text>
                    {chip.sub !== undefined && (
                      <text className="dt-chipsub" x={x0 + w / 2} y={cb.y + CHIP_H + 7}>
                        {chip.sub}
                      </text>
                    )}
                    {glyph && (
                      <text className="dt-glyph" x={x0 + w - 2} y={cb.y + 2}>
                        {glyph}
                      </text>
                    )}
                  </g>
                );
              })}
            </g>
          );
        })}
        {g.tables.map((box) => (
          <Table key={box.table.id} box={box} />
        ))}
      </svg>
      {state.note && <p className="dt-note">{state.note}</p>}
      <Strips strips={state.strips} />
    </div>
  );
}
