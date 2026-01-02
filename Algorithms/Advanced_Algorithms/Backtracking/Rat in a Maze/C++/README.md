# Rat in a Maze - C++

This folder contains a C++ implementation of **Rat in a Maze** problem using backtracking.

---

## Concept

Finds a path from the top-left corner to the bottom-right corner of a maze using backtracking. The maze is represented as a 2D array where 1 represents an open path and 0 represents a wall.

**Key Features:**
- Backtracking pathfinding
- Finds valid path if one exists
- Marks solution path in result matrix

---

## Functions

| Function | Description | Time Complexity |
|----------|-------------|----------------|
| `isSafe(maze, x, y, n)` | Check if position is valid | O(1) |
| `solveMaze(maze)` | Find path from (0,0) to (n-1,n-1) | O(2^(n×n)) worst case |

---

## Complexity

| Operation | Time Complexity | Space Complexity |
|-----------|----------------|------------------|
| Find Path | O(2^(n×n)) worst case | O(n²) |
| Safety Check | O(1) | O(1) |

---

## Usage

```cpp
#include "rat_in_maze.cpp"

vector<vector<int>> maze = {
    {1, 0, 0, 0},
    {1, 1, 0, 1},
    {0, 1, 0, 0},
    {1, 1, 1, 1}
};

auto solution = solveMaze(maze);
if (solution.has_value()) {
    printSolution(solution.value());
}
```

---

## Running Tests

```bash
g++ -o test rat_in_maze_test.cpp && ./test
```

---

_Last Updated: December 2025_

