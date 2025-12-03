import unittest
from fenwick_tree import FenwickTree

class TestFenwickTree(unittest.TestCase):
    def setUp(self):
        self.arr = [1, 3, 5, 7, 9, 11]
        self.ft = FenwickTree(self.arr)

    def test_prefix_sum(self):
        self.assertEqual(self.ft.prefix_sum(0), 1)
        self.assertEqual(self.ft.prefix_sum(2), 9)  # 1 + 3 + 5
        self.assertEqual(self.ft.prefix_sum(5), 36)  # Sum of all

    def test_query(self):
        self.assertEqual(self.ft.query(0, 2), 9)  # 1 + 3 + 5
        self.assertEqual(self.ft.query(1, 3), 15)  # 3 + 5 + 7
        self.assertEqual(self.ft.query(0, 5), 36)  # Sum of all

    def test_update(self):
        # Update index 2 from 5 to 10 (add 5)
        self.ft.update(2, 5)
        self.assertEqual(self.ft.get(2), 10)
        self.assertEqual(self.ft.query(0, 2), 14)  # 1 + 3 + 10

    def test_single_element(self):
        ft = FenwickTree([5])
        self.assertEqual(ft.query(0, 0), 5)
        ft.update(0, 5)  # Add 5
        self.assertEqual(ft.query(0, 0), 10)

    def test_range_queries(self):
        # Test various ranges
        self.assertEqual(self.ft.query(0, 0), 1)
        self.assertEqual(self.ft.query(5, 5), 11)
        self.assertEqual(self.ft.query(2, 4), 21)  # 5 + 7 + 9

if __name__ == "__main__":
    unittest.main()

