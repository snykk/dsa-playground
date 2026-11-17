import type { Role } from '../core/types';
import { glyphOf, monoW, SvgFrame } from './OptimizationKit';
import './IoStream.css';

export interface IoByteView {
  ch: string;
  role?: Role;
}

/** The bytes of one token, on one line: columns c1..c2. */
export interface IoSpanView {
  line: number;
  c1: number;
  c2: number;
  role?: Role;
}

export interface IoTokenView {
  text: string;
  role?: Role;
}

export interface IoStreamState {
  /** What the picture shows, for screen readers. */
  label: string;
  /** stdin, one row per line; each line keeps its line break. */
  lines: Array<{ bytes: IoByteView[] }>;
  spans: IoSpanView[];
  /** [line, column] of the next byte sys.stdin will return, or null at the end. */
  cursor: [number, number] | null;
  /** The bytes the last call returned: first and last [line, column]; null ends for an empty read. */
  window: { from: [number, number] | null; to: [number, number] | null } | null;
  /** The end-of-input marker: bad once a read found nothing left. */
  eofRole?: Role;
  bufferTitle: string;
  buffer: IoTokenView[];
  /** Where the reader's index points into the buffer. */
  bufferIndex: number | null;
  pendingTitle: string;
  pending: IoTokenView[];
  /** Every sys.stdout.write call so far, with its text. */
  writes: IoTokenView[];
  counters: Array<{ label: string; value: number; role?: Role }>;
  /** The program's variables. */
  values: string[];
  baseline: string;
  maxLines: number;
  maxTokens: number;
  maxWrites: number;
  /** The most variables any frame of the run shows, so the picture keeps one height. */
  maxValues: number;
}

const PAD = 10;
const BW = 18;
const BH = 20;
const ROW = 27;
const TOP = 34;
const NUM_W = 20;
const RIGHT_W = 300;
const CHIP_H = 20;
const LINE_H = 17;

const shown = (ch: string) => (ch === '\n' ? '\\n' : ch === ' ' ? String.fromCodePoint(0xb7) : ch);

/**
 * Organism for fast I/O: the input bytes line by line (a dot for a space, \n for a line break,
 * EOF after the last line), the window of bytes the last call returned, the tokens cut from them
 * underlined, and the reading position. On the right: how many calls went into sys.stdin and
 * sys.stdout, the program's variables, the reader's buffer with its index, the answers waiting
 * to be written and every write call.
 */
