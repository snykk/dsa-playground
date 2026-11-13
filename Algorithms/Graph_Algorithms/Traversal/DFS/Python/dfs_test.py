"""
Test suite for DFS implementation
"""

import random
import time
import unittest
from dfs import (
    dfs_adjacency_list,
    dfs_recursive,
    dfs_with_path,
    dfs_connected_components,
    dfs_detect_cycle,
    dfs_topological_sort
)


class TestDFS(unittest.TestCase):
    """Test cases for DFS (Depth-First Search) implementation."""
    
    def setUp(self):
        """Set up test fixtures."""
        # Simple graph: 1 -> 2 -> 3
        #               1 -> 4
        self.graph1 = {
            1: [2, 4],
            2: [3],
            3: [],
            4: []
        }
        
        # Undirected graph: 1-2-3-4
        #                   1-5
        self.graph2 = {
            1: [2, 5],
            2: [1, 3],
            3: [2, 4],
            4: [3],
            5: [1]
        }
        
        # Disconnected graph
        self.graph3 = {
            1: [2],
            2: [1],
            3: [4],
            4: [3]
        }
        
        # DAG for topological sort
        self.dag = {
            1: [2, 3],
            2: [4],
            3: [4],
            4: []
        }
        
        # Graph with cycle
        self.cyclic_graph = {
            1: [2],
            2: [3],
            3: [1]
        }
        
        # Large graph for comprehensive testing
        self.graph4 = {
            1: [2, 3],
            2: [4, 5],
            3: [6],
            4: [7],
            5: [7],
            6: [8],
            7: [9],
            8: [9],
            9: []
        }
    
    def test_dfs_adjacency_list_basic(self):
        """Test basic DFS traversal on simple graph."""
        result = dfs_adjacency_list(self.graph1, 1)
        # DFS order may vary, but should contain all vertices
        self.assertEqual(len(result), 4)
        self.assertEqual(result[0], 1)
        self.assertEqual(set(result), {1, 2, 3, 4})
        self.assertIn(2, result)
        self.assertIn(3, result)
        self.assertIn(4, result)
    
    def test_dfs_adjacency_list_undirected(self):
        """Test DFS on undirected graph."""
        result = dfs_adjacency_list(self.graph2, 1)
        self.assertEqual(len(result), 5)
        self.assertEqual(result[0], 1)
        self.assertIn(2, result)
        self.assertIn(3, result)
        self.assertIn(4, result)
        self.assertIn(5, result)
    
    def test_dfs_adjacency_list_large_graph(self):
        """Test DFS on larger graph."""
        result = dfs_adjacency_list(self.graph4, 1)
        self.assertEqual(len(result), 9)
        self.assertEqual(result[0], 1)
        self.assertIn(9, result)
    
    def test_dfs_recursive(self):
        """Test recursive DFS traversal."""
        result = dfs_recursive(self.graph1, 1)
        self.assertEqual(len(result), 4)
        self.assertEqual(result[0], 1)
        self.assertEqual(set(result), {1, 2, 3, 4})
    
    def test_dfs_recursive_undirected(self):
        """Test recursive DFS on undirected graph."""
        result = dfs_recursive(self.graph2, 1)
        self.assertEqual(len(result), 5)
        self.assertEqual(result[0], 1)
    
    def test_dfs_with_path_found(self):
        """Test finding path when path exists."""
        path = dfs_with_path(self.graph1, 1, 3)
        self.assertIsNotNone(path)
        self.assertEqual(path[0], 1)
        self.assertEqual(path[-1], 3)
        self.assertIn(2, path)
    
    def test_dfs_with_path_not_found(self):
        """Test finding path when no path exists."""
        path = dfs_with_path(self.graph3, 1, 3)
        self.assertIsNone(path)
    
    def test_dfs_with_path_same_vertex(self):
        """Test finding path from vertex to itself."""
        path = dfs_with_path(self.graph1, 1, 1)
        self.assertIsNotNone(path)
        self.assertEqual(path, [1])
    
    def test_dfs_with_path_direct_edge(self):
        """Test finding path with direct edge."""
        path = dfs_with_path(self.graph1, 1, 2)
        self.assertIsNotNone(path)
        self.assertEqual(path[0], 1)
        self.assertEqual(path[-1], 2)
    
    def test_dfs_connected_components(self):
        """Test finding connected components."""
        components = dfs_connected_components(self.graph3)
        self.assertEqual(len(components), 2)
        self.assertEqual(set(components[0]), {1, 2})
        self.assertEqual(set(components[1]), {3, 4})
    
    def test_dfs_connected_components_single_component(self):
        """Test connected components on connected graph."""
        components = dfs_connected_components(self.graph1)
        self.assertEqual(len(components), 1)
        self.assertEqual(set(components[0]), {1, 2, 3, 4})
    
    def test_dfs_connected_components_empty_graph(self):
        """Test connected components on empty graph."""
        components = dfs_connected_components({})
        self.assertEqual(len(components), 0)
    
    def test_dfs_detect_cycle_undirected(self):
        """Test cycle detection in undirected graph."""
        has_cycle = dfs_detect_cycle(self.cyclic_graph, directed=False)
        self.assertTrue(has_cycle)
        
        no_cycle = dfs_detect_cycle(self.graph1, directed=False)
        self.assertFalse(no_cycle)
    
    def test_dfs_detect_cycle_directed(self):
        """Test cycle detection in directed graph."""
        has_cycle = dfs_detect_cycle(self.cyclic_graph, directed=True)
        self.assertTrue(has_cycle)
        
        no_cycle = dfs_detect_cycle(self.dag, directed=True)
        self.assertFalse(no_cycle)
    
    def test_dfs_detect_cycle_no_cycle(self):
        """Test cycle detection on acyclic graph."""
        acyclic_graph = {
            1: [2],
            2: [3],
            3: []
        }
        has_cycle = dfs_detect_cycle(acyclic_graph, directed=True)
        self.assertFalse(has_cycle)
    
    def test_dfs_topological_sort(self):
        """Test topological sort on DAG."""
        topo_order = dfs_topological_sort(self.dag)
        self.assertIsNotNone(topo_order)
        # Check that all vertices are present
        self.assertEqual(set(topo_order), {1, 2, 3, 4})
        # Check that 1 comes before 2, 3, 4
        self.assertLess(topo_order.index(1), topo_order.index(2))
        self.assertLess(topo_order.index(1), topo_order.index(3))
        # Check that 2, 3 come before 4
        self.assertLess(topo_order.index(2), topo_order.index(4))
        self.assertLess(topo_order.index(3), topo_order.index(4))
    
    def test_dfs_topological_sort_cyclic(self):
        """Test topological sort on cyclic graph."""
        topo_order = dfs_topological_sort(self.cyclic_graph)
        self.assertIsNone(topo_order)
    
    def test_dfs_topological_sort_linear(self):
        """Test topological sort on linear graph."""
        linear_graph = {
            1: [2],
            2: [3],
            3: [4],
            4: []
        }
        topo_order = dfs_topological_sort(linear_graph)
        self.assertIsNotNone(topo_order)
        self.assertEqual(topo_order, [1, 2, 3, 4])
    
    def test_dfs_empty_graph(self):
        """Test DFS on empty graph."""
        result = dfs_adjacency_list({}, 1)
        self.assertEqual(result, [])
    
    def test_dfs_single_vertex(self):
        """Test DFS on graph with single vertex."""
        graph = {1: []}
        result = dfs_adjacency_list(graph, 1)
        self.assertEqual(result, [1])
        self.assertEqual(len(result), 1)
    
    def test_dfs_isolated_vertices(self):
        """Test DFS with isolated vertices."""
        graph = {
            1: [],
            2: [],
            3: []
        }
        result = dfs_adjacency_list(graph, 1)
        self.assertEqual(result, [1])
        self.assertEqual(len(result), 1)
    
    def test_dfs_start_not_in_graph(self):
        """Test DFS when start vertex not in graph."""
        result = dfs_adjacency_list(self.graph1, 99)
        self.assertEqual(result, [])

    def test_dfs_with_path_neighbor_only_target(self):
        """A target that only appears in neighbor lists (no key) is still reachable."""
        self.assertEqual(dfs_with_path({0: [1]}, 0, 1), [0, 1])
        self.assertEqual(dfs_with_path({0: [1, 2], 1: [3]}, 0, 3), [0, 1, 3])
        self.assertIsNone(dfs_with_path({0: [1]}, 0, 2))

    def test_dfs_with_path_follows_dfs_order(self):
        """The returned path is the one DFS actually walked, not the first edge seen."""
        # 4 is first pushed from 1, but DFS reaches it through 2 first.
        self.assertEqual(dfs_with_path({1: [2, 4], 2: [4], 4: []}, 1, 4), [1, 2, 4])
        self.assertEqual(dfs_with_path({1: [2, 4], 2: [3], 3: [4], 4: []}, 1, 4), [1, 2, 3, 4])

    def test_dfs_with_path_long_path_linear_time(self):
        """No path copy per push: a 50000-vertex path takes well under a second."""
        n = 50000
        graph = {i: [i + 1] for i in range(n - 1)}
        graph[n - 1] = []
        started = time.perf_counter()
        path = dfs_with_path(graph, 0, n - 1)
        elapsed = time.perf_counter() - started
        self.assertEqual(path, list(range(n)))
        # The old path-copying version needed several seconds here (O(V^2)).
        self.assertLess(elapsed, 1.0)

    def test_dfs_recursive_deep_path(self):
        """A 5000-vertex path is deeper than Python's default recursion limit."""
        n = 5000
        graph = {i: [i + 1] for i in range(n - 1)}
        graph[n - 1] = []
        self.assertEqual(dfs_recursive(graph, 0), list(range(n)))

    def test_dfs_recursive_matches_true_recursion(self):
        """The explicit stack visits vertices in exactly the recursive order."""
        def reference(graph, start):
            visited, order = set(), []

            def go(u):
                visited.add(u)
                order.append(u)
                for v in graph.get(u, []):
                    if v not in visited:
                        go(v)
            go(start)
            return order

        rng = random.Random(7)
        for _ in range(300):
            n = rng.randint(1, 8)
            graph = {i: [rng.randrange(n + 1) for _ in range(rng.randint(0, 4))] for i in range(n)}
            start = rng.randrange(n)
            self.assertEqual(dfs_recursive(graph, start), reference(graph, start))

    def test_dfs_connected_components_deep_path(self):
        """Components of a 5000-vertex undirected path: one component, no RecursionError."""
        n = 5000
        graph = {i: [j for j in (i - 1, i + 1) if 0 <= j < n] for i in range(n)}
        self.assertEqual(dfs_connected_components(graph), [list(range(n))])

    def test_dfs_detect_cycle_deep_path(self):
        """Cycle detection on 5000-vertex paths, with and without a closing edge."""
        n = 5000
        directed = {i: [i + 1] for i in range(n - 1)}
        directed[n - 1] = []
        self.assertFalse(dfs_detect_cycle(directed, directed=True))
        directed[n - 1] = [0]
        self.assertTrue(dfs_detect_cycle(directed, directed=True))

        undirected = {i: [j for j in (i - 1, i + 1) if 0 <= j < n] for i in range(n)}
        self.assertFalse(dfs_detect_cycle(undirected, directed=False))
        undirected[0].append(n - 1)
        undirected[n - 1].append(0)
        self.assertTrue(dfs_detect_cycle(undirected, directed=False))

    def test_dfs_topological_sort_deep_path(self):
        """Topological sort of a 5000-vertex chain, and None once it is closed."""
        n = 5000
        chain = {i: [i + 1] for i in range(n - 1)}
        chain[n - 1] = []
        self.assertEqual(dfs_topological_sort(chain), list(range(n)))
        chain[n - 1] = [0]
        self.assertIsNone(dfs_topological_sort(chain))


if __name__ == '__main__':
    unittest.main()

