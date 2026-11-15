"""Generate golden geometry fixtures from the repository's Python implementations.

The web visualizer re-implements the five topics of Algorithms/Computational_Geometry in
TypeScript: the point, line and circle toolkit (web/src/viz/algorithms/pointLineCircle.ts),
segment and line intersection (lineIntersection.ts), Graham's scan and Jarvis march
(convexHull.ts), rotating calipers (rotatingCalipers.ts) and the closest pair of points
(closestPair.ts). These fixtures pin each port to its Python reference:

- point, line and circle: the result of every function on fixed and random integer input,
  including the ValueError of a negative radius (angles are rounded to 12 decimals, because
  atan2 comes from the platform's libm and may differ in the last bit);
- intersection: the four orientations, segments_intersect, and the repr of what
  segment_intersection and line_intersection return (so an endpoint returned as ints and a
  computed point returned as floats stay distinguishable), plus point_on_segment;
- Graham's scan: the distinct points, the pivot, the angular order (from the module's own
  call to sorted), every turn test of the stack scan in order and the hull;
- Jarvis march: every cross product the gift wrapping computes, in order, and the hull;
- rotating calipers: the cleaned polygon, every cross product the diameter and the width
  loops compute after cleaning (so the far pointer's moves count), every distance the
  diameter measures, and the results;
- closest pair: every distance the recursion computes, in order, and the result.

Every coordinate is an integer, so the arithmetic is exact or correctly rounded (a product,
a square root, a quotient) and does not depend on the platform.

Run from anywhere:

    python3 web/scripts/gen_geometry_fixtures.py

then commit web/src/viz/algorithms/__fixtures__/geometry.json. CI regenerates the file and
fails if it changed, which means the two implementations drifted.
"""

import builtins
import json
import random
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
GEO = ROOT / "Algorithms" / "Computational_Geometry"
for folder in (
    "Basic_Geometry/Point_Line_Circle/Python",
    "Basic_Geometry/Line_Intersection/Python",
    "Advanced_Geometry/Convex_Hull/Python",
    "Advanced_Geometry/Rotating_Calipers/Python",
    "Advanced_Geometry/Closest_Pair_of_Points/Python",
):
    sys.path.insert(0, str(GEO / folder))

import closest_pair as cp  # noqa: E402
import convex_hull as ch  # noqa: E402
import line_intersection as li  # noqa: E402
import point_line_circle as plc  # noqa: E402
import rotating_calipers as rc  # noqa: E402

OUT = ROOT / "web" / "src" / "viz" / "algorithms" / "__fixtures__" / "geometry.json"
RNG = random.Random(20261115)


def xy(p):
    return [p.x, p.y]


def rand_point(lo, hi):
    return [RNG.randint(lo, hi), RNG.randint(lo, hi)]


def rand_points(count, lo, hi):
    return [rand_point(lo, hi) for _ in range(count)]


def number(v):
    """A float that may be inf or nan, as JSON can carry it."""
    if v != v:
        return "nan"
    if v in (float("inf"), float("-inf")):
        return "inf" if v > 0 else "-inf"
    return v


# ---------- point, line and circle ----------


def plc_case(op, args):
    P = [plc.Point(*a) for a in args if isinstance(a, list)]
    if op == "distance":
        result = {"distance_to": P[0].distance_to(P[1]), "distance_squared": P[0].distance_squared(P[1])}
    elif op == "line":
        line = plc.Line(P[0], P[1])
        result = {
            "length": line.length(),
            "length_squared": line.length_squared(),
            "slope": number(line.slope()),
            "vertical": line.is_vertical(),
            "horizontal": line.is_horizontal(),
        }
    elif op == "cross":
        result = plc.cross_product(*P)
    elif op == "orientation":
        result = plc.orientation(*P)
    elif op == "dot":
        result = plc.dot_product(*P)
    elif op == "angle":
        result = round(plc.angle_between_points(*P), 12)
    elif op == "triangle":
        result = plc.point_in_triangle(*P)
    else:  # circle: center, radius, point
        try:
            circle = plc.Circle(plc.Point(*args[0]), args[1])
        except ValueError as exc:
            return {"op": op, "args": args, "error": f"ValueError: {exc}"}
        q = plc.Point(*args[2])
        result = {
            "contains": circle.contains_point(q),
            "on": circle.point_on_circle(q),
            "area": circle.area(),
            "circumference": circle.circumference(),
        }
    return {"op": op, "args": args, "result": result}


