import { useLayoutEffect, useRef, type ReactNode } from 'react';
import type { Frame, Role } from '../core/types';
import { Cell } from '../ui/atoms/Cell';
import { useReducedMotion } from '../ui/hooks/useReducedMotion';
import { Strips, type StripData } from '../ui/molecules/Strip';
import { SYM } from '../ui/symbols';
import '../ui/roles.css';
import './StringOpsView.css';

export interface StrCellView {
  /** Stable identity: a character keeps its id across frames, so it glides when it moves. */
  id: string;
  /** One character ("" for nothing); a slot may hold a hint such as "''". */
  ch: string;
  row: number;
  col: number;
  role?: Role;
  /** An empty slot: allocated but not written yet, drawn dashed. */
  slot?: boolean;
  /** Where the cell comes from when it first appears: a copied character glides out of its source. */
  from?: { row: number; col: number };
}

export interface StrRowView {
  row: number;
  /** Name in front of the row: s, t, s[::-1], result, parts... */
  label: string;
  /** The string object's stored length, drawn as a box in front of its characters. */
  len?: number;
  lenRole?: Role;
  /** Faded: a string that is no longer used. */
  ghost?: boolean;
}

/** A small label above or below one column of a row: an index, a negative index, a position. */
export interface StrTickView {
  row: number;
  col: number;
  text: string | number;
  side: 'above' | 'below';
  role?: Role;
}

/** A named position (i, start, end, read, write...) with an arrow pointing at one column. */
export interface StrMarkerView {
  /** Identity (the marker glides when its column changes) and, unless `text` is given, its label. */
  name: string;
  /** Label shown instead of the name, e.g. "start = -3". */
  text?: string;
  row: number;
  col: number;
  side?: 'above' | 'below';
  role?: Role;
}

export interface StringOpsRowExtent {
  row: number;
  above: number;
  below: number;
  ticksAbove: boolean;
  ticksBelow: boolean;
}

/** Room the whole run needs, so the picture keeps its size from step to step. */
export interface StringOpsExtent {
  minCol: number;
  maxCol: number;
  len: boolean;
  rows: StringOpsRowExtent[];
}

export interface StringOpsState {
  cells: StrCellView[];
  rows: StrRowView[];
  ticks?: StrTickView[];
  markers?: StrMarkerView[];
  strips?: StripData[];
  /** Set by stabilizeStrings; never needed by a tracer. */
  extent?: StringOpsExtent;
}

/** A Cell is 30px wide; columns are 3px apart, as in CellRow. */
const COL = 33;
const CELL_H = 32;
const LABEL_W = 80;
const LEN_W = 50;
const TICK_H = 18;
const MARK_LINE = 15;
const MARK_ARROW = 9;
const ROW_GAP = 12;
const PAD = 6;
const GLIDE_MS = 380;

const show = (ch: string) => (ch === ' ' ? SYM.openBox : ch);

/** Stack position of every marker: markers on the same column and side stack outwards. */
function stacking(markers: StrMarkerView[]): Map<string, number> {
  const seen = new Map<string, number>();
  const out = new Map<string, number>();
  for (const m of markers) {
    const key = `${m.row}|${m.col}|${m.side ?? 'above'}`;
    const k = seen.get(key) ?? 0;
    seen.set(key, k + 1);
    out.set(m.name, k);
  }
  return out;
}

function extentOf(state: StringOpsState): StringOpsExtent {
  const { cells, rows, ticks = [], markers = [] } = state;
  const cols = [0, ...cells.map((c) => c.col), ...ticks.map((t) => t.col), ...markers.map((m) => m.col)];
  const rowIds = new Set([...rows.map((r) => r.row), ...cells.map((c) => c.row), ...ticks.map((t) => t.row), ...markers.map((m) => m.row)]);
  const stack = stacking(markers);
  const ext = [...rowIds].sort((a, b) => a - b).map((row) => {
    const depth = (side: 'above' | 'below') =>
      Math.max(0, ...markers.filter((m) => m.row === row && (m.side ?? 'above') === side).map((m) => (stack.get(m.name) ?? 0) + 1));
    return {
      row,
      above: depth('above'),
      below: depth('below'),
      ticksAbove: ticks.some((t) => t.row === row && t.side === 'above'),
      ticksBelow: ticks.some((t) => t.row === row && t.side === 'below'),
    };
  });
  return { minCol: Math.min(...cols), maxCol: Math.max(...cols), len: rows.some((r) => r.len !== undefined), rows: ext };
}

