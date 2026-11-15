import type { Role } from '../core/types';
import { Strip } from '../ui/molecules/Strip';
import '../ui/molecules/Strip.css';
import '../ui/roles.css';
import { SYM } from '../ui/symbols';
import './FieldBits.css';

export interface BitView {
  /** Stable identity: a bit keeps its id when its row shifts, so it glides one place. */
  id: string;
  /** Bit position: the coefficient of x^pos. */
  pos: number;
  v: 0 | 1;
  role?: Role;
}

export interface BitRowView {
  key: string;
  label: string;
  /** 8 bits, or 9 when bit 8 matters (a shifted multiplicand, the field polynomial). */
  width: 8 | 9;
  bits: BitView[];
  /** The value as text, right of the bits ("0x53 (83)"). */
  value: string;
  muted?: boolean;
}

/** A byte on the ring of powers: position = log_table[byte]. */
export interface RingMark {
  at: number;
  label: string;
  role: Role;
}

/** A walk around the ring in exponent steps (negative = backwards); `ring` 0 is the outer lane. */
export interface RingArc {
  from: number;
  len: number;
  role: Role;
  ring: number;
}

export interface FieldState {
  rows: BitRowView[];
  ring: { marks: RingMark[]; arcs: RingArc[]; center: string[] };
  /** Table lookups so far for this operation ("log[0x53] = 48"). */
  lookups: Array<{ text: string; role?: Role }>;
  ops: Array<{ text: string; role?: Role }>;
}

const LABEL_X = 64;
const BX = 74;
const BP = 26;
const BW = 23;
const BH = 26;
const ROW0 = 24;
const ROW_P = 34;
const ROWS = 4;
const CX = 540;
const CY = 128;
const RR = 92;
const WIDTH = 684;
const HEIGHT = 264;
const N = 255;

const bitX = (pos: number) => BX + (8 - pos) * BP;
const angle = (i: number) => -Math.PI / 2 + (2 * Math.PI * i) / N;
const onRing = (i: number, r: number) => ({ x: CX + r * Math.cos(angle(i)), y: CY + r * Math.sin(angle(i)) });

function arcPath(a: RingArc, r: number): string {
  const len = Math.max(-N, Math.min(N, a.len));
  if (Math.abs(len) >= N - 0.01) {
    // A full turn (inv of 1): two half circles.
    const p = onRing(a.from, r);
    const q = onRing(a.from + N / 2, r);
    return `M${p.x.toFixed(1)},${p.y.toFixed(1)} A${r},${r} 0 1 1 ${q.x.toFixed(1)},${q.y.toFixed(1)} A${r},${r} 0 1 1 ${p.x.toFixed(1)},${p.y.toFixed(1)}`;
  }
  const p = onRing(a.from, r);
  const q = onRing(a.from + len, r);
  const large = Math.abs(len) > N / 2 ? 1 : 0;
  const sweep = len > 0 ? 1 : 0;
  return `M${p.x.toFixed(1)},${p.y.toFixed(1)} A${r},${r} 0 ${large} ${sweep} ${q.x.toFixed(1)},${q.y.toFixed(1)}`;
}

/**
 * Organism for GF(2^8): up to four bytes as rows of bits (bit 8 on the left, bit 0 on the right),
 * so XOR, shifts and the reduction by 0x11B happen in place and shifted bits glide; beside them
 * the ring of the 255 powers of the generator, where a table lookup is a walk: mul adds the two
 * walks, div walks back, inv completes the turn, pow repeats the walk.
 */
