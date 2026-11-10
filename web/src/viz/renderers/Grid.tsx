import type { Role } from '../core/types';
import { Strips } from './GraphView';
import type { StripItem } from './GraphView';

export interface GridState {
  corner?: string;
  rowHeaders: string[];
  colHeaders: string[];
  cells: Array<Array<number | string | null>>;
  /** Roles keyed by "row,col". */
  roles: Record<string, Role>;
  strips?: Array<{ label: string; items: StripItem[] }>;
}

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
                      {v ?? '\u00b7'}
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
