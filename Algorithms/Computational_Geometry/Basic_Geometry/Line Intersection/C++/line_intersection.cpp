#include <algorithm>
#include <cmath>
#include <iostream>
#include <optional>
#include <utility>

struct Point {
    double x, y;
    Point(double x = 0, double y = 0) : x(x), y(y) {}
};

struct Line {
    Point p1, p2;
    Line(const Point& p1, const Point& p2) : p1(p1), p2(p2) {}
};

double crossProduct(const Point& o, const Point& a, const Point& b) {
    // Two statements, so a compiler cannot fuse the products into one FMA instruction
    // and change the rounding of the result.
    double left = (a.x - o.x) * (b.y - o.y);
    double right = (a.y - o.y) * (b.x - o.x);
    return left - right;
}

// Intersection point of the two infinite lines through the endpoints of l1 and l2.
// Returns nullopt if the lines are parallel, which includes coincident lines (no single
// intersection point) and a Line whose two endpoints are equal (no direction).
std::optional<Point> lineIntersection(const Line& l1, const Line& l2) {
    double x1 = l1.p1.x, y1 = l1.p1.y;
    double x2 = l1.p2.x, y2 = l1.p2.y;
    double x3 = l2.p1.x, y3 = l2.p1.y;
    double x4 = l2.p2.x, y4 = l2.p2.y;

    double denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    if (denom == 0) {
        return std::nullopt;  // Lines are parallel (exact test, so it does not depend on the scale)
    }

    double t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
    double x = x1 + t * (x2 - x1);
    double y = y1 + t * (y2 - y1);

    return Point(x, y);
}

static int signOf(double v) {
    return (v > 0) - (v < 0);
}

// True if p lies in the bounding box of a and b (used for collinear points).
static bool withinBox(const Point& a, const Point& b, const Point& p) {
    return std::min(a.x, b.x) <= p.x && p.x <= std::max(a.x, b.x) &&
           std::min(a.y, b.y) <= p.y && p.y <= std::max(a.y, b.y);
}

// True if the segments share at least one point. Exact orientation tests: crossing, touching
// at an endpoint, T-junctions, collinear overlap and zero-length segments all count.
bool segmentsIntersect(const Line& l1, const Line& l2) {
    const Point &p1 = l1.p1, &p2 = l1.p2, &p3 = l2.p1, &p4 = l2.p2;
    double o1 = crossProduct(p1, p2, p3);
    double o2 = crossProduct(p1, p2, p4);
    double o3 = crossProduct(p3, p4, p1);
    double o4 = crossProduct(p3, p4, p2);

    // Proper crossing: each segment's endpoints are strictly on opposite sides of the other
    if (signOf(o1) * signOf(o2) < 0 && signOf(o3) * signOf(o4) < 0) {
        return true;
    }

    // An endpoint lying on the other segment (collinear with it and inside its box)
    if (o1 == 0 && withinBox(p1, p2, p3)) return true;
    if (o2 == 0 && withinBox(p1, p2, p4)) return true;
    if (o3 == 0 && withinBox(p3, p4, p1)) return true;
    if (o4 == 0 && withinBox(p3, p4, p2)) return true;
    return false;
}

// A common point of the two segments, or nullopt. Segments that cross or touch in a single
// point give that point (an endpoint is returned exactly). Collinear segments that overlap
// share many points; the first of them in (x, y) order is returned. A zero-length segment
// gives its own point if it lies on the other segment.
std::optional<Point> segmentIntersection(const Line& l1, const Line& l2) {
    if (!segmentsIntersect(l1, l2)) {
        return std::nullopt;
    }

    const Point &p1 = l1.p1, &p2 = l1.p2, &p3 = l2.p1, &p4 = l2.p2;
    double denom = (p1.x - p2.x) * (p3.y - p4.y) - (p1.y - p2.y) * (p3.x - p4.x);

    if (denom == 0) {
        // Collinear overlap, touching ends or a point segment: the overlap starts at the
        // larger of the two lower ends (points on one line are ordered by (x, y))
        std::pair<double, double> lo1 = std::min(std::make_pair(p1.x, p1.y), std::make_pair(p2.x, p2.y));
        std::pair<double, double> lo2 = std::min(std::make_pair(p3.x, p3.y), std::make_pair(p4.x, p4.y));
        std::pair<double, double> lo = std::max(lo1, lo2);
        return Point(lo.first, lo.second);
    }

    // One endpoint lies on the other segment's line: it is the intersection point
    if (crossProduct(p1, p2, p3) == 0) return p3;
    if (crossProduct(p1, p2, p4) == 0) return p4;
    if (crossProduct(p3, p4, p1) == 0) return p1;
    if (crossProduct(p3, p4, p2) == 0) return p2;

    return lineIntersection(l1, l2);
}

// Exact test; a zero-length segment is a single point.
bool pointOnSegment(const Point& p, const Line& line) {
    if (crossProduct(line.p1, line.p2, p) != 0) {
        return false;
    }
    return withinBox(line.p1, line.p2, p);
}

#ifndef IS_TEST_BUILD
int main() {
    std::cout << "Line Intersection Examples:" << std::endl;
    std::cout << std::endl;

    Line l1(Point(0, 0), Point(4, 4));
    Line l2(Point(0, 4), Point(4, 0));
    auto intersection = lineIntersection(l1, l2);
    if (intersection) {
        std::cout << "Line intersection: (" << intersection->x << ", " << intersection->y << ")" << std::endl;
    }

    auto seg_intersection = segmentIntersection(l1, l2);
    if (seg_intersection) {
        std::cout << "Segment intersection: (" << seg_intersection->x << ", " << seg_intersection->y << ")" << std::endl;
    }
    std::cout << "Segments intersect: " << (segmentsIntersect(l1, l2) ? "true" : "false") << std::endl;

    return 0;
}
#endif  // !IS_TEST_BUILD
