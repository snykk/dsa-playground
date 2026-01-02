# Advanced Algorithms

A comprehensive collection of **Advanced Algorithms**, including backtracking techniques and specialized decomposition algorithms.

---

## Overview

This folder contains implementations of advanced algorithms in Python, C++, and Go. Each algorithm includes:
- Complete implementation
- Comprehensive test suites
- Detailed documentation
- Complexity analysis

---

## Categories

### 🔹 Backtracking

- **[N-Queens Problem](./Backtracking/N-Queens%20Problem/)**
  - Classic backtracking problem
  - Time: O(N!) worst case, typically much better
  - Places N queens on N×N board without conflicts

- **[Sudoku Solver](./Backtracking/Sudoku%20Solver/)**
  - Backtracking-based Sudoku solver
  - Time: O(9^m) where m is number of empty cells
  - Solves standard 9×9 Sudoku puzzles

- **[Rat in a Maze](./Backtracking/Rat%20in%20a%20Maze/)**
  - Find path from source to destination
  - Time: O(2^(n×n)) worst case
  - Backtracking pathfinding algorithm

- **[Graph Coloring](./Backtracking/Graph%20Coloring/)**
  - Color graph with minimum colors
  - Time: O(m × k^n) where k is number of colors
  - Ensures no adjacent vertices share color

---

### 🔹 Specialized Techniques

- **[Mo's Algorithm](./Specialized%20Techniques/Mo's%20Algorithm/)**
  - Square root decomposition for range queries
  - Time: O((N + Q) × √N)
  - Efficient offline range query processing

- **[Heavy-Light Decomposition](./Specialized%20Techniques/Heavy-Light%20Decomposition/)**
  - Tree decomposition for path queries
  - Time: O(log² N) per query
  - Efficient tree path operations

- **[Centroid Decomposition](./Specialized%20Techniques/Centroid%20Decomposition/)**
  - Tree decomposition by centroids
  - Time: O(N log N) construction
  - Useful for tree problems

- **[Square Root Decomposition](./Specialized%20Techniques/Square%20Root%20Decomposition/)**
  - Array decomposition into blocks
  - Time: O(√N) per query/update
  - Efficient range queries and updates

---

## Comparison

| Algorithm | Time Complexity | Space Complexity | Best For |
|-----------|----------------|-------------------|----------|
| **N-Queens** | O(N!) | O(N²) | Constraint satisfaction |
| **Sudoku Solver** | O(9^m) | O(1) | Puzzle solving |
| **Rat in Maze** | O(2^(n²)) | O(n²) | Pathfinding |
| **Graph Coloring** | O(m × k^n) | O(n) | Graph problems |
| **Mo's Algorithm** | O((N+Q)√N) | O(N) | Offline range queries |
| **HLD** | O(log² N) | O(N) | Tree path queries |
| **Centroid Decomp** | O(N log N) | O(N) | Tree problems |
| **Sqrt Decomp** | O(√N) | O(N) | Range queries |

---

## When to Use

- **Backtracking**: Constraint satisfaction problems, puzzles, optimization
- **Mo's Algorithm**: Multiple offline range queries on arrays
- **Heavy-Light Decomposition**: Path queries on trees
- **Centroid Decomposition**: Tree problems requiring divide-and-conquer
- **Square Root Decomposition**: Range queries when segment tree is overkill

---

## References

- "Introduction to Algorithms" by CLRS
- "Algorithm Design Manual" by Steven Skiena
- "Competitive Programming" by Halim & Halim
- "Handbook of Data Structures and Applications"

---

_Last Updated: December 2025_
