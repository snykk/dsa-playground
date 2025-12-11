"""
Test suite for A* search algorithm implementation
"""

import unittest
from astar import astar


class TestAStar(unittest.TestCase):
    
    def setUp(self):
        # Simple graph: 0 -> 1 (weight 4), 0 -> 2 (weight 2), 1 -> 3 (weight 5), 2 -> 3 (weight 1)
        self.graph = {
            0: [(1, 4), (2, 2)],
            1: [(3, 5)],
            2: [(3, 1)],
            3: []
        }
        
        # Simple heuristic: distance to goal
        def simple_heuristic(node):
            # For this test, use a simple heuristic
            if node == 3:
                return 0
            return 1
        
        self.heuristic = simple_heuristic
    
    def test_astar_basic(self):
        result = astar(self.graph, 0, 3, self.heuristic)
        self.assertIsNotNone(result)
        distance, path = result
        self.assertEqual(distance, 3)  # 0 -> 2 -> 3 = 2 + 1 = 3
        self.assertEqual(path, [0, 2, 3])
    
    def test_astar_no_path(self):
        isolated_graph = {
            0: [(1, 1)],
            1: [],
            2: []
        }
        
        def heuristic(node):
            return 0 if node == 2 else 1
        
        result = astar(isolated_graph, 0, 2, heuristic)
        self.assertIsNone(result)


if __name__ == '__main__':
    unittest.main()


