"""
Test cases for Kruskal's Algorithm
"""

import unittest
from kruskal import kruskal_mst, kruskal_mst_with_details


class TestKruskal(unittest.TestCase):
    
    def test_simple_graph(self):
        """Test with simple graph"""
        edges = [
            (0, 1, 10),
            (0, 2, 6),
            (0, 3, 5),
            (1, 3, 15),
            (2, 3, 4)
        ]
        mst, weight = kruskal_mst(edges, 4)
        self.assertEqual(len(mst), 3)  # V-1 edges
        self.assertEqual(weight, 19)
    
    def test_single_vertex(self):
        """Test with single vertex"""
        edges = []
        mst, weight = kruskal_mst(edges, 1)
        self.assertEqual(len(mst), 0)
        self.assertEqual(weight, 0)
    
    def test_disconnected_graph(self):
        """Test with disconnected graph"""
        edges = [
            (0, 1, 5),
            (2, 3, 3)
        ]
        mst, weight = kruskal_mst(edges, 4)
        # A spanning forest: both components are spanned, so V - 2 edges
        self.assertEqual(mst, [(2, 3, 3), (0, 1, 5)])
        self.assertEqual(weight, 8)
    
    def test_complete_graph(self):
        """Test with complete graph"""
        edges = [
            (0, 1, 4), (0, 2, 4), (0, 3, 4),
            (1, 2, 2), (1, 3, 2),
            (2, 3, 3)
        ]
        mst, weight = kruskal_mst(edges, 4)
        self.assertEqual(len(mst), 3)
        # MST should be: (1,2,2) + (1,3,2) + (0,1,4) = 8
        # or (1,2,2) + (1,3,2) + (2,3,3) = 7, but algorithm picks (0,1,4)
        # Actually: edges sorted by weight: 2,2,3,4,4,4
        # Select: (1,2,2), (1,3,2), then (2,3,3) creates cycle, so (0,1,4) = 8
        self.assertEqual(weight, 8)

    def test_negative_weights(self):
        edges = [(0, 1, -2), (0, 2, 7), (1, 2, 3), (1, 3, -5), (2, 3, 1)]
        mst, weight = kruskal_mst(edges, 4)
        self.assertEqual(weight, -6)
        self.assertEqual(len(mst), 3)

    def test_with_details_reports_connectivity(self):
        self.assertTrue(kruskal_mst_with_details([(0, 1, 1), (1, 2, 1)], 3)['is_connected'])
        self.assertFalse(kruskal_mst_with_details([(0, 1, 1)], 3)['is_connected'])


if __name__ == '__main__':
    unittest.main()

