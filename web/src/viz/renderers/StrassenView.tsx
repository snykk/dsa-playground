import type { MatrixPanel, StrassenState } from '../algorithms/strassen';
import { Strip } from '../ui/molecules/Strip';
import '../ui/roles.css';
import { SYM } from '../ui/symbols';
import './StrassenView.css';

export type { MatrixPanel, StrassenState };

const PAD = 10;
const OP = 30; // room for the "x" and "=" between the matrices of a row
const LABEL = 24; // room for a matrix's label above it
const ROW_GAP = 16;
const GAP3 = 12; // between the seven products

interface Geometry {
  width: number;
  height: number;
  cell: number;
  /** Top-left corner of slot s in row r (row 0: A B C; row 1: the factors; row 2: P1..P7). */
  at: (row: number, slot: number) => { x: number; y: number };
  rows: number;
  side: number;
  half: number;
}

function geometry(state: StrassenState): Geometry {
  const side = state.layout?.side ?? Math.max(1, ...state.call.map((p) => (p ? Math.max(p.cells.length, p.cells[0].length) : 1)));
  const cell = state.layout?.cell ?? 30;
  const half = Math.ceil(side / 2);
  const rows = (state.layout?.split ?? state.products.length > 0) ? 3 : 1;
  const row1 = 3 * side * cell + 2 * OP;
  const row3 = rows === 3 ? 7 * half * cell + 6 * GAP3 : 0;
  const inner = Math.max(row1, row3);
  const width = inner + 2 * PAD;
  const x1 = PAD + (inner - row1) / 2;
  const x3 = PAD + (inner - row3) / 2;
  const y = [LABEL + 4, LABEL + 4 + side * cell + ROW_GAP + LABEL, LABEL + 4 + side * cell + ROW_GAP + LABEL + half * cell + ROW_GAP + LABEL];
  const height = (rows === 3 ? y[2] + half * cell : y[0] + side * cell) + 8;
  return {
    width,
    height,
    cell,
    rows,
    side,
    half,
    at: (row, slot) => (row === 2 ? { x: x3 + slot * (half * cell + GAP3), y: y[2] } : { x: x1 + slot * (side * cell + OP), y: y[row] }),
  };
}

/** One matrix: its label, its cells (role-coloured, padding dashed, unknown entries dotted) and the quadrant split. */
function Matrix({ panel, cell, x, y }: { panel: MatrixPanel; cell: number; x: number; y: number }) {
  const rows = panel.cells.length;
  const cols = panel.cells[0]?.length ?? 0;
  const w = cols * cell;
  const h = rows * cell;
  const glyph = panel.role === 'good' ? ` ${SYM.check}` : panel.role === 'bad' ? ` ${SYM.cross}` : '';
  return (
    <g className={`sv-matrix${panel.role ? ` role-${panel.role} framed` : ''}`} style={{ transform: `translate(${x}px, ${y}px)` }}>
      <text className="sv-label" x={-2} y={-13}>
        {panel.label}
        {glyph && <tspan className="sv-glyph">{glyph}</tspan>}
      </text>
      {panel.role && <rect className="sv-frame" x={-3} y={-3} width={w + 6} height={h + 6} rx={6} />}
      {panel.cells.map((row, r) =>
        row.map((v, c) => {
          const pad = panel.keep !== undefined && (r >= panel.keep.rows || c >= panel.keep.cols);
          const role = panel.roles?.[`${r},${c}`] ?? 'idle';
          return (
            <g key={`${r},${c}`} className={`sv-cell role-${role}${pad ? ' pad' : ''}${v === null ? ' unknown' : ''}`}>
              <rect x={c * cell + 1} y={r * cell + 1} width={cell - 2} height={cell - 2} rx={4} />
              <text x={c * cell + cell / 2} y={r * cell + cell / 2}>
                {v === null ? SYM.middot : v}
              </text>
            </g>
          );
        }),
      )}
      {panel.quads && rows % 2 === 0 && rows > 1 && (
        <g className="sv-quads">
          <line x1={w / 2} x2={w / 2} y1={-2} y2={h + 2} />
          <line x1={-2} x2={w + 2} y1={h / 2} y2={h / 2} />
        </g>
      )}
    </g>
  );
}

