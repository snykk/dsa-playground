/**
 * N-Queens tracer, drawn with BoardView: the board beside the open recursive calls.
 *
 * Mirrors Algorithms/Advanced_Algorithms/Backtracking/N_Queens_Problem/Python/n_queens.py:
 * solve_n_queens(n, find_all=False) -> solve_n_queens_util(board, row, n, solutions, find_all)
 * and is_safe(board, row, col, n).
 * - One call per row; it tries the columns 0..n-1 in order and places a queen on the first
 *   square is_safe accepts, then recurses into row + 1.
 * - is_safe looks only upward: the column above (i = 0..row-1), then the upper-left diagonal,
 *   then the upper-right diagonal, and returns False at the first queen it meets.
 * - A call that returns False makes its caller lift its queen (board[row][col] = 0) and try the
 *   next column. row == n saves a copy of the board and returns `not find_all`, so the first
 *   solution stops the search unless every solution is wanted.
 * Golden fixtures (__fixtures__/backtracking.json) pin every is_safe call and its answer, every
 * write to the board and the solutions.
 *
 * Input: "n 4" (first solution, the Python default) or "n 4, all" (find_all=True).
 */
import { InputError, type Frame, type Role } from '../core/types';
import type { BoardBand, BoardCell, BoardLine, BoardStackItem, BoardState } from '../renderers/BoardView';
import { MAX_FRAMES, countSteps, tooLong, type StepCounter } from './backtracking';

export interface QueensInput {
  n: number;
  findAll: boolean;
}

/** ['check', row, col, is_safe's answer] or ['set', row, col, value written]. */
export type QueensEvent = ['check', number, number, boolean] | ['set', number, number, number];

export interface QueensResult {
  /** Each solution as the queen's column in every row (the boards Python returns, compressed). */
  solutions: number[][];
  events: QueensEvent[];
}

export interface QueensRun extends QueensResult {
  frames: Array<Frame<BoardState>>;
}

export const QUEENS_LIMITS = { minN: 1, maxN: 8 };

export const QUEENS_CODE = [
  'solve_n_queens(n, find_all=False):',
  '  board = n x n zeros; solutions = []; solve_n_queens_util(board, 0, ...); return solutions',
  'solve_n_queens_util(board, row, n, solutions, find_all):',
  '  if row == n:',
  '    solutions.append([r[:] for r in board])',
  '    return not find_all            # True stops the whole search',
  '  for col in range(n):',
  '    if is_safe(board, row, col, n):',
  '      board[row][col] = 1',
  '      if solve_n_queens_util(board, row + 1, n, solutions, find_all):',
  '        return True',
  '      board[row][col] = 0          # backtrack',
  '  return False',
  'is_safe(board, row, col, n):',
  '  for i in range(row): queen at (i, col)? return False          # column above',
  '  (row-1, col-1), (row-2, col-2), ...: queen? return False      # upper-left',
  '  (row-1, col+1), (row-2, col+2), ...: queen? return False      # upper-right',
  '  return True',
];

const L = { start: 1, base: 3, save: 4, loop: 6, place: 8, backtrack: 11, fail: 12, column: 14, upLeft: 15, upRight: 16, safe: 17, done: 1 };

/** "n 4", "4", "n = 6, all", "n 5 first", "8 find_all". */
export function parseQueens(text: string): QueensInput {
  const tokens = text
    .toLowerCase()
    .split(/[\s,;=:]+/)
    .filter(Boolean);
  let n: number | undefined;
  let findAll: boolean | undefined;
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (t === 'n') continue;
    if (/^-?\d+$/.test(t)) {
      if (n !== undefined) throw new InputError('Give n only once, as in "n 6".');
      n = Number(t);
    } else if (t === 'all' || t === 'find_all' || t === 'true') {
      findAll = true;
    } else if (t === 'first' || t === 'false') {
      findAll = false;
    } else {
      throw new InputError(`Cannot read "${t}". Write the board size, as in "n 6", and add "all" to collect every solution.`);
    }
  }
  if (n === undefined) throw new InputError('Give the board size, as in "n 4".');
  if (n < QUEENS_LIMITS.minN || n > QUEENS_LIMITS.maxN) {
    throw new InputError(`n goes from ${QUEENS_LIMITS.minN} to ${QUEENS_LIMITS.maxN} here, so the board stays readable (got ${n}).`);
  }
  const input = { n, findAll: findAll ?? false };
  const steps = countSteps((counter) => queensTrace(input, counter));
  if (steps > MAX_FRAMES) {
    throw tooLong(steps, `${n}-Queens with ${input.findAll ? 'all solutions' : 'the first solution'}`, input.findAll ? 'Collect every solution for n up to 6, or drop "all" to stop at the first one.' : 'Try a smaller n.');
  }
  return input;
}

export function formatQueens(input: QueensInput): string {
  return `n ${input.n}${input.findAll ? ', all' : ''}`;
}

