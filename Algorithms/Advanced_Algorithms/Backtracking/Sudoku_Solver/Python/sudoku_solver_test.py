"""
Unit tests for Sudoku Solver.
"""

import unittest
import copy
from sudoku_solver import solve_sudoku, is_valid, is_valid_puzzle


PUZZLE = [
    [5, 3, 0, 0, 7, 0, 0, 0, 0],
    [6, 0, 0, 1, 9, 5, 0, 0, 0],
    [0, 9, 8, 0, 0, 0, 0, 6, 0],
    [8, 0, 0, 0, 6, 0, 0, 0, 3],
    [4, 0, 0, 8, 0, 3, 0, 0, 1],
    [7, 0, 0, 0, 2, 0, 0, 0, 6],
    [0, 6, 0, 0, 0, 0, 2, 8, 0],
    [0, 0, 0, 4, 1, 9, 0, 0, 5],
    [0, 0, 0, 0, 8, 0, 0, 7, 9],
]

SOLUTION = [
    [5, 3, 4, 6, 7, 8, 9, 1, 2],
    [6, 7, 2, 1, 9, 5, 3, 4, 8],
    [1, 9, 8, 3, 4, 2, 5, 6, 7],
    [8, 5, 9, 7, 6, 1, 4, 2, 3],
    [4, 2, 6, 8, 5, 3, 7, 9, 1],
    [7, 1, 3, 9, 2, 4, 8, 5, 6],
    [9, 6, 1, 5, 3, 7, 2, 8, 4],
    [2, 8, 7, 4, 1, 9, 6, 3, 5],
    [3, 4, 5, 2, 8, 6, 1, 7, 9],
]


def is_complete_valid_grid(board):
    digits = set(range(1, 10))
    rows = all(set(r) == digits for r in board)
    cols = all({board[i][j] for i in range(9)} == digits for j in range(9))
    boxes = all(
        {board[3 * bi + i][3 * bj + j] for i in range(3) for j in range(3)} == digits
        for bi in range(3) for bj in range(3)
    )
    return rows and cols and boxes


class TestSudokuSolver(unittest.TestCase):
    def test_solve_valid_sudoku(self):
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
        self.assertTrue(solve_sudoku(board))
        # Check that all cells are filled
        for row in board:
            self.assertNotIn(0, row)

    def test_is_valid(self):
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
        self.assertTrue(is_valid(board, 0, 2, 1))
        self.assertFalse(is_valid(board, 0, 2, 5))  # Already in row
        self.assertFalse(is_valid(board, 0, 2, 6))  # Already in column

    def test_solution_is_exact_and_keeps_givens(self):
        board = copy.deepcopy(PUZZLE)
        self.assertTrue(solve_sudoku(board))
        self.assertEqual(board, SOLUTION)
        self.assertTrue(is_complete_valid_grid(board))
        for i in range(9):
            for j in range(9):
                if PUZZLE[i][j]:
                    self.assertEqual(board[i][j], PUZZLE[i][j])

    def test_rejects_duplicate_in_row(self):
        board = copy.deepcopy(SOLUTION)
        board[0][0] = board[0][1]
        before = copy.deepcopy(board)
        self.assertFalse(solve_sudoku(board))
        self.assertEqual(board, before)

    def test_rejects_conflicting_givens_with_blanks(self):
        for (i1, j1, i2, j2) in [(0, 0, 0, 5), (0, 0, 5, 0), (0, 0, 2, 2)]:
            board = [[0] * 9 for _ in range(9)]
            board[i1][j1] = 7
            board[i2][j2] = 7
            before = copy.deepcopy(board)
            self.assertFalse(solve_sudoku(board), (i1, j1, i2, j2))
            self.assertEqual(board, before)

    def test_rejects_out_of_range_and_bad_shape(self):
        board = copy.deepcopy(PUZZLE)
        board[4][4] = 10
        self.assertFalse(is_valid_puzzle(board))
        board[4][4] = -1
        self.assertFalse(solve_sudoku(board))
        self.assertFalse(solve_sudoku([[0] * 9 for _ in range(8)]))
        self.assertFalse(solve_sudoku([[0] * 8 for _ in range(9)]))

    def test_unsolvable_puzzle_returns_false_and_restores_board(self):
        board = [[0] * 9 for _ in range(9)]
        board[0][:8] = [1, 2, 3, 4, 5, 6, 7, 8]
        board[1][8] = 9  # cell (0, 8) needs a 9, but column 8 already has one
        before = copy.deepcopy(board)
        self.assertTrue(is_valid_puzzle(board))
        self.assertFalse(solve_sudoku(board))
        self.assertEqual(board, before)

    def test_already_solved_and_empty_boards(self):
        board = copy.deepcopy(SOLUTION)
        self.assertTrue(solve_sudoku(board))
        self.assertEqual(board, SOLUTION)
        empty = [[0] * 9 for _ in range(9)]
        self.assertTrue(solve_sudoku(empty))
        self.assertTrue(is_complete_valid_grid(empty))


if __name__ == "__main__":
    unittest.main()
