/**
 * Test cases for Closest Pair of Points (C++)
 */

#include <iostream>
#include <vector>
#include <cassert>
#include <iomanip>
#include "closest_pair.cpp"

void testTwoPoints() {
    std::vector<Point> points = {{0, 0}, {1, 1}};
    Result result = closestPair(points);
    double expected = distance({0, 0}, {1, 1});
    assert(std::abs(result.dist - expected) < 1e-5);
    std::cout << "✓ Two points test passed" << std::endl;
}

void testSquare() {
    std::vector<Point> points = {{0, 0}, {1, 0}, {0, 1}, {1, 1}};
    Result result = closestPair(points);
    assert(std::abs(result.dist - 1.0) < 1e-5);
    std::cout << "✓ Square test passed" << std::endl;
}

void testHorizontalLine() {
    std::vector<Point> points = {{0, 0}, {1, 0}, {2, 0}, {3, 0}};
    Result result = closestPair(points);
    assert(std::abs(result.dist - 1.0) < 1e-5);
    std::cout << "✓ Horizontal line test passed" << std::endl;
}

int main() {
    std::cout << "Running Closest Pair of Points tests..." << std::endl;
    std::cout << std::fixed << std::setprecision(5);
    
    testTwoPoints();
    testSquare();
    testHorizontalLine();
    
    std::cout << "\nAll tests passed! ✓" << std::endl;
    return 0;
}

