import { useId } from 'react';
import type { Role } from '../core/types';
import { useTween, type Pt } from '../ui/hooks/useTween';
import { Strips, type StripData } from '../ui/molecules/Strip';
import { SYM } from '../ui/symbols';
import '../ui/roles.css';
import './RingBuffer.css';

export type RingId = number | string;

export interface RingItemView {
  /** Stable identity: an item glides from the middle into its slot and back out. */
  id: RingId;
  value: string | number;
  /** Slot on the ring; -1 is the middle of the ring (an item arriving or leaving). */
  slot: number;
  role?: Role;
  ghost?: boolean;
}

export interface RingPointerView {
  /** front, rear...: the label glides around the ring when the index changes. */
  name: string;
  /** Slot on the ring; -1 (an empty-queue sentinel) parks the label in the middle as "name = -1". */
  slot: number;
  role?: Role;
}

export interface RingBufferState {
  capacity: number;
  /** Items in their slots (also drawn in the list row) and in flight (slot -1, drawn in the middle only). */
  items: RingItemView[];
  pointers: RingPointerView[];
  /** Outline roles for single slots, e.g. the slot (rear + 1) % capacity that the full test looks at. */
  slotRoles?: Record<number, Role>;
  /** Text in a slot that holds no item, e.g. "None". */
  emptyText?: string;
  /** Caption over the list row that shows the same slots in index order, e.g. "self.queue". */
  listLabel?: string;
  note?: string;
  strips?: StripData[];
}

const R = 84;
const M = 62;
const SW = 34;
const SH = 28;
const STEP = 40;
const PAD = 10;
const LINE = 13;
const ARROW_ROLES: Role[] = ['idle', 'compare', 'active', 'done', 'muted', 'bad'];

/** Angle of slot i on a ring of `capacity` slots: slot 0 at the top, then clockwise. */
export function ringSlotAngle(i: number, capacity: number): number {
  return -Math.PI / 2 + (2 * Math.PI * i) / Math.max(1, capacity);
}

function describe(state: RingBufferState): string {
  const at = new Map(state.items.filter((it) => it.slot >= 0 && !it.ghost).map((it) => [it.slot, it.value]));
  const cells = Array.from({ length: state.capacity }, (_, i) => (at.has(i) ? String(at.get(i)) : (state.emptyText ?? 'empty')));
  const ptrs = state.pointers.map((p) => `${p.name} = ${p.slot}`);
  return `Ring of ${state.capacity} slots: ${cells.join(', ')}; ${ptrs.join(', ')}`;
}

/**
 * Organism: a fixed array drawn as a ring, so the wrap from the last slot back to slot 0 is
 * just the next step clockwise. Items fly in from the middle and leave the same way, and the
 * named indices (front, rear) glide around the outside. Under the ring the same slots are
 * drawn in index order, as the list the code really holds, with the same indices under it.
 */
