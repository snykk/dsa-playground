import type { Role } from '../core/types';
import { Cell } from '../ui/atoms/Cell';
import { CellGrid, CellRow, IndexRow } from '../ui/molecules/CellRow';
import { Strips, type StripData } from '../ui/molecules/Strip';
import { ArrayBars, type ArrayState } from './ArrayBars';

export interface SceneCell {
  value: string | number | null;
  role?: Role;
  pointer?: boolean;
}

export interface SceneRow {
  label: string;
  cells: SceneCell[];
  /** Blank cells before the first one (e.g. to align a window or a shifted array). */
  offset?: number;
}

export interface ArraySceneState {
  /** The main array as bars (pointers, ranges and roles as in ArrayBars). */
  array: ArrayState;
  /** Auxiliary arrays drawn as cell rows: prefix sums, a count array, a 1-D DP table... */
  rows?: SceneRow[];
  /** Show column numbers above the cell rows. */
  rowIndices?: number;
  /** Labelled token lists: a stack, a deque, buckets, the current window... */
  strips?: StripData[];
}

/**
 * Organism for array algorithms that track more than the array itself:
 * bars for the main array, optional cell rows for auxiliary arrays and
 * optional strips for containers. Built only from shared atoms/molecules.
 */
export function ArrayScene({ state }: { state: ArraySceneState }) {
  const { array, rows = [], rowIndices, strips } = state;
  return (
    <div>
      <ArrayBars state={array} />
      {rows.length > 0 && (
        <CellGrid label={rows.map((r) => r.label).join(', ')}>
          {rowIndices !== undefined && <IndexRow count={rowIndices} />}
          {rows.map((row) => (
            <CellRow key={row.label} label={row.label} offset={row.offset}>
              {row.cells.map((c, i) => (
                <Cell key={i} value={c.value} role={c.role} pointer={c.pointer} />
              ))}
            </CellRow>
          ))}
        </CellGrid>
      )}
      <Strips strips={strips} />
    </div>
  );
}
