"""Unit tests for Convex Hull Trick (MonotonicCHT, LiChaoTree)."""
import random
import unittest

from cht import LiChaoTree, MonotonicCHT


def brute_min(lines, x):
    return min(m * x + b for m, b in lines)


class TestMonotonicCHT(unittest.TestCase):
    def test_single_line(self):
        cht = MonotonicCHT()
        cht.add_line(2, 3)
        self.assertEqual(cht.query(0), 3)
        self.assertEqual(cht.query(5), 13)

    def test_two_parallel_lines_kept_lower(self):
        # Both m=2; lower b=1 wins always
        cht = MonotonicCHT()
        cht.add_line(2, 5)
        cht.add_line(2, 1)
        self.assertEqual(cht.query(10), 21)

    def test_classic_example(self):
        # Lines (slopes decreasing): y=2x+5, y=1x+3, y=-1x+7
        cht = MonotonicCHT()
        lines = [(2, 5), (1, 3), (-1, 7)]
        for m, b in lines:
            cht.add_line(m, b)
        for x in [0, 1, 2, 3, 5, 10]:
            self.assertEqual(cht.query(x), brute_min(lines, x),
                             msg=f"at x={x}")

    def test_random_monotonic(self):
        random.seed(7)
        # Generate lines with strictly decreasing slopes
        lines = []
        m = 100
        for _ in range(30):
            m -= random.randint(1, 5)
            b = random.randint(-100, 100)
            lines.append((m, b))
        cht = MonotonicCHT()
        for line in lines:
            cht.add_line(*line)
        for x in range(-20, 101):   # non-decreasing
            self.assertEqual(cht.query(x), brute_min(lines, x),
                             msg=f"at x={x}")


    def test_three_equal_slopes_keep_lowest_intercept(self):
        # Regression: the middle line (2, 1) used to be dropped
        cht = MonotonicCHT()
        for m, b in [(2, 5), (2, 1), (2, 3)]:
            cht.add_line(m, b)
        self.assertEqual(cht.query(0), 1)

    def test_equal_slopes_after_other_lines(self):
        lines = [(5, 0), (3, 4), (3, 2), (3, 9), (1, 10), (1, 6)]
        cht = MonotonicCHT()
        for m, b in lines:
            cht.add_line(m, b)
        for x in range(-5, 20):
            self.assertEqual(cht.query(x), brute_min(lines, x), msg=f"at x={x}")

    def test_random_with_equal_slopes(self):
        rng = random.Random(11)
        for _ in range(300):
            lines = []
            m = 20
            for _ in range(rng.randint(1, 12)):
                m -= rng.randint(0, 3)  # 0 allowed: equal slopes
                lines.append((m, rng.randint(-30, 30)))
            cht = MonotonicCHT()
            for line in lines:
                cht.add_line(*line)
            for x in range(-15, 16):
                self.assertEqual(cht.query(x), brute_min(lines, x), msg=f"{lines} at x={x}")

    def test_empty_query_raises(self):
        with self.assertRaises(ValueError):
            MonotonicCHT().query(0)


class TestLiChaoTree(unittest.TestCase):
    def test_single_line(self):
        lc = LiChaoTree(-10, 10)
        lc.add_line(2, 3)
        self.assertEqual(lc.query(0), 3)
        self.assertEqual(lc.query(5), 13)

    def test_classic_example(self):
        lc = LiChaoTree(-20, 20)
        lines = [(2, 5), (1, 3), (-1, 7), (3, -2), (0, 8)]
        for m, b in lines:
            lc.add_line(m, b)
        for x in [-10, -5, 0, 3, 10]:
            self.assertEqual(lc.query(x), brute_min(lines, x),
                             msg=f"at x={x}")

    def test_arbitrary_order(self):
        # Insert lines in random order
        random.seed(42)
        lines = [(random.randint(-10, 10), random.randint(-50, 50))
                 for _ in range(50)]
        lc = LiChaoTree(-100, 100)
        for m, b in lines:
            lc.add_line(m, b)
        for _ in range(20):
            x = random.randint(-100, 100)
            self.assertEqual(lc.query(x), brute_min(lines, x),
                             msg=f"at x={x}")

    def test_out_of_range(self):
        lc = LiChaoTree(0, 10)
        lc.add_line(1, 0)
        with self.assertRaises(ValueError):
            lc.query(100)


if __name__ == "__main__":
    unittest.main()
