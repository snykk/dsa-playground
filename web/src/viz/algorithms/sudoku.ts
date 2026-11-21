/**
 * Sudoku solver tracer, drawn with BoardView: the 9 x 9 grid beside the open search calls.
 *
 * Mirrors Algorithms/Advanced_Algorithms/Backtracking/Sudoku_Solver/Python/sudoku_solver.py:
 * solve_sudoku(board) -> is_valid_puzzle(board), then _search(board) with find_empty and is_valid.
 * - is_valid_puzzle runs once, before any search: it scans the cells row by row and returns False
 *   at the first given digit already seen in its row, its column or its box (checked in that
 *   order). solve_sudoku then returns False and never touches the board.
 * - _search takes the first empty cell in row-major order (find_empty) and tries the digits 1..9
 *   in order. is_valid scans the row, then the column, then the 3 x 3 box, and returns False at
 *   the first equal digit. A digit that fits is written, and _search recurses; a recursion that
 *   fails resets the cell to 0 and the next digit is tried.
 * Golden fixtures (__fixtures__/backtracking.json) pin is_valid_puzzle's answer, every find_empty
 * result, every is_valid call and its answer, and every write to the board.
 *
 * Input: 81 cells as 9 rows of 9, digits with 0 or . for an empty cell:
 *   "530070000/600195000/098000060/800060003/400803001/700020006/060000280/000419005/000080079"
 */
import { InputError, type Frame, type Role } from '../core/types';
import type { BoardBand, BoardCell, BoardStackItem, BoardState } from '../renderers/BoardView';
import type { StripItem } from '../ui/molecules/Strip';
import { MAX_FRAMES, countSteps, parseRows, tooLong, type StepCounter } from './backtracking';

export interface SudokuInput {
  board: number[][];
}

/**
 * ['puzzle', is_valid_puzzle's answer], ['find', row, col] or ['find', null], ['check', row, col,
 * num, is_valid's answer], ['set', row, col, value written].
 */
export type SudokuEvent = ['puzzle', boolean] | ['find', number, number] | ['find', null] | ['check', number, number, number, boolean] | ['set', number, number, number];

export interface SudokuRun {
  frames: Array<Frame<BoardState>>;
  events: SudokuEvent[];
  result: boolean;
  /** The board after solve_sudoku returned. */
  final: number[][];
}

export const SUDOKU_CODE = [
  'solve_sudoku(board):',
  '  if not is_valid_puzzle(board): return False   # 9x9, 0..9, no given repeats in a row, column or box',
  '  return _search(board)',
  '_search(board):',
  '  empty = find_empty(board)          # the first 0, row by row',
  '  if empty is None: return True      # every cell is filled: solved',
  '  row, col = empty',
  '  for num in range(1, 10):',
  '    if is_valid(board, row, col, num):',
  '      board[row][col] = num',
  '      if _search(board): return True',
  '      board[row][col] = 0            # backtrack',
  '  return False',
  'is_valid(board, row, col, num):',
  '  if num in board[row]: return False                # the row',
  '  if num in column col: return False                # the column',
  '  if num in the 3x3 box of (row, col): return False # the box',
  '  return True',
];

const L = { start: 0, puzzle: 1, find: 4, solved: 5, place: 9, backtrack: 11, fail: 12, row: 14, column: 15, box: 16 };

/** Parse 81 cells: 9 rows of 9 digits, 0 or . for empty. */
export function parseSudoku(text: string): SudokuInput {
  const rows = parseRows(text, (ch) => (ch === '.' ? 0 : /^\d$/.test(ch) ? Number(ch) : undefined), 'a digit or . (empty)');
  const flat = rows.flat();
  if (flat.length !== 81) {
    throw new InputError(`Enter the 81 cells of the grid, 9 rows of 9 digits with 0 or . for an empty cell, separated by slashes or spaces (got ${flat.length} cells).`);
  }
  const board = Array.from({ length: 9 }, (_, r) => flat.slice(r * 9, r * 9 + 9));
  const input = { board };
  const steps = countSteps((counter) => sudokuTrace(input, counter));
  if (steps > MAX_FRAMES) {
    throw tooLong(steps, 'Solving this puzzle with plain backtracking', 'Fill in more cells (a nearly complete grid), or try one of the examples.');
  }
  return input;
}

export function formatSudoku(board: number[][]): string {
  return board.map((r) => r.map((v) => (v === 0 ? '.' : String(v))).join('')).join('/');
}

