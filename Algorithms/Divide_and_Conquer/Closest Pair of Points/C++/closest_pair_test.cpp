/**
 * Test cases for Closest Pair of Points (C++)
 */

#include <iostream>
#include <vector>
#include <cassert>
#include <iomanip>
#include <random>
#include "closest_pair.cpp"

static double bruteDistance(const std::vector<Point>& pts) {
    double best = std::numeric_limits<double>::max();
    for (size_t i = 0; i < pts.size(); i++)
        for (size_t j = i + 1; j < pts.size(); j++)
            best = std::min(best, distance(pts[i], pts[j]));
    return best;
}

static bool contains(const std::vector<Point>& pts, const Point& p) {
    for (const auto& q : pts) {
        if (q.x == p.x && q.y == p.y) return true;
    }
    return false;
}

void testTwoPoints() {
    std::vector<Point> points = {{0, 0}, {1, 1}};
    Result result = closestPair(points);
    double expected = distance({0, 0}, {1, 1});
    assert(std::abs(result.dist - expected) < 1e-5);
    std::cout << "Two points test passed" << std::endl;
}

void testSquare() {
    std::vector<Point> points = {{0, 0}, {1, 0}, {0, 1}, {1, 1}};
    Result result = closestPair(points);
    assert(std::abs(result.dist - 1.0) < 1e-5);
    std::cout << "Square test passed" << std::endl;
}

void testHorizontalLine() {
    std::vector<Point> points = {{0, 0}, {1, 0}, {2, 0}, {3, 0}};
    Result result = closestPair(points);
    assert(std::abs(result.dist - 1.0) < 1e-5);
    std::cout << "Horizontal line test passed" << std::endl;
}

void testDuplicatePoints() {
    std::vector<Point> points = {{5, 5}, {1, 1}, {9, 2}, {5, 5}, {7, 7}};
    Result result = closestPair(points);
    assert(result.dist == 0);
    std::vector<Point> same(6, Point(3, 3));
    assert(closestPair(same).dist == 0);
    std::cout << "Duplicate points test passed" << std::endl;
}

void testNegativeCoordinatesAndSharedX() {
    std::vector<Point> points = {{-3, -4}, {-3, 10}, {-3, 4}, {-3, 5}, {2, -9}, {-7, 0}};
    Result result = closestPair(points);
    assert(std::abs(result.dist - 1.0) < 1e-9);
    assert(std::abs(distance(result.p1, result.p2) - result.dist) < 1e-9);
    std::cout << "Negative coordinates test passed" << std::endl;
}

void testTooFewPoints() {
    std::vector<Point> one = {{1, 1}};
    bool thrown = false;
    try {
        closestPair(one);
    } catch (const std::invalid_argument&) {
        thrown = true;
    }
    assert(thrown);
    std::cout << "Too few points test passed" << std::endl;
}

void testRandomPointsMatchBruteForce() {
    std::mt19937 rng(42);
    int spans[] = {1, 2, 3, 5, 10, 100};
    for (int iter = 0; iter < 1500; iter++) {
        int span = spans[rng() % 6];
        int n = 2 + rng() % 39;
        std::vector<Point> points;
        for (int i = 0; i < n; i++) {
            points.push_back(Point((int)(rng() % (2 * span + 1)) - span, (int)(rng() % (2 * span + 1)) - span));
        }
        Result result = closestPair(points);
        assert(std::abs(result.dist - bruteDistance(points)) < 1e-12);
        assert(std::abs(distance(result.p1, result.p2) - result.dist) < 1e-12);
        assert(contains(points, result.p1) && contains(points, result.p2));
    }
    std::cout << "Random points test passed" << std::endl;
}

int main() {
    std::cout << "Running Closest Pair of Points tests..." << std::endl;
    std::cout << std::fixed << std::setprecision(5);
    
    testTwoPoints();
    testSquare();
    testHorizontalLine();
    testDuplicatePoints();
    testNegativeCoordinatesAndSharedX();
    testTooFewPoints();
    testRandomPointsMatchBruteForce();
    
    std::cout << "\nAll tests passed!" << std::endl;
    return 0;
}
