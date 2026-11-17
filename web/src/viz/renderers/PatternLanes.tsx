import { useId } from 'react';
import type { Frame, Role } from '../core/types';
import { useTween, type Pt } from '../ui/hooks/useTween';
import type { StripData } from '../ui/molecules/Strip';
import '../ui/roles.css';
import { SYM } from '../ui/symbols';
import './PatternLanes.css';
import { StableStrips, stripsSizer } from './patternStrips';

/** One cell. It keeps its id when it moves, so a cell that changes lane or column glides there. */
export interface LaneCellView {
  id: string;
  lane: number;
  col: number;
  text: string;
  role?: Role;
  /** Faded with a dashed outline: a duplicate, a skipped or a discarded cell. */
  ghost?: boolean;
}

export interface LaneView {
  label: string;
  /** A second, smaller label line under the first. */
  sub?: string;
  /** Column texts drawn above the cells (capacities, the characters of a string, indices). */
  header?: string[];
  /** Header text that is highlighted, by column. */
  headerRoles?: Record<number, Role>;
}

/** An arrow from one cell to another; within one lane it arcs over the cells. */
export interface LaneArrow {
  from: string;
  to: string;
  role: Role;
  label?: string;
}

/** A pointer label under a column of a lane (lo, hi, mid, w...). Several on one column stack. */
export interface LaneMarker {
  lane: number;
  col: number;
  text: string;
  role?: Role;
}

/** A bracket over a range of columns of a lane (the two halves of an array). */
export interface LaneBand {
  lane: number;
  from: number;
  to: number;
  role: Role;
  label?: string;
}

export interface PatternLanesState {
  /** What the picture shows, for screen readers. */
  label: string;
  lanes: LaneView[];
  cells: LaneCellView[];
  arrows?: LaneArrow[];
  markers?: LaneMarker[];
  bands?: LaneBand[];
  /** Columns the picture reserves; stabilizeLanes gives every frame of a run the widest. */
  cols?: number;
  /** Cell width in px (wider for long numbers); stabilizeLanes keeps one per run. */
  cellWidth?: number;
  /** Lanes that get room above their cells for arcs (same-lane arrows); set by stabilizeLanes. */
  arcLanes?: number[];
  /** Marker rows each lane reserves below its cells; set by stabilizeLanes. */
  markerRows?: number[];
  /** Lanes that reserve a row for a band, and for a header; set by stabilizeLanes. */
  bandLanes?: number[];
  headerLanes?: number[];
  strips?: StripData[];
  /** The largest strips of the run, reserved so the picture keeps its height; set by stabilizeLanes. */
  stripsSizer?: StripData[];
}

const LABEL_W = 96;
const GAP = 6;
const CELL_H = 30;
const HEADER_H = 16;
const BAND_H = 26;
const ARC_H = 32;
const MARK_H = 15;
const LANE_GAP = 20;
const PAD = 8;

/** Text width in px of a cell value: 8 px per character plus padding, at least 34. */
export function cellWidthFor(texts: string[]): number {
  const longest = texts.reduce((m, t) => Math.max(m, t.length), 1);
  return Math.max(34, longest * 8 + 14);
}

/**
 * Give every frame of a run one picture size: the most columns, one cell width, the lanes that
 * need room for arcs and the most markers stacked under any column of each lane.
 */
