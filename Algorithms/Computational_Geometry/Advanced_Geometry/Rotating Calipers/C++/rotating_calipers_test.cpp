#include <algorithm>
#include <cassert>
#include <cmath>
#include <random>
#include <set>
#include <utility>
#include <vector>
#include "rotating_calipers.cpp"

typedef std::pair<int, int> IP;

static long long crossIP(const IP& o, const IP& a, const IP& b) {
    return (long long)(a.first - o.first) * (b.second - o.second) - (long long)(a.second - o.second) * (b.first - o.first);
}

// Strict counterclockwise hull of integer points (exact reference).
static std::vector<IP> monotoneChain(std::vector<IP> pts) {
    std::sort(pts.begin(), pts.end());
    pts.erase(std::unique(pts.begin(), pts.end()), pts.end());
    if (pts.size() < 3) return pts;
    std::vector<IP> lower, upper;
    for (const auto& p : pts) {
        while (lower.size() > 1 && crossIP(lower[lower.size() - 2], lower.back(), p) <= 0) lower.pop_back();
        lower.push_back(p);
    }
    for (int i = (int)pts.size() - 1; i >= 0; i--) {
        while (upper.size() > 1 && crossIP(upper[upper.size() - 2], upper.back(), pts[i]) <= 0) upper.pop_back();
        upper.push_back(pts[i]);
    }
    lower.pop_back();
    upper.pop_back();
    lower.insert(lower.end(), upper.begin(), upper.end());
    return lower;
}

static double bruteDiameter(const std::vector<IP>& pts) {
    double best = 0;
    for (const auto& a : pts)
        for (const auto& b : pts)
            best = std::max(best, std::hypot((double)(a.first - b.first), (double)(a.second - b.second)));
    return best;
}

static double bruteWidth(const std::vector<IP>& h) {
    if (h.size() < 3) return 0.0;
    double best = INFINITY;
    for (size_t i = 0; i < h.size(); i++) {
        IP a = h[i], b = h[(i + 1) % h.size()];
        double len = std::hypot((double)(b.first - a.first), (double)(b.second - a.second));
        double far = 0;
        for (const auto& p : h) far = std::max(far, (double)std::llabs(crossIP(a, b, p)));
        best = std::min(best, far / len);
    }
    return best;
}

static std::vector<Point> toPoints(const std::vector<IP>& v) {
    std::vector<Point> out;
    for (const auto& p : v) out.push_back(Point(p.first, p.second));
    return out;
}

static std::vector<Point> square() { return {{0, 0}, {4, 0}, {4, 3}, {0, 3}}; }

void testDiameter() {
    auto result = rotatingCalipersDiameter(square());
    assert(std::abs(result.dist - 5.0) < 1e-9);  // Diagonal of rectangle
}

void testWidth() {
    assert(std::abs(rotatingCalipersWidth(square()) - 3.0) < 1e-9);  // The shorter side
}

void testPerimeter() {
    assert(std::abs(rotatingCalipersPerimeter(square()) - 14.0) < 1e-9);
}

void testArea() {
    assert(std::abs(rotatingCalipersArea(square()) - 12.0) < 1e-9);
}

void testDiameterFanHullIsNotALocalMaximum() {
    // A vertex-to-vertex hill climb stops at 104.96 (pair 0-1); the true diameter is 104.98
    std::vector<Point> hull = {{0, 0}, {104.8, 5.8}, {103.3, 18.1}, {102.9, 20.8}, {89.7, 52.4}, {88.8, 52.0}};
    auto result = rotatingCalipersDiameter(hull);
    assert(std::abs(result.dist - 104.98118879113534) < 1e-9);
}

void testWidthWithCollinearOrRepeatedVertices() {
    std::vector<Point> collinear = {{0, 0}, {2, 0}, {4, 0}, {4, 3}, {0, 3}};
    assert(std::abs(rotatingCalipersWidth(collinear) - 3.0) < 1e-9);
    std::vector<Point> repeated = {{0, 0}, {4, 0}, {4, 0}, {4, 3}, {0, 3}};
    assert(std::abs(rotatingCalipersWidth(repeated) - 3.0) < 1e-9);
    assert(std::abs(rotatingCalipersDiameter(collinear).dist - 5.0) < 1e-9);
}

