import type { Role } from '../core/types';
import { Cell } from '../ui/atoms/Cell';
import { Strips, type StripData } from '../ui/molecules/Strip';
import '../ui/roles.css';
import './GridMap.css';

export interface GridMapCell {
  kind: 'floor' | 'wall' | 'start' | 'goal';
  role: Role;
  /** Short text inside the cell: the f score, S / G, or the terrain cost. */
  text: string;
  /** Tooltip with the g / h / f values. */
  title?: string;
}

export interface GridMapState {
  rows: number;
  cols: number;
  /** Row-major. */
  cells: GridMapCell[];
  strips?: StripData[];
}

/** Organism: a 2D map (walls, start, goal, search frontier, path) assembled from Cell atoms. */
export function GridMap({ state }: { state: GridMapState }) {
  const label = `Map with ${state.rows} rows and ${state.cols} columns`;
  return (
    <div>
      <div className="gridmap-wrap">
        <div className="gridmap" role="img" aria-label={label} style={{ gridTemplateColumns: `repeat(${state.cols}, auto)` }}>
          {state.cells.map((c, i) => (
            <Cell
              key={i}
              wide
              value={c.kind === 'wall' ? '' : c.text}
              role={c.role === 'idle' ? undefined : c.role}
              erased={c.kind === 'wall'}
              pointer={c.kind === 'start' || c.kind === 'goal'}
              title={c.kind === 'wall' ? 'wall' : c.title}
            />
          ))}
        </div>
      </div>
      <Strips strips={state.strips} />
    </div>
  );
}
