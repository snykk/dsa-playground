import { describe, expect, it } from 'vitest';
import { InputError } from '../core/types';
import { MAX_FRAMES } from './backtracking';
import { expectBoardFrames, fixtures, rng } from './backtrackingTestKit';
import { MAZE_CODE, formatMaze, mazeTrace, parseMaze, type MazeEvent } from './ratInMaze';

/** Is (n-1, n-1) reachable from (0, 0) through open cells? A breadth-first search. */
function reachable(maze: number[][]): boolean {
  const n = maze.length;
  if (n === 0 || maze.some((r) => r.length !== n) || !maze[0][0] || !maze[n - 1][n - 1]) return false;
  const seen = new Set(['0,0']);
  const queue: Array<[number, number]> = [[0, 0]];
  while (queue.length) {
    const [x, y] = queue.shift()!;
    for (const [nx, ny] of [
      [x + 1, y],
      [x - 1, y],
      [x, y + 1],
      [x, y - 1],
    ]) {
      if (nx >= 0 && ny >= 0 && nx < n && ny < n && maze[nx][ny] && !seen.has(`${nx},${ny}`)) {
        seen.add(`${nx},${ny}`);
        queue.push([nx, ny]);
      }
    }
  }
  return seen.has(`${n - 1},${n - 1}`);
}

/** Reference: an explicit-stack depth-first search with the same move order, returning the route. */
function referenceRoute(maze: number[][]): Array<[number, number]> | null {
  const n = maze.length;
  if (!reachable(maze)) return null;
  const visited = new Set<string>(['0,0']);
  const route: Array<[number, number]> = [[0, 0]];
  const next: number[] = [0];
  const moves = [
    [0, 1],
    [1, 0],
    [0, -1],
    [-1, 0],
  ];
  while (route.length) {
    const [x, y] = route[route.length - 1];
    if (x === n - 1 && y === n - 1) return route;
    const k = next[next.length - 1]++;
    if (k === 4) {
      route.pop();
      next.pop();
      continue;
    }
    const [nx, ny] = [x + moves[k][0], y + moves[k][1]];
    if (nx < 0 || ny < 0 || nx >= n || ny >= n || !maze[nx][ny] || visited.has(`${nx},${ny}`)) continue;
    visited.add(`${nx},${ny}`);
    route.push([nx, ny]);
    next.push(0);
  }
  return null;
}

function randomMaze(rand: () => number): number[][] {
  const n = 1 + Math.floor(rand() * 8);
  const open = 0.5 + rand() * 0.4;
  const maze = Array.from({ length: n }, () => Array.from({ length: n }, () => (rand() < open ? 1 : 0)));
  if (rand() < 0.85) maze[0][0] = maze[n - 1][n - 1] = 1;
  return maze;
}

describe('mazeTrace matches rat_in_maze.py (golden fixtures)', () => {
  const cases = fixtures.maze as Array<{ maze: number[][]; solution: number[][] | null; events: MazeEvent[] }>;
  it('replays every call of solve_maze_util, its answer, and the solution', () => {
    expect(cases.length).toBe(60);
    expect(cases.filter((c) => c.solution !== null).length).toBeGreaterThan(15);
    for (const c of cases) {
      const run = mazeTrace({ maze: c.maze });
      expect(run.events, formatMaze(c.maze)).toEqual(c.events);
      expect(run.solution).toEqual(c.solution);
    }
  });
});

