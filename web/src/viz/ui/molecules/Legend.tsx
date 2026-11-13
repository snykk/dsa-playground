import type { Role } from '../../core/types';
import { Swatch } from '../atoms/Swatch';
import './Legend.css';

export interface LegendEntry {
  role: Role;
  label: string;
}

/** Always shown with a visualization so color is never the only way to read a role. */
export function Legend({ entries }: { entries: LegendEntry[] }) {
  return (
    <ul className="viz-legend" aria-label="Legend">
      {entries.map((l) => (
        <li key={l.label}>
          <Swatch role={l.role} />
          {l.label}
        </li>
      ))}
    </ul>
  );
}
