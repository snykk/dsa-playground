"""
N-Queens Problem

Backtracking algorithm to solve the N-Queens problem - placing N queens on an NxN chessboard
so that no two queens attack each other.
"""

from typing import List, Optional


def is_safe(board: List[List[int]], row: int, col: int, n: int) -> bool:
    """Check if placing a queen at (row, col) is safe."""
    # Check column
    for i in range(row):
        if board[i][col] == 1:
            return False
    
    # Check upper-left diagonal
    i, j = row - 1, col - 1
    while i >= 0 and j >= 0:
        if board[i][j] == 1:
            return False
        i -= 1
        j -= 1
    
    # Check upper-right diagonal
    i, j = row - 1, col + 1
    while i >= 0 and j < n:
        if board[i][j] == 1:
            return False
        i -= 1
        j += 1
    
    return True


def solve_n_queens_util(board: List[List[int]], row: int, n: int, solutions: List[List[List[int]]], find_all: bool) -> bool:
    """Backtracking utility function. Returns True when the search should stop."""
    if row == n:
        # Found a solution, save a copy of the board
        solutions.append([r[:] for r in board])
        return not find_all  # stop after the first solution unless collecting all

    for col in range(n):
        if is_safe(board, row, col, n):
            board[row][col] = 1

            if solve_n_queens_util(board, row + 1, n, solutions, find_all):
                return True

            # Backtrack
            board[row][col] = 0

    return False


def solve_n_queens(n: int, find_all: bool = False) -> List[List[List[int]]]:
    """
    Solve N-Queens problem.

    Args:
        n: Size of the board (nxn)
        find_all: If True, find all solutions; if False, find first solution

    Returns:
        List of solutions, where each solution is a 2D board (1 = queen).
        Empty list if there is no solution (n = 2 or 3).
    """
    board = [[0 for _ in range(n)] for _ in range(n)]
    solutions: List[List[List[int]]] = []
    solve_n_queens_util(board, 0, n, solutions, find_all)
    return solutions


def print_solution(board: List[List[int]]) -> None:
    """Print a solution board."""
    n = len(board)
    for i in range(n):
        for j in range(n):
            print("Q" if board[i][j] == 1 else ".", end=" ")
        print()


def main():
    """Example usage."""
    print("N-Queens Problem Examples:")
    print()
    
    n = 4
    print(f"Solving {n}-Queens problem:")
    solutions = solve_n_queens(n, find_all=True)
    print(f"Found {len(solutions)} solution(s)")
    
    if solutions:
        print("\nFirst solution:")
        print_solution(solutions[0])


if __name__ == "__main__":
    main()
