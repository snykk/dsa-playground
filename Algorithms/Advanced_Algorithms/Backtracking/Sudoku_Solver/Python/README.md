# Sudoku Solver -- Python Implementation

## Files

- `sudoku_solver.py`: `is_valid_puzzle`, `is_valid`, `find_empty`, the private `_search`, `solve_sudoku`, `print_board`.
- `sudoku_solver_test.py`: unit tests (the example puzzle against its exact solution, `is_valid`, duplicates in row, column and box, out-of-range values, bad shapes, an unsolvable puzzle that must restore the board, an already solved board, an empty board).

## API

- `solve_sudoku(board)`: `board` is a 9 x 9 list of lists, 0 for empty. Solves in place and returns `True`; returns `False` and leaves the board unchanged if the givens conflict, a value is outside 0..9, the shape is wrong, or there is no solution.
- `is_valid_puzzle(board)`: shape, range and conflicts among the givens.
- `is_valid(board, row, col, num)`: true if `num` is legal at the cell.
- `find_empty(board)`: `(row, col)` of the first 0, or `None`.
- `print_board(board)`: prints the board with box separators.

```python
from sudoku_solver import solve_sudoku

if solve_sudoku(board):
    print(board[0])  # [5, 3, 4, 6, 7, 8, 9, 1, 2]
```

## Python-Specific Notes

- The board is a list of lists of `int`; `bool` and other types are not special-cased beyond `isinstance(v, int)`.
- Recursion depth is at most the number of blanks (81), well inside Python's limit.
- Python 3.9 and later.

## How to Run

```bash
python3 -m unittest sudoku_solver_test
```

## Key Takeaways

- Validate the givens once, then search.
- Fill the first empty cell with each legal digit and undo on failure.
- A failed solve restores the board; plain backtracking is exponential in the worst case.