export function stabilizeLanes<S extends PatternLanesState>(frames: Array<Frame<S>>): Array<Frame<S>> {
  let cols = 1;
  const texts: string[] = [];
  const arcs = new Set<number>();
  const bands = new Set<number>();
  const headers = new Set<number>();
  const marks: number[] = [];
  for (const f of frames) {
    const s = f.state;
    for (const c of s.cells) {
      cols = Math.max(cols, c.col + 1);
      texts.push(c.text);
    }
    s.lanes.forEach((lane, i) => {
      cols = Math.max(cols, lane.header?.length ?? 0);
      if (lane.header) headers.add(i);
    });
    for (const b of s.bands ?? []) bands.add(b.lane);
    const byId = new Map(s.cells.map((c) => [c.id, c]));
    for (const a of s.arrows ?? []) {
      const from = byId.get(a.from);
      const to = byId.get(a.to);
      if (from && to && from.lane === to.lane) arcs.add(from.lane);
    }
    const stack = new Map<string, number>();
    for (const m of s.markers ?? []) {
      const key = `${m.lane}:${m.col}`;
      const k = (stack.get(key) ?? 0) + 1;
      stack.set(key, k);
      marks[m.lane] = Math.max(marks[m.lane] ?? 0, k);
    }
  }
  const cellWidth = frames.reduce((w, f) => Math.max(w, f.state.cellWidth ?? 0), cellWidthFor(texts));
  const laneCount = frames.reduce((m, f) => Math.max(m, f.state.lanes.length), 0);
  const markerRows = Array.from({ length: laneCount }, (_, i) => marks[i] ?? 0);
  const sorted = (xs: Set<number>) => [...xs].sort((a, b) => a - b);
  const sizer = stripsSizer(frames.map((f) => f.state.strips));
  return frames.map((f) => ({
    ...f,
    state: { ...f.state, cols, cellWidth, arcLanes: sorted(arcs), markerRows, bandLanes: sorted(bands), headerLanes: sorted(headers), stripsSizer: sizer },
  }));
}

interface LaneBox {
  /** Top of the band row, middle of the header row, and the top of the cells. */
  bandY: number;
  headerY: number;
  cellsTop: number;
}

function layout(state: PatternLanesState): { boxes: LaneBox[]; height: number } {
  const arcs = new Set(state.arcLanes ?? []);
  const bands = new Set(state.bandLanes ?? (state.bands ?? []).map((b) => b.lane));
  const headers = new Set(state.headerLanes ?? state.lanes.flatMap((l, i) => (l.header ? [i] : [])));
  const boxes: LaneBox[] = [];
  let y = PAD;
  state.lanes.forEach((_, i) => {
    const bandY = y;
    if (bands.has(i)) y += BAND_H;
    const headerY = y + HEADER_H / 2;
    if (headers.has(i)) y += HEADER_H;
    if (arcs.has(i)) y += ARC_H;
    boxes.push({ bandY, headerY, cellsTop: y });
    y += CELL_H + (state.markerRows?.[i] ?? 0) * MARK_H + LANE_GAP;
  });
  return { boxes, height: y - LANE_GAP + PAD };
}

/**
 * Organism: labelled lanes of cells (an array, its subset sums, a DP row, sorted distinct
 * values). Cells are keyed, so sorting, copying a row up or moving a value into its rank slot
 * glides; arrows show which cells a value came from; markers name the pointers of a search.
 */
