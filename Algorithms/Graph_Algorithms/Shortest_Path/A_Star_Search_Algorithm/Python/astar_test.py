"""
Test suite for A* search algorithm implementation
"""

import unittest
from astar import astar, manhattan_distance, euclidean_distance


class TestAStar(unittest.TestCase):
    """Test cases for A* search algorithm implementation."""
    
    def setUp(self):
        """Set up test fixtures."""
        # Simple graph: 0 -> 1 (weight 4), 0 -> 2 (weight 2), 1 -> 3 (weight 5), 2 -> 3 (weight 1)
        self.graph = {
            0: [(1, 4), (2, 2)],
            1: [(3, 5)],
            2: [(3, 1)],
            3: []
        }
        
        # Graph with multiple paths
        self.graph2 = {
            0: [(1, 1), (2, 4)],
            1: [(2, 2), (3, 5)],
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
        """Test basic A* search algorithm."""
        result = astar(self.graph, 0, 3, self.heuristic)
        self.assertIsNotNone(result)
        distance, path = result
        self.assertEqual(distance, 3)  # 0 -> 2 -> 3 = 2 + 1 = 3
        self.assertEqual(path, [0, 2, 3])
        self.assertEqual(path[0], 0)
        self.assertEqual(path[-1], 3)
    
    def test_astar_multiple_paths(self):
        """Test A* with multiple possible paths."""
        result = astar(self.graph2, 0, 3, self.heuristic)
        self.assertIsNotNone(result)
        distance, path = result
        self.assertEqual(distance, 4)  # 0 -> 1 -> 2 -> 3 = 1 + 2 + 1 = 4
        self.assertEqual(path[0], 0)
        self.assertEqual(path[-1], 3)
    
    def test_astar_same_vertex(self):
        """Test A* from vertex to itself."""
        result = astar(self.graph, 0, 0, self.heuristic)
        self.assertIsNotNone(result)
        distance, path = result
        self.assertEqual(distance, 0)
        self.assertEqual(path, [0])
    
    def test_astar_no_path(self):
        """Test A* when no path exists."""
        isolated_graph = {
            0: [(1, 1)],
            1: [],
            2: []
        }
        
        def heuristic(node):
            return 0 if node == 2 else 1
        
        result = astar(isolated_graph, 0, 2, heuristic)
        self.assertIsNone(result)
    
    def test_astar_zero_heuristic(self):
        """Test A* with zero heuristic (equivalent to Dijkstra's)."""
        def zero_heuristic(node):
            return 0
        
        result = astar(self.graph, 0, 3, zero_heuristic)
        self.assertIsNotNone(result)
        distance, path = result
        self.assertEqual(distance, 3)
        self.assertEqual(path, [0, 2, 3])
    
    def test_astar_perfect_heuristic(self):
        """Test A* with perfect heuristic."""
        def perfect_heuristic(node):
            # Perfect heuristic: actual distance to goal
            perfect_distances = {0: 3, 1: 5, 2: 1, 3: 0}
            return perfect_distances.get(node, 0)
        
        result = astar(self.graph, 0, 3, perfect_heuristic)
        self.assertIsNotNone(result)
        distance, path = result
        self.assertEqual(distance, 3)
    
    def test_astar_overestimate_heuristic(self):
        """Test A* with overestimating heuristic (should still work but may be suboptimal)."""
        def overestimate_heuristic(node):
            # Overestimating heuristic (not admissible)
            overestimate = {0: 10, 1: 10, 2: 10, 3: 0}
            return overestimate.get(node, 0)
        
        result = astar(self.graph, 0, 3, overestimate_heuristic)
        # Should still find a path, but may not be optimal
        self.assertIsNotNone(result)
        distance, path = result
        self.assertGreaterEqual(distance, 3)
    
    def test_astar_empty_graph(self):
        """Test A* on empty graph."""
        result = astar({}, 0, 3, self.heuristic)
        self.assertIsNone(result)
    
    def test_astar_single_vertex(self):
        """Test A* on graph with single vertex."""
        graph = {0: []}
        def heuristic(node):
            return 0
        
        result = astar(graph, 0, 0, heuristic)
        self.assertIsNotNone(result)
        distance, path = result
        self.assertEqual(distance, 0)
        self.assertEqual(path, [0])
    
    def test_astar_admissible_inconsistent_heuristic_is_optimal(self):
        """An admissible but inconsistent heuristic must still give the optimal path."""
        # h(A) = 4 equals the true cost A -> C -> G, so h never overestimates, but it is
        # not consistent (h(A) > w(A, C) + h(C)). C is first reached via B with g = 3 and
        # expanded; the cheaper route via A (g = 2) must re-open it.
        graph = {
            'S': [('A', 1), ('B', 1)],
            'A': [('C', 1)],
            'B': [('C', 2)],
            'C': [('G', 3)],
            'G': []
        }
        h = {'A': 4}
        result = astar(graph, 'S', 'G', lambda v: h.get(v, 0))
        self.assertEqual(result, (5, ['S', 'A', 'C', 'G']))

    def test_astar_grid_matches_bfs(self):
        """Manhattan distance on a 4-connected grid maze gives the BFS shortest lengths."""
        rows, cols = 4, 5
        walls = {(1, 0), (1, 1), (1, 2), (1, 3)}  # row 1 is open only at column 4
        graph = {}
        for r in range(rows):
            for c in range(cols):
                if (r, c) in walls:
                    continue
                graph[r * cols + c] = [
                    (nr * cols + nc, 1)
                    for nr, nc in ((r - 1, c), (r + 1, c), (r, c - 1), (r, c + 1))
                    if 0 <= nr < rows and 0 <= nc < cols and (nr, nc) not in walls
                ]
        # Reference: breadth-first search hop counts from cell 0.
        hops, frontier = {0: 0}, [0]
        for u in frontier:
            for v, _ in graph[u]:
                if v not in hops:
                    hops[v] = hops[u] + 1
                    frontier.append(v)
        self.assertEqual(hops[2 * cols + 2], 8)  # right along row 0, down column 4, back left
        for goal in graph:
            goal_rc = divmod(goal, cols)
            result = astar(graph, 0, goal, lambda v: manhattan_distance(divmod(v, cols), goal_rc))
            self.assertIsNotNone(result)
            distance, path = result
            self.assertEqual(distance, hops[goal])
            self.assertEqual(len(path), distance + 1)
            self.assertEqual((path[0], path[-1]), (0, goal))
            for a, b in zip(path, path[1:]):
                self.assertIn((b, 1), graph[a])

    def test_manhattan_distance(self):
        """Test Manhattan distance heuristic."""
        pos1 = (0, 0)
        pos2 = (3, 4)
        distance = manhattan_distance(pos1, pos2)
        self.assertEqual(distance, 7)  # |0-3| + |0-4| = 3 + 4 = 7
    
    def test_manhattan_distance_same_position(self):
        """Test Manhattan distance for same position."""
        pos = (5, 5)
        distance = manhattan_distance(pos, pos)
        self.assertEqual(distance, 0)
    
    def test_euclidean_distance(self):
        """Test Euclidean distance heuristic."""
        pos1 = (0, 0)
        pos2 = (3, 4)
        distance = euclidean_distance(pos1, pos2)
        self.assertAlmostEqual(distance, 5.0, places=5)  # sqrt(3^2 + 4^2) = 5
    
    def test_euclidean_distance_same_position(self):
        """Test Euclidean distance for same position."""
        pos = (5, 5)
        distance = euclidean_distance(pos, pos)
        self.assertEqual(distance, 0.0)


if __name__ == '__main__':
    unittest.main()


