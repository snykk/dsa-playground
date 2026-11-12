"""
Test suite for Disjoint Set Union (DSU) data structure.
"""

import unittest
import random
from dsu import (
    DSU,
    UnionFind,
    connected_components,
    has_cycle,
    kruskal_mst,
    largest_component,
)


class TestDSUInitialization(unittest.TestCase):

    def test_all_elements_separate(self):
        dsu = DSU(5)
        self.assertEqual(dsu.get_component_count(), 5)
        for i in range(5):
            self.assertEqual(dsu.find(i), i)

    def test_single_element(self):
        dsu = DSU(1)
        self.assertEqual(dsu.get_component_count(), 1)
        self.assertEqual(dsu.find(0), 0)
        self.assertEqual(dsu.get_size(0), 1)


class TestDSUUnion(unittest.TestCase):

    def test_union_two_elements(self):
        dsu = DSU(5)
        result = dsu.union(0, 1)
        self.assertTrue(result)
        self.assertEqual(dsu.get_component_count(), 4)
        self.assertTrue(dsu.connected(0, 1))

    def test_union_already_same_set(self):
        dsu = DSU(5)
        dsu.union(0, 1)
        result = dsu.union(0, 1)
        self.assertFalse(result)
        self.assertEqual(dsu.get_component_count(), 4)

    def test_multiple_unions_forming_larger_set(self):
        dsu = DSU(6)
        dsu.union(0, 1)
        dsu.union(2, 3)
        dsu.union(1, 3)
        # Now {0,1,2,3} should be one set
        self.assertTrue(dsu.connected(0, 2))
        self.assertTrue(dsu.connected(0, 3))
        self.assertTrue(dsu.connected(1, 2))
        self.assertEqual(dsu.get_component_count(), 3)

    def test_all_in_one_set(self):
        dsu = DSU(4)
        dsu.union(0, 1)
        dsu.union(1, 2)
        dsu.union(2, 3)
        self.assertEqual(dsu.get_component_count(), 1)
        for i in range(4):
            for j in range(4):
                self.assertTrue(dsu.connected(i, j))


class TestDSUFind(unittest.TestCase):

    def test_find_root_is_self_initially(self):
        dsu = DSU(3)
        for i in range(3):
            self.assertEqual(dsu.find(i), i)

    def test_path_compression(self):
        dsu = DSU(5)
        # union by rank: {0,1} and {2,3} first, then the roots 0 and 2 -> 2 hangs under 0
        dsu.union(0, 1)
        dsu.union(2, 3)
        dsu.union(0, 2)
        # 3 is a grandchild of the root, so it is not yet flat
        self.assertEqual(dsu.get_parent(3), 2)
        self.assertEqual(dsu.find(3), 0)
        # after find, 3 points directly to the root
        self.assertEqual(dsu.get_parent(3), 0)

    def test_negative_element_rejected(self):
        dsu = DSU(3)
        with self.assertRaises(IndexError):
            dsu.find(-1)
        with self.assertRaises(IndexError):
            dsu.connected(-1, 2)
        with self.assertRaises(IndexError):
            dsu.find(3)

    def test_negative_size_rejected(self):
        with self.assertRaises(ValueError):
            DSU(-2)


class TestDSUConnected(unittest.TestCase):

    def test_not_connected_initially(self):
        dsu = DSU(3)
        self.assertFalse(dsu.connected(0, 1))
        self.assertFalse(dsu.connected(1, 2))

    def test_connected_after_union(self):
        dsu = DSU(3)
        dsu.union(0, 2)
        self.assertTrue(dsu.connected(0, 2))
        self.assertFalse(dsu.connected(0, 1))

    def test_connected_same_element(self):
        dsu = DSU(3)
        self.assertTrue(dsu.connected(0, 0))


class TestDSUComponentCount(unittest.TestCase):

    def test_count_decreases_after_union(self):
        dsu = DSU(5)
        self.assertEqual(dsu.get_component_count(), 5)
        dsu.union(0, 1)
        self.assertEqual(dsu.get_component_count(), 4)
        dsu.union(2, 3)
        self.assertEqual(dsu.get_component_count(), 3)
        dsu.union(0, 2)
        self.assertEqual(dsu.get_component_count(), 2)
        dsu.union(0, 4)
        self.assertEqual(dsu.get_component_count(), 1)

    def test_count_unchanged_on_redundant_union(self):
        dsu = DSU(3)
        dsu.union(0, 1)
        self.assertEqual(dsu.get_component_count(), 2)
        dsu.union(1, 0)
        self.assertEqual(dsu.get_component_count(), 2)


