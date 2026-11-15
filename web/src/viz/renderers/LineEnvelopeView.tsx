import { useId } from 'react';
import type { Frame, Role } from '../core/types';
import { Strips, type StripData } from '../ui/molecules/Strip';
import '../ui/roles.css';
import { SYM } from '../ui/symbols';
import './LineEnvelopeView.css';

/** A line y = m * x + b. */
export interface EnvLine {
  id: string;
  m: number;
  b: number;
  /** Short name drawn where the line leaves the plot ("L2"). */
  label: string;
  role?: Role;
  dashed?: boolean;
}

/** A dot on the plot: a line's value at the query, an intersection. */
export interface EnvMark {
  id: string;
  x: number;
  y: number;
  label?: string;
  role?: Role;
}

export interface EnvWindow {
  x0: number;
  x1: number;
  y0: number;
  y1: number;
}

export interface EnvelopeState {
  /** What the picture shows, for screen readers. */
  label: string;
  /** The part of the plane to show; keep it the same for a whole run. */
  window: EnvWindow;
  lines: EnvLine[];
  /** The lower envelope of the lines in the deque, as a polyline drawn under them. */
  hull?: Array<[number, number]>;
  /** A vertical marker at a query x. */
  probe?: { x: number; label: string; role?: Role };
  marks?: EnvMark[];
  /** The deque, front first, drawn as cells under the plot. */
  deque: Array<{ text: string; role?: Role }>;
  dequeLabel?: string;
  /** Room for this many deque cells, so the picture keeps its width while the deque grows (stabilizeEnvelope). */
  dequeSlots?: number;
  strips?: StripData[];
}

/** Give every frame room for the longest deque of the run, so the picture keeps one size. Call it from trace(). */
export function stabilizeEnvelope<S extends EnvelopeState>(frames: Array<Frame<S>>): Array<Frame<S>> {
  const slots = Math.max(1, ...frames.map((f) => f.state.deque.length));
  return frames.map((f) => ({
    ...f,
    state: { ...f.state, dequeSlots: slots },
  }));
}

const PL = 44;
const PR = 46;
const PT = 14;
const PW = 500;
const PH = 270;
const AX = 22; // room under the plot for the x labels
const CELL_W = 84;
const CELL_H = 26;
const DQ_TOP = PT + PH + AX + 22;
const STEPS = [1, 2, 5, 10, 20, 25, 50, 100, 200, 500, 1000];

function ticks(lo: number, hi: number): number[] {
  const step = STEPS.find((s) => (hi - lo) / s <= 10) ?? STEPS[STEPS.length - 1];
  const out: number[] = [];
  for (let t = Math.ceil(lo / step) * step; t <= hi + 1e-9; t += step) out.push(t);
  return out;
}

const glyphOf = (role: Role | undefined) => (role === 'good' ? SYM.check : role === 'bad' ? SYM.cross : null);

/**
 * Organism for the convex hull trick: lines y = m x + b on a plot whose x and y axes scale
 * separately (slopes of a few units would make an equal-aspect plane too thin), the lower
 * envelope of the current lines as a broad band under them, a vertical probe at a query x with
 * dots on the lines it compares, and the deque of lines as cells under the plot, front first.
 */
