import type { Frame, Role } from '../core/types';
import '../ui/roles.css';
import { SYM } from '../ui/symbols';
import './JobSlots.css';

export interface JobCardView {
  /** Stable identity (the job's input index): a card glides from the queue into a slot or the tray. */
  key: number;
  id: string;
  /** Two short lines under the id, e.g. "d 2" and "p 100". */
  top: string;
  bottom: string;
  role: Role;
  at: { row: 'queue'; index: number } | { row: 'slot'; slot: number } | { row: 'tray'; index: number };
  /** Why a card sits in the tray, drawn under it ("1-2 full", "d <= 0"). */
  note?: string;
}

export interface JobSlotsExtent {
  cols: number;
  slots: number;
}

export interface JobSlotsState {
  cards: JobCardView[];
  /** What the queue order means: "as given", "by profit". */
  queueLabel: string;
  /** Time slots 1..slots (0: none). */
  slots: number;
  /** Text under the "slots" row label; defaults to "1 to n" or "none". */
  slotsLabel?: string;
  slotRoles?: Record<number, Role>;
  /** The current job's deadline: it may only use slots 1..window (a bracket under them). */
  window?: number;
  /** The slot being looked at (a pointer above it). */
  probe?: number;
  /** Running total, top right. */
  total?: string;
  /** Set by stabilizeSlots; never needed by a tracer. */
  extent?: JobSlotsExtent;
}

const PAD = 10;
const X0 = 70;
const P = 54;
const CW = 48;
const CH = 44;
const QY = 30;
const SY = QY + CH + 50;
const TY = SY + CH + 50;

function extentOf(state: JobSlotsState): JobSlotsExtent {
  return { cols: Math.max(1, state.cards.length, state.slots), slots: state.slots };
}

/** Keep one picture size for the whole run (the slot row exists from the start). Call it from trace(). */
export function stabilizeSlots<S extends JobSlotsState>(frames: Array<Frame<S>>): Array<Frame<S>> {
  let cols = 1;
  let slots = 0;
  for (const f of frames) {
    const e = extentOf(f.state);
    cols = Math.max(cols, e.cols);
    slots = Math.max(slots, e.slots);
  }
  return frames.map((f) => ({ ...f, state: { ...f.state, extent: { cols, slots } } }));
}

const slotX = (s: number) => X0 + (s - 1) * P;

function cardXY(c: JobCardView): { x: number; y: number } {
  if (c.at.row === 'slot') return { x: slotX(c.at.slot), y: SY };
  if (c.at.row === 'tray') return { x: X0 + c.at.index * P, y: TY };
  return { x: X0 + c.at.index * P, y: QY };
}

/**
 * Organism for job sequencing with deadlines: the jobs as cards in a queue (in the order the
 * code takes them), the time slots 1..max_deadline below, and a tray for skipped jobs. A bracket
 * marks the slots the current job may use and a pointer the slot being checked; cards glide
 * into their slot or the tray.
 */
export function JobSlots({ state }: { state: JobSlotsState }) {
  const ext = state.extent ?? extentOf(state);
  const width = X0 + ext.cols * P + PAD;
  const height = TY + CH + 26;
  const slots = Array.from({ length: state.slots }, (_, k) => k + 1);
  const glyph = (role: Role) => (role === 'good' ? SYM.check : role === 'bad' ? SYM.cross : null);
  const win = state.window !== undefined ? Math.min(state.window, state.slots) : 0;
  const placed = state.cards.filter((c) => c.at.row === 'slot').length;
  const skipped = state.cards.filter((c) => c.at.row === 'tray').length;

  return (
    <div className="js-wrap">
      <svg
        className="job-slots"
        viewBox={`0 0 ${width} ${height}`}
        style={{ width, maxWidth: '100%', minWidth: Math.min(width, 480) }}
        role="img"
        aria-label={`${state.cards.length} jobs, ${state.slots} slots: ${placed} scheduled, ${skipped} skipped`}
      >
        <text className="js-row" x={X0 - 10} y={QY + CH / 2 - 7}>
          queue
        </text>
        <text className="js-sub" x={X0 - 10} y={QY + CH / 2 + 8}>
          {state.queueLabel}
        </text>
        <text className="js-row" x={X0 - 10} y={SY + CH / 2 - 7}>
          slots
        </text>
        <text className="js-sub" x={X0 - 10} y={SY + CH / 2 + 8}>
          {state.slotsLabel ?? (state.slots > 0 ? `1 to ${state.slots}` : 'none')}
        </text>
        <text className="js-row" x={X0 - 10} y={TY + CH / 2}>
          skipped
        </text>
        {state.total && (
          <text className="js-total" x={width - PAD} y={12}>
            {state.total}
          </text>
        )}
        {state.cards.map((c) =>
          c.at.row === 'queue' ? <rect key={`q${c.key}`} className="js-place" x={X0 + c.at.index * P} y={QY} width={CW} height={CH} rx={7} /> : null,
        )}
        {slots.map((s) => {
          const role = state.slotRoles?.[s] ?? 'idle';
          const g = glyph(role);
          return (
            <g key={`s${s}`} className={`js-slot role-${role}`}>
              <text className="js-num" x={slotX(s) + CW / 2} y={SY - 10}>
                {s}
                {g && <tspan className="js-slot-glyph">{` ${g}`}</tspan>}
              </text>
              <rect x={slotX(s) - 2} y={SY - 2} width={CW + 4} height={CH + 4} rx={8} />
            </g>
          );
        })}
        {state.probe !== undefined && state.probe >= 1 && state.probe <= state.slots && (
          <path className="js-probe" d={`M${slotX(state.probe) + CW / 2 - 6},${SY - 33} h12 l-6,8 z`} />
        )}
        {win > 0 && (
          <g className="js-window">
            <path d={`M${slotX(1)},${SY + CH + 9} v6 H${slotX(win) + CW} v-6`} />
            <text x={(slotX(1) + slotX(win) + CW) / 2} y={SY + CH + 24}>
              deadline {state.window}: {win === 1 ? 'slot 1' : `slots 1 to ${win}`}
            </text>
          </g>
        )}
        {state.cards.map((c) => {
          const { x, y } = cardXY(c);
          const g = glyph(c.role);
          return (
            <g key={`c${c.key}`} className={`js-card role-${c.role}`} style={{ transform: `translate(${x}px, ${y}px)` }}>
              <rect width={CW} height={CH} rx={7} />
              <text className="js-id" x={CW / 2} y={12}>
                {c.id}
              </text>
              <text className="js-line" x={CW / 2} y={26}>
                {c.top}
              </text>
              <text className="js-line" x={CW / 2} y={37}>
                {c.bottom}
              </text>
              {g && (
                <g className="js-glyph">
                  <circle cx={CW - 2} cy={2} r={7.5} />
                  <text x={CW - 2} y={2.5}>
                    {g}
                  </text>
                </g>
              )}
              {c.note && c.at.row === 'tray' && (
                <text className="js-note" x={CW / 2} y={CH + 12}>
                  {c.note}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
