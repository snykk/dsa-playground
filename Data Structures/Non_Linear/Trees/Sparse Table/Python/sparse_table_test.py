import random
import unittest
from sparse_table import SparseTable

class TestSparseTable(unittest.TestCase):
    def setUp(self):
        self.arr = [1, 3, 5, 7, 9, 11, 2, 4, 6, 8]
        self.st_min = SparseTable(self.arr, 'min')
        self.st_max = SparseTable(self.arr, 'max')

    def test_min_query(self):
        self.assertEqual(self.st_min.query(0, 2), 1)  # min(1, 3, 5) = 1
        self.assertEqual(self.st_min.query(1, 3), 3)  # min(3, 5, 7) = 3
        self.assertEqual(self.st_min.query(0, 5), 1)  # min of first 6 elements
        self.assertEqual(self.st_min.query(6, 9), 2)  # min(2, 4, 6, 8) = 2

    def test_max_query(self):
        self.assertEqual(self.st_max.query(0, 2), 5)  # max(1, 3, 5) = 5
        self.assertEqual(self.st_max.query(1, 3), 7)  # max(3, 5, 7) = 7
        self.assertEqual(self.st_max.query(0, 5), 11)  # max of first 6 elements
        self.assertEqual(self.st_max.query(6, 9), 8)  # max(2, 4, 6, 8) = 8

    def test_single_element(self):
        st = SparseTable([5], 'min')
        self.assertEqual(st.query(0, 0), 5)
        
        st = SparseTable([5], 'max')
        self.assertEqual(st.query(0, 0), 5)

    def test_range_queries(self):
        # Test various ranges
        self.assertEqual(self.st_min.query(0, 0), 1)
        self.assertEqual(self.st_min.query(5, 5), 11)
        self.assertEqual(self.st_min.query(2, 4), 5)  # min(5, 7, 9) = 5
        
        self.assertEqual(self.st_max.query(0, 0), 1)
        self.assertEqual(self.st_max.query(5, 5), 11)
        self.assertEqual(self.st_max.query(2, 4), 9)  # max(5, 7, 9) = 9

    def test_full_range(self):
        self.assertEqual(self.st_min.query(0, 9), 1)  # min of all
        self.assertEqual(self.st_max.query(0, 9), 11)  # max of all

    def test_get(self):
        self.assertEqual(self.st_min.get(0), 1)
        self.assertEqual(self.st_min.get(5), 11)
        self.assertEqual(self.st_max.get(0), 1)

    def test_empty_input(self):
        # Regression: math.log2(0) raised "math domain error" on construction.
        for kind in ('min', 'max'):
            st = SparseTable([], kind)
            with self.assertRaises(IndexError):
                st.query(0, 0)
            with self.assertRaises(IndexError):
                st.get(0)

    def test_invalid_query_type_raises(self):
        # Regression: any type other than 'min' silently meant max.
        with self.assertRaises(ValueError):
            SparseTable([5, 1, 9], 'sum')

    def test_out_of_range_raises(self):
        with self.assertRaises(IndexError):
            self.st_min.query(-1, 3)
        with self.assertRaises(IndexError):
            self.st_min.query(0, 10)

    def test_swapped_bounds_are_reordered(self):
        self.assertEqual(self.st_min.query(5, 2), self.st_min.query(2, 5))

    def test_does_not_alias_input(self):
        arr = [4, 2, 7]
        st = SparseTable(arr, 'min')
        arr[1] = 100
        self.assertEqual(st.query(0, 2), 2)

    def test_random_against_brute_force(self):
        rng = random.Random(11)
        for n in range(1, 70):
            arr = [rng.randint(-100, 100) for _ in range(n)]
            for kind, fn in (('min', min), ('max', max)):
                st = SparseTable(arr, kind)
                for l in range(n):
                    for r in range(l, n):
                        self.assertEqual(st.query(l, r), fn(arr[l:r + 1]))


if __name__ == "__main__":
    unittest.main()

