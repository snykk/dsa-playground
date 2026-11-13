"""
Unit tests for Rat in a Maze.
"""

import unittest
from rat_in_maze import solve_maze, is_safe


def path_is_valid(maze, solution):
    """Marked cells are open, include both corners and connect them through marked cells."""
    n = len(maze)
    marked = {(i, j) for i in range(n) for j in range(n) if solution[i][j] == 1}
    if (0, 0) not in marked or (n - 1, n - 1) not in marked:
        return False
    if any(maze[i][j] != 1 for i, j in marked):
        return False
    seen, stack = {(0, 0)}, [(0, 0)]
    while stack:
        x, y = stack.pop()
        for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
            if (nx, ny) in marked and (nx, ny) not in seen:
                seen.add((nx, ny))
                stack.append((nx, ny))
    return (n - 1, n - 1) in seen


class TestRatInMaze(unittest.TestCase):
    def test_solve_maze_valid(self):
        maze = [
            [1, 0, 0, 0],
            [1, 1, 0, 1],
            [0, 1, 0, 0],
            [1, 1, 1, 1]
        ]
        solution = solve_maze(maze)
        self.assertIsNotNone(solution)
        self.assertEqual(solution[0][0], 1)
        self.assertEqual(solution[3][3], 1)

    def test_solve_maze_no_solution(self):
        maze = [
            [1, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 1]
        ]
        solution = solve_maze(maze)
        self.assertIsNone(solution)

    def test_is_safe(self):
        maze = [
            [1, 0, 0],
            [1, 1, 0],
            [0, 1, 1]
        ]
        self.assertTrue(is_safe(maze, 0, 0, 3))
        self.assertFalse(is_safe(maze, 0, 1, 3))  # Wall
        self.assertFalse(is_safe(maze, -1, 0, 3))  # Out of bounds

    def test_path_needing_up_and_left_moves(self):
        maze = [
            [1, 0, 1, 1, 1],
            [1, 0, 1, 0, 1],
            [1, 0, 1, 0, 1],
            [1, 1, 1, 0, 1],
            [0, 0, 0, 0, 1],
        ]
        solution = solve_maze(maze)
        self.assertIsNotNone(solution)
        self.assertTrue(path_is_valid(maze, solution))

    def test_returned_path_is_valid(self):
        maze = [
            [1, 0, 0, 0],
            [1, 1, 0, 1],
            [0, 1, 0, 0],
            [1, 1, 1, 1],
        ]
        self.assertTrue(path_is_valid(maze, solve_maze(maze)))

    def test_unreachable_destination_is_fast(self):
        n = 30
        maze = [[1] * n for _ in range(n)]
        maze[n - 2][n - 1] = 0
        maze[n - 1][n - 2] = 0
        self.assertIsNone(solve_maze(maze))

    def test_single_cell_and_blocked_start(self):
        self.assertEqual(solve_maze([[1]]), [[1]])
        self.assertIsNone(solve_maze([[0]]))
        self.assertIsNone(solve_maze([]))

    def test_non_square_maze_is_rejected(self):
        self.assertIsNone(solve_maze([[1, 1, 1], [1, 1, 1]]))


if __name__ == "__main__":
    unittest.main()
