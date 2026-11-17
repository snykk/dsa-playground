import type { JudgeState } from '../algorithms/interactive';
import type { Role } from '../core/types';
import '../ui/roles.css';
import { SYM } from '../ui/symbols';
import './JudgeView.css';

export type { JudgeState };

const PIC_W = 392;
const PIC_H = 250;
const LOG_W = 206;
const LOG_H = 268;
const LINES = 9;
const LINE_H = 19;

/** Rough text widths for placing labels: 11px bold and 10px regular digits. */
const W11 = 6.6;
const W10 = 5.8;
/** The x that centres a label of width w on x without leaving the picture. */
const clampX = (x: number, w: number) => Math.min(PIC_W - 2 - w / 2, Math.max(2 + w / 2, x));

const glyphOf = (role: Role) => (role === 'good' ? ` ${SYM.check}` : role === 'bad' ? ` ${SYM.cross}` : '');

/** guess_number: the interval [lo, hi] of 1..n, the midpoint asked, and the judge's secret. */
function RangePicture({ r }: { r: NonNullable<JudgeState['range']> }) {
  const x0 = 20;
  const w = PIC_W - 40;
  const y = 110;
  const small = r.n <= 32;
  const cell = w / r.n;
  const xs = (v: number) => x0 + ((v - 1) / Math.max(1, r.n - 1)) * w;
  const cx = (v: number) => (small ? x0 + (v - 0.5) * cell : xs(v));
  const live = r.lo <= r.hi;
  // Large n, the row under the bar: "lo" and "hi" sit under the ends of the live interval while
  // there is room between them and the midpoint's line; once the interval is too narrow they
  // move together beside it ("lo" left of it and "hi" right of it, or both on the side with room).
  const loText = `lo ${r.lo}`;
  const hiText = `hi ${r.hi}`;
  const wl = loText.length * W11;
  const wh = hiText.length * W11;
  const midX = r.mid === null ? null : cx(r.mid);
  const crosses = (c: number, wd: number) => midX !== null && Math.abs(midX - c) < wd / 2 + 4;
  const loC = clampX(xs(r.lo), wl);
  const hiC = clampX(xs(r.hi), wh);
  const apart = loC + wl / 2 + 10 <= hiC - wh / 2 && !crosses(loC, wl) && !crosses(hiC, wh);
  let loX = xs(r.lo) - 8 - wl;
  let hiX = xs(r.hi) + 8;
  if (loX < 2) {
    loX = hiX;
    hiX = loX + wl + 8;
  }
  if (hiX + wh > PIC_W - 2) {
    hiX = PIC_W - 2 - wh;
    loX = Math.min(loX, hiX - 8 - wl);
  }
  // Text-anchor start at the left edge either way: centred labels start half a width earlier.
  if (apart) {
    loX = loC - wl / 2;
    hiX = hiC - wh / 2;
  }
  const secretText = small ? 'secret' : `secret ${r.secret}`;
  const midText = r.mid === null ? '' : `mid ${r.mid}`;
  return (
    <g className="jv-range">
      <text className="jv-title" x={x0} y={22}>
        {`the secret is somewhere in 1..${r.n}`}
      </text>
      {small ? (
        Array.from({ length: r.n }, (_, k) => {
          const v = k + 1;
          const role = v === r.mid ? 'active' : live && v >= r.lo && v <= r.hi ? 'compare' : 'muted';
          return (
            <g key={v} className={`jv-cell role-${role}`}>
              <rect x={x0 + k * cell + 1} y={y} width={cell - 2} height={30} rx={4} />
              <text x={x0 + (k + 0.5) * cell} y={y + 15}>
                {v}
              </text>
            </g>
          );
        })
      ) : (
        <g>
          <rect className="jv-bar" x={x0} y={y + 8} width={w} height={14} rx={7} />
          {live && <rect className="jv-bar live" x={xs(r.lo)} y={y + 8} width={Math.max(3, xs(r.hi) - xs(r.lo))} height={14} rx={7} />}
          {live && (
            <>
              <text className="jv-tick strong" x={loX} y={y + 36} style={{ textAnchor: 'start' }}>
                {loText}
              </text>
              <text className="jv-tick strong" x={hiX} y={y + 36} style={{ textAnchor: 'start' }}>
                {hiText}
              </text>
            </>
          )}
        </g>
      )}
      {r.mid !== null && (
        <g className="jv-mid">
          <line x1={cx(r.mid)} y1={small ? y + 34 : y + 26} x2={cx(r.mid)} y2={y + 52} />
          <text x={clampX(cx(r.mid), midText.length * W11)} y={y + 62}>
            {midText}
          </text>
        </g>
      )}
      <g className="jv-secret">
        <path d={`M${cx(r.secret)},${y - 4} l-6,-10 h12 z`} />
        <text x={clampX(cx(r.secret), secretText.length * W10)} y={y - 22}>
          {secretText}
        </text>
      </g>
      <text className="jv-note" x={x0} y={y + 96}>
        {live ? `lo = ${r.lo}, hi = ${r.hi}: ${r.hi - r.lo + 1} value${r.hi - r.lo + 1 === 1 ? '' : 's'} left` : 'no value left'}
      </text>
    </g>
  );
}

