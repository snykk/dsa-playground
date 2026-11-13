"""
Sudoku Solver

Backtracking algorithm to solve a Sudoku puzzle.
"""

from typing import List, Optional, Tuple


def is_valid(board: List[List[int]], row: int, col: int, num: int) -> bool:
    """Check if placing num at (row, col) is valid."""
    # Check row
    for j in range(9):
        if board[row][j] == num:
            return False
    
    # Check column
    for i in range(9):
        if board[i][col] == num:
            return False
    
    # Check 3x3 box
    box_row = (row // 3) * 3
    box_col = (col // 3) * 3
    for i in range(box_row, box_row + 3):
        for j in range(box_col, box_col + 3):
            if board[i][j] == num:
                return False
    
    return True


def find_empty(board: List[List[int]]) -> Optional[Tuple[int, int]]:
    """Find an empty cell (0) in the board."""
    for i in range(9):
        for j in range(9):
            if board[i][j] == 0:
                return (i, j)
    return None


def is_valid_puzzle(board: List[List[int]]) -> bool:
    """
    Check that board is a 9x9 grid of integers 0..9 whose given digits do not conflict
    (no digit repeats in a row, a column or a 3x3 box). Empty cells (0) are ignored.
    """
    if len(board) != 9 or any(len(row) != 9 for row in board):
        return False

    rows = [set() for _ in range(9)]
    cols = [set() for _ in range(9)]
    boxes = [set() for _ in range(9)]
    for i in range(9):
        for j in range(9):
            v = board[i][j]
            if not isinstance(v, int) or v < 0 or v > 9:
                return False
            if v == 0:
                continue
            b = (i // 3) * 3 + j // 3
            if v in rows[i] or v in cols[j] or v in boxes[b]:
                return False
            rows[i].add(v)
            cols[j].add(v)
            boxes[b].add(v)
    return True


def _search(board: List[List[int]]) -> bool:
    """Backtracking search: fill the first empty cell with each valid digit."""
    empty = find_empty(board)
    if empty is None:
        return True  # Puzzle solved

    row, col = empty

    for num in range(1, 10):
        if is_valid(board, row, col, num):
            board[row][col] = num

            if _search(board):
                return True

            # Backtrack
            board[row][col] = 0

    return False


def solve_sudoku(board: List[List[int]]) -> bool:
    """
    Solve Sudoku using backtracking.

    Args:
        board: 9x9 Sudoku board (0 represents empty cell), filled in place

    Returns:
        True if a solution was found (the board holds it). False if the givens
        conflict or are out of range (see is_valid_puzzle) or the puzzle has no
        solution; the board is left unchanged in that case.
    """
    if not is_valid_puzzle(board):
        return False
    return _search(board)


def print_board(board: List[List[int]]) -> None:
    """Print Sudoku board."""
    for i in range(9):
        if i % 3 == 0 and i != 0:
            print("- - - - - - - - - - -")
        for j in range(9):
            if j % 3 == 0 and j != 0:
                print("|", end=" ")
            print(board[i][j] if board[i][j] != 0 else ".", end=" ")
        print()


def main():
    """Example usage."""
    print("Sudoku Solver Examples:")
    print()
    
    # Example Sudoku puzzle (0 = empty)
    board = [
        [5, 3, 0, 0, 7, 0, 0, 0, 0],
        [6, 0, 0, 1, 9, 5, 0, 0, 0],
        [0, 9, 8, 0, 0, 0, 0, 6, 0],
        [8, 0, 0, 0, 6, 0, 0, 0, 3],
        [4, 0, 0, 8, 0, 3, 0, 0, 1],
        [7, 0, 0, 0, 2, 0, 0, 0, 6],
        [0, 6, 0, 0, 0, 0, 2, 8, 0],
        [0, 0, 0, 4, 1, 9, 0, 0, 5],
        [0, 0, 0, 0, 8, 0, 0, 7, 9]
    ]
    
    print("Original puzzle:")
    print_board(board)
    print()
    
    if solve_sudoku(board):
        print("Solution:")
        print_board(board)
    else:
        print("No solution exists")


if __name__ == "__main__":
    main()
