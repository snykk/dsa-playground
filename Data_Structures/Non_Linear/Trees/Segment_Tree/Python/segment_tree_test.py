import random
import unittest
from segment_tree import SegmentTree

class TestSegmentTree(unittest.TestCase):
    def setUp(self):
        self.arr = [1, 3, 5, 7, 9, 11]
        self.st = SegmentTree(self.arr)

    def test_query(self):
        self.assertEqual(self.st.query(0, 2), 9)  # 1 + 3 + 5
        self.assertEqual(self.st.query(1, 3), 15)  # 3 + 5 + 7
        self.assertEqual(self.st.query(0, 5), 36)  # Sum of all

    def test_update(self):
        self.st.update(2, 10)
        self.assertEqual(self.st.get(2), 10)
        self.assertEqual(self.st.query(0, 2), 14)  # 1 + 3 + 10

    def test_single_element(self):
        st = SegmentTree([5])
        self.assertEqual(st.query(0, 0), 5)
        st.update(0, 10)
        self.assertEqual(st.query(0, 0), 10)

    def test_range_queries(self):
        # Test various ranges
        self.assertEqual(self.st.query(0, 0), 1)
        self.assertEqual(self.st.query(5, 5), 11)
        self.assertEqual(self.st.query(2, 4), 21)  # 5 + 7 + 9

    def test_out_of_range_raises(self):
        # Regression: negative indices silently read internal nodes.
        with self.assertRaises(IndexError):
            self.st.get(-1)
        with self.assertRaises(IndexError):
            self.st.query(-1, 2)
        with self.assertRaises(IndexError):
            self.st.query(0, 6)
        with self.assertRaises(IndexError):
            self.st.query(3, 2)
        with self.assertRaises(IndexError):
            self.st.update(6, 1)
        with self.assertRaises(IndexError):
            SegmentTree([]).query(0, 0)

    def test_negative_values_and_non_power_of_two(self):
        st = SegmentTree([-4, 2, -7, 5, 1])
        self.assertEqual(st.query(0, 4), -3)
        self.assertEqual(st.query(2, 3), -2)
        st.update(2, 10)
        self.assertEqual(st.query(1, 3), 17)

    def test_random_against_brute_force(self):
        rng = random.Random(3)
        for n in range(1, 41):
            ref = [rng.randint(-50, 50) for _ in range(n)]
            st = SegmentTree(ref)
            for _ in range(60):
                if rng.random() < 0.4:
                    i, v = rng.randrange(n), rng.randint(-50, 50)
                    ref[i] = v
                    st.update(i, v)
                else:
                    l = rng.randrange(n)
                    r = rng.randrange(l, n)
                    self.assertEqual(st.query(l, r), sum(ref[l:r + 1]))


if __name__ == "__main__":
    unittest.main()

