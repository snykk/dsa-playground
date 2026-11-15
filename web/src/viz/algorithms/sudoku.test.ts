import { describe, expect, it } from 'vitest';
import { InputError } from '../core/types';
import { expectBoardFrames, fixtures, rng } from './backtrackingTestKit';
import { SUDOKU_CODE, firstConflict, formatSudoku, parseSudoku, sudokuTrace, type SudokuEvent } from './sudoku';

const SOLUTION = ['534678912', '672195348', '198342567', '859761423', '426853791', '713924856', '961537284', '287419635', '345286179'].map((r) => [...r].map(Number));
const copy = (b: number[][]) => b.map((r) => [...r]);
const box = (r: number, c: number) => Math.floor(r / 3) * 3 + Math.floor(c / 3);

/** Two givens with the same digit in one row, column or box, checked pair by pair. */
function givensConflict(board: number[][]): boolean {
  for (let a = 0; a < 81; a++) {
    for (let b = a + 1; b < 81; b++) {
      const [r1, c1, r2, c2] = [Math.floor(a / 9), a % 9, Math.floor(b / 9), b % 9];
      const v = board[r1][c1];
      if (v !== 0 && v === board[r2][c2] && (r1 === r2 || c1 === c2 || box(r1, c1) === box(r2, c2))) return true;
    }
  }
  return false;
}

/**
 * Reference: the empty cells are filled in row-major order (the first empty cell is always the
 * next blank, because the search fills and undoes them in order), each with the smallest digit
 * that its row, column and box masks allow.
 */
function reference(board: number[][]): { ok: boolean; final: number[][] } {
  if (givensConflict(board)) return { ok: false, final: copy(board) };
  const b = copy(board);
  const rows = Array<number>(9).fill(0);
  const cols = Array<number>(9).fill(0);
  const boxes = Array<number>(9).fill(0);
  const blanks: Array<[number, number]> = [];
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const bit = 1 << b[r][c];
      if (b[r][c] === 0) blanks.push([r, c]);
      else [rows[r], cols[c], boxes[box(r, c)]] = [rows[r] | bit, cols[c] | bit, boxes[box(r, c)] | bit];
    }
  }
  const fill = (k: number): boolean => {
    if (k === blanks.length) return true;
    const [r, c] = blanks[k];
    for (let d = 1; d <= 9; d++) {
      const bit = 1 << d;
      if ((rows[r] | cols[c] | boxes[box(r, c)]) & bit) continue;
      rows[r] |= bit;
      cols[c] |= bit;
      boxes[box(r, c)] |= bit;
      b[r][c] = d;
      if (fill(k + 1)) return true;
      rows[r] &= ~bit;
      cols[c] &= ~bit;
      boxes[box(r, c)] &= ~bit;
      b[r][c] = 0;
    }
    return false;
  };
  const ok = fill(0);
  return { ok, final: ok ? b : copy(board) };
}

function complete(b: number[][]): boolean {
  const all = (cells: number[]) => [...cells].sort().join('') === '123456789';
  for (let i = 0; i < 9; i++) {
    if (!all(b[i]) || !all(b.map((r) => r[i]))) return false;
    if (!all(b.flatMap((r, ri) => r.filter((_, ci) => box(ri, ci) === i)))) return false;
  }
  return true;
}

/** The example solution relabelled and shuffled within bands: still a valid grid. */
function solvedGrid(rand: () => number): number[][] {
  const shuffle = <T,>(xs: T[]) => {
    for (let i = xs.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [xs[i], xs[j]] = [xs[j], xs[i]];
    }
    return xs;
  };
  const relabel = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  const lines = () => shuffle([0, 1, 2]).flatMap((band) => shuffle([0, 1, 2]).map((k) => band * 3 + k));
  const rows = lines();
  const cols = lines();
  return rows.map((r) => cols.map((c) => relabel[SOLUTION[r][c] - 1]));
}

function randomPuzzles(count: number, seed: number): number[][][] {
  const rand = rng(seed);
  const pick = (k: number) => Math.floor(rand() * k);
  const out: number[][][] = [];
  for (let t = 0; t < count; t++) {
    const grid = solvedGrid(rand);
    const b = copy(grid);
    const blanks = 4 + pick(19);
    for (let k = 0; k < blanks; k++) b[pick(9)][pick(9)] = 0;
    const kind = rand();
    const [r, c] = [pick(9), pick(9)];
    if (kind < 0.2) {
      // Copy a digit into another cell of its row or column: conflicting givens.
      const other = (x: number) => (x + 1 + pick(8)) % 9;
      if (rand() < 0.5) b[r][other(c)] = grid[r][c];
      else b[other(r)][c] = grid[r][c];
    } else if (kind < 0.35) {
      // Leave (r, c) empty and move its digit v into column c, in another band: the givens do not
      // conflict, but v is the only digit its row allows (r, c), and the column now blocks it.
      const v = grid[r][c];
      b[r][c] = 0;
      for (let j = 0; j < 9; j++) if (j !== c) b[r][j] = grid[r][j];
      const i = (Math.floor(r / 3) * 3 + 3 + pick(3)) % 9;
      for (let x = 0; x < 81; x++) {
        const [i2, j2] = [Math.floor(x / 9), x % 9];
        if (b[i2][j2] === v && (i2 === i || box(i2, j2) === box(i, c))) b[i2][j2] = 0;
      }
      b[i][c] = v;
    }
    out.push(b);
  }
  return out;
}

