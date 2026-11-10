import type { ReactNode } from 'react';
import { Cell } from '../atoms/Cell';
import './CellRow.css';

/** Container for stacked cell rows; `label` describes the whole picture for screen readers. */
export function CellGrid({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="cells" role="img" aria-label={label}>
      {children}
    </div>
  );
}

/** One labelled row of cells, optionally shifted right by `offset` blank cells (e.g. a sliding pattern). */
export function CellRow({ label, offset = 0, wide, children }: { label: string; offset?: number; wide?: boolean; children: ReactNode }) {
  return (
    <div className="cells-row">
      <span className="cells-label">{label}</span>
      {Array.from({ length: offset }, (_, k) => (
        <Cell key={`blank-${k}`} variant="blank" wide={wide} />
      ))}
      {children}
    </div>
  );
}

/** Row of column numbers 0..count-1. */
export function IndexRow({ count, offset = 0, wide, label = 'index' }: { count: number; offset?: number; wide?: boolean; label?: string }) {
  return (
    <CellRow label={label} offset={offset} wide={wide}>
      {Array.from({ length: count }, (_, k) => (
        <Cell key={k} variant="index" value={k} wide={wide} />
      ))}
    </CellRow>
  );
}

export function CellGap() {
  return <div className="cells-gap" />;
}
