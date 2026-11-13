"""
Test suite for Union-Find (DSU) implementation
"""

import unittest
from union_find import (
    UnionFind,
    union_find_connected_components,
    union_find_cycle_detection,
    union_find_kruskal_mst,
    union_find_largest_component
)


class TestUnionFind(unittest.TestCase):
    
    def test_union_find_basic(self):
        uf = UnionFind(5)
        
        # Initially all separate
        self.assertEqual(uf.get_count(), 5)
        self.assertFalse(uf.connected(0, 1))
        
        # Union 0 and 1
        self.assertTrue(uf.union(0, 1))
        self.assertEqual(uf.get_count(), 4)
        self.assertTrue(uf.connected(0, 1))
        
        # Union 2 and 3
        self.assertTrue(uf.union(2, 3))
        self.assertEqual(uf.get_count(), 3)
        self.assertTrue(uf.connected(2, 3))
        
        # Union 1 and 2 (connects two sets)
        self.assertTrue(uf.union(1, 2))
        self.assertEqual(uf.get_count(), 2)
        self.assertTrue(uf.connected(0, 3))
    
    def test_union_find_already_connected(self):
        uf = UnionFind(3)
        uf.union(0, 1)
        
        # Try to union again
        self.assertFalse(uf.union(0, 1))
        self.assertEqual(uf.get_count(), 2)
    
    def test_union_find_components(self):
        uf = UnionFind(5)
        uf.union(0, 1)
        uf.union(2, 3)
        
        components = uf.get_components()
        self.assertEqual(len(components), 3)  # {0,1}, {2,3}, {4}
    
    def test_connected_components(self):
        edges = [(0, 1), (1, 2), (3, 4)]
        components = union_find_connected_components(edges, 5)
        self.assertEqual(len(components), 2)  # {0,1,2} and {3,4}
    
    def test_cycle_detection_no_cycle(self):
        edges = [(0, 1), (1, 2), (3, 4)]
        has_cycle = union_find_cycle_detection(edges, 5)
        self.assertFalse(has_cycle)
    
    def test_cycle_detection_with_cycle(self):
        edges = [(0, 1), (1, 2), (2, 0)]  # Triangle
        has_cycle = union_find_cycle_detection(edges, 3)
        self.assertTrue(has_cycle)
    
    def test_kruskal_mst(self):
        edges = [
            (0, 1, 4),
            (0, 2, 8),
            (1, 2, 2),
            (1, 3, 5),
            (2, 3, 10)
        ]
        mst = union_find_kruskal_mst(edges, 4)
        self.assertEqual(len(mst), 3)  # MST has 3 edges for 4 vertices
        total_weight = sum(edge[2] for edge in mst)
        self.assertEqual(total_weight, 11)  # 2 + 4 + 5
    
    def test_largest_component(self):
        edges = [(0, 1), (1, 2), (3, 4), (4, 5), (5, 3)]
        largest = union_find_largest_component(edges, 6)
        self.assertEqual(len(largest), 3)  # {3, 4, 5} is largest

    def test_union_by_rank_and_path_compression(self):
        # The trace used in the README: eight singletons merged pairwise.
        uf = UnionFind(8)
        for a, b in [(0, 1), (2, 3), (0, 2), (4, 5), (6, 7), (4, 6), (0, 4)]:
            self.assertTrue(uf.union(a, b))
        self.assertEqual(uf.parent, [0, 0, 0, 2, 0, 4, 4, 6])
        self.assertEqual(uf.rank, [3, 0, 1, 0, 2, 0, 1, 0])
        self.assertEqual(uf.get_count(), 1)
        # find(7) walks 7 -> 6 -> 4 -> 0 and points 7 and 6 straight at the root
        self.assertEqual(uf.find(7), 0)
        self.assertEqual(uf.parent, [0, 0, 0, 2, 0, 4, 0, 0])

    def test_union_returns_false_inside_one_set(self):
        uf = UnionFind(4)
        self.assertTrue(uf.union(0, 1))
        self.assertFalse(uf.union(1, 0))
        self.assertEqual(uf.get_count(), 3)

    def test_long_chain_of_unions(self):
        # Union by rank keeps trees shallow, so find never recurses deeply
        n = 100000
        uf = UnionFind(n)
        for i in range(n - 1):
            uf.union(i, i + 1)
        self.assertEqual(uf.get_count(), 1)
        self.assertTrue(uf.connected(0, n - 1))

    def test_empty_structure(self):
        uf = UnionFind(0)
        self.assertEqual(uf.get_count(), 0)
        self.assertEqual(uf.get_components(), {})
        self.assertEqual(union_find_largest_component([], 0), [])


if __name__ == '__main__':
    unittest.main()

