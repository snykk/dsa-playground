"""
Test cases for Prim's Algorithm
"""

import unittest
from prim import (
    prim_mst_adjacency_list,
    prim_mst_edge_list,
    prim_mst_adjacency_matrix
)


class TestPrim(unittest.TestCase):
    
    def test_adjacency_list(self):
        """Test with adjacency list"""
        graph = {
            0: [(1, 10), (2, 6), (3, 5)],
            1: [(0, 10), (3, 15)],
            2: [(0, 6), (3, 4)],
            3: [(0, 5), (1, 15), (2, 4)]
        }
        mst, weight = prim_mst_adjacency_list(graph, 0)
        self.assertEqual(len(mst), 3)
        self.assertEqual(weight, 19)
    
    def test_edge_list(self):
        """Test with edge list"""
        edges = [
            (0, 1, 10),
            (0, 2, 6),
            (0, 3, 5),
            (1, 3, 15),
            (2, 3, 4)
        ]
        mst, weight = prim_mst_edge_list(edges, 4, 0)
        self.assertEqual(len(mst), 3)
        self.assertEqual(weight, 19)
    
    def test_adjacency_matrix(self):
        """Test with adjacency matrix"""
        matrix = [
            [0, 10, 6, 5],
            [10, 0, 0, 15],
            [6, 0, 0, 4],
            [5, 15, 4, 0]
        ]
        mst, weight = prim_mst_adjacency_matrix(matrix, 0)
        self.assertEqual(len(mst), 3)
        self.assertEqual(weight, 19)

    def test_adjacency_matrix_negative_weights(self):
        """Regression: only matrix[u][v] > 0 counted as an edge, so negative
        weights were dropped."""
        self.assertEqual(prim_mst_adjacency_matrix([[0, -4], [-4, 0]]), ([(0, 1, -4)], -4))
        matrix = [
            [0, -2, 7, 0],
            [-2, 0, 3, -5],
            [7, 3, 0, 1],
            [0, -5, 1, 0]
        ]
        edges = [(0, 1, -2), (0, 2, 7), (1, 2, 3), (1, 3, -5), (2, 3, 1)]
        mst, weight = prim_mst_adjacency_matrix(matrix, 0)
        self.assertEqual(len(mst), 3)
        self.assertEqual(weight, -6)
        self.assertEqual(weight, prim_mst_edge_list(edges, 4, 0)[1])

    def test_neighbor_only_vertex(self):
        """Regression: len(graph) was used as the vertex count, so a vertex that
        appears only in a neighbor list ended the loop before it was added."""
        self.assertEqual(prim_mst_adjacency_list({0: [(1, 4)]}, 0), ([(0, 1, 4)], 4))
        graph = {0: [(1, 1), (2, 2)], 1: [(0, 1)]}
        mst, weight = prim_mst_adjacency_list(graph, 0)
        self.assertEqual((len(mst), weight), (2, 3))

    def test_single_vertex_and_empty(self):
        self.assertEqual(prim_mst_adjacency_list({0: []}, 0), ([], 0))
        self.assertEqual(prim_mst_adjacency_list({}, 0), ([], 0))

    def test_disconnected_returns_start_component_only(self):
        """Prim grows one tree, so it covers only the component of start."""
        mst, weight = prim_mst_edge_list([(0, 1, 1), (2, 3, 1)], 4, 0)
        self.assertEqual((mst, weight), ([(0, 1, 1)], 1))

    def test_negative_weights_match_across_representations(self):
        edges = [(0, 1, -2), (0, 2, 7), (1, 2, 3), (1, 3, -5), (2, 3, 1)]
        graph = {i: [] for i in range(4)}
        for u, v, w in edges:
            graph[u].append((v, w))
            graph[v].append((u, w))
        self.assertEqual(prim_mst_adjacency_list(graph, 0)[1], -6)


if __name__ == '__main__':
    unittest.main()

