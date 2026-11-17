import type { Role } from '../core/types';
import { glyphOf, monoW, SvgBox, SvgFrame, TextLines, type OkText } from './OptimizationKit';
import './LucasDigits.css';

export interface LucasDigitView {
  d: number;
  role?: Role;
  /** A leading zero of r, added so its digits line up with those of n. */
  pad?: boolean;
}

export interface LucasState {
  /** What the picture shows, for screen readers. */
  label: string;
  p: number;
  /** Number of base-p digit columns. */
  cols: number;
  nText: string;
  rText: string;
  /** Digits by position: index k is the digit of p^k. */
  nDigits: Array<LucasDigitView | null>;
  rDigits: LucasDigitView[];
  /** The small binomial of each column, once its call has read it. */
  results: Array<OkText | null>;
  tableTitle: string;
  tableOk: boolean;
  tableRole?: Role;
  /** fact[i] and inv_fact[i] mod p, null until filled. */
  fact: Array<string | null>;
  inv: Array<string | null>;
  factRoles: Record<number, Role>;
  invRoles: Record<number, Role>;
  /** Open calls of _lucas, the outermost first. */
  stack: Array<{ text: string; role?: Role }>;
  product: string;
  work: OkText[];
  /** Deepest stack of the run, so the picture keeps one height. */
  maxStack: number;
}

const PAD = 10;
const LABEL_W = 34;
const DH = 28;
const TW = 25;
const TH = 20;
const LINE_H = 18;

/**
 * Organism for Lucas' theorem: n and r written in base p, one column per digit (the highest on
 * the left), with each column's small binomial C(n_i, r_i) under it once a call has read it; the
 * Factorials(p - 1, p) table it reads from; and the stack of open _lucas calls, which grows by
 * one digit per call and shrinks as each call multiplies its digit into the product.
 */
