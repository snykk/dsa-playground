#include <cassert>
#include <cmath>
#ifndef M_PI
#define M_PI 3.14159265358979323846
#endif
#include "point_line_circle.cpp"

// EPS is already defined in point_line_circle.cpp

void testPoint() {
    Point p(1, 2);
    assert(std::abs(p.x - 1) < EPS);
    assert(std::abs(p.y - 2) < EPS);

    Point p1(0, 0);
    Point p2(3, 4);
    assert(std::abs(p1.distanceTo(p2) - 5.0) < EPS);
    assert(std::abs(p1.distanceSquared(p2) - 25.0) < EPS);

    Point p3(1.0, 2.0);
    Point p4(1.0, 2.0);
    assert(p3 == p4);
}

void testLine() {
    Line line(Point(0, 0), Point(3, 4));
    assert(std::abs(line.length() - 5.0) < EPS);

    Line line2(Point(0, 0), Point(2, 4));
    assert(std::abs(line2.slope() - 2.0) < EPS);

    Line vertical(Point(0, 0), Point(0, 5));
    assert(vertical.isVertical());
    assert(std::isinf(vertical.slope()));

    Line horizontal(Point(0, 0), Point(5, 0));
    assert(horizontal.isHorizontal());
}

void testCircle() {
    Circle circle(Point(0, 0), 5.0);
    assert(std::abs(circle.area() - M_PI * 25) < EPS);
    assert(std::abs(circle.circumference() - 2 * M_PI * 5) < EPS);

    assert(circle.containsPoint(Point(3, 4)));
    assert(circle.containsPoint(Point(0, 0)));
    assert(!circle.containsPoint(Point(10, 10)));

    assert(circle.pointOnCircle(Point(5, 0)));
    assert(circle.pointOnCircle(Point(0, 5)));
}

void testGeometricFunctions() {
    Point o(0, 0);
    Point a(1, 0);
    Point b(0, 1);
    assert(std::abs(crossProduct(o, a, b) - 1.0) < EPS);

    Point p(0, 0);
    Point q(4, 4);
    Point r(1, 2);
    assert(orientation(p, q, r) == 2);

    Point r2(2, 1);
    assert(orientation(p, q, r2) == 1);

    Point r3(2, 2);
    assert(orientation(p, q, r3) == 0);

    Point a_tri(0, 0);
    Point b_tri(4, 0);
    Point c_tri(2, 4);
    Point p_in(2, 1);
    assert(pointInTriangle(p_in, a_tri, b_tri, c_tri));

    Point p_out(10, 10);
    assert(!pointInTriangle(p_out, a_tri, b_tri, c_tri));
}

int main() {
    testPoint();
    testLine();
    testCircle();
    testGeometricFunctions();
    std::cout << "All tests passed!" << std::endl;
    return 0;
}
