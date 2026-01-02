"""
Unit tests for Rat in a Maze.
"""

import unittest
from rat_in_maze import solve_maze, is_safe


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


if __name__ == "__main__":
    unittest.main()
