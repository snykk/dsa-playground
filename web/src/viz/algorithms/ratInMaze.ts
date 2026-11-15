/**
 * Rat in a Maze tracer, drawn with BoardView: the maze, the route so far and the open calls.
 *
 * Mirrors Algorithms/Advanced_Algorithms/Backtracking/Rat_in_a_Maze/Python/rat_in_maze.py:
 * solve_maze(maze) -> solve_maze_util(maze, x, y, n, solution, visited) and is_safe.
 * - (x, y) is (row, column); the rat starts at (0, 0) and wants (n-1, n-1).
 * - solve_maze returns None at once for an empty or non-square maze, or when a corner is a wall.
 * - A call returns False at once when (x, y) is outside, a wall, or already visited. Otherwise it
 *   marks the cell visited and on the path, returns True at the goal, and tries the moves right,
 *   down, left, up (MOVES) in that order.
 * - When no move works the cell leaves the path (solution = 0) but stays visited, so no other
 *   route ever enters it again: every cell is entered at most once.
 * Golden fixtures (__fixtures__/backtracking.json) pin every call, its answer and the path.
 *
 * Input: rows of 1 (open) and 0 (wall), "1000/1101/0100/1111".
 */
import { InputError, type Frame, type Role } from '../core/types';
import type { BoardBand, BoardCell, BoardLine, BoardStackItem, BoardState } from '../renderers/BoardView';
import { MAX_FRAMES, countSteps, parseRows, tooLong, type StepCounter } from './backtracking';

export interface MazeInput {
  maze: number[][];
}

/** ['call', x, y] when solve_maze_util starts, ['ret', x, y, answer] when it returns. */
export type MazeEvent = ['call', number, number] | ['ret', number, number, boolean];

export interface MazeRun {
  frames: Array<Frame<BoardState>>;
  events: MazeEvent[];
  /** solve_maze's answer: the solution matrix, or null for None. */
  solution: number[][] | null;
}

export const MAZE_LIMITS = { maxSide: 10 };

/** MOVES in rat_in_maze.py: right, down, left, up. */
export const MOVES: ReadonlyArray<readonly [number, number, string]> = [
  [0, 1, 'right'],
  [1, 0, 'down'],
  [0, -1, 'left'],
  [-1, 0, 'up'],
];

export const MAZE_CODE = [
  'solve_maze(maze):',
  '  n = len(maze); if n == 0 or any(len(row) != n for row in maze): return None',
  '  if maze[0][0] == 0 or maze[n-1][n-1] == 0: return None',
  '  return solution if solve_maze_util(maze, 0, 0, n, solution, visited) else None',
  'solve_maze_util(maze, x, y, n, solution, visited):',
  '  if not is_safe(maze, x, y, n) or visited[x][y]: return False   # outside, wall, entered before',
  '  visited[x][y] = True; solution[x][y] = 1',
  '  if x == n - 1 and y == n - 1: return True    # the goal',
  '  for dx, dy in MOVES:                         # right, down, left, up',
  '    if solve_maze_util(maze, x + dx, y + dy, n, solution, visited): return True',
  '  solution[x][y] = 0                           # dead end: off the path, still visited',
  '  return False',
];

const L = { start: 0, shape: 1, corners: 2, result: 3, reject: 5, enter: 6, goal: 7, move: 9, deadEnd: 10 };

/** Rows of 0 and 1 separated by slashes or spaces. Rows of different lengths cannot be drawn. */
export function parseMaze(text: string): MazeInput {
  const maze = parseRows(text, (ch) => (ch === '1' ? 1 : ch === '0' ? 0 : undefined), 'a 1 (open) or a 0 (wall)');
  if (maze.length === 0) throw new InputError('Enter the maze as rows of 1 (open) and 0 (wall), as in "1000/1101/0100/1111".');
  const width = maze[0].length;
  if (maze.some((r) => r.length !== width)) {
    throw new InputError('The rows have different lengths. solve_maze returns None for such a maze, and this view needs rows of equal length to draw it.');
  }
  if (maze.length > MAZE_LIMITS.maxSide || width > MAZE_LIMITS.maxSide) {
    throw new InputError(`Up to ${MAZE_LIMITS.maxSide} rows and ${MAZE_LIMITS.maxSide} columns, so every cell stays readable (got ${maze.length} x ${width}).`);
  }
  const input = { maze };
  const steps = countSteps((counter) => mazeTrace(input, counter));
  if (steps > MAX_FRAMES) throw tooLong(steps, 'This maze', 'Use a smaller maze.');
  return input;
}