describe('mazeTrace', () => {
  it('agrees with BFS and a stack-based DFS on random mazes, and enters every cell at most once', () => {
    const rand = rng(17);
    let found = 0;
    for (let t = 0; t < 160; t++) {
      const maze = randomMaze(rand);
      const run = mazeTrace({ maze });
      const route = referenceRoute(maze);
      expect(run.solution !== null, formatMaze(maze)).toBe(reachable(maze));
      if (route) {
        found++;
        const want = maze.map((r) => r.map(() => 0));
        for (const [x, y] of route) want[x][y] = 1;
        expect(run.solution).toEqual(want);
      }
      // A call either is rejected at once or enters its cell; a cell is entered once at most.
      const entered = new Map<string, number>();
      for (let i = 0; i < run.events.length; i++) {
        const e = run.events[i];
        const next = run.events[i + 1];
        if (e[0] === 'call' && !(next && next[0] === 'ret' && next[1] === e[1] && next[2] === e[2] && next[3] === false)) {
          const key = `${e[1]},${e[2]}`;
          entered.set(key, (entered.get(key) ?? 0) + 1);
          expect(maze[e[1]][e[2]]).toBe(1);
        }
      }
      for (const count of entered.values()) expect(count).toBe(1);
      const open = maze.flat().filter((v) => v === 1).length;
      expect(run.events.filter((e) => e[0] === 'call').length).toBeLessThanOrEqual(4 * open + 1);
    }
    expect(found).toBeGreaterThan(40);
  });

  it('draws the path as a chain of neighbors on open cells, and every frame is well formed', () => {
    const rand = rng(3);
    for (let t = 0; t < 60; t++) {
      const maze = randomMaze(rand);
      const { frames } = mazeTrace({ maze });
      expectBoardFrames(frames, MAZE_CODE.length);
      for (const f of frames) {
        const path = f.state.path ?? [];
        path.forEach(([x, y], i) => {
          expect(maze[x][y]).toBe(1);
          if (i > 0) expect(Math.abs(x - path[i - 1][0]) + Math.abs(y - path[i - 1][1])).toBe(1);
        });
        if (path.length) expect(path[0]).toEqual([0, 0]);
      }
    }
  });

  it('the audit maze needs up and left moves: the four-direction search finds it', () => {
    const run = mazeTrace(parseMaze('10111/10101/10101/11101/00001'));
    expect(run.solution).toEqual([
      [1, 0, 1, 1, 1],
      [1, 0, 1, 0, 1],
      [1, 0, 1, 0, 1],
      [1, 1, 1, 0, 1],
      [0, 0, 0, 0, 1],
    ]);
  });

  it('the article maze: (0, 1) is a dead end, 17 calls, and the dead end stays visited', () => {
    const run = mazeTrace(parseMaze('11000/10011/11110/00011/00001'));
    expect(run.events.filter((e) => e[0] === 'call').length).toBe(17);
    expect(run.events.slice(0, 4)).toEqual([
      ['call', 0, 0],
      ['call', 0, 1],
      ['call', 0, 2],
      ['ret', 0, 2, false],
    ]);
    const last = run.frames[run.frames.length - 1].state;
    expect(last.cells[0][1].role).toBe('muted');
    expect(run.solution![0][1]).toBe(0);
  });

  it('returns None without a call for a non-square maze or a walled corner', () => {
    for (const text of ['111/111', '0111/1111/1111/1111', '11/10']) {
      const run = mazeTrace(parseMaze(text));
      expect(run.solution).toBeNull();
      expect(run.events).toEqual([]);
    }
    expect(mazeTrace(parseMaze('1')).solution).toEqual([[1]]);
  });
});

describe('parseMaze', () => {
  it('reads rows of 0 and 1 separated by slashes or spaces', () => {
    expect(parseMaze('10 11').maze).toEqual([
      [1, 0],
      [1, 1],
    ]);
    expect(parseMaze('1000/1101/0100/1111').maze.length).toBe(4);
  });

  it('keeps every allowed maze under the step budget, and gives friendly errors', () => {
    // Open, walled off (every cell entered, four tries from each) and a comb of long corridors.
    const open = Array.from({ length: 10 }, () => Array<number>(10).fill(1));
    const walled = open.map((r) => [...r]);
    walled[8][9] = walled[9][8] = 0;
    const comb = open.map((r, x) => r.map((_, y) => (y % 2 === 1 && x !== (y % 4 === 1 ? 9 : 0) ? 0 : 1)));
    for (const maze of [open, walled, comb]) {
      const frames = mazeTrace(parseMaze(formatMaze(maze))).frames.length;
      expect(frames).toBeGreaterThan(20);
      expect(frames).toBeLessThanOrEqual(MAX_FRAMES);
    }
    expect(() => parseMaze('')).toThrow(InputError);
    expect(() => parseMaze('102/111/111')).toThrow(/"2"/);
    expect(() => parseMaze('11/111')).toThrow(/different lengths/);
    expect(() => parseMaze(Array.from({ length: 11 }, () => '1'.repeat(11)).join('/'))).toThrow(/Up to 10/);
  });
});
