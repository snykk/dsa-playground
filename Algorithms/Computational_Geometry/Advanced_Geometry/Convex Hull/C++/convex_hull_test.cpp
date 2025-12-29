#include <cassert>
#include <vector>
#include "convex_hull.cpp"

void testGrahamScan() {
    std::vector<Point> points = {
        {0, 0}, {1, 1}, {2, 0}, {1, 0.5}
    };
    auto hull = grahamScan(points);
    assert(hull.size() >= 3);
}

void testJarvisMarch() {
    std::vector<Point> points = {
        {0, 0}, {1, 1}, {2, 0}, {1, 0.5}
    };
    auto hull = jarvisMarch(points);
    assert(hull.size() >= 3);
}

void testSquare() {
    std::vector<Point> points = {
        {0, 0}, {1, 0}, {1, 1}, {0, 1}, {0.5, 0.5}
    };
    auto graham_hull = grahamScan(points);
    auto jarvis_hull = jarvisMarch(points);
    assert(graham_hull.size() == 4);
    assert(jarvis_hull.size() == 4);
}

int main() {
    testGrahamScan();
    testJarvisMarch();
    testSquare();
    std::cout << "All tests passed!" << std::endl;
    return 0;
}
