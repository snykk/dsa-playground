import random
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

    def test_out_of_range_raises(self):
        # Regression: update(-1, x) used to loop forever.
        for bad in (-1, 6, 100):
            with self.assertRaises(IndexError):
                self.ft.update(bad, 5)
            with self.assertRaises(IndexError):
                self.ft.prefix_sum(bad)
            with self.assertRaises(IndexError):
                self.ft.get(bad)
        with self.assertRaises(IndexError):
            self.ft.query(3, 2)
        with self.assertRaises(IndexError):
            FenwickTree([]).prefix_sum(0)

    def test_negative_values(self):
        ft = FenwickTree([-5, 3, -2, 8])
        self.assertEqual(ft.query(0, 3), 4)
        ft.update(1, -10)
        self.assertEqual(ft.query(1, 2), -9)

    def test_random_against_brute_force(self):
        rng = random.Random(7)
        for n in range(1, 40):
            ref = [rng.randint(-50, 50) for _ in range(n)]
            ft = FenwickTree(ref)
            for _ in range(60):
                if rng.random() < 0.5:
                    i, d = rng.randrange(n), rng.randint(-20, 20)
                    ref[i] += d
                    ft.update(i, d)
                else:
                    l = rng.randrange(n)
                    r = rng.randrange(l, n)
                    self.assertEqual(ft.query(l, r), sum(ref[l:r + 1]))


if __name__ == "__main__":
    unittest.main()