export function IoStream({ state }: { state: IoStreamState }) {
  const rowsShown = state.maxLines + 1;
  // The input never changes during a run, so its longest line fixes the width.
  const maxCols = Math.max(8, ...state.lines.map((l) => l.bytes.length));
  const leftW = NUM_W + maxCols * BW + 8;
  const rx = PAD + leftW + 18;
  const width = rx + RIGHT_W + PAD;
  const byteX = (c: number) => PAD + NUM_W + c * BW;
  const rowY = (l: number) => TOP + l * ROW;
  const eofLine = state.lines.length;
  const chipW = (t: string) => Math.max(26, monoW(t, 11) + 12);

  // Right column, top to bottom.
  const countersY = TOP;
  const valuesY = countersY + 60;
  const bufY = valuesY + Math.max(state.values.length, state.maxValues) * LINE_H + 16;
  const perRow = 6;
  const bufRows = Math.max(1, Math.ceil(state.maxTokens / perRow));
  const pendY = bufY + 18 + bufRows * (CHIP_H + 6) + 4;
  const outY = pendY + (state.pendingTitle ? 18 + CHIP_H + 10 : 0);
  const rightH = outY + 18 + state.maxWrites * LINE_H + 6;
  const leftH = rowY(rowsShown) + 6;
  const height = Math.max(leftH, rightH, 200);

  const chipsAt = (items: IoTokenView[], x0: number, y0: number, index: number | null) => {
    let x = x0;
    let y = y0;
    let col = 0;
    return items.map((it, k) => {
      const w = chipW(it.text);
      if (col === perRow || x + w > x0 + RIGHT_W) {
        x = x0;
        y += CHIP_H + 6;
        col = 0;
      }
      const role = it.role ?? 'idle';
      const g = (
        <g key={k} className={`io-chip role-${role}`}>
          <rect x={x} y={y} width={w} height={CHIP_H} rx={5} />
          <text x={x + w / 2} y={y + CHIP_H / 2}>
            {it.text}
          </text>
          {index === k && <path className="io-index" d={`M${x + w / 2 - 5},${y + CHIP_H + 7} l5,-5 l5,5 z`} />}
        </g>
      );
      x += w + 4;
      col += 1;
      return g;
    });
  };

  const win = state.window;
  let windowRect: { x: number; y: number; w: number; h: number } | null = null;
  if (win && win.from && win.to) {
    const [l1, c1] = win.from;
    const [l2, c2] = win.to;
    if (l1 === l2) windowRect = { x: byteX(c1) - 3, y: rowY(l1) - 3, w: (c2 - c1 + 1) * BW + 4, h: BH + 6 };
    else {
      const maxCol = Math.max(...state.lines.slice(l1, l2 + 1).map((ln) => ln.bytes.length));
      windowRect = { x: byteX(0) - 3, y: rowY(l1) - 3, w: maxCol * BW + 4, h: rowY(l2) - rowY(l1) + BH + 6 };
    }
  } else if (win) {
    windowRect = { x: byteX(0) - 3, y: rowY(eofLine) - 3, w: 3 * BW + 4, h: BH + 6 };
  }
  const caret = state.cursor ?? [eofLine, 0];

  return (
    <SvgFrame width={width} height={height} label={state.label} minWidth={560}>
      <text className="ok-title" x={PAD} y={12}>
        {`stdin: ${state.lines.reduce((s, l) => s + l.bytes.length, 0)} bytes, ${state.lines.length} line${state.lines.length === 1 ? '' : 's'}`}
      </text>
      {windowRect && <rect className="io-window" style={{ x: windowRect.x, y: windowRect.y, width: windowRect.w, height: windowRect.h }} rx={7} />}
      {state.lines.map((ln, l) => (
        <g key={`l${l}`}>
          <text className="ok-head" x={PAD + NUM_W - 8} y={rowY(l) + BH / 2} style={{ textAnchor: 'end' }}>
            {l + 1}
          </text>
          {ln.bytes.map((b, c) => {
            const role = b.role ?? 'idle';
            return (
              <g key={c} className={`io-byte role-${role}${b.ch === '\n' || b.ch === ' ' ? ' blank' : ''}`}>
                <rect x={byteX(c) + 1} y={rowY(l)} width={BW - 2} height={BH} rx={3} />
                <text x={byteX(c) + BW / 2} y={rowY(l) + BH / 2}>
                  {shown(b.ch)}
                </text>
              </g>
            );
          })}
        </g>
      ))}
      <g className={`io-eof role-${state.eofRole ?? 'idle'}`}>
        <rect x={byteX(0) + 1} y={rowY(eofLine)} width={3 * BW - 2} height={BH} rx={3} />
        <text x={byteX(0) + 1.5 * BW} y={rowY(eofLine) + BH / 2}>
          {`EOF${state.eofRole === 'bad' ? ` ${glyphOf('bad')}` : ''}`}
        </text>
      </g>
      {state.spans.map((sp, k) => (
        <line key={`s${k}`} className={`io-span role-${sp.role ?? 'idle'}`} x1={byteX(sp.c1) + 2} x2={byteX(sp.c2 + 1) - 2} y1={rowY(sp.line) + BH + 3} y2={rowY(sp.line) + BH + 3} />
      ))}
      <path className="io-caret" style={{ transform: `translate(${byteX(caret[1]) + BW / 2}px, ${rowY(caret[0]) - 2}px)` }} d="M-5,-7 L5,-7 L0,0 z" />

      {state.counters.map((c, k) => (
        <g key={`c${k}`} className={`io-counter role-${c.role ?? 'idle'}`}>
          <rect x={rx + k * (RIGHT_W / 2 + 2)} y={countersY - 8} width={RIGHT_W / 2 - 4} height={40} rx={7} />
          <text className="io-count" x={rx + k * (RIGHT_W / 2 + 2) + 10} y={countersY + 5}>
            {c.value}
          </text>
          <text className="io-count-label" x={rx + k * (RIGHT_W / 2 + 2) + 10} y={countersY + 22}>
            {c.label}
          </text>
        </g>
      ))}
      <text className="io-baseline" x={rx} y={countersY + 44}>
        {state.baseline}
      </text>
      {state.values.map((v, k) => (
        <text key={`v${k}`} className={`io-value${v.endsWith('?') ? ' unset' : ''}`} x={rx} y={valuesY + 6 + k * LINE_H}>
          {v}
        </text>
      ))}
      <text className="ok-title" x={rx} y={bufY}>
        {state.bufferTitle}
      </text>
      {chipsAt(state.buffer, rx, bufY + 10, state.bufferIndex)}
      {state.pendingTitle && (
        <>
          <text className="ok-title" x={rx} y={pendY}>
            {state.pendingTitle}
          </text>
          {state.pending.length === 0 ? (
            <text className="io-none" x={rx} y={pendY + 10 + CHIP_H / 2}>
              (empty)
            </text>
          ) : (
            chipsAt(state.pending, rx, pendY + 10, null)
          )}
        </>
      )}
      <text className="ok-title" x={rx} y={outY}>
        sys.stdout.write calls
      </text>
      {state.writes.length === 0 && (
        <text className="io-none" x={rx} y={outY + 16}>
          (none yet)
        </text>
      )}
      {state.writes.map((w, k) => (
        <text key={`w${k}`} className={`io-write role-${w.role ?? 'idle'}`} x={rx} y={outY + 16 + k * LINE_H}>
          {`${k + 1}: write(${w.text})`}
        </text>
      ))}
    </SvgFrame>
  );
}
