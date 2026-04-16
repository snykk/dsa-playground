#include <iostream>
#include <vector>
#include <cmath>
#include <algorithm>
#include <limits>
#include <iomanip>

const double EPS = 1e-9;

struct Point {
    double x, y;
    Point(double x = 0, double y = 0) : x(x), y(y) {}
};

double crossProduct(const Point& o, const Point& a, const Point& b) {
    return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
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

DiameterResult rotatingCalipersDiameter(const std::vector<Point>& hull) {
    if (hull.size() < 2) {
        return {0.0, hull.empty() ? Point(0, 0) : hull[0], hull.empty() ? Point(0, 0) : hull[0]};
    }

    int n = hull.size();
    double max_dist = 0.0;
    Point p1 = hull[0], p2 = hull[1];

    int j = 1;
    for (int i = 0; i < n; i++) {
        while (true) {
            int next_j = (j + 1) % n;
            double dist_current = distanceSquared(hull[i], hull[j]);
            double dist_next = distanceSquared(hull[i], hull[next_j]);
            
            if (dist_next > dist_current) {
                j = next_j;
            } else {
                break;
            }
        }

        double dist = distanceSquared(hull[i], hull[j]);
        if (dist > max_dist) {
            max_dist = dist;
            p1 = hull[i];
            p2 = hull[j];
        }
    }

    return {std::sqrt(max_dist), p1, p2};
}

double rotatingCalipersWidth(const std::vector<Point>& hull) {
    if (hull.size() < 3) {
        return 0.0;
    }

    int n = hull.size();
    double min_width = std::numeric_limits<double>::max();

    int j = 1;
    for (int i = 0; i < n; i++) {
        int next_i = (i + 1) % n;
        
        while (true) {
            int next_j = (j + 1) % n;
            double area_next = std::abs(crossProduct(hull[i], hull[next_i], hull[next_j]));
            double area_current = std::abs(crossProduct(hull[i], hull[next_i], hull[j]));
            
            if (area_next > area_current) {
                j = next_j;
            } else {
                break;
            }
        }

        double dx = hull[next_i].x - hull[i].x;
        double dy = hull[next_i].y - hull[i].y;
        double line_length = std::sqrt(dx * dx + dy * dy);
        
        if (line_length > EPS) {
            double area = std::abs(crossProduct(hull[i], hull[next_i], hull[j]));
            double width = area / line_length;
            min_width = std::min(min_width, width);
        }
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

#ifndef TESTING
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
#endif
