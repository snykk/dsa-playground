"""
Test suite for Kosaraju's Algorithm implementation
"""

import unittest
from kosaraju import (
    kosaraju_scc,
    kosaraju_scc_count,
    is_strongly_connected,
    kosaraju_condensation_graph
)


class TestKosaraju(unittest.TestCase):
    
    def setUp(self):
        # Graph with 3 SCCs: {1,2}, {3}, {4,5,6}
        # 1 -> 2 -> 3 -> 1 (cycle: 1,2,3)
        # 4 -> 5 -> 6 -> 4 (cycle: 4,5,6)
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
        
        # Empty graph
        self.graph4 = {}
    
    def test_kosaraju_scc_basic(self):
        sccs = kosaraju_scc(self.graph1)
        self.assertEqual(len(sccs), 2)  # Two SCCs: {1,2,3} and {4,5,6}
        
        # Check that vertices in same SCC are grouped together
        scc_sets = [set(scc) for scc in sccs]
        self.assertTrue({1, 2, 3} in scc_sets)
        self.assertTrue({4, 5, 6} in scc_sets)
    
    def test_kosaraju_scc_strongly_connected(self):
        sccs = kosaraju_scc(self.graph2)
        self.assertEqual(len(sccs), 1)
        self.assertEqual(set(sccs[0]), {1, 2, 3})
    
    def test_kosaraju_scc_dag(self):
        sccs = kosaraju_scc(self.graph3)
        self.assertEqual(len(sccs), 3)  # Each vertex is its own SCC
    
    def test_kosaraju_scc_empty(self):
        sccs = kosaraju_scc(self.graph4)
        self.assertEqual(sccs, [])
    
    def test_kosaraju_scc_count(self):
        count = kosaraju_scc_count(self.graph1)
        self.assertEqual(count, 2)
        
        count = kosaraju_scc_count(self.graph2)
        self.assertEqual(count, 1)
    
    def test_is_strongly_connected(self):
        self.assertTrue(is_strongly_connected(self.graph2))
        self.assertFalse(is_strongly_connected(self.graph1))
        self.assertFalse(is_strongly_connected(self.graph3))
    
    def test_kosaraju_condensation_graph(self):
        condensation = kosaraju_condensation_graph(self.graph1)
        # Should have 2 nodes (SCCs) in condensation graph
        self.assertEqual(len(condensation), 2)


if __name__ == '__main__':
    unittest.main()

