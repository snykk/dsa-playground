"""
Test suite for Tarjan's Algorithm implementation
"""

import unittest
from tarjan import (
    tarjan_scc,
    tarjan_scc_count,
    is_strongly_connected,
    tarjan_bridges,
    tarjan_articulation_points
)


class TestTarjan(unittest.TestCase):
    
    def setUp(self):
        # Graph with 2 SCCs: {1,2,3}, {4,5,6}
        self.graph1 = {
            1: [2],
            2: [3],
            3: [1],
            4: [5],
            5: [6],
            6: [4]
        }
        
        # Strongly connected graph (one SCC)
        self.graph2 = {
            1: [2],
            2: [3],
            3: [1]
        }
        
        # DAG (each vertex is its own SCC)
        self.graph3 = {
            1: [2],
            2: [3],
            3: []
        }
    
    def test_tarjan_scc_basic(self):
        sccs = tarjan_scc(self.graph1)
        self.assertEqual(len(sccs), 2)  # Two SCCs
        
        # Check that vertices in same SCC are grouped together
        scc_sets = [set(scc) for scc in sccs]
        self.assertTrue({1, 2, 3} in scc_sets)
        self.assertTrue({4, 5, 6} in scc_sets)
    
    def test_tarjan_scc_strongly_connected(self):
        sccs = tarjan_scc(self.graph2)
        self.assertEqual(len(sccs), 1)
        self.assertEqual(set(sccs[0]), {1, 2, 3})
    
    def test_tarjan_scc_dag(self):
        sccs = tarjan_scc(self.graph3)
        self.assertEqual(len(sccs), 3)  # Each vertex is its own SCC
    
    def test_tarjan_scc_count(self):
        count = tarjan_scc_count(self.graph1)
        self.assertEqual(count, 2)
    
    def test_is_strongly_connected(self):
        self.assertTrue(is_strongly_connected(self.graph2))
        self.assertFalse(is_strongly_connected(self.graph1))
    
    def test_tarjan_bridges(self):
        # Undirected graph with bridge
        graph = {
            1: [2, 3],
            2: [1],
            3: [1, 4],
            4: [3]
        }
        bridges = tarjan_bridges(graph)
        # Edge (3, 4) is a bridge
        self.assertTrue((3, 4) in bridges or (4, 3) in bridges)
    
    def test_tarjan_articulation_points(self):
        # Undirected graph with articulation point
        graph = {
            1: [2, 3],
            2: [1],
            3: [1, 4],
            4: [3]
        }
        ap = tarjan_articulation_points(graph)
        # Vertex 3 is articulation point
        self.assertIn(3, ap)


if __name__ == '__main__':
    unittest.main()

