"""
Unit tests for N-Queens Problem.
"""

import unittest
from n_queens import solve_n_queens, is_safe


class TestNQueens(unittest.TestCase):
    def test_n4_solutions(self):
        solutions = solve_n_queens(4, find_all=True)
        self.assertEqual(len(solutions), 2)  # 4-queens has 2 solutions

    def test_n4_first_solution(self):
        solutions = solve_n_queens(4, find_all=False)
        self.assertEqual(len(solutions), 1)
        self.assertEqual(len(solutions[0]), 4)
        self.assertEqual(len(solutions[0][0]), 4)

    def test_n8_has_solutions(self):
        solutions = solve_n_queens(8, find_all=False)
        self.assertGreater(len(solutions), 0)

    def test_is_safe(self):
        board = [[0, 0, 0, 0],
                 [0, 0, 0, 0],
                 [0, 0, 0, 0],
                 [0, 0, 0, 0]]
        self.assertTrue(is_safe(board, 0, 0, 4))
        
        board[0][0] = 1
        self.assertFalse(is_safe(board, 1, 0, 4))  # Same column
        self.assertFalse(is_safe(board, 1, 1, 4))  # Diagonal


if __name__ == "__main__":
    unittest.main()
