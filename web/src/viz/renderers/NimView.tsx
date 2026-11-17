import type { NimState } from '../algorithms/gameTheory';
import '../ui/roles.css';
import { SYM } from '../ui/symbols';
import './NimView.css';

export type { NimState };

const PAD = 8;
const LABEL_W = 80;
const STONE = 11; // stone pitch
const ROW_H = 30;
const BIT = 26;
const HEAD = 22;

/**
 * Organism for Nim: one row per pile with its stones and its size in binary, and the XOR of the
 * columns underneath. The winning move crosses out the stones it takes; the bits show why the
 * XOR becomes 0.
 */
export function NimView({ state }: { state: NimState }) {
  const maxPile = Math.max(8, state.maxPile ?? 0, ...state.rows.map((r) => r.size + r.removed));
  const stonesW = maxPile * STONE + 10;
  const sizeX = PAD + LABEL_W + stonesW;
  const bitsX = sizeX + 40;
  const noteX = bitsX + state.width * BIT + 14;
  const width = noteX + 196;
  const xorY = HEAD + state.rows.length * ROW_H + 12;
  const height = xorY + ROW_H + 8;
  const glyph = state.status === 'good' ? SYM.check : state.status === 'bad' ? SYM.cross : '';
  const describe = `${state.rows.map((r) => `${r.label}: ${r.size}`).join(', ')}; ${state.xor.label} ${state.xor.value}`;
  return (
    <div className="nim-scroll">
      <svg className="nim-view" viewBox={`0 0 ${width} ${height}`} style={{ width, maxWidth: '100%', minWidth: 440 }} role="img" aria-label={describe}>
        {Array.from({ length: state.width }, (_, i) => (
          <text key={`h${i}`} className="nim-head" x={bitsX + i * BIT + BIT / 2} y={10}>
            {2 ** (state.width - 1 - i)}
          </text>
        ))}
        <text className="nim-head" x={sizeX + 16} y={10}>
          size
        </text>
        {state.rows.map((row, r) => {
          const y = HEAD + r * ROW_H;
          return (
            <g key={r} className={`nim-row role-${row.role}`}>
              <rect className="nim-band" x={PAD} y={y - 2} width={noteX - PAD - 6} height={ROW_H - 4} rx={6} />
              <text className="nim-label" x={PAD + LABEL_W - 8} y={y + ROW_H / 2 - 2}>
                {row.label}
                {row.role === 'good' ? ` ${SYM.check}` : row.role === 'bad' ? ` ${SYM.cross}` : ''}
              </text>
              {Array.from({ length: row.size + row.removed }, (_, k) => (
                <circle key={k} className={`nim-stone${k >= row.size ? ' taken' : ''}`} cx={PAD + LABEL_W + 6 + k * STONE} cy={y + ROW_H / 2 - 2} r={4.4} />
              ))}
              <text className="nim-size" x={sizeX + 16} y={y + ROW_H / 2 - 2}>
                {row.size}
              </text>
              {row.bits.map((b, i) => (
                <g key={i} className={`nim-bit${b ? ' one' : ''} role-${row.bitRoles?.[i] ?? 'idle'}`}>
                  <rect x={bitsX + i * BIT + 1} y={y + 1} width={BIT - 2} height={ROW_H - 8} rx={4} />
                  <text x={bitsX + i * BIT + BIT / 2} y={y + ROW_H / 2 - 2}>
                    {b}
                  </text>
                </g>
              ))}
              {row.note && (
                <text className="nim-note" x={noteX} y={y + ROW_H / 2 - 2}>
                  {row.note}
                </text>
              )}
            </g>
          );
        })}
        <line className="nim-rule" x1={bitsX - 4} y1={xorY - 6} x2={bitsX + state.width * BIT + 4} y2={xorY - 6} />
        <g className={`nim-row nim-xor role-${state.xor.role}`}>
          <rect className="nim-band" x={PAD} y={xorY - 2} width={noteX - PAD - 6} height={ROW_H - 4} rx={6} />
          <text className="nim-label" x={PAD + LABEL_W - 8} y={xorY + ROW_H / 2 - 2}>
            {state.xor.label}
          </text>
          <text className="nim-size" x={sizeX + 16} y={xorY + ROW_H / 2 - 2}>
            {state.xor.value}
          </text>
          {state.xor.bits.map((b, i) => (
            <g key={i} className={`nim-bit${b ? ' one' : ''} role-${state.xor.bitRoles?.[i] ?? 'idle'}`}>
              <rect x={bitsX + i * BIT + 1} y={xorY + 1} width={BIT - 2} height={ROW_H - 8} rx={4} />
              <text x={bitsX + i * BIT + BIT / 2} y={xorY + ROW_H / 2 - 2}>
                {b}
              </text>
            </g>
          ))}
          {glyph && (
            <text className="nim-verdict" x={noteX} y={xorY + ROW_H / 2 - 2}>
              {state.status === 'good' ? `${glyph} the opponent faces XOR 0` : `${glyph} XOR 0: a lost position`}
            </text>
          )}
        </g>
      </svg>
    </div>
  );
}
