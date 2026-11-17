import type { Frame } from '../core/types';
import type { Box, EuclidState, TileRun } from '../algorithms/euclideanAlgorithm';
import '../ui/roles.css';
import { monoW, StableStrips, stripSlots, SvgTable, tableHeight, tableWidth } from './numberTheoryShared';
import './EuclidTiling.css';

const PW = 224;
const PH = 190;
const PAD = 12;
const NOTE_H = 22;
const ROW_H = 18;
const MIN_COL = 34;

/** One size for a whole run: the most table rows, the widest text of each column and every strip at its widest. */
export function stabilizeEuclid(frames: Array<Frame<EuclidState>>): Array<Frame<EuclidState>> {
  const chars = new Map<string, number>();
  let rows = 0;
  for (const f of frames) {
    const t = f.state.table;
    rows = Math.max(rows, t.rows.length);
    t.columns.forEach((c, i) => {
      const longest = Math.max(c.length, ...t.rows.map((r) => r[i]?.text.length ?? 0));
      chars.set(c, Math.max(chars.get(c) ?? 0, longest));
    });
  }
  let widest = 0;
  for (const f of frames) widest = Math.max(widest, tableWidth(f.state.table.columns.map((c) => colWidth(chars.get(c) ?? 1))));
  const slots = stripSlots(frames);
  return frames.map((f) => ({ ...f, state: { ...f.state, stripSlots: slots, layout: { rows, cols: f.state.table.columns.map((c) => chars.get(c) ?? 1), width: widest } } }));
}

const colWidth = (chars: number) => Math.max(MIN_COL, monoW(chars) + 14);

interface Cam {
  s: number;
  ox: number;
  oy: number;
}

function fit(cam: Box): Cam | null {
  if (cam.w <= 0 || cam.h <= 0) return null;
  const s = Math.min((PW - 2 * PAD) / cam.w, (PH - 2 * PAD) / cam.h);
  return { s, ox: PAD + (PW - 2 * PAD - cam.w * s) / 2 - cam.x * s, oy: PAD + (PH - 2 * PAD - cam.h * s) / 2 - cam.y * s };
}

/** Screen coordinates are clamped to a band around the panel, so far-away shapes stay finite. */
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

function screenBox(c: Cam, b: Box): Box {
  const x0 = clamp(c.ox + b.x * c.s, -PW, 2 * PW);
  const y0 = clamp(c.oy + b.y * c.s, -PH, 2 * PH);
  const x1 = clamp(c.ox + (b.x + b.w) * c.s, -PW, 2 * PW);
  const y1 = clamp(c.oy + (b.y + b.h) * c.s, -PH, 2 * PH);
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
}

const placed = (b: Box) => ({ transform: `translate(${b.x.toFixed(2)}px, ${b.y.toFixed(2)}px) scale(${Math.max(b.w, 0.01).toFixed(3)}, ${Math.max(b.h, 0.01).toFixed(3)})` });

interface Shape {
  key: string;
  box: Box;
  role: string;
  label?: string;
  band?: number;
}

/** The squares of a run that lie near the view: one by one when they are big enough, else as a band. */
function runShapes(c: Cam, run: TileRun): Shape[] {
  const step = run.side * c.s;
  const along = run.dir === 'x';
  const start = along ? c.ox + run.x * c.s : c.oy + run.y * c.s;
  const across = along ? c.oy + run.y * c.s : c.ox + run.x * c.s;
  const span = along ? PW : PH;
  const spanAcross = along ? PH : PW;
  if (across > 2 * spanAcross || across + step < -spanAcross) return [];
  const first = Math.max(0, Math.floor((-span - start) / step));
  const last = Math.min(run.count - 1, Math.ceil((2 * span - start) / step));
  if (last < first) return [];
  const box = (i: number, n: number): Box =>
    along ? { x: run.x + i * run.side, y: run.y, w: n * run.side, h: run.side } : { x: run.x, y: run.y + i * run.side, w: run.side, h: n * run.side };
  if (step < 3 || last - first > 60) {
    return [{ key: `${run.id}-band`, box: screenBox(c, box(first, last - first + 1)), role: run.role, band: run.count }];
  }
  const shapes: Shape[] = [];
  for (let i = first; i <= last; i++) {
    shapes.push({ key: `${run.id}-${i}`, box: screenBox(c, box(i, 1)), role: run.role, label: step >= 24 && monoW(String(run.side).length, 11) + 6 < step ? String(run.side) : undefined });
  }
  return shapes;
}

/**
 * Organism for the Euclidean algorithm: on the left the |a| x |b| rectangle, where every step
 * cuts the largest squares that fit and the view follows the strip that is left (a long thin
 * rectangle shows its last squares instead of a hairline); on the right the table of remainders
 * and, for the extended form, the coefficients filled back up. Strips list the calls and the
 * open recursive calls.
 */
