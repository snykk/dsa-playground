"""
Unit tests for Rotating Calipers.
"""

import math
import random
import unittest
from typing import List
from rotating_calipers import (
    Point, rotating_calipers_diameter,
    rotating_calipers_width, rotating_calipers_perimeter,
    rotating_calipers_area
)


def simple_hull_square() -> List[Point]:
    """Create a simple square hull for testing."""
    return [Point(0, 0), Point(4, 0), Point(4, 3), Point(0, 3)]


def cross(o, a, b):
    return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])


def monotone_chain(pts):
    """Strict counterclockwise hull of integer points (reference, exact)."""
    pts = sorted(set(pts))
    if len(pts) < 3:
        return pts
    lower, upper = [], []
    for p in pts:
        while len(lower) > 1 and cross(lower[-2], lower[-1], p) <= 0:
            lower.pop()
        lower.append(p)
    for p in reversed(pts):
        while len(upper) > 1 and cross(upper[-2], upper[-1], p) <= 0:
            upper.pop()
        upper.append(p)
    return lower[:-1] + upper[:-1]


def brute_diameter(pts):
    return math.sqrt(max((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 for a in pts for b in pts))


def brute_width(h):
    """Min over edges of the largest vertex distance to the edge line (strict polygon)."""
    if len(h) < 3:
        return 0.0
    best = float('inf')
    for i in range(len(h)):
        a, b = h[i], h[(i + 1) % len(h)]
        length = math.hypot(b[0] - a[0], b[1] - a[1])
        best = min(best, max(abs(cross(a, b, p)) for p in h) / length)
    return best


def to_points(tuples):
    return [Point(x, y) for x, y in tuples]


class TestRotatingCalipers(unittest.TestCase):
    def test_diameter(self):
        hull = simple_hull_square()
        diameter, _, _ = rotating_calipers_diameter(hull)
        self.assertAlmostEqual(diameter, 5.0, places=9)  # Diagonal of rectangle

    def test_width(self):
        hull = simple_hull_square()
        width = rotating_calipers_width(hull)
        self.assertAlmostEqual(width, 3.0, places=9)  # The shorter side

    def test_perimeter(self):
        hull = simple_hull_square()
        perimeter = rotating_calipers_perimeter(hull)
        self.assertAlmostEqual(perimeter, 14.0, places=9)  # 4+3+4+3

    def test_area(self):
        hull = simple_hull_square()
        area = rotating_calipers_area(hull)
        self.assertAlmostEqual(area, 12.0, places=9)  # 4*3

    def test_diameter_fan_hull_is_not_a_local_maximum(self):
        # A vertex-to-vertex hill climb stops at 104.96 (pair 0-1); the true diameter is 104.98
        hull = [Point(0, 0), Point(104.8, 5.8), Point(103.3, 18.1), Point(102.9, 20.8),
                Point(89.7, 52.4), Point(88.8, 52.0)]
        diameter, p1, p2 = rotating_calipers_diameter(hull)
        self.assertAlmostEqual(diameter, 104.98118879113534, places=9)
        self.assertEqual((p1.x, p1.y, p2.x, p2.y).count(0), 2)  # the pair involves the origin

    def test_width_with_collinear_or_repeated_vertices(self):
        collinear = [Point(0, 0), Point(2, 0), Point(4, 0), Point(4, 3), Point(0, 3)]
        self.assertAlmostEqual(rotating_calipers_width(collinear), 3.0, places=9)
        repeated = [Point(0, 0), Point(4, 0), Point(4, 0), Point(4, 3), Point(0, 3)]
        self.assertAlmostEqual(rotating_calipers_width(repeated), 3.0, places=9)
        self.assertAlmostEqual(rotating_calipers_diameter(collinear)[0], 5.0, places=9)

    def test_degenerate_inputs(self):
        same = [Point(1, 1)] * 3
        self.assertEqual(rotating_calipers_width(same), 0.0)
        self.assertEqual(rotating_calipers_diameter(same)[0], 0.0)
        self.assertEqual(rotating_calipers_diameter([])[0], 0.0)
        segment = [Point(0, 0), Point(1, 1), Point(3, 3)]
        self.assertEqual(rotating_calipers_width(segment), 0.0)
        self.assertAlmostEqual(rotating_calipers_diameter(segment)[0], 3 * math.sqrt(2), places=9)

    def test_triangle(self):
        hull = [Point(0, 0), Point(4, 0), Point(0, 3)]
        self.assertAlmostEqual(rotating_calipers_width(hull), 2.4, places=9)  # altitude on the hypotenuse
        self.assertAlmostEqual(rotating_calipers_diameter(hull)[0], 5.0, places=9)

    def test_clockwise_and_counterclockwise_agree(self):
        hull = [Point(0, 0), Point(4, 0), Point(5, 2), Point(2, 5), Point(-1, 3)]
        d1 = rotating_calipers_diameter(hull)[0]
        d2 = rotating_calipers_diameter(hull[::-1])[0]
        self.assertAlmostEqual(d1, d2, places=9)
        self.assertAlmostEqual(rotating_calipers_width(hull), rotating_calipers_width(hull[::-1]), places=9)

    def test_random_polygons_match_brute_force(self):
        rng = random.Random(7)
        for _ in range(500):
            span = rng.choice([2, 3, 5, 10, 100])
            raw = [(rng.randint(-span, span), rng.randint(-span, span)) for _ in range(rng.randint(1, 14))]
            hull = monotone_chain(raw)
            if rng.random() < 0.5:
                hull = hull[::-1]
            noisy = []
            for i, p in enumerate(hull):
                noisy.append(p)
                q = hull[(i + 1) % len(hull)]
                if len(hull) >= 3 and (p[0] + q[0]) % 2 == 0 and (p[1] + q[1]) % 2 == 0 and rng.random() < 0.3:
                    noisy.append(((p[0] + q[0]) // 2, (p[1] + q[1]) // 2))  # a vertex on an edge
                if rng.random() < 0.2:
                    noisy.append(p)  # a repeated vertex
            diameter, a, b = rotating_calipers_diameter(to_points(noisy))
            self.assertAlmostEqual(diameter, brute_diameter(raw), places=9, msg=str(raw))
            self.assertAlmostEqual(math.hypot(a.x - b.x, a.y - b.y), diameter, places=9)
            self.assertAlmostEqual(rotating_calipers_width(to_points(noisy)), brute_width(monotone_chain(raw)),
                                   places=9, msg=str(raw))


if __name__ == "__main__":
    unittest.main()
