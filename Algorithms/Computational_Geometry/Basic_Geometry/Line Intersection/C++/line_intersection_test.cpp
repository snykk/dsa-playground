#include <cassert>
#include <cmath>
#include <random>
#include <vector>
#include "line_intersection.cpp"

static const double TOL = 1e-9;

static Line seg(double x1, double y1, double x2, double y2) {
    return Line(Point(x1, y1), Point(x2, y2));
}

// Independent integer reference: parametric solution, or endpoint-on-segment when parallel.
typedef std::pair<long long, long long> IP;

static bool onSeg(IP p, IP e, IP f) {
    if (e == f) return p == e;
    long long cr = (f.first - e.first) * (p.second - e.second) - (f.second - e.second) * (p.first - e.first);
    long long dot = (p.first - e.first) * (f.first - e.first) + (p.second - e.second) * (f.second - e.second);
    long long len2 = (f.first - e.first) * (f.first - e.first) + (f.second - e.second) * (f.second - e.second);
    return cr == 0 && 0 <= dot && dot <= len2;
}

static bool refIntersect(IP a, IP b, IP c, IP d) {
    IP r(b.first - a.first, b.second - a.second), s(d.first - c.first, d.second - c.second);
    long long rxs = r.first * s.second - r.second * s.first;
    if (rxs != 0) {
        IP qp(c.first - a.first, c.second - a.second);
        long long t = qp.first * s.second - qp.second * s.first;
        long long u = qp.first * r.second - qp.second * r.first;
        if (rxs < 0) { rxs = -rxs; t = -t; u = -u; }
        return 0 <= t && t <= rxs && 0 <= u && u <= rxs;
    }
    return onSeg(a, c, d) || onSeg(b, c, d) || onSeg(c, a, b) || onSeg(d, a, b);
}

static double distToSegment(const Point& p, IP a, IP b) {
    double dx = b.first - a.first, dy = b.second - a.second;
    double len2 = dx * dx + dy * dy;
    double t = len2 == 0 ? 0.0 : std::max(0.0, std::min(1.0, ((p.x - a.first) * dx + (p.y - a.second) * dy) / len2));
    return std::hypot(p.x - (a.first + t * dx), p.y - (a.second + t * dy));
}

void testLineIntersection() {
    Line l1(Point(0, 0), Point(4, 4));
    Line l2(Point(0, 4), Point(4, 0));
    auto intersection = lineIntersection(l1, l2);
    assert(intersection.has_value());
    assert(std::abs(intersection->x - 2.0) < TOL);
    assert(std::abs(intersection->y - 2.0) < TOL);
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
    assert(std::abs(intersection->x - 2.0) < TOL);
    assert(std::abs(intersection->y - 2.0) < TOL);
}

void testSegmentsNoIntersection() {
    Line seg1(Point(0, 0), Point(1, 1));
    Line seg2(Point(2, 2), Point(3, 3));
    auto intersection = segmentIntersection(seg1, seg2);
    assert(!intersection.has_value());
    assert(!segmentsIntersect(seg1, seg2));
}

void testSegmentsIntersect() {
    assert(segmentsIntersect(seg(0, 0, 4, 4), seg(0, 4, 4, 0)));
}

void testPointOnSegment() {
    Line line(Point(0, 0), Point(4, 4));
    Point p(2, 2);
    assert(pointOnSegment(p, line));
}

void testPointNotOnSegment() {
    Line line(Point(0, 0), Point(4, 4));
    assert(!pointOnSegment(Point(5, 5), line));
    assert(!pointOnSegment(Point(2, 3), line));
}

void testCollinearOverlappingSegmentsIntersect() {
    assert(segmentsIntersect(seg(0, 0, 2, 0), seg(1, 0, 3, 0)));
    assert(segmentsIntersect(seg(1, 0, 3, 0), seg(0, 0, 2, 0)));
    auto p = segmentIntersection(seg(0, 0, 2, 0), seg(1, 0, 3, 0));
    assert(p.has_value() && p->x == 1 && p->y == 0);
    auto v = segmentIntersection(seg(0, 0, 0, 2), seg(0, 3, 0, 1));
    assert(v.has_value() && v->x == 0 && v->y == 1);
}

void testCollinearTouchingAtAnEndpoint() {
    assert(segmentsIntersect(seg(0, 0, 1, 0), seg(1, 0, 2, 0)));
    auto p = segmentIntersection(seg(0, 0, 1, 0), seg(1, 0, 2, 0));
    assert(p.has_value() && p->x == 1 && p->y == 0);
}

void testCollinearDisjointAndParallel() {
    assert(!segmentsIntersect(seg(0, 0, 1, 0), seg(2, 0, 3, 0)));
    assert(!segmentsIntersect(seg(0, 0, 2, 0), seg(0, 1, 2, 1)));
    assert(!segmentIntersection(seg(0, 0, 1, 0), seg(2, 0, 3, 0)).has_value());
}

