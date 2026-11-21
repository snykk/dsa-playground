import { describe, expect, it } from 'vitest';
import { InputError } from '../core/types';
import { MAX_FRAMES } from './backtracking';
import { boardFrameProblems, fixtures } from './backtrackingTestKit';
import { QUEENS_CODE, parseQueens, queensTrace, type QueensEvent } from './nQueens';

/** Every placement of one queen per row with distinct columns and no shared diagonal, in column order. */
function bruteForce(n: number): number[][] {
  const out: number[][] = [];
  const cols: number[] = [];
  const extend = () => {
    if (cols.length === n) {
      out.push([...cols]);
      return;
    }
    for (let c = 0; c < n; c++) {
      cols.push(c);
      const r = cols.length - 1;
      if (cols.every((c2, r2) => r2 === r || (c2 !== c && Math.abs(c2 - c) !== Math.abs(r2 - r)))) extend();
      cols.pop();
    }
  };
  extend();
  return out;
}

describe('queensTrace matches n_queens.py (golden fixtures)', () => {
  const cases = fixtures.nQueens as Array<{ n: number; findAll: boolean; solutions: number[][]; events: QueensEvent[] }>;
  it('replays every is_safe call, every board write and the solutions', () => {
    expect(cases.length).toBe(14);
    for (const c of cases) {
      const run = queensTrace({ n: c.n, findAll: c.findAll });
      expect(run.events, `n ${c.n} ${c.findAll}`).toEqual(c.events);
      expect(run.solutions).toEqual(c.solutions);
    }
  });
});

describe('queensTrace', () => {
  // The input space is n = 1..8 in two modes, so every input is checked, not a sample.
  it('finds exactly the brute-force solutions, in column order', () => {
    const counts = [1, 0, 0, 2, 10, 4, 40];
    for (let n = 1; n <= 7; n++) {
      const all = queensTrace({ n, findAll: true }).solutions;
      expect(all).toEqual(bruteForce(n));
      expect(all.length).toBe(counts[n - 1]);
    }
    for (let n = 1; n <= 8; n++) {
      const first = queensTrace({ n, findAll: false }).solutions;
      expect(first).toEqual(bruteForce(n).slice(0, 1));
    }
    expect(queensTrace({ n: 8, findAll: false }).solutions[0]).toEqual([0, 4, 7, 5, 2, 6, 1, 3]);
  });

  it('never shows two queens that attack each other, and every frame is well formed', () => {
    for (let n = 1; n <= 7; n++) {
      for (const findAll of [false, true]) {
        const { frames } = queensTrace({ n, findAll });
        const problems = boardFrameProblems(frames, QUEENS_CODE.length);
        for (const f of frames) {
          const queens = f.state.cells.flatMap((row, r) => row.flatMap((cell, c) => (cell.queen && cell.role !== 'muted' ? [[r, c]] : [])));
          for (const [r1, c1] of queens) {
            for (const [r2, c2] of queens) {
              if (r1 === r2 && c1 === c2) continue;
              if (!(r1 !== r2 && c1 !== c2 && Math.abs(r1 - r2) !== Math.abs(c1 - c2))) problems.push(`queens (${r1}, ${c1}) and (${r2}, ${c2}) attack each other: ${f.caption}`);
            }
          }
          // One open call per row that holds a queen, plus the row being searched.
          if (f.state.stack.length > n + 1) problems.push(`${f.state.stack.length} open calls, more than n + 1 = ${n + 1}: ${f.caption}`);
        }
        expect(problems, `n ${n}, ${findAll ? 'all' : 'first'}`).toEqual([]);
      }
    }
  });

  it('places a queen only where is_safe said yes, and lifts it before the next column of that row', () => {
    for (let n = 1; n <= 7; n++) {
      const { events } = queensTrace({ n, findAll: true });
      const board = new Set<string>();
      let last: QueensEvent | undefined;
      for (const e of events) {
        if (e[0] === 'set' && e[3] === 1) {
          expect(last).toEqual(['check', e[1], e[2], true]);
          board.add(`${e[1]},${e[2]}`);
        } else if (e[0] === 'set') {
          expect(board.delete(`${e[1]},${e[2]}`)).toBe(true);
        } else {
          // Rows below the one being checked are empty: is_safe only ever looks upward.
          for (const key of board) expect(Number(key.split(',')[0])).toBeLessThan(e[1]);
        }
        last = e;
      }
      expect(board.size).toBe(0);
    }
  });

  it('the article example: 26 is_safe calls, first solution [1, 3, 0, 2], with a dead end in row 2', () => {
    const run = queensTrace({ n: 4, findAll: false });
    expect(run.events.filter((e) => e[0] === 'check').length).toBe(26);
    expect(run.solutions).toEqual([[1, 3, 0, 2]]);
    const deadEnd = run.frames.find((f) => f.caption.startsWith('Every column of row 2'))!;
    expect(deadEnd.state.bands).toEqual([{ r0: 2, c0: 0, r1: 2, c1: 3, role: 'bad' }]);
    // Row 2 was tried in every column: each square carries the "tried" mark.
    expect(deadEnd.state.cells[2].every((c) => c.tried)).toBe(true);
    expect(queensTrace({ n: 4, findAll: true }).events.filter((e) => e[0] === 'check').length).toBe(60);
  });
});

describe('parseQueens', () => {
  it('reads the size and the mode, with Python default find_all=False', () => {
    expect(parseQueens('n 4')).toEqual({ n: 4, findAll: false });
    expect(parseQueens('6')).toEqual({ n: 6, findAll: false });
    expect(parseQueens('n = 5, all')).toEqual({ n: 5, findAll: true });
    expect(parseQueens('N 3; find_all')).toEqual({ n: 3, findAll: true });
    expect(parseQueens('n 8 first')).toEqual({ n: 8, findAll: false });
  });

  it('accepts exactly the inputs whose run fits the player, and says why it refuses the others', () => {
    for (let n = 1; n <= 8; n++) {
      for (const findAll of [false, true]) {
        const text = `n ${n}${findAll ? ', all' : ''}`;
        const frames = queensTrace({ n, findAll }).frames.length;
        if (frames <= MAX_FRAMES) expect(parseQueens(text)).toEqual({ n, findAll });
        else expect(() => parseQueens(text), text).toThrow(/takes [\d,]+ steps, more than the 2,000/);
      }
    }
    expect(() => parseQueens('n 7, all')).toThrow(/n up to 6/);
  });

  it('gives friendly errors', () => {
    expect(() => parseQueens('')).toThrow(InputError);
    expect(() => parseQueens('n 0')).toThrow(/1 to 8/);
    expect(() => parseQueens('n 9')).toThrow(/1 to 8/);
    expect(() => parseQueens('n 4 4')).toThrow(/only once/);
    expect(() => parseQueens('n four')).toThrow(/Cannot read/);
  });
});
