# N-Queens Problem -- Python Implementation

## Files

- `n_queens.py`: `is_safe`, the recursive helper `solve_n_queens_util`, `solve_n_queens` and `print_solution`.
- `n_queens_test.py`: unit tests (n = 4, first solution, n = 8, `is_safe`, solution counts for n = 0..9, no solution for 2 and 3, validity and distinctness of every board, lexicographically first solution).

## API

- `solve_n_queens(n, find_all=False)`: returns a list of boards. Each board is an n x n list of lists with 1 for a queen. One board with `find_all=False`, all boards otherwise; an empty list when there is none.
- `is_safe(board, row, col, n)`: true if no queen above `(row, col)` attacks it.
- `print_solution(board)`: prints `Q` and `.`.

```python
from n_queens import solve_n_queens, print_solution

print(len(solve_n_queens(8, find_all=True)))  # 92
print_solution(solve_n_queens(4)[0])
```

## Python-Specific Notes

- Boards are copied with slicing when stored, so later backtracking does not change them.
- Recursion depth is n, far below Python's limit.
- Python 3.9 and later.

## How to Run

```bash
python3 -m unittest n_queens_test
```

## Key Takeaways

- One queen per row turns the problem into a choice of columns.
- Check only the column and the two upper diagonals; undo after a failed branch.
- Counts for n = 0..9 are 1, 1, 0, 0, 2, 10, 4, 40, 92, 352.
