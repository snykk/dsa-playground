# N-Queens Problem

The **N-Queens Problem** is a classic constraint satisfaction problem that asks: "Given an N×N chessboard, can you place N queens on the board such that no two queens attack each other?" This problem is a fundamental example of backtracking algorithms.

---

## Overview

The N-Queens problem requires placing N queens on an N×N chessboard so that:
- No two queens are in the same row
- No two queens are in the same column
- No two queens are on the same diagonal

This problem demonstrates the power of backtracking: we try placing queens one by one, and if we reach an invalid state, we backtrack and try a different position. The algorithm explores the solution space systematically, pruning invalid branches early.

---

## Key Characteristics

1. **Constraint Satisfaction**: Multiple constraints must be satisfied simultaneously
2. **Backtracking**: Recursively tries solutions and backtracks on failure
3. **Pruning**: Early termination when constraints are violated
4. **Exponential Search Space**: O(N!) possible arrangements to explore

---

## Operations

| Operation | Description | Time Complexity |
|-----------|-------------|----------------|
| `is_safe(board, row, col, n)` | Check if placing queen at (row, col) is safe | O(n) |
| `solve_n_queens(n)` | Find one solution for N-Queens | O(N!) worst case |
| `solve_n_queens_all(n)` | Find all solutions for N-Queens | O(N!) worst case |
| `count_solutions(n)` | Count number of solutions | O(N!) worst case |

---

## Implementation Approaches

### 1. Basic Backtracking
- **Pros**: Simple, intuitive, easy to understand
- **Cons**: Explores entire search space in worst case
- **Use Case**: Learning, small N values

### 2. Optimized Backtracking
- **Pros**: Early pruning, constraint propagation
- **Cons**: More complex implementation
- **Use Case**: Larger N values, production code

### 3. Iterative Deepening
- **Pros**: Memory efficient, can find first solution quickly
- **Cons**: May recompute states
- **Use Case**: When memory is constrained

---

## Applications

1. **Constraint Satisfaction**: Template for CSP problems
2. **Scheduling Problems**: Resource allocation with constraints
3. **Puzzle Solving**: Similar structure to Sudoku, crosswords
4. **Optimization**: Finding optimal arrangements
5. **Algorithm Design**: Teaching backtracking concepts

---

## Example Use Cases

### Finding One Solution
```python
n = 8
solution = solve_n_queens(8)
# Returns one valid arrangement of 8 queens
```

### Finding All Solutions
```python
n = 4
all_solutions = solve_n_queens_all(4)
# Returns all 2 solutions for 4-Queens
```

### Counting Solutions
```python
n = 8
count = count_solutions(8)
# Returns 92 (number of solutions for 8-Queens)
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
| **is_safe** | O(n) | O(1) |
| **solve_n_queens** | O(N!) worst case | O(N²) |
| **solve_n_queens_all** | O(N!) | O(N² × solutions) |
| **count_solutions** | O(N!) | O(N²) |

In practice, backtracking with pruning performs much better than O(N!) due to early termination.

---

## When to Use

- **Constraint Satisfaction**: Problems with multiple constraints
- **Exhaustive Search**: When need to find all valid solutions
- **Puzzle Problems**: Similar structure to N-Queens
- **Teaching**: Demonstrating backtracking concepts

---

## Related Patterns

- **Backtracking**: Core technique used here
- **Constraint Propagation**: Can optimize N-Queens
- **Recursive Search**: Fundamental pattern

---

## Further Reading

- "Introduction to Algorithms" by CLRS
- "Algorithm Design Manual" by Steven Skiena
- "Artificial Intelligence: A Modern Approach" by Russell & Norvig
- LeetCode: N-Queens problem

---

**Note**: The N-Queens problem has been solved for all N values. For N=8, there are 92 solutions. The problem becomes computationally expensive for large N, but optimized backtracking with constraint propagation can handle N up to about 20-30 efficiently.

---

_Last Updated: December 2025_
