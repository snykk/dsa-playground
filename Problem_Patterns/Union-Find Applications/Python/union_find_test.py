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

if __name__ == '__main__':
    unittest.main()
