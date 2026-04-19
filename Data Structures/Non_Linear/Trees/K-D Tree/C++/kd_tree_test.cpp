#include "kd_tree.h"

#include <algorithm>
#include <cassert>
#include <iostream>
#include <random>
#include <vector>

using Point2D = std::array<double, 2>;
using Point3D = std::array<double, 3>;

Point2D bruteNearest2D(const std::vector<Point2D>& pts, const Point2D& q) {
    Point2D best = pts[0];
    double bd = (pts[0][0] - q[0]) * (pts[0][0] - q[0]) +
                (pts[0][1] - q[1]) * (pts[0][1] - q[1]);
    for (const auto& p : pts) {
        double d = (p[0] - q[0]) * (p[0] - q[0]) + (p[1] - q[1]) * (p[1] - q[1]);
        if (d < bd) {
            bd = d;
            best = p;
        }
    }
    return best;
}

void testEmpty() {
    KDTree<2> tree;
    assert(!tree.nearest({0, 0}).has_value());
}

void testSinglePoint() {
    KDTree<2> tree({{{5.0, 5.0}}});
    auto r = tree.nearest({0.0, 0.0});
    assert(r.has_value() && r.value()[0] == 5.0);
}

void testTextbook2D() {
    std::vector<Point2D> pts = {{{7, 2}}, {{5, 4}}, {{9, 6}},
                                {{2, 3}}, {{4, 7}}, {{8, 1}}};
    KDTree<2> tree(pts);
    auto r = tree.nearest({6, 5});
    assert(r.has_value());
    assert(r.value()[0] == 5 && r.value()[1] == 4);
}

void testNearestIsSelf() {
    std::vector<Point2D> pts = {{{1, 1}}, {{2, 2}}, {{3, 3}}};
    KDTree<2> tree(pts);
    auto r = tree.nearest({2, 2});
    assert(r.has_value() && r.value()[0] == 2 && r.value()[1] == 2);
}

void testRandom2DAgainstBrute() {
    std::mt19937 rng(42);
    std::uniform_real_distribution<double> coord(-100, 100);
    std::vector<Point2D> pts;
    for (int i = 0; i < 100; ++i) {
        pts.push_back({{coord(rng), coord(rng)}});
    }
    KDTree<2> tree(pts);
    for (int i = 0; i < 50; ++i) {
        Point2D q = {{coord(rng), coord(rng)}};
        auto got = tree.nearest(q).value();
        auto want = bruteNearest2D(pts, q);
        assert(got[0] == want[0] && got[1] == want[1]);
    }
}

void testIncrementalInsert() {
    KDTree<2> tree({{{5, 5}}});
    tree.insert({{1, 1}});
    tree.insert({{9, 9}});
    auto low = tree.nearest({0, 0}).value();
    auto high = tree.nearest({10, 10}).value();
    assert(low[0] == 1 && low[1] == 1);
    assert(high[0] == 9 && high[1] == 9);
}

void testRangeSearch() {
    std::vector<Point2D> pts = {{{1, 1}}, {{2, 2}}, {{3, 3}}, {{10, 10}}};
    KDTree<2> tree(pts);
    auto in_range = tree.rangeSearch({0, 0}, {5, 5});
    assert(in_range.size() == 3);
    auto empty = tree.rangeSearch({20, 20}, {30, 30});
    assert(empty.empty());
}

void testRange3D() {
    std::vector<Point3D> pts = {
        {{1, 1, 1}}, {{2, 2, 2}}, {{3, 3, 3}}, {{10, 10, 10}}};
    KDTree<3> tree(pts);
    auto in_range = tree.rangeSearch({0, 0, 0}, {5, 5, 5});
    assert(in_range.size() == 3);
}

int main() {
    testEmpty();
    testSinglePoint();
    testTextbook2D();
    testNearestIsSelf();
    testRandom2DAgainstBrute();
    testIncrementalInsert();
    testRangeSearch();
    testRange3D();
    std::cout << "All 8 tests passed!" << std::endl;
    return 0;
}
