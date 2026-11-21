# Rat in a Maze -- Go Implementation

## Files

- `main.go`: `isSafe`, `solveMazeUtil`, `solveMaze`, `printSolution` and a demo `main`.
- `main_test.go`: tests (example maze, no path, `is_safe`, a path that needs upward moves, path validity, a 30 x 30 maze with the goal walled off, 1 x 1 and empty mazes, non-square rejection).

## API

- `solveMaze(maze [][]int) [][]int`: returns a matrix with 1 on the path cells, or `nil` (no path, empty, non-square, blocked start or goal). Moves: right, down, left, up.
- `isSafe(maze, x, y, n)`: true if `(x, y)` is inside the grid and open.
- `printSolution(solution)`: prints the matrix.

## Go-Specific Notes

- Everything is in `package main` and unexported.
- Go grows the stack as needed, so deep recursion on large mazes is not a problem as it is in Python.

## How to Run

```bash
go test ./...
```

## Key Takeaways

- Mark the route, retreat from dead ends, and never re-enter a visited cell: O(n^2).
- Four directions are needed for general mazes.
- The path is not the shortest; use BFS for that.
