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


if __name__ == "__main__":
    unittest.main()
