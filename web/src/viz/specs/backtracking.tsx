import { countSteps } from '../algorithms/backtracking';
import { COLORING_CODE, coloringTrace, parseColoring, type ColoringInput } from '../algorithms/graphColoring';
import { QUEENS_CODE, parseQueens, queensTrace, type QueensInput } from '../algorithms/nQueens';
import { MAZE_CODE, formatMaze, mazeTrace, parseMaze, type MazeInput } from '../algorithms/ratInMaze';
import { SUDOKU_CODE, formatSudoku, parseSudoku, sudokuTrace, type SudokuInput } from '../algorithms/sudoku';
import type { VizSpec } from '../core/types';
import { BoardView, stabilizeBoard, type BoardState } from '../renderers/BoardView';
import { GraphView, type GraphState } from '../renderers/GraphView';
import { SYM } from '../ui/symbols';

const pick = <T,>(xs: readonly T[]): T => xs[Math.floor(Math.random() * xs.length)];
const rint = (lo: number, hi: number) => lo + Math.floor(Math.random() * (hi - lo + 1));

/** Draw random inputs until one passes the parser's limits and `keep` (a few tries at most). */
function valid<I>(make: () => string, parse: (text: string) => I, fallback: string, keep: (input: I) => boolean = () => true): string {
  for (let attempt = 0; attempt < 60; attempt++) {
    const text = make();
    try {
      if (keep(parse(text))) return text;
    } catch {
      // too many steps: draw again
    }
  }
  return fallback;
}

/* ---------- N-Queens ---------- */

export const nQueensSpec: VizSpec<QueensInput, BoardState> = {
  id: 'n-queens',
  title: 'N-Queens',
  inputKind: 'n-queens',
  inputLabel: 'Board size',
  inputHelp:
    'The board size n, from 1 to 8 ("n 6"). The search stops at the first solution, as solve_n_queens does by default; add "all" ("n 5, all") for find_all=True, ' +
    'which collects every solution (n up to 6, so the run stays under 2,000 steps).',
  examples: [
    { label: '4 queens (article)', value: 'n 4' },
    { label: '4 queens, all solutions', value: 'n 4, all' },
    { label: 'No solution: n = 3', value: 'n 3' },
    { label: '6 queens: long backtrack', value: 'n 6' },
    { label: '8 queens', value: 'n 8' },
  ],
  randomInput: () => valid(() => (Math.random() < 0.3 ? `n ${rint(4, 5)}, all` : `n ${rint(4, 8)}`), parseQueens, 'n 5'),
  parse: parseQueens,
  trace: (input) => stabilizeBoard(queensTrace(input).frames),
  render: (state) => <BoardView state={state} />,
  pseudocode: QUEENS_CODE,
  legend: [
    { role: 'compare', label: 'square being tested, and the lines is_safe scans' },
    { role: 'active', label: 'queen just placed or being lifted; the current call' },
    { role: 'done', label: 'queen on the board' },
    { role: 'good', label: `safe square, or a solution (${SYM.check})` },
    { role: 'bad', label: `queen that attacks the square, or a row with no safe column (${SYM.cross})` },
    { role: 'muted', label: `queen being lifted (outline); ${SYM.times} marks a column already tried in that row` },
  ],
  complexity: { time: 'O(n * n!) worst case: about n! placements, O(n) per is_safe', space: 'O(n^2) board, recursion n deep' },
};

/* ---------- Sudoku ---------- */

/** The solution of the repository's example puzzle (sudoku_solver_test.py). */
const SOLUTION = ['534678912', '672195348', '198342567', '859761423', '426853791', '713924856', '961537284', '287419635', '345286179'];

/** A random solved grid: the example solution with its digits relabelled and rows and columns shuffled within their bands. */
function randomSolvedGrid(): number[][] {
  const relabel = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
  const order = () => [0, 1, 2].sort(() => Math.random() - 0.5);
  const lines = () => order().flatMap((band) => order().map((k) => band * 3 + k));
  const rows = lines();
  const cols = lines();
  return rows.map((r) => cols.map((c) => relabel[Number(SOLUTION[r][c]) - 1]));
}

