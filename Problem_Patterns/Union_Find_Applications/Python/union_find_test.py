import unittest
from union_find import UnionFind, count_components

class TestUnionFind(unittest.TestCase):
    def test_basic_operations(self):
        uf = UnionFind(5)
        self.assertEqual(uf.get_count(), 5)
        
        self.assertTrue(uf.union(0, 1))
        self.assertFalse(uf.union(0, 1)) # Already connected
        self.assertEqual(uf.get_count(), 4)
        
        self.assertTrue(uf.connected(0, 1))
        self.assertFalse(uf.connected(0, 2))

    def test_transitive_connectivity(self):
        uf = UnionFind(10)
        uf.union(0, 1)
        uf.union(1, 2)
        uf.union(2, 3)
        
        self.assertTrue(uf.connected(0, 3))
        self.assertTrue(uf.connected(1, 3))
        self.assertFalse(uf.connected(0, 4))
        
        self.assertEqual(uf.find(0), uf.find(3))

    def test_rank_optimization(self):
        # Specific test to potentially check rank logic (mostly internal but good for validation)
        uf = UnionFind(3)
        # 0 -> 1
        uf.union(0, 1)
        # 0 & 1 are in same set. 1 might be parent if rank was same.
        # Now union(2, 1) -> should attach 2 to the set {0, 1}
        uf.union(2, 1)
        
        root = uf.find(0)
        self.assertEqual(uf.find(1), root)
        self.assertEqual(uf.find(2), root)

    def test_invalid_input(self):
        uf = UnionFind(5)
        with self.assertRaises(ValueError):
            uf.find(5)
        with self.assertRaises(ValueError):
            uf.find(-1)
        with self.assertRaises(ValueError):
            UnionFind(-1)

    def test_count_components(self):
        n = 5
        edges = [[0, 1], [1, 2], [3, 4]]
        # Components: {0,1,2}, {3,4} -> 2
        self.assertEqual(count_components(n, edges), 2)
        
        edges2 = [[0, 1], [1, 2], [2, 3], [3, 4]]
        # Components: {0,1,2,3,4} -> 1
        self.assertEqual(count_components(n, edges2), 1)

    def test_union_result_detects_cycle(self):
        # union() returns False for an edge whose ends are already connected.
        uf = UnionFind(5)
        results = [uf.union(u, v) for u, v in [(0, 1), (1, 2), (2, 3), (3, 1), (3, 4)]]
        self.assertEqual(results, [True, True, True, False, True])

    def test_kruskal_with_union(self):
        edges = [(0, 1, 1), (2, 3, 2), (0, 2, 3), (1, 3, 4), (1, 2, 5), (3, 4, 7)]
        uf = UnionFind(5)
        total = sum(w for u, v, w in sorted(edges, key=lambda e: e[2]) if uf.union(u, v))
        self.assertEqual(total, 13)
        self.assertEqual(uf.get_count(), 1)

    def test_path_compression_flattens(self):
        uf = UnionFind(6)
        for u, v in [(0, 1), (2, 3), (0, 2), (4, 5)]:
            uf.union(u, v)
        self.assertEqual(uf.parent, [0, 0, 0, 2, 4, 4])
        uf.find(3)
        self.assertEqual(uf.parent, [0, 0, 0, 0, 4, 4])


if __name__ == '__main__':
    unittest.main()
