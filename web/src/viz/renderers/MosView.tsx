import type { Role } from '../core/types';
import { useTween, type Pt } from '../ui/hooks/useTween';
import { Strips, type StripData } from '../ui/molecules/Strip';
import { SYM } from '../ui/symbols';
import '../ui/roles.css';
import './MosView.css';

/** One offline query [l, r], drawn as a bar under the array columns it covers. */
export interface MoQueryView {
  /** Its index in the input: the stable key, so the bar glides to its new lane when the queries are sorted. */
  id: number;
  l: number;
  r: number;
  /** Row, top to bottom. */
  lane: number;
  role?: Role;
  /** Text right of the row: the sort key, later the answer. */
  tag?: string;
}

export interface MosViewState {
  /** What the picture shows, for screen readers. */
  label: string;
  cells: Array<{ value: number; role?: Role }>;
  /** Brackets over the array, one per block of block_size indices. */
  blockSize: number;
  /** current_l and current_r (the window is empty while r < l); left out before the window exists. */
  window?: { l: number; r: number };
  queries: MoQueryView[];
  note?: string;
  strips?: StripData[];
}

const CW = 32;
const LEFT = 66;
const RIGHT = 92;
const CELL_TOP = 30;
const CH = 28;
const INDEX_Y = CELL_TOP + CH + 10;
const PILL_Y = INDEX_Y + 17;
const LANES_TOP = PILL_Y + 16;
const LANE = 22;
const BAR_H = 12;
const PILL_H = 15;

export function mosGeometry(state: Pick<MosViewState, 'cells' | 'queries'>) {
  const n = state.cells.length;
  const lanes = Math.max(1, ...state.queries.map((q) => q.lane + 1));
  return {
    width: LEFT + Math.max(1, n) * CW + RIGHT,
    height: LANES_TOP + lanes * LANE + 8,
    x: (col: number) => LEFT + col * CW,
  };
}

/**
 * Organism for Mo's algorithm: the array with its blocks, the window [L, R] as a band that
 * slides one element at a time (with L and R pointers that glide), and the queries as bars on
 * the same columns, one lane each, which glide into their sorted order.
 */
export function MosView({ state }: { state: MosViewState }) {
  const { cells, blockSize, window: win, queries, note, strips } = state;
  const n = cells.length;
  const g = mosGeometry(state);
  const target = new Map<string, Pt>();
  const empty = win !== undefined && win.r < win.l;
  if (win) {
    const same = win.l === win.r;
    target.set('band', { x: g.x(win.l), y: g.x(Math.max(win.l, win.r + 1)) });
    target.set('L', { x: g.x(win.l) + CW / 2 - (same ? 9 : 0), y: PILL_Y });
    target.set('R', { x: g.x(win.r) + CW / 2 + (same ? 9 : 0), y: PILL_Y });
  }
  for (const q of queries) target.set(`q${q.id}`, { x: 0, y: LANES_TOP + q.lane * LANE });
  const pos = useTween(target);
  const at = (key: string): Pt => pos.get(key) ?? target.get(key)!;
  const band = win ? at('band') : null;
  const blocks = Math.ceil(n / Math.max(1, blockSize));
  const short = blockSize * CW < 64;

  return (
    <div className="mo-wrap">
      <svg className="mo-view" viewBox={`0 0 ${g.width} ${g.height}`} style={{ width: g.width, maxWidth: '100%', minWidth: Math.min(g.width, 560) }} role="img" aria-label={state.label}>
        {band && (
          <g className="mo-band">
            <rect className="mo-band-cells" x={band.x} y={CELL_TOP - 4} width={Math.max(0, band.y - band.x)} height={CH + 8} rx={6} />
            {queries.length > 0 && <rect className="mo-band-lanes" x={band.x} y={LANES_TOP - 3} width={Math.max(0, band.y - band.x)} height={g.height - LANES_TOP - 3} rx={4} />}
          </g>
        )}
        {Array.from({ length: blocks }, (_, b) => {
          const x1 = g.x(b * blockSize) + 3;
          const x2 = g.x(Math.min(n, (b + 1) * blockSize)) - 3;
          return (
            <g key={`blk${b}`} className="mo-block">
              <path d={`M${x1},${CELL_TOP - 8}v-5H${x2}v5`} />
              <text x={(x1 + x2) / 2} y={CELL_TOP - 19}>
                {short ? `b${b}` : `block ${b}`}
              </text>
            </g>
          );
        })}
        <text className="mo-rowlabel" x={LEFT - 8} y={CELL_TOP + CH / 2}>
          arr
        </text>
        {cells.map((c, i) => (
          <g key={i} className={`mo-cell role-${c.role ?? 'idle'}`}>
            <rect x={g.x(i) + 2} y={CELL_TOP} width={CW - 4} height={CH} rx={5} />
            <text x={g.x(i) + CW / 2} y={CELL_TOP + CH / 2}>
              {c.value}
            </text>
            <text className="mo-index" x={g.x(i) + CW / 2} y={INDEX_Y}>
              {i}
            </text>
          </g>
        ))}
        {(win ? (['L', 'R'] as const) : []).map((name) => {
          const p = at(name);
          return (
            <g key={name} className={`mo-pill${empty ? ' empty' : ''}`}>
              <rect x={p.x - 9} y={p.y - PILL_H / 2} width={18} height={PILL_H} rx={PILL_H / 2} />
              <text x={p.x} y={p.y}>
                {name}
              </text>
            </g>
          );
        })}
        {[...queries]
          .sort((a, b) => a.id - b.id)
          .map((q) => {
            const y = at(`q${q.id}`).y;
            const role = q.role ?? 'idle';
            const glyph = role === 'good' ? SYM.check : role === 'bad' ? SYM.cross : null;
            return (
              <g key={`q${q.id}`} className={`mo-lane role-${role}`} style={{ transform: `translateY(${y.toFixed(1)}px)` }}>
                <text className="mo-qlabel" x={LEFT - 8} y={LANE / 2}>
                  {`q${q.id}`}
                </text>
                <rect className="mo-bar" x={g.x(q.l) + 2} y={(LANE - BAR_H) / 2} width={(q.r - q.l + 1) * CW - 4} height={BAR_H} rx={4} />
                <text className="mo-tag" x={g.x(n) + 8} y={LANE / 2}>
                  {q.tag ?? `[${q.l}, ${q.r}]`}
                  {glyph ? ` ${glyph}` : ''}
                </text>
              </g>
            );
          })}
      </svg>
      {note && <p className="mo-note">{note}</p>}
      <Strips strips={strips} />
    </div>
  );
}
