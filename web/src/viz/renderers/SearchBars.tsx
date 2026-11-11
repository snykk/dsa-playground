import type { Role } from '../core/types';
import { Strips, type StripData } from '../ui/molecules/Strip';
import '../ui/roles.css';
import { SYM } from '../ui/symbols';
import './SearchBars.css';

export interface SearchPointer {
  /** Label drawn under the array (lo, hi, mid, m1, m2, pos, i); also the React key, so a pointer glides when it moves. */
  name: string;
  index: number;
  /**
   * "probe": a caret under the value being examined.
   * "low" / "high": an end of the search range, drawn as a bracket at the left / right edge of its slot,
   * so lo and hi can share a slot and visibly cross once the range is empty.
   */
  kind: 'probe' | 'low' | 'high';
}

export interface SearchGuide {
  lo: number;
  hi: number;
  /** Fractional index where the straight line from (lo, a[lo]) to (hi, a[hi]) reaches the target. */
  estimate: number;
  /** The index actually probed (the estimate rounded down). */
  pos: number;
}

export interface SearchState {
  values: number[];
  roles: Role[];
  target: number;
  /** Inclusive part of the array that can still hold the target; hi < lo means it is empty. */
  range: { lo: number; hi: number };
  pointers: SearchPointer[];
  /** Interpolation search: the line its probe formula follows. */
  guide?: SearchGuide;
  /** Indices compared with the target so far, in order (pinned to the Python code by golden fixtures). */
  probes: number[];
  /** Set on the last frame: the returned index, or -1. */
  result?: number;
  strips?: StripData[];
}

const SLOT = 36;
const BAR = 26;
const PAD = 26; // side margins: room for lo / hi when they step outside the array
const TOP = 42; // room for value labels and the check glyph above the tallest bar
const PLOT = 150;

/** Bar with only its data end rounded, anchored to the baseline (height < 0 hangs below it). */
function barPath(x: number, base: number, height: number, w: number): string {
  const h = height === 0 ? 0.0001 : height;
  const r = Math.min(4, Math.abs(h) / 2, w / 2);
  const end = base - h;
  const dir = h > 0 ? 1 : -1;
  return `M${x},${base}V${end + dir * r}Q${x},${end} ${x + r},${end}H${x + w - r}Q${x + w},${end} ${x + w},${end + dir * r}V${base}Z`;
}

/**
 * Organism for array searches: the values as bars, the shrinking search range as a band
 * behind them, the target as a dashed line, gliding lo / hi / probe pointers and, for
 * interpolation search, the straight line whose crossing with the target picks the probe.
 */
