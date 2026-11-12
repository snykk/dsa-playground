"""
Unit tests for Convex Hull algorithms.
"""

import random
import unittest
from convex_hull import Point, graham_scan, jarvis_march


def cross(o, a, b):
    return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])


def brute_force_hull(pts):
    """Set of strict hull vertices of integer points, by supporting lines: O(n^3)."""
    pts = sorted(set(pts))
    if len(pts) < 3:
        return set(pts)
    result = set()
    for a in pts:
        for b in pts:
            if a == b or any(cross(a, b, c) < 0 for c in pts):
                continue
            on_line = [c for c in pts if cross(a, b, c) == 0]
            on_line.sort()
            result.add(on_line[0])
            result.add(on_line[-1])
    return result


def is_ccw_strictly_convex(hull):
    n = len(hull)
    if n < 3:
        return True
    return all(cross(hull[i], hull[(i + 1) % n], hull[(i + 2) % n]) > 0 for i in range(n))


def as_tuples(hull):
    return [(p.x, p.y) for p in hull]


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

    def test_duplicates_and_few_points(self):
        for algo in (graham_scan, jarvis_march):
            self.assertEqual(as_tuples(algo([])), [])
            self.assertEqual(as_tuples(algo([Point(1, 1)])), [(1, 1)])
            self.assertEqual(as_tuples(algo([Point(1, 1), Point(1, 1)])), [(1, 1)])
            self.assertEqual(len(algo([Point(1, 1), Point(2, 2), Point(1, 1)])), 2)

    def test_input_list_is_not_returned_or_changed(self):
        points = [Point(2, 2), Point(0, 0)]
        for algo in (graham_scan, jarvis_march):
            hull = algo(points)
            self.assertIsNot(hull, points)
            self.assertEqual(as_tuples(points), [(2, 2), (0, 0)])
        points = [Point(0, 3), Point(2, 2), Point(1, 1), Point(3, 0), Point(0, 0), Point(3, 3)]
        before = as_tuples(points)
        graham_scan(points)
        jarvis_march(points)
        self.assertEqual(as_tuples(points), before)

    def test_all_collinear_returns_the_two_ends(self):
        points = [Point(i, 2 * i) for i in (3, 0, 1, 2, 5, 4)]
        for algo in (graham_scan, jarvis_march):
            self.assertEqual(set(as_tuples(algo(points))), {(0, 0), (5, 10)})

    def test_collinear_boundary_points_are_excluded(self):
        points = [Point(0, 0), Point(1, 0), Point(2, 0), Point(2, 1), Point(2, 2),
                  Point(1, 2), Point(0, 2), Point(0, 1), Point(1, 1)]
        for algo in (graham_scan, jarvis_march):
            self.assertEqual(set(as_tuples(algo(points))), {(0, 0), (2, 0), (2, 2), (0, 2)})

    def test_counterclockwise_and_start_point(self):
        points = [Point(0, 3), Point(2, 2), Point(1, 1), Point(2, 1), Point(3, 0), Point(0, 0), Point(3, 3)]
        self.assertEqual(as_tuples(graham_scan(points)), [(0, 0), (3, 0), (3, 3), (0, 3)])
        self.assertEqual(as_tuples(jarvis_march(points)), [(0, 0), (3, 0), (3, 3), (0, 3)])

    def test_jarvis_march_terminates_at_tiny_scale(self):
        points = [Point(0, 0), Point(1e-5, 0), Point(1e-5, 1e-5), Point(0, 1e-5)]
        self.assertEqual(len(jarvis_march(points)), 4)
        self.assertEqual(len(graham_scan(points)), 4)

    def test_graham_scan_nearly_collinear_wedge(self):
        points = [Point(0, 0), Point(0, 1000), Point(466.370713928512, 466.3706574269199),
                  Point(704.4545702063141, 704.4544815105265), Point(495.26698782658025, 495.2669272784684)]
        for algo in (graham_scan, jarvis_march):
            self.assertEqual(len(algo(points)), 3)

    def test_random_integer_points_match_brute_force(self):
        rng = random.Random(2024)
        for _ in range(400):
            span = rng.choice([1, 2, 3, 5, 10, 50])
            n = rng.randint(0, 25)
            raw = [(rng.randint(-span, span), rng.randint(-span, span)) for _ in range(n)]
            points = [Point(x, y) for x, y in raw]
            expected = brute_force_hull(raw)
            for algo in (graham_scan, jarvis_march):
                hull = as_tuples(algo(points))
                self.assertEqual(set(hull), expected, (algo.__name__, raw))
                self.assertEqual(len(hull), len(set(hull)))
                self.assertTrue(is_ccw_strictly_convex(hull), (algo.__name__, raw))


if __name__ == "__main__":
    unittest.main()