describe('sudokuTrace matches sudoku_solver.py (golden fixtures)', () => {
  const cases = fixtures.sudoku as Array<{ board: number[][]; result: boolean; final: number[][]; events: SudokuEvent[] }>;
  it('replays is_valid_puzzle, every find_empty, every is_valid call and every board write', () => {
    expect(cases.length).toBe(40);
    expect(cases.some((c) => !c.result && c.events.length === 1)).toBe(true);
    for (const c of cases) {
      const run = sudokuTrace({ board: c.board });
      expect(run.events, formatSudoku(c.board)).toEqual(c.events);
      expect(run.result).toBe(c.result);
      expect(run.final).toEqual(c.final);
    }
  });
});

describe('sudokuTrace', () => {
  it('agrees with a bitmask reference on random puzzles: the same grid, the givens kept, the board restored on failure', () => {
    const puzzles = randomPuzzles(130, 41);
    let solved = 0;
    let conflicting = 0;
    let unsolvable = 0;
    for (const board of puzzles) {
      const run = sudokuTrace({ board });
      const ref = reference(board);
      expect(run.result, formatSudoku(board)).toBe(ref.ok);
      expect(run.final).toEqual(ref.final);
      expect(firstConflict(board) !== null).toBe(givensConflict(board));
      for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) if (board[r][c]) expect(run.final[r][c]).toBe(board[r][c]);
      if (run.result) {
        expect(complete(run.final)).toBe(true);
        solved++;
      } else if (givensConflict(board)) {
        expect(run.events).toEqual([['puzzle', false]]);
        conflicting++;
      } else {
        unsolvable++;
      }
    }
    expect(solved).toBeGreaterThan(60);
    expect(conflicting).toBeGreaterThan(10);
    expect(unsolvable).toBeGreaterThan(5);
  });

  it('never shows a given changed or two equal digits in a row, column or box, and every frame is well formed', () => {
    for (const board of randomPuzzles(40, 7)) {
      const { frames } = sudokuTrace({ board });
      expectBoardFrames(frames, SUDOKU_CODE.length);
      if (givensConflict(board)) continue;
      for (const f of frames) {
        const shown = f.state.cells.map((row, r) =>
          row.map((cell, c) => {
            if (board[r][c]) {
              expect(cell.given && cell.text === String(board[r][c])).toBe(true);
              return board[r][c];
            }
            // The digit being tried (active) or undone (muted) is not on the board.
            return cell.text && cell.role !== 'active' && cell.role !== 'muted' ? Number(cell.text) : 0;
          }),
        );
        expect(givensConflict(shown), f.caption).toBe(false);
      }
    }
  });

  it('the duplicate given of the audit: a full board with two 3s in row 0 is refused before any search', () => {
    const board = copy(SOLUTION);
    board[0][0] = board[0][1];
    const run = sudokuTrace({ board });
    expect(run.result).toBe(false);
    expect(run.events).toEqual([['puzzle', false]]);
    expect(run.final).toEqual(board);
    expect(run.frames[run.frames.length - 1].caption).toMatch(/\(0, 1\) holds a 3, but row 0 already has a 3 at \(0, 0\).*call it solved at once/);
  });

  it('the conflict is the first one is_valid_puzzle meets, checked as row, then column, then box', () => {
    // The 51-blank example puzzle: too long to animate, but firstConflict only reads the givens.
    const puzzle = '53..7..../6..195.../.98....6./8...6...3/4..8.3..1/7...2...6/.6....28./...419..5/....8..79'.split('/').map((r) => [...r].map((ch) => (ch === '.' ? 0 : Number(ch))));
    const inBox = copy(puzzle);
    inBox[2][0] = 3;
    expect(firstConflict(inBox)).toEqual({ at: [2, 0], earlier: [0, 1], group: 'box' });
    const inColumn = copy(puzzle);
    inColumn[4][1] = 9;
    expect(firstConflict(inColumn)).toEqual({ at: [4, 1], earlier: [2, 1], group: 'column' });
    expect(firstConflict(puzzle)).toBeNull();
  });

  it('two rows open: the first empty cell takes 2 first, and the search backtracks before it succeeds', () => {
    const input = parseSudoku('53..7..../6..195.../198342567/859761423/426853791/713924856/961537284/287419635/345286179');
    const run = sudokuTrace(input);
    expect(run.result).toBe(true);
    expect(run.final).toEqual(SOLUTION);
    expect(run.events.find((e) => e[0] === 'set')).toEqual(['set', 0, 2, 2]);
    expect(run.events.filter((e) => e[0] === 'set' && e[3] === 0).length).toBeGreaterThan(0);
    expect(run.events.filter((e) => e[0] === 'check').length).toBe(108);
  });
});

describe('parseSudoku', () => {
  it('reads 9 rows of 9 cells with 0 or . for empty', () => {
    const solved = SOLUTION.map((r) => r.join('')).join(' ');
    expect(parseSudoku(solved).board).toEqual(SOLUTION);
    expect(parseSudoku(formatSudoku(SOLUTION)).board).toEqual(SOLUTION);
  });

  it('refuses a puzzle that takes too many steps, and other bad input', () => {
    // The 51-blank puzzle of the Python example needs 37,652 is_valid calls.
    expect(() => parseSudoku('530070000/600195000/098000060/800060003/400803001/700020006/060000280/000419005/000080079')).toThrow(/more than the 2,000/);
    expect(() => parseSudoku('')).toThrow(InputError);
    expect(() => parseSudoku('123')).toThrow(/81 cells/);
    expect(() => parseSudoku('12345678x/........./........./........./........./........./........./........./.........')).toThrow(/"x"/);
  });
});