export function RingBuffer({ state }: { state: RingBufferState }) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const { capacity, items, pointers, slotRoles = {}, emptyText, listLabel, note, strips } = state;
  const ringSize = 2 * (R + M);
  const rowW = PAD * 2 + (capacity + 1) * STEP - (STEP - SW);
  const width = Math.max(ringSize, rowW);
  const cx = width / 2;
  const cy = R + M;
  const rowTop = ringSize + (listLabel ? 20 : 6);
  const rowX = (i: number) => (width - rowW) / 2 + PAD + (i + 1) * STEP;
  const zone = rowTop + SH + 28;
  // Room for every label stacked on one slot, so the picture keeps its height when front == rear.
  const height = zone + 16 + Math.max(1, pointers.length) * LINE;
  const slotPt = (i: number, r = R): Pt => {
    const a = ringSlotAngle(i, capacity);
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  };

  const target = new Map<string, Pt>();
  for (const it of items) target.set(`i:${it.id}`, it.slot >= 0 ? slotPt(it.slot) : { x: cx, y: cy + 20 });
  const ringStack = new Map<number, number>();
  const rowStack = new Map<number, number>();
  const labels = pointers.map((p) => {
    const k = ringStack.get(p.slot) ?? 0;
    ringStack.set(p.slot, k + 1);
    const j = rowStack.get(p.slot) ?? 0;
    rowStack.set(p.slot, j + 1);
    target.set(`r:${p.name}`, p.slot >= 0 ? slotPt(p.slot, R + 44 + k * LINE) : { x: cx, y: cy - 12 - k * LINE });
    target.set(`l:${p.name}`, { x: rowX(Math.max(-1, p.slot)) + SW / 2, y: zone + j * LINE });
    return { p, k, j };
  });
  const pos = useTween(target);
  const at = (key: string): Pt => pos.get(key) ?? target.get(key)!;
  const inRow = new Map(items.filter((it) => it.slot >= 0).map((it) => [it.slot, it]));
  const marker = (role: Role | undefined) => `url(#${uid}-arrow-${role && ARROW_ROLES.includes(role) ? role : 'idle'})`;

  return (
    <div className="ring-wrap">
      <svg
        className="ring-buffer"
        viewBox={`0 0 ${width} ${height}`}
        style={{ width, maxWidth: '100%' }}
        role="img"
        aria-label={describe(state)}
      >
        <defs>
          {ARROW_ROLES.map((role) => (
            <marker
              key={role}
              id={`${uid}-arrow-${role}`}
              className={`role-${role}`}
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerUnits="userSpaceOnUse"
              markerWidth="8"
              markerHeight="8"
              orient="auto-start-reverse"
            >
              <path d="M0,0 L10,5 L0,10 z" style={{ fill: role === 'idle' || role === 'muted' ? 'var(--viz-neutral)' : 'var(--role)' }} />
            </marker>
          ))}
        </defs>
        <circle className="rb-track" cx={cx} cy={cy} r={R} />
        {Array.from({ length: capacity }, (_, i) => {
          const p = slotPt(i);
          const q = slotPt(i, R - 30);
          const role = slotRoles[i];
          return (
            <g key={`s${i}`} className={`rb-slot${role ? ` hl role-${role}` : ''}`}>
              <rect x={p.x - SW / 2} y={p.y - SH / 2} width={SW} height={SH} rx={6} />
              {emptyText && (
                <text className="rb-empty" x={p.x} y={p.y}>
                  {emptyText}
                </text>
              )}
              <text className="rb-index" x={q.x} y={q.y}>
                {i}
              </text>
            </g>
          );
        })}
        {items.map((it) => {
          const p = at(`i:${it.id}`);
          const role = it.role ?? 'idle';
          const glyph = role === 'good' ? SYM.check : role === 'bad' ? SYM.cross : null;
          return (
            <g key={`i:${it.id}`} className={`rb-item role-${role}${it.ghost ? ' ghost' : ''}`}>
              <rect x={p.x - SW / 2} y={p.y - SH / 2} width={SW} height={SH} rx={6} />
              <text className="rb-value" x={p.x} y={p.y}>
                {it.value}
              </text>
              {glyph && (
                <text className="rb-glyph" x={p.x + SW / 2 + 2} y={p.y - SH / 2}>
                  {glyph}
                </text>
              )}
            </g>
          );
        })}
        {labels.map(({ p, k }) => {
          const q = at(`r:${p.name}`);
          const dx = cx - q.x;
          const dy = cy - q.y;
          const len = Math.hypot(dx, dy) || 1;
          const parked = p.slot < 0;
          return (
            <g key={`r:${p.name}`} className={`rb-ptr role-${p.role ?? 'idle'}`}>
              <text x={q.x} y={q.y}>
                {parked ? `${p.name} = -1` : p.name}
              </text>
              {!parked && k === 0 && (
                <line
                  x1={q.x + (dx / len) * 9}
                  y1={q.y + (dy / len) * 9}
                  x2={q.x + (dx / len) * 25}
                  y2={q.y + (dy / len) * 25}
                  markerEnd={marker(p.role)}
                />
              )}
            </g>
          );
        })}
        {listLabel && (
          <text className="rb-list-label" x={rowX(0)} y={rowTop - 10}>
            {listLabel}
          </text>
        )}
        <text className="rb-index rb-parking" x={rowX(-1) + SW / 2} y={rowTop + SH + 9}>
          -1
        </text>
        {Array.from({ length: capacity }, (_, i) => {
          const it = inRow.get(i);
          const cls = it ? ` filled role-${it.role ?? 'idle'}${it.ghost ? ' ghost' : ''}` : slotRoles[i] ? ` hl role-${slotRoles[i]}` : '';
          return (
            <g key={`c${i}`} className={`rb-cell${cls}`}>
              <rect x={rowX(i)} y={rowTop} width={SW} height={SH} rx={5} />
              <text className={it ? 'rb-value' : 'rb-empty'} x={rowX(i) + SW / 2} y={rowTop + SH / 2}>
                {it ? it.value : emptyText}
              </text>
              <text className="rb-index" x={rowX(i) + SW / 2} y={rowTop + SH + 9}>
                {i}
              </text>
            </g>
          );
        })}
        {labels.map(({ p, j }) => {
          const q = at(`l:${p.name}`);
          return (
            <g key={`l:${p.name}`} className={`rb-ptr role-${p.role ?? 'idle'}`}>
              {j === 0 && <line x1={q.x} y1={q.y - 1} x2={q.x} y2={q.y - 9} markerEnd={marker(p.role)} />}
              <text x={q.x} y={q.y + 9}>
                {p.name}
              </text>
            </g>
          );
        })}
      </svg>
      {note && <p className="ring-note">{note}</p>}
      <Strips strips={strips} />
    </div>
  );
}
