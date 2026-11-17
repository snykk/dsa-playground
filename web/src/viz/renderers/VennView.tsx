import { useId, type ReactElement } from 'react';
import type { Frame, Role } from '../core/types';
import type { StripData } from '../ui/molecules/Strip';
import '../ui/roles.css';
import { SYM } from '../ui/symbols';
import './VennView.css';
import { StableStrips, stripsSizer } from './patternStrips';

export interface VennSetView {
  label: string;
  sub?: string;
}

/** One region of the diagram: the elements in exactly the sets of `mask`. */
export interface VennAtomView {
  mask: number;
  /** Large text (how many elements the region holds); empty when elements are drawn instead. */
  main: string;
  /** Small text under it (how often those elements are counted so far). */
  sub?: string;
  /** good: counted exactly once, bad: counted too often; both add a check / cross. */
  role?: Role;
}

/** One element drawn as a dot inside its region (the explicit-sets mode). */
export interface VennElementView {
  id: string;
  mask: number;
  label: string;
  /** How many times the element is counted so far. */
  count: number;
  role?: Role;
}

export interface VennTableRow {
  cells: string[];
  role?: Role;
}

export interface VennState {
  /** What the picture shows, for screen readers. */
  label: string;
  sets: VennSetView[];
  /** The intersection of these sets is filled: the term being built or applied. */
  focus?: { mask: number; role: Role; sign?: '+' | '-' };
  atoms: VennAtomView[];
  elements?: VennElementView[];
  /** Text in the corner of the box around the sets. */
  universe?: string;
  /** Text for what lies in no set, shown in the box. */
  outside?: string;
  columns: string[];
  rows: VennTableRow[];
  /** Table rows the picture reserves (2^k - 1); set by stabilizeVenn. */
  rowSlots?: number;
  /** The rows of the finished table: an empty slot reserves their width, so the table never grows. */
  finalRows?: VennTableRow[];
  stripsSizer?: StripData[];
  total: { label: string; value: string; role?: Role };
  strips?: StripData[];
}

/** Every frame of a run reserves one table row per term, so the picture does not grow. */
export function stabilizeVenn<S extends VennState>(frames: Array<Frame<S>>): Array<Frame<S>> {
  const finalRows = frames.reduce<VennTableRow[]>((best, f) => (f.state.rows.length > best.length ? f.state.rows : best), []);
  const sizer = stripsSizer(frames.map((f) => f.state.strips));
  return frames.map((f) => ({ ...f, state: { ...f.state, rowSlots: 2 ** f.state.sets.length - 1, finalRows, stripsSizer: sizer } }));
}

const W = 340;
const H = 300;

interface Circle {
  cx: number;
  cy: number;
  r: number;
  /** Where the set's name goes. */
  lx: number;
  ly: number;
  anchor: 'start' | 'middle' | 'end';
}

const CIRCLES: Record<number, Circle[]> = {
  1: [{ cx: 170, cy: 166, r: 96, lx: 170, ly: 56, anchor: 'middle' }],
  2: [
    { cx: 126, cy: 166, r: 88, lx: 70, ly: 64, anchor: 'middle' },
    { cx: 214, cy: 166, r: 88, lx: 270, ly: 64, anchor: 'middle' },
  ],
  3: [
    { cx: 128, cy: 136, r: 78, lx: 60, ly: 50, anchor: 'middle' },
    { cx: 212, cy: 136, r: 78, lx: 280, ly: 50, anchor: 'middle' },
    { cx: 170, cy: 208, r: 78, lx: 50, ly: 250, anchor: 'middle' },
  ],
};

/** Label positions inside each region (by mask), checked by hand against the circles. */
const ANCHORS: Record<number, Record<number, [number, number]>> = {
  1: { 1: [170, 166] },
  2: { 1: [86, 166], 2: [254, 166], 3: [170, 166] },
  3: { 1: [96, 116], 2: [244, 116], 3: [170, 104], 4: [170, 250], 5: [123, 192], 6: [217, 192], 7: [170, 160] },
};

