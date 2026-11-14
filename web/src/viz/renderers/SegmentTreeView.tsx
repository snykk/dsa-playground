import type { Role } from '../core/types';
import { useTween, type Pt } from '../ui/hooks/useTween';
import { Strips, type StripData } from '../ui/molecules/Strip';
import { SYM } from '../ui/symbols';
import '../ui/roles.css';
import './SegmentTreeView.css';

/** One node of the tree, drawn as a block over the array positions (columns) it covers. */
export interface SegBlock {
  /** Stable identity, e.g. "n5" for tree[5]. */
  id: string;
  /** First and last column covered, inclusive. */
  lo: number;
  hi: number;
  /** Row of the picture, 0 at the top. */
  row: number;
  value: string | number;
  /** Small text over the block: the node's position in the tree array. */
  badge?: string;
  /** A pending lazy tag, drawn as a pill inside the block ("+3"). */
  tag?: string;
  role?: Role;
  /** A padding leaf (not an element): dashed outline. */
  pad?: boolean;
  title?: string;
}

/** A named pointer ("l", "r", "i") pinned under a span of a row; it glides when it moves. */
export interface SegMarker {
  name: string;
  row: number;
  lo: number;
  hi: number;
  role?: Role;
}

/** A tag pill in flight, drawn where the block over (row, lo..hi) keeps its tag (a push-down). */
export interface SegFlyer {
  id: string;
  text: string;
  row: number;
  lo: number;
  hi: number;
  role?: Role;
}

export interface SegColumn {
  text: string;
  /** Second line, e.g. the index in binary; a strong part is emphasized (the lowest set bit). */
  bits?: Array<{ text: string; strong?: boolean }>;
}

/** A row of plain cells under the columns, e.g. the array the tree summarizes. */
export interface SegValueRow {
  label: string;
  cells: Array<{ value: string | number; role?: Role }>;
}

export interface SegmentTreeState {
  /** What the picture shows, for screen readers. */
  label: string;
  columns: number;
  rows: number;
  /** Text left of each row, e.g. "covers 4". */
  rowLabels?: string[];
  blocks: SegBlock[];
  /** Label left of the column numbers, e.g. "index". */
  colTitle?: string;
  colLabels?: SegColumn[];
  valueRows?: SegValueRow[];
  /** A shaded span of columns behind every row: the query range. Columns outside 0..columns-1 are clipped. */
  band?: { lo: number; hi: number; label: string; role?: Role };
  markers?: SegMarker[];
  flyers?: SegFlyer[];
  /** Reserve room in every block for a tag pill (a lazy tree). */
  tags?: boolean;
  note?: string;
  strips?: StripData[];
}

const CW = 40;
const INSET = 2;
const LEFT = 66;
const RIGHT = 30;
const TOP = 24;
const BADGE = 13;
const GAP = 9;
const PILL_H = 14;
const CELL_H = 24;

/** Pixel geometry of a picture: rows of blocks, the column labels and the value rows under them. */
export function segGeometry(state: Pick<SegmentTreeState, 'columns' | 'rows' | 'tags' | 'colLabels' | 'valueRows'>) {
  const bh = state.tags ? 40 : 30;
  const rh = BADGE + bh + GAP;
  const treeBottom = TOP + state.rows * rh;
  const labelsTop = treeBottom + 4;
  const bitsTop = labelsTop + 14;
  const hasBits = state.colLabels?.some((c) => c.bits) ?? false;
  const valuesTop = (hasBits ? bitsTop + 13 : bitsTop) + 4;
  const valueRows = state.valueRows?.length ?? 0;
  return {
    bh,
    width: LEFT + Math.max(state.columns, 1) * CW + RIGHT,
    height: valuesTop + valueRows * (CELL_H + 4) + 4,
    treeBottom,
    labelsTop,
    bitsTop,
    valuesTop,
    x: (col: number) => LEFT + col * CW,
    rowTop: (row: number) => TOP + row * rh + BADGE,
  };
}

function pillWidth(text: string): number {
  return Math.max(16, text.length * 6.4 + 8);
}

/**
 * Organism: a tree whose nodes cover ranges of an array (a segment tree, a Fenwick tree).
 * Each node is a block spanning the columns it covers, one row per level; the query range is
 * a band behind every row, named pointers sit under the blocks they point at and glide when
 * they move, and lazy tags travel as pills from a node to its children.
 */