void testZeroLengthSegments() {
    assert(segmentsIntersect(seg(0, 0, 2, 0), seg(1, 0, 1, 0)));
    assert(!segmentsIntersect(seg(0, 0, 2, 0), seg(1, 1, 1, 1)));
    assert(segmentsIntersect(seg(1, 1, 1, 1), seg(1, 1, 1, 1)));
    auto p = segmentIntersection(seg(0, 0, 2, 0), seg(1, 0, 1, 0));
    assert(p.has_value() && p->x == 1 && p->y == 0);
}

void testTJunctionAndSharedEndpoint() {
    assert(segmentsIntersect(seg(0, 0, 4, 0), seg(2, 0, 2, 3)));
    auto t = segmentIntersection(seg(0, 0, 4, 0), seg(2, 0, 2, 3));
    assert(t.has_value() && t->x == 2 && t->y == 0);
    // float endpoints shared: found whatever the order of the endpoints
    Line a = seg(0.6, 0.8, 1.0, 0.1), b = seg(0.2, 1.0, 1.0, 0.1);
    assert(segmentsIntersect(a, b));
    assert(segmentsIntersect(a, seg(1.0, 0.1, 0.2, 1.0)));
    auto p = segmentIntersection(a, b);
    assert(p.has_value() && p->x == 1.0 && p->y == 0.1);
}

void testTinyScale() {
    auto p = lineIntersection(seg(0, 0, 1e-5, 1e-5), seg(0, 1e-5, 1e-5, 0));
    assert(p.has_value() && std::abs(p->x - 5e-6) < 1e-15 && std::abs(p->y - 5e-6) < 1e-15);
    assert(segmentsIntersect(seg(0, 0, 1e-5, 1e-5), seg(0, 1e-5, 1e-5, 0)));
    assert(pointOnSegment(Point(5e-6, 5e-6), seg(0, 0, 1e-5, 1e-5)));
    assert(!pointOnSegment(Point(1e-5, 0), seg(0, 0, 1e-5, 1e-5)));
    assert(!pointOnSegment(Point(1, 0), seg(0, 0, 1, 1)));
}

void testCoincidentAndDegenerateLines() {
    assert(!lineIntersection(seg(0, 0, 1, 1), seg(2, 2, 3, 3)).has_value());
    assert(!lineIntersection(seg(0, 0, 0, 0), seg(0, 0, 1, 1)).has_value());
}

void testPointOnSegmentEndpointsAndZeroLength() {
    Line line = seg(0, 0, 4, 4);
    assert(pointOnSegment(Point(0, 0), line));
    assert(pointOnSegment(Point(4, 4), line));
    assert(pointOnSegment(Point(1, 1), seg(1, 1, 1, 1)));
    assert(!pointOnSegment(Point(1, 2), seg(1, 1, 1, 1)));
}

void testRandomIntegerSegmentsMatchReference() {
    std::mt19937 rng(3);
    int spans[] = {1, 2, 3, 5};
    for (int iter = 0; iter < 4000; iter++) {
        int span = spans[rng() % 4];
        IP pts[4];
        for (auto& p : pts) p = IP(rng() % (span + 1), rng() % (span + 1));
        Line l1 = seg(pts[0].first, pts[0].second, pts[1].first, pts[1].second);
        Line l2 = seg(pts[2].first, pts[2].second, pts[3].first, pts[3].second);
        bool expected = refIntersect(pts[0], pts[1], pts[2], pts[3]);
        assert(segmentsIntersect(l1, l2) == expected);
        assert(segmentsIntersect(l2, l1) == expected);
        auto p = segmentIntersection(l1, l2);
        assert(p.has_value() == expected);
        if (p.has_value()) {
            assert(distToSegment(*p, pts[0], pts[1]) < TOL);
            assert(distToSegment(*p, pts[2], pts[3]) < TOL);
        }
    }
}

int main() {
    testLineIntersection();
    testParallelLines();
    testSegmentIntersection();
    testSegmentsNoIntersection();
    testSegmentsIntersect();
    testPointOnSegment();
    testPointNotOnSegment();
    testCollinearOverlappingSegmentsIntersect();
    testCollinearTouchingAtAnEndpoint();
    testCollinearDisjointAndParallel();
    testZeroLengthSegments();
    testTJunctionAndSharedEndpoint();
    testTinyScale();
    testCoincidentAndDegenerateLines();
    testPointOnSegmentEndpointsAndZeroLength();
    testRandomIntegerSegmentsMatchReference();
    std::cout << "All tests passed!" << std::endl;
    return 0;
}