const inside = (c: Circle, x: number, y: number, margin = 0) => Math.hypot(x - c.cx, y - c.cy) <= c.r - margin;

/** Dot positions inside a region: grid points nearest its anchor, clear of every circle's edge. */
function slots(k: number, mask: number): Array<[number, number]> {
  const circles = CIRCLES[k];
  const [ax, ay] = ANCHORS[k][mask];
  const out: Array<[number, number, number]> = [];
  for (let dx = -60; dx <= 60; dx += 24) {
    for (let dy = -60; dy <= 60; dy += 22) {
      const x = ax + dx + (Math.abs(dy / 22) % 2 ? 12 : 0);
      const y = ay + dy;
      const ok = circles.every((c, j) => (mask & (1 << j) ? inside(c, x, y, 11) : !inside(c, x, y, -11)));
      if (ok && x > 14 && x < W - 14 && y > 34 && y < H - 12) out.push([x, y, Math.hypot(x - ax, y - ay)]);
    }
  }
  return out.sort((a, b) => a[2] - b[2]).map(([x, y]) => [x, y]);
}

const SLOTS: Record<number, Record<number, Array<[number, number]>>> = Object.fromEntries(
  [1, 2, 3].map((k) => [k, Object.fromEntries(Array.from({ length: 2 ** k - 1 }, (_, i) => [i + 1, slots(k, i + 1)]))]),
);

/**
 * Organism for inclusion-exclusion: a Venn diagram of one to three sets beside the table of
 * terms. The current term's intersection is filled (one set at a time while it is built), every
 * region shows its size and how often it is counted so far, or its elements as dots, and the
 * running total sits under the table.
 */