export function SearchBars({ state }: { state: SearchState }) {
  const { values, roles, target, range, pointers, guide, strips } = state;
  const n = values.length;
  const width = 2 * PAD + n * SLOT;
  const maxV = Math.max(0, target, ...values);
  const minV = Math.min(0, target, ...values);
  const scale = PLOT / (maxV - minV || 1);
  const base = TOP + maxV * scale;
  const y = (v: number) => base - v * scale;
  const plotBottom = TOP + PLOT + (minV < 0 ? 36 : 0);
  const idxY = plotBottom + 16;
  const caretY = idxY + 7;
  const boundY = idxY + 50;
  const height = boundY + 10;
  const left = (i: number) => PAD + i * SLOT;
  const center = (i: number) => PAD + (i + 0.5) * SLOT;

  const bandW = Math.max(0, range.hi - range.lo + 1) * SLOT;
  const sharing = new Map<number, string[]>();
  for (const p of pointers) if (p.kind === 'probe') sharing.set(p.index, [...(sharing.get(p.index) ?? []), p.name]);
  const yTarget = y(target);

  let guideView = null;
  if (guide) {
    const x1 = center(guide.lo);
    const y1 = y(values[guide.lo]);
    const x2 = center(guide.hi);
    const y2 = y(values[guide.hi]);
    const len = Math.hypot(x2 - x1, y2 - y1);
    const angle = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
    const xe = center(guide.estimate);
    const xp = center(guide.pos);
    guideView = (
      <g className="search-guide">
        <line className="guide-line" x1={0} y1={0} x2={1} y2={0} style={{ transform: `translate(${x1}px, ${y1}px) rotate(${angle}deg) scaleX(${len})` }} />
        <line className="guide-drop" x1={0} x2={0} y1={yTarget} y2={plotBottom + 2} style={{ transform: `translateX(${xe}px)` }} />
        <line
          className="guide-snap"
          x1={0}
          x2={1}
          y1={plotBottom + 2}
          y2={plotBottom + 2}
          style={{ transform: `translateX(${Math.min(xe, xp)}px) scaleX(${Math.max(Math.abs(xe - xp), 0.0001)})` }}
        />
        <circle className="guide-dot" cx={0} cy={0} r={5} style={{ transform: `translate(${xe}px, ${yTarget}px)` }} />
      </g>
    );
  }

  return (
    <div>
      <svg
        className="search-bars"
        viewBox={`0 0 ${width} ${height}`}
        style={{ maxWidth: Math.max(width * 1.5, 320), minWidth: width > 700 ? width * 0.7 : undefined, margin: '0 auto' }}
        role="img"
        aria-label={`Array ${values.join(', ')}; looking for ${target}; search range ${range.lo} to ${range.hi}`}
      >
        <rect
          className="search-band"
          x={0}
          y={4}
          width={1}
          height={idxY + 6 - 4}
          style={{ transform: `translateX(${left(range.lo)}px) scaleX(${Math.max(bandW, 0.0001)})` }}
        />
        <line className="search-baseline" x1={PAD - 6} x2={width - PAD + 6} y1={base} y2={base} />
        {values.map((v, i) => {
          const role = roles[i] ?? 'idle';
          const end = y(v);
          const glyph = role === 'good' ? SYM.check : role === 'bad' ? SYM.cross : null;
          return (
            <g key={i} className={`search-bar role-${role}`}>
              <path d={barPath(center(i) - BAR / 2, base, v * scale, BAR)} />
              <text className="search-value" x={center(i)} y={v >= 0 ? end - 6 : end + 15}>
                {v}
              </text>
              {glyph && (
                <text className="search-glyph" x={center(i)} y={v >= 0 ? end - 22 : end + 31}>
                  {glyph}
                </text>
              )}
              <text className="search-index" x={center(i)} y={idxY}>
                {i}
              </text>
            </g>
          );
        })}
        <line className="search-target" x1={PAD - 6} x2={width - PAD + 6} y1={yTarget} y2={yTarget} />
        <text className="search-target-label" x={PAD - 4} y={yTarget - 5}>
          target {target}
        </text>
        {guideView}
        {pointers.map((p) => {
          if (p.kind === 'probe') {
            const group = sharing.get(p.index) ?? [p.name];
            const dx = (group.indexOf(p.name) - (group.length - 1) / 2) * 18;
            return (
              <g key={p.name} className="search-pointer probe" style={{ transform: `translateX(${center(p.index) + dx}px)` }}>
                <path className="caret" d={`M0,${caretY}l-5,8h10z`} />
                <text x={0} y={caretY + 23}>
                  {p.name}
                </text>
              </g>
            );
          }
          const low = p.kind === 'low';
          const x = low ? left(p.index) : left(p.index) + SLOT;
          const foot = low ? 5 : -5;
          return (
            <g key={p.name} className={`search-pointer ${p.kind}`} style={{ transform: `translateX(${x}px)` }}>
              <path className="bracket" d={`M${foot},${boundY - 15}H0V${boundY + 4}H${foot}`} />
              <text x={low ? 5 : -5} y={boundY}>
                {p.name}
              </text>
            </g>
          );
        })}
      </svg>
      <Strips strips={strips} />
    </div>
  );
}
