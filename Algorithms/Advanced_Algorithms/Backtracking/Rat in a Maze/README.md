# Rat in a Maze

The **Rat in a Maze** problem is a classic pathfinding problem that finds a path from a source cell to a destination cell in a maze. The maze is represented as a 2D grid where 1 represents a valid path and 0 represents a wall.

---

## Overview

Given a maze represented as an N×N grid:
- **1**: Valid path (rat can move)
- **0**: Wall (rat cannot move)

The rat starts at position (0, 0) and must reach destination (N-1, N-1). The rat can move in four directions:
- Right (→)
- Down (↓)
- Left (←)
- Up (↑)

The backtracking algorithm:
1. Mark current cell as part of solution path
2. Try moving in all four directions
3. If destination reached, return true
4. If dead end, backtrack and try different path
5. Unmark cell when backtracking

---

## Key Characteristics

1. **Pathfinding**: Finds path from source to destination
2. **Backtracking**: Explores paths and backtracks on dead ends
3. **Grid-Based**: Works on 2D grid structures
4. **Multiple Paths**: Can find one or all paths

---

## Operations

| Operation | Description | Time Complexity |
|-----------|-------------|----------------|
| `is_safe(maze, x, y, n)` | Check if (x, y) is valid position | O(1) |
| `solve_maze(maze)` | Find path from (0,0) to (n-1,n-1) | O(2^(n×n)) worst case |
| `solve_maze_all(maze)` | Find all paths from source to destination | O(2^(n×n)) |
| `print_solution(solution)` | Display the solution path | O(n²) |

---

## Implementation Approaches

### 1. Basic Backtracking
- **Pros**: Simple, finds one solution
- **Cons**: Explores many invalid paths
- **Use Case**: Finding any valid path

### 2. Optimized with Pruning
- **Pros**: Early termination, better performance
- **Cons**: More complex
- **Use Case**: Large mazes, performance critical

### 3. BFS Alternative
- **Pros**: Finds shortest path
- **Cons**: Different algorithm, not backtracking
- **Use Case**: When need shortest path

---

## Applications

1. **Pathfinding**: Finding routes in grids
2. **Game Development**: NPC pathfinding, puzzle games
3. **Robotics**: Navigation algorithms
4. **Maze Solving**: Solving physical mazes
5. **Graph Traversal**: Special case of graph problems

---

## Example Use Cases

### Finding Path
```python
maze = [
    [1, 0, 0, 0],
    [1, 1, 0, 1],
    [0, 1, 0, 0],
    [1, 1, 1, 1]
]
solution = solve_maze(maze)
# Returns path matrix with 1s marking the solution
```

### Checking Reachability
```python
if solve_maze(maze):
    print("Path exists!")
else:
    print("No path found")
```

---

## Implementations

This folder contains implementations in three languages:

- **Python** (`Python/`) - List-based implementation
- **C++** (`C++/`) - Vector-based implementation
- **Go** (`Go/`) - Slice-based implementation

Each implementation includes:
- Complete source code
- Comprehensive test suite
- Detailed README with usage examples

---

## Complexity Summary

| Operation | Time Complexity | Space Complexity |
|-----------|----------------|------------------|
| **is_safe** | O(1) | O(1) |
| **solve_maze** | O(2^(n²)) worst case | O(n²) |
| **solve_maze_all** | O(2^(n²)) | O(n² × paths) |
| **print_solution** | O(n²) | O(1) |

In practice, backtracking with pruning performs much better due to early termination.

---

## When to Use

- **Pathfinding**: Finding paths in grid-based mazes
- **Puzzle Games**: Maze solving games
- **Navigation**: Simple navigation algorithms
- **Algorithm Learning**: Understanding backtracking

---

## Related Patterns

- **Backtracking**: Core technique
- **BFS/DFS**: Alternative pathfinding approaches
- **Graph Traversal**: Maze as special graph

---

## Further Reading

- "Introduction to Algorithms" by CLRS
- "Algorithm Design Manual" by Steven Skiena
- LeetCode: Unique Paths, Path Sum problems

---

**Note**: The backtracking approach finds any valid path. For finding the shortest path, BFS is more appropriate. The algorithm works well for small to medium-sized mazes. For very large mazes, consider using A* or other optimized pathfinding algorithms.

---

_Last Updated: December 2025_
