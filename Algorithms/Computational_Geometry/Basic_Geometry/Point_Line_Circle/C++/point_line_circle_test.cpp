#include <cassert>
#include <cmath>
#ifndef M_PI
#define M_PI 3.14159265358979323846
#endif
#include "point_line_circle.cpp"

static const double EPS = 1e-9;

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

void testOrientationDoesNotDependOnScale() {
    double scales[] = {1e-10, 1e-5, 1.0, 1e5};
    for (double k : scales) {
        Point p(0, 0), q(4 * k, 4 * k);
        assert(orientation(p, q, Point(1 * k, 2 * k)) == 2);
        assert(orientation(p, q, Point(2 * k, 1 * k)) == 1);
        assert(orientation(p, q, Point(2 * k, 2 * k)) == 0);
    }
}

void testDotProduct() {
    assert(dotProduct(Point(0, 0), Point(3, 4), Point(2, 1)) == 10);
    assert(dotProduct(Point(1, 1), Point(2, 1), Point(1, 2)) == 0);
}

void testAngleBetweenPoints() {
    Point o(0, 0);
    assert(std::abs(angleBetweenPoints(o, Point(1, 0), Point(0, 1)) - M_PI / 2) < 1e-12);
    assert(std::abs(angleBetweenPoints(o, Point(1, 0), Point(1, 1)) - M_PI / 4) < 1e-12);
    assert(std::abs(angleBetweenPoints(o, Point(1, 0), Point(-1, 0)) - M_PI) < 1e-12);
    assert(angleBetweenPoints(o, Point(1, 0), Point(2, 0)) == 0.0);
    assert(angleBetweenPoints(o, o, Point(1, 1)) == 0.0);  // undefined, reported as 0
}

void testAngleIsAccurateForTinyAnglesAndTinyVectors() {
    Point o(0, 0);
    // acos of a clamped cosine returns 0.0 here
    assert(std::abs(angleBetweenPoints(o, Point(1, 0), Point(1, 1e-8)) - 1e-8) < 1e-20);
    assert(std::abs(angleBetweenPoints(o, Point(1e-10, 0), Point(0, 1e-10)) - M_PI / 2) < 1e-12);
}

void testPointInTriangleBoundaryAndOrientation() {
    Point a(0, 0), b(4, 0), c(2, 4);
    assert(pointInTriangle(Point(2, 0), a, b, c));  // on an edge
    assert(pointInTriangle(a, a, b, c));            // a vertex
    assert(pointInTriangle(Point(2, 1), a, c, b));  // clockwise triangle
    assert(!pointInTriangle(Point(2, -1), a, b, c));
}

void testPointInDegenerateTriangleIsFalse() {
    Point origin(0, 0);
    assert(!pointInTriangle(Point(100, 100), origin, origin, origin));
    assert(!pointInTriangle(Point(10, 10), Point(0, 0), Point(1, 1), Point(2, 2)));
    assert(!pointInTriangle(Point(1, 1), Point(0, 0), Point(1, 1), Point(2, 2)));
}

void testCircleTestsDoNotDependOnScale() {
    Circle small(Point(0, 0), 1e-5);
    assert(!small.containsPoint(Point(3e-5, 0)));
    assert(small.containsPoint(Point(5e-6, 0)));
    assert(!small.pointOnCircle(Point(5e-6, 0)));
    Circle zero(Point(0, 0), 0);
    assert(!zero.pointOnCircle(Point(3e-5, 0)));
    assert(zero.pointOnCircle(Point(0, 0)));
    assert(Circle(Point(0, 0), 5).pointOnCircle(Point(3, 4)));
    assert(Circle(Point(0, 0), 5).containsPoint(Point(3, 4)));
}

void testNegativeRadiusIsRejected() {
    bool thrown = false;
    try {
        Circle bad(Point(0, 0), -5);
    } catch (const std::invalid_argument&) {
        thrown = true;
    }
    assert(thrown);
}

void testSlopeAndDirectionDoNotDependOnScale() {
    Line tiny(Point(0, 0), Point(1e-10, 1e-10));
    assert(std::abs(tiny.slope() - 1.0) < 1e-12);
    assert(!tiny.isVertical());
    assert(!tiny.isHorizontal());
}

void testZeroLengthLineHasNoDirection() {
    Line dot(Point(1, 1), Point(1, 1));
    assert(std::isnan(dot.slope()));
    assert(!dot.isVertical());
    assert(!dot.isHorizontal());
    assert(dot.lengthSquared() == 0);
    assert(Line(Point(0, 0), Point(3, 4)).lengthSquared() == 25);
}

void testPointEqualityIsExact() {
    assert(!(Point(0, 0) == Point(5e-10, 0)));
    assert(Point(1.5, 2.5) == Point(1.5, 2.5));
}

int main() {
    testPoint();
    testLine();
    testCircle();
    testGeometricFunctions();
    testOrientationDoesNotDependOnScale();
    testDotProduct();
    testAngleBetweenPoints();
    testAngleIsAccurateForTinyAnglesAndTinyVectors();
    testPointInTriangleBoundaryAndOrientation();
    testPointInDegenerateTriangleIsFalse();
    testCircleTestsDoNotDependOnScale();
    testNegativeRadiusIsRejected();
    testSlopeAndDirectionDoNotDependOnScale();
    testZeroLengthLineHasNoDirection();
    testPointEqualityIsExact();
    std::cout << "All tests passed!" << std::endl;
    return 0;
}
