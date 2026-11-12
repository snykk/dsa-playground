"""
Unit tests for Point, Line, and Circle operations.
"""

import math
import unittest
from point_line_circle import (Point, Line, Circle, cross_product, dot_product, orientation,
                               angle_between_points, point_in_triangle)


class TestPoint(unittest.TestCase):
    def test_point_creation(self):
        p = Point(1, 2)
        self.assertEqual(p.x, 1)
        self.assertEqual(p.y, 2)

    def test_point_distance(self):
        p1 = Point(0, 0)
        p2 = Point(3, 4)
        self.assertAlmostEqual(p1.distance_to(p2), 5.0, places=5)

    def test_point_distance_squared(self):
        p1 = Point(0, 0)
        p2 = Point(3, 4)
        self.assertAlmostEqual(p1.distance_squared(p2), 25.0, places=5)

    def test_point_equality(self):
        p1 = Point(1.0, 2.0)
        p2 = Point(1.0, 2.0)
        self.assertEqual(p1, p2)


class TestLine(unittest.TestCase):
    def test_line_length(self):
        line = Line(Point(0, 0), Point(3, 4))
        self.assertAlmostEqual(line.length(), 5.0, places=5)

    def test_line_slope(self):
        line = Line(Point(0, 0), Point(2, 4))
        self.assertAlmostEqual(line.slope(), 2.0, places=5)

    def test_vertical_line(self):
        line = Line(Point(0, 0), Point(0, 5))
        self.assertTrue(line.is_vertical())
        self.assertEqual(line.slope(), float('inf'))

    def test_horizontal_line(self):
        line = Line(Point(0, 0), Point(5, 0))
        self.assertTrue(line.is_horizontal())


class TestCircle(unittest.TestCase):
    def test_circle_area(self):
        circle = Circle(Point(0, 0), 5.0)
        self.assertAlmostEqual(circle.area(), math.pi * 25, places=5)

    def test_circle_circumference(self):
        circle = Circle(Point(0, 0), 5.0)
        self.assertAlmostEqual(circle.circumference(), 2 * math.pi * 5, places=5)

    def test_point_inside_circle(self):
        circle = Circle(Point(0, 0), 5.0)
        self.assertTrue(circle.contains_point(Point(3, 4)))
        self.assertTrue(circle.contains_point(Point(0, 0)))

    def test_point_outside_circle(self):
        circle = Circle(Point(0, 0), 5.0)
        self.assertFalse(circle.contains_point(Point(10, 10)))

    def test_point_on_circle(self):
        circle = Circle(Point(0, 0), 5.0)
        self.assertTrue(circle.point_on_circle(Point(5, 0)))
        self.assertTrue(circle.point_on_circle(Point(0, 5)))