export function LucasDigits({ state }: { state: LucasState }) {
  const { p, cols } = state;
  // Up to 12 columns get roomy boxes; more (n up to 10^18 in a small base) get narrower ones.
  const wide = cols <= 12;
  const CP = wide ? 52 : 40;
  const DW = wide ? 40 : 32;
  const group = Math.min(p, 13);
  const groups = Math.ceil(p / group);
  const dx0 = PAD + LABEL_W;
  const colX = (k: number) => dx0 + (cols - 1 - k) * CP;
  const digitsW = LABEL_W + cols * CP;
  const posY = 34;
  const nY = posY + 10;
  const rY = nY + DH + 8;
  const resY = rY + DH + 14;
  const tableY = resY + 2 * 13 + 22;
  const tableLabelW = 64;
  const tableW = tableLabelW + group * (TW + 2);
  const groupH = 3 * (TH + 3) + 10;
  const stackX = PAD + tableW + 26;
  // The longest frame text of the run: "_lucas(n, r) -> v" at the outermost call.
  const STACK_W = Math.max(200, monoW(`_lucas(${state.nText}, ${state.rText}) -> ${p - 1}`, 11) + 18 + 8 * Math.max(0, state.maxStack - 1));
  const width = Math.max(PAD + digitsW + PAD, stackX + STACK_W + PAD);
  const stackH = 18 + state.maxStack * LINE_H;
  const tableH = 18 + groups * groupH;
  const workY = tableY + Math.max(tableH, stackH) + 10;
  const height = workY + LINE_H + 6;

  return (
    <SvgFrame width={width} height={height} label={state.label} minWidth={520}>
      <text className="ok-title" x={PAD} y={12}>
        {`C(n, r) mod ${p}: n = ${state.nText}, r = ${state.rText}, written in base ${p}`}
      </text>
      {Array.from({ length: cols }, (_, k) => (
        <text key={`pos${k}`} className="ok-head" x={colX(k) + DW / 2} y={posY}>
          {`${p}^${k}`}
        </text>
      ))}
      <text className="lu-rowlabel" x={dx0 - 8} y={nY + DH / 2}>
        n
      </text>
      <text className="lu-rowlabel" x={dx0 - 8} y={rY + DH / 2}>
        r
      </text>
      {state.nDigits.map((d, k) => (d ? <SvgBox key={`n${k}`} x={colX(k)} y={nY} w={DW} h={DH} text={d.d} role={d.role} size={14} /> : null))}
      {state.rDigits.map((d, k) => (
        <SvgBox key={`r${k}`} x={colX(k)} y={rY} w={DW} h={DH} text={d.d} role={d.role} ghost={d.pad && !d.role} size={14} />
      ))}
      {state.results.map((res, k) => {
        if (!res) return null;
        const [head, tail] = res.text.split('=');
        const glyph = glyphOf(res.role);
        return (
          <g key={`res${k}`} className={`lu-result role-${res.role ?? 'idle'}${wide ? '' : ' narrow'}`}>
            <text x={colX(k) + DW / 2} y={resY}>
              {head}
            </text>
            <text x={colX(k) + DW / 2} y={resY + 13}>
              {`= ${tail}${glyph ? ` ${glyph}` : ''}`}
            </text>
          </g>
        );
      })}

      <text className={`ok-title lu-table-title${state.tableRole ? ` role-${state.tableRole}` : ''}`} x={PAD} y={tableY}>
        {`${state.tableTitle}${state.tableRole === 'bad' ? ` ${glyphOf('bad')}` : state.tableRole === 'good' ? ` ${glyphOf('good')}` : ''}`}
      </text>
      {!state.tableOk && (
        <text className="lu-none" x={PAD} y={tableY + 22}>
          Not drawn: lucas_nCr only reads a Factorials(p - 1, p) built for the same prime.
        </text>
      )}
      {state.tableOk &&
        Array.from({ length: groups }, (_, g) => {
          const y0 = tableY + 12 + g * groupH;
          const idx = Array.from({ length: Math.min(group, p - g * group) }, (_, k) => g * group + k);
          return (
            <g key={`g${g}`}>
              <text className="lu-tlabel" x={PAD + tableLabelW - 6} y={y0 + TH / 2}>
                i
              </text>
              <text className="lu-tlabel" x={PAD + tableLabelW - 6} y={y0 + TH + 3 + TH / 2}>
                fact
              </text>
              <text className="lu-tlabel" x={PAD + tableLabelW - 6} y={y0 + 2 * (TH + 3) + TH / 2}>
                inv_fact
              </text>
              {idx.map((i, k) => {
                const x = PAD + tableLabelW + k * (TW + 2);
                return (
                  <g key={i}>
                    <text className="ok-head lu-index" x={x + TW / 2} y={y0 + TH / 2}>
                      {i}
                    </text>
                    <SvgBox x={x} y={y0 + TH + 3} w={TW} h={TH} text={state.fact[i] ?? '1'} role={state.factRoles[i]} ghost={state.fact[i] === null} size={11} />
                    <SvgBox x={x} y={y0 + 2 * (TH + 3)} w={TW} h={TH} text={state.inv[i] ?? '1'} role={state.invRoles[i]} ghost={state.inv[i] === null} size={11} />
                  </g>
                );
              })}
            </g>
          );
        })}
      <text className="ok-title" x={stackX} y={tableY}>
        open calls of _lucas
      </text>
      {state.stack.length === 0 && (
        <text className="lu-none" x={stackX} y={tableY + 18}>
          (none)
        </text>
      )}
      {state.stack.map((s, k) => (
        <g key={`s${k}`} className={`lu-frame role-${s.role ?? 'idle'}`}>
          <rect x={stackX + k * 8} y={tableY + 10 + k * LINE_H} width={STACK_W - k * 8} height={LINE_H - 2} rx={4} />
          <text x={stackX + k * 8 + 6} y={tableY + 10 + k * LINE_H + (LINE_H - 2) / 2}>
            {s.text}
          </text>
        </g>
      ))}
      <TextLines x={PAD} y={workY} lines={state.work.length ? state.work : state.product ? [{ text: `running product: ${state.product}` }] : []} />
    </SvgFrame>
  );
}
