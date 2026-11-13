# N-Queens Problem -- Go Implementation

## Files

- `main.go`: `isSafe`, `solveNQueensUtil`, `solveNQueens`, `solveNQueensAll`, `printSolution` and a demo `main`.
- `main_test.go`: tests (n = 4, first solution, n = 8, `isSafe`, OEIS counts for n = 0..9, no solution for 2 and 3, board validity, lexicographically first solution).

## API

- `solveNQueens(n int, findAll bool) [][]int`: returns ONE board (`nil` if none), even with `findAll = true`, where it returns the first of all solutions.
- `solveNQueensAll(n int) [][][]int`: returns every solution.
- `isSafe(board, row, col, n)`: true if no queen above `(row, col)` attacks it.
- `printSolution(board)`: prints `Q` and `.`.

## Go-Specific Notes

- The Go API differs from Python and C++: `solveNQueens(n, true)` does not return all boards. Call `solveNQueensAll`.
- Functions are unexported and live in `package main`.
- Solutions are deep-copied row by row before being stored.

## How to Run

```bash
go test ./...
```

## Key Takeaways

- One queen per row turns the problem into a choice of columns.
- Check only the column and the two upper diagonals; undo after a failed branch.
- Counts for n = 0..9 are 1, 1, 0, 0, 2, 10, 4, 40, 92, 352.