class TestGeometricFunctions(unittest.TestCase):
    def test_cross_product(self):
        o = Point(0, 0)
        a = Point(1, 0)
        b = Point(0, 1)
        self.assertAlmostEqual(cross_product(o, a, b), 1.0, places=5)

    def test_orientation_counterclockwise(self):
        # (0,0) -> (4,4) -> (1,2): r is above the line, a left turn
        self.assertEqual(orientation(Point(0, 0), Point(4, 4), Point(1, 2)), 2)

    def test_orientation_clockwise(self):
        # (0,0) -> (4,4) -> (2,1): r is below the line, a right turn
        self.assertEqual(orientation(Point(0, 0), Point(4, 4), Point(2, 1)), 1)

    def test_orientation_collinear(self):
        p = Point(0, 0)
        q = Point(1, 1)
        r = Point(2, 2)
        self.assertEqual(orientation(p, q, r), 0)

    def test_point_in_triangle(self):
        a = Point(0, 0)
        b = Point(4, 0)
        c = Point(2, 4)
        p = Point(2, 1)
        self.assertTrue(point_in_triangle(p, a, b, c))

    def test_point_outside_triangle(self):
        a = Point(0, 0)
        b = Point(4, 0)
        c = Point(2, 4)
        p = Point(10, 10)
        self.assertFalse(point_in_triangle(p, a, b, c))

    def test_orientation_does_not_depend_on_scale(self):
        for scale in (1e-10, 1e-5, 1.0, 1e5):
            p, q = Point(0, 0), Point(4 * scale, 4 * scale)
            self.assertEqual(orientation(p, q, Point(1 * scale, 2 * scale)), 2)
            self.assertEqual(orientation(p, q, Point(2 * scale, 1 * scale)), 1)
            self.assertEqual(orientation(p, q, Point(2 * scale, 2 * scale)), 0)

    def test_dot_product(self):
        self.assertEqual(dot_product(Point(0, 0), Point(3, 4), Point(2, 1)), 10)
        self.assertEqual(dot_product(Point(1, 1), Point(2, 1), Point(1, 2)), 0)

    def test_angle_between_points(self):
        o = Point(0, 0)
        self.assertAlmostEqual(angle_between_points(o, Point(1, 0), Point(0, 1)), math.pi / 2, places=12)
        self.assertAlmostEqual(angle_between_points(o, Point(1, 0), Point(1, 1)), math.pi / 4, places=12)
        self.assertAlmostEqual(angle_between_points(o, Point(1, 0), Point(-1, 0)), math.pi, places=12)
        self.assertEqual(angle_between_points(o, Point(1, 0), Point(2, 0)), 0.0)
        self.assertEqual(angle_between_points(o, o, Point(1, 1)), 0.0)  # undefined, reported as 0

    def test_angle_is_accurate_for_tiny_angles_and_tiny_vectors(self):
        o = Point(0, 0)
        # acos of a clamped cosine returns 0.0 here
        self.assertAlmostEqual(angle_between_points(o, Point(1, 0), Point(1, 1e-8)), 1e-8, places=20)
        self.assertAlmostEqual(angle_between_points(o, Point(1e-10, 0), Point(0, 1e-10)), math.pi / 2, places=12)

    def test_point_in_triangle_boundary_and_orientation(self):
        a, b, c = Point(0, 0), Point(4, 0), Point(2, 4)
        self.assertTrue(point_in_triangle(Point(2, 0), a, b, c))  # on an edge
        self.assertTrue(point_in_triangle(a, a, b, c))  # a vertex
        self.assertTrue(point_in_triangle(Point(2, 1), a, c, b))  # clockwise triangle
        self.assertFalse(point_in_triangle(Point(2, -1), a, b, c))

    def test_point_in_degenerate_triangle_is_false(self):
        origin = Point(0, 0)
        self.assertFalse(point_in_triangle(Point(100, 100), origin, origin, origin))
        self.assertFalse(point_in_triangle(Point(10, 10), Point(0, 0), Point(1, 1), Point(2, 2)))
        self.assertFalse(point_in_triangle(Point(1, 1), Point(0, 0), Point(1, 1), Point(2, 2)))

    def test_circle_tests_do_not_depend_on_scale(self):
        small = Circle(Point(0, 0), 1e-5)
        self.assertFalse(small.contains_point(Point(3e-5, 0)))
        self.assertTrue(small.contains_point(Point(5e-6, 0)))
        self.assertFalse(small.point_on_circle(Point(5e-6, 0)))
        zero = Circle(Point(0, 0), 0)
        self.assertFalse(zero.point_on_circle(Point(3e-5, 0)))
        self.assertTrue(zero.point_on_circle(Point(0, 0)))
        self.assertTrue(Circle(Point(0, 0), 5).point_on_circle(Point(3, 4)))
        self.assertTrue(Circle(Point(0, 0), 5).contains_point(Point(3, 4)))

    def test_negative_radius_is_rejected(self):
        with self.assertRaises(ValueError):
            Circle(Point(0, 0), -5)

    def test_slope_and_direction_do_not_depend_on_scale(self):
        tiny = Line(Point(0, 0), Point(1e-10, 1e-10))
        self.assertAlmostEqual(tiny.slope(), 1.0, places=12)
        self.assertFalse(tiny.is_vertical())
        self.assertFalse(tiny.is_horizontal())

    def test_zero_length_line_has_no_direction(self):
        dot = Line(Point(1, 1), Point(1, 1))
        self.assertTrue(math.isnan(dot.slope()))
        self.assertFalse(dot.is_vertical())
        self.assertFalse(dot.is_horizontal())
        self.assertEqual(dot.length_squared(), 0)

    def test_line_length_squared(self):
        self.assertEqual(Line(Point(0, 0), Point(3, 4)).length_squared(), 25)

    def test_points_are_hashable_and_exactly_equal(self):
        self.assertEqual(len({Point(0, 0), Point(0, 0), Point(5e-10, 0)}), 2)
        self.assertNotEqual(Point(0, 0), Point(5e-10, 0))


if __name__ == "__main__":
    unittest.main()
