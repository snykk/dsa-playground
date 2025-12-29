"""
Unit tests for Line Intersection.
"""

import unittest
from line_intersection import Point, Line, line_intersection, segment_intersection, segments_intersect, point_on_segment


class TestLineIntersection(unittest.TestCase):
    def test_line_intersection(self):
        l1 = Line(Point(0, 0), Point(4, 4))
        l2 = Line(Point(0, 4), Point(4, 0))
        intersection = line_intersection(l1, l2)
        self.assertIsNotNone(intersection)
        self.assertAlmostEqual(intersection.x, 2.0, places=5)
        self.assertAlmostEqual(intersection.y, 2.0, places=5)

    def test_parallel_lines(self):
        l1 = Line(Point(0, 0), Point(1, 1))
        l2 = Line(Point(0, 1), Point(1, 2))
        intersection = line_intersection(l1, l2)
        self.assertIsNone(intersection)

    def test_segment_intersection(self):
        seg1 = Line(Point(0, 0), Point(4, 4))
        seg2 = Line(Point(0, 4), Point(4, 0))
        intersection = segment_intersection(seg1, seg2)
        self.assertIsNotNone(intersection)
        self.assertAlmostEqual(intersection.x, 2.0, places=5)
        self.assertAlmostEqual(intersection.y, 2.0, places=5)

    def test_segments_no_intersection(self):
        seg1 = Line(Point(0, 0), Point(1, 1))
        seg2 = Line(Point(2, 2), Point(3, 3))
        intersection = segment_intersection(seg1, seg2)
        self.assertIsNone(intersection)

    def test_segments_intersect(self):
        seg1 = Line(Point(0, 0), Point(4, 4))
        seg2 = Line(Point(0, 4), Point(4, 0))
        self.assertTrue(segments_intersect(seg1, seg2))

    def test_point_on_segment(self):
        line = Line(Point(0, 0), Point(4, 4))
        p = Point(2, 2)
        self.assertTrue(point_on_segment(p, line))

    def test_point_not_on_segment(self):
        line = Line(Point(0, 0), Point(4, 4))
        p = Point(5, 5)
        self.assertFalse(point_on_segment(p, line))


if __name__ == "__main__":
    unittest.main()
