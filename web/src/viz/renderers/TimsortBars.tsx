import type { TimsortState } from '../algorithms/timsort';
import { useScrollStop } from '../ui/hooks/useScrollStop';
import '../ui/roles.css';
import './TimsortBars.css';

export type { TimsortState };

const SLOT = 40;
const BAR = 30;
const PAD = 24;
const CHIP_H = 22;
const STACK_Y = 6; // top of the stack chips
const STATUS_Y = 62; // centre line of the status row
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
 * Organism for Timsort: the bars of ArrayBars (same shape, role colours and gliding moves) with
 * the stack of pending runs as a strip of run lengths above them (bottom of the stack on the
 * left, the letters W, A, B, C under the runs being checked, the two runs being merged filled),
 * a status row (minrun, min_gallop, a "galloping" tag, the test on the stack) and, under the
 * bars, a labelled bracket for every run, a dashed bracket for the run being found, and a dashed
 * outline plus a "temporary copy" bracket for the values that sit in the copy during a merge.
 * Runs are told apart by brackets and labels, never by colour alone. Wide arrays scroll sideways
 * in their own box, which then takes a tab stop (useScrollStop).
 */
export function TimsortBars({ state }: { state: TimsortState }) {
  const scrollRef = useScrollStop<HTMLDivElement>();
  const { items, roles, marks, stack, check, minrun, minGallop, galloping, tmp, pointers } = state;
  const n = items.length;
  const width = Math.max(2 * PAD + n * SLOT, 380);
  const values = items.map((it) => it.value);
  const maxV = Math.max(0, ...values);
  const minV = Math.min(0, ...values);
  const scale = PLOT / (maxV - minV || 1);
  const top = STATUS_Y + 14 + LABEL;
  const base = top + maxV * scale;
  const plotBottom = top + PLOT + (minV < 0 ? 16 : 0);
  const idxY = plotBottom + 16;
  const ptrY = idxY + 18;
  const bracketY = ptrY + 14;
  const tmpY = bracketY + 32;
  const height = tmpY + 26;
  const left = (i: number) => PAD + i * SLOT;
  const center = (i: number) => PAD + (i + 0.5) * SLOT;
  const slotOf = new Map(items.map((it, i) => [it.id, i]));
  const ids = items.map((it) => it.id).sort((a, b) => a - b); // stable DOM order: bars glide
  const inTmp = new Set(tmp);

  // The stack strip: "Stack" then one chip per run, bottom first.
  let x = PAD + 50;
  const chips = stack.map((run, k) => {
    const w = 16 + String(run.length).length * 8;
    const chip = { run, k, x, w };
    x += w + 10;
    return chip;
  });

  // The status row: minrun, min_gallop, the galloping tag and the test on the stack.
  const minrunText = `minrun ${minrun}`;
  const gallopText = `min_gallop ${minGallop}`;
  const gallopTextX = PAD + minrunText.length * 7 + 16;
  const tagX = gallopTextX + gallopText.length * 7 + 16;
  const checkX = tagX + (galloping ? 88 : 0);

  const label =
    `Array ${values.join(', ')}; stack of run lengths ${stack.map((r) => r.length).join(', ') || 'empty'}` +
    (check ? `; ${check}` : '') +
    (galloping ? '; galloping' : '');

  return (
    <div className="tb-scroll" ref={scrollRef}>
      <svg
        className="timsort-bars"
        viewBox={`0 0 ${width} ${height}`}
        style={{ width, maxWidth: '100%', minWidth: Math.min(width, 600) }}
        role="img"
        aria-label={label}
      >
        <text className="tb-head" x={PAD} y={STACK_Y + CHIP_H / 2}>
          Stack
        </text>
        {chips.length === 0 && (
          <text className="tb-empty" x={PAD + 50} y={STACK_Y + CHIP_H / 2}>
            empty
          </text>
        )}
        {chips.map(({ run, k, x: cx, w }) => (
          <g key={k} className={`tb-chip${run.merging ? ' role-active is-merging' : ''}`}>
            <rect x={cx} y={STACK_Y} width={w} height={CHIP_H} rx={5} />
            <text x={cx + w / 2} y={STACK_Y + CHIP_H / 2}>
              {run.length}
            </text>
            <text className={`tb-chip-name${run.letter ? ' is-letter' : ''}`} x={cx + w / 2} y={STACK_Y + CHIP_H + 12}>
              {run.letter ?? run.name}
            </text>
          </g>
        ))}
        {chips.length > 1 && (
          <text className="tb-note" x={x + 2} y={STACK_Y + CHIP_H / 2}>
            {'top'}
          </text>
        )}
        <text className="tb-status" x={PAD} y={STATUS_Y}>
          {minrunText}
        </text>
        <text className="tb-status" x={gallopTextX} y={STATUS_Y}>
          {gallopText}
        </text>
        {galloping && (
          <g className="tb-gallop role-active">
            <rect x={tagX} y={STATUS_Y - 11} width={76} height={22} rx={11} />
            <text x={tagX + 38} y={STATUS_Y}>
              galloping
            </text>
          </g>
        )}
        {check && (
          <text className="tb-check" x={checkX} y={STATUS_Y}>
            {check}
          </text>
        )}
        <line className="tb-baseline" x1={PAD - 6} x2={width - PAD + 6} y1={base} y2={base} />
        {ids.map((id) => {
          const i = slotOf.get(id)!;
          const v = items[i].value;
          const role = roles[i] ?? 'idle';
          const end = base - v * scale;
          return (
            <g key={id} className={`tb-bar role-${role}${inTmp.has(i) ? ' in-tmp' : ''}`} style={{ transform: `translateX(${left(i)}px)` }}>
              <path d={barPath((SLOT - BAR) / 2, base, v * scale, BAR)} />
              <text className="tb-value" x={SLOT / 2} y={v >= 0 ? end - 6 : end + 14}>
                {v}
              </text>
            </g>
          );
        })}
        {items.map((_, i) => (
          <text key={`i${i}`} className="tb-index" x={center(i)} y={idxY}>
            {i}
          </text>
        ))}
        {Object.entries(pointers).map(([idx, name]) => (
          <text key={`p-${idx}-${name}`} className="tb-pointer" x={center(Number(idx))} y={ptrY}>
            {name}
          </text>
        ))}
        {marks.map((m) => {
          const x1 = left(m.lo) + 4;
          const x2 = left(m.hi) - 4;
          const slots = m.hi - m.lo;
          const length = m.kind === 'merge' ? '' : slots >= 2 ? ` = ${slots}` : '';
          const name = m.kind === 'new' && slots < 2 ? 'new' : m.name;
          return (
            <g key={`m-${m.lo}-${m.kind}`} className={`tb-mark is-${m.kind}`}>
              <path d={`M${x1},${bracketY - 6}V${bracketY}H${x2}V${bracketY - 6}`} />
              <text x={(x1 + x2) / 2} y={bracketY + 13}>
                {name}
                {length}
              </text>
            </g>
          );
        })}
        {tmp.length > 0 && (
          <g className="tb-mark is-tmp">
            <path d={`M${left(Math.min(...tmp)) + 4},${tmpY - 6}V${tmpY}H${left(Math.max(...tmp) + 1) - 4}V${tmpY - 6}`} />
            <text x={(left(Math.min(...tmp)) + left(Math.max(...tmp) + 1)) / 2} y={tmpY + 13}>
              {tmp.length * SLOT >= 150 ? 'temporary copy' : 'tmp'}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}
