#include <iostream>
#include <vector>
#include <cmath>
#include <algorithm>
#include <limits>
#include <iomanip>

struct Point {
    double x, y;
    Point(double x = 0, double y = 0) : x(x), y(y) {}
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

double distance(const Point& p1, const Point& p2) {
    return std::sqrt(distanceSquared(p1, p2));
}

struct DiameterResult {
    double dist;
    Point p1, p2;
};

// Strictly convex vertex list of a convex polygon given in order: consecutive repeated
// vertices and vertices lying on an edge are removed. If every point is collinear the result
// is the two end points (or one point). Comparisons are exact.
std::vector<Point> cleanPolygon(const std::vector<Point>& hull) {
    auto same = [](const Point& a, const Point& b) { return a.x == b.x && a.y == b.y; };
    auto lexLess = [](const Point& a, const Point& b) { return a.x < b.x || (a.x == b.x && a.y < b.y); };

    std::vector<Point> pts;
    for (const auto& p : hull) {
        if (pts.empty() || !same(p, pts.back())) {
            pts.push_back(p);
        }
    }
    while (pts.size() > 1 && same(pts.front(), pts.back())) {
        pts.pop_back();
    }
    if (pts.size() < 3) {
        return pts;
    }

    // All points on one line: keep the two end points
    bool allCollinear = true;
    for (const auto& p : pts) {
        if (crossProduct(pts[0], pts[1], p) != 0) {
            allCollinear = false;
            break;
        }
    }
    if (allCollinear) {
        Point lo = pts[0], hi = pts[0];
        for (const auto& p : pts) {
            if (lexLess(p, lo)) lo = p;
            if (lexLess(hi, p)) hi = p;
        }
        return {lo, hi};
    }

    // Drop vertices that lie on an edge (zero turn), including across the wrap-around
    std::vector<Point> out;
    for (const auto& p : pts) {
        while (out.size() >= 2 && crossProduct(out[out.size() - 2], out.back(), p) == 0) {
            out.pop_back();
        }
        out.push_back(p);
    }
    while (out.size() >= 3 && crossProduct(out[out.size() - 2], out.back(), out.front()) == 0) {
        out.pop_back();
    }
    while (out.size() >= 3 && crossProduct(out.back(), out[0], out[1]) == 0) {
        out.erase(out.begin());
    }
    return out;
}

// Diameter of a convex polygon given in order (either orientation). For the edge (i, i+1)
// the pointer j moves to the vertex farthest from that edge, measured by triangle area; the
// farthest pair is always one of the antipodal pairs this produces.
DiameterResult rotatingCalipersDiameter(const std::vector<Point>& hull) {
    std::vector<Point> pts = cleanPolygon(hull);
    if (pts.empty()) {
        return {0.0, Point(0, 0), Point(0, 0)};
    }
    if (pts.size() == 1) {
        return {0.0, pts[0], pts[0]};
    }
    if (pts.size() == 2) {
        return {distance(pts[0], pts[1]), pts[0], pts[1]};
    }

    int n = pts.size();
    double max_dist = -1.0;
    Point p1 = pts[0], p2 = pts[1];

    int j = 1;
    for (int i = 0; i < n; i++) {
        int next_i = (i + 1) % n;

        // Advance j to the vertex farthest from the edge (i, i+1)
        while (true) {
            int next_j = (j + 1) % n;
            if (std::abs(crossProduct(pts[i], pts[next_i], pts[next_j])) >
                std::abs(crossProduct(pts[i], pts[next_i], pts[j]))) {
                j = next_j;
            } else {
                break;
            }
        }

        // An edge parallel to (i, i+1) has two antipodal endpoints: j and j + 1
        int candidates[2] = {j, -1};
        int next_j = (j + 1) % n;
        if (std::abs(crossProduct(pts[i], pts[next_i], pts[next_j])) ==
            std::abs(crossProduct(pts[i], pts[next_i], pts[j]))) {
            candidates[1] = next_j;
        }

        for (int k : candidates) {
            if (k < 0) continue;
            for (int m : {i, next_i}) {
                double dist = distanceSquared(pts[m], pts[k]);
                if (dist > max_dist) {
                    max_dist = dist;
                    p1 = pts[m];
                    p2 = pts[k];
                }
            }
        }
    }

    return {std::sqrt(max_dist), p1, p2};
}

// Width of a convex polygon given in order (either orientation); 0 for fewer than three
// distinct corners (a point, a segment or collinear points).
double rotatingCalipersWidth(const std::vector<Point>& hull) {
    std::vector<Point> pts = cleanPolygon(hull);
    if (pts.size() < 3) {
        return 0.0;
    }

    int n = pts.size();
    double min_width = std::numeric_limits<double>::infinity();

    int j = 1;
    for (int i = 0; i < n; i++) {
        int next_i = (i + 1) % n;

        // Advance j to the vertex farthest from the edge (i, i+1)
        while (true) {
            int next_j = (j + 1) % n;
            if (std::abs(crossProduct(pts[i], pts[next_i], pts[next_j])) >
                std::abs(crossProduct(pts[i], pts[next_i], pts[j]))) {
                j = next_j;
            } else {
                break;
            }
        }

        // Distance from vertex j to the line through i and i+1
        double line_length = distance(pts[i], pts[next_i]);
        double width = std::abs(crossProduct(pts[i], pts[next_i], pts[j])) / line_length;
        min_width = std::min(min_width, width);
    }

    return min_width;
}

double rotatingCalipersPerimeter(const std::vector<Point>& hull) {
    if (hull.size() < 2) {
        return 0.0;
    }

    double perimeter = 0.0;
    int n = hull.size();
    
    for (int i = 0; i < n; i++) {
        int next_i = (i + 1) % n;
        double dx = hull[next_i].x - hull[i].x;
        double dy = hull[next_i].y - hull[i].y;
        perimeter += std::sqrt(dx * dx + dy * dy);
    }
    
    return perimeter;
}

double rotatingCalipersArea(const std::vector<Point>& hull) {
    if (hull.size() < 3) {
        return 0.0;
    }

    double area = 0.0;
    int n = hull.size();
    
    for (int i = 0; i < n; i++) {
        int j = (i + 1) % n;
        area += hull[i].x * hull[j].y;
        area -= hull[j].x * hull[i].y;
    }
    
    return std::abs(area) / 2.0;
}

#ifndef IS_TEST_BUILD
int main() {
    std::cout << "Rotating Calipers Examples:" << std::endl;
    std::cout << std::endl;

    std::vector<Point> hull = {
        {0, 0}, {4, 0}, {4, 3}, {0, 3}
    };

    std::cout << "Convex hull: ";
    for (const auto& p : hull) {
        std::cout << "(" << p.x << "," << p.y << ") ";
    }
    std::cout << std::endl << std::endl;

    auto diameter_result = rotatingCalipersDiameter(hull);
    std::cout << "Diameter: " << std::fixed << std::setprecision(2) 
              << diameter_result.dist << std::endl;
    std::cout << "Between points: (" << diameter_result.p1.x << "," << diameter_result.p1.y
              << ") and (" << diameter_result.p2.x << "," << diameter_result.p2.y << ")" << std::endl;
    std::cout << std::endl;

    double width = rotatingCalipersWidth(hull);
    std::cout << "Width: " << width << std::endl;
    std::cout << std::endl;

    double perimeter = rotatingCalipersPerimeter(hull);
    std::cout << "Perimeter: " << perimeter << std::endl;
    std::cout << std::endl;

    double area = rotatingCalipersArea(hull);
    std::cout << "Area: " << area << std::endl;

    return 0;
}
#endif  // !IS_TEST_BUILD