function randomSudoku(): string {
  const board = randomSolvedGrid();
  const cells = Array.from({ length: 81 }, (_, i) => i).sort(() => Math.random() - 0.5);
  for (const x of cells.slice(0, rint(8, 18))) board[Math.floor(x / 9)][x % 9] = 0;
  return formatSudoku(board);
}

export const sudokuSpec: VizSpec<SudokuInput, BoardState> = {
  id: 'sudoku-solver',
  title: 'Sudoku Solver',
  inputKind: 'sudoku',
  inputLabel: 'Grid: 9 rows of 9 digits, 0 or . for an empty cell',
  inputHelp:
    'Nine rows of nine digits separated by slashes or spaces, with 0 or . for an empty cell. The solver is the plain search of the repository, so a puzzle with many empty cells takes ' +
    'tens of thousands of steps: give a nearly complete grid (the player shows up to 2,000 steps).',
  examples: [
    {
      label: 'Two rows open: backtracking',
      value: '53..7..../6..195.../198342567/859761423/426853791/713924856/961537284/287419635/345286179',
    },
    {
      label: 'Top band open',
      value: '53..7..../6..195.../.98....6./859761423/426853791/713924856/961537284/287419635/345286179',
    },
    {
      label: 'Duplicate given (full board)',
      value: '334678912/672195348/198342567/859761423/426853791/713924856/961537284/287419635/345286179',
    },
    {
      label: 'Givens clash in a box',
      value: '53..7..../6..195.../398....6./8...6...3/4..8.3..1/7...2...6/.6....28./...419..5/....8..79',
    },
    {
      label: 'No solution',
      value: '12345678./........9/........./........./........./........./........./........./.........',
    },
  ],
  randomInput: () => valid(randomSudoku, parseSudoku, '53..7..../6..195.../198342567/859761423/426853791/713924856/961537284/287419635/345286179'),
  parse: parseSudoku,
  trace: (input) => stabilizeBoard(sudokuTrace(input).frames),
  render: (state) => <BoardView state={state} />,
  pseudocode: SUDOKU_CODE,
  legend: [
    { role: 'idle', label: 'bold digit on grey: a given, never changed' },
    { role: 'compare', label: 'row, column and box that is_valid scans' },
    { role: 'active', label: 'empty cell being filled, with the digit being tried' },
    { role: 'done', label: 'digit written by the search' },
    { role: 'good', label: `the digit fits (${SYM.check})` },
    { role: 'bad', label: `the digit already there, or a cell with no digit left (${SYM.cross})` },
    { role: 'muted', label: 'digit being undone' },
  ],
  complexity: { time: 'O(9^k) worst case for k empty cells', space: 'O(k) recursion; the board is solved in place' },
};

/* ---------- Rat in a Maze ---------- */

function randomMaze(): string {
  const n = rint(4, 8);
  const open = 0.58 + Math.random() * 0.17;
  const maze = Array.from({ length: n }, () => Array.from({ length: n }, () => (Math.random() < open ? 1 : 0)));
  maze[0][0] = 1;
  maze[n - 1][n - 1] = 1;
  return formatMaze(maze);
}

