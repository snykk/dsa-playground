#include <cassert>
#include <random>
#include <set>
#include <utility>
#include <vector>
#include "convex_hull.cpp"

typedef std::pair<double, double> XY;

static long long crossXY(const XY& o, const XY& a, const XY& b) {
    return (long long)((a.first - o.first) * (b.second - o.second) - (a.second - o.second) * (b.first - o.first));
}

// Set of strict hull vertices of integer points, by supporting lines: O(n^3).
static std::set<XY> bruteForceHull(const std::vector<XY>& raw) {
    std::set<XY> uniq(raw.begin(), raw.end());
    std::vector<XY> pts(uniq.begin(), uniq.end());
    if (pts.size() < 3) return uniq;
    std::set<XY> result;
    for (const auto& a : pts) {
        for (const auto& b : pts) {
            if (a == b) continue;
            bool ok = true;
            for (const auto& c : pts) {
                if (crossXY(a, b, c) < 0) { ok = false; break; }
            }
            if (!ok) continue;
            XY lo = a, hi = a;
            for (const auto& c : pts) {
                if (crossXY(a, b, c) == 0) {
                    if (c < lo) lo = c;
                    if (c > hi) hi = c;
                }
            }
            result.insert(lo);
            result.insert(hi);
        }
    }
    return result;
}

static std::vector<XY> toXY(const std::vector<Point>& hull) {
    std::vector<XY> out;
    for (const auto& p : hull) out.push_back({p.x, p.y});
    return out;
}

static bool isCcwStrictlyConvex(const std::vector<XY>& h) {
    size_t n = h.size();
    if (n < 3) return true;
    for (size_t i = 0; i < n; i++) {
        if (crossXY(h[i], h[(i + 1) % n], h[(i + 2) % n]) <= 0) return false;
    }
    return true;
}

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

void testDuplicatesAndFewPoints() {
    for (int algo = 0; algo < 2; algo++) {
        auto run = [&](std::vector<Point> p) { return algo == 0 ? grahamScan(p) : jarvisMarch(p); };
        assert(run({}).empty());
        assert(run({{1, 1}}).size() == 1);
        assert(run({{1, 1}, {1, 1}}).size() == 1);
        assert(run({{1, 1}, {2, 2}, {1, 1}}).size() == 2);
    }
}

// Fewer than three distinct points come back sorted: by (y, x) in Graham's scan, by (x, y)
// in Jarvis march, as documented.
void testFewerThanThreePointsComeBackSorted() {
    std::vector<Point> two = {{0, 2}, {1, 0}, {0, 2}};
    assert(toXY(grahamScan(two)) == (std::vector<XY>{{1, 0}, {0, 2}}));
    assert(toXY(jarvisMarch(two)) == (std::vector<XY>{{0, 2}, {1, 0}}));
}

void testAllCollinearReturnsTheTwoEnds() {
    std::vector<Point> points;
    for (int i : {3, 0, 1, 2, 5, 4}) points.push_back({(double)i, (double)(2 * i)});
    for (int algo = 0; algo < 2; algo++) {
        auto hull = toXY(algo == 0 ? grahamScan(points) : jarvisMarch(points));
        assert(std::set<XY>(hull.begin(), hull.end()) == (std::set<XY>{{0, 0}, {5, 10}}));
    }
}

void testCollinearBoundaryPointsAreExcluded() {
    std::vector<Point> points = {{0, 0}, {1, 0}, {2, 0}, {2, 1}, {2, 2}, {1, 2}, {0, 2}, {0, 1}, {1, 1}};
    std::set<XY> corners = {{0, 0}, {2, 0}, {2, 2}, {0, 2}};
    for (int algo = 0; algo < 2; algo++) {
        auto hull = toXY(algo == 0 ? grahamScan(points) : jarvisMarch(points));
        assert(std::set<XY>(hull.begin(), hull.end()) == corners && hull.size() == 4);
    }
}

void testCounterclockwiseAndStartPoint() {
    std::vector<Point> points = {{0, 3}, {2, 2}, {1, 1}, {2, 1}, {3, 0}, {0, 0}, {3, 3}};
    std::vector<XY> expected = {{0, 0}, {3, 0}, {3, 3}, {0, 3}};
    assert(toXY(grahamScan(points)) == expected);
    assert(toXY(jarvisMarch(points)) == expected);
}

void testJarvisMarchTerminatesAtTinyScale() {
    std::vector<Point> points = {{0, 0}, {1e-5, 0}, {1e-5, 1e-5}, {0, 1e-5}};
    assert(jarvisMarch(points).size() == 4);
    assert(grahamScan(points).size() == 4);
}

void testGrahamScanNearlyCollinearWedge() {
    std::vector<Point> points = {{0, 0}, {0, 1000}, {466.370713928512, 466.3706574269199},
                                 {704.4545702063141, 704.4544815105265},
                                 {495.26698782658025, 495.2669272784684}};
    assert(grahamScan(points).size() == 3);
    assert(jarvisMarch(points).size() == 3);
}

void testRandomIntegerPointsMatchBruteForce() {
    std::mt19937 rng(2024);
    int spans[] = {1, 2, 3, 5, 10, 50};
    for (int iter = 0; iter < 400; iter++) {
        int span = spans[rng() % 6];
        int n = rng() % 26;
        std::vector<XY> raw;
        std::vector<Point> points;
        for (int i = 0; i < n; i++) {
            int x = (int)(rng() % (2 * span + 1)) - span;
            int y = (int)(rng() % (2 * span + 1)) - span;
            raw.push_back({(double)x, (double)y});
            points.push_back({(double)x, (double)y});
        }
        auto expected = bruteForceHull(raw);
        for (int algo = 0; algo < 2; algo++) {
            auto hull = toXY(algo == 0 ? grahamScan(points) : jarvisMarch(points));
            std::set<XY> got(hull.begin(), hull.end());
            assert(got == expected);
            assert(got.size() == hull.size());
            assert(isCcwStrictlyConvex(hull));
        }
    }
}

int main() {
    testGrahamScan();
    testJarvisMarch();
    testSquare();
    testDuplicatesAndFewPoints();
    testFewerThanThreePointsComeBackSorted();
    testAllCollinearReturnsTheTwoEnds();
    testCollinearBoundaryPointsAreExcluded();
    testCounterclockwiseAndStartPoint();
    testJarvisMarchTerminatesAtTinyScale();
    testGrahamScanNearlyCollinearWedge();
    testRandomIntegerPointsMatchBruteForce();
    std::cout << "All tests passed!" << std::endl;
    return 0;
}
