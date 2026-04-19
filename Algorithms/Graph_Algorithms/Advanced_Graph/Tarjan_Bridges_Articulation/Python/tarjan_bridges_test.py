"""Unit tests for Tarjan's bridges & articulation points."""
import unittest

from tarjan_bridges import find_bridges_and_articulations


class TestBridges(unittest.TestCase):
    def test_single_edge(self):
        bridges, aps = find_bridges_and_articulations(2, [(0, 1)])
        self.assertEqual(bridges, [(0, 1)])
        self.assertEqual(aps, [])

    def test_triangle_no_bridges(self):
        # Triangle is 2-edge connected: no bridges, no articulations
        bridges, aps = find_bridges_and_articulations(3, [(0, 1), (1, 2), (2, 0)])
        self.assertEqual(bridges, [])
        self.assertEqual(aps, [])

    def test_triangle_plus_tail(self):
        # Triangle 0-1-2, plus tail 2-3: one bridge, vertex 2 is articulation
        edges = [(0, 1), (1, 2), (2, 0), (2, 3)]
        bridges, aps = find_bridges_and_articulations(4, edges)
        self.assertEqual(bridges, [(2, 3)])
        self.assertEqual(aps, [2])

    def test_linear_chain_every_edge_is_bridge(self):
        # 0 - 1 - 2 - 3: all 3 edges are bridges, vertices 1 and 2 articulations
        edges = [(0, 1), (1, 2), (2, 3)]
        bridges, aps = find_bridges_and_articulations(4, edges)
        self.assertEqual(bridges, [(0, 1), (1, 2), (2, 3)])
        self.assertEqual(aps, [1, 2])

    def test_isolated_vertices(self):
        # Vertices 0,1,2 all isolated — no bridges, no articulations
        bridges, aps = find_bridges_and_articulations(3, [])
        self.assertEqual(bridges, [])
        self.assertEqual(aps, [])

    def test_disconnected_components(self):
        # Two disjoint triangles — no bridges, no articulations
        edges = [(0, 1), (1, 2), (2, 0), (3, 4), (4, 5), (5, 3)]
        bridges, aps = find_bridges_and_articulations(6, edges)
        self.assertEqual(bridges, [])
        self.assertEqual(aps, [])

    def test_star_graph(self):
        # Star: 0 connected to 1,2,3. All edges are bridges. 0 is articulation.
        edges = [(0, 1), (0, 2), (0, 3)]
        bridges, aps = find_bridges_and_articulations(4, edges)
        self.assertEqual(bridges, [(0, 1), (0, 2), (0, 3)])
        self.assertEqual(aps, [0])

    def test_leetcode_example(self):
        # LC 1192 example: 4 vertices, edges [[0,1],[1,2],[2,0],[1,3]]
        # Only (1,3) is a bridge
        edges = [(0, 1), (1, 2), (2, 0), (1, 3)]
        bridges, aps = find_bridges_and_articulations(4, edges)
        self.assertEqual(bridges, [(1, 3)])
        self.assertEqual(aps, [1])

    def test_parallel_edges(self):
        # Two parallel edges between 0 and 1 — not a bridge
        edges = [(0, 1), (0, 1)]
        bridges, aps = find_bridges_and_articulations(2, edges)
        self.assertEqual(bridges, [])
        self.assertEqual(aps, [])

    def test_cycle_with_extra_bridge(self):
        # 4-cycle 0-1-2-3-0, plus 2-4 tail
        edges = [(0, 1), (1, 2), (2, 3), (3, 0), (2, 4)]
        bridges, aps = find_bridges_and_articulations(5, edges)
        self.assertEqual(bridges, [(2, 4)])
        self.assertEqual(aps, [2])


if __name__ == "__main__":
    unittest.main()
