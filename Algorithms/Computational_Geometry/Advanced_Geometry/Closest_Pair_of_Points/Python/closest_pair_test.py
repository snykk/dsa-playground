"""
Test cases for Closest Pair of Points
"""

import math
import random
import unittest
import closest_pair as cp
from closest_pair import closest_pair, closest_pair_optimized, distance


def brute_distance(points):
    return min(distance(points[i], points[j]) for i in range(len(points)) for j in range(i + 1, len(points)))


class TestClosestPair(unittest.TestCase):
    
    def test_two_points(self):
        """Test with exactly 2 points"""
        points = [(0, 0), (1, 1)]
        dist, p1, p2 = closest_pair(points)
        expected_dist = distance((0, 0), (1, 1))
        self.assertAlmostEqual(dist, expected_dist, places=5)
    
    def test_three_points(self):
        """Test with 3 points"""
        points = [(0, 0), (1, 1), (2, 2)]
        dist, p1, p2 = closest_pair(points)
        # Closest should be (0,0) and (1,1) or (1,1) and (2,2)
        self.assertAlmostEqual(dist, distance((0, 0), (1, 1)), places=5)
    
    def test_square(self):
        """Test with points forming a square"""
        points = [(0, 0), (1, 0), (0, 1), (1, 1)]
        dist, p1, p2 = closest_pair(points)
        # Closest pairs have distance 1
        self.assertAlmostEqual(dist, 1.0, places=5)
    
    def test_horizontal_line(self):
        """Test with points on horizontal line"""
        points = [(0, 0), (1, 0), (2, 0), (3, 0)]
        dist, p1, p2 = closest_pair(points)
        self.assertAlmostEqual(dist, 1.0, places=5)
    
    def test_vertical_line(self):
        """Test with points on vertical line"""
        points = [(0, 0), (0, 1), (0, 2), (0, 3)]
        dist, p1, p2 = closest_pair(points)
        self.assertAlmostEqual(dist, 1.0, places=5)
    
    def test_closest_across_divide(self):
        """Test case where closest pair spans the dividing line"""
        points = [(0, 0), (5, 0), (2.5, 1), (2.5, -1)]
        dist, p1, p2 = closest_pair(points)
        # Closest should be (2.5, 1) and (2.5, -1) with distance 2
        self.assertAlmostEqual(dist, 2.0, places=5)
    
    def test_large_set(self):
        """Test with larger set of points"""
        points = [(i, i) for i in range(10)]
        dist, p1, p2 = closest_pair(points)
        # Consecutive points have distance sqrt(2)
        expected = distance((0, 0), (1, 1))
        self.assertAlmostEqual(dist, expected, places=5)
    
    def test_optimized_version(self):
        """Test optimized version"""
        points = [(0, 0), (1, 1), (2, 2), (3, 3)]
        dist, p1, p2 = closest_pair_optimized(points)
        expected = distance((0, 0), (1, 1))
        self.assertAlmostEqual(dist, expected, places=5)
    
    def test_single_closest_pair(self):
        """Test with one clearly closest pair"""
        points = [(0, 0), (100, 100), (0.1, 0.1), (50, 50)]
        dist, p1, p2 = closest_pair(points)
        # Closest should be (0,0) and (0.1, 0.1)
        expected = distance((0, 0), (0.1, 0.1))
        self.assertAlmostEqual(dist, expected, places=5)

    def test_duplicate_points_give_distance_zero(self):
        for solve in (closest_pair, closest_pair_optimized):
            dist, p1, p2 = solve([(5, 5), (1, 1), (9, 2), (5, 5), (7, 7)])
            self.assertEqual(dist, 0)
            self.assertEqual(p1, p2)
            dist, _, _ = solve([(3, 3)] * 6)
            self.assertEqual(dist, 0)

    def test_negative_coordinates_and_shared_x(self):
        points = [(-3, -4), (-3, 10), (-3, 4), (-3, 5), (2, -9), (-7, 0)]
        for solve in (closest_pair, closest_pair_optimized):
            dist, p1, p2 = solve(points)
            self.assertAlmostEqual(dist, 1.0, places=9)
            self.assertAlmostEqual(distance(p1, p2), dist, places=9)

    def test_too_few_points(self):
        with self.assertRaises(ValueError):
            closest_pair([(1, 1)])
        with self.assertRaises(ValueError):
            closest_pair_optimized([])

    def test_y_list_always_matches_the_x_half(self):
        # With repeated x values, splitting by x <= mid_x put points on the dividing line
        # on the wrong side, so len(points_y) differed from len(points_x) in the recursion.
        calls = []
        original = cp.closest_pair_recursive

        def recording(points_x, points_y):
            calls.append((len(points_x), len(points_y), sorted(map(tuple, points_x)), sorted(map(tuple, points_y))))
            return original(points_x, points_y)

        points = [(0, y) for y in range(8)] + [(1, y) for y in range(4)] + [(0, 3), (0, 3)]
        cp.closest_pair_recursive = recording
        try:
            closest_pair(points)
        finally:
            cp.closest_pair_recursive = original
        self.assertGreater(len(calls), 1)
        for nx, ny, xs, ys in calls:
            self.assertEqual(nx, ny)
            self.assertEqual(xs, ys)

    def test_random_points_match_brute_force(self):
        rng = random.Random(42)
        for _ in range(1500):
            span = rng.choice([1, 2, 3, 5, 10, 100])
            n = rng.randint(2, 40)
            points = [(rng.randint(-span, span), rng.randint(-span, span)) for _ in range(n)]
            expected = brute_distance(points)
            for solve in (closest_pair, closest_pair_optimized):
                dist, p1, p2 = solve(points)
                self.assertAlmostEqual(dist, expected, places=12, msg=str(points))
                self.assertAlmostEqual(distance(p1, p2), dist, places=12)
                self.assertIn(p1, points)
                self.assertIn(p2, points)

    def test_random_float_points_match_brute_force(self):
        rng = random.Random(8)
        for _ in range(300):
            points = [(rng.uniform(-50, 50), rng.uniform(-50, 50)) for _ in range(rng.randint(2, 60))]
            expected = brute_distance(points)
            for solve in (closest_pair, closest_pair_optimized):
                self.assertTrue(math.isclose(solve(points)[0], expected, rel_tol=1e-12))


if __name__ == '__main__':
    unittest.main()

