import type { Frame, Role } from '../core/types';
import '../ui/roles.css';
import './MemoryView.css';

/** One stack frame: a call that has started and not yet returned. */
export interface MemFrameView {
  id: string;
  label: string;
  /** Depth - 1: the first call is row 0, deeper calls lower. */
  row: number;
  role?: Role;
  /** "returns 5", shown while the frame returns. */
  note?: string;
  /** Its scalar locals: "total = 15, i = 5". */
  locals?: string;
}

export interface MemCellView {
  /** Stable identity: a value that moves (a swap) glides. */
  key: string;
  value: string;
  role?: Role;
}

/** A Python list a live frame can reach, drawn in the row of the frame that owns it. */
export interface MemListView {
  id: string;
  name: string;
  row: number;
  /** First column, in cells. */
  col: number;
  cells: MemCellView[];
  /** Room to reserve, in cells (a list that grows keeps its place). */
  slots?: number;
  /** The input: dashed and not counted. */
  input?: boolean;
  role?: Role;
}

/** A named index under a cell: "left", "right". */
export interface MemMarkerView {
  name: string;
  row: number;
  col: number;
  role?: Role;
}

/** One call of a recursion, placed in its call tree: x counts leaves, depth matches the stack rows. */
export interface MemTreeNodeView {
  id: string;
  parent?: string;
  label: string;
  x: number;
  depth: number;
  /** undefined: not called yet (faint); active / compare: on the stack; done: returned. */
  role?: Role;
}

export interface MemTreeView {
  nodes: MemTreeNodeView[];
  leaves: number;
}

export interface MemoryState {
  title: string;
  stackLabel: string;
  frames: MemFrameView[];
  lists: MemListView[];
  markers?: MemMarkerView[];
  /** Units alive (frames + counted cells) after every step so far. */
  timeline: number[];
  /** The highest point of the timeline so far. */
  peak: { units: number; step: number; frames: number; cells: number };
  now: { frames: number; cells: number };
  /** The call tree of a recursion, beside the stack (rows line up with the frames). */
  tree?: MemTreeView;
  /** Set by stabilizeMemory: the size the whole run needs. */
  extent?: MemoryExtent;
}

export interface MemoryExtent {
  rows: number;
  cols: number;
  steps: number;
  maxUnits: number;
  lists: boolean;
  /** Some frame names an index under a cell ("left", "right"): the timeline moves down to make room. */
  markers: boolean;
  leaves: number;
}

const STACK_W = 128;
const GAP = 14;
const STEP = 22;
const CELL_W = 20;
const CELL_H = 20;
const HEAD = 26;
const TL_H = 54;
const PAD = 8;

function extentOf(s: MemoryState): MemoryExtent {
  const rows = Math.max(1, ...s.frames.map((f) => f.row + 1), ...s.lists.map((l) => l.row + 1), ...(s.tree?.nodes ?? []).map((t) => t.depth + 1));
  const cols = Math.max(1, ...s.lists.map((l) => l.col + Math.max(l.cells.length, l.slots ?? 0)));
  return { rows, cols, steps: Math.max(1, s.timeline.length), maxUnits: Math.max(1, ...s.timeline), lists: s.lists.length > 0, markers: (s.markers?.length ?? 0) > 0, leaves: s.tree?.leaves ?? 0 };
}

/** Give every frame the size of the whole run, so the picture and the timeline keep their scale. Call it from trace(). */
export function stabilizeMemory<S extends MemoryState>(frames: Array<Frame<S>>): Array<Frame<S>> {
  const e: MemoryExtent = { rows: 1, cols: 1, steps: 1, maxUnits: 1, lists: false, markers: false, leaves: 0 };
  for (const f of frames) {
    const x = extentOf(f.state);
    e.rows = Math.max(e.rows, x.rows);
    e.cols = Math.max(e.cols, x.cols);
    e.steps = Math.max(e.steps, x.steps);
    e.maxUnits = Math.max(e.maxUnits, x.maxUnits);
    e.lists = e.lists || x.lists;
    e.markers = e.markers || x.markers;
    e.leaves = Math.max(e.leaves, x.leaves);
  }
  return frames.map((f) => ({ ...f, state: { ...f.state, extent: e } }));
}

const plural = (k: number, word: string) => `${k} ${word}${k === 1 ? '' : 's'}`;

/**
 * Organism for space complexity: the call stack as a column of frames (the first call on top),
 * each list that a live frame reaches as a row of cells beside the frame that owns it (the
 * input dashed, as it is not counted), index markers under the cells, and a timeline of the
 * units alive after every step with the peak so far drawn across it.
 */