export function EuclidTiling({ state }: { state: EuclidState }) {
  const { panel, table } = state;
  const layout = state.layout ?? { rows: table.rows.length, cols: table.columns.map((c) => c.length), width: 0 };
  const colW = layout.cols.map(colWidth);
  const tw = Math.max(layout.width, tableWidth(colW), 120);
  const th = tableHeight(Math.max(layout.rows, 1), ROW_H);
  const cam = fit(panel.camera);
  const full: Box = { x: 0, y: 0, w: panel.width, h: panel.height };
  const shapes = cam ? panel.runs.flatMap((r) => runShapes(cam, r)) : [];
  const zoom = cam && panel.width > 0 && panel.height > 0 ? cam.s / Math.min((PW - 2 * PAD) / panel.width, (PH - 2 * PAD) / panel.height) : 1;
  const gridLines: Array<{ key: string; x1: number; y1: number; x2: number; y2: number }> = [];
  if (cam && panel.grid && panel.grid * cam.s >= 4) {
    const g = panel.grid;
    const r = screenBox(cam, full);
    for (let k = 1; k * g < panel.width && gridLines.length < 400; k++) {
      const x = cam.ox + k * g * cam.s;
      if (x > -2 && x < PW + 2) gridLines.push({ key: `v${k}`, x1: x, y1: Math.max(r.y, 0), x2: x, y2: Math.min(r.y + r.h, PH) });
    }
    for (let k = 1; k * g < panel.height && gridLines.length < 400; k++) {
      const y = cam.oy + k * g * cam.s;
      if (y > -2 && y < PH + 2) gridLines.push({ key: `h${k}`, x1: Math.max(r.x, 0), y1: y, x2: Math.min(r.x + r.w, PW), y2: y });
    }
  }
  const describe = `${panel.width} by ${panel.height} rectangle with ${panel.runs.reduce((s, r) => s + r.count, 0)} squares cut; table rows: ${table.rows.map((r) => r.map((c) => c.text || '-').join(' ')).join('; ')}`;
  const clipId = `et-clip-${panel.call}`;

  return (
    <div className="et-wrap">
      <div className="nt-flex">
        <svg className="nt-svg euclid-panel" viewBox={`0 0 ${PW} ${PH + NOTE_H}`} style={{ width: PW }} role="img" aria-label={describe}>
          <defs>
            <clipPath id={clipId}>
              <rect width={PW} height={PH} rx={8} />
            </clipPath>
            <pattern id={`${clipId}-hatch`} width={6} height={6} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1={0} y1={0} x2={0} y2={6} className="et-hatch" />
            </pattern>
          </defs>
          <rect className="et-frame" width={PW} height={PH} rx={8} />
          <g clipPath={`url(#${clipId})`}>
            {cam && panel.width > 0 && panel.height > 0 && (
              <g key={`full-${panel.call}`} className="et-full" style={placed(screenBox(cam, full))}>
                <rect width={1} height={1} />
              </g>
            )}
            {shapes.map((sh) =>
              sh.band !== undefined ? (
                <g key={sh.key} className={`et-band role-${sh.role}`}>
                  <rect x={sh.box.x} y={sh.box.y} width={Math.max(sh.box.w, 0.5)} height={Math.max(sh.box.h, 0.5)} />
                  <rect className="et-hatchfill" x={sh.box.x} y={sh.box.y} width={Math.max(sh.box.w, 0.5)} height={Math.max(sh.box.h, 0.5)} fill={`url(#${clipId}-hatch)`} />
                </g>
              ) : (
                <g key={sh.key} className={`et-sq role-${sh.role}`} style={placed(sh.box)}>
                  <rect width={1} height={1} />
                </g>
              ),
            )}
            {shapes.map((sh) =>
              sh.label ? (
                <text key={`t-${sh.key}`} className={`et-sqlabel role-${sh.role}`} style={{ transform: `translate(${(sh.box.x + sh.box.w / 2).toFixed(2)}px, ${(sh.box.y + sh.box.h / 2).toFixed(2)}px)` }}>
                  {sh.label}
                </text>
              ) : null,
            )}
            {gridLines.map((l) => (
              <line key={l.key} className="et-grid" x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} />
            ))}
            {cam && panel.focus && (
              <g key={`focus-${panel.call}`} className={`et-focus role-${panel.focus.role}`} style={placed(screenBox(cam, panel.focus))}>
                <rect width={1} height={1} />
              </g>
            )}
            {!cam && panel.note && (
              <>
                <line className="et-degenerate" x1={PAD * 2} y1={PH / 2} x2={PW - PAD * 2} y2={PH / 2} />
                <text className="nt-note" x={PW / 2} y={PH / 2 + 16}>
                  {panel.note}
                </text>
              </>
            )}
          </g>
          <text className="nt-note" x={PW / 2} y={PH + NOTE_H / 2 + 2}>
            {panel.width > 0 && panel.height > 0 ? `${panel.width} x ${panel.height} rectangle${zoom > 1.05 ? `, zoom ${zoom >= 10 ? Math.round(zoom) : zoom.toFixed(1)}x` : ''}` : ''}
          </text>
        </svg>
        <svg className="nt-svg euclid-table" viewBox={`0 0 ${tw} ${th}`} style={{ width: tw }} role="img" aria-label="Table of remainders">
          <SvgTable x={0} y={0} columns={table.columns} colW={colW} rows={table.rows} rowH={ROW_H} />
        </svg>
      </div>
      <StableStrips strips={state.strips} slots={state.stripSlots} />
    </div>
  );
}