class TestDSUGetComponents(unittest.TestCase):

    def test_initial_components(self):
        dsu = DSU(3)
        components = dsu.get_components()
        self.assertEqual(len(components), 3)
        for root, members in components.items():
            self.assertEqual(len(members), 1)

    def test_components_after_unions(self):
        dsu = DSU(5)
        dsu.union(0, 1)
        dsu.union(2, 3)
        components = dsu.get_components()
        self.assertEqual(len(components), 3)
        sizes = sorted(len(v) for v in components.values())
        self.assertEqual(sizes, [1, 2, 2])

    def test_single_component(self):
        dsu = DSU(3)
        dsu.union(0, 1)
        dsu.union(1, 2)
        components = dsu.get_components()
        self.assertEqual(len(components), 1)
        members = list(components.values())[0]
        self.assertEqual(sorted(members), [0, 1, 2])


class TestDSUGetSize(unittest.TestCase):

    def test_initial_sizes(self):
        dsu = DSU(4)
        for i in range(4):
            self.assertEqual(dsu.get_size(i), 1)

    def test_size_after_union(self):
        dsu = DSU(5)
        dsu.union(0, 1)
        self.assertEqual(dsu.get_size(0), 2)
        self.assertEqual(dsu.get_size(1), 2)

    def test_size_after_multiple_unions(self):
        dsu = DSU(5)
        dsu.union(0, 1)
        dsu.union(2, 3)
        dsu.union(0, 2)
        self.assertEqual(dsu.get_size(0), 4)
        self.assertEqual(dsu.get_size(3), 4)
        self.assertEqual(dsu.get_size(4), 1)


class TestDSUAgainstBruteForce(unittest.TestCase):

    def test_random_sequences_match_label_array(self):
        rng = random.Random(7)
        for _ in range(200):
            n = rng.randint(1, 12)
            dsu = DSU(n)
            label = list(range(n))
            for _ in range(rng.randint(0, 40)):
                x, y = rng.randrange(n), rng.randrange(n)
                if rng.random() < 0.6:
                    merged = label[x] != label[y]
                    self.assertEqual(dsu.union(x, y), merged)
                    old, new = label[y], label[x]
                    label = [new if v == old else v for v in label]
                else:
                    self.assertEqual(dsu.connected(x, y), label[x] == label[y])
                self.assertEqual(dsu.get_component_count(), len(set(label)))
                self.assertEqual(dsu.get_size(x), label.count(label[x]))


class TestUnionFindAlias(unittest.TestCase):

    def test_alias_and_count(self):
        self.assertIs(UnionFind, DSU)
        uf = UnionFind(5)
        self.assertEqual(uf.get_count(), 5)
        self.assertEqual(uf.count, 5)
        uf.union(0, 1)
        self.assertEqual(uf.count, 4)

    def test_union_by_rank_and_path_compression(self):
        # Eight singletons merged pairwise (the README trace).
        uf = UnionFind(8)
        for a, b in [(0, 1), (2, 3), (0, 2), (4, 5), (6, 7), (4, 6), (0, 4)]:
            self.assertTrue(uf.union(a, b))
        self.assertEqual(uf.parent, [0, 0, 0, 2, 0, 4, 4, 6])
        self.assertEqual(uf.rank, [3, 0, 1, 0, 2, 0, 1, 0])
        self.assertEqual(uf.get_count(), 1)
        self.assertEqual(uf.find(7), 0)
        self.assertEqual(uf.parent, [0, 0, 0, 2, 0, 4, 0, 0])

    def test_long_chain_of_unions(self):
        n = 100000
        uf = DSU(n)
        for i in range(n - 1):
            uf.union(i, i + 1)
        self.assertEqual(uf.get_component_count(), 1)
        self.assertTrue(uf.connected(0, n - 1))

    def test_empty_structure(self):
        dsu = DSU(0)
        self.assertEqual(dsu.get_component_count(), 0)
        self.assertEqual(dsu.get_components(), {})
        self.assertEqual(largest_component([], 0), [])


class TestGraphApplications(unittest.TestCase):

    def test_connected_components(self):
        comps = connected_components([(0, 1), (1, 2), (3, 4)], 5)
        self.assertEqual(sorted(sorted(c) for c in comps), [[0, 1, 2], [3, 4]])

    def test_cycle_detection(self):
        self.assertFalse(has_cycle([(0, 1), (1, 2), (3, 4)], 5))
        self.assertTrue(has_cycle([(0, 1), (1, 2), (2, 0)], 3))
        self.assertTrue(has_cycle([(0, 0)], 1))

    def test_kruskal_mst(self):
        edges = [(0, 1, 4), (0, 2, 8), (1, 2, 2), (1, 3, 5), (2, 3, 10)]
        mst = kruskal_mst(edges, 4)
        self.assertEqual(len(mst), 3)
        self.assertEqual(sum(e[2] for e in mst), 11)

    def test_largest_component(self):
        edges = [(0, 1), (1, 2), (3, 4), (4, 5), (5, 3)]
        self.assertEqual(len(largest_component(edges, 6)), 3)


if __name__ == "__main__":
    unittest.main()