export function MemoryView({ state }: { state: MemoryState }) {
  const e = state.extent ?? extentOf(state);
  const rowH = e.lists ? 46 : 30;
  const listX = STACK_W + GAP;
  const treeX = listX + 10;
  const spacing = e.leaves <= 16 ? 26 : Math.max(6, Math.min(26, 540 / e.leaves));
  const width = Math.max(listX + e.cols * STEP + PAD, e.leaves ? treeX + e.leaves * spacing + PAD : 0, 470);
  const tlTop = HEAD + e.rows * rowH + 22 + (e.markers ? 12 : 0);
  const height = tlTop + TL_H + 26;
  const rowY = (row: number) => HEAD + row * rowH;
  const frameH = rowH - 8;
  const tlW = width - 2 * PAD - 44;
  const tlX = PAD + 44;
  const barW = tlW / e.steps;
  const ty = (u: number) => tlTop + TL_H - (u / e.maxUnits) * TL_H;
  const cur = state.timeline.length - 1;
  const total = state.now.frames + state.now.cells;
  const peakY = ty(state.peak.units);
  const nodeR = Math.min(9, spacing * 0.42);
  const tree = state.tree;
  const at = new Map((tree?.nodes ?? []).map((t) => [t.id, { x: treeX + (t.x + 0.5) * spacing, y: rowY(t.depth) + 2 + frameH / 2 }]));

  return (
    <div className="mem-wrap">
      <svg
        className="mem-view"
        viewBox={`0 0 ${width} ${height}`}
        style={{ width, maxWidth: '100%', minWidth: Math.min(width, 460) }}
        role="img"
        aria-label={`${state.title}: ${plural(state.now.frames, 'frame')} and ${plural(state.now.cells, 'list cell')} alive, peak ${state.peak.units} units.`}
      >
        <text className="mem-head" x={PAD} y={10}>
          {state.stackLabel}
        </text>
        <text className="mem-now" x={width - PAD} y={10}>
          now {plural(state.now.frames, 'frame')} + {plural(state.now.cells, 'cell')} = {total}
        </text>
        {tree && (
          <g className="mem-tree">
            {tree.nodes.map((t) => {
              const p = t.parent ? at.get(t.parent) : undefined;
              const c = at.get(t.id)!;
              return p ? <line key={`e${t.id}`} className={`mem-edge role-${t.role ?? 'idle'}${t.role ? '' : ' pending'}`} x1={p.x} y1={p.y} x2={c.x} y2={c.y} /> : null;
            })}
            {tree.nodes.map((t) => {
              const c = at.get(t.id)!;
              return (
                <g key={t.id} className={`mem-node role-${t.role ?? 'idle'}${t.role ? '' : ' pending'}`}>
                  <circle cx={c.x} cy={c.y} r={nodeR} />
                  {nodeR >= 7 && (
                    <text x={c.x} y={c.y}>
                      {t.label}
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        )}
        {state.frames.map((f) => (
          <g key={f.id} className={`mem-frame role-${f.role ?? 'idle'}`} style={{ transform: `translate(${PAD}px, ${rowY(f.row) + 2}px)` }}>
            <rect width={STACK_W - PAD} height={frameH} rx={6} />
            <text className="mem-frame-label" x={8} y={e.lists ? 11 : frameH / 2}>
              {f.label}
              {!e.lists && (f.note || f.locals) ? <tspan className="mem-frame-note">{`  ${f.note ?? f.locals}`}</tspan> : null}
            </text>
            {e.lists && (f.note || f.locals) && (
              <text className="mem-frame-note" x={8} y={frameH - 9}>
                {f.note ?? f.locals}
              </text>
            )}
          </g>
        ))}
        {state.lists.map((l) => (
          <g key={l.id} className={`mem-list role-${l.role ?? 'idle'}${l.input ? ' input' : ''}`} style={{ transform: `translate(${listX + l.col * STEP}px, ${rowY(l.row)}px)` }}>
            <text className="mem-list-name" x={0} y={7}>
              {l.name}
              {l.input ? '' : ` (${l.cells.length})`}
            </text>
            {l.cells.length === 0 && <rect className="mem-empty" x={0} y={14} width={CELL_W} height={CELL_H} rx={4} />}
            {/* Stable DOM order (by key), so a value that changes place is the same element and glides. */}
            {l.cells
              .map((c, k) => ({ c, k }))
              .sort((a, b) => (a.c.key < b.c.key ? -1 : a.c.key > b.c.key ? 1 : 0))
              .map(({ c, k }) => (
              <g key={c.key} className={`mem-cell role-${c.role ?? 'idle'}`} style={{ transform: `translate(${k * STEP}px, 14px)` }}>
                <rect width={CELL_W} height={CELL_H} rx={4} />
                <text x={CELL_W / 2} y={CELL_H / 2}>
                  {c.value}
                </text>
              </g>
            ))}
          </g>
        ))}
        {(state.markers ?? []).map((m) => (
          <g key={m.name} className={`mem-marker role-${m.role ?? 'idle'}`} style={{ transform: `translate(${listX + m.col * STEP + CELL_W / 2}px, ${rowY(m.row) + 14 + CELL_H + 2}px)` }}>
            <path d="M0,0 l-4,6 h8 z" />
            <text x={0} y={13}>
              {m.name}
            </text>
          </g>
        ))}
        <text className="mem-tl-label" x={PAD} y={tlTop - 10}>
          units alive after each step
        </text>
        <line className="mem-tl-axis" x1={tlX} x2={tlX + tlW} y1={tlTop + TL_H} y2={tlTop + TL_H} />
        <text className="mem-tl-tick" x={tlX - 6} y={tlTop + TL_H}>
          0
        </text>
        <text className="mem-tl-tick" x={tlX - 6} y={tlTop}>
          {e.maxUnits}
        </text>
        {state.timeline.map((u, k) => (
          <rect key={k} className={`mem-bar${k === cur ? ' current' : ''}`} x={tlX + k * barW} y={ty(u)} width={Math.max(barW - (barW > 3 ? 1 : 0), 0.6)} height={tlTop + TL_H - ty(u)} />
        ))}
        <g className="mem-peak">
          <line x1={tlX} x2={tlX + tlW} y1={peakY} y2={peakY} />
          <circle cx={tlX + (state.peak.step + 0.5) * barW} cy={peakY} r={3.5} />
          <text x={tlX + tlW} y={peakY - 8}>
            peak {state.peak.units} = {plural(state.peak.frames, 'frame')} + {plural(state.peak.cells, 'cell')}
          </text>
        </g>
        <text className="mem-tl-tick" x={tlX + tlW / 2} y={tlTop + TL_H + 14} style={{ textAnchor: 'middle' }}>
          step {cur + 1} of {e.steps}
        </text>
      </svg>
    </div>
  );
}
