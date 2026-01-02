# Rat in a Maze - Python

This folder contains a Python implementation of **Rat in a Maze** problem using backtracking.

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
| `is_safe(maze, x, y, n)` | Check if position is valid | O(1) |
| `solve_maze(maze)` | Find path from (0,0) to (n-1,n-1) | O(2^(n×n)) worst case |

---

## Complexity

| Operation | Time Complexity | Space Complexity |
|-----------|----------------|------------------|
| Find Path | O(2^(n×n)) worst case | O(n²) |
| Safety Check | O(1) | O(1) |

---

## Usage

```python
from rat_in_maze import solve_maze, print_solution

maze = [
    [1, 0, 0, 0],
    [1, 1, 0, 1],
    [0, 1, 0, 0],
    [1, 1, 1, 1]
]

solution = solve_maze(maze)
if solution:
    print_solution(solution)
```

---

## Running Tests

```bash
python rat_in_maze_test.py
```

---

_Last Updated: December 2025_

