"""
Unit tests for Graph Coloring.
"""

import unittest
from graph_coloring import graph_coloring, chromatic_number, is_safe


class TestGraphColoring(unittest.TestCase):
    def test_graph_coloring_valid(self):
        graph = [
            [0, 1, 1, 1],
            [1, 0, 1, 0],
            [1, 1, 0, 1],
            [1, 0, 1, 0]
        ]
        color = graph_coloring(graph, 3)
        self.assertIsNotNone(color)
        self.assertEqual(len(color), 4)

    def test_graph_coloring_insufficient_colors(self):
        graph = [
            [0, 1, 1],
            [1, 0, 1],
            [1, 1, 0]
        ]
        color = graph_coloring(graph, 2)
        self.assertIsNone(color)  # Triangle needs 3 colors

    def test_chromatic_number(self):
        graph = [
            [0, 1, 1, 1],
            [1, 0, 1, 0],
            [1, 1, 0, 1],
            [1, 0, 1, 0]
        ]
        self.assertEqual(chromatic_number(graph), 3)

    def test_is_safe(self):
        graph = [
            [0, 1, 1],
            [1, 0, 1],
            [1, 1, 0]
        ]
        color = [1, 0, 0]
        self.assertTrue(is_safe(graph, 1, color, 2))
        self.assertFalse(is_safe(graph, 1, color, 1))  # Adjacent vertex has color 1


if __name__ == "__main__":
    unittest.main()