function describe(state: StrassenState): string {
  const name = (p: MatrixPanel | null) => (p ? `${p.label} (${p.cells.length} x ${p.cells[0].length})` : 'empty');
  const parts = [`Current call: ${state.call.map(name).join(', ')}`];
  if (state.factors.some(Boolean)) parts.push(`factors: ${state.factors.map(name).join(', ')}`);
  const done = state.products.filter(Boolean).length;
  if (state.products.length) parts.push(`${done} of 7 products computed`);
  return parts.join('; ');
}

/**
 * Organism for Strassen's algorithm: the current call's A x B = C on top (quadrants marked), the
 * factors of the product being formed below them, and P1..P7 at the bottom. Matrices keep their
 * key while they change rows, so a factor glides up into the recursive call and its product
 * glides back down into its slot.
 */
export function StrassenView({ state }: { state: StrassenState }) {
  const g = geometry(state);
  const items: Array<{ panel: MatrixPanel; x: number; y: number }> = [];
  state.call.forEach((p, s) => p && items.push({ panel: p, ...g.at(0, s) }));
  state.factors.forEach((p, s) => p && items.push({ panel: p, ...g.at(1, s) }));
  state.products.forEach((p, s) => p && items.push({ panel: p, ...g.at(2, s) }));
  const ops = (row: number, size: number) => {
    const a = g.at(row, 0);
    const b = g.at(row, 1);
    const c = g.at(row, 2);
    const y = a.y + (size * g.cell) / 2;
    return (
      <g className="sv-ops">
        <text x={b.x - OP / 2} y={y}>
          {SYM.times}
        </text>
        <text x={c.x - OP / 2} y={y}>
          =
        </text>
      </g>
    );
  };
  const callSize = Math.max(...state.call.map((p) => (p ? p.cells.length : 0)), 1);
  const factorSize = Math.max(...state.factors.map((p) => (p ? p.cells.length : 0)), 0);
  const pending = state.factors.length > 0 && !state.factors[2] && state.factors[0];
  return (
    <div className="sv-wrap">
      <svg
        className="strassen-view"
        viewBox={`0 0 ${g.width} ${g.height}`}
        style={{ width: g.width, maxWidth: '100%', minWidth: Math.min(g.width, 520) }}
        role="img"
        aria-label={describe(state)}
      >
        {state.call[2] && ops(0, callSize)}
        {factorSize > 0 && ops(1, factorSize)}
        {pending && (
          <g className="sv-pending" style={{ transform: `translate(${g.at(1, 2).x}px, ${g.at(1, 2).y}px)` }}>
            <text className="sv-label" x={-2} y={-13}>
              {state.factorsLabel?.split(' = ')[0] ?? 'P'} = ?
            </text>
            <rect x={1} y={1} width={factorSize * g.cell - 2} height={factorSize * g.cell - 2} rx={4} />
          </g>
        )}
        {state.products.length > 0 &&
          Array.from({ length: 7 }, (_, s) => {
            if (state.products[s]) return null;
            const { x, y } = g.at(2, s);
            const size = Math.max(1, Math.floor(callSize / 2));
            return (
              <g key={`slot${s}`} className="sv-slot" style={{ transform: `translate(${x}px, ${y}px)` }}>
                <text className="sv-label" x={-2} y={-13}>
                  P{s + 1}
                </text>
                <rect x={1} y={1} width={size * g.cell - 2} height={size * g.cell - 2} rx={4} />
              </g>
            );
          })}
        {items.map(({ panel, x, y }) => (
          <Matrix key={panel.key} panel={panel} cell={g.cell} x={x} y={y} />
        ))}
      </svg>
      {state.stack.length > 0 && <Strip label="calls" items={state.stack} />}
    </div>
  );
}
