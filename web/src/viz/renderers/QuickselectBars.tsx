import type { QuickselectState } from '../algorithms/quickselect';
import { Strips } from '../ui/molecules/Strip';
import '../ui/roles.css';
import { SYM } from '../ui/symbols';
import './QuickselectBars.css';

export type { QuickselectState };

const SLOT = 40;
const BAR = 30;
const PAD = 26;
const TOP = 40; // value labels and the check glyph above the tallest bar
const PLOT = 150;

/** Bar with only its data end rounded, anchored to the baseline (height < 0 hangs below it). */
function barPath(x: number, base: number, height: number, w: number): string {
  const h = height === 0 ? 0.0001 : height;
  const r = Math.min(4, Math.abs(h) / 2, w / 2);
  const end = base - h;
  const dir = h > 0 ? 1 : -1;
  return `M${x},${base}V${end + dir * r}Q${x},${end} ${x + r},${end}H${x + w - r}Q${x + w},${end} ${x + w},${end + dir * r}V${base}Z`;
}

/**
 * Organism for Randomized Quickselect: bars that glide when the three-way partition swaps them,
 * the range lo..hi that can still hold rank k, the pivot value as a dashed line (bars below it
 * go left, bars above it go right), the drawn pivot bar outlined, a <, = or > mark under every
 * classified bar, and the lt / i / gt pointers. Rank k is boxed in the index row.
 */
export function QuickselectBars({ state }: { state: QuickselectState }) {
  const { items, roles, marks, range, pivot, pivotId, pointers, k, copy, strips } = state;
  const n = items.length;
  const width = Math.max(2 * PAD + n * SLOT, 240);
  const minV = Math.min(0, ...(state.scale ? [state.scale.min] : items.map((it) => it.value)));
  const maxV = Math.max(0, ...(state.scale ? [state.scale.max] : items.map((it) => it.value)));
  const scale = PLOT / (maxV - minV || 1);
  const base = TOP + maxV * scale;
  const y = (v: number) => base - v * scale;
  const plotBottom = TOP + PLOT + (minV < 0 ? 18 : 0);
  const idxY = plotBottom + 16;
  const markY = idxY + 18;
  const caretY = markY + 12;
  const height = caretY + 34;
  const left = (i: number) => PAD + i * SLOT;
  const center = (i: number) => PAD + (i + 0.5) * SLOT;
  const slotOf = new Map(items.map((it, i) => [it.id, i]));
  const ids = items.map((it) => it.id).sort((a, b) => a - b); // stable DOM order: bars glide instead of re-mounting
  const sharing = new Map<number, string[]>();
  for (const p of pointers) sharing.set(p.index, [...(sharing.get(p.index) ?? []), p.name]);
  const label = n ? `Array ${items.map((it) => it.value).join(', ')}${range ? `; range ${range.lo} to ${range.hi}` : ''}${pivot !== null ? `; pivot ${pivot}` : ''}${k !== null ? `; rank k = ${k}` : ''}` : 'Empty list';

  return (
    <div className="qs-wrap">
      <svg className="qs-bars" viewBox={`0 0 ${width} ${height}`} style={{ width, maxWidth: '100%', minWidth: Math.min(width, 420) }} role="img" aria-label={label}>
        {range && (
          <g className="qs-range" style={{ transform: `translateX(${left(range.lo)}px)` }}>
            <rect x={0} y={4} width={(range.hi - range.lo + 1) * SLOT} height={idxY + 8 - 4} rx={8} />
            <text x={6} y={16}>
              lo..hi = {range.lo}..{range.hi}
            </text>
          </g>
        )}
        {copy && (
          <text className="qs-copy" x={width - 6} y={16}>
            copy of arr
          </text>
        )}
        {n === 0 && (
          <text className="qs-empty" x={width / 2} y={base - 30}>
            arr = [] (empty list)
          </text>
        )}
        <line className="qs-baseline" x1={PAD - 6} x2={width - PAD + 6} y1={base} y2={base} />
        {ids.map((id) => {
          const i = slotOf.get(id)!;
          const v = items[i].value;
          const role = roles[i] ?? 'idle';
          const end = y(v);
          const glyph = role === 'good' ? SYM.check : role === 'bad' ? SYM.cross : null;
          return (
            <g key={id} className={`qs-bar role-${role}${id === pivotId ? ' pivot' : ''}`} style={{ transform: `translateX(${left(i)}px)` }}>
              <path d={barPath((SLOT - BAR) / 2, base, v * scale, BAR)} />
              <text className="qs-value" x={SLOT / 2} y={v >= 0 ? end - 7 : end + 14}>
                {v}
              </text>
              {glyph && (
                <text className="qs-glyph" x={SLOT / 2} y={v >= 0 ? end - 23 : end + 30}>
                  {glyph}
                </text>
              )}
            </g>
          );
        })}
        {pivot !== null && (
          <g className="qs-pivot">
            <line x1={PAD - 6} x2={width - PAD + 6} y1={y(pivot)} y2={y(pivot)} />
            <text x={width - 4} y={y(pivot) - 6}>
              pivot {pivot}
            </text>
          </g>
        )}
        {items.map((_, i) => (
          <g key={`idx${i}`}>
            {k === i && <rect className="qs-k" x={center(i) - 17} y={idxY - 9} width={34} height={17} rx={8} />}
            <text className={`qs-index${k === i ? ' is-k' : ''}`} x={center(i)} y={idxY}>
              {k === i ? `k=${i}` : i}
            </text>
            {marks[i] && (
              <text className="qs-mark" x={center(i)} y={markY}>
                {marks[i]}
              </text>
            )}
          </g>
        ))}
        {pointers.map((p) => {
          const group = sharing.get(p.index) ?? [p.name];
          const dx = (group.indexOf(p.name) - (group.length - 1) / 2) * 16;
          const x = center(p.index) + dx;
          return (
            <g key={p.name} className="qs-pointer" style={{ transform: `translateX(${x}px)` }}>
              <path d={`M0,${caretY}l-5,8h10z`} />
              <text x={0} y={caretY + 19}>
                {p.name}
              </text>
            </g>
          );
        })}
      </svg>
      <Strips strips={strips} />
    </div>
  );
}