export function FieldBits({ state }: { state: FieldState }) {
  const { ring } = state;
  const seen = new Map<number, number>();
  const marks = ring.marks.map((m) => {
    const stack = seen.get(m.at) ?? 0;
    seen.set(m.at, stack + 1);
    return { ...m, stack };
  });
  const ticks = Array.from({ length: 17 }, (_, k) => k * 15);
  const describe = `${state.rows.map((r) => `${r.label} = ${r.value}`).join(', ')}; ring: ${ring.marks.map((m) => `${m.label} at ${m.at}`).join(', ') || 'no marks'}`;

  return (
    <div className="fb-wrap">
      <div className="fb-scroll">
        <svg className="field-bits" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} style={{ width: WIDTH, maxWidth: '100%', minWidth: 480 }} role="img" aria-label={describe}>
          {Array.from({ length: 9 }, (_, k) => 8 - k).map((p) => (
            <text key={`h${p}`} className="fb-head" x={bitX(p) + BW / 2} y={10}>
              {p === 0 ? '1' : p === 1 ? 'x' : `x^${p}`}
            </text>
          ))}
          {state.rows.map((row, r) => {
            const status = row.bits.some((b) => b.role === 'bad') ? 'bad' : row.bits.some((b) => b.role === 'good') ? 'good' : undefined;
            return (
              <g key={`l${row.key}`} className={`fb-rowtext${row.muted ? ' muted' : ''}${status ? ` role-${status}` : ''}`}>
                <text className="fb-label" x={LABEL_X} y={ROW0 + r * ROW_P + BH / 2}>
                  {row.label}
                </text>
                <text className="fb-value" x={BX + 9 * BP + 6} y={ROW0 + r * ROW_P + BH / 2}>
                  {row.value}
                  {status && <tspan className="fb-glyph">{` ${status === 'good' ? SYM.check : SYM.cross}`}</tspan>}
                </text>
              </g>
            );
          })}
          {state.rows.flatMap((row, r) =>
            row.bits.map((b) => {
              const role = b.role ?? 'idle';
              return (
                <g
                  key={b.id}
                  className={`fb-bit role-${role}${b.v ? ' one' : ''}${row.muted ? ' muted' : ''}`}
                  style={{ transform: `translate(${bitX(b.pos)}px, ${ROW0 + r * ROW_P}px)` }}
                >
                  <rect width={BW} height={BH} rx={5} />
                  <text x={BW / 2} y={BH / 2}>
                    {b.v}
                  </text>
                </g>
              );
            }),
          )}
          {state.lookups.map((l, k) => (
            <text key={`k${k}`} className={`fb-lookup${l.role ? ` role-${l.role}` : ''}`} x={BX} y={ROW0 + ROWS * ROW_P + 12 + k * 17}>
              {l.text}
            </text>
          ))}

          <circle className="fb-track" cx={CX} cy={CY} r={RR} />
          {ticks.map((t) => {
            const a = onRing(t, RR - 4);
            const b = onRing(t, RR + 4);
            return <line key={`t${t}`} className="fb-tick" x1={a.x} y1={a.y} x2={b.x} y2={b.y} />;
          })}
          {[0, 64, 128, 192].map((t) => {
            const p = onRing(t, RR - 16);
            return (
              <text key={`tl${t}`} className="fb-ticklabel" x={p.x} y={p.y}>
                {t}
              </text>
            );
          })}
          {ring.arcs.map((a, k) =>
            a.len === 0 ? null : (
              <g key={`a${k}`} className={`fb-arc role-${a.role}`}>
                <path d={arcPath(a, RR - 26 - 9 * a.ring)} />
                <circle cx={onRing(a.from + a.len, RR - 26 - 9 * a.ring).x} cy={onRing(a.from + a.len, RR - 26 - 9 * a.ring).y} r={3.5} />
              </g>
            ),
          )}
          {ring.center.map((line, k) => (
            <text key={`c${k}`} className="fb-center" x={CX} y={CY - ((ring.center.length - 1) * 15) / 2 + k * 15}>
              {line}
            </text>
          ))}
          {marks.map((m, k) => {
            const p = onRing(m.at, RR);
            const lr = RR + 14 + m.stack * 14;
            const q = onRing(m.at, lr);
            const c = Math.cos(angle(m.at));
            const anchor = c > 0.3 ? 'start' : c < -0.3 ? 'end' : 'middle';
            const glyph = m.role === 'good' ? SYM.check : m.role === 'bad' ? SYM.cross : '';
            return (
              <g key={`m${k}`} className={`fb-mark role-${m.role}`}>
                <circle cx={p.x} cy={p.y} r={6} />
                <text x={q.x} y={q.y} style={{ textAnchor: anchor }}>
                  {m.label}
                  {glyph && ` ${glyph}`}
                </text>
              </g>
            );
          })}
          <text className="fb-ringnote" x={CX} y={CY + RR + 34}>
            position i holds 3^i; 3^0 = 3^255 = 1 at the top
          </text>
        </svg>
      </div>
      <Strip label="Operations" items={state.ops} />
    </div>
  );
}
