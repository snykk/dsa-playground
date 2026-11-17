import { useEffect, useId, useLayoutEffect, useRef, useState, type RefObject } from 'react';
import type { Role } from '../core/types';
import '../ui/roles.css';
import { SYM } from '../ui/symbols';
import './GrowthChart.css';

/** A measured value f(n). */
export interface GrowthPoint {
  n: number;
  value: number;
  role: Role;
  /** The next value to measure: drawn invisible on the zero line, so it rises when it is measured. */
  hidden?: boolean;
  /** Text next to the point (the value just measured). */
  label?: string;
}

/** A bound such as 0.1 * 2^n, sampled at the n measured so far (it sweeps right with n). */
export interface GrowthCurve {
  id: string;
  label: string;
  points: Array<[number, number]>;
  role: Role;
  dashed?: boolean;
}

export interface GrowthState {
  /** What the picture shows, for screen readers. */
  label: string;
  /** What f(n) counts, printed over the plot. */
  fLabel: string;
  /** The range of n; keep it for a whole run. */
  x: [number, number];
  /** log10 of the bottom and top of the y axis; keep them for a whole run. */
  decades: [number, number];
  points: GrowthPoint[];
  curves: GrowthCurve[];
  /** Two curve ids: the region between them is shaded (Big-Theta's band). */
  band?: [string, string];
  /** n0: from here to the right edge the bound holds (shaded). */
  n0?: { n: number; label: string; final?: boolean };
  /** The gap between f(n) and the bound at the n just checked. */
  probe?: { n: number; lo: number; hi: number; role: Role };
}

/** The widest the chart is drawn; a narrower box (a phone) gets a narrower chart at full scale. */
const MAX_W = 600;
const MIN_W = 300;
/** Room above the plot for the label of a point at the top and for n0's label. */
const PT = 18;
const PH = 236;
/** The zero line sits under the plot: a log axis has no 0. */
const ZERO = 20;
const AX = 34;
const HEIGHT = PT + PH + ZERO + AX;

/** The plot's frame inside a chart of width w: narrow charts keep less margin. */
function geometry(w: number) {
  const narrow = w < 480;
  const PL = narrow ? 46 : 58;
  const PR = narrow ? 10 : 14;
  return { W: w, PL, PR, PW: w - PL - PR, PADX: narrow ? 8 : 12 };
}

const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

/** The width of the box the chart sits in (null until measured), kept up to date as it resizes. */
function useBoxWidth(): [RefObject<HTMLDivElement | null>, number | null] {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState<number | null>(null);
  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const update = () => setWidth(el.clientWidth);
    update();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, width];
}

/** "1", "10", "1,000", "10^5" as label parts: [mantissa, exponent or null]. */
function decadeLabel(k: number): [string, string | null] {
  if (k < 0) return [String(10 ** k).replace(/^0\./, '0.'), null];
  if (k <= 4) return [(10 ** k).toLocaleString('en-US'), null];
  return ['10', String(k)];
}

function xTicks(x0: number, x1: number): number[] {
  const span = x1 - x0;
  const step = [1, 2, 5, 10].find((s) => span / s <= 10) ?? 10;
  const out: number[] = [];
  for (let t = Math.ceil(x0 / step) * step; t <= x1; t += step) out.push(t);
  if (!out.includes(x0)) out.unshift(x0);
  return out;
}

const glyph = (role: Role) => (role === 'good' ? SYM.check : role === 'bad' ? SYM.cross : '');

/**
 * Organism for Big-O, Big-Omega and Big-Theta: f(n) as points on a log scale that rise one n
 * at a time, the bound c * g(n) as a curve that sweeps right with them (two curves and the band
 * between them for Theta), the gap at the n just checked, and n0 with the region from it on.
 * A point that keeps the bound is a dot with a check, one that breaks it a cross, so the
 * verdict never rests on colour alone. The chart is drawn at the width of its box (at most
 * 600px), so on a phone it stays whole and its text keeps its size; the title and the key above
 * it are HTML and wrap between words.
 */