interface Call {
  row: number;
  /** The column the loop is on, or null before the loop starts. */
  col: number | null;
  /** Columns of this row already tried and rejected. */
  tried: Set<number>;
  /** The queen being lifted, for the one step that shows it. */
  lifting?: boolean;
}

interface SnapOpts {
  cursor?: { r: number; c: number; role: Role };
  cells?: Record<string, Role>;
  lines?: BoardLine[];
  bands?: BoardBand[];
  top?: Role;
  vars?: Array<[string, string | number]>;
}

/**
 * The search as solve_n_queens runs it. With a counter, only the steps are counted (no
 * pictures), which is how the parser measures an input.
 */
export function queensTrace(input: QueensInput, counter?: StepCounter): QueensRun {
  const { n, findAll } = input;
  const board: number[][] = Array.from({ length: n }, () => Array<number>(n).fill(0));
  const solutions: number[][] = [];
  const events: QueensEvent[] = [];
  const frames: Array<Frame<BoardState>> = [];
  const calls: Call[] = [];
  let checks = 0;
  const pyBool = findAll ? 'True' : 'False';

  const stackItems = (top?: Role): BoardStackItem[] =>
    calls.map((call, k) => {
      const text =
        call.row === n
          ? `row ${n}: all ${n} placed`
          : call.col === null
            ? `row ${call.row}`
            : call.lifting
              ? `row ${call.row}: lift ${call.col}`
              : board[call.row][call.col] === 1
                ? `row ${call.row}: queen at ${call.col}`
                : `row ${call.row}: col ${call.col}?`;
      return { text, role: k === calls.length - 1 ? (top ?? 'active') : undefined };
    });

  const snap = (line: number, caption: string, o: SnapOpts = {}) => {
    if (counter) {
      counter.tick();
      return;
    }
    const tried = new Map(calls.map((c) => [c.row, c.tried]));
    const cells: BoardCell[][] = board.map((rowCells, r) =>
      rowCells.map((v, c): BoardCell => {
        const role = o.cells?.[`${r},${c}`];
        if (v === 1) return { queen: true, role: role ?? 'done' };
        return { role, tried: tried.get(r)?.has(c) ?? false };
      }),
    );
    // A queen being lifted is drawn as an outline for one step.
    for (const [key, role] of Object.entries(o.cells ?? {})) {
      const [r, c] = key.split(',').map(Number);
      if (role === 'muted' && board[r][c] === 0) cells[r][c] = { queen: true, role: 'muted' };
    }
    frames.push({
      line,
      caption,
      vars: [...(o.vars ?? []), ['find_all', pyBool], ['is_safe calls', checks], ['solutions', solutions.length]],
      state: {
        label: `${n} by ${n} board with ${board.flat().filter((v) => v === 1).length} queens`,
        rows: n,
        cols: n,
        cells,
        checker: true,
        bands: o.bands,
        lines: o.lines,
        cursor: o.cursor,
        stack: stackItems(o.top),
        strips: [{ label: 'Solutions (column of each row)', items: solutions.length ? solutions.map((s) => ({ text: `[${s.join(', ')}]` })) : [{ text: 'none yet' }] }],
      },
    });
  };

  /** is_safe as the Python code runs it, with the rays it scanned for the picture. */
  const isSafe = (row: number, col: number) => {
    checks += 1;
    const lines: BoardLine[] = [];
    let hit: [number, number] | null = null;
    let where: 'column' | 'upper-left diagonal' | 'upper-right diagonal' | null = null;
    for (let i = 0; i < row; i++) {
      if (board[i][col] === 1) {
        hit = [i, col];
        where = 'column';
        break;
      }
    }
    if (row > 0) lines.push({ from: [row, col], to: hit ?? [0, col], role: hit ? 'bad' : 'compare' });
    const diagonal = (dc: number, name: 'upper-left diagonal' | 'upper-right diagonal') => {
      if (hit) return;
      let i = row - 1;
      let j = col + dc;
      let last: [number, number] | null = null;
      while (i >= 0 && j >= 0 && j < n) {
        last = [i, j];
        if (board[i][j] === 1) {
          hit = [i, j];
          where = name;
          break;
        }
        i -= 1;
        j += dc;
      }
      if (last) lines.push({ from: [row, col], to: last, role: hit ? 'bad' : 'compare' });
    };
    diagonal(-1, 'upper-left diagonal');
    diagonal(1, 'upper-right diagonal');
    const safe = hit === null;
    events.push(['check', row, col, safe]);
    return { safe, hit: hit as [number, number] | null, where, lines };
  };

  /** solve_n_queens_util: returns True when the search should stop. */
  const solve = (row: number): boolean => {
    const call: Call = { row, col: null, tried: new Set() };
    calls.push(call);
    if (row === n) {
      const sol = board.map((r) => r.indexOf(1));
      solutions.push(sol);
      const queens: Record<string, Role> = {};
      sol.forEach((c, r) => (queens[`${r},${c}`] = 'good'));
      snap(
        L.save,
        findAll
          ? `row == ${n}: every row holds a queen, so a copy of the board is saved as solution ${solutions.length}, [${sol.join(', ')}]. find_all is True, so the call returns False and the callers keep trying columns.`
          : `row == ${n}: every row holds a queen, so a copy of the board is saved as solution 1, [${sol.join(', ')}]. find_all is False, so the call returns True and every caller stops at once.`,
        { cells: queens, top: 'good', vars: [['row', row]] },
      );
      calls.pop();
      return !findAll;
    }
    for (let col = 0; col < n; col++) {
      call.col = col;
      const check = isSafe(row, col);
      const at = `(${row}, ${col})`;
      const base = { cursor: { r: row, c: col, role: 'compare' as Role }, lines: check.lines, vars: [['row', row], ['col', col]] as Array<[string, number]> };
      if (!check.safe) {
        const [qr, qc] = check.hit!;
        const before = check.where === 'column' ? '' : check.where === 'upper-left diagonal' ? 'the column above is clear, but ' : 'the column above and the upper-left diagonal are clear, but ';
        snap(
          check.where === 'column' ? L.column : check.where === 'upper-left diagonal' ? L.upLeft : L.upRight,
          `is_safe(${row}, ${col}): ${before}the queen at (${qr}, ${qc}) is on the ${check.where}, so ${at} is attacked and is_safe returns False.` +
            (check.where === 'column' ? ' The diagonals are not even looked at.' : ''),
          { ...base, cells: { [`${row},${col}`]: 'compare', [`${qr},${qc}`]: 'bad' } },
        );
        call.tried.add(col);
        continue;
      }
      snap(
        L.safe,
        row === 0
          ? `is_safe(0, ${col}): row 0 has no rows above it, so every square in it is safe.`
          : `is_safe(${row}, ${col}): no queen in the column above ${at} or on either diagonal above it, so the square is safe. Rows below are still empty, so they need no check.`,
        { ...base, cells: { [`${row},${col}`]: 'good' } },
      );
      board[row][col] = 1;
      events.push(['set', row, col, 1]);
      snap(
        L.place,
        `board[${row}][${col}] = 1: place a queen at ${at} and recurse into row ${row + 1}. Rows 0..${row} now hold queens that do not attack each other.`,
        { cursor: { r: row, c: col, role: 'active' }, cells: { [`${row},${col}`]: 'active' }, vars: [['row', row], ['col', col]] },
      );
      const foundBefore = solutions.length;
      if (solve(row + 1)) {
        calls.pop();
        return true;
      }
      board[row][col] = 0;
      events.push(['set', row, col, 0]);
      call.tried.add(col);
      const found = solutions.length - foundBefore;
      call.lifting = true;
      snap(
        L.backtrack,
        (findAll
          ? `Back in row ${row}: every placement below the queen at ${at} has been explored${found ? ` (${found} solution${found === 1 ? '' : 's'} found there)` : ', without a solution'}. `
          : `Back in row ${row}: with a queen at ${at} the rows below cannot all be filled. `) +
          `Lift it (board[${row}][${col}] = 0) and ${col + 1 < n ? `try column ${col + 1}.` : 'there is no column left to try.'}`,
        { cursor: { r: row, c: col, role: 'active' }, cells: { [`${row},${col}`]: 'muted' }, vars: [['row', row], ['col', col]] },
      );
      call.lifting = false;
    }
    snap(
      L.fail,
      row === 0
        ? `Every column of row 0 has been tried: the first call returns False and the search is over.`
        : `Every column of row ${row} is attacked or led to a dead end: return False, so row ${row - 1} must move its queen.`,
      { bands: [{ r0: row, c0: 0, r1: row, c1: n - 1, role: 'bad' }], top: 'bad', vars: [['row', row]] },
    );
    calls.pop();
    return false;
  };

  snap(
    L.start,
    `solve_n_queens(${n}, find_all=${pyBool}): an empty ${n} x ${n} board. Two queens in one row attack each other, so the search places exactly one queen per row, from row 0 down, and only chooses its column.`,
  );
  solve(0);
  const last = solutions[solutions.length - 1];
  snap(
    L.done,
    solutions.length === 0
      ? `solve_n_queens returns []: no placement of ${n} non-attacking queens exists${n === 2 || n === 3 ? ` (n = 2 and n = 3 have none)` : ''}. The search tried every branch with ${checks} is_safe calls.`
      : findAll
        ? `solve_n_queens returns all ${solutions.length} solution${solutions.length === 1 ? '' : 's'} after ${checks} is_safe calls. The board is empty again, because every queen was lifted after its branch was explored.`
        : `solve_n_queens returns 1 solution, columns [${last.join(', ')}], after ${checks} is_safe calls. Columns are tried left to right, so it is the first solution in column order.`,
    !findAll && last ? { cells: Object.fromEntries(last.map((c, r) => [`${r},${c}`, 'good' as Role])) } : {},
  );
  return { frames, solutions, events };
}