/** find_maximum: the hidden array, the best index so far and the index being compared. */
function ArrayPicture({ cells, title, y = 70 }: { cells: NonNullable<JudgeState['cells']>; title: string; y?: number }) {
  const w = Math.min(46, (PIC_W - 40) / cells.length);
  const x0 = (PIC_W - w * cells.length) / 2;
  return (
    <g>
      <text className="jv-title" x={20} y={y - 48}>
        {title}
      </text>
      {cells.map((c, k) => (
        <g key={c.index} className={`jv-cell role-${c.role}`}>
          <text className="jv-index" x={x0 + (k + 0.5) * w} y={y - 12}>
            {c.index}
          </text>
          <rect x={x0 + k * w + 2} y={y} width={w - 4} height={34} rx={5} />
          <text x={x0 + (k + 0.5) * w} y={y + 17}>
            {c.value}
            {glyphOf(c.role)}
          </text>
          {c.note && (
            <text className="jv-cell-note" x={x0 + (k + 0.5) * w} y={y + 48}>
              {c.note}
            </text>
          )}
        </g>
      ))}
    </g>
  );
}

/** tournament: one row per round, each winner drawn between the pair it came from. */
function BracketPicture({ rounds, cells }: { rounds: NonNullable<JudgeState['rounds']>; cells: NonNullable<JudgeState['cells']> }) {
  const n = rounds[0]?.length ?? 1;
  const w = Math.min(46, (PIC_W - 40) / n);
  const x0 = (PIC_W - w * n) / 2;
  const rowH = Math.min(52, 190 / Math.max(1, Math.ceil(Math.log2(Math.max(2, n))) + 1));
  const xs: number[][] = [rounds[0].map((_, k) => x0 + (k + 0.5) * w)];
  for (let r = 1; r < rounds.length; r++) {
    xs.push(rounds[r].map((_, j) => {
      const a = xs[r - 1][2 * j];
      const b = xs[r - 1][2 * j + 1];
      return b === undefined ? a : (a + b) / 2;
    }));
  }
  const value = new Map(cells.map((c) => [c.index, c.value]));
  const top = 42;
  return (
    <g>
      <text className="jv-title" x={20} y={18}>
        one row per round; a[i] under each candidate
      </text>
      {rounds.map((row, r) =>
        row.map((c, j) => {
          const x = xs[r][j];
          const y = top + r * rowH;
          const kids = r > 0 ? [xs[r - 1][2 * j], xs[r - 1][2 * j + 1]].filter((v) => v !== undefined) : [];
          return (
            <g key={`${r}:${j}`}>
              {kids.map((kx, t) => (
                <line key={t} className="jv-link" x1={kx} y1={y - rowH + 30} x2={x} y2={y} />
              ))}
              <g className={`jv-cell role-${c.role}`}>
                <rect x={x - w / 2 + 2} y={y} width={w - 4} height={30} rx={5} />
                <text x={x} y={y + 11}>
                  {c.index}
                  {glyphOf(c.role)}
                </text>
                <text className="jv-sub" x={x} y={y + 23}>
                  {`a=${value.get(c.index)}`}
                </text>
              </g>
            </g>
          );
        }),
      )}
    </g>
  );
}

/** binary_subset_search: the mask asked, the judge's hidden bits, and what is known so far. */
function BitsPicture({ b }: { b: NonNullable<JudgeState['bits']> }) {
  const w = Math.min(28, (PIC_W - 110) / b.width);
  const x0 = 96;
  const bit = (v: number, k: number) => (v >> k) & 1;
  const rows: Array<{ label: string; cell: (k: number) => { text: string; role: Role } }> = [
    { label: 'mask', cell: (k) => ({ text: b.current === k ? '1' : '0', role: b.current === k ? 'active' : 'idle' }) },
    { label: 'hidden', cell: (k) => ({ text: String(bit(b.secret, k)), role: 'muted' }) },
    { label: 'result', cell: (k) => (k < b.asked ? { text: String(bit(b.result, k)), role: b.current === k ? 'compare' : 'done' } : { text: '?', role: 'idle' }) },
  ];
  return (
    <g>
      <text className="jv-title" x={20} y={22}>
        {`the hidden number in ${b.width} bit${b.width === 1 ? '' : 's'}, lowest on the right`}
      </text>
      {Array.from({ length: b.width }, (_, i) =>
        // Narrow cells cannot hold two-digit indexes side by side: label every fifth bit then.
        w >= 18 || (b.width - 1 - i) % 5 === 0 ? (
          <text key={`h${i}`} className="jv-index" x={x0 + (i + 0.5) * w} y={52}>
            {b.width - 1 - i}
          </text>
        ) : null,
      )}
      {rows.map((row, r) => (
        <g key={row.label}>
          <text className="jv-row-label" x={x0 - 10} y={78 + r * 42}>
            {row.label}
          </text>
          {Array.from({ length: b.width }, (_, i) => {
            const k = b.width - 1 - i;
            const c = row.cell(k);
            return (
              <g key={i} className={`jv-cell role-${c.role}${c.text === '1' ? ' one' : ''}`}>
                <rect x={x0 + i * w + 1} y={64 + r * 42} width={w - 2} height={28} rx={4} />
                <text x={x0 + (i + 0.5) * w} y={78 + r * 42}>
                  {c.text}
                </text>
              </g>
            );
          })}
        </g>
      ))}
      <text className="jv-note" x={20} y={210}>
        {`result = ${b.result}`}
      </text>
    </g>
  );
}

