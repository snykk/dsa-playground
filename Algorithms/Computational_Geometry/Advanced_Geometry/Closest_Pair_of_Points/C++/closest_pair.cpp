/**
 * Closest Pair of Points Implementation (C++)
 * 
 * Finds closest pair of points using divide and conquer
 * Time Complexity: O(n log n)
 */

#include <vector>
#include <algorithm>
#include <cmath>
#include <limits>
#include <stdexcept>

struct Point {
    double x, y;
    Point(double x = 0, double y = 0) : x(x), y(y) {}
};

double distance(const Point& p1, const Point& p2) {
    double dx = p1.x - p2.x;
    double dy = p1.y - p2.y;
    return std::sqrt(dx * dx + dy * dy);
}

struct Result {
    double dist;
    Point p1, p2;
};

Result bruteForceClosestPair(const std::vector<Point>& points, int start, int end) {
    double minDist = std::numeric_limits<double>::max();
    Point p1, p2;
    
    for (int i = start; i < end; ++i) {
        for (int j = i + 1; j < end; ++j) {
            double dist = distance(points[i], points[j]);
            if (dist < minDist) {
                minDist = dist;
                p1 = points[i];
                p2 = points[j];
            }
        }
    }
    
    return {minDist, p1, p2};
}

// A point together with its position in the x-sorted order. The rank decides which half a
// point belongs to, so repeated x values and duplicate points are split exactly like pointsX.
struct Ranked {
    Point p;
    int rank;
};

Result closestPairRecursive(const std::vector<Point>& pointsX, const std::vector<Ranked>& pointsY, int start, int end) {
    int n = end - start;
    
    // Base case: use brute force for small sets
    if (n <= 3) {
        return bruteForceClosestPair(pointsX, start, end);
    }
    
    // Divide: split points into left and right halves
    int mid = start + n / 2;
    Point midPoint = pointsX[mid];
    
    // Split pointsY maintaining y-sort. Split by rank, not by x <= mid.x: with repeated
    // x values the two lists would no longer match the two halves.
    std::vector<Ranked> leftY, rightY;
    for (const auto& r : pointsY) {
        if (r.rank < mid) {
            leftY.push_back(r);
        } else {
            rightY.push_back(r);
        }
    }
    
    // Conquer: find closest pair in each half
    Result leftResult = closestPairRecursive(pointsX, leftY, start, mid);
    Result rightResult = closestPairRecursive(pointsX, rightY, mid, end);
    
    // Find minimum distance from both halves
    Result minResult = (leftResult.dist < rightResult.dist) ? leftResult : rightResult;
    double minDist = minResult.dist;
    
    // Combine: check for closer pairs across the dividing line
    std::vector<Point> strip;
    for (const auto& r : pointsY) {
        if (std::abs(r.p.x - midPoint.x) < minDist) {
            strip.push_back(r.p);
        }
    }
    
    // Check points in strip (at most 6 points need to be checked per point)
    for (size_t i = 0; i < strip.size(); ++i) {
        for (size_t j = i + 1; j < strip.size() && (strip[j].y - strip[i].y) < minDist; ++j) {
            double dist = distance(strip[i], strip[j]);
            if (dist < minDist) {
                minDist = dist;
                minResult = {dist, strip[i], strip[j]};
            }
        }
    }
    
    return minResult;
}

Result closestPair(std::vector<Point>& points) {
    if (points.size() < 2) {
        throw std::invalid_argument("Need at least 2 points");
    }
    
    // Sort points by x-coordinate
    std::vector<Point> pointsX = points;
    std::sort(pointsX.begin(), pointsX.end(), 
              [](const Point& a, const Point& b) { 
                  return a.x < b.x || (a.x == b.x && a.y < b.y); 
              });
    
    // Rank every point by its position in the x order, then sort the ranked points by y
    std::vector<Ranked> pointsY;
    for (size_t i = 0; i < pointsX.size(); ++i) {
        pointsY.push_back({pointsX[i], (int)i});
    }
    std::sort(pointsY.begin(), pointsY.end(), 
              [](const Ranked& a, const Ranked& b) { 
                  if (a.p.y != b.p.y) return a.p.y < b.p.y;
                  if (a.p.x != b.p.x) return a.p.x < b.p.x;
                  return a.rank < b.rank;
              });
    
    return closestPairRecursive(pointsX, pointsY, 0, pointsX.size());
}
