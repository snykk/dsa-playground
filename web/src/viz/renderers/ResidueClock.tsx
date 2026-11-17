import type { Frame } from '../core/types';
import { walkPos, type ClockArc, type ClockState } from '../algorithms/modularArithmetic';
import '../ui/roles.css';
import { SYM } from '../ui/symbols';
import { monoW, StableStrips, stripSlots, SvgTable, tableHeight } from './numberTheoryShared';
import './ResidueClock.css';

const CX = 150;
const CY = 150;
const R = 116;
const LANE = 26;
const CLOCK_W = 300;
const CLOCK_H = 300;
const SIDE_W = 248;
const LINE_H = 18;
const ROW_H = 18;

/** One size for a whole run: room for the largest extended Euclid table of any frame, and for every strip at its widest. */
export function stabilizeClock(frames: Array<Frame<ClockState>>): Array<Frame<ClockState>> {
  const rows = Math.max(0, ...frames.map((f) => f.state.table?.rows.length ?? 0));
  const slots = stripSlots(frames);
  return frames.map((f) => ({ ...f, state: { ...f.state, tableRows: rows, stripSlots: slots } }));
}

const laneR = (lane: number) => R - lane * LANE;
const deg = (pos: number, m: number) => (pos / m) * 360;
const point = (pos: number, m: number, r: number) => {
  const a = (pos / m) * 2 * Math.PI - Math.PI / 2;
  return { x: CX + r * Math.cos(a), y: CY + r * Math.sin(a) };
};

/** A walk drawn as a spiral: one sample every few degrees, drifting inward by 4px per full turn. */
function walkPath(arc: ClockArc, m: number): string {
  const len = Math.abs(arc.len) > 3 * m ? walkPos(arc.from + arc.len, m) - arc.from : arc.len;
  if (len === 0) return '';
  const r0 = laneR(arc.lane);
  const turns = Math.abs(len) / m;
  const samples = Math.max(8, Math.ceil(turns * 90));
  const pts: string[] = [];
  for (let k = 0; k <= samples; k++) {
    const t = k / samples;
    const p = point(arc.from + len * t, m, r0 - 4 * turns * t);
    pts.push(`${p.x.toFixed(1)},${p.y.toFixed(1)}`);
  }
  return `M${pts.join('L')}`;
}

/**
 * Organism for modular arithmetic: the residues 0..m-1 on a clock face, each value a token that
 * walks round it on its own lane (negative numbers counterclockwise, products as walks that wrap
 * several times), highlighted ticks for the multiples of a gcd, and beside the clock the
 * arithmetic of the step and the extended Euclid table behind an inverse.
 */
export function ResidueClock({ state }: { state: ClockState }) {
  const { m } = state;
  const labelAll = m <= 24;
  const occupied = new Set(state.tokens.map((t) => ((Math.round(t.pos) % m) + m) % m));
  const rows = state.tableRows ?? state.table?.rows.length ?? 0;
  const workH = 4 + 3 * LINE_H;
  const colW = state.table ? state.table.columns.map((c, i) => Math.max(30, monoW(Math.max(c.length, ...state.table!.rows.map((r) => r[i].text.length))) + 12)) : [];
  const sideH = rows ? workH + 22 + tableHeight(rows, ROW_H) : workH;
  const sideW = Math.max(SIDE_W, colW.length ? colW.reduce((a, b) => a + b + 3, 0) : 0);
  const describe = `Clock of ${m} residues; ${state.tokens.map((t) => `${t.label} at ${((t.pos % m) + m) % m}`).join(', ') || 'no tokens'}. ${state.work.join('; ')}`;

  return (
    <div className="rc-wrap">
      <div className="nt-flex">
        <svg className="nt-svg residue-clock" viewBox={`0 0 ${CLOCK_W} ${CLOCK_H}`} style={{ width: CLOCK_W }} role="img" aria-label={describe}>
          <circle className="rc-face" cx={CX} cy={CY} r={R + 8} />
          <circle className="rc-ring" cx={CX} cy={CY} r={R} />
          {[1, 2].map((lane) => (
            <circle key={`lane${lane}`} className="rc-lane" cx={CX} cy={CY} r={laneR(lane)} />
          ))}
          {Array.from({ length: m }, (_, k) => {
            const a = point(k, m, R - 5);
            const b = point(k, m, R + 5);
            const role = state.ticks[k];
            const l = point(k, m, R + 19);
            const show = labelAll || k % 5 === 0 || role !== undefined || occupied.has(k);
            return (
              <g key={`t${k}`} className={`rc-tick${role ? ` role-${role}` : ''}`}>
                <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} />
                {role && <circle cx={point(k, m, R).x} cy={point(k, m, R).y} r={5} />}
                {show && (
                  <text x={l.x} y={l.y}>
                    {k}
                    {role === 'bad' ? SYM.cross : role === 'good' ? SYM.check : ''}
                  </text>
                )}
              </g>
            );
          })}
          {state.arcs.map((arc, k) => (
            <path key={`arc${state.op}-${k}-${arc.from}-${arc.len}-${arc.lane}`} className={`rc-walk role-${arc.role}`} d={walkPath(arc, m)} />
          ))}
          <text className="rc-mod" x={CX} y={CY}>
            mod {m}
          </text>
          {state.tokens.map((t) => {
            const r = laneR(t.lane);
            const d = deg(t.pos, m);
            const w = Math.max(22, monoW(t.label.length, 11) + 12);
            return (
              <g key={t.id} className={`rc-token role-${t.role}`} style={{ transform: `rotate(${d.toFixed(3)}deg)`, transformOrigin: `${CX}px ${CY}px` }}>
                <g className="rc-upright" style={{ transform: `rotate(${(-d).toFixed(3)}deg)`, transformOrigin: `${CX}px ${CY - r}px` }}>
                  <rect x={CX - w / 2} y={CY - r - 10} width={w} height={20} rx={10} />
                  <text x={CX} y={CY - r}>
                    {t.label}
                  </text>
                </g>
              </g>
            );
          })}
        </svg>
        <svg className="nt-svg residue-clock rc-side" viewBox={`0 0 ${sideW} ${sideH}`} style={{ width: sideW }} role="img" aria-label={state.work.join('; ') || 'No arithmetic yet'}>
          {state.work.map((line, k) => (
            <text key={`w${k}`} className={`rc-work${k === state.work.length - 1 ? ' last' : ''}`} x={0} y={14 + k * LINE_H}>
              {line}
            </text>
          ))}
          {state.table && (
            <>
              <text className="rc-tabletitle" x={0} y={workH + 10}>
                {state.table.title}
              </text>
              <SvgTable x={0} y={workH + 20} columns={state.table.columns} colW={colW} rows={state.table.rows} rowH={ROW_H} />
            </>
          )}
        </svg>
      </div>
      <StableStrips strips={state.strips} slots={state.stripSlots} />
    </div>
  );
}
