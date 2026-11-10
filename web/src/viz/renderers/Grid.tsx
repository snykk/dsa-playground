import type { Role } from '../core/types';
import { Strips, type StripData } from '../ui/molecules/Strip';
import '../ui/roles.css';
import { SYM } from '../ui/symbols';
import './Grid.css';

export interface GridState {
  corner?: string;
  rowHeaders: string[];
  colHeaders: string[];
  cells: Array<Array<number | string | null>>;
  /** Roles keyed by "row,col". */
  roles: Record<string, Role>;
  strips?: StripData[];
}

/** Organism: a table of values (DP tables, distance matrices) with role-highlighted cells. */
export function Grid({ state }: { state: GridState }) {
  return (
    <div>
      <div className="dp-wrap">
        <table className="dp-table">
          <thead>
            <tr>
              <th scope="col">{state.corner ?? ''}</th>
              {state.colHeaders.map((h, c) => (
                <th key={c} scope="col">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {state.cells.map((row, r) => (
              <tr key={r}>
                <th scope="row">{state.rowHeaders[r]}</th>
                {row.map((v, c) => {
                  const role = state.roles[`${r},${c}`];
                  return (
                    <td key={c} className={`${role ? `role-${role}` : ''}${v === null ? ' empty' : ''}`}>
                      {v ?? SYM.middot}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Strips strips={state.strips} />
    </div>
  );
}
