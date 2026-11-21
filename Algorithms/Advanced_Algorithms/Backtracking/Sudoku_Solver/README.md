# Sudoku Solver

A 9 x 9 Sudoku must be filled so that every row, column and 3 x 3 box contains each digit 1 to 9 exactly once. The solver in this folder first checks that the given digits do not conflict, then fills the first empty cell with each legal digit in turn and backtracks when a later cell has no legal digit.

## Intuition

Solve it like a person who guesses in pencil. Take the first blank, write a digit that does not clash with its row, column or box, and move on. If you later reach a blank where no digit fits, one of your earlier guesses was wrong: rub out the last guess, try the next digit there, and continue. The search is exhaustive, so if a solution exists it finds one.

Invariant: at every call, all filled cells are mutually consistent. A digit is written only after `is_valid` checks its row, column and box, and the givens are checked once at the start by `is_valid_puzzle`.

## Visual

```text
5 3 . | . 7 . | . . .        first blank is (0,2)
6 . . | 1 9 5 | . . .        row has 5 3 7, column has 8,
. 9 8 | . . . | . 6 .        box has 5 3 6 9 8
------+-------+------        -> only 1, 2, 4 are legal; try 1 first
8 . . | . 6 . | . . 3
4 . . | 8 . 3 | . . 1        solved (unique solution):
7 . . | . 2 . | . . 6        5 3 4 | 6 7 8 | 9 1 2   first row
------+-------+------        ...
. 6 . | . . . | 2 8 .
. . . | 4 1 9 | . . 5
. . . | . 8 . | . 7 9
```

## How It Works

1. `solve_sudoku(board)` calls `is_valid_puzzle(board)`: the board must be 9 x 9, every value 0..9, and no digit repeated in a row, column or box among the givens. Otherwise it returns `False` and leaves the board unchanged.
2. `find_empty` returns the first cell equal to 0 (row by row). With none left, the puzzle is solved.
3. For each digit 1..9 accepted by `is_valid(board, row, col, num)`, write it and recurse.
4. If the recursion fails, reset the cell to 0 and try the next digit. After nine failures return `False`.

## Step-by-Step Trace

Start of the search on the puzzle above:

| Event | Cell | Digit | What happens |
|-------|------|-------|--------------|
| 1 | (0,2) | 1 | placed |
| 2 | (0,3) | 2 | placed |
| 3 | (0,5) | 4 | placed |
| 4 | (0,6) | 8 | placed |
| 5 | (0,7) | 9 | placed; (0,8) then has no legal digit |
| 6 | (0,7) | - | undone, no other digit fits |
| 7 | (0,6) | - | undone, 8 failed |
| 8 | (0,6) | 9 | placed; (0,7) then has no legal digit, undone again |
| 9 | (0,5) | 6 | the 4 is undone too, then 6 is placed |

In total this puzzle (51 blanks) takes 4,209 calls of the recursive search and 4,157 undone placements.

## Complexity

| Case | Time | Space |
|------|------|-------|
| Best | O(k) | O(k) |
| Worst | O(9^k) | O(k) |

`k` is the number of empty cells. Each level tries at most nine digits, giving at most 9^k leaves; each node does constant work on a fixed 9 x 9 board (an 81-cell scan plus up to 27 cells per `is_valid`). The board is solved in place; the extra space is the recursion depth `k`.

## When to Use

- Solving or verifying standard 9 x 9 puzzles.
- Learning backtracking on a constraint problem.
- For hard puzzles or bulk solving, branch on the cell with the fewest candidates (a copy of this search with that rule needs 52 calls on the example) or use exact cover. These are not implemented here.

## Sudoku Solver vs. Alternatives

| Approach | Idea | Calls on the example puzzle |
|----------|------|-----------------------------|
| Plain backtracking (this folder) | first empty cell, digits 1..9 | 4,209 |
| Most constrained cell first | fewest legal digits next | 52 (measured in a scratch experiment, not in the repository) |
| Exact cover (Dancing Links) | model as exact cover | not implemented here |

## Common Pitfalls

- Trusting the givens: duplicate givens or a full invalid board would look solved without `is_valid_puzzle`.
- Wrong box origin: it is `(row // 3) * 3` and `(col // 3) * 3`.
- Not resetting a cell after a failed branch.
- A puzzle can have valid givens and still no solution: the solver returns `False` and the board is restored.
- Several solutions: only the first in digit order is returned.

## Implementations

| Language | Folder | Main file | Notes |
|----------|--------|-----------|-------|
| Python | [Python](Python/) | `sudoku_solver.py` | `solve_sudoku`, `is_valid_puzzle`, `is_valid`, `find_empty`, `print_board` |
| C++ | [C++](C++/) | `sudoku_solver.cpp` | `solveSudoku`, `isValidPuzzle`, `isValid`, `findEmpty`, `printBoard`; boards are `vector<vector<int>>` |
| Go | [Go](Go/) | `main.go` | `solveSudoku`, `isValidPuzzle`, `isValid`, `findEmpty`, `printBoard` |

## Practice Problems

- [Sudoku Solver (LeetCode 37)](https://leetcode.com/problems/sudoku-solver/)
- [Valid Sudoku (LeetCode 36)](https://leetcode.com/problems/valid-sudoku/)

## Related

- [N-Queens Problem](../N_Queens_Problem/README.md)
- [Graph Coloring](../Graph_Coloring/README.md)
- [Rat in a Maze](../Rat_in_a_Maze/README.md)