export function formatMaze(maze: number[][]): string {
  return maze.map((r) => r.join('')).join('/');
}

interface Call {
  x: number;
  y: number;
  /** The move the loop is on, or null before the loop starts. */
  move: number | null;
  /** A call that is rejected at once, shown for one step. */
  rejected?: string;
}

interface SnapOpts {
  cursor?: { r: number; c: number; role: Role };
  bands?: BoardBand[];
  /** The route to draw when the calls that made it have returned (the last step). */
  path?: Array<[number, number]>;
  cells?: Record<string, Role>;
  lines?: BoardLine[];
  top?: Role;
  vars?: Array<[string, string | number]>;
}

/** solve_maze as the Python code runs it. With a counter, only the steps are counted. */
export function mazeTrace(input: MazeInput, counter?: StepCounter): MazeRun {
  const { maze } = input;
  const rows = maze.length;
  const cols = rows ? maze[0].length : 0;
  const n = rows;
  const visited = maze.map((r) => r.map(() => false));
  const solution = maze.map((r) => r.map(() => 0));
  const events: MazeEvent[] = [];
  const frames: Array<Frame<BoardState>> = [];
  const calls: Call[] = [];
  let callCount = 0;
  let entered = 0;
  let route: Array<[number, number]> = [];

  const stackItems = (top?: Role): BoardStackItem[] =>
    calls.map((k, i) => ({
      text: k.rejected ? `(${k.x}, ${k.y}): ${k.rejected}` : `(${k.x}, ${k.y})${k.move === null ? '' : ` ${MOVES[k.move][2]}`}`,
      role: i === calls.length - 1 ? (top ?? 'active') : undefined,
    }));

  const snap = (line: number, caption: string, o: SnapOpts = {}) => {
    if (counter) {
      counter.tick();
      return;
    }
    const cells: BoardCell[][] = maze.map((row, x) =>
      row.map((v, y): BoardCell => {
        const text = x === 0 && y === 0 ? 'S' : x === rows - 1 && y === cols - 1 ? 'G' : undefined;
        const over = o.cells?.[`${x},${y}`];
        if (v === 0) return { wall: true, text, role: over };
        if (solution[x][y] === 1) return { text, role: over ?? 'done' };
        if (visited[x][y]) return { text, role: over ?? 'muted' };
        return { text, role: over };
      }),
    );
    const path = o.path ?? calls.filter((k) => !k.rejected && solution[k.x][k.y] === 1).map((k): [number, number] => [k.x, k.y]);
    frames.push({
      line,
      caption,
      vars: [...(o.vars ?? []), ['calls', callCount], ['cells entered', entered], ['path length', path.length]],
      state: {
        label: `Maze with ${rows} rows and ${cols} columns; the path has ${path.length} cells`,
        rows,
        cols,
        cells,
        lines: o.lines,
        bands: o.bands,
        path,
        cursor: o.cursor,
        stack: stackItems(o.top),
      },
    });
  };

  const inside = (x: number, y: number) => x >= 0 && x < n && y >= 0 && y < n;

  /** solve_maze_util; `from` is the cell and move that made this call. */
  const util = (x: number, y: number, from?: { x: number; y: number; move: number }): boolean => {
    callCount += 1;
    events.push(['call', x, y]);
    const at = `(${x}, ${y})`;
    const tried = from ? `Try ${MOVES[from.move][2]} from (${from.x}, ${from.y}): ` : '';
    const arrow: BoardLine[] = from ? [{ from: [from.x, from.y], to: [x, y], arrow: true, role: 'compare' }] : [];
    const safe = inside(x, y) && maze[x][y] === 1;
    if (!safe || visited[x][y]) {
      const why = !inside(x, y) ? 'outside' : maze[x][y] === 0 ? 'wall' : solution[x][y] === 1 ? 'on the path' : 'dead end';
      const text =
        why === 'outside'
          ? `${at} is outside the maze, so is_safe is False and the call returns False at once.`
          : why === 'wall'
            ? `${at} is a wall, so is_safe is False and the call returns False at once.`
            : why === 'on the path'
              ? `${at} is already on the path (visited), so the call returns False: stepping back would only walk in a circle.`
              : `${at} was entered before and failed. visited is never cleared, so it is not explored a second time: the call returns False.`;
      calls.push({ x, y, move: null, rejected: why });
      snap(L.reject, tried + text, {
        cursor: from ? { r: from.x, c: from.y, role: 'active' } : undefined,
        cells: inside(x, y) ? { [`${x},${y}`]: 'bad' } : {},
        lines: arrow.map((a) => ({ ...a, role: 'bad' })),
        top: 'bad',
        vars: [['x, y', at]],
      });
      calls.pop();
      events.push(['ret', x, y, false]);
      return false;
    }
    visited[x][y] = true;
    solution[x][y] = 1;
    entered += 1;
    const call: Call = { x, y, move: null };
    calls.push(call);
    snap(
      L.enter,
      from
        ? `${tried}${at} is open and not visited yet. Enter it: mark it visited and put it on the path (solution[${x}][${y}] = 1).`
        : `solve_maze_util(0, 0): the start is open, so mark it visited and put it on the path (solution[0][0] = 1).`,
      { cursor: { r: x, c: y, role: 'active' }, cells: { [`${x},${y}`]: 'active' }, lines: arrow, vars: [['x, y', at]] },
    );
    if (x === n - 1 && y === n - 1) {
      route = calls.map((k): [number, number] => [k.x, k.y]);
      snap(L.goal, `${at} is the goal: return True. Every open call returns True at once, and solution keeps exactly the cells of this path.`, {
        cursor: { r: x, c: y, role: 'good' },
        cells: { [`${x},${y}`]: 'good' },
        top: 'good',
        vars: [['x, y', at]],
      });
      calls.pop();
      events.push(['ret', x, y, true]);
      return true;
    }
    for (let d = 0; d < MOVES.length; d++) {
      call.move = d;
      const [dx, dy] = MOVES[d];
      if (util(x + dx, y + dy, { x, y, move: d })) {
        calls.pop();
        events.push(['ret', x, y, true]);
        return true;
      }
    }
    call.move = null;
    solution[x][y] = 0;
    const parent = calls[calls.length - 2];
    snap(
      L.deadEnd,
      `No move from ${at} leads to the goal. Take it off the path (solution[${x}][${y}] = 0) but leave it visited, so no other route enters it again. ` +
        (parent ? `Return False to (${parent.x}, ${parent.y}), which tries its next move.` : 'Return False to solve_maze.'),
      { cursor: { r: x, c: y, role: 'bad' }, top: 'bad', vars: [['x, y', at]] },
    );
    calls.pop();
    events.push(['ret', x, y, false]);
    return false;
  };

  snap(
    L.start,
    rows === cols
      ? `solve_maze: a ${n} x ${n} maze (hatched cells are walls). The rat starts at S = (0, 0) and wants G = (${n - 1}, ${n - 1}). From every cell it tries right, down, left and up, in that order.`
      : `solve_maze: a maze with ${rows} rows of ${cols} cells.`,
  );
  let result: number[][] | null = null;
  if (rows !== cols) {
    snap(L.shape, `len(maze) is ${rows}, but the rows have ${cols} cells each: only square mazes are supported, so solve_maze returns None without searching.`, {
      bands: [{ r0: 0, c0: 0, r1: rows - 1, c1: cols - 1, role: 'bad' }],
    });
  } else if (maze[0][0] === 0 || maze[n - 1][n - 1] === 0) {
    const which = maze[0][0] === 0 ? '(0, 0), the start,' : `(${n - 1}, ${n - 1}), the goal,`;
    snap(L.corners, `${which} is a wall, so no path can exist: solve_maze returns None without searching.`, {
      cells: maze[0][0] === 0 ? { '0,0': 'bad' } : { [`${n - 1},${n - 1}`]: 'bad' },
    });
  } else {
    const found = util(0, 0);
    if (found) result = solution.map((r) => [...r]);
    const length = solution.flat().filter((v) => v === 1).length;
    snap(
      L.result,
      found
        ? `solve_maze returns the solution matrix: ${length} cells from S to G (aqua), found after ${callCount} calls. Moves are tried in a fixed order, so this is the first path in that order, not necessarily the shortest.`
        : `solve_maze returns None: G cannot be reached from S. The search made ${callCount} calls, and entered each of the ${entered} reachable cells once.`,
      found ? { path: route, cells: { [`${n - 1},${n - 1}`]: 'good' } } : {},
    );
  }
  return { frames, events, solution: result };
}
