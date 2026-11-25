import { groupLetter, SEQUENCE_LABEL, type ShellSortState } from '../algorithms/shellSort';
import { useScrollStop } from '../ui/hooks/useScrollStop';
import { SYM } from '../ui/symbols';
import '../ui/roles.css';
import './ShellSortBars.css';

export type { ShellSortState };

const SLOT = 40;
const BAR = 30;
const PAD = 24;
const HEAD = 34; // the row of gap chips
const LABEL = 20; // value labels above the tallest bar
const PLOT = 150;

/** Bar with only its data end rounded (r = 4), anchored to the baseline; as in ArrayBars. */
function barPath(x: number, base: number, height: number, w: number): string {
  const h = height === 0 ? 0.0001 : height;
  const r = Math.min(4, Math.abs(h) / 2, w / 2);
  const end = base - h;
  const dir = h > 0 ? 1 : -1;
  return `M${x},${base}V${end + dir * r}Q${x},${end} ${x + r},${end}H${x + w - r}Q${x + w},${end} ${x + w},${end + dir * r}V${base}Z`;
}

/**
 * Organism for Shell Sort: the bars of ArrayBars (same shape, role colours and gliding moves),
 * with the gap sequence as a row of chips (the current gap filled, finished ones ticked), the
 * index of every bar, its group letter (index mod gap) and, while an element is being inserted,
 * a comb under the letters joining the members of its group. Bars outside that group fade, but
 * the letters and the comb carry the grouping, so it never rests on colour alone. Wide arrays
 * scroll sideways in their own box, which then takes a tab stop (useScrollStop).
 */
export function ShellSortBars({ state }: { state: ShellSortState }) {
  const scrollRef = useScrollStop<HTMLDivElement>();
  const { items, roles, sequence, gaps, gap, done, group, pointers } = state;
  const n = items.length;
  const width = Math.max(2 * PAD + n * SLOT, 320);
  const values = items.map((it) => it.value);
  const maxV = Math.max(0, ...values);
  const minV = Math.min(0, ...values);
  const scale = PLOT / (maxV - minV || 1);
  const top = HEAD + LABEL;
  const base = top + maxV * scale;
  const plotBottom = top + PLOT + (minV < 0 ? 16 : 0);
  const idxY = plotBottom + 16;
  const groupY = idxY + 20;
  const combY = groupY + 12;
  const ptrY = combY + 20;
  const height = ptrY + 10;
  const left = (i: number) => PAD + i * SLOT;
  const center = (i: number) => PAD + (i + 0.5) * SLOT;
  const slotOf = new Map(items.map((it, i) => [it.id, i]));
  const ids = items.map((it) => it.id).sort((a, b) => a - b); // stable DOM order: bars glide
  const inGroup = (i: number) => gap !== null && group !== null && i % gap === group;
  const memberIdx = gap !== null && group !== null ? Array.from({ length: n }, (_, i) => i).filter(inGroup) : [];

  // The chips: "Ciura's gaps" then one chip per gap.
  let x = PAD + 92;
  const chips = gaps.map((g, k) => {
    const w = 14 + String(g).length * 8 + (k < done ? 14 : 0);
    const chip = { g, k, x, w };
    x += w + 6;
    return chip;
  });

  const label =
    `Array ${values.join(', ')}` +
    (gap !== null ? `; gap ${gap}` : `; ${SEQUENCE_LABEL[sequence]} gaps ${gaps.join(', ') || 'none'}`) +
    (memberIdx.length ? `; group ${groupLetter(group!)} at indices ${memberIdx.join(', ')}` : '');

  return (
    <div className="sb-scroll" ref={scrollRef}>
      <svg
        className="shell-bars"
        viewBox={`0 0 ${width} ${height}`}
        style={{ width, maxWidth: '100%', minWidth: Math.min(width, 440) }}
        role="img"
        aria-label={label}
      >
        <text className="sb-head" x={PAD} y={HEAD / 2 + 1}>
          {SEQUENCE_LABEL[sequence]} gaps
        </text>
        {chips.map(({ g, k, x: cx, w }) => {
          const current = gap !== null && k === done;
          const finished = k < done;
          return (
            <g key={k} className={`sb-chip${current ? ' role-active is-current' : ''}${finished ? ' is-done' : ''}`}>
              <rect x={cx} y={6} width={w} height={HEAD - 12} rx={(HEAD - 12) / 2} />
              <text x={cx + w / 2} y={HEAD / 2 + 1}>
                {finished ? `${g} ${SYM.check}` : g}
              </text>
            </g>
          );
        })}
        <line className="sb-baseline" x1={PAD - 6} x2={width - PAD + 6} y1={base} y2={base} />
        {ids.map((id) => {
          const i = slotOf.get(id)!;
          const v = items[i].value;
          const role = roles[i] ?? 'idle';
          const end = base - v * scale;
          const out = group !== null && !inGroup(i);
          return (
            <g key={id} className={`sb-bar role-${role}${out ? ' out' : ''}`} style={{ transform: `translateX(${left(i)}px)` }}>
              <path d={barPath((SLOT - BAR) / 2, base, v * scale, BAR)} />
              <text className="sb-value" x={SLOT / 2} y={v >= 0 ? end - 6 : end + 14}>
                {v}
              </text>
            </g>
          );
        })}
        {items.map((_, i) => (
          <g key={`col${i}`}>
            <text className="sb-index" x={center(i)} y={idxY}>
              {i}
            </text>
            {gap !== null && (
              <text className={`sb-group${inGroup(i) ? ' is-current' : ''}`} x={center(i)} y={groupY}>
                {groupLetter(i % gap)}
              </text>
            )}
          </g>
        ))}
        {memberIdx.length > 0 && (
          <g className="sb-comb">
            {memberIdx.length > 1 && <line x1={center(memberIdx[0])} x2={center(memberIdx[memberIdx.length - 1])} y1={combY} y2={combY} />}
            {memberIdx.map((i) => (
              <line key={i} x1={center(i)} x2={center(i)} y1={groupY + 6} y2={combY} />
            ))}
          </g>
        )}
        {Object.entries(pointers).map(([idx, name]) => (
          <text key={`p-${idx}-${name}`} className="sb-pointer" x={center(Number(idx))} y={ptrY}>
            {name}
          </text>
        ))}
      </svg>
    </div>
  );
}
