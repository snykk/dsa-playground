#include <iostream>
#include <vector>
#include <algorithm>
#include <cmath>
#include <iomanip>

const double EPS = 1e-9;

struct Point {
    double x, y;
    Point(double x = 0, double y = 0) : x(x), y(y) {}
    bool operator==(const Point& other) const {
        return std::abs(x - other.x) < EPS && std::abs(y - other.y) < EPS;
    }
};

double crossProduct(const Point& o, const Point& a, const Point& b) {
    // Two statements, so a compiler cannot fuse the products into one FMA instruction
    // and change the rounding of the result.
    double left = (a.x - o.x) * (b.y - o.y);
    double right = (a.y - o.y) * (b.x - o.x);
    return left - right;
}

double distanceSquared(const Point& p1, const Point& p2) {
    double dx = p1.x - p2.x;
    double dy = p1.y - p2.y;
    return dx * dx + dy * dy;
}

// Exact comparison, used by the hull algorithms (operator== above uses EPS).
static bool samePoint(const Point& a, const Point& b) {
    return a.x == b.x && a.y == b.y;
}

// Distinct points (exact comparison), sorted by (x, y).
static std::vector<Point> distinctPoints(std::vector<Point> points) {
    std::sort(points.begin(), points.end(), [](const Point& a, const Point& b) {
        return a.x < b.x || (a.x == b.x && a.y < b.y);
    });
    points.erase(std::unique(points.begin(), points.end(), samePoint), points.end());
    return points;
}

// Counterclockwise hull starting at the bottom-most point (leftmost on a tie). Points on
// a hull edge are excluded. Duplicates are removed; fewer than three distinct points are
// returned as they are. Comparisons are exact, so integer input never goes wrong.
std::vector<Point> grahamScan(std::vector<Point> points) {
    std::vector<Point> pts = distinctPoints(points);
    if (pts.size() < 3) {
        std::sort(pts.begin(), pts.end(), [](const Point& a, const Point& b) {
            return a.y < b.y || (a.y == b.y && a.x < b.x);
        });
        return pts;
    }

    // Find bottom-most point (or leftmost in case of tie)
    size_t bottomIdx = 0;
    for (size_t i = 1; i < pts.size(); i++) {
        if (pts[i].y < pts[bottomIdx].y || (pts[i].y == pts[bottomIdx].y && pts[i].x < pts[bottomIdx].x)) {
            bottomIdx = i;
        }
    }
    std::swap(pts[0], pts[bottomIdx]);
    const Point bottom = pts[0];

    // Sort by polar angle around bottom: a comes first if b is counterclockwise of it.
    // All points lie in the upper half-plane of bottom, so this is a strict weak ordering.
    // Points on the same ray are ordered nearest first.
    std::sort(pts.begin() + 1, pts.end(), [&bottom](const Point& a, const Point& b) {
        double cross = crossProduct(bottom, a, b);
        if (cross != 0) {
            return cross > 0;
        }
        return distanceSquared(bottom, a) < distanceSquared(bottom, b);
    });

    // Build convex hull using stack; drop right turns and collinear points
    std::vector<Point> hull;
    for (const Point& p : pts) {
        while (hull.size() > 1 &&
               crossProduct(hull[hull.size() - 2], hull.back(), p) <= 0) {
            hull.pop_back();
        }
        hull.push_back(p);
    }

    return hull;
}

// Counterclockwise hull starting at the leftmost point (lowest on a tie). Points on a hull
// edge are excluded. Duplicates are removed; fewer than three distinct points are
// returned as they are. Comparisons are exact, so integer input never goes wrong.
std::vector<Point> jarvisMarch(std::vector<Point> points) {
    std::vector<Point> pts = distinctPoints(points);  // sorted by (x, y)
    if (pts.size() < 3) {
        return pts;
    }

    // Leftmost point is the first one after sorting by (x, y)
    const Point leftmost = pts[0];
    std::vector<Point> hull;
    hull.push_back(leftmost);

    // A hull never has more vertices than points; the bound only guards rounding trouble
    // with non-integer coordinates.
    while (hull.size() <= pts.size()) {
        Point current = hull.back();
        bool found = false;
        Point next_point;

        // Find the point such that every other point is on its left (or on the line)
        for (const auto& point : pts) {
            if (samePoint(point, current)) {
                continue;
            }
            if (!found) {
                next_point = point;
                found = true;
                continue;
            }

            double cross = crossProduct(current, next_point, point);

            // If point is more clockwise, or on the same ray but farther
            if (cross < 0 || (cross == 0 &&
                              distanceSquared(current, point) > distanceSquared(current, next_point))) {
                next_point = point;
            }
        }

        // If we've completed the hull
        if (samePoint(next_point, leftmost)) {
            break;
        }

        hull.push_back(next_point);
    }

    return hull;
}

#ifndef IS_TEST_BUILD
int main() {
    std::cout << "Convex Hull Examples:" << std::endl;
    std::cout << std::endl;

    std::vector<Point> points = {
        {0, 3}, {2, 2}, {1, 1}, {2, 1}, {3, 0}, {0, 0}, {3, 3}
    };

    std::cout << "Points: ";
    for (const auto& p : points) {
        std::cout << "(" << p.x << "," << p.y << ") ";
    }
    std::cout << std::endl << std::endl;

    // Graham's Scan
    auto graham_hull = grahamScan(points);
    std::cout << "Graham's Scan hull: ";
    for (const auto& p : graham_hull) {
        std::cout << "(" << p.x << "," << p.y << ") ";
    }
    std::cout << std::endl << std::endl;

    // Jarvis March
    auto jarvis_hull = jarvisMarch(points);
    std::cout << "Jarvis March hull: ";
    for (const auto& p : jarvis_hull) {
        std::cout << "(" << p.x << "," << p.y << ") ";
    }
    std::cout << std::endl;

    return 0;
}
#endif  // !IS_TEST_BUILD