PLC_FIXED = [
    ("distance", [[0, 0], [3, 4]]),
    ("distance", [[1, 1], [1, 1]]),
    ("distance", [[-2, 5], [4, -3]]),
    ("line", [[0, 0], [3, 4]]),
    ("line", [[2, 1], [2, 7]]),
    ("line", [[-1, 3], [5, 3]]),
    ("line", [[4, 4], [4, 4]]),
    ("line", [[0, 0], [3, -1]]),
    ("cross", [[0, 0], [4, 4], [1, 2]]),
    ("orientation", [[0, 0], [4, 4], [1, 2]]),
    ("orientation", [[0, 0], [4, 4], [2, 1]]),
    ("orientation", [[0, 0], [4, 4], [2, 2]]),
    ("orientation", [[0, 0], [4, 0], [4, 4]]),
    ("orientation", [[3, 3], [3, 3], [5, 1]]),
    ("dot", [[0, 0], [3, 4], [2, 1]]),
    ("dot", [[0, 0], [1, 0], [0, 5]]),
    ("angle", [[0, 0], [3, 4], [2, 1]]),
    ("angle", [[0, 0], [1, 0], [0, 1]]),
    ("angle", [[0, 0], [1, 0], [-1, 0]]),
    ("angle", [[0, 0], [5, 0], [2, 0]]),
    ("angle", [[1, 1], [1, 1], [4, 5]]),
    ("triangle", [[2, 1], [0, 0], [4, 0], [2, 4]]),
    ("triangle", [[10, 10], [0, 0], [4, 0], [2, 4]]),
    ("triangle", [[2, 0], [0, 0], [4, 0], [2, 4]]),
    ("triangle", [[2, 1], [0, 0], [2, 4], [4, 0]]),
    ("triangle", [[1, 1], [0, 0], [1, 1], [2, 2]]),
    ("triangle", [[100, 100], [0, 0], [0, 0], [0, 0]]),
    ("circle", [[0, 0], 5, [3, 4]]),
    ("circle", [[0, 0], 5, [5, 1]]),
    ("circle", [[0, 0], 5, [1, 2]]),
    ("circle", [[2, 3], 0, [2, 3]]),
    ("circle", [[0, 0], -5, [1, 1]]),
]

PLC_ARITY = {"distance": 2, "line": 2, "cross": 3, "orientation": 3, "dot": 3, "angle": 3, "triangle": 4}


def plc_cases(count):
    cases = [plc_case(op, args) for op, args in PLC_FIXED]
    ops = list(PLC_ARITY) + ["circle"]
    for _ in range(count):
        op = RNG.choice(ops)
        span = RNG.choice([3, 6, 20, 99])
        if op == "circle":
            args = [rand_point(-span, span), RNG.randint(-1, span), rand_point(-span, span)]
        else:
            args = rand_points(PLC_ARITY[op], -span, span)
            if RNG.random() < 0.25:
                # A repeated point or a collinear triple: the degenerate cases.
                args[-1] = list(args[0]) if RNG.random() < 0.5 else [2 * args[1][0] - args[0][0], 2 * args[1][1] - args[0][1]]
        cases.append(plc_case(op, args))
    return cases


# ---------- intersection ----------


def li_case(s1, s2, extra=None):
    L1 = li.Line(li.Point(*s1[0]), li.Point(*s1[1]))
    L2 = li.Line(li.Point(*s2[0]), li.Point(*s2[1]))
    p1, p2, p3, p4 = L1.p1, L1.p2, L2.p1, L2.p2
    seg = li.segment_intersection(L1, L2)
    line = li.line_intersection(L1, L2)
    case = {
        "s1": s1,
        "s2": s2,
        "o": [li.cross_product(p1, p2, p3), li.cross_product(p1, p2, p4), li.cross_product(p3, p4, p1), li.cross_product(p3, p4, p2)],
        "intersect": li.segments_intersect(L1, L2),
        "segment": repr(seg) if seg is not None else None,
        "line": repr(line) if line is not None else None,
    }
    if extra is not None:
        case["point"] = extra
        case["on"] = li.point_on_segment(li.Point(*extra), L1)
    return case


