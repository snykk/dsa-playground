import type { FftCell, FftState } from '../algorithms/fft';
import { StableStrips } from './StableStrips';
import '../ui/molecules/Strip.css';
import '../ui/roles.css';
import { SYM } from '../ui/symbols';
import './FftView.css';

export type { FftState };

const PAD = 8;
const LABEL_W = 92; // row labels ("size 4", "product_fft")
const CW = 60; // cell width: two lines, up to 8 characters each
const CH = 38;
const GAP = 4;
const ROW_GAP_GRID = 34; // room for the butterfly lines between two levels
const ROW_GAP_TABLE = 14;
const TITLE_H = 24;
const RC = 54; // unit circle radius
const CIRCLE_W = 2 * RC + 64;

interface Geometry {
  width: number;
  height: number;
  gridX: (pos: number) => number;
  rowY: (row: number) => number;
  cx: number;
  cy: number;
}

function geometry(state: FftState): Geometry {
  const cols = state.layout?.cols ?? Math.max(1, ...state.rows.map((r) => r.cells.length));
  const rows = state.layout?.rows ?? state.rows.length;
  const gridW = LABEL_W + cols * (CW + GAP) - GAP;
  const width = PAD * 2 + gridW + CIRCLE_W;
  const gridH = rows * CH + (rows - 1) * ROW_GAP_GRID;
  // The circle, its title and two caption lines below it: cy + RC + 61 plus a descender.
  const height = TITLE_H + Math.max(gridH, 2 * RC + 80) + PAD;
  const rowGap = state.kind === 'grid' ? ROW_GAP_GRID : ROW_GAP_TABLE;
  return {
    width,
    height,
    gridX: (pos) => PAD + LABEL_W + pos * (CW + GAP),
    rowY: (row) => TITLE_H + row * (CH + rowGap),
    cx: PAD + gridW + CIRCLE_W / 2 + 6,
    cy: TITLE_H + RC + 18,
  };
}

function Cell({ c, x, y }: { c: FftCell; x: number; y: number }) {
  const glyph = c.role === 'good' ? SYM.check : c.role === 'bad' ? SYM.cross : null;
  return (
    <g className={`fv-cell role-${c.role}${c.pending ? ' pending' : ''}`}>
      <rect x={x} y={y} width={CW} height={CH} rx={5} />
      {glyph && (
        <g className="fv-glyph">
          <circle cx={x + CW - 2} cy={y + 2} r={7} />
          <text x={x + CW - 2} y={y + 2}>
            {glyph}
          </text>
        </g>
      )}
      {c.im === null ? (
        <text x={x + CW / 2} y={y + CH / 2}>
          {c.re}
        </text>
      ) : c.re === '' ? (
        <text x={x + CW / 2} y={y + CH / 2}>
          {c.im.replace(/^\+/, '')}
        </text>
      ) : (
        <>
          <text x={x + CW / 2} y={y + CH / 2 - 8}>
            {c.re}
          </text>
          <text className="fv-im" x={x + CW / 2} y={y + CH / 2 + 8}>
            {c.im}
          </text>
        </>
      )}
    </g>
  );
}

const ordinal = (m: number) => `${m}${m % 10 === 1 && m % 100 !== 11 ? 'st' : m % 10 === 2 && m % 100 !== 12 ? 'nd' : m % 10 === 3 && m % 100 !== 13 ? 'rd' : 'th'}`;

