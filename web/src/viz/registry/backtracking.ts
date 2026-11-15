/** Visualization registry: Backtracking (graph coloring, N-Queens, rat in a maze, Sudoku). */
import type { AnyVizSpec } from '../core/types';
import type { VizInfo } from '../catalog';

const B = 'Algorithms/Advanced_Algorithms/Backtracking';

export const entries: VizInfo[] = [
  {
    id: 'rat-in-a-maze',
    title: 'Rat in a Maze',
    group: 'Backtracking',
    blurb: 'Right, down, left, up from every cell: the path grows, backs off dead ends, and a visited cell is never entered twice.',
    topics: [`${B}/Rat_in_a_Maze`, B],
  },
  {
    id: 'n-queens',
    title: 'N-Queens',
    group: 'Backtracking',
    blurb: 'One queen per row: is_safe scans the column and both diagonals above, and a row with no safe square lifts the queen above it.',
    topics: [`${B}/N_Queens_Problem`, B],
  },
  {
    id: 'graph-coloring',
    title: 'Graph Coloring',
    group: 'Backtracking',
    blurb: 'Vertices in index order get the smallest color no neighbor has; a vertex with no color left undoes the one before it.',
    topics: [`${B}/Graph_Coloring`, B],
  },
  {
    id: 'sudoku-solver',
    title: 'Sudoku Solver',
    group: 'Backtracking',
    blurb: 'The givens are checked first, then the first empty cell takes 1..9 against its row, column and box, undoing digits that lead nowhere.',
    topics: [`${B}/Sudoku_Solver`, B],
  },
];

export const loaders: Record<string, () => Promise<AnyVizSpec>> = {
  'rat-in-a-maze': () => import('../specs/backtracking').then((m) => m.ratInMazeSpec),
  'n-queens': () => import('../specs/backtracking').then((m) => m.nQueensSpec),
  'graph-coloring': () => import('../specs/backtracking').then((m) => m.graphColoringSpec),
  'sudoku-solver': () => import('../specs/backtracking').then((m) => m.sudokuSpec),
};
