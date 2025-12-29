"""
Unit tests for Convex Hull algorithms.
"""

import unittest
from convex_hull import Point, graham_scan, jarvis_march


class TestConvexHull(unittest.TestCase):
    def test_graham_scan_simple(self):
        points = [
            Point(0, 0), Point(1, 1), Point(2, 0),
            Point(1, 0.5)
        ]
        hull = graham_scan(points)
        self.assertGreaterEqual(len(hull), 3)

    def test_jarvis_march_simple(self):
        points = [
            Point(0, 0), Point(1, 1), Point(2, 0),
            Point(1, 0.5)
        ]
        hull = jarvis_march(points)
        self.assertGreaterEqual(len(hull), 3)

    def test_graham_scan_square(self):
        points = [
            Point(0, 0), Point(1, 0), Point(1, 1),
            Point(0, 1), Point(0.5, 0.5)
        ]
        hull = graham_scan(points)
        self.assertEqual(len(hull), 4)

    def test_jarvis_march_square(self):
        points = [
            Point(0, 0), Point(1, 0), Point(1, 1),
            Point(0, 1), Point(0.5, 0.5)
        ]
        hull = jarvis_march(points)
        self.assertEqual(len(hull), 4)

    def test_less_than_three_points(self):
        points = [Point(0, 0), Point(1, 1)]
        hull = graham_scan(points)
        self.assertEqual(len(hull), 2)

        hull2 = jarvis_march(points)
        self.assertEqual(len(hull2), 2)


if __name__ == "__main__":
    unittest.main()
