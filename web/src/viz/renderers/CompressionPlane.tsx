import type { Frame, Role } from '../core/types';
import { useTween, type Pt } from '../ui/hooks/useTween';
import type { StripData } from '../ui/molecules/Strip';
import '../ui/roles.css';
import './CompressionPlane.css';
import { StableStrips, stripsSizer } from './patternStrips';

export interface PlanePointView {
  id: string;
  /** Original coordinates; where the point is drawn depends on each axis's mode. */
  x: number;
  y: number;
  label: string;
  role?: Role;
}

export interface CompressAxis {
  /** 'value': positions proportional to the real values; 'rank': one evenly spaced slot per distinct value. */
  mode: 'value' | 'rank';
  /** The distinct values on this axis, sorted. */
  values: number[];
  role?: Role;
}

export interface CompressionPlaneState {
  /** What the picture shows, for screen readers. */
  label: string;
  points: PlanePointView[];
  xAxis: CompressAxis;
  yAxis: CompressAxis;
  strips?: StripData[];
  /** The largest strips of the run (see stripsSizer); set by stabilizePlaneStrips. */
  stripsSizer?: StripData[];
}

/** Reserve the run's largest mapping strips in every frame, so the picture keeps one height. */
export function stabilizePlaneStrips<S extends CompressionPlaneState>(frames: Array<Frame<S>>): Array<Frame<S>> {
  const sizer = stripsSizer(frames.map((f) => f.state.strips));
  return frames.map((f) => ({ ...f, state: { ...f.state, stripsSizer: sizer } }));
}

const W = 560;
const H = 330;
const LEFT = 96;
const RIGHT = 30;
const TOP = 26;
const BOTTOM = 58;
const PW = W - LEFT - RIGHT;
const PH = H - TOP - BOTTOM;

/** Where a value sits along an axis of length len: by value (with margins) or by rank slot. */
function place(axis: CompressAxis, v: number, len: number): number {
  const k = axis.values.length;
  if (axis.mode === 'rank') {
    const r = Math.max(0, axis.values.indexOf(v));
    return ((r + 0.5) / k) * len;
  }
  const lo = axis.values[0];
  const hi = axis.values[k - 1];
  if (hi === lo) return len / 2;
  return (0.06 + (0.88 * (v - lo)) / (hi - lo)) * len;
}

/** Short tick text: 1000000000 -> 1e9, 250000 -> 250k. */
function short(v: number): string {
  const a = Math.abs(v);
  if (a >= 1e9 && v % 1e9 === 0) return `${v / 1e9}e9`;
  if (a >= 1e6 && v % 1e6 === 0) return `${v / 1e6}M`;
  if (a >= 1e4 && v % 1e3 === 0) return `${v / 1e3}k`;
  return String(v);
}

/** Ticks whose labels would collide with the previous shown one get no label. */
function labelled(positions: number[], gap: number): boolean[] {
  let last = -Infinity;
  return positions.map((p) => {
    if (p - last >= gap) {
      last = p;
      return true;
    }
    return false;
  });
}

/**
 * Organism for 2D coordinate compression: points on a plane whose axes are either real values
 * (sparse: most of the plane is empty) or ranks (dense: one column per distinct x, one row per
 * distinct y). When an axis switches to ranks, the points glide onto the grid.
 */
export function CompressionPlane({ state }: { state: CompressionPlaneState }) {
  const { xAxis, yAxis } = state;
  const px = (v: number) => LEFT + place(xAxis, v, PW);
  const py = (v: number) => TOP + PH - place(yAxis, v, PH);

  const target = new Map<string, Pt>();
  for (const p of state.points) target.set(p.id, { x: px(p.x), y: py(p.y) });
  const pos = useTween(target, 520);

  const xTicks = xAxis.values.map((v) => px(v));
  const yTicks = yAxis.values.map((v) => py(v));
  const xShow = labelled(xTicks, xAxis.mode === 'rank' ? 0 : 44);
  const yShow = labelled([...yTicks].reverse(), 16).reverse();

  return (
    <div className="cplane-wrap">
      <svg className="cplane" viewBox={`0 0 ${W} ${H}`} style={{ width: W, maxWidth: '100%', minWidth: Math.min(W, 420) }} role="img" aria-label={state.label}>
        <rect className="cplane-box" x={LEFT} y={TOP} width={PW} height={PH} rx={4} />
        {xAxis.values.map((v, k) => (
          <g key={`x${v}`} className={`cplane-tick role-${xAxis.role ?? 'idle'}`}>
            <line x1={xTicks[k]} x2={xTicks[k]} y1={TOP} y2={TOP + PH} />
            {xShow[k] && (
              <text x={xTicks[k]} y={TOP + PH + 14}>
                {xAxis.mode === 'rank' ? k : short(v)}
              </text>
            )}
            {xAxis.mode === 'rank' && (
              <text className="cplane-orig" x={xTicks[k]} y={TOP + PH + 28}>
                {short(v)}
              </text>
            )}
          </g>
        ))}
        {yAxis.values.map((v, k) => (
          <g key={`y${v}`} className={`cplane-tick role-${yAxis.role ?? 'idle'}`}>
            <line x1={LEFT} x2={LEFT + PW} y1={yTicks[k]} y2={yTicks[k]} />
            {yShow[k] && (
              <text className="cplane-ylabel" x={LEFT - 8} y={yTicks[k]}>
                {yAxis.mode === 'rank' ? `${k}  (${short(v)})` : short(v)}
              </text>
            )}
          </g>
        ))}
        <text className="cplane-axis" x={LEFT + PW / 2} y={H - 10}>
          {xAxis.mode === 'rank' ? 'x rank (original x below)' : 'x (real value)'}
        </text>
        <text className="cplane-axis" x={14} y={TOP + PH / 2} transform={`rotate(-90 14 ${TOP + PH / 2})`}>
          {yAxis.mode === 'rank' ? 'y rank (original)' : 'y (real value)'}
        </text>
        {state.points.map((p) => {
          const at = pos.get(p.id) ?? target.get(p.id)!;
          const role = p.role ?? 'idle';
          return (
            <g key={p.id} className={`cplane-point role-${role}`} transform={`translate(${at.x.toFixed(1)},${at.y.toFixed(1)})`}>
              <circle r={7} />
              {/* Labels near an edge of the plot grow inwards, so they never leave the picture. */}
              <text y={-14} style={{ textAnchor: at.x < LEFT + 70 ? 'start' : at.x > LEFT + PW - 70 ? 'end' : 'middle' }} x={at.x < LEFT + 70 ? -8 : at.x > LEFT + PW - 70 ? 8 : 0}>
                {p.label}
              </text>
            </g>
          );
        })}
      </svg>
      <StableStrips strips={state.strips} sizer={state.stripsSizer} />
    </div>
  );
}
