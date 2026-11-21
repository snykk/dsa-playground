# Rat in a Maze -- C++ Implementation

## Files

- `rat_in_maze.cpp`: `isSafe`, `solveMazeUtil`, `solveMaze`, `printSolution`; `main` is compiled out with `-DIS_TEST_BUILD`.
- `rat_in_maze_test.cpp`: assert-based tests (example maze, no path, `is_safe`, a path that needs upward moves, path validity, a 30 x 30 maze with the goal walled off, 1 x 1 and empty mazes, non-square rejection).

## API

- `solveMaze(maze)`: `maze` is `vector<vector<int>>` (1 open, 0 wall). Returns `optional<vector<vector<int>>>` with 1 on the path cells, or `nullopt` (no path, empty, non-square, blocked start or goal). Moves: right, down, left, up.
- `isSafe(maze, x, y, n)`: true if `(x, y)` is inside the grid and open.
- `printSolution(solution)`: prints the matrix.

## C++-Specific Notes

- Needs C++17 for `std::optional` and structured bindings in the test.
- The test file includes the `.cpp` directly; define `IS_TEST_BUILD` to drop the demo `main`.
- Recursion depth can reach n^2 frames on a winding maze.

## How to Run

```bash
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD rat_in_maze_test.cpp -o rat_in_maze_test && ./rat_in_maze_test
```

## Key Takeaways

- Mark the route, retreat from dead ends, and never re-enter a visited cell: O(n^2).
- Four directions are needed for general mazes.
- The path is not the shortest; use BFS for that.