export const ratInMazeSpec: VizSpec<MazeInput, BoardState> = {
  id: 'rat-in-a-maze',
  title: 'Rat in a Maze',
  inputKind: 'maze',
  inputLabel: 'Maze: rows of 1 (open) and 0 (wall)',
  inputHelp:
    'Rows of 1 (open) and 0 (wall) separated by slashes or spaces, up to 10 x 10. The rat starts at the top-left cell and wants the bottom-right one. ' +
    'solve_maze only accepts square mazes and returns None for any other shape.',
  examples: [
    { label: 'Dead end first (article)', value: '11000/10011/11110/00011/00001' },
    { label: 'Needs up and left moves', value: '10111/10101/10101/11101/00001' },
    { label: 'Goal walled off', value: '11111/11111/11111/11110/11101' },
    { label: 'Python example', value: '1000/1101/0100/1111' },
    { label: 'Not square', value: '111/111' },
  ],
  // A maze whose start is boxed in ends after a few steps: keep the ones that explore.
  randomInput: () => valid(randomMaze, parseMaze, '1000/1101/0100/1111', (input) => countSteps((counter) => mazeTrace(input, counter)) >= 24),
  parse: parseMaze,
  trace: (input) => stabilizeBoard(mazeTrace(input).frames),
  render: (state) => <BoardView state={state} />,
  pseudocode: MAZE_CODE,
  legend: [
    { role: 'idle', label: 'hatched cell: a wall; S start, G goal' },
    { role: 'active', label: 'the rat: the cell of the current call' },
    { role: 'compare', label: 'move being tried' },
    { role: 'done', label: 'cell on the path (solution = 1)' },
    { role: 'muted', label: 'dead end: visited, off the path, never entered again' },
    { role: 'bad', label: `rejected move: outside, a wall or visited (${SYM.cross})` },
    { role: 'good', label: `goal reached (${SYM.check})` },
  ],
  complexity: { time: 'O(n^2): every cell is entered at most once', space: 'O(n^2): solution, visited and up to n^2 calls' },
};

/* ---------- Graph Coloring ---------- */

function randomGraph(): string {
  const n = rint(4, 7);
  const p = 0.3 + Math.random() * 0.3;
  const edges: string[] = [];
  for (let a = 0; a < n; a++) for (let b = a + 1; b < n; b++) if (Math.random() < p) edges.push(`${a}-${b}`);
  if (edges.length === 0) edges.push('0-1');
  const top = Math.max(...edges.flatMap((e) => e.split('-').map(Number)));
  const parts = [...(top + 1 < n ? [`n ${n}`] : []), edges.join(', '), Math.random() < 0.3 ? 'chromatic' : `m ${pick([2, 3, 3, 4])}`];
  return parts.join('; ');
}

export const graphColoringSpec: VizSpec<ColoringInput, GraphState> = {
  id: 'graph-coloring',
  title: 'Graph Coloring',
  inputKind: 'graph-coloring',
  inputLabel: 'Edges and the number of colors',
  inputHelp:
    'Edges between vertices numbered from 0, like "0-1, 1-2", then "; m 3" for graph_coloring with 3 colors or "; chromatic" for chromatic_number. ' +
    '"n 6" adds vertices without edges up to 5. Up to 8 vertices, 20 edges and m = 6; a search that needs more than 2,000 steps is refused.',
  examples: [
    { label: 'Article graph, m = 3', value: '0-1, 0-2, 0-3, 1-2, 2-3; m 3' },
    { label: 'Same graph, m = 2: none', value: '0-1, 0-2, 0-3, 1-2, 2-3; m 2' },
    { label: 'Chromatic number', value: '0-1, 0-2, 0-3, 1-2, 2-3; chromatic' },
    { label: 'Path 0-2-3-1: backtrack', value: '0-2, 2-3, 1-3; m 2' },
    { label: 'Odd cycle C5', value: '0-1, 1-2, 2-3, 3-4, 0-4; chromatic' },
  ],
  randomInput: () => valid(randomGraph, parseColoring, '0-1, 0-2, 0-3, 1-2, 2-3; m 3'),
  parse: parseColoring,
  trace: (input) => coloringTrace(input).frames,
  render: (state) => <GraphView state={state} />,
  pseudocode: COLORING_CODE,
  legend: [
    { role: 'active', label: 'vertex being colored; the badge c2? is the color tried' },
    { role: 'compare', label: 'its neighbors, scanned by is_safe' },
    { role: 'done', label: 'colored vertex: badge cK means color K' },
    { role: 'bad', label: `neighbor that already has the color, or a vertex with no color left (${SYM.cross})` },
    { role: 'good', label: `every vertex colored (${SYM.check})` },
    { role: 'muted', label: 'graph_coloring returned None: m colors are not enough' },
  ],
  complexity: { time: 'O(V * m^V) worst case: m^V assignments, O(V) per is_safe', space: 'O(V): the color array and V nested calls' },
};
