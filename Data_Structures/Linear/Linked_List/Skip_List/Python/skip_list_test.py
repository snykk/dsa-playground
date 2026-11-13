import unittest
from skip_list import SkipList


class TestSkipList(unittest.TestCase):
    def setUp(self):
        self.sl = SkipList()

    def test_empty_list(self):
        self.assertEqual(self.sl.display(), [])
        self.assertFalse(self.sl.search(1))

    def test_insert_single(self):
        self.sl.insert(10)
        self.assertEqual(self.sl.display(), [10])

    def test_insert_multiple(self):
        for val in [3, 6, 9, 12, 19, 25]:
            self.sl.insert(val)
        self.assertEqual(self.sl.display(), [3, 6, 9, 12, 19, 25])

    def test_insert_reverse_order(self):
        for val in [5, 4, 3, 2, 1]:
            self.sl.insert(val)
        self.assertEqual(self.sl.display(), [1, 2, 3, 4, 5])

    def test_insert_duplicate(self):
        self.sl.insert(5)
        self.sl.insert(5)
        self.assertEqual(self.sl.display(), [5])

    def test_search_hit(self):
        for val in [3, 7, 11, 20]:
            self.sl.insert(val)
        self.assertTrue(self.sl.search(3))
        self.assertTrue(self.sl.search(7))
        self.assertTrue(self.sl.search(11))
        self.assertTrue(self.sl.search(20))

    def test_search_miss(self):
        for val in [3, 7, 11, 20]:
            self.sl.insert(val)
        self.assertFalse(self.sl.search(1))
        self.assertFalse(self.sl.search(5))
        self.assertFalse(self.sl.search(100))

    def test_delete_existing(self):
        for val in [3, 7, 11, 20]:
            self.sl.insert(val)
        self.assertTrue(self.sl.delete(7))
        self.assertFalse(self.sl.search(7))
        self.assertEqual(self.sl.display(), [3, 11, 20])

    def test_delete_non_existing(self):
        self.sl.insert(5)
        self.assertFalse(self.sl.delete(10))
        self.assertEqual(self.sl.display(), [5])

    def test_delete_from_empty(self):
        self.assertFalse(self.sl.delete(1))

    def test_delete_all_elements(self):
        for val in [1, 2, 3]:
            self.sl.insert(val)
        self.assertTrue(self.sl.delete(1))
        self.assertTrue(self.sl.delete(2))
        self.assertTrue(self.sl.delete(3))
        self.assertEqual(self.sl.display(), [])

    def test_display_sorted(self):
        for val in [25, 3, 19, 6, 12, 9]:
            self.sl.insert(val)
        self.assertEqual(self.sl.display(), [3, 6, 9, 12, 19, 25])

    def test_large_dataset(self):
        values = list(range(1000, 0, -1))
        for val in values:
            self.sl.insert(val)
        self.assertEqual(self.sl.display(), list(range(1, 1001)))
        self.assertTrue(self.sl.search(500))
        self.assertTrue(self.sl.delete(500))
        self.assertFalse(self.sl.search(500))
        self.assertEqual(len(self.sl.display()), 999)

    def _levels(self):
        """The keys on each level, from level 0 up to the highest non-empty level."""
        rows = []
        for i in range(self.sl.max_level + 1):
            row, node = [], self.sl.header.forward[i]
            while node:
                row.append(node.key)
                node = node.forward[i]
            rows.append(row)
        return rows

    def _check_invariants(self):
        rows = self._levels()
        for i, row in enumerate(rows):
            self.assertEqual(row, sorted(set(row)))  # sorted, no duplicates
            if i > 0:
                self.assertTrue(set(row) <= set(rows[i - 1]))  # subset of the level below
        top = max((i for i, row in enumerate(rows) if row), default=0)
        self.assertEqual(self.sl.level, top)

    def test_structure_invariants_after_random_operations(self):
        import random
        rng = random.Random(1)
        model = set()
        for _ in range(3000):
            key = rng.randint(-50, 50)  # includes -1, the header placeholder key
            if rng.random() < 0.6:
                self.sl.insert(key)
                model.add(key)
            else:
                self.assertEqual(self.sl.delete(key), key in model)
                model.discard(key)
            self.assertEqual(self.sl.search(key), key in model)
        self._check_invariants()
        self.assertEqual(self.sl.display(), sorted(model))

    def test_level_shrinks_after_deleting_everything(self):
        for val in range(200):
            self.sl.insert(val)
        for val in range(200):
            self.sl.delete(val)
        self.assertEqual(self.sl.level, 0)
        self.assertEqual(self.sl.display(), [])

    def test_negative_keys(self):
        for val in (-5, -1, 0, -3):
            self.sl.insert(val)
        self.assertEqual(self.sl.display(), [-5, -3, -1, 0])
        self.assertTrue(self.sl.search(-1))
        self.assertTrue(self.sl.delete(-1))
        self.assertFalse(self.sl.search(-1))


if __name__ == "__main__":
    unittest.main()
