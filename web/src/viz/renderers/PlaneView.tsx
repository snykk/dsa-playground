import { useId, type CSSProperties } from 'react';
import type { Frame, Role } from '../core/types';
import { useTween, type Pt } from '../ui/hooks/useTween';
import { Strips, type StripData } from '../ui/molecules/Strip';
import { SYM } from '../ui/symbols';
import '../ui/roles.css';
import './PlaneView.css';

/** A point of the plane, in data coordinates (y grows upwards). */
export type XY = [number, number];

/** Where a label sits around its point; 'auto' points it away from the centre of the picture. */
export type LabelDir = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

export interface PlanePoint {
  /** Stable identity: a point with the same id glides to its new place. */
  id: string;
  at: XY;
  label?: string;
  role?: Role;
  /** Drawn hollow and faint: a removed duplicate, a point outside the current call. */
  ghost?: boolean;
  /** A small extra text under the point, such as its position in a sorted order. */
  tag?: string;
  labelDir?: LabelDir;
}

export interface PlaneSegment {
  id: string;
  a: XY;
  b: XY;
  role?: Role;
  dashed?: boolean;
  /** An arrowhead at b: a vector from a to b. */
  arrow?: boolean;
  /** Draw the segment from a to b when it first appears. */
  grow?: boolean;
  thin?: boolean;
  label?: string;
}

/** An infinite line through `at` with direction `dir`, clipped to the plane. */
export interface PlaneLine {
  id: string;
  at: XY;
  dir: XY;
  role?: Role;
  dashed?: boolean;
  label?: string;
}

/** A filled region (a triangle, a parallelogram, the hull); `open` draws a polyline instead. */
export interface PlanePolygon {
  id: string;
  pts: XY[];
  role?: Role;
  open?: boolean;
  dashed?: boolean;
  hatched?: boolean;
  label?: string;
}

export interface PlaneCircle {
  id: string;
  c: XY;
  r: number;
  role?: Role;
  dashed?: boolean;
  label?: string;
}

/** A vertical band x0 <= x <= x1 over the whole height (a strip, a half of a split). */
export interface PlaneBand {
  id: string;
  x0: number;
  x1: number;
  role?: Role;
  hatched?: boolean;
  label?: string;
}

/** The angle at c from the direction of a to the direction of b, the short way round. */
export interface PlaneArc {
  id: string;
  c: XY;
  a: XY;
  b: XY;
  role?: Role;
  label?: string;
}

/** A free annotation in data coordinates. */
export interface PlaneText {
  id: string;
  at: XY;
  text: string;
  role?: Role;
}