const boxOf = (r: number, c: number) => Math.floor(r / 3) * 3 + Math.floor(c / 3);

/** is_valid_puzzle's scan: the first conflicting given and the earlier one it repeats. */
export function firstConflict(board: number[][]): { at: [number, number]; earlier: [number, number]; group: 'row' | 'column' | 'box' } | null {
  const rows = Array.from({ length: 9 }, () => new Set<number>());
  const cols = Array.from({ length: 9 }, () => new Set<number>());
  const boxes = Array.from({ length: 9 }, () => new Set<number>());
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      const v = board[i][j];
      if (v === 0) continue;
      const b = boxOf(i, j);
      const group = rows[i].has(v) ? 'row' : cols[j].has(v) ? 'column' : boxes[b].has(v) ? 'box' : null;
      if (group) {
        // The earlier cell of that group with the same digit, in the order the scan met it.
        for (let x = 0; x < 81; x++) {
          const [r, c] = [Math.floor(x / 9), x % 9];
          if (r * 9 + c >= i * 9 + j) break;
          const same = group === 'row' ? r === i : group === 'column' ? c === j : boxOf(r, c) === b;
          if (same && board[r][c] === v) return { at: [i, j], earlier: [r, c], group };
        }
      }
      rows[i].add(v);
      cols[j].add(v);
      boxes[b].add(v);
    }
  }
  return null;
}

interface Call {
  r: number;
  c: number;
  /** The digit the loop is on, or null right after find_empty. */
  num: number | null;
  /** Digits of this cell already tried and rejected or undone. */
  tried: Set<number>;
  /** The digit being undone, for the one step that shows it. */
  undoing?: boolean;
}

interface SnapOpts {
  cursor?: { r: number; c: number; role: Role };
  cells?: Record<string, { role: Role; text?: string; soft?: boolean }>;
  bands?: BoardBand[];
  top?: Role;
  vars?: Array<[string, string | number]>;
}

const rowBand = (r: number, role: Role = 'compare'): BoardBand => ({ r0: r, c0: 0, r1: r, c1: 8, role });
const colBand = (c: number, role: Role = 'compare'): BoardBand => ({ r0: 0, c0: c, r1: 8, c1: c, role });
const boxBand = (r: number, c: number, role: Role = 'compare'): BoardBand => {
  const r0 = Math.floor(r / 3) * 3;
  const c0 = Math.floor(c / 3) * 3;
  return { r0, c0, r1: r0 + 2, c1: c0 + 2, role };
};