function union(a: StringOpsExtent, b: StringOpsExtent | undefined): StringOpsExtent {
  if (!b) return a;
  const rows = new Map<number, StringOpsRowExtent>();
  for (const r of [...a.rows, ...b.rows]) {
    const o = rows.get(r.row);
    rows.set(
      r.row,
      o
        ? { row: r.row, above: Math.max(o.above, r.above), below: Math.max(o.below, r.below), ticksAbove: o.ticksAbove || r.ticksAbove, ticksBelow: o.ticksBelow || r.ticksBelow }
        : r,
    );
  }
  return {
    minCol: Math.min(a.minCol, b.minCol),
    maxCol: Math.max(a.maxCol, b.maxCol),
    len: a.len || b.len,
    rows: [...rows.values()].sort((x, y) => x.row - y.row),
  };
}

/**
 * Give every frame of a run the same extent (columns, rows and the room each row needs for
 * labels), so the picture keeps its size while strings are built and discarded. Call it
 * from the spec's trace().
 */
export function stabilizeStrings(frames: Array<Frame<StringOpsState>>): Array<Frame<StringOpsState>> {
  let all: StringOpsExtent | undefined;
  for (const f of frames) all = union(extentOf(f.state), all);
  if (!all) return frames;
  const extent = all;
  return frames.map((f) => ({ ...f, state: { ...f.state, extent } }));
}

interface RowBox {
  cellsY: number;
  ticksAboveY: number;
  ticksBelowY: number;
  tipAbove: number;
  tipBelow: number;
}

function layout(ext: StringOpsExtent) {
  const boxes = new Map<number, RowBox>();
  let y = PAD;
  for (const r of ext.rows) {
    const markAbove = r.above > 0 ? MARK_ARROW + r.above * MARK_LINE : 0;
    const tickAbove = r.ticksAbove || ext.len ? TICK_H : 0;
    const tickBelow = r.ticksBelow ? TICK_H : 0;
    const markBelow = r.below > 0 ? MARK_ARROW + r.below * MARK_LINE : 0;
    const cellsY = y + markAbove + tickAbove;
    boxes.set(r.row, {
      cellsY,
      ticksAboveY: cellsY - TICK_H,
      ticksBelowY: cellsY + CELL_H,
      tipAbove: cellsY - tickAbove,
      tipBelow: cellsY + CELL_H + tickBelow,
    });
    y = cellsY + CELL_H + tickBelow + markBelow + ROW_GAP;
  }
  const left = LABEL_W + (ext.len ? LEN_W : 0);
  return {
    boxes,
    x: (col: number) => left + (col - ext.minCol) * COL,
    width: left + (ext.maxCol - ext.minCol + 1) * COL + PAD,
    height: y - ROW_GAP + PAD,
  };
}

/** An absolutely placed item that glides (CSS transition) when it moves; with `from`, it glides in when it first appears. */
function Glide({ x, y, from, className, children }: { x: number; y: number; from?: { x: number; y: number }; className: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !from || reducedMotion || typeof el.animate !== 'function') return;
    el.animate([{ transform: `translate(${from.x}px, ${from.y}px)` }, { transform: `translate(${x}px, ${y}px)` }], {
      duration: GLIDE_MS,
      easing: 'cubic-bezier(0.2, 0.7, 0.3, 1)',
    });
    // Only when the item first appears; later moves are CSS transitions.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div ref={ref} className={className} style={{ transform: `translate(${x}px, ${y}px)` }}>
      {children}
    </div>
  );
}

