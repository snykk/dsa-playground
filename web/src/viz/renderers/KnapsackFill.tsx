import type { Role } from '../core/types';
import { Cell } from '../ui/atoms/Cell';
import { CellGrid, CellRow } from '../ui/molecules/CellRow';
import { Strips, type StripData } from '../ui/molecules/Strip';
import '../ui/roles.css';
import { SYM } from '../ui/symbols';
import './KnapsackFill.css';

export interface KnapsackItemView {
  /** Stable identity: the block glides when the order changes or it is packed. */
  id: number;
  label: string;
  weight: number;
  value: number;
  /** Value per unit of weight; Infinity for a weight-0 item. */
  ratio: number;
  /** Fraction of the item already in the knapsack, 0..1. */
  taken: number;
  role: Role;
}

export interface KnapsackFillState {
  capacity: number;
  /** Items left to right: input order first, then sorted by ratio. */
  items: KnapsackItemView[];
  /** Ids in packing order; the knapsack fills left to right. */
  packed: number[];
  strips?: StripData[];
}

const WIDTH = 640;
const LEFT = 78;
const RIGHT = 16;
const GAP = 8;
const BLOCK_H = 84;
const MIN_W = 5;
const MIN_H = 3;
const ROW1_TOP = 40;
const ROW1_BASE = ROW1_TOP + BLOCK_H;
const ROW2_TOP = ROW1_BASE + 34;
const ROW2_BASE = ROW2_TOP + BLOCK_H;
const HEIGHT = ROW2_BASE + 30;

/** Up to two decimals, no trailing zeros. */
export const fmtNum = (x: number) => (Number.isInteger(x) ? String(x) : String(Number(x.toFixed(2))));
export const fmtRatio = (r: number) => (r === Infinity ? SYM.infinity : fmtNum(r));

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));

/** "all", "-" or a reduced fraction such as "2/3" (taken * weight is a whole number here). */
function fmtTaken(it: KnapsackItemView): string {
  if (it.taken === 0) return '-';
  if (it.taken === 1) return 'all';
  const part = Math.round(it.taken * it.weight);
  const g = gcd(part, it.weight) || 1;
  return `${part / g}/${it.weight / g}`;
}

/**
 * Organism for the fractional knapsack: items as blocks (width = weight, height =
 * value per unit, so area = value) that glide into a capacity bar when packed; the
 * last one is cut to the fraction that fits. A cell table underneath gives the numbers.
 */
