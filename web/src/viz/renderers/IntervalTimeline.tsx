import type { Role } from '../core/types';
import { NodeGlyph } from '../ui/atoms/NodeGlyph';
import { Strips, type StripData } from '../ui/molecules/Strip';
import '../ui/roles.css';
import './IntervalTimeline.css';

export interface IntervalView {
  /** Stable identity: a bar glides to its new lane when the order changes. */
  id: number;
  /** Short name drawn in the lane marker (e.g. the activity number). */
  label: string;
  start: number;
  end: number;
  role: Role;
  /** Row, top to bottom. */
  lane: number;
  /** Part of the bar to hatch, e.g. where it overlaps an interval already chosen. */
  conflict?: { from: number; to: number };
}

export interface IntervalTimelineState {
  intervals: IntervalView[];
  /** Vertical line across all lanes, e.g. the time the resource becomes free. */
  marker?: { at: number; label: string };
  /** Small note above the lanes (what the lane order means). */
  note?: string;
  strips?: StripData[];
}

const WIDTH = 640;
const LEFT = 56; // lane-marker column (the status glyph sits left of the marker)
const RIGHT = 18;
const TOP = 34;
const LANE = 30;
const BAR_H = 16;
const R = 11;
const CHAR_W = 6.6; // approximate width of an 11px label character

/** A tick step that gives at most about 12 ticks. */
function tickStep(span: number): number {
  for (const step of [1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500]) if (span / step <= 12) return step;
  return 1000;
}

/** 45-degree hatch lines clipped to the box [x1, x2] x [y, y + h]. */
function hatch(x1: number, x2: number, y: number, h: number): string {
  const parts: string[] = [];
  for (let a = x1 - h; a < x2; a += 6) {
    const sx = Math.max(a, x1);
    const ex = Math.min(a + h, x2);
    if (ex <= sx) continue;
    parts.push(`M${sx.toFixed(1)},${(y + h - (sx - a)).toFixed(1)}L${ex.toFixed(1)},${(y + h - (ex - a)).toFixed(1)}`);
  }
  return parts.join('');
}

/**
 * Organism: intervals as bars on a shared time axis, one lane each, with a role per
 * interval (current / chosen / rejected) and an optional moving time marker.
 * Lanes glide when their order changes; lane markers are NodeGlyph atoms, so status
 * roles carry a check / cross glyph.
 */
export function IntervalTimeline({ state }: { state: IntervalTimelineState }) {
  const { intervals, marker } = state;
  const lanes = Math.max(1, ...intervals.map((iv) => iv.lane + 1));
  const lo = Math.min(...intervals.map((iv) => iv.start), marker?.at ?? Infinity);
  const hi = Math.max(...intervals.map((iv) => iv.end), marker?.at ?? -Infinity);
  const step = tickStep(Math.max(1, hi - lo));
  const d0 = Math.floor(lo / step) * step;
  const d1 = Math.max(d0 + step, Math.ceil(hi / step) * step);
  const plotW = WIDTH - LEFT - RIGHT;
  const x = (t: number) => LEFT + ((t - d0) / (d1 - d0)) * plotW;
  const bottom = TOP + lanes * LANE;
  const height = bottom + 26;
  const ticks: number[] = [];
  for (let t = d0; t <= d1; t += step) ticks.push(t);
  const ids = [...intervals].sort((a, b) => a.id - b.id); // stable DOM order, so lanes can glide

  return (
    <div>
      <svg className="timeline" viewBox={`0 0 ${WIDTH} ${height}`} role="img" aria-label={`Timeline of ${intervals.length} intervals`}>
        {state.note && (
          <text className="tl-note" x={4} y={12}>
            {state.note}
          </text>
        )}
        {ticks.map((t) => (
          <g key={t} className="tl-tick">
            <line x1={x(t)} x2={x(t)} y1={TOP - 4} y2={bottom} />
            <text x={x(t)} y={bottom + 16} textAnchor="middle">
              {t}
            </text>
          </g>
        ))}
        <line className="tl-axis" x1={LEFT} x2={WIDTH - RIGHT} y1={bottom} y2={bottom} />
        {ids.map((iv) => {
          const x1 = x(iv.start);
          const x2 = Math.max(x(iv.end), x1 + 3);
          const y = TOP + (LANE - BAR_H) / 2;
          const text = `[${iv.start}, ${iv.end})`;
          const textW = text.length * CHAR_W;
          const inside = x2 + 6 + textW > WIDTH && x2 - x1 >= textW + 10;
          const tx = inside ? x2 - 6 : x2 + 6 + textW <= WIDTH ? x2 + 6 : x1 - 6;
          const anchor = inside || tx < x1 ? 'end' : 'start';
          return (
            <g key={iv.id} className={`tl-lane role-${iv.role}`} style={{ transform: `translateY(${iv.lane * LANE}px)` }}>
              <NodeGlyph x={LEFT - R - 6} y={TOP + LANE / 2} r={R} label={iv.label} role={iv.role} />
              <rect className="tl-bar" x={x1} y={y} width={x2 - x1} height={BAR_H} rx={4} />
              {iv.conflict && iv.conflict.to > iv.conflict.from && (
                <path className="tl-conflict" d={hatch(x(iv.conflict.from), x(iv.conflict.to), y, BAR_H)} />
              )}
              <text className={`tl-text${inside ? ' inside' : ''}`} x={tx} y={TOP + LANE / 2 + 4} textAnchor={anchor}>
                {text}
              </text>
            </g>
          );
        })}
        {marker && (
          <g className="tl-marker" style={{ transform: `translateX(${x(marker.at)}px)` }}>
            <line x1={0} x2={0} y1={TOP - 8} y2={bottom} />
            <text x={0} y={TOP - 10} textAnchor={x(marker.at) > WIDTH - 90 ? 'end' : x(marker.at) < LEFT + 60 ? 'start' : 'middle'}>
              {marker.label}
            </text>
          </g>
        )}
      </svg>
      <Strips strips={state.strips} />
    </div>
  );
}
