# N-Queens Problem -- C++ Implementation

## Files

- `n_queens.cpp`: `isSafe`, `solveNQueensUtil`, `solveNQueens`, `printSolution`; `main` is compiled out with `-DIS_TEST_BUILD`.
- `n_queens_test.cpp`: assert-based tests (n = 4, first solution, n = 8, `isSafe`, OEIS counts for n = 0..9, no solution for 2 and 3, board validity, lexicographically first solution).

## API

- `solveNQueens(int n, bool findAll = false)`: returns `vector<vector<vector<int>>>`, a list of n x n boards with 1 for a queen. Empty when there is no solution.
- `isSafe(board, row, col, n)`: true if no queen above `(row, col)` attacks it.
- `printSolution(board)`: prints `Q` and `.`.

## C++-Specific Notes

- `n_queens_test.cpp` includes the `.cpp` directly; compile one file with `IS_TEST_BUILD` defined.
- Any C++11 compiler works for the solver; the commands below use C++17.
- Boards are copied with `push_back` when a solution is found.

## How to Run

```bash
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD n_queens_test.cpp -o n_queens_test && ./n_queens_test
```

## Key Takeaways

- One queen per row turns the problem into a choice of columns.
- Check only the column and the two upper diagonals; undo after a failed branch.
- Counts for n = 0..9 are 1, 1, 0, 0, 2, 10, 4, 40, 92, 352.