export function PatternLanes({ state }: { state: PatternLanesState }) {
  const uid = useId().replace(/:/g, '');
  const cw = state.cellWidth ?? 40;
  const step = cw + GAP;
  const cols = state.cols ?? Math.max(1, ...state.cells.map((c) => c.col + 1));
  const width = LABEL_W + cols * step + PAD;
  const { boxes, height } = layout(state);
  const x = (col: number) => LABEL_W + col * step;

  const target = new Map<string, Pt>();
  for (const c of state.cells) target.set(c.id, { x: x(c.col), y: boxes[c.lane]?.cellsTop ?? 0 });
  const pos = useTween(target, 420);
  const at = (id: string) => pos.get(id) ?? target.get(id);
  const byId = new Map(state.cells.map((c) => [c.id, c]));

  const stacked = new Map<string, number>();
  const markers = (state.markers ?? []).map((m) => {
    const key = `${m.lane}:${m.col}`;
    const k = stacked.get(key) ?? 0;
    stacked.set(key, k + 1);
    return { ...m, k };
  });

  return (
    <div className="lanes-wrap">
      <svg
        className="pattern-lanes"
        viewBox={`0 0 ${width} ${height}`}
        style={{ width, maxWidth: '100%', minWidth: Math.min(width, 500) }}
        role="img"
        aria-label={state.label}
      >
        {state.lanes.map((lane, i) => {
          const box = boxes[i];
          const mid = box.cellsTop + CELL_H / 2;
          return (
            <g key={`lane${i}`}>
              <text className="lanes-label" x={LABEL_W - 10} y={lane.sub ? mid - 7 : mid}>
                {lane.label}
              </text>
              {lane.sub && (
                <text className="lanes-sub" x={LABEL_W - 10} y={mid + 8}>
                  {lane.sub}
                </text>
              )}
              {lane.header?.map((h, c) => (
                <text
                  key={`h${c}`}
                  className={`lanes-head role-${lane.headerRoles?.[c] ?? 'idle'}`}
                  x={x(c) + cw / 2}
                  y={box.headerY}
                >
                  {h}
                </text>
              ))}
            </g>
          );
        })}
        {(state.bands ?? []).map((b, i) => {
          // The label sits above a bracket whose legs reach down towards the cells.
          const top = boxes[b.lane].bandY;
          const x0 = x(b.from) + 2;
          const x1 = x(b.to) + cw - 2;
          return (
            <g key={`band${i}`} className={`lanes-band role-${b.role}`}>
              <path d={`M${x0},${top + 23} V${top + 16} H${x1} V${top + 23}`} />
              {b.label && (
                <text x={(x0 + x1) / 2} y={top + 7}>
                  {b.label}
                </text>
              )}
            </g>
          );
        })}
        {state.cells.map((c) => {
          const p = at(c.id)!;
          const role = c.role ?? 'idle';
          const glyph = role === 'good' ? SYM.check : role === 'bad' ? SYM.cross : null;
          return (
            <g key={c.id} className={`lanes-cell role-${role}${c.ghost ? ' ghost' : ''}`} transform={`translate(${p.x.toFixed(1)},${p.y.toFixed(1)})`}>
              <rect width={cw} height={CELL_H} rx={6} />
              <text x={cw / 2} y={CELL_H / 2 + 1}>
                {c.text}
              </text>
              {glyph && (
                <g className="lanes-glyph">
                  <circle cx={cw - 2} cy={2} r={7} />
                  <text x={cw - 2} y={2.5}>
                    {glyph}
                  </text>
                </g>
              )}
            </g>
          );
        })}
        {(state.arrows ?? []).map((a, i) => {
          const from = byId.get(a.from);
          const to = byId.get(a.to);
          const p = at(a.from);
          const q = at(a.to);
          if (!from || !to || !p || !q) return null;
          let d: string;
          let lx: number;
          let ly: number;
          if (from.lane === to.lane) {
            const x1 = p.x + cw / 2;
            const x2 = q.x + cw / 2;
            const y0 = p.y - 2;
            const lift = ARC_H - 6;
            d = `M${x1},${y0} C${x1},${y0 - lift} ${x2},${y0 - lift} ${x2},${y0 - 1}`;
            lx = (x1 + x2) / 2;
            ly = y0 - lift * 0.75 - 4;
          } else {
            const down = from.lane < to.lane;
            const x1 = p.x + cw / 2;
            const x2 = q.x + cw / 2;
            const y1 = down ? p.y + CELL_H + 1 : p.y - 1;
            const y2 = down ? q.y - 2 : q.y + CELL_H + 2;
            const my = (y1 + y2) / 2;
            d = `M${x1},${y1} C${x1},${my} ${x2},${my} ${x2},${y2}`;
            // Beside the curve's middle, so a short, nearly vertical arrow keeps its label readable.
            lx = (x1 + x2) / 2 + 6;
            ly = my;
          }
          return (
            <g key={`a${i}`} className={`lanes-arrow role-${a.role}`}>
              <path d={d} markerEnd={`url(#lanes-tip-${uid}-${a.role})`} />
              {a.label && (
                <text x={lx} y={ly} style={{ textAnchor: from.lane === to.lane ? 'middle' : 'start' }}>
                  {a.label}
                </text>
              )}
            </g>
          );
        })}
        {markers.map((m, i) => {
          const box = boxes[m.lane];
          return (
            <text key={`m${i}`} className={`lanes-marker role-${m.role ?? 'idle'}`} x={x(m.col) + cw / 2} y={box.cellsTop + CELL_H + MARK_H / 2 + 2 + m.k * MARK_H}>
              {m.text}
            </text>
          );
        })}
        <defs>
          {(['idle', 'compare', 'active', 'done', 'good', 'bad', 'muted'] as Role[]).map((role) => (
            <marker key={role} id={`lanes-tip-${uid}-${role}`} className={`role-${role}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" style={{ fill: role === 'idle' || role === 'muted' ? 'var(--axis)' : 'var(--role)' }} />
            </marker>
          ))}
        </defs>
      </svg>
      <StableStrips strips={state.strips} sizer={state.stripsSizer} />
    </div>
  );
}
