# Sudoku Solver - Go

This folder contains a Go implementation of a **Sudoku Solver** using backtracking.

---

## Concept

Solves a 9×9 Sudoku puzzle using backtracking. The algorithm tries placing numbers 1-9 in empty cells and backtracks when a conflict is detected.

**Key Features:**
- Backtracking algorithm
- Validates row, column, and 3×3 box constraints
- Finds solution if one exists
- Handles standard Sudoku puzzles

---

## Functions

| Function | Description | Time Complexity |
|----------|-------------|----------------|
| `isValid(board, row, col, num)` | Check if number placement is valid | O(1) |
| `findEmpty(board)` | Find next empty cell | O(n²) |
| `solveSudoku(board)` | Solve Sudoku puzzle | O(9^m) where m is empty cells |

---

## Complexity

| Operation | Time Complexity | Space Complexity |
|-----------|----------------|------------------|
| Solve Puzzle | O(9^m) | O(1) |
| Validation | O(1) | O(1) |
| Find Empty | O(n²) | O(1) |

---

## Usage

```go
board := [][]int{
    {5, 3, 0, 0, 7, 0, 0, 0, 0},
    {6, 0, 0, 1, 9, 5, 0, 0, 0},
    // ... more rows
}

if solveSudoku(board) {
    printBoard(board)
}
```

---

## Running Tests

```bash
go test
```

---

_Last Updated: December 2025_

