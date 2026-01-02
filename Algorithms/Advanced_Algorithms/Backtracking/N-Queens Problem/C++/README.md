# N-Queens Problem - C++

This folder contains a C++ implementation of the **N-Queens Problem** using backtracking.

---

## Concept

The N-Queens problem is to place N queens on an N×N chessboard such that no two queens attack each other. This implementation uses backtracking to find solutions.

**Key Features:**
- Backtracking algorithm
- Find first solution or all solutions
- Efficient conflict checking
- Visual solution display

---

## Functions

| Function | Description | Time Complexity |
|----------|-------------|----------------|
| `isSafe(board, row, col, n)` | Check if placing queen is safe | O(n) |
| `solveNQueens(n, findAll)` | Solve N-Queens problem | O(N!) worst case |
| `printSolution(board)` | Display solution board | O(n²) |

---

## Complexity

| Operation | Time Complexity | Space Complexity |
|-----------|----------------|------------------|
| Find First Solution | O(N!) worst case | O(N²) |
| Find All Solutions | O(N!) worst case | O(N² × solutions) |
| Conflict Check | O(N) | O(1) |

---

## Usage

```cpp
#include "n_queens.cpp"

// Find first solution
auto solutions = solveNQueens(4, false);
if (!solutions.empty()) {
    printSolution(solutions[0]);
}

// Find all solutions
auto allSolutions = solveNQueens(4, true);
cout << "Found " << allSolutions.size() << " solutions" << endl;
```

---

## Running Tests

```bash
g++ -o test n_queens_test.cpp && ./test
```

---

## Example

For N=4, there are 2 solutions:
- Solution 1: Queens at (0,1), (1,3), (2,0), (3,2)
- Solution 2: Queens at (0,2), (1,0), (2,3), (3,1)

---

_Last Updated: December 2025_

