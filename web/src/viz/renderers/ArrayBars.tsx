import type { Role } from '../core/types';
import '../ui/roles.css';
import './ArrayBars.css';

export interface BarItem {
  /** Stable identity: lets a value glide to its new slot when it moves. */
  id: number;
  value: number;
}

export interface ArrayState {
  items: BarItem[];
  roles: Role[];
  /** Index -> short label drawn under the bar (i, j, min, pivot...). */
  pointers?: Record<number, string>;
  /** Highlighted sub-array [lo, hi] (inclusive) with an optional label. */
  range?: { lo: number; hi: number; label?: string };
  /** Indices drawn with a dashed outline (e.g. the pivot). */
  outlined?: number[];
}

const SLOT = 44;
const BAR = 36;
const TOP = 22; // room for value labels
const PLOT = 170;
const BOTTOM = 40; // room for pointer labels

/** Bar with only its data end rounded (r = 4), anchored to the baseline. */
function barPath(x: number, base: number, height: number, w: number): string {
  const r = Math.min(4, Math.abs(height) / 2, w / 2);
  if (height >= 0) {
    const top = base - height;
    return `M${x},${base}V${top + r}Q${x},${top} ${x + r},${top}H${x + w - r}Q${x + w},${top} ${x + w},${top + r}V${base}Z`;
  }
  const bottom = base - height;
  return `M${x},${base}V${bottom - r}Q${x},${bottom} ${x + r},${bottom}H${x + w - r}Q${x + w},${bottom} ${x + w},${bottom - r}V${base}Z`;
}

export function ArrayBars({ state }: { state: ArrayState }) {
  const { items, roles, pointers = {}, range, outlined = [] } = state;
  const n = items.length;
  const width = Math.max(n * SLOT, SLOT);
  const values = items.map((it) => it.value);
  const maxV = Math.max(0, ...values);
  const minV = Math.min(0, ...values);
  const span = maxV - minV || 1;
  const scale = PLOT / span;
  const base = TOP + maxV * scale;
  const height = TOP + PLOT + BOTTOM;
  const slotOf = new Map(items.map((it, i) => [it.id, i]));
  const ids = [...items].map((it) => it.id).sort((a, b) => a - b); // stable DOM order

  return (
    <svg
      className="bars"
      viewBox={`0 0 ${width} ${height}`}
      style={{ maxWidth: Math.max(width * 1.6, 320), margin: '0 auto' }}
      role="img"
      aria-label={`Array: ${values.join(', ')}`}
    >
      {range && range.hi >= range.lo && (
        <g>
          <rect className="range" x={range.lo * SLOT + 1} y={2} width={(range.hi - range.lo + 1) * SLOT - 2} height={height - 4} rx={8} />
          {range.label && (
            <text className="range-label" x={range.lo * SLOT + 6} y={14}>
              {range.label}
            </text>
          )}
        </g>
      )}
      <line className="baseline" x1={0} x2={width} y1={base} y2={base} />
      {ids.map((id) => {
        const i = slotOf.get(id) ?? 0;
        const item = items[i];
        const h = item.value * scale;
        const x = (SLOT - BAR) / 2;
        const role = roles[i] ?? 'idle';
        const labelY = item.value >= 0 ? base - h - 6 : base - h + 14;
        return (
          <g
            key={id}
            className={`bar role-${role}${outlined.includes(i) ? ' outlined' : ''}`}
            style={{ transform: `translateX(${i * SLOT}px)` }}
          >
            <path d={barPath(x, base, h === 0 ? 0.0001 : h, BAR)} />
            <text className="bar-value" x={SLOT / 2} y={labelY} textAnchor="middle">
              {item.value}
            </text>
          </g>
        );
      })}
      {Object.entries(pointers).map(([idx, label]) => (
        <text key={`p-${idx}-${label}`} className="bar-pointer" x={Number(idx) * SLOT + SLOT / 2} y={TOP + PLOT + 26} textAnchor="middle">
          {label}
        </text>
      ))}
    </svg>
  );
}
