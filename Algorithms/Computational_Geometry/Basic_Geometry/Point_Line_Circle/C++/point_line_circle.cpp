#include <cmath>
#include <iomanip>
#include <iostream>
#include <limits>
#include <stdexcept>
#include <vector>
#ifndef M_PI
#define M_PI 3.14159265358979323846
#endif

struct Point {
    double x, y;

    Point(double x = 0, double y = 0) : x(x), y(y) {}

    // Exact coordinate equality (no tolerance).
    bool operator==(const Point& other) const {
        return x == other.x && y == other.y;
    }

    double distanceTo(const Point& other) const {
        double dx = x - other.x;
        double dy = y - other.y;
        return std::sqrt(dx * dx + dy * dy);
    }

    double distanceSquared(const Point& other) const {
        double dx = x - other.x;
        double dy = y - other.y;
        return dx * dx + dy * dy;
    }
};

struct Line {
    Point p1, p2;

    Line(const Point& p1, const Point& p2) : p1(p1), p2(p2) {}

    double length() const {
        return p1.distanceTo(p2);
    }

    double lengthSquared() const {
        return p1.distanceSquared(p2);
    }

    // inf for a vertical line, nan for a zero-length line (it has no direction).
    // The test is exact, so it does not depend on the scale.
    double slope() const {
        if (p1 == p2) {
            return std::numeric_limits<double>::quiet_NaN();
        }
        if (p2.x == p1.x) {
            return std::numeric_limits<double>::infinity();
        }
        return (p2.y - p1.y) / (p2.x - p1.x);
    }

    // Exactly equal x, and not a zero-length line.
    bool isVertical() const {
        return p2.x == p1.x && p2.y != p1.y;
    }

    // Exactly equal y, and not a zero-length line.
    bool isHorizontal() const {
        return p2.y == p1.y && p2.x != p1.x;
    }
};

struct Circle {
    Point center;
    double radius;

    // Throws std::invalid_argument for a negative (or NaN) radius.
    Circle(const Point& center, double radius) : center(center), radius(radius) {
        if (!(radius >= 0)) {
            throw std::invalid_argument("radius must be non-negative");
        }
    }

    double area() const {
        return M_PI * radius * radius;
    }

    double circumference() const {
        return 2 * M_PI * radius;
    }

    // Inside or on the circle (exact comparison of squared distances).
    bool containsPoint(const Point& point) const {
        return center.distanceSquared(point) <= radius * radius;
    }

    // Exactly on the boundary (exact comparison).
    bool pointOnCircle(const Point& point) const {
        return center.distanceSquared(point) == radius * radius;
    }
};

// Geometric utility functions

double crossProduct(const Point& o, const Point& a, const Point& b) {
    // Each product is rounded on its own, as in Python. Writing it to a volatile double
    // keeps a compiler from fusing `left - right` into one fused multiply-add, which GCC
    // does at -O2 even across statements: the fused form keeps one product unrounded, so
    // two equal products would no longer cancel to exactly 0 and collinear points would
    // stop testing as collinear.
    volatile double left = (a.x - o.x) * (b.y - o.y);
    volatile double right = (a.y - o.y) * (b.x - o.x);
    return left - right;
}

double dotProduct(const Point& o, const Point& a, const Point& b) {
    return (a.x - o.x) * (b.x - o.x) + (a.y - o.y) * (b.y - o.y);
}

// 0 collinear, 1 clockwise, 2 counterclockwise. Exact: the sign of the cross product.
int orientation(const Point& p, const Point& q, const Point& r) {
    double val = crossProduct(p, q, r);
    if (val == 0) {
        return 0;  // Collinear
    }
    return (val > 0) ? 2 : 1;  // Counterclockwise : Clockwise
}

// Angle AOB in radians, in [0, pi]. Uses atan2(|cross|, dot), which stays accurate for
// angles near 0 and pi. Returns 0 if A or B coincides with O.
double angleBetweenPoints(const Point& o, const Point& a, const Point& b) {
    double oa_x = a.x - o.x;
    double oa_y = a.y - o.y;
    double ob_x = b.x - o.x;
    double ob_y = b.y - o.y;

    if ((oa_x == 0 && oa_y == 0) || (ob_x == 0 && ob_y == 0)) {
        return 0.0;
    }

    double cross = oa_x * ob_y - oa_y * ob_x;
    double dot = oa_x * ob_x + oa_y * ob_y;
    return std::atan2(std::abs(cross), dot);
}

// Inside the triangle or on its boundary (either orientation). A degenerate triangle
// (collinear or repeated vertices) contains no point.
bool pointInTriangle(const Point& p, const Point& a, const Point& b, const Point& c) {
    if (crossProduct(a, b, c) == 0) {
        return false;
    }

    double d1 = crossProduct(p, a, b);
    double d2 = crossProduct(p, b, c);
    double d3 = crossProduct(p, c, a);

    bool has_neg = (d1 < 0) || (d2 < 0) || (d3 < 0);
    bool has_pos = (d1 > 0) || (d2 > 0) || (d3 > 0);

    return !(has_neg && has_pos);
}

#ifndef IS_TEST_BUILD
int main() {
    std::cout << "Point, Line, and Circle Operations Examples:" << std::endl;
    std::cout << std::endl;

    // Point operations
    Point p1(0, 0);
    Point p2(3, 4);
    std::cout << "Distance between (" << p1.x << ", " << p1.y << ") and ("
              << p2.x << ", " << p2.y << "): " << std::fixed << std::setprecision(2)
              << p1.distanceTo(p2) << std::endl;
    std::cout << std::endl;

    // Line operations
    Line line(Point(0, 0), Point(3, 4));
    std::cout << "Line length: " << line.length() << std::endl;
    std::cout << "Line slope: " << line.slope() << std::endl;
    std::cout << std::endl;

    // Circle operations
    Circle circle(Point(0, 0), 5.0);
    std::cout << "Circle area: " << circle.area() << std::endl;
    std::cout << "Circle circumference: " << circle.circumference() << std::endl;
    std::cout << "Point (3, 4) in circle: " << (circle.containsPoint(Point(3, 4)) ? "true" : "false") << std::endl;
    std::cout << "Point (5, 0) on circle: " << (circle.pointOnCircle(Point(5, 0)) ? "true" : "false") << std::endl;
    std::cout << std::endl;

    // Orientation
    Point p(0, 0);
    Point q(4, 4);
    Point r(1, 2);
    int orient = orientation(p, q, r);
    std::cout << "Orientation of ((" << p.x << ", " << p.y << "), (" << q.x << ", " << q.y
              << "), (" << r.x << ", " << r.y << ")): " << orient
              << " (0=collinear, 1=clockwise, 2=counterclockwise)" << std::endl;

    return 0;
}
#endif  // !IS_TEST_BUILD
