# N-Queens Problem

The N-Queens problem asks for n queens on an n x n chessboard such that no two queens attack each other. The solver in this folder places one queen per row with backtracking, and can return the first solution or all of them.

## Intuition

A queen attacks along its row, its column and both diagonals. Because two queens may never share a row, a solution has exactly one queen in each row. So the question for each row is only "which column?". The solver tries the columns from left to right and, as soon as a row has no safe column, it goes back to the previous row and moves that queen.

Invariant: when the recursion works on row `r`, the queens in rows `0..r-1` do not attack each other. A queen is placed only after `is_safe` checks the column above it and both upper diagonals, so any board with n queens is a valid solution.

## Visual

```text
n = 4, first solution found: columns [1, 3, 0, 2]

  . Q . .
  . . . Q
  Q . . .
  . . Q .

dead end met on the way (queens at row 0 col 0 and row 1 col 2):

  Q x x x        x = attacked square
  x x Q x        row 2 is completely attacked -> backtrack
  x x x x
  x . x x
```

## How It Works

1. `solve_n_queens(n, find_all)` creates an empty n x n board of 0 and 1.
2. The recursive helper handles `row`. If `row == n`, it stores a copy of the board; it then returns "stop" when only the first solution is wanted.
3. Otherwise it tries each `col`. `is_safe(board, row, col, n)` looks at the column above and the upper-left and upper-right diagonals; rows below are empty.
4. On a safe square it sets `board[row][col] = 1`, recurses into `row + 1`, and resets the square to 0 when the call returns without stopping the search.

## Step-by-Step Trace

Finding the first 4-queens solution (26 calls to `is_safe`):

| Placement so far (row: column) | Next row | Result |
|--------------------------------|----------|--------|
| 0:0 | 1 | columns 0 and 1 attacked, column 2 is the first safe one |
| 0:0, 1:2 | 2 | all four squares attacked: backtrack |
| 0:0, 1:3 | 2 | column 1 is the first safe one |
| 0:0, 1:3, 2:1 | 3 | all four squares attacked: backtrack, then row 0 gets column 1 |
| 0:1, 1:3, 2:0 | 3 | column 2 is the first safe one: solution |

## Complexity

| Case | Time | Space |
|------|------|-------|
| First solution | far below n! in practice (876 safety checks for n = 8) | O(n^2) board |
| All solutions | O(n^2 * n!) upper bound (15,720 safety checks for n = 8) | O(n^2) plus S boards stored |

At depth k the queens use k different columns, so there are at most n!/(n-k)! partial placements and about e * n! nodes overall. Each node tries all n squares of the next row with an O(n) safety scan each. Keeping every board costs n^2 memory per solution (S = number of solutions: 92 for n = 8).

## When to Use

- To learn backtracking with pruning, or to count and list solutions for small n.
- As a test for search code: the counts for n = 0..9 are 1, 1, 0, 0, 2, 10, 4, 40, 92, 352 (OEIS A000170), and the tests check them.
- For large n, use column and diagonal sets or bitmasks (O(1) safety check), or a local search such as min-conflicts. They are not implemented here.

## N-Queens vs. Alternatives

| Approach | Safety check | Notes |
|----------|--------------|-------|
| Board scan (this folder) | O(n) | simple, closest to the problem statement |
| Column and diagonal sets | O(1) | track column `c`, diagonal `r - c` and anti-diagonal `r + c` |
| Bitmasks | O(1) | fastest simple counter |
| [Graph Coloring](../Graph_Coloring/README.md) | per vertex O(V) | same choose, check, recurse, undo template |

## Common Pitfalls

- Saving the live `board` instead of a copy: every stored solution ends up as the same empty grid.
- Forgetting `board[row][col] = 0` after a failed branch.
- Checking only one diagonal direction.
- Go: `solveNQueens(n, true)` returns one board, not all. Use `solveNQueensAll(n)`.
- `n = 2` and `n = 3` have no solution; `n = 0` has one (the empty board).

## Implementations

| Language | Folder | Main file | Notes |
|----------|--------|-----------|-------|
| Python | [Python](Python/) | `n_queens.py` | `solve_n_queens(n, find_all=False)` returns a list of boards |
| C++ | [C++](C++/) | `n_queens.cpp` | `solveNQueens(n, findAll = false)` returns `vector<vector<vector<int>>>` |
| Go | [Go](Go/) | `main.go` | `solveNQueens(n, findAll)` returns one board; `solveNQueensAll(n)` returns all |

## Practice Problems

- [Eight Queens (Kattis 8queens)](https://open.kattis.com/problems/8queens)
- [N-Queens (LeetCode 51)](https://leetcode.com/problems/n-queens/)
- [N-Queens II (LeetCode 52)](https://leetcode.com/problems/n-queens-ii/)
- [Chessboard and Queens (CSES 1624)](https://cses.fi/problemset/task/1624)

## Related

- [Sudoku Solver](../Sudoku_Solver/README.md)
- [Graph Coloring](../Graph_Coloring/README.md)
- [Rat in a Maze](../Rat_in_a_Maze/README.md)
