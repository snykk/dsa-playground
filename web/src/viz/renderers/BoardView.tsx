import { useId } from 'react';
import type { Frame, Role } from '../core/types';
import { Token } from '../ui/atoms/Token';
import { useTween, type Pt } from '../ui/hooks/useTween';
import { Strips, type StripData } from '../ui/molecules/Strip';
import '../ui/roles.css';
import { SYM } from '../ui/symbols';
import './BoardView.css';

/** One square of the board. */
export interface BoardCell {
  /** Text in the square: a digit, S or G. */
  text?: string;
  /** Fill role; good / bad add a check / cross in the corner. */
  role?: Role;
  /** A light tint of the role instead of a solid fill (digits the solver wrote). */
  soft?: boolean;
  /** A wall: dark and hatched. */
  wall?: boolean;
  /** A given digit of a puzzle: bold on a grey square. */
  given?: boolean;
  /** Draw a queen. */
  queen?: boolean;
  /** A small cross in the corner: this choice was already tried here and rejected. */
  tried?: boolean;
}

/** A highlighted block of squares (inclusive), such as the row, column or box a check scans. */
export interface BoardBand {
  r0: number;
  c0: number;
  r1: number;
  c1: number;
  role: Role;
}

/** A line between square centers (a scan ray). `to` may lie outside the board for an arrow. */
export interface BoardLine {
  from: [number, number];
  to: [number, number];
  role: Role;
  /** An arrow that points from `from` towards `to` (a move being tried) instead of a ray. */
  arrow?: boolean;
}

export interface BoardStackItem {
  text: string;
  role?: Role;
}

export interface BoardState {
  /** What the picture shows, for screen readers. */
  label: string;
  rows: number;
  cols: number;
  /** Row-major: cells[r][c]. */
  cells: BoardCell[][];
  /** Shade alternate squares like a chessboard. */
  checker?: boolean;
  /** Draw a thick line every `blocks` squares (3 for Sudoku). */
  blocks?: number;
  bands?: BoardBand[];
  lines?: BoardLine[];
  /** A route through square centers, in order (the rat's path). */
  path?: Array<[number, number]>;
  /** The square being worked on; it glides from step to step. */
  cursor?: { r: number; c: number; role: Role };
  /** The open recursive calls, oldest first, so the newest call is at the bottom. */
  stack: BoardStackItem[];
  stackTitle?: string;
  /** Rows the stack panel reserves; set by stabilizeBoard so the picture keeps its size. */
  stackRows?: number;
  strips?: StripData[];
}

const CS = 36;
const LABEL = 18;
const PAD = 4;
/** The stack panel lists at most this many calls; older ones collapse into one line. */
export const STACK_SHOWN = 11;

/** Give every frame the stack height of the whole run, so the picture does not jump. Call it from trace(). */
export function stabilizeBoard<S extends BoardState>(frames: Array<Frame<S>>): Array<Frame<S>> {
  const most = frames.reduce((m, f) => Math.max(m, Math.min(f.state.stack.length, STACK_SHOWN)), 1);
  return frames.map((f) => ({ ...f, state: { ...f.state, stackRows: most } }));
}

const SOLID: Role[] = ['compare', 'active', 'done', 'good', 'bad'];

/** A crown drawn around the square center (cx, cy). */
function Queen({ cx, cy }: { cx: number; cy: number }) {
  const s = CS * 0.3;
  const p = (x: number, y: number) => `${(cx + x * s).toFixed(1)},${(cy + y * s).toFixed(1)}`;
  return (
    <g className="board-queen">
      <path d={`M${p(-0.85, 0.45)} L${p(-1, -0.5)} L${p(-0.45, 0)} L${p(0, -0.75)} L${p(0.45, 0)} L${p(1, -0.5)} L${p(0.85, 0.45)} Z`} />
      <rect x={cx - 0.9 * s} y={cy + 0.55 * s} width={1.8 * s} height={0.3 * s} rx={1} />
      {[
        [-1, -0.5],
        [0, -0.75],
        [1, -0.5],
      ].map(([x, y]) => (
        <circle key={x} cx={cx + x * s} cy={cy + y * s} r={0.16 * s} />
      ))}
    </g>
  );
}

