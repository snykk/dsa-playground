# Rat in a Maze -- Python Implementation

## Files

- `rat_in_maze.py`: `is_safe`, `solve_maze_util`, `solve_maze`, `print_solution`.
- `rat_in_maze_test.py`: unit tests (example maze, no path, `is_safe`, a path that needs up and left moves, path validity, a 30 x 30 maze with the goal walled off, 1 x 1 and empty mazes, non-square rejection).

## API

- `solve_maze(maze)`: `maze` is an n x n list of lists (1 open, 0 wall). Returns an n x n matrix with 1 on the cells of a path from `(0, 0)` to `(n-1, n-1)`, or `None` (no path, empty, non-square, or blocked start or goal). Moves: right, down, left, up.
- `is_safe(maze, x, y, n)`: true if `(x, y)` is inside the grid and open.
- `print_solution(solution)`: prints the matrix.

```python
from rat_in_maze import solve_maze

maze = [[1, 0, 0, 0], [1, 1, 0, 1], [0, 1, 0, 0], [1, 1, 1, 1]]
print(solve_maze(maze))
```

## Python-Specific Notes

- The search is recursive; a route longer than about 1,000 cells raises `RecursionError` (raise `sys.setrecursionlimit` for large mazes).
- Python 3.9 and later.

## How to Run

```bash
python3 -m unittest rat_in_maze_test
```

## Key Takeaways

- Mark the route, retreat from dead ends, and never re-enter a visited cell: O(n^2).
- Four directions are needed for general mazes.
- The path is not the shortest; use BFS for that.