function describe(state: StringOpsState): string {
  const parts = [...state.rows]
    .sort((a, b) => a.row - b.row)
    .map((r) => {
      const chars = state.cells
        .filter((c) => c.row === r.row && !c.slot)
        .sort((a, b) => a.col - b.col)
        .map((c) => c.ch)
        .join('');
      return `${r.label}: "${chars}"`;
    });
  return parts.length ? `Strings. ${parts.join('; ')}` : 'Strings';
}

/**
 * Organism: strings as rows of character cells (the Cell atom), with index labels, named
 * positions (i, start, end, read, write...) and an optional stored-length box per string.
 * Every character keeps an id, so a copy glides from its source cell into the new string and
 * a string that is rebound moves to its new row: the reader sees which characters a call
 * reads, copies or creates.
 */
export function StringOpsView({ state }: { state: StringOpsState }) {
  const ext = union(extentOf(state), state.extent);
  const { boxes, x, width, height } = layout(ext);
  const ghost = new Set(state.rows.filter((r) => r.ghost).map((r) => r.row));
  const at = (row: number, col: number) => ({ x: x(col), y: boxes.get(row)?.cellsY ?? 0 });
  const stack = stacking(state.markers ?? []);

  return (
    <div className="string-ops">
      <div className="so-stage" style={{ width, height }} role="img" aria-label={describe(state)}>
        {state.rows.map((r) => {
          const box = boxes.get(r.row);
          if (!box) return null;
          return (
            <div key={`row${r.row}`} className={`so-row${r.ghost ? ' ghost' : ''}`}>
              <span className="so-label" style={{ top: box.cellsY, width: LABEL_W - 10, height: CELL_H }}>
                {r.label}
              </span>
              {r.len !== undefined && (
                <>
                  <span className="so-len-caption" style={{ top: box.cellsY - TICK_H, left: LABEL_W, width: 40 }}>
                    len
                  </span>
                  <div className="so-len" style={{ top: box.cellsY, left: LABEL_W }}>
                    <Cell value={r.len} role={r.lenRole} wide title="the stored length" />
                  </div>
                </>
              )}
            </div>
          );
        })}
        {(state.ticks ?? []).map((t) => {
          const box = boxes.get(t.row);
          if (!box) return null;
          return (
            <Glide key={`tick${t.row}|${t.side}|${t.col}`} className="so-item so-tick" x={x(t.col)} y={t.side === 'above' ? box.ticksAboveY : box.ticksBelowY}>
              <Cell variant="index" value={t.text} role={t.role} />
            </Glide>
          );
        })}
        {state.cells.map((c) => {
          const p = at(c.row, c.col);
          const from = c.from ? at(c.from.row, c.from.col) : undefined;
          return (
            <Glide key={c.id} className={`so-item so-cell${ghost.has(c.row) ? ' ghost' : ''}`} x={p.x} y={p.y} from={from}>
              {c.slot && (c.role === undefined || c.role === 'idle') ? <span className="so-slot">{c.ch}</span> : <Cell value={show(c.ch)} role={c.role} />}
            </Glide>
          );
        })}
        {(state.markers ?? []).map((m) => {
          const box = boxes.get(m.row);
          if (!box) return null;
          const side = m.side ?? 'above';
          const k = stack.get(m.name) ?? 0;
          const y = side === 'above' ? box.tipAbove - MARK_ARROW - (k + 1) * MARK_LINE : box.tipBelow + (k === 0 ? 0 : MARK_ARROW + k * MARK_LINE);
          return (
            <Glide key={`m:${m.name}`} className={`so-item so-marker role-${m.role ?? 'idle'}`} x={x(m.col) + 15} y={y}>
              <span className="so-marker-inner">
                {side === 'below' && k === 0 && <span className="so-arrow up" />}
                <span className="so-marker-name">{m.text ?? m.name}</span>
                {side === 'above' && k === 0 && <span className="so-arrow down" />}
              </span>
            </Glide>
          );
        })}
      </div>
      <Strips strips={state.strips} />
    </div>
  );
}
