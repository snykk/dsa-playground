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


def solve_sudoku(board: List[List[int]]) -> bool:
    """
    Solve Sudoku using backtracking.
    
    Args:
        board: 9x9 Sudoku board (0 represents empty cell)
        
    Returns:
        True if solution found, False otherwise
    """
    empty = find_empty(board)
    if empty is None:
        return True  # Puzzle solved
    
    row, col = empty
    
    for num in range(1, 10):
        if is_valid(board, row, col, num):
            board[row][col] = num
            
            if solve_sudoku(board):
                return True
            
            # Backtrack
            board[row][col] = 0
    
    return False


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
