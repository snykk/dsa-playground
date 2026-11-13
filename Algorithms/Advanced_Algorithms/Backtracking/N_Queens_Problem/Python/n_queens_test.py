"""
Unit tests for N-Queens Problem.
"""

import unittest
from n_queens import solve_n_queens, is_safe


def is_valid_board(board):
    n = len(board)
    cells = [(r, c) for r in range(n) for c in range(n) if board[r][c] == 1]
    if len(cells) != n:
        return False
    for i in range(n):
        for j in range(i + 1, n):
            (r1, c1), (r2, c2) = cells[i], cells[j]
            if r1 == r2 or c1 == c2 or abs(r1 - r2) == abs(c1 - c2):
                return False
    return True


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

    def test_solution_counts_match_oeis(self):
        expected = [1, 1, 0, 0, 2, 10, 4, 40, 92, 352]  # A000170
        for n, count in enumerate(expected):
            self.assertEqual(len(solve_n_queens(n, find_all=True)), count, n)

    def test_no_solution_for_2_and_3(self):
        self.assertEqual(solve_n_queens(2), [])
        self.assertEqual(solve_n_queens(3), [])

    def test_every_board_is_valid_and_distinct(self):
        solutions = solve_n_queens(6, find_all=True)
        self.assertTrue(all(is_valid_board(b) for b in solutions))
        self.assertEqual(len({tuple(map(tuple, b)) for b in solutions}), len(solutions))
        self.assertTrue(is_valid_board(solve_n_queens(8)[0]))

    def test_first_solution_is_lexicographically_first(self):
        board = solve_n_queens(4)[0]
        self.assertEqual([row.index(1) for row in board], [1, 3, 0, 2])


if __name__ == "__main__":
    unittest.main()