export function GrowthChart({ state }: { state: GrowthState }) {
  const clip = `growth-clip-${useId().replace(/:/g, '')}`;
  const [boxRef, boxWidth] = useBoxWidth();
  const { W, PL, PR, PW, PADX } = geometry(Math.max(MIN_W, Math.min(MAX_W, boxWidth ?? MAX_W)));
  const [x0, x1] = state.x;
  const [d0, d1] = state.decades;
  const inner = PW - 2 * PADX;
  const sx = (n: number) => PL + PADX + (x1 === x0 ? inner / 2 : ((n - x0) / (x1 - x0)) * inner);
  const zeroY = PT + PH + ZERO - 4;
  /** Unclamped for curves (the clip path cuts them); 0 sits on the zero line. */
  const sy = (v: number) => (v <= 0 ? zeroY : PT + (1 - (Math.log10(v) - d0) / (d1 - d0)) * PH);
  /** Points stay inside the plot. */
  const syPoint = (v: number) => (v <= 0 ? zeroY : Math.max(PT, Math.min(PT + PH, sy(v))));
  const step = d1 - d0 > 8 ? 2 : 1;
  const decades: number[] = [];
  for (let k = d0; k <= d1; k++) decades.push(k);
  const curves = new Map(state.curves.map((c) => [c.id, c]));
  const shown = state.points.filter((p) => !p.hidden);
  const band = state.band && curves.get(state.band[0]) && curves.get(state.band[1]) ? [curves.get(state.band[0])!, curves.get(state.band[1])!] : null;
  const half = x1 > x0 ? inner / (x1 - x0) / 2 : 0;
  const n0x = state.n0 ? Math.max(PL, sx(state.n0.n) - half) : 0;
  /** n0's label goes right of its line, or left of it when it would run past the plot. */
  const n0Left = state.n0 ? n0x + 10 + state.n0.label.length * 6.8 > PL + PW : false;
  const ordered = [...state.points].sort((a, b) => a.n - b.n);
  /** Smaller marks when the points stand close together (40 values on a phone). */
  const r = half < 6 ? 3.5 : 4.5;

  /** The key: the f(n) dots, then each bound curve with its own stroke. */
  const keyItems: Array<{ id: string; label: string; role: Role; dashed?: boolean; dot?: boolean }> = [
    { id: 'f', label: 'f(n)', role: 'idle', dot: true },
    ...state.curves.map((c) => ({ id: c.id, label: c.label, role: c.role, dashed: c.dashed })),
  ];

  return (
    <div className="growth-wrap" ref={boxRef}>
      <div className="gc-box" style={{ width: W }}>
        <div className="gc-head" style={{ paddingLeft: PL, paddingRight: PR }}>
          <span className="gc-title">{state.fLabel}</span>
          <span className="gc-scale">log scale</span>
        </div>
        <ul className="gc-key" style={{ paddingLeft: PL, paddingRight: PR }}>
          {keyItems.map((k) => (
            <li key={k.id} className={`role-${k.role}`}>
              <span className={k.dot ? 'gc-swatch dot' : `gc-swatch line${k.dashed ? ' dashed' : ''}`} aria-hidden="true" />
              {k.label}
            </li>
          ))}
        </ul>
        <svg className="growth-chart" viewBox={`0 0 ${W} ${HEIGHT}`} style={{ width: W, maxWidth: '100%' }} role="img" aria-label={state.label}>
          <defs>
            <clipPath id={clip}>
              <rect x={PL} y={PT} width={PW} height={PH + ZERO} />
            </clipPath>
          </defs>
          <rect className="gc-frame" x={PL} y={PT} width={PW} height={PH} />
          {state.n0 && <rect className={`gc-n0-zone${state.n0.final ? ' final' : ''}`} x={n0x} y={PT} width={PL + PW - n0x} height={PH} />}
          {decades.map((k, i) => {
            const y = sy(10 ** k);
            const [m, e] = decadeLabel(k);
            return (
              <g key={`d${k}`}>
                <line className="gc-grid" x1={PL} x2={PL + PW} y1={y} y2={y} />
                {(i % step === 0 || k === d1) && (
                  <text className="gc-tick y" x={PL - 6} y={y}>
                    {m}
                    {e && (
                      <tspan className="gc-exp" dy={-5}>
                        {e}
                      </tspan>
                    )}
                  </text>
                )}
              </g>
            );
          })}
          <line className="gc-zero" x1={PL} x2={PL + PW} y1={zeroY} y2={zeroY} />
          <text className="gc-tick y" x={PL - 6} y={zeroY}>
            0
          </text>
          {xTicks(x0, x1).map((t) => (
            <g key={`x${t}`}>
              <line className="gc-grid faint" x1={sx(t)} x2={sx(t)} y1={PT} y2={PT + PH} />
              <text className="gc-tick" x={sx(t)} y={PT + PH + ZERO + 10}>
                {t}
              </text>
            </g>
          ))}
          <text className="gc-axis" x={PL + PW / 2} y={HEIGHT - 6}>
            n
          </text>
          <g clipPath={`url(#${clip})`}>
            {band && band[0].points.length > 0 && (
              <polygon
                className="gc-band"
                points={[...band[1].points.map(([n, v]) => `${sx(n).toFixed(1)},${sy(v).toFixed(1)}`), ...[...band[0].points].reverse().map(([n, v]) => `${sx(n).toFixed(1)},${sy(v).toFixed(1)}`)].join(' ')}
              />
            )}
            {state.curves.map((c) =>
              c.points.length > 1 ? (
                <polyline key={c.id} className={`gc-curve role-${c.role}${c.dashed ? ' dashed' : ''}`} points={c.points.map(([n, v]) => `${sx(n).toFixed(1)},${sy(v).toFixed(1)}`).join(' ')} />
              ) : c.points.length === 1 ? (
                <circle key={c.id} className={`gc-curve-dot role-${c.role}`} cx={sx(c.points[0][0])} cy={sy(c.points[0][1])} r={2.5} />
              ) : null,
            )}
            {shown.length > 1 && <polyline className="gc-fline" points={shown.map((p) => `${sx(p.n).toFixed(1)},${syPoint(p.value).toFixed(1)}`).join(' ')} />}
            {state.probe && (
              <line className={`gc-probe role-${state.probe.role}`} x1={sx(state.probe.n)} x2={sx(state.probe.n)} y1={syPoint(state.probe.lo)} y2={syPoint(state.probe.hi)} />
            )}
          </g>
          {state.n0 && (
            <g className={`gc-n0${state.n0.final ? ' final' : ''}`}>
              <line x1={n0x} x2={n0x} y1={PT} y2={PT + PH} />
              <text x={n0Left ? n0x - 5 : n0x + 5} y={PT + 11} style={n0Left ? { textAnchor: 'end' } : undefined}>
                {state.n0.label}
              </text>
            </g>
          )}
          {ordered.map((p) => {
            const x = sx(p.n);
            const y = syPoint(p.value);
            const g = glyph(p.role);
            // A label near either edge of the plot is anchored so that it stays inside it.
            const anchor = x > PL + PW - 30 ? 'end' : x < PL + 30 ? 'start' : 'middle';
            const dx = anchor === 'end' ? 6 : anchor === 'start' ? -6 : 0;
            return (
              <g key={`p${p.n}`} className={`gc-point role-${p.role}${p.hidden ? ' hidden' : ''}`} style={{ transform: `translate(${x}px, ${y}px)` }}>
                {p.role === 'bad' ? <path className="gc-cross" d={`M${-r},${-r} L${r},${r} M${-r},${r} L${r},${-r}`} /> : <circle r={p.role === 'active' ? r + 1 : r} />}
                {p.role === 'good' && p.label === undefined && shown.length <= 16 && (
                  <text className="gc-glyph" x={0} y={-10}>
                    {g}
                  </text>
                )}
                {p.label && (
                  <text className="gc-point-label" x={dx} y={-12} style={anchor === 'middle' ? undefined : { textAnchor: anchor }}>
                    {p.label}
                    {g ? ` ${g}` : ''}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
