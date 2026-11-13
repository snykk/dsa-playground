# Sudoku Solver -- Go Implementation

## Files

- `main.go`: `isValidPuzzle`, `isValid`, `findEmpty`, `searchSudoku`, `solveSudoku`, `printBoard` and a demo `main`.
- `main_test.go`: tests (the example puzzle against its exact solution, `is_valid`, duplicates in row, column and box, out-of-range values, bad shapes, an unsolvable puzzle that must restore the board, an already solved board, an empty board).

## API

- `solveSudoku(board [][]int) bool`: solves in place and returns `true`; returns `false` and leaves the board unchanged if the givens conflict, a value is outside 0..9, the shape is not 9 x 9, or there is no solution.
- `isValidPuzzle(board)`: shape, range and conflicts among the givens.
- `isValid(board, row, col, num)`: true if `num` is legal at the cell.
- `findEmpty(board)`: returns `(row, col, found)`.
- `printBoard(board)`: prints the board.

## Go-Specific Notes

- A slice of slices is passed by reference, so the caller's board is modified in place.
- Everything is in `package main` and unexported.

## How to Run

```bash
go test ./...
```

## Key Takeaways

- Validate the givens once, then search.
- Fill the first empty cell with each legal digit and undo on failure.
- A failed solve restores the board; plain backtracking is exponential in the worst case.
