"""
Unit tests for Graph Coloring.
"""

import unittest
from graph_coloring import graph_coloring, chromatic_number, is_safe


def is_valid(graph, color, m):
    n = len(graph)
    if len(color) != n or any(c < 1 or c > m for c in color):
        return False
    return all(not (graph[i][j] and color[i] == color[j]) for i in range(n) for j in range(n))


def cycle(n):
    return [[1 if (i - j) % n in (1, n - 1) else 0 for j in range(n)] for i in range(n)]


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
        self.assertTrue(is_valid(graph, color, 3))

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

    def test_empty_graph(self):
        self.assertEqual(graph_coloring([], 1), [])
        self.assertEqual(chromatic_number([]), 0)

    def test_no_edges_needs_one_color(self):
        graph = [[0] * 4 for _ in range(4)]
        self.assertEqual(chromatic_number(graph), 1)

    def test_bipartite_even_cycle_needs_two(self):
        graph = cycle(6)
        self.assertEqual(chromatic_number(graph), 2)
        self.assertTrue(is_valid(graph, graph_coloring(graph, 2), 2))

    def test_odd_cycle_needs_three(self):
        graph = cycle(5)
        self.assertIsNone(graph_coloring(graph, 2))
        self.assertEqual(chromatic_number(graph), 3)
        self.assertTrue(is_valid(graph, graph_coloring(graph, 3), 3))

    def test_complete_graph_needs_n_colors(self):
        graph = [[0 if i == j else 1 for j in range(5)] for i in range(5)]
        self.assertEqual(chromatic_number(graph), 5)
        self.assertIsNone(graph_coloring(graph, 4))


if __name__ == "__main__":
    unittest.main()
