import type { Frame } from '../core/types';
import type { CombRow, CrtState } from '../algorithms/chineseRemainder';
import { Strips } from '../ui/molecules/Strip';
import '../ui/roles.css';
import { SYM } from '../ui/symbols';
import { monoW } from './numberTheoryShared';
import './CongruenceCombs.css';

const LINE_W = 500;
const ROW_H = 30;
const WORK_H = 46;
const PAD = 10;
const WORK_LINES = 3;

/** The work lines, then the checks packed two spaces apart into the lines left, each line at most `chars` long. */
function workLines(work: string[], checks: string[] | undefined, chars: number): string[] {
  const lines = work.slice(0, WORK_LINES);
  for (const c of checks ?? []) {
    const last = lines.length - 1;
    if (last >= work.length && lines[last].length + 3 + c.length <= chars) lines[last] += `,  ${c}`;
    else lines.push(c);
  }
  if (lines.length > WORK_LINES) lines.splice(WORK_LINES - 1, lines.length, `${lines[WORK_LINES - 1]}, ...`);
  return lines;
}

/** One size for a whole run: room for the longest row label, for every row, and for the verdict if one comes. */
export function stabilizeCombs(frames: Array<Frame<CrtState>>): Array<Frame<CrtState>> {
  let chars = 10;
  let rows = 0;
  let verdict = false;
  for (const f of frames) {
    rows = Math.max(rows, f.state.rows.length);
    if (f.state.verdict) verdict = true;
    for (const r of [...f.state.rows, f.state.merged]) chars = Math.max(chars, r.label.length);
  }
  return frames.map((f) => ({ ...f, state: { ...f.state, layout: { chars: Math.min(chars, 40), rows, verdict } } }));
}

/**
 * Organism for the Chinese remainder theorem: a number line 0..window-1 with one comb per
 * congruence (the points r, r + m, r + 2m, ...) and, under a rule, the comb of the merged
 * solution x (mod lcm), which thins out at each merge until it holds only the points every
 * comb shares; a dashed guide marks the solution on every row.
 */
export function CongruenceCombs({ state }: { state: CrtState }) {
  const layout = state.layout ?? { chars: Math.max(10, ...state.rows.map((r) => r.label.length), state.merged.label.length), rows: state.rows.length, verdict: state.verdict !== undefined };
  const labelW = monoW(layout.chars, 11) + 16;
  const x0 = labelW;
  const unit = LINE_W / state.window;
  const px = (at: number) => x0 + (at + 0.5) * unit;
  const rowsTop = WORK_H + 8;
  const mergedY = rowsTop + layout.rows * ROW_H + 14;
  const axisY = mergedY + ROW_H - 4;
  const height = axisY + 34 + (layout.verdict ? 22 : 0);
  const width = x0 + LINE_W + PAD;
  const tick = state.window <= 30 ? 1 : state.window <= 60 ? 5 : 10;
  const labelEvery = state.window <= 30 ? 5 : 10;
  const lines = workLines(state.work, state.checks, Math.floor(width / monoW(1, 12)));
  const guide = state.merged.points.find((p) => p.role === 'good' && state.merged.points.filter((q) => q.role === 'good').length === 1);
  const describe = `${state.rows.map((r) => `${r.label}: ${r.points.map((p) => p.at).join(' ')}`).join('; ')}; merged ${state.merged.label}: ${state.merged.points.map((p) => p.at).join(' ')}`;
  const tagged = state.merged.points.filter((p) => p.tag);
  const room = tagged.length < 2 || unit * Math.min(...tagged.slice(1).map((p, k) => p.at - tagged[k].at)) >= 26;

  const comb = (row: CombRow, y: number, merged: boolean) => (
    <g key={row.key} className={`cc-row${row.role ? ` role-${row.role}` : ''}${merged ? ' merged' : ''}`}>
      <text className="cc-label" x={x0 - 10} y={y}>
        {row.label}
      </text>
      <line className="cc-track" x1={x0} y1={y} x2={x0 + LINE_W} y2={y} />
      {row.points.map((p) => (
        <g key={`${row.key}-${p.at}`} className={`cc-pt role-${p.role ?? 'idle'}`}>
          <circle cx={px(p.at)} cy={y} r={p.role === 'good' ? 5.5 : 4} />
          {p.role === 'good' && merged && (
            <text className="cc-ptglyph" x={px(p.at)} y={y - 11}>
              {SYM.check}
            </text>
          )}
          {p.tag && (room || p.role === 'good') && (
            <text className="cc-tag" x={px(p.at)} y={y + 14}>
              {p.tag}
            </text>
          )}
        </g>
      ))}
    </g>
  );

  return (
    <div className="cc-wrap">
      <div className="cc-scroll">
        <svg className="nt-svg congruence-combs" viewBox={`0 0 ${width} ${height}`} style={{ width, maxWidth: '100%', minWidth: Math.min(width, 460) }} role="img" aria-label={describe}>
          {lines.map((w, k) => (
            <text key={`w${k}`} className={`cc-work${k === lines.length - 1 || k >= state.work.length ? ' last' : ''}`} x={0} y={12 + k * 16}>
              {w}
            </text>
          ))}
          {guide && <line className="cc-guide" x1={px(guide.at)} y1={rowsTop - 2} x2={px(guide.at)} y2={axisY} />}
          {state.rows.map((row, i) => comb(row, rowsTop + 8 + i * ROW_H, false))}
          <line className="cc-rule" x1={0} y1={mergedY - 15} x2={width - PAD} y2={mergedY - 15} />
          {comb(state.merged, mergedY, true)}
          <line className="cc-axis" x1={x0} y1={axisY} x2={x0 + LINE_W} y2={axisY} />
          {Array.from({ length: Math.floor((state.window - 1) / tick) + 1 }, (_, k) => k * tick).map((v) => (
            <g key={`t${v}`} className="cc-tick">
              <line x1={px(v)} y1={axisY} x2={px(v)} y2={axisY + (v % labelEvery === 0 ? 6 : 3)} />
              {v % labelEvery === 0 && (
                <text x={px(v)} y={axisY + 15}>
                  {v}
                </text>
              )}
            </g>
          ))}
          <text className="nt-note cc-window" x={x0 + LINE_W} y={axisY + 28}>
            x from 0 to {state.window - 1}
          </text>
          {state.verdict && (
            <text className={`cc-verdict role-${state.verdict.role}`} x={0} y={height - 8}>
              {state.verdict.role === 'good' ? SYM.check : SYM.cross} {state.verdict.text}
            </text>
          )}
        </svg>
      </div>
      <Strips strips={state.strips} />
    </div>
  );
}