export interface PlaneBox {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

export interface PlaneState {
  /** What the picture shows, for screen readers. */
  label: string;
  points: PlanePoint[];
  segments?: PlaneSegment[];
  lines?: PlaneLine[];
  polygons?: PlanePolygon[];
  circles?: PlaneCircle[];
  bands?: PlaneBand[];
  arcs?: PlaneArc[];
  texts?: PlaneText[];
  /** More places to keep in view, for example where a later step draws something. */
  include?: XY[];
  note?: string;
  strips?: StripData[];
  /** The part of the plane to show. Set by stabilizePlane, so a run keeps one picture. */
  bounds?: PlaneBox;
}

/* ---------- bounds ---------- */

/** Every place a state draws something (lines and bands only add their anchors). */
function placesOf(s: PlaneState): XY[] {
  const out: XY[] = [...s.points.map((p) => p.at), ...(s.include ?? [])];
  for (const g of s.segments ?? []) out.push(g.a, g.b);
  for (const g of s.polygons ?? []) out.push(...g.pts);
  for (const c of s.circles ?? []) out.push([c.c[0] - c.r, c.c[1] - c.r], [c.c[0] + c.r, c.c[1] + c.r]);
  for (const l of s.lines ?? []) out.push(l.at);
  for (const a of s.arcs ?? []) out.push(a.c);
  for (const t of s.texts ?? []) out.push(t.at);
  return out.filter((p) => Number.isFinite(p[0]) && Number.isFinite(p[1]));
}

/** A box around the places with a margin, on whole numbers, at least 4 units each way. */
export function boundsOf(places: XY[]): PlaneBox {
  if (places.length === 0) return { x0: -1, y0: -1, x1: 5, y1: 5 };
  let x0 = Math.min(...places.map((p) => p[0]));
  let x1 = Math.max(...places.map((p) => p[0]));
  let y0 = Math.min(...places.map((p) => p[1]));
  let y1 = Math.max(...places.map((p) => p[1]));
  const pad = Math.max(1, 0.08 * Math.max(x1 - x0, y1 - y0));
  x0 = Math.floor(x0 - pad);
  x1 = Math.ceil(x1 + pad);
  y0 = Math.floor(y0 - pad);
  y1 = Math.ceil(y1 + pad);
  const grow = (lo: number, hi: number): [number, number] => {
    const missing = 4 - (hi - lo);
    return missing > 0 ? [lo - Math.floor(missing / 2), hi + Math.ceil(missing / 2)] : [lo, hi];
  };
  [x0, x1] = grow(x0, x1);
  [y0, y1] = grow(y0, y1);
  return { x0, y0, x1, y1 };
}

/** Give every frame the bounds of the whole run, so the plane keeps its size and scale. Call it from trace(). */
export function stabilizePlane<S extends PlaneState>(frames: Array<Frame<S>>): Array<Frame<S>> {
  const bounds = boundsOf(frames.flatMap((f) => placesOf(f.state)));
  return frames.map((f) => ({ ...f, state: { ...f.state, bounds } }));
}

/* ---------- layout ---------- */

const MAX_W = 540;
const MAX_H = 380;
const MAX_UNIT = 44;
const PL = 34; // room for the y labels
const PR = 12;
const PT = 12;
const PB = 22; // room for the x labels
const DOT = 5.5;
const STEPS = [1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000];

const DIRS: Record<LabelDir, [number, number]> = {
  n: [0, -1],
  s: [0, 1],
  e: [1, 0],
  w: [-1, 0],
  ne: [0.75, -0.75],
  nw: [-0.75, -0.75],
  se: [0.75, 0.75],
  sw: [-0.75, 0.75],
};

const OPPOSITE: Record<LabelDir, LabelDir> = { n: 's', s: 'n', e: 'w', w: 'e', ne: 'sw', nw: 'se', se: 'nw', sw: 'ne' };

function autoDir(at: XY, centre: XY): LabelDir {
  const dx = at[0] - centre[0];
  const dy = at[1] - centre[1];
  if (Math.hypot(dx, dy) < 1e-9) return 'ne';
  const angle = Math.atan2(dy, dx); // data space: y up
  const names: LabelDir[] = ['e', 'ne', 'n', 'nw', 'w', 'sw', 's', 'se'];
  return names[((Math.round(angle / (Math.PI / 4)) % 8) + 8) % 8];
}

function anchorOf(d: LabelDir): 'start' | 'middle' | 'end' {
  return d === 'e' || d === 'ne' || d === 'se' ? 'start' : d === 'w' || d === 'nw' || d === 'sw' ? 'end' : 'middle';
}

const LABEL_GAP = 11;
const CHAR_W = 6.4;

interface Box {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

function labelBox(at: Pt, dir: LabelDir, text: string): Box {
  const [dx, dy] = DIRS[dir];
  const x = at.x + dx * LABEL_GAP;
  const y = at.y + dy * LABEL_GAP;
  const w = text.length * CHAR_W;
  const a = anchorOf(dir);
  const x0 = a === 'start' ? x : a === 'end' ? x - w : x - w / 2;
  return { x0, y0: y - 7, x1: x0 + w, y1: y + 7 };
}

const overlaps = (a: Box, b: Box) => a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1;

/**
 * Where each point's label goes: its own direction if it has one, else the first direction,
 * starting with the one pointing away from the centre, whose label does not cover another
 * label or another dot. Computed on the target positions, so it does not flicker while moving.
 */
function placeLabels(points: PlanePoint[], at: (p: PlanePoint) => Pt, texts: string[], centre: XY): LabelDir[] {
  const dots: Box[] = points.map((p) => {
    const q = at(p);
    return { x0: q.x - DOT - 1, y0: q.y - DOT - 1, x1: q.x + DOT + 1, y1: q.y + DOT + 1 };
  });
  const placed: Box[] = [];
  return points.map((p, k) => {
    const first = p.labelDir ?? autoDir(p.at, centre);
    if (!texts[k]) return first;
    const order: LabelDir[] = p.labelDir ? [first] : [first, 'n', 's', 'ne', 'nw', 'se', 'sw', 'e', 'w'];
    const free = (d: LabelDir) => {
      const box = labelBox(at(p), d, texts[k]);
      // A dot drawn on this very spot (a duplicate, a result on an endpoint) cannot be avoided.
      return !placed.some((b) => overlaps(b, box)) && !dots.some((b, j) => j !== k && Math.abs(b.x0 - dots[k].x0) + Math.abs(b.y0 - dots[k].y0) > 1 && overlaps(b, box));
    };
    const dir = order.find(free) ?? first;
    placed.push(labelBox(at(p), dir, texts[k]));
    return dir;
  });
}

/**
 * Organism for plane geometry: a coordinate grid fitted to the run's bounds, with points,
 * segments and vectors, infinite lines clipped to the plane, filled polygons, circles,
 * vertical bands, angle arcs and annotations, each with a role. Everything is keyed, so a
 * point, a segment end, a line (its anchor and its direction), a circle or a band glides to
 * its new place between steps (useTween); a new segment marked `grow` draws itself.
 */
export function PlaneView({ state }: { state: PlaneState }) {
  const { points, segments = [], lines = [], polygons = [], circles = [], bands = [], arcs = [], texts = [], note, strips } = state;
  const b = state.bounds ?? boundsOf(placesOf(state));
  const spanX = b.x1 - b.x0;
  const spanY = b.y1 - b.y0;
  const unit = Math.min(MAX_W / spanX, MAX_H / spanY, MAX_UNIT);
  const w = PL + spanX * unit + PR;
  const h = PT + spanY * unit + PB;
  const sx = (x: number) => PL + (x - b.x0) * unit;
  const sy = (y: number) => PT + (b.y1 - y) * unit;
  const S = (p: XY): Pt => ({ x: sx(p[0]), y: sy(p[1]) });

  // Every moving part, in screen coordinates.
  const target = new Map<string, Pt>();
  for (const p of points) target.set(`p:${p.id}`, S(p.at));
  for (const g of segments) {
    target.set(`s:${g.id}:a`, S(g.a));
    target.set(`s:${g.id}:b`, S(g.b));
  }
  for (const l of lines) {
    const len = Math.hypot(l.dir[0], l.dir[1]) || 1;
    target.set(`l:${l.id}`, S(l.at));
    target.set(`l:${l.id}:d`, { x: (l.dir[0] / len) * 100, y: (-l.dir[1] / len) * 100 });
  }
  for (const g of polygons) g.pts.forEach((p, k) => target.set(`g:${g.id}:${k}`, S(p)));
  for (const c of circles) {
    target.set(`c:${c.id}`, S(c.c));
    target.set(`c:${c.id}:r`, { x: c.r * unit, y: 0 });
  }
  for (const d of bands) target.set(`b:${d.id}`, { x: sx(d.x0), y: sx(d.x1) });
  for (const t of texts) target.set(`t:${t.id}`, S(t.at));
  const pos = useTween(target);
  const at = (key: string): Pt => pos.get(key) ?? target.get(key)!;

  const uid = useId().replace(/:/g, '');
  const clip = `url(#plane-clip-${uid})`;
  const step = STEPS.find((s) => spanX / s <= 12 && spanY / s <= 12 && s * unit >= 22) ?? STEPS[STEPS.length - 1];
  const ticksX: number[] = [];
  for (let t = Math.ceil(b.x0 / step) * step; t <= b.x1; t += step) ticksX.push(t);
  const ticksY: number[] = [];
  for (let t = Math.ceil(b.y0 / step) * step; t <= b.y1; t += step) ticksY.push(t);
  const centre: XY = points.length
    ? [points.reduce((s, p) => s + p.at[0], 0) / points.length, points.reduce((s, p) => s + p.at[1], 0) / points.length]
    : [(b.x0 + b.x1) / 2, (b.y0 + b.y1) / 2];
  const labelTexts = points.map((p) => {
    const role = p.role ?? 'idle';
    const glyph = role === 'good' ? SYM.check : role === 'bad' ? SYM.cross : null;
    return `${p.label ?? ''}${glyph ? ` ${glyph}` : ''}`;
  });
  const dirs = placeLabels(points, (p) => target.get(`p:${p.id}`)!, labelTexts, centre);
  const left = sx(b.x0);
  const top = sy(b.y1);
  const right = sx(b.x1);
  const bottom = sy(b.y0);

  return (
    <div className="plane-wrap">
      <svg className="plane" viewBox={`0 0 ${w} ${h}`} style={{ width: w, maxWidth: '100%' }} role="img" aria-label={state.label}>
        <defs>
          <clipPath id={`plane-clip-${uid}`}>
            <rect x={left} y={top} width={right - left} height={bottom - top} />
          </clipPath>
          <pattern id={`plane-hatch-${uid}`} width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="7" className="plane-hatch-line" />
          </pattern>
        </defs>
        <rect className="plane-frame" x={left} y={top} width={right - left} height={bottom - top} />
        {ticksX.map((t) => (
          <g key={`x${t}`}>
            <line className={`plane-grid${t === 0 ? ' axis' : ''}`} x1={sx(t)} y1={top} x2={sx(t)} y2={bottom} />
            <text className="plane-tick" x={sx(t)} y={bottom + 12}>
              {t}
            </text>
          </g>
        ))}
        {ticksY.map((t) => (
          <g key={`y${t}`}>
            <line className={`plane-grid${t === 0 ? ' axis' : ''}`} x1={left} y1={sy(t)} x2={right} y2={sy(t)} />
            <text className="plane-tick" x={left - 5} y={sy(t)} style={{ textAnchor: 'end' }}>
              {t}
            </text>
          </g>
        ))}
        <g clipPath={clip}>
          {bands.map((d) => {
            const p = at(`b:${d.id}`);
            const x0 = Math.min(p.x, p.y);
            const x1 = Math.max(p.x, p.y);
            return (
              <g key={`b${d.id}`} className={`plane-band role-${d.role ?? 'compare'}${d.hatched ? ' hatched' : ''}`}>
                <rect x={x0} y={top} width={Math.max(0, x1 - x0)} height={bottom - top} fill={d.hatched ? `url(#plane-hatch-${uid})` : undefined} />
                {d.label && (
                  // At the band's inner left edge: a strip is centred on its dividing line, which a
                  // centred label would sit on.
                  <text className="plane-band-label" x={x0 + 4} y={top + 10}>
                    {d.label}
                  </text>
                )}
              </g>
            );
          })}
          {polygons.map((g) => {
            const pts = g.pts.map((_, k) => at(`g:${g.id}:${k}`));
            const d = pts.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ');
            const cls = `plane-poly role-${g.role ?? 'compare'}${g.dashed ? ' dashed' : ''}${g.hatched ? ' hatched' : ''}`;
            const cx = pts.reduce((s, p) => s + p.x, 0) / Math.max(1, pts.length);
            const cy = pts.reduce((s, p) => s + p.y, 0) / Math.max(1, pts.length);
            return (
              <g key={`g${g.id}`} className={cls}>
                {g.open ? <polyline points={d} /> : <polygon points={d} fill={g.hatched ? `url(#plane-hatch-${uid})` : undefined} />}
                {g.label && (
                  <text className="plane-poly-label" x={cx} y={cy}>
                    {g.label}
                  </text>
                )}
              </g>
            );
          })}
          {circles.map((c) => {
            const p = at(`c:${c.id}`);
            const r = Math.max(0, at(`c:${c.id}:r`).x);
            return (
              <g key={`c${c.id}`} className={`plane-circle role-${c.role ?? 'compare'}${c.dashed ? ' dashed' : ''}`}>
                <circle cx={p.x} cy={p.y} r={r} />
                {c.label && (
                  <text x={p.x} y={p.y - r - 7}>
                    {c.label}
                  </text>
                )}
              </g>
            );
          })}
          {lines.map((l) => {
            const p = at(`l:${l.id}`);
            const d = at(`l:${l.id}:d`);
            const len = Math.hypot(d.x, d.y) || 1;
            const ux = d.x / len;
            const uy = d.y / len;
            const far = 4 * (w + h);
            return (
              <g key={`l${l.id}`} className={`plane-line role-${l.role ?? 'idle'}${l.dashed ? ' dashed' : ''}`}>
                <line x1={p.x - ux * far} y1={p.y - uy * far} x2={p.x + ux * far} y2={p.y + uy * far} />
                {l.label && (
                  <text x={p.x + ux * 46 + uy * 10} y={p.y + uy * 46 - ux * 10}>
                    {l.label}
                  </text>
                )}
              </g>
            );
          })}
          {arcs.map((a) => {
            const c = S(a.c);
            const pa = S(a.a);
            const pb = S(a.b);
            const va = { x: pa.x - c.x, y: pa.y - c.y };
            const vb = { x: pb.x - c.x, y: pb.y - c.y };
            const la = Math.hypot(va.x, va.y);
            const lb = Math.hypot(vb.x, vb.y);
            if (la < 1e-9 || lb < 1e-9) return null;
            const r = Math.min(26, 0.45 * Math.min(la, lb));
            const start = { x: c.x + (va.x / la) * r, y: c.y + (va.y / la) * r };
            const end = { x: c.x + (vb.x / lb) * r, y: c.y + (vb.y / lb) * r };
            const sweep = va.x * vb.y - va.y * vb.x > 0 ? 1 : 0;
            const mid = { x: va.x / la + vb.x / lb, y: va.y / la + vb.y / lb };
            const ml = Math.hypot(mid.x, mid.y);
            const lx = ml < 1e-9 ? c.x - (va.y / la) * (r + 12) * (sweep ? -1 : 1) : c.x + (mid.x / ml) * (r + 13);
            const ly = ml < 1e-9 ? c.y + (va.x / la) * (r + 12) * (sweep ? -1 : 1) : c.y + (mid.y / ml) * (r + 13);
            return (
              <g key={`a${a.id}`} className={`plane-arc role-${a.role ?? 'done'}`}>
                <path d={`M ${start.x} ${start.y} A ${r} ${r} 0 0 ${sweep} ${end.x} ${end.y}`} />
                {a.label && (
                  <text x={lx} y={ly}>
                    {a.label}
                  </text>
                )}
              </g>
            );
          })}
          {segments.map((g) => {
            const a = at(`s:${g.id}:a`);
            const e = at(`s:${g.id}:b`);
            const len = Math.hypot(e.x - a.x, e.y - a.y);
            const ux = len > 1e-9 ? (e.x - a.x) / len : 0;
            const uy = len > 1e-9 ? (e.y - a.y) / len : 0;
            const head = g.arrow && len > 12;
            const tip = head ? { x: e.x - ux * 2, y: e.y - uy * 2 } : e;
            const cls = `plane-seg role-${g.role ?? 'idle'}${g.dashed ? ' dashed' : ''}${g.thin ? ' thin' : ''}${g.grow && !g.dashed ? ' grow' : ''}`;
            return (
              <g key={`s${g.id}`} className={cls}>
                <line
                  x1={a.x}
                  y1={a.y}
                  x2={head ? tip.x - ux * 7 : tip.x}
                  y2={head ? tip.y - uy * 7 : tip.y}
                  style={g.grow && !g.dashed ? ({ strokeDasharray: len + 1, '--len': `${len + 1}` } as CSSProperties) : undefined}
                />
                {head && (
                  <polygon
                    className="plane-head"
                    points={`${tip.x},${tip.y} ${tip.x - ux * 10 - uy * 5},${tip.y - uy * 10 + ux * 5} ${tip.x - ux * 10 + uy * 5},${tip.y - uy * 10 - ux * 5}`}
                  />
                )}
                {g.label && (
                  <text x={a.x + (e.x - a.x) * (g.arrow ? 0.35 : 0.5) - uy * 11} y={a.y + (e.y - a.y) * (g.arrow ? 0.35 : 0.5) + ux * 11}>
                    {g.label}
                  </text>
                )}
              </g>
            );
          })}
          {texts.map((t) => {
            const p = at(`t:${t.id}`);
            return (
              <text key={`t${t.id}`} className={`plane-note-text role-${t.role ?? 'idle'}`} x={p.x} y={p.y}>
                {t.text}
              </text>
            );
          })}
        </g>
        {points.map((p, k) => {
          const q = at(`p:${p.id}`);
          const role = p.role ?? 'idle';
          const dir = dirs[k];
          const [dx, dy] = DIRS[dir];
          const text = labelTexts[k];
          return (
            <g key={`p${p.id}`} className={`plane-point role-${role}${p.ghost ? ' ghost' : ''}`}>
              <circle cx={q.x} cy={q.y} r={DOT} />
              {text && (
                <text x={q.x + dx * LABEL_GAP} y={q.y + dy * LABEL_GAP} style={{ textAnchor: anchorOf(dir) }}>
                  {text}
                </text>
              )}
              {p.tag && (
                <text className="plane-tag" x={q.x - dx * 10} y={q.y - dy * 10} style={{ textAnchor: anchorOf(OPPOSITE[dir]) }}>
                  {p.tag}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      {note && <p className="plane-note">{note}</p>}
      <Strips strips={strips} />
    </div>
  );
}
