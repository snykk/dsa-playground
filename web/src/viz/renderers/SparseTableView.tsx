import type { Role } from '../core/types';
import { Cell } from '../ui/atoms/Cell';
import { CellGap, CellGrid, CellRow, IndexRow } from '../ui/molecules/CellRow';
import { Strips, type StripData } from '../ui/molecules/Strip';
import './SparseTableView.css';

export interface SparseCell {
  value: string | number;
  role?: Role;
  title?: string;
}

/** A window of the array: the elements it covers, drawn from column `start`; it slides when `start` changes. */
export interface SparseWindow {
  start: number;
  cells: SparseCell[];
}

export interface SparseTableState {
  /** What the picture shows, for screen readers. */
  label: string;
  arr: SparseCell[];
  /** Label of the array row; "a" when left out. */
  arrLabel?: string;
  /** More rows indexed like the array, drawn under it (the depths along an Euler tour). */
  rows?: Array<{ label: string; cells: SparseCell[] }>;
  /** Two window rows, always drawn (empty when null) so the picture keeps its height. */
  windows: [SparseWindow | null, SparseWindow | null];
  windowLabels: [string, string];
  /** table[i][j] by level: levels[j][i]. */
  levels: Array<{ label: string; cells: SparseCell[] }>;
  note?: string;
  strips?: StripData[];
}

/**
 * Organism for a sparse table: the array (with any rows indexed like it underneath), two window
 * rows that slide along it (the halves a cell is built from, or the two windows a query reads)
 * and the table, one row per level j (windows of length 2^j). Built from the Cell atom and the
 * CellRow molecules.
 */
export function SparseTableView({ state }: { state: SparseTableState }) {
  const { arr, rows, windows, windowLabels, levels, note, strips } = state;
  return (
    <div>
      <div className="sparse-view">
        <CellGrid label={state.label}>
          <IndexRow count={arr.length} label="i" />
          <CellRow label={state.arrLabel ?? 'a'}>
            {arr.map((c, i) => (
              <Cell key={i} value={c.value} role={c.role} title={c.title} />
            ))}
          </CellRow>
          {(rows ?? []).map((row) => (
            <CellRow key={`x${row.label}`} label={row.label}>
              {row.cells.map((c, i) => (
                <Cell key={i} value={c.value} role={c.role} title={c.title} />
              ))}
            </CellRow>
          ))}
          {windows.map((w, k) => (
            <CellRow key={`w${k}`} label={w ? windowLabels[k] : ''} shift={w?.start ?? 0}>
              {w && w.cells.length > 0 ? w.cells.map((c, i) => <Cell key={i} value={c.value} role={c.role} title={c.title} />) : <Cell variant="blank" />}
            </CellRow>
          ))}
          <CellGap />
          {levels.map((row, j) => (
            <CellRow key={`j${j}`} label={row.label}>
              {row.cells.map((c, i) => (
                <Cell key={i} value={c.value} role={c.role} title={c.title} />
              ))}
            </CellRow>
          ))}
        </CellGrid>
      </div>
      {note && <p className="sparse-note">{note}</p>}
      <Strips strips={strips} />
    </div>
  );
}