LI_FIXED = [
    ([[0, 0], [4, 4]], [[0, 4], [4, 0]]),
    ([[0, 0], [4, 0]], [[2, 0], [2, 3]]),
    ([[0, 0], [1, 0]], [[1, 0], [1, 1]]),
    ([[0, 0], [2, 0]], [[1, 0], [3, 0]]),
    ([[0, 0], [1, 0]], [[2, 0], [3, 0]]),
    ([[0, 0], [2, 0]], [[0, 1], [2, 1]]),
    ([[0, 0], [2, 0]], [[1, 0], [1, 0]]),
    ([[0, 0], [2, 0]], [[1, 1], [1, 3]]),
    ([[0, 0], [1, 1]], [[3, 0], [3, 5]]),
    ([[0, 0], [4, 0]], [[6, 0], [2, 0]]),
    ([[3, 3], [3, 3]], [[3, 3], [3, 3]]),
    ([[0, 0], [3, 1]], [[0, 2], [3, 0]]),
]


def li_cases(count):
    cases = [li_case(a, b, extra=RNG.choice([a[0], a[1], [1, 0], [2, 2]])) for a, b in LI_FIXED]
    for _ in range(count):
        span = RNG.choice([3, 4, 8, 30])
        s1 = rand_points(2, -span, span)
        s2 = rand_points(2, -span, span)
        r = RNG.random()
        if r < 0.15:
            s2[0] = list(s1[RNG.randint(0, 1)])  # a shared endpoint
        elif r < 0.3:
            # Collinear: both segments on the line through s1.
            d = [s1[1][0] - s1[0][0], s1[1][1] - s1[0][1]]
            s2 = [[s1[0][0] + k * d[0], s1[0][1] + k * d[1]] for k in (RNG.randint(-2, 2), RNG.randint(-2, 2))]
        elif r < 0.38:
            s2[1] = list(s2[0])  # a zero-length segment
        point = RNG.choice([s1[0], rand_point(-span, span), [(s1[0][0] + s1[1][0]) // 2, (s1[0][1] + s1[1][1]) // 2]])
        cases.append(li_case(s1, s2, extra=point))
    return cases


# ---------- convex hull ----------


class Recorder:
    """Patches the module-level names a hull function looks up, and records the calls."""

    def __init__(self, module):
        self.module = module
        self.cross_real = module.cross_product
        self.sorted_order = None
        self.tests = []
        self.logging = False

    def cross(self, o, a, b):
        value = self.cross_real(o, a, b)
        if self.logging:
            self.tests.append([xy(o), xy(a), xy(b), value])
        return value

    def sorted(self, items, key=None):
        out = builtins.sorted(items, key=key)
        self.sorted_order = [xy(p) for p in out]
        self.logging = True  # graham_scan: what follows the sort is the stack scan
        return out

    def __enter__(self):
        self.module.cross_product = self.cross
        self.module.sorted = self.sorted
        return self

    def __exit__(self, *exc):
        self.module.cross_product = self.cross_real
        del self.module.sorted


def hull_input(rng):
    kind = rng.random()
    n = rng.randint(0, 16)
    if kind < 0.35:
        return [[rng.randint(0, 5), rng.randint(0, 5)] for _ in range(n)]  # many collinear and repeated points
    if kind < 0.45:
        a, b = rng.randint(-3, 3), rng.randint(-3, 3)
        return [[a * t, b * t + rng.choice([0, 0, 1])] for t in (rng.randint(-4, 4) for _ in range(n))]
    if kind < 0.55:
        return [[x, 12 - abs(x)] for x in (rng.randint(-12, 12) for _ in range(n))]  # points on a wedge
    return [[rng.randint(-40, 40), rng.randint(-40, 40)] for _ in range(n)]


HULL_FIXED = [
    [[0, 3], [2, 2], [1, 1], [2, 1], [3, 0], [0, 0], [3, 3]],
    [[0, 0], [3, 0], [2, 1], [1, 1], [2, 2], [3, 3], [0, 3]],
    [[0, 0], [2, 0], [4, 0], [4, 2], [4, 4], [2, 2], [0, 4], [0, 2], [1, 1], [2, 0]],
    [[0, 0], [1, 1], [2, 2], [3, 3]],
    [[1, 1], [1, 1]],
    [[5, 5]],
    [],
    [[2, 0], [0, 0]],
    [[0, 0], [4, 0], [4, 4], [0, 4], [2, 2], [4, 0], [0, 0]],
]


def graham_case(points):
    pts = [ch.Point(*p) for p in points]
    with Recorder(ch) as rec:
        hull = ch.graham_scan(pts)
    unique = ch.unique_points(pts)
    case = {"points": points, "unique": [xy(p) for p in unique], "hull": [xy(p) for p in hull]}
    if len(unique) >= 3:
        case["bottom"] = xy(min(unique, key=lambda p: (p.y, p.x)))
        case["sorted"] = [case["bottom"]] + rec.sorted_order
        case["tests"] = rec.tests
    return case


def jarvis_case(points):
    pts = [ch.Point(*p) for p in points]
    with Recorder(ch) as rec:
        rec.logging = True
        hull = ch.jarvis_march(pts)
    return {"points": points, "hull": [xy(p) for p in hull], "tests": rec.tests}


def hull_cases(make, count):
    rng = random.Random(RNG.randint(0, 10**9))
    return [make(p) for p in HULL_FIXED] + [make(hull_input(rng)) for _ in range(count)]


# ---------- rotating calipers ----------


class CaliperRecorder:
    def __init__(self):
        self.cross_real = rc.cross_product
        self.dist_real = rc.distance_squared
        self.clean_real = rc.clean_polygon
        self.cross_calls = []
        self.dist_calls = []
        self.cleaning = False

    def cross(self, o, a, b):
        value = self.cross_real(o, a, b)
        if not self.cleaning:
            self.cross_calls.append([xy(o), xy(a), xy(b), value])
        return value

    def dist(self, a, b):
        value = self.dist_real(a, b)
        if not self.cleaning:
            self.dist_calls.append([xy(a), xy(b), value])
        return value

    def clean(self, hull):
        self.cleaning = True
        try:
            return self.clean_real(hull)
        finally:
            self.cleaning = False

    def __enter__(self):
        rc.cross_product, rc.distance_squared, rc.clean_polygon = self.cross, self.dist, self.clean
        return self

    def __exit__(self, *exc):
        rc.cross_product, rc.distance_squared, rc.clean_polygon = self.cross_real, self.dist_real, self.clean_real


def calipers_case(polygon):
    pts = [rc.Point(*p) for p in polygon]
    with CaliperRecorder() as rec:
        d, a, b = rc.rotating_calipers_diameter(pts)
        diameter_cross, diameter_dist = rec.cross_calls, rec.dist_calls
    with CaliperRecorder() as rec:
        w = rc.rotating_calipers_width(pts)
        width_cross, width_dist = rec.cross_calls, rec.dist_calls
    return {
        "polygon": polygon,
        "clean": [xy(p) for p in rc.clean_polygon(pts)],
        "diameter": [d, xy(a), xy(b)],
        "diameterCross": diameter_cross,
        "diameterDist": diameter_dist,
        "width": w,
        "widthCross": width_cross,
        "widthDist": width_dist,
    }


CALIPERS_FIXED = [
    [[0, 0], [4, 0], [4, 3], [0, 3]],
    [[0, 0], [4, 0], [5, 2], [2, 5], [-1, 3]],
    [[0, 0], [1048, 58], [1033, 181], [1029, 208], [897, 524], [888, 520]],
    [[0, 0], [2, 0], [4, 0], [4, 3], [0, 3]],
    [[0, 0], [4, 0], [4, 4], [4, 4], [0, 4], [0, 0]],
    [[0, 3], [4, 3], [4, 0], [0, 0]],
    [[0, 0], [6, 0], [3, 5]],
    [[0, 0], [2, 0], [4, 0]],
    [[3, 1], [3, 1], [3, 1]],
    [[1, 2]],
    [],
]


def random_polygon(rng):
    """A convex polygon in order: a hull, from any start, either way round, sometimes with
    a vertex repeated or a point added on an edge (both are legal input)."""
    for _ in range(100):
        pts = [ch.Point(rng.randint(-20, 20), rng.randint(-20, 20)) for _ in range(rng.randint(3, 12))]
        hull = ch.graham_scan(pts)
        if len(hull) >= 3:
            break
    poly = [[p.x, p.y] for p in hull]
    shift = rng.randrange(len(poly))
    poly = poly[shift:] + poly[:shift]
    if rng.random() < 0.5:
        poly.reverse()
    if rng.random() < 0.3:
        k = rng.randrange(len(poly))
        poly.insert(k, list(poly[k]))
    if rng.random() < 0.3:
        k = rng.randrange(len(poly))
        a, b = poly[k], poly[(k + 1) % len(poly)]
        if (a[0] + b[0]) % 2 == 0 and (a[1] + b[1]) % 2 == 0:
            poly.insert(k + 1, [(a[0] + b[0]) // 2, (a[1] + b[1]) // 2])
    return poly[:12]


def calipers_cases(count):
    rng = random.Random(RNG.randint(0, 10**9))
    return [calipers_case(p) for p in CALIPERS_FIXED] + [calipers_case(random_polygon(rng)) for _ in range(count)]


# ---------- closest pair ----------


def closest_case(points):
    tuples = [tuple(p) for p in points]
    measured = []
    real = cp.distance

    def logged(a, b):
        value = real(a, b)
        measured.append([list(a), list(b)])
        return value

    cp.distance = logged
    try:
        try:
            d, a, b = cp.closest_pair(tuples)
            case = {"points": points, "result": [d, list(a), list(b)], "measured": measured}
        except ValueError as exc:
            case = {"points": points, "error": f"ValueError: {exc}"}
    finally:
        cp.distance = real
    return case


CLOSEST_FIXED = [
    [[0, 0], [1, 6], [2, 2], [4, 5], [5, 6], [7, 1], [8, 8], [9, 3]],
    [[2, 3], [12, 30], [40, 50], [5, 1], [12, 10], [3, 4]],
    [[0, 0], [3, 4]],
    [[0, 0], [5, 0], [1, 1]],
    [[4, 0], [4, 3], [4, 7], [4, 8], [4, 12], [4, 20]],
    [[0, 5], [3, 5], [9, 5], [10, 5], [16, 5]],
    [[1, 1], [6, 2], [1, 1], [9, 9], [3, 7]],
    [[5, 1], [5, 9], [5, 4], [6, 6], [5, 2], [4, 8], [5, 7], [6, 0]],
    [[0, 0], [2, 0], [4, 0], [4, 2], [4, 4], [2, 2], [0, 4], [0, 2], [1, 1], [2, 0]],
    [[3, 3]],
]


def closest_cases(count):
    rng = random.Random(RNG.randint(0, 10**9))
    cases = [closest_case(p) for p in CLOSEST_FIXED]
    for _ in range(count):
        n = rng.randint(2, 16)
        kind = rng.random()
        if kind < 0.3:
            pts = [[rng.randint(0, 4), rng.randint(0, 9)] for _ in range(n)]  # repeated x values
        elif kind < 0.4:
            pts = [[rng.randint(0, 3), rng.randint(0, 3)] for _ in range(n)]  # duplicates
        else:
            pts = [[rng.randint(-30, 30), rng.randint(-30, 30)] for _ in range(n)]
        cases.append(closest_case(pts))
    return cases


def main():
    sections = {
        "pointLineCircle": plc_cases(200),
        "intersection": li_cases(200),
        "graham": hull_cases(graham_case, 80),
        "jarvis": hull_cases(jarvis_case, 80),
        "calipers": calipers_cases(60),
        "closestPair": closest_cases(80),
    }
    header = {
        "generator": "web/scripts/gen_geometry_fixtures.py",
        "reference": "Algorithms/Computational_Geometry (point_line_circle.py, line_intersection.py, convex_hull.py, rotating_calipers.py, closest_pair.py)",
    }
    parts = []
    for key, cases in sections.items():
        lines = [json.dumps(c, separators=(",", ":"), allow_nan=False) for c in cases]
        parts.append(json.dumps(key) + ": [\n" + ",\n".join(lines) + "\n]")
    body = json.dumps(header)[:-1] + ",\n" + ",\n".join(parts) + "\n}\n"
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(body, encoding="ascii")
    counts = ", ".join(f"{len(c)} {k}" for k, c in sections.items())
    print(f"wrote {counts} cases to {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
