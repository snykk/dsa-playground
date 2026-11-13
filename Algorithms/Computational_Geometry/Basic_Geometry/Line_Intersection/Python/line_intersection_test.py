"""
Unit tests for Line Intersection.
"""

import math
import random
import unittest
from line_intersection import Point, Line, line_intersection, segment_intersection, segments_intersect, point_on_segment


def seg(x1, y1, x2, y2):
    return Line(Point(x1, y1), Point(x2, y2))


def ref_intersect(a, b, c, d):
    """Independent integer reference: parametric solution, or endpoint-on-segment when parallel."""
    r = (b[0] - a[0], b[1] - a[1])
    s = (d[0] - c[0], d[1] - c[1])
    rxs = r[0] * s[1] - r[1] * s[0]
    if rxs != 0:
        qp = (c[0] - a[0], c[1] - a[1])
        t = qp[0] * s[1] - qp[1] * s[0]
        u = qp[0] * r[1] - qp[1] * r[0]
        if rxs < 0:
            rxs, t, u = -rxs, -t, -u
        return 0 <= t <= rxs and 0 <= u <= rxs

    def on(p, e, f):
        if e == f:
            return p == e
        cr = (f[0] - e[0]) * (p[1] - e[1]) - (f[1] - e[1]) * (p[0] - e[0])
        dot = (p[0] - e[0]) * (f[0] - e[0]) + (p[1] - e[1]) * (f[1] - e[1])
        return cr == 0 and 0 <= dot <= (f[0] - e[0]) ** 2 + (f[1] - e[1]) ** 2

    return on(a, c, d) or on(b, c, d) or on(c, a, b) or on(d, a, b)


def distance_to_segment(p, a, b):
    dx, dy = b[0] - a[0], b[1] - a[1]
    length2 = dx * dx + dy * dy
    t = 0.0 if length2 == 0 else max(0.0, min(1.0, ((p.x - a[0]) * dx + (p.y - a[1]) * dy) / length2))
    return math.hypot(p.x - (a[0] + t * dx), p.y - (a[1] + t * dy))


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

    def test_collinear_overlapping_segments_intersect(self):
        a, b = seg(0, 0, 2, 0), seg(1, 0, 3, 0)
        self.assertTrue(segments_intersect(a, b))
        self.assertTrue(segments_intersect(b, a))
        self.assertEqual((segment_intersection(a, b).x, segment_intersection(a, b).y), (1, 0))
        vertical = segment_intersection(seg(0, 0, 0, 2), seg(0, 3, 0, 1))
        self.assertEqual((vertical.x, vertical.y), (0, 1))

    def test_collinear_segments_touching_at_an_endpoint(self):
        a, b = seg(0, 0, 1, 0), seg(1, 0, 2, 0)
        self.assertTrue(segments_intersect(a, b))
        p = segment_intersection(a, b)
        self.assertEqual((p.x, p.y), (1, 0))

    def test_collinear_disjoint_and_parallel_segments(self):
        self.assertFalse(segments_intersect(seg(0, 0, 1, 0), seg(2, 0, 3, 0)))
        self.assertFalse(segments_intersect(seg(0, 0, 2, 0), seg(0, 1, 2, 1)))
        self.assertIsNone(segment_intersection(seg(0, 0, 1, 0), seg(2, 0, 3, 0)))

    def test_zero_length_segments(self):
        self.assertTrue(segments_intersect(seg(0, 0, 2, 0), seg(1, 0, 1, 0)))
        self.assertFalse(segments_intersect(seg(0, 0, 2, 0), seg(1, 1, 1, 1)))
        self.assertTrue(segments_intersect(seg(1, 1, 1, 1), seg(1, 1, 1, 1)))
        p = segment_intersection(seg(0, 0, 2, 0), seg(1, 0, 1, 0))
        self.assertEqual((p.x, p.y), (1, 0))

    def test_t_junction_and_shared_endpoint(self):
        self.assertTrue(segments_intersect(seg(0, 0, 4, 0), seg(2, 0, 2, 3)))
        p = segment_intersection(seg(0, 0, 4, 0), seg(2, 0, 2, 3))
        self.assertEqual((p.x, p.y), (2, 0))
        # float endpoints shared: found whatever the order of the endpoints
        a, b = seg(0.6, 0.8, 1.0, 0.1), seg(0.2, 1.0, 1.0, 0.1)
        self.assertTrue(segments_intersect(a, b))
        self.assertTrue(segments_intersect(a, seg(1.0, 0.1, 0.2, 1.0)))
        p = segment_intersection(a, b)
        self.assertEqual((p.x, p.y), (1.0, 0.1))

    def test_tiny_scale(self):
        p = line_intersection(seg(0, 0, 1e-5, 1e-5), seg(0, 1e-5, 1e-5, 0))
        self.assertAlmostEqual(p.x, 5e-6, places=15)
        self.assertAlmostEqual(p.y, 5e-6, places=15)
        self.assertTrue(segments_intersect(seg(0, 0, 1e-5, 1e-5), seg(0, 1e-5, 1e-5, 0)))
        self.assertTrue(point_on_segment(Point(5e-6, 5e-6), seg(0, 0, 1e-5, 1e-5)))
        # the same geometry scaled by 1e5 gives the same answers
        self.assertFalse(point_on_segment(Point(1e-5, 0), seg(0, 0, 1e-5, 1e-5)))
        self.assertFalse(point_on_segment(Point(1, 0), seg(0, 0, 1, 1)))

    def test_coincident_and_degenerate_lines_have_no_single_point(self):
        self.assertIsNone(line_intersection(seg(0, 0, 1, 1), seg(2, 2, 3, 3)))
        self.assertIsNone(line_intersection(seg(0, 0, 0, 0), seg(0, 0, 1, 1)))

    def test_point_on_segment_endpoints_and_zero_length(self):
        line = seg(0, 0, 4, 4)
        self.assertTrue(point_on_segment(Point(0, 0), line))
        self.assertTrue(point_on_segment(Point(4, 4), line))
        self.assertFalse(point_on_segment(Point(2, 3), line))
        self.assertTrue(point_on_segment(Point(1, 1), seg(1, 1, 1, 1)))
        self.assertFalse(point_on_segment(Point(1, 2), seg(1, 1, 1, 1)))

    def test_random_integer_segments_match_reference(self):
        rng = random.Random(3)
        for _ in range(4000):
            span = rng.choice([1, 2, 3, 5])
            pts = [(rng.randint(0, span), rng.randint(0, span)) for _ in range(4)]
            a, b, c, d = pts
            l1, l2 = seg(*a, *b), seg(*c, *d)
            expected = ref_intersect(a, b, c, d)
            self.assertEqual(segments_intersect(l1, l2), expected, pts)
            self.assertEqual(segments_intersect(l2, l1), expected, pts)
            p = segment_intersection(l1, l2)
            self.assertEqual(p is not None, expected, pts)
            if p is not None:
                self.assertLess(distance_to_segment(p, a, b), 1e-9, pts)
                self.assertLess(distance_to_segment(p, c, d), 1e-9, pts)


if __name__ == "__main__":
    unittest.main()
