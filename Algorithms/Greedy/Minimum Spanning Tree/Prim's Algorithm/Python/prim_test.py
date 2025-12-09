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


if __name__ == '__main__':
    unittest.main()