export function LineEnvelopeView({ state }: { state: EnvelopeState }) {
  const { window: w, lines, hull, probe, marks = [], deque } = state;
  const sx = (x: number) => PL + ((x - w.x0) / (w.x1 - w.x0)) * PW;
  const sy = (y: number) => PT + ((w.y1 - y) / (w.y1 - w.y0)) * PH;
  const dequeW = Math.max(1, deque.length) * CELL_W;
  const width = Math.max(PL + PW + PR, Math.max(deque.length, state.dequeSlots ?? 0) * CELL_W + 2 * PL);
  const height = DQ_TOP + CELL_H + 22;
  const dqLeft = Math.max(PL, (width - dequeW) / 2);
  // The plot is centred when a long deque makes the picture wider than it.
  const ox = (width - (PL + PW + PR)) / 2;
  const clipId = `env-clip-${useId().replace(/:/g, '')}`;

  /**
   * Where a line's label goes: at its right end if that is inside the plot, else where it leaves
   * through the top or bottom; a label that would cover one already placed slides back along its line.
   */
  const placed: Array<{ x: number; y: number }> = [];
  const labelAt = (l: EnvLine): { x: number; y: number; anchor: 'start' | 'end' } | null => {
    const inside = (x: number) => {
      const y = l.m * x + l.b;
      return y >= w.y0 && y <= w.y1;
    };
    let xe: number;
    const yr = l.m * w.x1 + l.b;
    if (yr >= w.y0 && yr <= w.y1) xe = w.x1;
    else if (l.m === 0) return null;
    else xe = ((yr > w.y1 ? w.y1 : w.y0) - l.b) / l.m;
    if (xe < w.x0 || xe > w.x1) return null;
    const step = (w.x1 - w.x0) / 14;
    for (let k = 0; k < 8; k++) {
      const x = xe - k * step;
      if (x < w.x0 || !inside(x)) break;
      const at = k === 0 && xe === w.x1 ? { x: sx(x) + 5, y: sy(l.m * x + l.b), anchor: 'start' as const } : { x: sx(x) - 5, y: sy(l.m * x + l.b) - 9, anchor: 'end' as const };
      if (placed.every((p) => Math.abs(p.x - at.x) > 26 || Math.abs(p.y - at.y) > 13)) {
        placed.push(at);
        return at;
      }
    }
    return null;
  };

  return (
    <div className="env-wrap">
      <svg className="env-view" viewBox={`0 0 ${width} ${height}`} style={{ width, maxWidth: '100%' }} role="img" aria-label={state.label}>
        <defs>
          <clipPath id={clipId}>
            <rect x={PL} y={PT} width={PW} height={PH} />
          </clipPath>
        </defs>
        <g transform={`translate(${ox} 0)`}>
          <rect className="env-frame" x={PL} y={PT} width={PW} height={PH} />
          {ticks(w.x0, w.x1).map((t) => (
            <g key={`x${t}`}>
              <line className={`env-grid${t === 0 ? ' axis' : ''}`} x1={sx(t)} x2={sx(t)} y1={PT} y2={PT + PH} />
              <text className="env-tick" x={sx(t)} y={PT + PH + 12}>
                {t}
              </text>
            </g>
          ))}
          {ticks(w.y0, w.y1).map((t) => (
            <g key={`y${t}`}>
              <line className={`env-grid${t === 0 ? ' axis' : ''}`} x1={PL} x2={PL + PW} y1={sy(t)} y2={sy(t)} />
              <text className="env-tick" x={PL - 6} y={sy(t)} style={{ textAnchor: 'end' }}>
                {t}
              </text>
            </g>
          ))}
          <g clipPath={`url(#${clipId})`}>
            {hull && hull.length > 1 && <polyline className="env-hull" points={hull.map(([x, y]) => `${sx(x).toFixed(1)},${sy(y).toFixed(1)}`).join(' ')} />}
            {probe && <line className={`env-probe role-${probe.role ?? 'compare'}`} x1={sx(probe.x)} x2={sx(probe.x)} y1={PT} y2={PT + PH} />}
            {lines.map((l) => (
              <line
                key={l.id}
                className={`env-line role-${l.role ?? 'idle'}${l.dashed ? ' dashed' : ''}`}
                x1={sx(w.x0)}
                y1={sy(l.m * w.x0 + l.b)}
                x2={sx(w.x1)}
                y2={sy(l.m * w.x1 + l.b)}
              />
            ))}
            {marks.map((p) => (
              <g key={p.id} className={`env-mark role-${p.role ?? 'compare'}`}>
                <circle cx={sx(p.x)} cy={sy(p.y)} r={5} />
                {p.label && (
                  <text x={sx(p.x) + 8} y={sy(p.y) - 9} style={{ textAnchor: 'start' }}>
                    {p.label}
                    {glyphOf(p.role) ? ` ${glyphOf(p.role)}` : ''}
                  </text>
                )}
              </g>
            ))}
          </g>
          {probe && (
            <text className={`env-probe-label role-${probe.role ?? 'compare'}`} x={sx(probe.x)} y={PT + PH + AX + 4}>
              {probe.label}
            </text>
          )}
          {[...lines]
            // Lines in play get the first pick of a free spot; faint ones take what is left.
            .sort((a, b) => Number(a.role === 'muted') - Number(b.role === 'muted'))
            .map((l) => {
              const at = labelAt(l);
              if (!at) return null;
              return (
                <text key={`t${l.id}`} className={`env-label role-${l.role ?? 'idle'}`} x={at.x} y={at.y} style={{ textAnchor: at.anchor }}>
                  {l.label}
                </text>
              );
            })}
        </g>
        <text className="env-dq-label" x={dqLeft - 8} y={DQ_TOP + CELL_H / 2} style={{ textAnchor: 'end' }}>
          {state.dequeLabel ?? 'deque'}
        </text>
        {deque.length === 0 && (
          <text className="env-dq-empty" x={dqLeft + 8} y={DQ_TOP + CELL_H / 2} style={{ textAnchor: 'start' }}>
            empty
          </text>
        )}
        {deque.map((c, i) => {
          const x = dqLeft + i * CELL_W;
          const glyph = glyphOf(c.role);
          return (
            <g key={`${c.text}-${i}`} className={`env-cell role-${c.role ?? 'idle'}`}>
              <rect x={x + 2} y={DQ_TOP} width={CELL_W - 4} height={CELL_H} rx={5} />
              <text x={x + CELL_W / 2} y={DQ_TOP + CELL_H / 2}>
                {c.text}
              </text>
              {glyph && (
                <text className="env-glyph" x={x + CELL_W - 4} y={DQ_TOP + 2}>
                  {glyph}
                </text>
              )}
            </g>
          );
        })}
        {deque.length > 0 && (
          <g className="env-ends">
            <text x={dqLeft + CELL_W / 2} y={DQ_TOP + CELL_H + 11}>
              front
            </text>
            {deque.length > 1 && (
              <text x={dqLeft + (deque.length - 0.5) * CELL_W} y={DQ_TOP + CELL_H + 11}>
                back
              </text>
            )}
          </g>
        )}
      </svg>
      <Strips strips={state.strips} />
    </div>
  );
}
