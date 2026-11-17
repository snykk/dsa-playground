import type { MatPanelView, MatPowState } from '../algorithms/matrixPower';
import { StableStrips } from './StableStrips';
import '../ui/molecules/Strip.css';
import '../ui/roles.css';
import { SYM } from '../ui/symbols';
import './MatrixPowerView.css';

export type { MatPowState };

const PAD = 12;
const OP = 40; // room for the operator between two slots
const TITLE = 40; // two label lines above a matrix
const CELL_H = 36;
const BITS_H = 60; // the exponent's label and its row of bits

/** "A^11 = I" with the exponent raised: SVG has no <sup>, so the exponent is a shifted tspan. */
function Sup({ text }: { text: string }) {
  const parts = text.split(/(\^[^\s=]+)/);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith('^') ? (
          <tspan key={i} className="mv-exp" dy={-5}>
            {p.slice(1)}
          </tspan>
        ) : p ? (
          <tspan key={i} dy={i > 0 && parts[i - 1].startsWith('^') ? 5 : 0}>
            {p}
          </tspan>
        ) : null,
      )}
    </>
  );
}

interface Geometry {
  width: number;
  height: number;
  cell: number;
  slotW: number;
  top: number;
  bitW: number;
  slotX: (s: number) => number;
}

function geometry(state: MatPowState): Geometry {
  const L = state.layout ?? { cell: 34, rows: 2, cols: 2, slots: state.slots.length, bits: state.bits?.bits.length ?? 0 };
  const slotW = Math.max(L.cols * L.cell, 104);
  const inner = L.slots * slotW + (L.slots - 1) * OP;
  const bitW = L.bits > 24 ? 12 : 26;
  // The exponent's label (left) and note (right) share one line: leave room for both at 13px.
  const width = Math.max(inner, L.bits * bitW, (L.head ?? 0) * 7.4 + 24) + 2 * PAD;
  const top = L.bits > 0 ? BITS_H : 0;
  const height = top + TITLE + L.rows * CELL_H + 10;
  const x0 = (width - inner) / 2;
  return { width, height, cell: L.cell, slotW, top, bitW, slotX: (s) => x0 + s * (slotW + OP) };
}

/** One matrix: two label lines, its cells (role-coloured) and an outline for a whole-matrix role. */
function Matrix({ panel, g, x }: { panel: MatPanelView; g: Geometry; x: number }) {
  const rows = panel.cells.length;
  const cols = panel.cells[0]?.length ?? 0;
  const w = cols * g.cell;
  const h = rows * CELL_H;
  const left = (g.slotW - w) / 2;
  const glyph = panel.role === 'good' ? ` ${SYM.check}` : panel.role === 'bad' ? ` ${SYM.cross}` : '';
  return (
    <g className={`mv-matrix${panel.role ? ` role-${panel.role} framed` : ''}`} style={{ transform: `translate(${x}px, ${g.top}px)` }}>
      <text className="mv-title" x={g.slotW / 2} y={10}>
        {panel.title}
        {glyph && <tspan className="mv-glyph">{glyph}</tspan>}
      </text>
      {panel.sub && (
        <text className="mv-sub" x={g.slotW / 2} y={27}>
          <Sup text={panel.sub} />
        </text>
      )}
      <g style={{ transform: `translate(${left}px, ${TITLE}px)` }}>
        {panel.role && <rect className="mv-frame" x={-4} y={-4} width={w + 8} height={h + 8} rx={7} />}
        <path className="mv-bracket" d={`M6,-2 H-2 V${h + 2} H6 M${w - 6},-2 H${w + 2} V${h + 2} H${w - 6}`} />
        {panel.cells.map((row, r) =>
          row.map((v, c) => {
            const role = panel.roles?.[`${r},${c}`] ?? 'idle';
            return (
              <g key={`${r},${c}`} className={`mv-cell role-${role}`}>
                <rect x={c * g.cell + 2} y={r * CELL_H + 2} width={g.cell - 4} height={CELL_H - 4} rx={4} />
                <text x={c * g.cell + g.cell / 2} y={r * CELL_H + CELL_H / 2}>
                  {v}
                </text>
              </g>
            );
          }),
        )}
      </g>
    </g>
  );
}

function describe(state: MatPowState): string {
  const parts: string[] = [];
  if (state.bits) parts.push(`${state.bits.label}; ${state.bits.note}`);
  for (const p of state.slots) if (p) parts.push(`${p.title} ${p.sub ?? ''} = [${p.cells.map((r) => `[${r.join(', ')}]`).join(', ')}]`);
  return parts.join('; ') || 'No matrix yet';
}

/**
 * Organism for matrix exponentiation: the exponent's bits on top (consumed from the lowest one
 * up), then a row of matrix slots with operators between them. A matrix keeps its key when it
 * moves to another slot, so a returned power glides into the factor slot of its caller.
 */
export function MatrixPowerView({ state }: { state: MatPowState }) {
  const g = geometry(state);
  const items = state.slots.flatMap((p, s) => (p ? [{ panel: p, x: g.slotX(s) }] : []));
  const opY = g.top + TITLE + ((state.layout?.rows ?? 2) * CELL_H) / 2;
  const bits = state.bits;
  const bitsX = bits ? (g.width - bits.bits.length * g.bitW) / 2 : 0;
  return (
    <div className="mv-wrap">
      <div className="mv-scroll">
        <svg
          className="matrix-power-view"
          viewBox={`0 0 ${g.width} ${g.height}`}
          style={{ width: g.width, maxWidth: '100%', minWidth: Math.min(g.width, 360) }}
          role="img"
          aria-label={describe(state)}
        >
          {bits && (
            <g className="mv-bits">
              <text className="mv-bits-label" x={PAD} y={10}>
                {bits.label}
              </text>
              <text className="mv-bits-note" x={g.width - PAD} y={10}>
                {bits.note}
              </text>
              {bits.bits.map((b, i) => (
                <g key={i} className={`mv-bit role-${b.role}${b.v ? ' one' : ''}${g.bitW < 20 ? ' small' : ''}`}>
                  <rect x={bitsX + i * g.bitW + 1} y={24} width={g.bitW - 2} height={26} rx={4} />
                  <text x={bitsX + i * g.bitW + g.bitW / 2} y={37}>
                    {b.v}
                  </text>
                </g>
              ))}
            </g>
          )}
          {state.ops.map((op, s) =>
            op && state.slots[s] ? (
              <text key={`op${s}`} className="mv-op" x={g.slotX(s) + g.slotW + OP / 2} y={opY}>
                {op}
              </text>
            ) : null,
          )}
          {state.slots.map((p, s) =>
            p ? null : (
              <rect key={`slot${s}`} className="mv-slot" x={g.slotX(s) + g.slotW / 2 - 30} y={g.top + TITLE} width={60} height={(state.layout?.rows ?? 2) * CELL_H} rx={6} />
            ),
          )}
          {items.map(({ panel, x }) => (
            <Matrix key={panel.key} panel={panel} g={g} x={x} />
          ))}
        </svg>
      </div>
      {state.stack && (
        <StableStrips
          strips={[{ label: 'Call stack', items: state.stack }]}
          ghosts={state.layout?.stackGhost && [{ label: 'Call stack', items: state.layout.stackGhost }]}
        />
      )}
    </div>
  );
}
