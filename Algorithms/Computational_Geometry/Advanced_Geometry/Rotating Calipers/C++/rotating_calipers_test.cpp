#include <cassert>
#include <cmath>
#include <vector>
#include "rotating_calipers.cpp"

// EPS is already defined in rotating_calipers.cpp

void testDiameter() {
    std::vector<Point> hull = {{0, 0}, {4, 0}, {4, 3}, {0, 3}};
    auto result = rotatingCalipersDiameter(hull);
    assert(result.dist > 0);
    assert(std::abs(result.dist - 5.0) < 1.0);  // Diagonal of rectangle
}

void testWidth() {
    std::vector<Point> hull = {{0, 0}, {4, 0}, {4, 3}, {0, 3}};
    double width = rotatingCalipersWidth(hull);
    assert(width > 0);
    assert(width < 4);
}

void testPerimeter() {
    std::vector<Point> hull = {{0, 0}, {4, 0}, {4, 3}, {0, 3}};
    double perimeter = rotatingCalipersPerimeter(hull);
    assert(std::abs(perimeter - 14.0) < 1.0);
}

void testArea() {
    std::vector<Point> hull = {{0, 0}, {4, 0}, {4, 3}, {0, 3}};
    double area = rotatingCalipersArea(hull);
    assert(std::abs(area - 12.0) < 1.0);
}

int main() {
    testDiameter();
    testWidth();
    testPerimeter();
    testArea();
    std::cout << "All tests passed!" << std::endl;
    return 0;
}
