"""
Unit tests for Segment Tree with Lazy Propagation.
"""

import random
import unittest
from segment_tree_lazy import LazySegmentTree


class TestLazySegmentTree(unittest.TestCase):
    def setUp(self):
        self.arr = [1, 3, 5, 7, 9, 11]
        self.st = LazySegmentTree(self.arr)

    def test_build_and_query(self):
        """Test that tree is built correctly and queries return correct sums."""
        self.assertEqual(self.st.query(0, 5), 36)  # 1+3+5+7+9+11
        self.assertEqual(self.st.query(0, 2), 9)   # 1+3+5
        self.assertEqual(self.st.query(1, 3), 15)  # 3+5+7
        self.assertEqual(self.st.query(3, 5), 27)  # 7+9+11
        self.assertEqual(self.st.query(2, 4), 21)  # 5+7+9

    def test_single_element_query(self):
        """Test query on single element ranges."""
        self.assertEqual(self.st.query(0, 0), 1)
        self.assertEqual(self.st.query(2, 2), 5)
        self.assertEqual(self.st.query(5, 5), 11)

    def test_single_element_update(self):
        """Test updating a single element (range of size 1)."""
        self.st.update_range(2, 2, 5)  # arr[2] becomes 5+5=10
        self.assertEqual(self.st.query(2, 2), 10)
        self.assertEqual(self.st.query(0, 2), 14)  # 1+3+10
        self.assertEqual(self.st.query(0, 5), 41)  # 36+5

    def test_range_update_then_query(self):
        """Test range update followed by queries."""
        self.st.update_range(1, 4, 10)  # add 10 to indices 1..4
        # arr becomes [1, 13, 15, 17, 19, 11]
        self.assertEqual(self.st.query(0, 5), 76)  # 36 + 4*10
        self.assertEqual(self.st.query(1, 4), 64)  # 13+15+17+19
        self.assertEqual(self.st.query(0, 0), 1)   # unchanged
        self.assertEqual(self.st.query(5, 5), 11)  # unchanged

    def test_multiple_overlapping_updates(self):
        """Test multiple overlapping range updates."""
        self.st.update_range(0, 3, 2)   # add 2 to [0..3]
        self.st.update_range(2, 5, 3)   # add 3 to [2..5]
        # arr becomes [3, 5, 10, 12, 12, 14]
        self.assertEqual(self.st.query(0, 0), 3)   # 1+2
        self.assertEqual(self.st.query(1, 1), 5)   # 3+2
        self.assertEqual(self.st.query(2, 2), 10)  # 5+2+3
        self.assertEqual(self.st.query(3, 3), 12)  # 7+2+3
        self.assertEqual(self.st.query(4, 4), 12)  # 9+3
        self.assertEqual(self.st.query(5, 5), 14)  # 11+3
        self.assertEqual(self.st.query(0, 5), 56)  # 3+5+10+12+12+14

    def test_full_range_update(self):
        """Test updating the entire range."""
        self.st.update_range(0, 5, 1)
        self.assertEqual(self.st.query(0, 5), 42)  # 36 + 6*1

    def test_single_element_array(self):
        """Test with an array of one element."""
        st = LazySegmentTree([42])
        self.assertEqual(st.query(0, 0), 42)
        st.update_range(0, 0, 8)
        self.assertEqual(st.query(0, 0), 50)

    def test_negative_values(self):
        """Test with negative update values."""
        self.st.update_range(0, 5, -1)
        # arr becomes [0, 2, 4, 6, 8, 10]
        self.assertEqual(self.st.query(0, 5), 30)  # 36 - 6

    def test_large_updates(self):
        """Test with large update values."""
        self.st.update_range(0, 5, 1000000)
        self.assertEqual(self.st.query(0, 5), 36 + 6 * 1000000)

    def test_sequential_updates_and_queries(self):
        """Test alternating updates and queries."""
        self.assertEqual(self.st.query(0, 2), 9)
        self.st.update_range(0, 2, 5)
        self.assertEqual(self.st.query(0, 2), 24)  # 9 + 3*5
        self.st.update_range(1, 3, 3)
        # After first update: arr=[6,8,10,7,9,11]
        # After second update: arr=[6,11,13,10,9,11]
        self.assertEqual(self.st.query(1, 3), 34)  # 11+13+10
        self.assertEqual(self.st.query(0, 5), 60)  # 6+11+13+10+9+11

    def test_random_against_brute_force(self):
        rng = random.Random(5)
        for n in range(1, 41):
            ref = [rng.randint(-50, 50) for _ in range(n)]
            st = LazySegmentTree(ref)
            for _ in range(60):
                l = rng.randrange(n)
                r = rng.randrange(l, n)
                if rng.random() < 0.5:
                    v = rng.randint(-20, 20)
                    for i in range(l, r + 1):
                        ref[i] += v
                    st.update_range(l, r, v)
                else:
                    self.assertEqual(st.query(l, r), sum(ref[l:r + 1]))

    def test_empty_array(self):
        st = LazySegmentTree([])
        self.assertEqual(st.query(0, 0), 0)
        st.update_range(0, 0, 5)
        self.assertEqual(st.query(0, 0), 0)

    def test_empty_array_any_range(self):
        # Regression: on an empty tree the root's segment [0, -1] counted as
        # fully covered by any range with left <= -1 <= right, so tree[1]
        # was read from an empty list (IndexError).
        st = LazySegmentTree([])
        for left, right in ((-1, 0), (-3, 5), (-1, -1), (2, 1)):
            st.update_range(left, right, 5)
            self.assertEqual(st.query(left, right), 0)


if __name__ == "__main__":
    unittest.main()
