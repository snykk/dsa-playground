#include <iostream>
#include <cmath>
#include <optional>

const double EPS = 1e-9;

struct Point {
    double x, y;
    Point(double x = 0, double y = 0) : x(x), y(y) {}
};

struct Line {
    Point p1, p2;
    Line(const Point& p1, const Point& p2) : p1(p1), p2(p2) {}
};

double crossProduct(const Point& o, const Point& a, const Point& b) {
    return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
}

std::optional<Point> lineIntersection(const Line& l1, const Line& l2) {
    double x1 = l1.p1.x, y1 = l1.p1.y;
    double x2 = l1.p2.x, y2 = l1.p2.y;
    double x3 = l2.p1.x, y3 = l2.p1.y;
    double x4 = l2.p2.x, y4 = l2.p2.y;

    double denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    if (std::abs(denom) < EPS) {
        return std::nullopt;  // Lines are parallel
    }

    double t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
    double x = x1 + t * (x2 - x1);
    double y = y1 + t * (y2 - y1);

    return Point(x, y);
}

std::optional<Point> segmentIntersection(const Line& l1, const Line& l2) {
    double x1 = l1.p1.x, y1 = l1.p1.y;
    double x2 = l1.p2.x, y2 = l1.p2.y;
    double x3 = l2.p1.x, y3 = l2.p1.y;
    double x4 = l2.p2.x, y4 = l2.p2.y;

    double denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    if (std::abs(denom) < EPS) {
        return std::nullopt;
    }

    double t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
    double u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom;

    if (0 <= t && t <= 1 && 0 <= u && u <= 1) {
        double x = x1 + t * (x2 - x1);
        double y = y1 + t * (y2 - y1);
        return Point(x, y);
    }

    return std::nullopt;
}

bool segmentsIntersect(const Line& l1, const Line& l2) {
    return segmentIntersection(l1, l2).has_value();
}

bool pointOnSegment(const Point& p, const Line& line) {
    if (std::abs(crossProduct(line.p1, line.p2, p)) > EPS) {
        return false;
    }

    double min_x = std::min(line.p1.x, line.p2.x);
    double max_x = std::max(line.p1.x, line.p2.x);
    double min_y = std::min(line.p1.y, line.p2.y);
    double max_y = std::max(line.p1.y, line.p2.y);

    return min_x - EPS <= p.x && p.x <= max_x + EPS &&
           min_y - EPS <= p.y && p.y <= max_y + EPS;
}

#ifndef TESTING
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
#endif