export function VennView({ state }: { state: VennState }) {
  const uid = useId().replace(/:/g, '');
  const k = state.sets.length;
  const circles = CIRCLES[k] ?? [];
  const focusSets = state.focus ? circles.filter((_, j) => state.focus!.mask & (1 << j)) : [];
  const slotRows = state.rowSlots ?? Math.max(1, state.rows.length);
  const byMask = new Map<number, VennElementView[]>();
  for (const e of state.elements ?? []) byMask.set(e.mask, [...(byMask.get(e.mask) ?? []), e]);

  // The filled intersection: a full rectangle clipped by every circle of the focus, nested.
  const fill = focusSets.reduceRight<ReactElement>(
    (inner, _c, idx) => <g clipPath={`url(#venn-${uid}-${circles.indexOf(focusSets[idx])})`}>{inner}</g>,
    <rect className={`venn-fill role-${state.focus?.role ?? 'idle'}`} x={0} y={0} width={W} height={H} />,
  );

  return (
    <div className="venn-wrap">
      <div className="venn-panels">
        <svg className="venn" viewBox={`0 0 ${W} ${H}`} style={{ width: 310, maxWidth: '100%' }} role="img" aria-label={state.label}>
          <defs>
            {circles.map((c, j) => (
              <clipPath key={j} id={`venn-${uid}-${j}`}>
                <circle cx={c.cx} cy={c.cy} r={c.r} />
              </clipPath>
            ))}
          </defs>
          <rect className="venn-universe" x={6} y={22} width={W - 12} height={H - 28} rx={10} />
          {state.universe && (
            <text className="venn-universe-label" x={14} y={34}>
              {state.universe}
            </text>
          )}
          {state.outside && (
            <text className="venn-universe-label" x={W - 14} y={H - 14} style={{ textAnchor: 'end' }}>
              {state.outside}
            </text>
          )}
          {state.focus && focusSets.length > 0 && fill}
          {circles.map((c, j) => (
            <g key={`c${j}`} className={`venn-set role-${state.focus && state.focus.mask & (1 << j) ? state.focus.role : 'idle'}`}>
              <circle cx={c.cx} cy={c.cy} r={c.r} />
              <text className="venn-set-label" x={c.lx} y={c.ly} style={{ textAnchor: c.anchor }}>
                {state.sets[j].label}
              </text>
              {state.sets[j].sub && (
                <text className="venn-set-sub" x={c.lx} y={c.ly + 14} style={{ textAnchor: c.anchor }}>
                  {state.sets[j].sub}
                </text>
              )}
            </g>
          ))}
          {state.focus?.sign && focusSets.length > 0 && (
            <text className={`venn-sign role-${state.focus.role}`} x={W - 22} y={42}>
              {state.focus.sign === '+' ? '+' : String.fromCodePoint(0x2212)}
            </text>
          )}
          {state.atoms.map((a) => {
            const at = ANCHORS[k]?.[a.mask];
            if (!at || (!a.main && !a.sub)) return null;
            const glyph = a.role === 'good' ? SYM.check : a.role === 'bad' ? SYM.cross : '';
            return (
              <g key={`a${a.mask}`} className={`venn-atom role-${a.role ?? 'idle'}`}>
                <text className="venn-atom-main" x={at[0]} y={at[1] - 6}>
                  {a.main}
                </text>
                {a.sub && (
                  <text className="venn-atom-sub" x={at[0]} y={at[1] + 9}>
                    {a.sub}
                    {glyph && ` ${glyph}`}
                  </text>
                )}
              </g>
            );
          })}
          {[...byMask].flatMap(([mask, els]) => {
            const spots = SLOTS[k]?.[mask] ?? [];
            const shown = els.slice(0, spots.length);
            const extra = els.length - shown.length;
            return [
              ...shown.map((e, i) => {
                const [x, y] = spots[i];
                const glyph = e.role === 'good' ? SYM.check : e.role === 'bad' ? SYM.cross : '';
                return (
                  <g key={e.id} className={`venn-dot role-${e.role ?? 'idle'}`}>
                    <circle cx={x} cy={y} r={10} />
                    <text x={x} y={y + 0.5}>
                      {e.label}
                    </text>
                    {/* Counted once: a check; counted too often: the count and a cross; not yet: nothing. */}
                    {e.count >= 1 && (
                      <text className="venn-dot-count" x={x + 11} y={y - 9}>
                        {e.count === 1 ? glyph || SYM.check : `${e.count}x${glyph ? ` ${glyph}` : ''}`}
                      </text>
                    )}
                  </g>
                );
              }),
              extra > 0 ? (
                <text key={`more${mask}`} className="venn-more" x={spots.at(-1)?.[0] ?? 0} y={(spots.at(-1)?.[1] ?? 0) + 18}>
                  {`+${extra} more`}
                </text>
              ) : null,
            ];
          })}
        </svg>
        <div className="venn-side">
          <table className="venn-table">
            <thead>
              <tr>
                {state.columns.map((c) => (
                  <th key={c} scope="col">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: slotRows }, (_, i) => {
                const row = state.rows[i];
                return (
                  <tr key={i} className={row?.role ? `role-${row.role}` : undefined}>
                    {state.columns.map((_, c) =>
                      row ? (
                        <td key={c}>{row.cells[c]}</td>
                      ) : (
                        // An empty slot: a dot over the invisible final text, which holds the column width.
                        <td key={c} className="venn-slot">
                          <span className="venn-slot-sizer" aria-hidden="true">
                            {state.finalRows?.[i]?.cells[c] ?? ''}
                          </span>
                          <span className="venn-slot-dot">{SYM.middot}</span>
                        </td>
                      ),
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className={`venn-total role-${state.total.role ?? 'idle'}`}>
            {state.total.label} = <strong>{state.total.value}</strong>
          </p>
        </div>
      </div>
      <StableStrips strips={state.strips} sizer={state.stripsSizer} />
    </div>
  );
}