/**
 * Organism for interactive problems: the solver's picture of the hidden input, and beside it (below
 * it on a narrow screen) the conversation with the judge, newest line at the bottom, under a query
 * budget that fills as queries are spent.
 */
export function JudgeView({ state }: { state: JudgeState }) {
  const lines = state.transcript.slice(-LINES);
  const skipped = state.transcript.length - lines.length;
  const slots = state.limit <= 32 ? Math.max(state.limit, state.used) : 0;
  const slotW = slots ? Math.min(18, (LOG_W - 4) / slots) : 0;
  const over = state.used > state.limit;
  const describe = `${state.used} of ${state.limit} queries. Transcript: ${state.transcript.map((l) => l.text).join(' / ')}`;
  return (
    <div className="jv-wrap">
      <svg className="judge-view jv-picture" viewBox={`0 0 ${PIC_W} ${PIC_H}`} style={{ width: PIC_W, maxWidth: '100%' }} role="img" aria-label={`What the solver knows. ${describe}`}>
        {state.range && <RangePicture r={state.range} />}
        {state.mode === 'maximum' && state.cells && <ArrayPicture cells={state.cells} title="hidden values a[i]: the code only learns comparisons" y={100} />}
        {state.mode === 'tournament' && state.rounds && state.cells && <BracketPicture rounds={state.rounds} cells={state.cells} />}
        {state.bits && <BitsPicture b={state.bits} />}
      </svg>
      <svg className="judge-view jv-log" viewBox={`0 0 ${LOG_W + 8} ${LOG_H}`} style={{ width: LOG_W + 8, maxWidth: '100%' }} aria-hidden="true">
        <text className="jv-title" x={0} y={18}>
          {`queries: ${state.used} of ${state.limit}${over ? ' (over the limit)' : ''}`}
        </text>
        {slots > 0 ? (
          Array.from({ length: slots }, (_, k) => (
            <rect key={k} className={`jv-slot${k < state.used ? (k >= state.limit ? ' over' : ' used') : ''}${k >= state.limit ? ' extra' : ''}`} x={k * slotW} y={28} width={slotW - 2} height={10} rx={2} />
          ))
        ) : (
          <g>
            <rect className="jv-slot" x={0} y={28} width={LOG_W - 4} height={10} rx={3} />
            <rect className={`jv-slot ${over ? 'over' : 'used'}`} x={0} y={28} width={Math.min(1, state.used / Math.max(1, state.limit)) * (LOG_W - 4)} height={10} rx={3} />
          </g>
        )}
        <text className="jv-log-head" x={0} y={58}>
          {skipped > 0 ? `${SYM.ellipsis} ${skipped} earlier line${skipped === 1 ? '' : 's'}` : 'you (solver) / judge'}
        </text>
        {lines.map((l, k) => {
          const last = k === lines.length - 1;
          const y = 78 + k * LINE_H;
          return (
            <g key={k + skipped} className={`jv-line ${l.who}${last ? ' last' : ''}${l.error ? ' error' : ''}`}>
              <rect x={l.who === 'solver' ? 0 : 70} y={y - 8} width={l.who === 'solver' ? 120 : 136} height={16} rx={4} />
              <text x={l.who === 'solver' ? 6 : 76} y={y}>
                {`${l.who === 'solver' ? 'you' : 'judge'}: ${l.text}`}
              </text>
            </g>
          );
        })}
        {state.status && (
          <text className={`jv-status role-${state.status}`} x={0} y={LOG_H - 10}>
            {state.status === 'good' ? `${SYM.check} accepted` : `${SYM.cross} wrong answer`}
          </text>
        )}
      </svg>
    </div>
  );
}