/** solve_sudoku as the Python code runs it. With a counter, only the steps are counted. */
export function sudokuTrace(input: SudokuInput, counter?: StepCounter): SudokuRun {
  const board = input.board.map((r) => [...r]);
  const given = board.map((r) => r.map((v) => v !== 0));
  const blanks = board.flat().filter((v) => v === 0).length;
  const events: SudokuEvent[] = [];
  const frames: Array<Frame<BoardState>> = [];
  const calls: Call[] = [];
  let checks = 0;
  let undone = 0;
  let solvedCall = false;

  const stackItems = (top?: Role): BoardStackItem[] => {
    const items = calls.map((k, i): BoardStackItem => {
      const v = board[k.r][k.c];
      const text = v !== 0 ? `(${k.r}, ${k.c}) = ${v}` : k.num === null ? `(${k.r}, ${k.c})` : `(${k.r}, ${k.c}): ${k.undoing ? 'undo' : 'try'} ${k.num}`;
      return { text, role: i === calls.length - 1 && !solvedCall ? (top ?? 'active') : undefined };
    });
    if (solvedCall) items.push({ text: 'no empty cell', role: 'good' });
    return items;
  };

  const digitStrip = (): StripItem[] => {
    const k = calls[calls.length - 1];
    if (!k || solvedCall) return [{ text: '-' }];
    return Array.from({ length: 9 }, (_, d): StripItem => {
      const num = d + 1;
      if (num === k.num) return { text: String(num), role: board[k.r][k.c] === num ? 'done' : 'active' };
      return { text: String(num), role: k.tried.has(num) ? 'muted' : undefined };
    });
  };

  const snap = (line: number, caption: string, o: SnapOpts = {}) => {
    if (counter) {
      counter.tick();
      return;
    }
    const cells: BoardCell[][] = board.map((row, r) =>
      row.map((v, c): BoardCell => {
        const over = o.cells?.[`${r},${c}`];
        const base: BoardCell = given[r][c] ? { text: String(v), given: true } : v !== 0 ? { text: String(v), role: 'done', soft: true } : {};
        return over ? { ...base, role: over.role, soft: over.soft ?? false, text: over.text ?? base.text } : base;
      }),
    );
    const k = calls[calls.length - 1];
    frames.push({
      line,
      caption,
      vars: [...(o.vars ?? []), ['empty cells left', board.flat().filter((v) => v === 0).length], ['is_valid calls', checks], ['digits undone', undone]],
      state: {
        label: `Sudoku grid with ${board.flat().filter((v) => v !== 0).length} filled cells`,
        rows: 9,
        cols: 9,
        cells,
        blocks: 3,
        bands: o.bands,
        cursor: o.cursor,
        stack: stackItems(o.top),
        stackTitle: 'Open _search calls',
        strips: [{ label: k && !solvedCall ? `Digits for (${k.r}, ${k.c})` : 'Digits', items: digitStrip() }],
      },
    });
  };

  /** is_valid as the Python code runs it: the first equal digit in the row, the column, then the box. */
  const isValid = (row: number, col: number, num: number) => {
    checks += 1;
    let hit: [number, number] | null = null;
    let where: 'row' | 'column' | 'box' | null = null;
    for (let j = 0; j < 9 && !hit; j++) if (board[row][j] === num) [hit, where] = [[row, j], 'row'];
    for (let i = 0; i < 9 && !hit; i++) if (board[i][col] === num) [hit, where] = [[i, col], 'column'];
    const br = Math.floor(row / 3) * 3;
    const bc = Math.floor(col / 3) * 3;
    for (let i = br; i < br + 3 && !hit; i++) for (let j = bc; j < bc + 3 && !hit; j++) if (board[i][j] === num) [hit, where] = [[i, j], 'box'];
    events.push(['check', row, col, num, hit === null]);
    return { hit, where };
  };

  const search = (): boolean => {
    let found: [number, number] | null = null;
    for (let i = 0; i < 9 && !found; i++) for (let j = 0; j < 9 && !found; j++) if (board[i][j] === 0) found = [i, j];
    events.push(found ? ['find', found[0], found[1]] : ['find', null]);
    if (!found) {
      solvedCall = true;
      snap(L.solved, `find_empty finds no empty cell: every cell holds a digit, so this _search returns True, and every open call returns True after it.`, { top: 'good' });
      return true;
    }
    const [row, col] = found;
    const at = `(${row}, ${col})`;
    const call: Call = { r: row, c: col, num: null, tried: new Set() };
    calls.push(call);
    snap(
      L.find,
      calls.length === 1
        ? `find_empty scans row by row from (0, 0), skipping filled cells: the first empty cell is ${at}.`
        : `_search again: find_empty scans from (0, 0), and the first empty cell is now ${at}.`,
      { cursor: { r: row, c: col, role: 'active' }, cells: { [`${row},${col}`]: { role: 'active' } }, vars: [['cell', at]] },
    );
    // Whether some digit passed is_valid here (and failed later), for the closing caption.
    let placed = false;
    for (let num = 1; num <= 9; num++) {
      call.num = num;
      const { hit, where } = isValid(row, col, num);
      const vars: Array<[string, string | number]> = [
        ['cell', at],
        ['num', num],
      ];
      if (hit) {
        const [hr, hc] = hit;
        const bands = where === 'row' ? [rowBand(row)] : where === 'column' ? [rowBand(row), colBand(col)] : [rowBand(row), colBand(col), boxBand(row, col)];
        snap(
          where === 'row' ? L.row : where === 'column' ? L.column : L.box,
          `Try ${num} at ${at}: ${where === 'row' ? '' : where === 'column' ? `row ${row} has no ${num}, but ` : `row ${row} and column ${col} have no ${num}, but `}` +
            `${where === 'row' ? `row ${row}` : where === 'column' ? `column ${col}` : 'its 3 x 3 box'} already has a ${num} at (${hr}, ${hc}), so is_valid returns False.`,
          { cursor: { r: row, c: col, role: 'active' }, bands, cells: { [`${row},${col}`]: { role: 'active', text: String(num) }, [`${hr},${hc}`]: { role: 'bad' } }, vars },
        );
        call.tried.add(num);
        continue;
      }
      board[row][col] = num;
      placed = true;
      events.push(['set', row, col, num]);
      snap(
        L.place,
        `Try ${num} at ${at}: no ${num} in row ${row}, in column ${col} or in the box, so is_valid returns True. Write it (board[${row}][${col}] = ${num}) and recurse to the next empty cell.`,
        { cursor: { r: row, c: col, role: 'good' }, bands: [rowBand(row), colBand(col), boxBand(row, col)], cells: { [`${row},${col}`]: { role: 'good' } }, vars },
      );
      if (search()) return true;
      board[row][col] = 0;
      events.push(['set', row, col, 0]);
      undone += 1;
      call.tried.add(num);
      call.undoing = true;
      snap(
        L.backtrack,
        `Back at ${at}: with ${num} here, a later cell has no legal digit. Reset it (board[${row}][${col}] = 0) and ${num < 9 ? `try ${num + 1}.` : 'no digit is left to try.'}`,
        { cursor: { r: row, c: col, role: 'active' }, cells: { [`${row},${col}`]: { role: 'muted', text: String(num) } }, vars },
      );
      call.undoing = false;
    }
    call.num = null;
    snap(
      L.fail,
      calls.length === 1
        ? `${placed ? `Every digit that fits ${at}, the first empty cell, led to a dead end` : `No digit from 1 to 9 fits ${at}, the first empty cell`}: the first _search returns False, so the puzzle has no solution.`
        : `${placed ? `Every digit that fits ${at} led to a dead end` : `No digit from 1 to 9 fits ${at}`}: this _search returns False, so the cell before it, (${calls[calls.length - 2].r}, ${calls[calls.length - 2].c}), must change its digit.`,
      { cursor: { r: row, c: col, role: 'bad' }, cells: { [`${row},${col}`]: { role: 'bad' } }, top: 'bad', vars: [['cell', at]] },
    );
    calls.pop();
    return false;
  };

  const givens = 81 - blanks;
  snap(
    L.start,
    `solve_sudoku: ${givens} given digit${givens === 1 ? '' : 's'} (grey) and ${blanks} empty cell${blanks === 1 ? '' : 's'}. ` +
      'A digit may appear only once in each row, column and 3 x 3 box. The givens are checked first, then the search fills the empty cells.',
  );
  const conflict = firstConflict(board);
  events.push(['puzzle', conflict === null]);
  let result: boolean;
  if (conflict) {
    const { at, earlier, group } = conflict;
    const v = board[at[0]][at[1]];
    const band = group === 'row' ? rowBand(at[0], 'bad') : group === 'column' ? colBand(at[1], 'bad') : boxBand(at[0], at[1], 'bad');
    const name = group === 'row' ? `row ${at[0]}` : group === 'column' ? `column ${at[1]}` : 'their 3 x 3 box';
    snap(
      L.puzzle,
      `is_valid_puzzle scans the givens row by row: (${at[0]}, ${at[1]}) holds a ${v}, but ${name} already has a ${v} at (${earlier[0]}, ${earlier[1]}). ` +
        'Givens that conflict can never be completed, so solve_sudoku returns False before searching and leaves the board as it was given.' +
        (blanks === 0 ? ' Without this check, a full board like this has no empty cell, and the search would call it solved at once.' : ''),
      { bands: [band], cells: { [`${at[0]},${at[1]}`]: { role: 'bad' }, [`${earlier[0]},${earlier[1]}`]: { role: 'bad' } }, vars: [['conflict', `${v} in ${group === 'box' ? 'a box' : name}`]] },
    );
    result = false;
  } else {
    const scanned: SnapOpts['cells'] = {};
    board.forEach((row, r) => row.forEach((v, c) => v !== 0 && (scanned[`${r},${c}`] = { role: 'compare', soft: true })));
    snap(L.puzzle, 'is_valid_puzzle checks every given: the grid is 9 x 9, every value is 0..9, and no given digit repeats in a row, a column or a box. The search can start.', {
      cells: scanned,
    });
    result = search();
    // Every call has returned by now.
    calls.length = 0;
    solvedCall = false;
    if (result) {
      snap(
        L.puzzle,
        `solve_sudoku returns True: the board now holds the solution (aqua digits were written by the search, the grey givens never change). ` +
          `It took ${checks} is_valid call${checks === 1 ? '' : 's'}, and ${undone} digit${undone === 1 ? ' was' : 's were'} undone on the way.`,
      );
    } else {
      snap(L.puzzle, `solve_sudoku returns False: the givens do not conflict, but no completion exists. Every digit written was undone, so the board is exactly the input again.`);
    }
  }
  return { frames, events, result, final: board.map((r) => [...r]) };
}