export function SegmentTreeView({ state }: { state: SegmentTreeState }) {
  const { blocks, markers = [], flyers = [], colLabels = [], valueRows = [], rowLabels = [], band, note, strips } = state;
  const g = segGeometry(state);

  const target = new Map<string, Pt>();
  const anchors = new Map<string, number>();
  for (const m of markers) anchors.set(`${m.row}:${m.lo}:${m.hi}`, (anchors.get(`${m.row}:${m.lo}:${m.hi}`) ?? 0) + 1);
  const seen = new Map<string, number>();
  for (const m of markers) {
    const key = `${m.row}:${m.lo}:${m.hi}`;
    const k = seen.get(key) ?? 0;
    seen.set(key, k + 1);
    const count = anchors.get(key)!;
    // A pointer that stepped past either end of its level waits just outside the row.
    const mid = Math.min(Math.max((g.x(m.lo) + g.x(m.hi + 1)) / 2, g.x(0) - 18), g.x(state.columns) + 18);
    target.set(`m:${m.name}`, { x: mid + (k - (count - 1) / 2) * 24, y: g.rowTop(m.row) + g.bh });
  }
  const tagSpot = (row: number, lo: number, hi: number): Pt => ({ x: (g.x(lo) + g.x(hi + 1)) / 2, y: g.rowTop(row) + g.bh - PILL_H / 2 - 4 });
  for (const f of flyers) target.set(`f:${f.id}`, tagSpot(f.row, f.lo, f.hi));
  const clipLo = band ? Math.max(0, Math.min(band.lo, state.columns)) : 0;
  const clipHi = band ? Math.min(state.columns, Math.max(band.hi + 1, 0)) : 0;
  if (band) target.set('band', { x: g.x(clipLo), y: g.x(clipHi) });
  const pos = useTween(target);
  const at = (key: string): Pt => pos.get(key) ?? target.get(key)!;

  return (
    <div className="seg-wrap">
      <svg
        className="seg-view"
        viewBox={`0 0 ${g.width} ${g.height}`}
        style={{ width: g.width, maxWidth: '100%', minWidth: Math.min(g.width, 600) }}
        role="img"
        aria-label={state.label}
      >
        {band &&
          (() => {
            const b = at('band');
            const w = Math.max(0, b.y - b.x);
            return (
              <g className={`seg-band role-${band.role ?? 'compare'}`}>
                {w > 0 && <rect x={b.x} y={TOP - 4} width={w} height={g.treeBottom - TOP + 4} rx={6} />}
                <text x={w > 0 ? b.x + w / 2 : LEFT + (state.columns * CW) / 2} y={TOP - 11}>
                  {band.label}
                </text>
              </g>
            );
          })()}
        {rowLabels.map((text, r) => (
          <text key={`rl${r}`} className="seg-rowlabel" x={LEFT - 8} y={g.rowTop(r) + g.bh / 2}>
            {text}
          </text>
        ))}
        {blocks.map((b) => {
          const x = g.x(b.lo) + INSET;
          const y = g.rowTop(b.row);
          const w = (b.hi - b.lo + 1) * CW - 2 * INSET;
          const role = b.role ?? 'idle';
          const glyph = role === 'good' ? SYM.check : role === 'bad' ? SYM.cross : null;
          const tagged = state.tags && b.tag !== undefined;
          return (
            <g key={b.id} className={`seg-block role-${role}${b.pad ? ' pad' : ''}`}>
              {b.title && <title>{b.title}</title>}
              <rect x={x} y={y} width={w} height={g.bh} rx={6} />
              <text className="seg-value" x={x + w / 2} y={tagged ? y + 13 : y + g.bh / 2}>
                {b.value}
              </text>
              {b.badge !== undefined && (
                <text className="seg-badge" x={x + 2} y={y - 6}>
                  {b.badge}
                </text>
              )}
              {glyph && (
                <text className="seg-glyph" x={x + w - 2} y={y - 6}>
                  {glyph}
                </text>
              )}
            </g>
          );
        })}
        {blocks
          .filter((b) => state.tags && b.tag !== undefined)
          .map((b) => {
            const p = tagSpot(b.row, b.lo, b.hi);
            const w = pillWidth(b.tag!);
            return (
              <g key={`tag:${b.id}`} className="seg-pill tag">
                <rect x={p.x - w / 2} y={p.y - PILL_H / 2} width={w} height={PILL_H} rx={PILL_H / 2} />
                <text x={p.x} y={p.y}>
                  {b.tag}
                </text>
              </g>
            );
          })}
        {flyers.map((f) => {
          const p = at(`f:${f.id}`);
          const w = pillWidth(f.text);
          return (
            <g key={`f:${f.id}`} className={`seg-pill fly role-${f.role ?? 'active'}`}>
              <rect x={p.x - w / 2} y={p.y - PILL_H / 2} width={w} height={PILL_H} rx={PILL_H / 2} />
              <text x={p.x} y={p.y}>
                {f.text}
              </text>
            </g>
          );
        })}
        {markers.map((m) => {
          const p = at(`m:${m.name}`);
          const w = pillWidth(m.name);
          return (
            <g key={`m:${m.name}`} className={`seg-pill marker role-${m.role ?? 'active'}`}>
              <rect x={p.x - w / 2} y={p.y - PILL_H / 2} width={w} height={PILL_H} rx={PILL_H / 2} />
              <text x={p.x} y={p.y}>
                {m.name}
              </text>
            </g>
          );
        })}
        {state.colTitle && (
          <text className="seg-rowlabel" x={LEFT - 8} y={g.labelsTop + 6}>
            {state.colTitle}
          </text>
        )}
        {colLabels.map((c, i) => (
          <g key={`c${i}`} className="seg-col">
            <text className="seg-colnum" x={g.x(i) + CW / 2} y={g.labelsTop + 6}>
              {c.text}
            </text>
            {c.bits && (
              <text className="seg-bits" x={g.x(i) + CW / 2} y={g.bitsTop + 6}>
                {c.bits.map((part, k) => (
                  <tspan key={k} className={part.strong ? 'strong' : undefined}>
                    {part.text}
                  </tspan>
                ))}
              </text>
            )}
          </g>
        ))}
        {valueRows.map((row, r) => {
          const y = g.valuesTop + r * (CELL_H + 4);
          return (
            <g key={`v${r}`}>
              <text className="seg-rowlabel" x={LEFT - 8} y={y + CELL_H / 2}>
                {row.label}
              </text>
              {row.cells.map((c, i) => (
                <g key={i} className={`seg-cell role-${c.role ?? 'idle'}`}>
                  <rect x={g.x(i) + INSET} y={y} width={CW - 2 * INSET} height={CELL_H} rx={5} />
                  <text x={g.x(i) + CW / 2} y={y + CELL_H / 2}>
                    {c.value}
                  </text>
                </g>
              ))}
            </g>
          );
        })}
      </svg>
      {note && <p className="seg-note">{note}</p>}
      <Strips strips={strips} />
    </div>
  );
}