export function KnapsackFill({ state }: { state: KnapsackFillState }) {
  const { capacity, items, packed } = state;
  const zeros = items.filter((it) => it.weight === 0).length;
  const totalW = items.reduce((s, it) => s + it.weight, 0);
  const plotW = WIDTH - LEFT - RIGHT;
  const sx = (plotW - GAP * Math.max(0, items.length - 1) - MIN_W * zeros) / Math.max(totalW, capacity, 1);
  const maxRatio = Math.max(0, ...items.filter((it) => Number.isFinite(it.ratio)).map((it) => it.ratio));
  const heightOf = (it: KnapsackItemView) =>
    it.ratio === Infinity ? BLOCK_H : maxRatio > 0 ? Math.max(MIN_H, (it.ratio / maxRatio) * BLOCK_H) : MIN_H;
  const widthOf = (it: KnapsackItemView, part = 1) => (it.weight === 0 ? MIN_W : Math.max(part > 0 ? 2 : 0, it.weight * part * sx));

  const slot = new Map<number, number>();
  let cursor = LEFT;
  for (const it of items) {
    slot.set(it.id, cursor);
    cursor += widthOf(it) + GAP;
  }
  const byId = new Map(items.map((it) => [it.id, it]));
  const inBag = new Map<number, number>();
  let used = 0;
  for (const id of packed) {
    const it = byId.get(id);
    if (!it) continue;
    inBag.set(id, LEFT + used * sx);
    used += it.weight * it.taken;
  }
  const bagW = capacity * sx;
  // Stable DOM order so blocks can glide; weight-0 slivers last, so they stay visible on top.
  const drawOrder = [...items].sort((a, b) => Number(a.weight === 0) - Number(b.weight === 0) || a.id - b.id);

  return (
    <div>
      <svg className="knapsack" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={`Knapsack of capacity ${capacity} with ${items.length} items`}>
        <text className="kn-note" x={4} y={14}>
          block width = weight, height = value per unit, so area = value
        </text>
        <text className="kn-row" x={4} y={ROW1_TOP + BLOCK_H / 2}>
          items
        </text>
        <text className="kn-row" x={4} y={ROW2_TOP + BLOCK_H / 2}>
          knapsack
        </text>
        <rect className="kn-frame" x={LEFT} y={ROW2_TOP} width={bagW} height={BLOCK_H} />
        <text className="kn-tick" x={LEFT} y={ROW2_BASE + 16} textAnchor="start">
          0
        </text>
        <text className="kn-tick" x={LEFT + bagW} y={ROW2_BASE + 16} textAnchor="end">
          capacity {capacity}
        </text>
        {used > 0 && used < capacity && (
          <g className="kn-used" style={{ transform: `translateX(${LEFT + used * sx}px)` }}>
            <line x1={0} x2={0} y1={ROW2_TOP - 4} y2={ROW2_BASE + 4} />
          </g>
        )}
        {drawOrder.map((it) => {
          const h = heightOf(it);
          const full = widthOf(it);
          const takenW = widthOf(it, it.taken);
          return (
            <g key={`ghost-${it.id}`} className="kn-ghost" style={{ transform: `translate(${slot.get(it.id)}px, ${ROW1_BASE - h}px)` }}>
              <rect width={full} height={h} />
              {it.taken > 0 && it.taken < 1 && <rect className="kn-rest" x={takenW} width={Math.max(0, full - takenW)} height={h} />}
              <text className="kn-label" x={full / 2} y={-6} textAnchor="middle">
                {it.label}
              </text>
            </g>
          );
        })}
        {drawOrder.map((it) => {
          const h = heightOf(it);
          const inside = inBag.has(it.id) && it.taken > 0;
          const x = inside ? inBag.get(it.id)! : slot.get(it.id)!;
          const y = (inside ? ROW2_BASE : ROW1_BASE) - h;
          const w = inside ? widthOf(it, it.taken) : widthOf(it);
          return (
            <g key={`piece-${it.id}`} className={`kn-piece role-${it.role}`} style={{ transform: `translate(${x}px, ${y}px)` }}>
              <rect width={w} height={h} rx={2} />
              {w >= 26 && h >= 16 && (
                <text x={w / 2} y={Math.min(h / 2 + 4, 16)} textAnchor="middle">
                  {it.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      <CellGrid label="Items: weight, value, value per unit and the part taken">
        <CellRow label="item" wide>
          {items.map((it) => (
            <Cell key={it.id} wide value={it.label} role={it.role === 'idle' ? undefined : it.role} />
          ))}
        </CellRow>
        <CellRow label="weight" wide>
          {items.map((it) => (
            <Cell key={it.id} wide value={it.weight} />
          ))}
        </CellRow>
        <CellRow label="value" wide>
          {items.map((it) => (
            <Cell key={it.id} wide value={it.value} />
          ))}
        </CellRow>
        <CellRow label="value/wt" wide>
          {items.map((it) => (
            <Cell key={it.id} wide value={fmtRatio(it.ratio)} />
          ))}
        </CellRow>
        <CellRow label="taken" wide>
          {items.map((it) => (
            <Cell key={it.id} wide value={fmtTaken(it)} role={it.taken > 0 ? 'done' : undefined} />
          ))}
        </CellRow>
      </CellGrid>
      <Strips strips={state.strips} />
    </div>
  );
}
