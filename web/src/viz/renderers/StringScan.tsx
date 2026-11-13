import { useLayoutEffect, useRef, type ReactNode } from 'react';
import type { Role } from '../core/types';
import { Cell } from '../ui/atoms/Cell';
import { useReducedMotion } from '../ui/hooks/useReducedMotion';
import { CellGap, CellGrid, CellRow, IndexRow } from '../ui/molecules/CellRow';
import { Strips, type StripData } from '../ui/molecules/Strip';
import { SYM } from '../ui/symbols';
import './StringScan.css';

export interface ScanCell {
  value: string | number | null;
  role?: Role;
  pointer?: boolean;
  /** Invisible spacer (keeps later cells in their columns). */
  blank?: boolean;
}

/**
 * One line of the picture. Cell rows may start `offset` columns to the right
 * (a pattern drawn under text[offset]); with `slide` they glide to a new offset
 * instead of jumping, so a moving window or a long shift is visible as motion.
 */
export type ScanRow =
  | { kind: 'cells'; label: string; cells: ScanCell[]; offset?: number; slide?: boolean }
  | { kind: 'index'; label: string; count: number; offset?: number }
  | { kind: 'gap' };

export interface StringScanState {
  /** What the picture shows, for screen readers. */
  label: string;
  rows: ScanRow[];
  /** A lookup table drawn below, not aligned with the text (e.g. the bad-character table). */
  table?: { title: string; rows: ScanRow[] };
  strips?: StripData[];
}

const show = (v: string | number | null) => (v === ' ' ? SYM.openBox : v);
const SLIDE_MS = 320;

/** Wraps a row's cells; when the row's offset changes, the cells glide from their old column (FLIP). */
function Sliding({ offset, children }: { offset: number; children: ReactNode }) {
  const ref = useRef<HTMLSpanElement>(null);
  const before = useRef<{ offset: number; x: number } | null>(null);
  const running = useRef<Animation | null>(null);
  const reducedMotion = useReducedMotion();

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const x = el.offsetLeft; // layout position: unaffected by transforms and scrolling
    const prev = before.current;
    before.current = { offset, x };
    if (!prev || prev.offset === offset || prev.x === x || reducedMotion || typeof el.animate !== 'function') return;
    running.current?.cancel();
    running.current = el.animate([{ transform: `translateX(${prev.x - x}px)` }, { transform: 'translateX(0)' }], {
      duration: SLIDE_MS,
      easing: 'cubic-bezier(0.2, 0.7, 0.3, 1)',
    });
  });

  return (
    <span ref={ref} className="scan-slide">
      {children}
    </span>
  );
}

function Rows({ rows }: { rows: ScanRow[] }) {
  return (
    <>
      {rows.map((row, r) => {
        if (row.kind === 'gap') return <CellGap key={`gap-${r}`} />;
        if (row.kind === 'index') return <IndexRow key={`index-${row.label}`} label={row.label} count={row.count} offset={row.offset} />;
        const cells = row.cells.map((c, k) =>
          c.blank ? <Cell key={k} variant="blank" /> : <Cell key={k} value={show(c.value)} role={c.role} pointer={c.pointer} />,
        );
        return (
          <CellRow key={`cells-${row.label}`} label={row.label} offset={row.offset}>
            {row.slide ? <Sliding offset={row.offset ?? 0}>{cells}</Sliding> : cells}
          </CellRow>
        );
      })}
    </>
  );
}

/**
 * Organism for string-scanning algorithms (naive search, Rabin-Karp,
 * Boyer-Moore, Z-algorithm): a text, a pattern sliding beneath it and any
 * number of aligned rows (window hashes, comparison counts, a Z-box, the
 * Z-array), plus an optional lookup table and strips. The tracer decides every
 * cell's role; this component only lays them out and animates the slides.
 */
export function StringScan({ state }: { state: StringScanState }) {
  const { label, rows, table, strips } = state;
  return (
    <div className="string-scan">
      <CellGrid label={label}>
        <Rows rows={rows} />
      </CellGrid>
      {table && (
        <div className="scan-table">
          <p className="scan-table-title">{table.title}</p>
          <CellGrid label={table.title}>
            <Rows rows={table.rows} />
          </CellGrid>
        </div>
      )}
      <Strips strips={strips} />
    </div>
  );
}