/** The m-th roots of unity of the block being combined, w^k marked, turning the way the sign says. */
function UnitCircle({ circle, cx, cy }: { circle: NonNullable<FftState['circle']>; cx: number; cy: number }) {
  const pts = Array.from({ length: circle.m }, (_, j) => {
    const a = (circle.sign * 2 * Math.PI * j) / circle.m;
    return { j, x: cx + RC * Math.cos(a), y: cy - RC * Math.sin(a) };
  });
  const hit = circle.k === null ? null : pts[circle.k];
  // A short arc from 1 toward w^1 shows the direction of the powers.
  const a1 = (circle.sign * 2 * Math.PI) / Math.max(circle.m, 4) / 2;
  const r2 = RC + 12;
  const arc = `M${cx + r2},${cy} A${r2},${r2} 0 0 ${circle.sign < 0 ? 1 : 0} ${cx + r2 * Math.cos(a1)},${cy - r2 * Math.sin(a1)}`;
  return (
    <g className="fv-circle">
      <line className="fv-axis" x1={cx - RC - 8} y1={cy} x2={cx + RC + 8} y2={cy} />
      <line className="fv-axis" x1={cx} y1={cy - RC - 8} x2={cx} y2={cy + RC + 8} />
      <circle className="fv-ring" cx={cx} cy={cy} r={RC} />
      <path className="fv-dir" d={arc} markerEnd="url(#fv-arrow)" />
      {hit && <line className="fv-spoke" x1={cx} y1={cy} x2={hit.x} y2={hit.y} />}
      {pts.map((p) => {
        const lx = cx + (RC - 15) * Math.cos((circle.sign * 2 * Math.PI * p.j) / circle.m);
        const ly = cy - (RC - 15) * Math.sin((circle.sign * 2 * Math.PI * p.j) / circle.m);
        const on = p.j === circle.k;
        return (
          <g key={p.j} className={`fv-root${on ? ' role-active' : ''}`}>
            <circle cx={p.x} cy={p.y} r={on ? 6 : 4} />
            <text x={lx} y={ly}>
              {p.j}
            </text>
          </g>
        );
      })}
      <text className="fv-circle-title" x={cx} y={cy + RC + 30}>
        {`${ordinal(circle.m)} roots, ${circle.sign < 0 ? 'clockwise' : 'counterclockwise'}`}
      </text>
      {circle.caption.map((line, i) => (
        <text key={i} className="fv-circle-caption" x={cx} y={cy + RC + 46 + i * 15}>
          {line}
        </text>
      ))}
    </g>
  );
}

function describe(state: FftState): string {
  const rows = state.rows.map((r) => `${r.label}: ${r.cells.map((c) => (c ? `${c.re}${c.im ?? ''}` || '?' : '-')).join(', ')}`);
  return `${state.title}. ${rows.join('; ')}`;
}

/**
 * Organism for the FFT: one row per level of the recursion (the whole list on top, single values
 * at the bottom), each block outlined; the split fills the rows downwards, the butterflies fill
 * them back upwards, and the unit circle beside the grid marks the twiddle factor in use. Vectors
 * (the pointwise product, the rounding) are shown as a table in the same columns.
 */
export function FftView({ state }: { state: FftState }) {
  const g = geometry(state);
  const bf = state.butterfly;
  return (
    <div className="fv-wrap">
      <div className="fv-scroll">
        <svg className="fft-view" viewBox={`0 0 ${g.width} ${g.height}`} style={{ width: g.width, maxWidth: '100%', minWidth: Math.min(g.width, 520) }} role="img" aria-label={describe(state)}>
          <defs>
            <marker id="fv-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" className="fv-arrowhead" />
            </marker>
          </defs>
          <text className="fv-title" x={PAD} y={11}>
            {state.title}
          </text>
          {state.rows.map((row, r) => (
            <text key={`l${r}`} className="fv-label" x={PAD + LABEL_W - 8} y={g.rowY(r) + CH / 2}>
              {row.label}
            </text>
          ))}
          {state.kind === 'grid' &&
            state.blocks.map((b) => (
              <rect
                key={`b${b.depth}:${b.start}`}
                className={`fv-block role-${b.role}`}
                x={g.gridX(b.start) - 3}
                y={g.rowY(b.depth) - 3}
                width={b.size * (CW + GAP) - GAP + 6}
                height={CH + 6}
                rx={7}
              />
            ))}
          {bf && (
            <g className="fv-butterfly">
              {[bf.a, bf.b].map((from) =>
                [bf.a, bf.b].map((to) => (
                  <line
                    key={`${from}-${to}`}
                    className={from === bf.b ? 'odd' : 'even'}
                    x1={g.gridX(from) + CW / 2}
                    y1={g.rowY(bf.depth + 1) - 3}
                    x2={g.gridX(to) + CW / 2}
                    y2={g.rowY(bf.depth) + CH + 3}
                  />
                )),
              )}
              <text className="fv-sign" x={g.gridX(bf.a) + CW / 2 + 10} y={g.rowY(bf.depth) + CH + 13}>
                +t
              </text>
              <text className="fv-sign" x={g.gridX(bf.b) + CW / 2 + 10} y={g.rowY(bf.depth) + CH + 13}>
                -t
              </text>
            </g>
          )}
          {state.rows.flatMap((row, r) => row.cells.map((c, p) => (c ? <Cell key={`${r}:${p}`} c={c} x={g.gridX(p)} y={g.rowY(r)} /> : null)))}
          {state.circle && <UnitCircle circle={state.circle} cx={g.cx} cy={g.cy} />}
        </svg>
      </div>
      <StableStrips strips={state.strips} ghosts={state.ghosts} />
    </div>
  );
}
