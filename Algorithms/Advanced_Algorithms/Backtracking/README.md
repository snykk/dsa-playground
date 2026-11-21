# Backtracking Algorithms

Backtracking builds a solution one choice at a time and undoes a choice as soon as it cannot lead anywhere. The four searches here share that loop of choose, check, recurse, undo. They differ in what a choice is, what the check tests and how much the check can prune.

## Topics

Read them in this order.

| # | Topic | What it adds | Level |
|---|-------|--------------|-------|
| 1 | [Rat in a Maze](Rat_in_a_Maze/) | The smallest search. A path through open cells, four moves, and a visited mark that keeps it polynomial. | Beginner |
| 2 | [N-Queens Problem](N_Queens_Problem/) | One queen per row, so a choice is a column. The check looks at the column and both diagonals above. | Intermediate |
| 3 | [Graph Coloring](Graph_Coloring/) | A choice is a color for the next vertex. The check looks at its neighbors. Also finds the chromatic number. | Intermediate |
| 4 | [Sudoku Solver](Sudoku_Solver/) | A choice is a digit for the first empty cell. The check covers the row, column and 3 x 3 box, and the givens are validated first. | Intermediate |

All four follow one template: a state (the partial solution), a choice, a constraint check and an undo that restores the state before the next choice. The searches stop at the first solution, except N-Queens with `find_all = True`, which visits every branch.

## How They Compare

| Problem | Choice at each step | Best | Worst | Extra space |
|---------|---------------------|------|-------|-------------|
| Rat in a Maze | a direction: right, down, left, up | O(n^2) | O(n^2) | O(n^2) |
| N-Queens | a column for the current row | less than n! | O(n^2 * n!) | O(n^2) |
| Graph Coloring | a color from 1 to m for the next vertex | O(V^2) | O(V * m^V) | O(V) |
| Sudoku | a digit from 1 to 9 for the first empty cell | O(k) | O(9^k) | O(k) |

`n` is the maze or board side, `V` the number of vertices, `m` the number of colors and `k` the number of empty cells. The maze never revisits a cell, so a dead end is explored once and the search stays polynomial. In the other three a failure belongs to a whole partial assignment, not to one cell, and there are exponentially many of those, so they are exponential in the worst case. Space is for one search; N-Queens with `find_all = True` also keeps every board it finds. These are the bounds for the plain code here, which scans the board or matrix on each check.

## Choosing One

| Situation | Use | Why |
|-----------|-----|-----|
| First time with backtracking | Rat in a Maze | the state is a grid you can draw, and the visited mark shows why memory of failures matters |
| Place items so that none conflicts along lines | N-Queens | one item per row turns a search over squares into a search over columns |
| Assign one of m labels so that neighbors differ | Graph Coloring | works for any graph and also gives the chromatic number |
| A grid with many rules and fixed givens | Sudoku Solver | it shows validation of the input and a check over three groups at once |
| A shortest route in a maze | [BFS](../../Graph_Algorithms/Traversal/BFS/) | backtracking returns the first path it finds, not the shortest |
| The same subproblems appear again and again | [Dynamic Programming](../../Dynamic_Programming/) | it stores answers that backtracking recomputes |

## Common Pitfalls

- Forgetting to undo: reset the state after a failed branch (`board[row][col] = 0`, `color[v] = 0`, `solution[x][y] = 0`), or a stale choice blocks later branches.
- Saving the live state: N-Queens must copy the board into the result, or the saved reference is empty after the search backtracks.
- Un-marking visited cells in the maze makes the search exponential on open mazes.
- Expecting the best solution: the maze returns the first path in the order right, down, left, up, and `graph_coloring` returns some coloring in `1..m`. Use `chromatic_number` for the minimum.
- In Graph Coloring and Sudoku, 0 means uncolored or empty, so valid colors and digits start at 1.

## Related

- [DFS](../../Graph_Algorithms/Traversal/DFS/): read first.
- [Advanced Algorithms](../): the parent overview of both sub-areas.
- [Specialized Techniques](../Specialized_Techniques/): the other sub-area, for range and tree queries.
- [Dynamic Programming](../../Dynamic_Programming/): for problems whose subproblems repeat.
- [BFS](../../Graph_Algorithms/Traversal/BFS/): for the shortest route.
