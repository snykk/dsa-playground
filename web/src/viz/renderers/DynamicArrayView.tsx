import type { Frame, Role } from '../core/types';
import { Cell } from '../ui/atoms/Cell';
import { Strips, type StripData } from '../ui/molecules/Strip';
import '../ui/roles.css';
import './DynamicArrayView.css';

/** One contiguous block of slots: the array's current storage, or the new block of a resize. */
export interface ArrayBlockView {
  /** Stable identity: a block keeps its id when it moves, so the new block slides into place. */
  id: string;
  /** Name in front of the row, e.g. "A" or "B". */
  label: string;
  /** Second line under the name, e.g. "capacity 8". */
  sub?: string;
  capacity: number;
  /** Row of the picture, 0 first. */
  row: number;
  role?: Role;
}

/** A value sitting in a slot, or lifted above the first row while it is written or removed. */
export interface ArrayValueView {
  /** Stable identity: a value keeps its id, so it glides when it is copied into a new block. */
  id: string | number;
  value: string | number;
  /** Slot index. */
  col: number;
  /** Row of the block it sits in; a negative fraction lifts it above the first row. */
  row: number;
  role?: Role;
  /** Faded: a stale copy left in the old block, or a value on its way out. */
  ghost?: boolean;
}

/** A named index under a slot of a row: "n" (the next free slot), "k"... */
export interface ArrayMarkerView {
  name: string;
  col: number;
  row?: number;
  role?: Role;
}

export interface DynamicArrayState {
  blocks: ArrayBlockView[];
  values: ArrayValueView[];
  markers?: ArrayMarkerView[];
  /** One line under the picture. */
  note?: string;
  strips?: StripData[];
  /** Set by stabilizeArray: columns and rows the whole run needs. */
  extent?: { cols: number; rows: number };
}

const UP = String.fromCodePoint(0x2191);
const LABEL_W = 78;
const STEP = 34;
const CELL_W = 30;
const INDEX_H = 16;
const CELL_H = 32;
const ROW_H = 92;
/** Room above the first row for a lifted value. */
const TOP = 56;
const PAD = 8;

function extentOf(s: DynamicArrayState): { cols: number; rows: number } {
  const cols = Math.max(
    1,
    ...s.blocks.map((b) => b.capacity),
    ...s.values.map((v) => Math.ceil(v.col) + 1),
    ...(s.markers ?? []).map((m) => m.col + 1),
  );
  const rows = Math.max(1, ...s.blocks.map((b) => b.row + 1), ...s.values.map((v) => Math.ceil(v.row) + 1));
  return { cols, rows };
}

/** Give every frame the extent of the whole run, so the picture keeps its size. Call it from the spec's trace(). */
export function stabilizeArray<S extends DynamicArrayState>(frames: Array<Frame<S>>): Array<Frame<S>> {
  let cols = 1;
  let rows = 1;
  for (const f of frames) {
    const e = extentOf(f.state);
    cols = Math.max(cols, e.cols);
    rows = Math.max(rows, e.rows);
  }
  return frames.map((f) => ({ ...f, state: { ...f.state, extent: { cols, rows } } }));
}

function describe(s: DynamicArrayState): string {
  return s.blocks
    .map((b) => {
      const cells = Array.from({ length: b.capacity }, (_, i) => {
        const v = s.values.find((x) => !x.ghost && x.row === b.row && x.col === i);
        return v ? String(v.value) : 'empty';
      });
      return `${b.label}, ${b.sub ?? `capacity ${b.capacity}`}: ${cells.join(', ')}`;
    })
    .join('; ');
}

const at = (x: number, y: number) => ({ transform: `translate(${x}px, ${y}px)` });

/**
 * Organism: an array as rows of slots (a block per row) with the values drawn on top. Values
 * keep their ids, so a resize shows every element gliding from the old block into the new one,
 * and the new block then slides up to replace the old. Empty slots are dashed: allocated
 * capacity that holds no element.
 */
export function DynamicArrayView({ state }: { state: DynamicArrayState }) {
  const { blocks, values, markers = [], note, strips } = state;
  const own = extentOf(state);
  const ext = state.extent ? { cols: Math.max(own.cols, state.extent.cols), rows: Math.max(own.rows, state.extent.rows) } : own;
  const width = LABEL_W + ext.cols * STEP + PAD;
  const height = TOP + ext.rows * ROW_H;
  const rowY = (row: number) => TOP + row * ROW_H;
  // Stable DOM order, so a value that moves is the same element and its transition runs.
  const ordered = [...values].sort((a, b) => String(a.id).localeCompare(String(b.id)));
  const stacked = new Map<string, number>();

  return (
    <div className="dyn-array-wrap">
      <div className="dyn-array" style={{ width, height }} role="img" aria-label={describe(state)}>
        {blocks.map((b) => (
          <div key={b.id} className={`dyn-block role-${b.role ?? 'idle'}`} style={at(0, rowY(b.row))}>
            <span className="dyn-name">
              <strong>{b.label}</strong>
              {b.sub && <small>{b.sub}</small>}
            </span>
            <span className="dyn-indices" style={{ left: LABEL_W }}>
              {Array.from({ length: b.capacity }, (_, i) => (
                <Cell key={i} variant="index" value={i} />
              ))}
            </span>
            <span className="dyn-slots" style={{ left: LABEL_W, top: INDEX_H }}>
              {Array.from({ length: b.capacity }, (_, i) => (
                <Cell key={i} value="" />
              ))}
            </span>
          </div>
        ))}
        {ordered.map((v) => (
          <div key={v.id} className={`dyn-value${v.ghost ? ' ghost' : ''}`} style={at(LABEL_W + v.col * STEP, rowY(v.row) + INDEX_H)}>
            <Cell value={v.value} role={v.role === 'idle' ? undefined : v.role} />
          </div>
        ))}
        {markers.map((m) => {
          const key = `${m.row ?? 0}:${m.col}`;
          const level = stacked.get(key) ?? 0;
          stacked.set(key, level + 1);
          return (
            <div
              key={m.name}
              className={`dyn-marker role-${m.role ?? 'idle'}`}
              style={at(LABEL_W + m.col * STEP, rowY(m.row ?? 0) + INDEX_H + CELL_H + 2 + level * 14)}
            >
              <span style={{ width: CELL_W }}>
                {level === 0 ? `${UP} ` : ''}
                {m.name}
              </span>
            </div>
          );
        })}
      </div>
      {note && <p className="dyn-note">{note}</p>}
      <Strips strips={strips} />
    </div>
  );
}