void testDegenerateInputs() {
    std::vector<Point> same = {{1, 1}, {1, 1}, {1, 1}};
    assert(rotatingCalipersWidth(same) == 0.0);
    assert(rotatingCalipersDiameter(same).dist == 0.0);
    assert(rotatingCalipersDiameter({}).dist == 0.0);
    std::vector<Point> segment = {{0, 0}, {1, 1}, {3, 3}};
    assert(rotatingCalipersWidth(segment) == 0.0);
    assert(std::abs(rotatingCalipersDiameter(segment).dist - 3 * std::sqrt(2.0)) < 1e-9);
}

void testTriangle() {
    std::vector<Point> hull = {{0, 0}, {4, 0}, {0, 3}};
    assert(std::abs(rotatingCalipersWidth(hull) - 2.4) < 1e-9);
    assert(std::abs(rotatingCalipersDiameter(hull).dist - 5.0) < 1e-9);
}

void testClockwiseAndCounterclockwiseAgree() {
    std::vector<Point> hull = {{0, 0}, {4, 0}, {5, 2}, {2, 5}, {-1, 3}};
    std::vector<Point> rev(hull.rbegin(), hull.rend());
    assert(std::abs(rotatingCalipersDiameter(hull).dist - rotatingCalipersDiameter(rev).dist) < 1e-9);
    assert(std::abs(rotatingCalipersWidth(hull) - rotatingCalipersWidth(rev)) < 1e-9);
}

void testRandomPolygonsMatchBruteForce() {
    std::mt19937 rng(7);
    int spans[] = {2, 3, 5, 10, 100};
    for (int iter = 0; iter < 500; iter++) {
        int span = spans[rng() % 5];
        int n = 1 + rng() % 14;
        std::vector<IP> raw;
        for (int i = 0; i < n; i++) {
            raw.push_back({(int)(rng() % (2 * span + 1)) - span, (int)(rng() % (2 * span + 1)) - span});
        }
        std::vector<IP> hull = monotoneChain(raw);
        if (rng() % 2) std::reverse(hull.begin(), hull.end());
        std::vector<IP> noisy;
        for (size_t i = 0; i < hull.size(); i++) {
            noisy.push_back(hull[i]);
            IP q = hull[(i + 1) % hull.size()];
            if (hull.size() >= 3 && (hull[i].first + q.first) % 2 == 0 && (hull[i].second + q.second) % 2 == 0 && rng() % 10 < 3) {
                noisy.push_back({(hull[i].first + q.first) / 2, (hull[i].second + q.second) / 2});
            }
            if (rng() % 10 < 2) noisy.push_back(hull[i]);
        }
        std::vector<IP> rawUnique = raw;
        std::sort(rawUnique.begin(), rawUnique.end());
        rawUnique.erase(std::unique(rawUnique.begin(), rawUnique.end()), rawUnique.end());
        auto result = rotatingCalipersDiameter(toPoints(noisy));
        assert(std::abs(result.dist - bruteDiameter(rawUnique)) < 1e-9);
        assert(std::abs(distance(result.p1, result.p2) - result.dist) < 1e-9);
        assert(std::abs(rotatingCalipersWidth(toPoints(noisy)) - bruteWidth(monotoneChain(raw))) < 1e-9);
    }
}

int main() {
    testDiameter();
    testWidth();
    testPerimeter();
    testArea();
    testDiameterFanHullIsNotALocalMaximum();
    testWidthWithCollinearOrRepeatedVertices();
    testDegenerateInputs();
    testTriangle();
    testClockwiseAndCounterclockwiseAgree();
    testRandomPolygonsMatchBruteForce();
    std::cout << "All tests passed!" << std::endl;
    return 0;
}
