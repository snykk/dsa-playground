# Sudoku Solver -- C++ Implementation

## Files

- `sudoku_solver.cpp`: `isValidPuzzle`, `isValid`, `findEmpty`, the static `searchSudoku`, `solveSudoku`, `printBoard`; `main` is compiled out with `-DIS_TEST_BUILD`.
- `sudoku_solver_test.cpp`: assert-based tests (the example puzzle against its exact solution, `is_valid`, duplicates in row, column and box, out-of-range values, bad shapes, an unsolvable puzzle that must restore the board, an already solved board, an empty board).

## API

- `solveSudoku(vector<vector<int>>& board)`: solves in place and returns `true`; returns `false` and leaves the board unchanged if the givens conflict, a value is outside 0..9, the shape is not 9 x 9, or there is no solution.
- `isValidPuzzle(board)`: shape, range and conflicts among the givens.
- `isValid(board, row, col, num)`: true if `num` is legal at the cell.
- `findEmpty(board)`: `optional<pair<int, int>>` of the first 0.
- `printBoard(board)`: prints the board.

## C++-Specific Notes

- Needs C++17 for `std::optional`.
- The test file includes the `.cpp` directly; define `IS_TEST_BUILD` to drop the demo `main`.
- The board is `vector<vector<int>>`, not a fixed array, so its shape is validated at run time.

## How to Run

```bash
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD sudoku_solver_test.cpp -o sudoku_solver_test && ./sudoku_solver_test
```

## Key Takeaways

- Validate the givens once, then search.
- Fill the first empty cell with each legal digit and undo on failure.
- A failed solve restores the board; plain backtracking is exponential in the worst case.
