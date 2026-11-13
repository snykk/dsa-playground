"""
Test suite for Disjoint Set Union (DSU) data structure.
"""

import unittest
from dsu import DSU


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


if __name__ == "__main__":
    unittest.main()
