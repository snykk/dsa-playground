"""
Test cases for Closest Pair of Points
"""

import unittest
from closest_pair import closest_pair, closest_pair_optimized, distance


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


if __name__ == '__main__':
    unittest.main()

