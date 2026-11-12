# Rat in a Maze

A rat starts in the top-left cell of an n x n grid and must reach the bottom-right cell, moving through open cells only. The backtracking solver in this folder tries right, down, left and up, marks the cells it enters, and returns one path (not necessarily the shortest) or reports that there is none.

## Intuition

Walk through a maze with a piece of chalk. At every junction you pick a direction. If you reach a dead end you walk back, rub out your chalk marks on that branch, and try another direction. The one extra rule that keeps this fast: remember every cell you have already entered and never enter it again, because if it led nowhere once it will lead nowhere again.

Invariant: `solution` marks exactly the cells on the route currently being explored. `visited` marks every cell that has been entered and is never cleared, so each cell is entered at most once.

## Visual

```text
maze (# = wall)         path found by the code (1 = on path)

S . # # #               1 0 0 0 0
. # # . .               1 0 0 0 0
. . . . #               1 1 1 1 0
# # # . .               0 0 0 1 1
# # # # E               0 0 0 0 1

(0,1) is tried first (right of the start) and is a dead end: it is undone.
```

## How It Works

1. `solve_maze` returns `None` if the maze is empty, not square, or the start or goal is a wall.
2. `solve_maze_util(maze, x, y, n, solution, visited)` rejects a cell that is outside the grid, a wall (`is_safe`), or already visited.
3. Otherwise it marks the cell in `visited` and `solution`. At `(n-1, n-1)` it returns true.
4. It then tries the neighbors in the order right, down, left, up. The first success ends the search.
5. If none works, it resets `solution[x][y] = 0` and returns false. `visited` stays set.

## Step-by-Step Trace

For the maze above the cells are entered in this order: `(0,0)`, `(0,1)`, `(1,0)`, `(2,0)`, `(2,1)`, `(2,2)`, `(2,3)`, `(3,3)`, `(3,4)`, `(4,4)`.

| Cell entered | What happens |
|--------------|--------------|
| (0,0) | start; right is `(0,1)` |
| (0,1) | dead end: right is a wall, down is a wall, left is visited: undone |
| (1,0) | down from the start |
| (2,0) | down; right `(2,1)` is next |
| (2,1), (2,2), (2,3) | straight along row 2; `(2,4)` is a wall, so down |
| (3,3), (3,4) | right along row 3; down from `(3,4)` |
| (4,4) | goal: the search succeeds (17 calls in total, including rejected cells) |

## Complexity

| Case | Time | Space |
|------|------|-------|
| Worst | O(n^2) | O(n^2) |

Each of the n^2 cells is entered at most once, with four constant-time neighbor checks. Space is the `solution` and `visited` matrices plus a recursion stack that can reach n^2 frames in a winding maze. Without `visited` (only un-marking on the way out) the search is exponential: an open 12 x 12 maze with the goal walled off took about 0.65 s in Python with a right-and-down-only search and no dead-end memory, and each size step multiplied the time by about four.

## When to Use

- You only need some path through a grid, or a yes/no answer.
- You are learning the choose, explore, undo pattern.
- Use BFS when the path must be shortest.

## Rat in a Maze vs. Alternatives

| Approach | Result | Time |
|----------|--------|------|
| DFS with visited (this folder) | some path | O(n^2) |
| [BFS](../../../Graph_Algorithms/Traversal/BFS/README.md) | a shortest path | O(n^2) |
| Right and down only | a monotone path; misses mazes that need up or left | exponential without memo |

## Common Pitfalls

- Moving only right and down fails on mazes that need an upward or left move.
- Clearing `visited` on backtracking makes the search exponential.
- Leaving `solution = 1` on a dead end gives a path with extra cells.
- Reading `maze[x][y]` before the bounds check.
- The path is not shortest; it depends on the move order.
- Python: a route longer than about 1,000 cells raises `RecursionError`.

## Implementations

| Language | Folder | Main file | Notes |
|----------|--------|-----------|-------|
| Python | [Python](Python/) | `rat_in_maze.py` | `solve_maze(maze)` returns a matrix or `None` |
| C++ | [C++](C++/) | `rat_in_maze.cpp` | `solveMaze(maze)` returns `optional<vector<vector<int>>>` |
| Go | [Go](Go/) | `main.go` | `solveMaze(maze)` returns a matrix or `nil` |

Finding all paths is not implemented.

## Practice Problems

- [Shortest Path in Binary Matrix (LeetCode 1091)](https://leetcode.com/problems/shortest-path-in-binary-matrix/)
- [Number of Islands (LeetCode 200)](https://leetcode.com/problems/number-of-islands/)
- [Unique Paths III (LeetCode 980)](https://leetcode.com/problems/unique-paths-iii/)

## Related

- [N-Queens Problem](../N_Queens_Problem/README.md)
- [Sudoku Solver](../Sudoku_Solver/README.md)
- [Graph Coloring](../Graph_Coloring/README.md)
- [DFS](../../../Graph_Algorithms/Traversal/DFS/README.md)
