import type { Frame, Role } from '../core/types';
import { Cell } from '../ui/atoms/Cell';
import { Strips, type StripData } from '../ui/molecules/Strip';
import '../ui/roles.css';
import './ArrayTrack.css';

export type TrackId = number | string;

export interface TrackItemView {
  /** Stable identity: an item keeps its id across frames, so it glides when it moves. */
  id: TrackId;
  value: string | number;
  /** Slot index in its row; -1 is the parking spot left of slot 0. */
  slot: number;
  /** 0 (default): in the array. -1: lifted above it (arriving or leaving). 1: in a second block under it. */
  row?: -1 | 0 | 1;
  role?: Role;
  /** Faded: removed, drawn one more step. */
  ghost?: boolean;
}

export interface TrackBlockView {
  /** Stable identity: a block that moves from row 1 to row 0 glides up (a new allocation replacing the old one). */
  id: TrackId;
  row: 0 | 1;
  /** Number of slots in the block. */
  slots: number;
  /** Short label in front of the row ("list", "new block"). */
  label?: string;
  /**
   * Text shown in a slot that holds no item, e.g. "None" for a preallocated Python list.
   * Without it, empty slots are spare capacity: blank and dashed.
   */
  emptyText?: string;
  /** Outline roles for single slots, e.g. the slot a bounds check looks at. */
  slotRoles?: Record<number, Role>;
  /** Faded: a block being freed. */
  ghost?: boolean;
}

export interface TrackPointerView {
  /** Name and identity: top, front, back, len... Pointers glide when their slot changes. */
  name: string;
  /**
   * Slot index in row 0; -1 parks it left of slot 0 (an empty stack's top = -1). A pointer in
   * the bad role past the end of the array marks a slot that does not exist: a dashed outline.
   */
  slot: number;
  role?: Role;
}

/** Space a run keeps for its whole length, so the picture does not resize between steps. */
export interface TrackExtent {
  slots: number;
  parking: boolean;
  lifted: boolean;
  second: boolean;
  labels: boolean;
  pointerLines: number;
}

export interface ArrayTrackState {
  blocks: TrackBlockView[];
  items: TrackItemView[];
  pointers?: TrackPointerView[];
  /** One line under the picture. */
  note?: string;
  strips?: StripData[];
  /** Set by stabilizeTrack; never needed by a tracer. */
  extent?: TrackExtent;
}

const CW = 30;
const CH = 32;
const STEP = 34;
const PAD = 8;
const LABEL_W = 78;
const INDEX_H = 16;
const ARROW_H = 12;
const LINE_H = 13;
const PTR_W = 64;
const UP = String.fromCodePoint(0x2191);

/** Rough width of a pointer label (12px bold sans). */
const labelWidth = (name: string) => name.length * 6.8;

/**
 * Lines for the pointer labels: a label goes on the first line where it does not share a slot
 * with another label or touch the label of a neighbouring slot. The first label of each slot
 * also draws the arrow.
 */
export function layoutPointerLabels(pointers: TrackPointerView[]): Array<{ p: TrackPointerView; line: number; arrow: boolean }> {
  const placed: Array<{ p: TrackPointerView; line: number; arrow: boolean }> = [];
  for (const p of pointers) {
    let line = 0;
    const clash = (q: { p: TrackPointerView; line: number }) =>
      q.line === line && (q.p.slot === p.slot || Math.abs(q.p.slot - p.slot) * STEP < (labelWidth(q.p.name) + labelWidth(p.name)) / 2 + 6);
    while (placed.some(clash)) line++;
    placed.push({ p, line, arrow: !placed.some((q) => q.p.slot === p.slot) });
  }
  return placed;
}

function extentOf(state: ArrayTrackState): TrackExtent {
  const { blocks, items, pointers = [] } = state;
  return {
    slots: Math.max(1, ...blocks.map((b) => b.slots), ...items.map((it) => it.slot + 1), ...pointers.map((p) => p.slot + 1)),
    parking: pointers.some((p) => p.slot < 0) || items.some((it) => it.slot < 0),
    lifted: items.some((it) => it.row === -1),
    second: blocks.some((b) => b.row === 1) || items.some((it) => it.row === 1),
    labels: blocks.some((b) => b.label !== undefined),
    pointerLines: Math.max(0, ...layoutPointerLabels(pointers).map((q) => q.line + 1)),
  };
}

function union(a: TrackExtent, b: TrackExtent | undefined): TrackExtent {
  if (!b) return a;
  return {
    slots: Math.max(a.slots, b.slots),
    parking: a.parking || b.parking,
    lifted: a.lifted || b.lifted,
    second: a.second || b.second,
    labels: a.labels || b.labels,
    pointerLines: Math.max(a.pointerLines, b.pointerLines),
  };
}

/**
 * Give every frame of a run the same extent (slots, rows, room for labels and pointers),
 * so the picture keeps its size while the array grows and shrinks. Call it from the
 * spec's trace().
 */
export function stabilizeTrack<S extends ArrayTrackState>(frames: Array<Frame<S>>): Array<Frame<S>> {
  let all: TrackExtent | undefined;
  for (const f of frames) all = union(extentOf(f.state), all);
  if (!all) return frames;
  const extent = all;
  return frames.map((f) => ({ ...f, state: { ...f.state, extent } }));
}