/**
 * Organism for the backtracking boards (N-Queens, Sudoku, Rat in a Maze): a grid of squares
 * with queens, digits or walls, the rows / columns / boxes a check scans, scan rays, the
 * moves being tried and the route so far, next to the call stack (Token atoms, oldest call
 * first). The cursor on the current square glides between steps.
 */
export function BoardView({ state }: { state: BoardState }) {
  const { rows, cols, cells, checker, blocks, bands = [], lines = [], path, cursor, stack, strips } = state;
  const uid = useId().replace(/:/g, '');
  const w = LABEL + cols * CS + PAD;
  const h = LABEL + rows * CS + PAD;
  const x = (c: number) => LABEL + c * CS;
  const y = (r: number) => LABEL + r * CS;
  const cx = (c: number) => x(c) + CS / 2;
  const cy = (r: number) => y(r) + CS / 2;

  const target = new Map<string, Pt>();
  if (cursor) target.set('cursor', { x: x(cursor.c), y: y(cursor.r) });
  const pos = useTween(target, 260);
  const cur = cursor ? (pos.get('cursor') ?? target.get('cursor')!) : null;

  const shown = stack.length > STACK_SHOWN ? stack.slice(stack.length - (STACK_SHOWN - 1)) : stack;
  const hidden = stack.length - shown.length;
  const reserve = state.stackRows ?? Math.min(stack.length, STACK_SHOWN);

  return (
    <div className="board-wrap">
      <div className="board-panels">
        <svg className="board" viewBox={`0 0 ${w} ${h}`} style={{ width: w, maxWidth: '100%' }} role="img" aria-label={state.label}>
          <defs>
            <pattern id={`board-hatch-${uid}`} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="6" className="board-hatch-line" />
            </pattern>
          </defs>
          {Array.from({ length: cols }, (_, c) => (
            <text key={`ci${c}`} className="board-index" x={cx(c)} y={LABEL / 2}>
              {c}
            </text>
          ))}
          {Array.from({ length: rows }, (_, r) => (
            <text key={`ri${r}`} className="board-index" x={LABEL / 2 - 1} y={cy(r)}>
              {r}
            </text>
          ))}
          {cells.flatMap((row, r) =>
            row.map((cell, c) => {
              const role = cell.role && cell.role !== 'idle' ? cell.role : undefined;
              const cls = [
                'board-cell',
                checker && (r + c) % 2 === 1 && 'dark',
                cell.given && 'given',
                cell.wall && 'wall',
                role && `role-${role}`,
                role && (cell.soft || !SOLID.includes(role) ? 'soft' : 'solid'),
              ]
                .filter(Boolean)
                .join(' ');
              return (
                <g key={`c${r}-${c}`} className={cls}>
                  <rect x={x(c) + 1} y={y(r) + 1} width={CS - 2} height={CS - 2} rx={4} />
                  {cell.wall && <rect className="board-hatch" x={x(c) + 1} y={y(r) + 1} width={CS - 2} height={CS - 2} rx={4} style={{ fill: `url(#board-hatch-${uid})` }} />}
                </g>
              );
            }),
          )}
          {bands.map((b, i) => (
            <rect
              key={`b${i}`}
              className={`board-band role-${b.role}`}
              x={x(b.c0) + 1}
              y={y(b.r0) + 1}
              width={(b.c1 - b.c0 + 1) * CS - 2}
              height={(b.r1 - b.r0 + 1) * CS - 2}
              rx={5}
            />
          ))}
          {blocks &&
            Array.from({ length: Math.floor((Math.max(rows, cols) - 1) / blocks) }, (_, k) => (k + 1) * blocks).map((at) => (
              <g key={`blk${at}`} className="board-block">
                {at < cols && <line x1={x(at)} y1={y(0)} x2={x(at)} y2={y(rows)} />}
                {at < rows && <line x1={x(0)} y1={y(at)} x2={x(cols)} y2={y(at)} />}
              </g>
            ))}
          {path && path.length > 1 && <polyline className="board-path" points={path.map(([r, c]) => `${cx(c)},${cy(r)}`).join(' ')} />}
          {lines
            .filter((l) => !l.arrow)
            .map((l, i) => (
              <g key={`l${i}`} className={`board-ray role-${l.role}`}>
                <line x1={cx(l.from[1])} y1={cy(l.from[0])} x2={cx(l.to[1])} y2={cy(l.to[0])} />
                <circle cx={cx(l.to[1])} cy={cy(l.to[0])} r={3.5} />
              </g>
            ))}
          {cells.flatMap((row, r) =>
            row.map((cell, c) => {
              const role = cell.role && cell.role !== 'idle' ? cell.role : undefined;
              const ink = role && !cell.soft && SOLID.includes(role) ? 'ink' : '';
              const glyph = role === 'good' ? SYM.check : role === 'bad' ? SYM.cross : null;
              if (!cell.text && !cell.queen && !cell.tried && !glyph) return null;
              return (
                <g key={`t${r}-${c}`} className={`board-mark ${ink}${role ? ` role-${role}` : ''}${cell.given ? ' given' : ''}`}>
                  {cell.queen && <Queen cx={cx(c)} cy={cy(r)} />}
                  {cell.text && !cell.queen && (
                    <text className="board-text" x={cx(c)} y={cy(r) + 1}>
                      {cell.text}
                    </text>
                  )}
                  {cell.tried && !cell.queen && (
                    <text className="board-tried" x={cx(c)} y={cy(r) + 1}>
                      {SYM.times}
                    </text>
                  )}
                  {glyph && (
                    <g className="board-glyph">
                      <circle cx={x(c) + CS - 6} cy={y(r) + 6} r={6.5} />
                      <text x={x(c) + CS - 6} y={y(r) + 6.5}>
                        {glyph}
                      </text>
                    </g>
                  )}
                </g>
              );
            }),
          )}
          {lines
            .filter((l) => l.arrow)
            .map((l, i) => {
              const dr = l.to[0] - l.from[0];
              const dc = l.to[1] - l.from[1];
              const len = Math.hypot(dr, dc) || 1;
              const inside = l.to[0] >= 0 && l.to[0] < rows && l.to[1] >= 0 && l.to[1] < cols;
              // An arrow into a square on the board stops inside it; one that leaves the board stops at the edge.
              const reach = inside ? 0.78 : 0.44;
              const x1 = cx(l.from[1]) + (dc / len) * CS * 0.18;
              const y1 = cy(l.from[0]) + (dr / len) * CS * 0.18;
              const x2 = cx(l.from[1]) + (dc / len) * CS * reach;
              const y2 = cy(l.from[0]) + (dr / len) * CS * reach;
              const hx = -(dr / len) * 5;
              const hy = (dc / len) * 5;
              const bx = x2 - (dc / len) * 7;
              const by = y2 - (dr / len) * 7;
              return (
                <g key={`a${i}`} className={`board-arrow role-${l.role}`}>
                  <line x1={x1} y1={y1} x2={bx} y2={by} />
                  <path d={`M${x2},${y2} L${bx + hy},${by + hx} L${bx - hy},${by - hx} Z`} />
                  {!inside && <line className="board-stop" x1={x2 + hy * 1.6} y1={y2 + hx * 1.6} x2={x2 - hy * 1.6} y2={y2 - hx * 1.6} />}
                </g>
              );
            })}
          {cursor && cur && <rect className={`board-cursor role-${cursor.role}`} x={cur.x + 2.5} y={cur.y + 2.5} width={CS - 5} height={CS - 5} rx={5} />}
        </svg>
        <div className="board-stack" style={{ minHeight: `calc(${reserve} * var(--board-stack-row) + 24px)` }}>
          <strong>{state.stackTitle ?? 'Call stack'}</strong>
          <ol aria-label="Open calls, oldest first">
            {hidden > 0 && <li className="board-stack-more">{`${SYM.ellipsis} ${hidden} older call${hidden === 1 ? '' : 's'}`}</li>}
            {shown.map((it, i) => (
              <li key={`${i}-${it.text}`}>
                <Token text={it.text} role={it.role} />
              </li>
            ))}
            {stack.length === 0 && <li className="board-stack-more">(empty)</li>}
          </ol>
        </div>
      </div>
      <Strips strips={strips} />
    </div>
  );
}
