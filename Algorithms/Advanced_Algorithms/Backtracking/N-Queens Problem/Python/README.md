# N-Queens Problem - Python

This folder contains a Python implementation of the **N-Queens Problem** using backtracking.

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
| `is_safe(board, row, col, n)` | Check if placing queen is safe | O(n) |
| `solve_n_queens(n, find_all)` | Solve N-Queens problem | O(N!) worst case |
| `print_solution(board)` | Display solution board | O(n²) |

---

## Complexity

| Operation | Time Complexity | Space Complexity |
|-----------|----------------|------------------|
| Find First Solution | O(N!) worst case | O(N²) |
| Find All Solutions | O(N!) worst case | O(N² × solutions) |
| Conflict Check | O(N) | O(1) |

---

## Usage

```python
from n_queens import solve_n_queens, print_solution

# Find first solution
solutions = solve_n_queens(4, find_all=False)
if solutions:
    print_solution(solutions[0])

# Find all solutions
all_solutions = solve_n_queens(4, find_all=True)
print(f"Found {len(all_solutions)} solutions")
```

---

## Running Tests

```bash
python n_queens_test.py
```

---

## Example

For N=4, there are 2 solutions:
- Solution 1: Queens at (0,1), (1,3), (2,0), (3,2)
- Solution 2: Queens at (0,2), (1,0), (2,3), (3,1)

---

_Last Updated: December 2025_
