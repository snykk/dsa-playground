#include <iostream>
#include <cmath>
#include <vector>
#include <iomanip>
#ifndef M_PI
#define M_PI 3.14159265358979323846
#endif

const double EPS = 1e-9;

struct Point {
    double x, y;

    Point(double x = 0, double y = 0) : x(x), y(y) {}

    bool operator==(const Point& other) const {
        return std::abs(x - other.x) < EPS && std::abs(y - other.y) < EPS;
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

    double slope() const {
        if (std::abs(p2.x - p1.x) < EPS) {
            return std::numeric_limits<double>::infinity();
        }
        return (p2.y - p1.y) / (p2.x - p1.x);
    }

    bool isVertical() const {
        return std::abs(p2.x - p1.x) < EPS;
    }

    bool isHorizontal() const {
        return std::abs(p2.y - p1.y) < EPS;
    }
};

struct Circle {
    Point center;
    double radius;

    Circle(const Point& center, double radius) : center(center), radius(radius) {}

    double area() const {
        return M_PI * radius * radius;
    }

    double circumference() const {
        return 2 * M_PI * radius;
    }

    bool containsPoint(const Point& point) const {
        return center.distanceSquared(point) <= radius * radius + EPS;
    }

    bool pointOnCircle(const Point& point) const {
        double distSq = center.distanceSquared(point);
        return std::abs(distSq - radius * radius) < EPS;
    }
};

// Geometric utility functions

double crossProduct(const Point& o, const Point& a, const Point& b) {
    return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
}

double dotProduct(const Point& o, const Point& a, const Point& b) {
    return (a.x - o.x) * (b.x - o.x) + (a.y - o.y) * (b.y - o.y);
}

int orientation(const Point& p, const Point& q, const Point& r) {
    double val = crossProduct(p, q, r);
    if (std::abs(val) < EPS) {
        return 0;  // Collinear
    }
    return (val > 0) ? 2 : 1;  // Counterclockwise : Clockwise
}

double angleBetweenPoints(const Point& o, const Point& a, const Point& b) {
    double oa_x = a.x - o.x;
    double oa_y = a.y - o.y;
    double ob_x = b.x - o.x;
    double ob_y = b.y - o.y;
    
    double dot = oa_x * ob_x + oa_y * ob_y;
    double mag_oa = std::sqrt(oa_x * oa_x + oa_y * oa_y);
    double mag_ob = std::sqrt(ob_x * ob_x + ob_y * ob_y);
    
    if (mag_oa < EPS || mag_ob < EPS) {
        return 0.0;
    }
    
    double cos_angle = dot / (mag_oa * mag_ob);
    cos_angle = std::max(-1.0, std::min(1.0, cos_angle));
    return std::acos(cos_angle);
}

bool pointInTriangle(const Point& p, const Point& a, const Point& b, const Point& c) {
    double d1 = crossProduct(p, a, b);
    double d2 = crossProduct(p, b, c);
    double d3 = crossProduct(p, c, a);
    
    bool has_neg = (d1 < 0) || (d2 < 0) || (d3 < 0);
    bool has_pos = (d1 > 0) || (d2 > 0) || (d3 > 0);
    
    return !(has_neg && has_pos);
}

#ifndef TESTING
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
#endif
