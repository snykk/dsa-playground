#include "cht.h"

#include <algorithm>
#include <cassert>
#include <iostream>
#include <random>
#include <utility>
#include <vector>

using LinePair = std::pair<long long, long long>;  // (m, b)

long long bruteMin(const std::vector<LinePair>& lines, long long x) {
    long long best = lines[0].first * x + lines[0].second;
    for (auto& [m, b] : lines) {
        best = std::min(best, m * x + b);
    }
    return best;
}

void testMonotonicClassic() {
    MonotonicCHT cht;
    std::vector<LinePair> lines = {{2, 5}, {1, 3}, {-1, 7}};
    for (auto& [m, b] : lines) cht.addLine(m, b);
    for (long long x : {0LL, 1LL, 2LL, 3LL, 5LL, 10LL}) {
        assert(cht.query(x) == bruteMin(lines, x));
    }
}

void testMonotonicRandom() {
    std::mt19937 rng(7);
    std::vector<LinePair> lines;
    long long m = 100;
    for (int i = 0; i < 30; ++i) {
        m -= 1 + (rng() % 5);
        long long b = (long long)(rng() % 201) - 100;
        lines.push_back({m, b});
    }
    MonotonicCHT cht;
    for (auto& l : lines) cht.addLine(l.first, l.second);
    for (long long x = -20; x <= 100; ++x) {
        assert(cht.query(x) == bruteMin(lines, x));
    }
}

void testMonotonicEqualSlopes() {
    // Regression: the middle line {2, 1} used to be dropped
    MonotonicCHT cht;
    for (auto& l : std::vector<LinePair>{{2, 5}, {2, 1}, {2, 3}}) cht.addLine(l.first, l.second);
    assert(cht.query(0) == 1);

    std::mt19937 rng(11);
    for (int round = 0; round < 300; ++round) {
        std::vector<LinePair> lines;
        long long m = 20;
        int count = 1 + (int)(rng() % 12);
        for (int i = 0; i < count; ++i) {
            m -= (long long)(rng() % 4);  // 0 allowed: equal slopes
            lines.push_back({m, (long long)(rng() % 61) - 30});
        }
        MonotonicCHT c;
        for (auto& l : lines) c.addLine(l.first, l.second);
        for (long long x = -15; x <= 15; ++x) assert(c.query(x) == bruteMin(lines, x));
    }
}

void testLiChaoClassic() {
    LiChaoTree lc(-20, 20);
    std::vector<LinePair> lines = {{2, 5}, {1, 3}, {-1, 7}, {3, -2}, {0, 8}};
    for (auto& [m, b] : lines) lc.addLine(m, b);
    for (long long x : {-10LL, -5LL, 0LL, 3LL, 10LL}) {
        assert(lc.query(x) == bruteMin(lines, x));
    }
}

void testLiChaoArbitraryOrder() {
    std::mt19937 rng(42);
    std::vector<LinePair> lines;
    for (int i = 0; i < 50; ++i) {
        long long m = (long long)(rng() % 21) - 10;
        long long b = (long long)(rng() % 101) - 50;
        lines.push_back({m, b});
    }
    LiChaoTree lc(-100, 100);
    for (auto& l : lines) lc.addLine(l.first, l.second);
    for (int i = 0; i < 20; ++i) {
        long long x = (long long)(rng() % 201) - 100;
        assert(lc.query(x) == bruteMin(lines, x));
    }
}

int main() {
    testMonotonicClassic();
    testMonotonicRandom();
    testMonotonicEqualSlopes();
    testLiChaoClassic();
    testLiChaoArbitraryOrder();
    std::cout << "All 5 tests passed!" << std::endl;
    return 0;
}
