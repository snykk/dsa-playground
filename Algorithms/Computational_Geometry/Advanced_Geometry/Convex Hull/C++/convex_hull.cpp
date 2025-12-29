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
    return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
}

double distanceSquared(const Point& p1, const Point& p2) {
    double dx = p1.x - p2.x;
    double dy = p1.y - p2.y;
    return dx * dx + dy * dy;
}

std::vector<Point> grahamScan(std::vector<Point> points) {
    if (points.size() < 3) {
        return points;
    }

    // Find bottom-most point (or leftmost in case of tie)
    Point bottom = points[0];
    for (const auto& p : points) {
        if (p.y < bottom.y || (std::abs(p.y - bottom.y) < EPS && p.x < bottom.x)) {
            bottom = p;
        }
    }

    // Sort points by polar angle with respect to bottom point
    std::sort(points.begin(), points.end(), [&bottom](const Point& a, const Point& b) {
        double dx1 = a.x - bottom.x;
        double dy1 = a.y - bottom.y;
        double dx2 = b.x - bottom.x;
        double dy2 = b.y - bottom.y;
        
        double angle1 = std::atan2(dy1, dx1);
        double angle2 = std::atan2(dy2, dx2);
        
        if (std::abs(angle1 - angle2) < EPS) {
            return distanceSquared(bottom, a) < distanceSquared(bottom, b);
        }
        return angle1 < angle2;
    });

    // Remove duplicates
    std::vector<Point> unique_points;
    unique_points.push_back(points[0]);
    for (size_t i = 1; i < points.size(); i++) {
        if (!(points[i] == unique_points.back())) {
            unique_points.push_back(points[i]);
        }
    }

    if (unique_points.size() < 3) {
        return unique_points;
    }

    // Build convex hull using stack
    std::vector<Point> hull;
    hull.push_back(unique_points[0]);
    hull.push_back(unique_points[1]);

    for (size_t i = 2; i < unique_points.size(); i++) {
        while (hull.size() > 1 && 
               crossProduct(hull[hull.size() - 2], hull.back(), unique_points[i]) <= 0) {
            hull.pop_back();
        }
        hull.push_back(unique_points[i]);
    }

    return hull;
}

std::vector<Point> jarvisMarch(std::vector<Point> points) {
    if (points.size() < 3) {
        return points;
    }

    // Find leftmost point
    Point leftmost = points[0];
    for (const auto& p : points) {
        if (p.x < leftmost.x || (std::abs(p.x - leftmost.x) < EPS && p.y < leftmost.y)) {
            leftmost = p;
        }
    }

    std::vector<Point> hull;
    hull.push_back(leftmost);

    while (true) {
        Point current = hull.back();
        Point next_point = points[0];

        // Find point with smallest polar angle from current
        for (const auto& point : points) {
            if (point == current) {
                continue;
            }

            double cross = crossProduct(current, next_point, point);
            double dist_next = distanceSquared(current, next_point);
            double dist_point = distanceSquared(current, point);

            // If point is more counterclockwise, or same angle but farther
            if (cross < 0 || (std::abs(cross) < EPS && dist_point > dist_next)) {
                next_point = point;
            }
        }

        // If we've completed the hull
        if (next_point == leftmost) {
            break;
        }

        hull.push_back(next_point);
    }

    return hull;
}

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
