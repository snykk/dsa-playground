#include <cassert>
#include <cmath>
#include "line_intersection.cpp"

const double EPS = 1e-5;

void testLineIntersection() {
    Line l1(Point(0, 0), Point(4, 4));
    Line l2(Point(0, 4), Point(4, 0));
    auto intersection = lineIntersection(l1, l2);
    assert(intersection.has_value());
    assert(std::abs(intersection->x - 2.0) < EPS);
    assert(std::abs(intersection->y - 2.0) < EPS);
}

void testParallelLines() {
    Line l1(Point(0, 0), Point(1, 1));
    Line l2(Point(0, 1), Point(1, 2));
    auto intersection = lineIntersection(l1, l2);
    assert(!intersection.has_value());
}

void testSegmentIntersection() {
    Line seg1(Point(0, 0), Point(4, 4));
    Line seg2(Point(0, 4), Point(4, 0));
    auto intersection = segmentIntersection(seg1, seg2);
    assert(intersection.has_value());
    assert(std::abs(intersection->x - 2.0) < EPS);
    assert(std::abs(intersection->y - 2.0) < EPS);
}

void testSegmentsNoIntersection() {
    Line seg1(Point(0, 0), Point(1, 1));
    Line seg2(Point(2, 2), Point(3, 3));
    auto intersection = segmentIntersection(seg1, seg2);
    assert(!intersection.has_value());
}

void testPointOnSegment() {
    Line line(Point(0, 0), Point(4, 4));
    Point p(2, 2);
    assert(pointOnSegment(p, line));
}

int main() {
    testLineIntersection();
    testParallelLines();
    testSegmentIntersection();
    testSegmentsNoIntersection();
    testPointOnSegment();
    std::cout << "All tests passed!" << std::endl;
    return 0;
}