/** Pixel geometry of one frame, shared by the blocks, items and pointers. */
function geometry(ext: TrackExtent) {
  const x0 = PAD + (ext.labels ? LABEL_W : 0) + (ext.parking ? STEP : 0);
  const y0 = ext.lifted ? CH + 14 : 4;
  const zone = y0 + CH + INDEX_H + 2;
  const zoneH = ext.pointerLines > 0 ? ARROW_H + ext.pointerLines * LINE_H + 4 : 0;
  const y1 = zone + zoneH + 10;
  return {
    x: (slot: number) => x0 + slot * STEP,
    y: (row: -1 | 0 | 1) => (row === -1 ? 0 : row === 0 ? y0 : y1),
    zone,
    width: x0 + ext.slots * STEP - (STEP - CW) + PAD,
    height: (ext.second ? y1 + CH + INDEX_H : zone + zoneH) + 4,
  };
}

function describe(state: ArrayTrackState): string {
  const main = state.blocks.find((b) => b.row === 0 && !b.ghost) ?? state.blocks[0];
  if (!main) return 'Empty array';
  const at = new Map(state.items.filter((it) => (it.row ?? 0) === 0 && !it.ghost).map((it) => [it.slot, it.value]));
  const cells = Array.from({ length: main.slots }, (_, i) => (at.has(i) ? String(at.get(i)) : (main.emptyText ?? 'spare')));
  const ptrs = (state.pointers ?? []).map((p) => `${p.name} at ${p.slot}`);
  return `Array of ${main.slots} slots: ${cells.join(', ') || 'none'}${ptrs.length ? `; ${ptrs.join(', ')}` : ''}`;
}

/**
 * Organism: an array drawn as a track of slots. Items keep a stable id, so they glide when
 * they shift (list.pop(0), list.insert(0, x)), drop in from above when stored, lift out
 * when removed, and move into a second block when the array is reallocated. Named index
 * pointers (top, front, back, len) sit under the slots and glide as well. Built from the
 * Cell atom; the motion is a CSS transition on each keyed element.
 */
export function ArrayTrack({ state }: { state: ArrayTrackState }) {
  const { blocks, items, pointers = [], note, strips } = state;
  const ext = union(extentOf(state), state.extent);
  const g = geometry(ext);
  const placed = layoutPointerLabels(pointers);
  const length = blocks.find((b) => b.row === 0 && !b.ghost)?.slots ?? 0;
  const missing = [...new Set(pointers.filter((p) => p.role === 'bad' && p.slot >= length).map((p) => p.slot))];

  return (
    <div className="track-wrap">
      <div className="track" style={{ width: g.width, height: g.height }} role="img" aria-label={describe(state)}>
        {ext.parking && (
          <span className="track-index track-parking" style={{ transform: `translate(${g.x(-1)}px, ${g.y(0) + CH + 1}px)` }}>
            -1
          </span>
        )}
        {blocks.map((b) => (
          <div
            key={`b:${b.id}`}
            className={`track-block${b.ghost ? ' ghost' : ''}`}
            style={{ transform: `translate(${g.x(0)}px, ${g.y(b.row)}px)` }}
          >
            {b.label !== undefined && (
              <span className="track-label" style={{ left: -(ext.parking ? STEP : 0) - LABEL_W, width: LABEL_W - 10 }}>
                {b.label}
              </span>
            )}
            {Array.from({ length: b.slots }, (_, i) => {
              const role = b.slotRoles?.[i];
              return (
                <span
                  key={i}
                  className={`track-slot${b.emptyText === undefined ? ' spare' : ''}${role ? ` role-${role}` : ''}`}
                  style={{ left: i * STEP }}
                >
                  {b.emptyText}
                </span>
              );
            })}
            {Array.from({ length: b.slots }, (_, i) => (
              <span key={`i${i}`} className="track-index" style={{ left: i * STEP, top: CH + 1 }}>
                {i}
              </span>
            ))}
          </div>
        ))}
        {missing.map((slot) => (
          <span
            key={`m${slot}`}
            className="track-slot missing role-bad"
            style={{ transform: `translate(${g.x(slot)}px, ${g.y(0)}px)` }}
            aria-hidden="true"
          />
        ))}
        {items.map((it) => (
          <div
            key={`i:${it.id}`}
            className={`track-item${it.ghost ? ' ghost' : ''}`}
            style={{ transform: `translate(${g.x(it.slot)}px, ${g.y(it.row ?? 0)}px)` }}
          >
            <Cell value={it.value} role={it.role} />
          </div>
        ))}
        {placed.map(({ p, line, arrow }) => (
          <div
            key={`p:${p.name}`}
            className={`track-ptr role-${p.role ?? 'idle'}`}
            style={{ transform: `translate(${g.x(p.slot) + CW / 2 - PTR_W / 2}px, ${g.zone + (arrow ? line * LINE_H : ARROW_H + line * LINE_H)}px)` }}
          >
            {arrow && (
              <span className="track-arrow" aria-hidden="true">
                {UP}
              </span>
            )}
            <span>{p.name}</span>
          </div>
        ))}
      </div>
      {note && <p className="track-note">{note}</p>}
      <Strips strips={strips} />
    </div>
  );
}
