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

interface CellRowProps {
  label: string;
  /** Blank cells before the first one (static alignment). */
  offset?: number;
  /** Slide the cells right by this many cell widths, animated (e.g. a pattern moving along a text). */
  shift?: number;
  wide?: boolean;
  children: ReactNode;
}

/** One labelled row of cells. Use `shift` for anything that should visibly slide between steps. */
export function CellRow({ label, offset = 0, shift = 0, wide, children }: CellRowProps) {
  return (
    <div className="cells-row">
      <span className="cells-label">{label}</span>
      {Array.from({ length: offset }, (_, k) => (
        <Cell key={`blank-${k}`} variant="blank" wide={wide} />
      ))}
      <div className={`cells-track${wide ? ' wide' : ''}`} style={{ transform: `translateX(calc(${shift} * var(--cell-step)))` }}>
        {children}
      </div>
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
