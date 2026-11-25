// Tests for knuth_optimization.cpp: the worked example, the narrowed DP against the plain one
// and brute force, the monotone split table, the two conditions on the cost and a cost that
// breaks them, the merges read back and their tie rule, the optimal binary search tree, edge
// cases, invalid input, overflow, the exact number of splits tried, and 40 + 20 + 16 cases
// pinned to the Python outputs.
#include <algorithm>
#include <array>
#include <cassert>
#include <climits>
#include <cstddef>
#include <iostream>
#include <random>
#include <stdexcept>
#include <string>
#include <utility>
#include <vector>

#include "knuth_optimization.cpp"

using Values = std::vector<long long>;
using Merges = std::vector<Merge>;
using Table = std::vector<std::vector<long long>>;
using SplitTable = std::vector<std::vector<int>>;

// The worked example of the README, the same row as Interval DP's.
const Values kPiles = {3, 2, 4, 1};

Values prefixOf(const Values& values) {
    Values prefix = {0};
    for (long long v : values) prefix.push_back(prefix.back() + v);
    return prefix;
}

// The plain interval DP, written out again: every k, a strict < so the smallest best k is kept.
template <typename Cost>
std::pair<Table, SplitTable> plainTables(int n, const Cost& cost) {
    Table dp(n, std::vector<long long>(n, 0));
    SplitTable split(n, std::vector<int>(n, -1));
    for (int length = 2; length <= n; ++length) {
        for (int i = 0; i + length - 1 < n; ++i) {
            const int j = i + length - 1;
            dp[i][j] = LLONG_MAX;
            for (int k = i; k < j; ++k) {
                const long long c = dp[i][k] + dp[k + 1][j] + cost(i, j);
                if (c < dp[i][j]) {
                    dp[i][j] = c;
                    split[i][j] = k;
                }
            }
        }
    }
    return {dp, split};
}

// Every order of merges: merge any two neighbours, then go on with the shorter row.
long long bruteMerge(const Values& piles) {
    if (piles.size() <= 1) return 0;
    long long best = LLONG_MAX;
    for (std::size_t t = 0; t + 1 < piles.size(); ++t) {
        Values next(piles.begin(), piles.begin() + t);
        next.push_back(piles[t] + piles[t + 1]);
        next.insert(next.end(), piles.begin() + t + 2, piles.end());
        best = std::min(best, piles[t] + piles[t + 1] + bruteMerge(next));
    }
    return best;
}

// Every binary search tree on the keys lo..hi-1: each key in turn as the root.
long long bruteBst(const Values& freq, int lo, int hi, long long depth) {
    if (lo >= hi) return 0;
    long long best = LLONG_MAX;
    for (int r = lo; r < hi; ++r) best = std::min(best, freq[r] * depth + bruteBst(freq, lo, r, depth + 1) + bruteBst(freq, r + 1, hi, depth + 1));
    return best;
}

// The square root of a small number, rounded down.
long long isqrt(long long v) {
    long long r = 0;
    while ((r + 1) * (r + 1) <= v) ++r;
    return r;
}

// The first (a, b, c, d) with a <= b <= c <= d < n that breaks the quadrangle inequality, or
// the monotonicity on intervals; {-1, -1, -1, -1} when there is none.
template <typename Cost>
std::array<int, 4> violation(int n, const Cost& cost, bool quadrangle) {
    for (int a = 0; a < n; ++a)
        for (int b = a; b < n; ++b)
            for (int c = b; c < n; ++c)
                for (int d = c; d < n; ++d) {
                    const bool bad = quadrangle ? cost(a, c) + cost(b, d) > cost(a, d) + cost(b, c) : cost(b, c) > cost(a, d);
                    if (bad) return {a, b, c, d};
                }
    return {-1, -1, -1, -1};
}

// The number of splits the windows hold, from the final split table, one diagonal at a time.
long long telescoped(const SplitTable& split, int n) {
    long long total = n >= 2 ? n - 1 : 0;
    for (int length = 3; length <= n; ++length) total += (n - length + 1) + split[n - length + 1][n - 1] - split[0][length - 2];
    return total;
}

// The most a fill can try: (3n^2 - 9n + 8) / 2 for n >= 2.
long long windowBound(long long n) { return n >= 2 ? (3 * n * n - 9 * n + 8) / 2 : 0; }

// Play the merges out on the row of piles: each one must join two neighbouring piles that are
// exactly i..k and k+1..j. Returns the total cost; one pile must be left.
long long applyMerges(const Values& piles, const Merges& merges) {
    std::vector<std::pair<int, int>> built;
    for (int t = 0; t < static_cast<int>(piles.size()); ++t) built.push_back({t, t});
    long long total = 0;
    for (const Merge& m : merges) {
        const auto p = std::find(built.begin(), built.end(), std::make_pair(m.i, m.k));
        assert(p != built.end() && p + 1 != built.end() && *(p + 1) == std::make_pair(m.k + 1, m.j));
        *p = {m.i, m.j};
        built.erase(p + 1);
        for (int t = m.i; t <= m.j; ++t) total += piles[t];
    }
    assert(built.size() == (piles.empty() ? 0u : 1u));
    return total;
}

Values randomValues(std::mt19937& rng, int maxN, int maxValue) {
    const int n = std::uniform_int_distribution<int>(0, maxN)(rng);
    Values v(n);
    for (long long& x : v) x = std::uniform_int_distribution<int>(0, maxValue)(rng);
    return v;
}

struct PileCost {
    Values prefix;
    long long operator()(int i, int j) const { return prefix[j + 1] - prefix[i]; }
};

struct RootCost {
    Values prefix;
    long long operator()(int i, int j) const { return isqrt(prefix[j + 1] - prefix[i]); }
};

template <typename E, typename F>
bool throws(F f) {
    try {
        f();
    } catch (const E&) {
        return true;
    }
    return false;
}

void testWorkedExample() {
    assert(mergePiles(kPiles) == 20);
    MergePlan plan = mergePilesPlan(kPiles);
    assert(plan.cost == 20 && plan.merges == Merges({{0, 0, 1}, {2, 2, 3}, {0, 1, 3}}));
    knuth_detail::Counters c;
    knuth_detail::Tables t = knuth_detail::fillMerge(kPiles, &c);
    assert(t.dp == Table({{0, 5, 14, 20}, {0, 0, 6, 12}, {0, 0, 0, 5}, {0, 0, 0, 0}}));
    assert(t.split == SplitTable({{-1, 0, 1, 1}, {-1, -1, 1, 1}, {-1, -1, -1, 2}, {-1, -1, -1, -1}}));
    assert(c.tries == 8);  // the plain DP tries 10: the top cell's window is k = 1 alone
    assert(splitDp(4, PileCost{prefixOf(kPiles)}) == 20);
    assert(optimalBst({34, 8, 50}) == 142 && optimalBst({34, 50}) == 118);
    knuth_detail::Tables bst = knuth_detail::fillBst({34, 8, 50});
    assert(bst.split[0][3] == 2 && bst.split[0][2] == 0);
    std::cout << "OK testWorkedExample" << std::endl;
}

void testAgainstThePlainDp() {
    std::mt19937 rng(1000);
    const int sizes[] = {1, 3, 9, 100, 1000000};
    for (int t = 0; t < 1500; ++t) {
        Values piles = randomValues(rng, 14, sizes[t % 5]);
        const int n = static_cast<int>(piles.size());
        knuth_detail::Tables got = knuth_detail::fillMerge(piles);
        std::pair<Table, SplitTable> want = plainTables(n, PileCost{prefixOf(piles)});
        assert(got.dp == want.first && got.split == want.second);
        assert(splitDp(n, PileCost{prefixOf(piles)}, false) == mergePiles(piles));
    }
    for (int t = 0; t < 400; ++t) {
        Values piles = randomValues(rng, 7, std::vector<int>{3, 9, 50}[t % 3]);
        assert(mergePiles(piles) == bruteMerge(piles));
    }
    std::cout << "OK testAgainstThePlainDp" << std::endl;
}

void testWindow() {
    std::mt19937 rng(1100);
    for (int t = 0; t < 800; ++t) {
        Values piles = randomValues(rng, 12, std::vector<int>{1, 5, 99}[t % 3]);
        const int n = static_cast<int>(piles.size());
        knuth_detail::Tables tables = knuth_detail::fillMerge(piles);
        for (int i = 0; i < n; ++i) {
            for (int j = i + 2; j < n; ++j) {
                assert(tables.split[i][j - 1] <= tables.split[i][j] && tables.split[i][j] <= tables.split[i + 1][j]);
            }
        }
        // The plain DP's smallest best k lies inside the window built from the plain table.
        SplitTable plain = plainTables(n, PileCost{prefixOf(piles)}).second;
        for (int i = 0; i < n; ++i) {
            for (int j = i + 1; j < n; ++j) {
                std::pair<int, int> w = knuth_detail::window(plain, i, j);
                assert(i <= w.first && w.first <= plain[i][j] && plain[i][j] <= w.second && w.second <= j - 1);
            }
        }
    }
    std::cout << "OK testWindow" << std::endl;
}

void testConditions() {
    std::mt19937 rng(1200);
    const std::array<int, 4> none = {-1, -1, -1, -1};
    for (int t = 0; t < 400; ++t) {
        Values piles = randomValues(rng, 9, std::vector<int>{1, 9, 1000}[t % 3]);
        const int n = static_cast<int>(piles.size());
        PileCost cost{prefixOf(piles)};
        assert(violation(n, cost, true) == none && violation(n, cost, false) == none);
        Values prefix = prefixOf(piles);
        auto bstCost = [&prefix](int i, int j) { return prefix[j] - prefix[i]; };  // optimalBst's, over n + 1 gaps
        assert(violation(n + 1, bstCost, true) == none && violation(n + 1, bstCost, false) == none);
    }
    // The square root of the merged size is monotone, but breaks the inequality at (0, 1, 2, 3):
    // C(0, 2) + C(1, 3) = 2 + 2 > C(0, 3) + C(1, 2) = 2 + 1. The window then misses the best split.
    RootCost root{prefixOf({1, 1, 2, 1, 6})};
    assert(violation(5, root, false) == none);
    const std::array<int, 4> at = {0, 1, 2, 3};
    assert(violation(5, root, true) == at);
    assert(splitDp(5, root) == 8 && splitDp(5, root, false) == 7);
    knuth_detail::Tables narrowed = knuth_detail::fill(5, root, true);
    SplitTable plain = plainTables(5, root).second;
    assert(plain[0][4] == 3 && plain[0][3] == 1 && plain[1][4] == 2 && narrowed.split[0][4] == 1);
    std::cout << "OK testConditions" << std::endl;
}

void testPlan() {
    std::mt19937 rng(1547);
    for (int t = 0; t < 600; ++t) {
        Values piles = randomValues(rng, 12, std::vector<int>{2, 9, 100}[t % 3]);
        MergePlan plan = mergePilesPlan(piles);
        assert(plan.cost == mergePiles(piles));
        assert(plan.merges.size() == (piles.empty() ? 0 : piles.size() - 1));
        assert(applyMerges(piles, plan.merges) == plan.cost);  // the merges reach the value
    }
    // The tie rule: the smallest k that reaches the minimum, in every cell, from brute force.
    for (int t = 0; t < 250; ++t) {
        Values piles = randomValues(rng, 6, std::vector<int>{1, 2, 5}[t % 3]);
        knuth_detail::Tables tables = knuth_detail::fillMerge(piles);
        const int n = static_cast<int>(piles.size());
        for (int i = 0; i < n; ++i) {
            for (int j = i + 1; j < n; ++j) {
                long long sum = 0;
                for (int x = i; x <= j; ++x) sum += piles[x];
                const long long best = bruteMerge(Values(piles.begin() + i, piles.begin() + j + 1));
                int want = -1;
                for (int k = i; k < j && want < 0; ++k) {
                    if (bruteMerge(Values(piles.begin() + i, piles.begin() + k + 1)) + bruteMerge(Values(piles.begin() + k + 1, piles.begin() + j + 1)) + sum == best) want = k;
                }
                assert(tables.split[i][j] == want);
            }
        }
    }
    assert(mergePilesPlan({1, 1, 1, 1}).merges == Merges({{0, 0, 1}, {2, 2, 3}, {0, 1, 3}}));
    assert(mergePilesPlan({1, 1, 1}).merges == Merges({{1, 1, 2}, {0, 0, 2}}));
    assert(mergePilesPlan({0, 0, 0, 0}).merges == Merges({{2, 2, 3}, {1, 1, 3}, {0, 0, 3}}));
    std::cout << "OK testPlan" << std::endl;
}

void testOptimalBst() {
    std::mt19937 rng(1300);
    for (int t = 0; t < 400; ++t) {
        Values freq = randomValues(rng, 7, std::vector<int>{1, 9, 60}[t % 3]);
        assert(optimalBst(freq) == bruteBst(freq, 0, static_cast<int>(freq.size()), 1));
    }
    for (int t = 0; t < 300; ++t) {
        Values freq = randomValues(rng, 14, std::vector<int>{1, 9, 1000000}[t % 3]);
        Values prefix = prefixOf(freq);
        auto cost = [&prefix](int i, int j) { return prefix[j] - prefix[i]; };
        knuth_detail::Tables got = knuth_detail::fillBst(freq);
        std::pair<Table, SplitTable> want = plainTables(static_cast<int>(freq.size()) + 1, cost);
        assert(got.dp == want.first && got.split == want.second);
    }
    assert(optimalBst({}) == 0 && optimalBst({7}) == 7 && optimalBst({0, 0, 0}) == 0);
    assert(optimalBst({4, 9}) == 17 && optimalBst(Values(7, 5)) == 85);
    std::cout << "OK testOptimalBst" << std::endl;
}

void testEdgeCases() {
    auto one = [](int, int) { return 1LL; };
    assert(mergePiles({}) == 0 && mergePilesPlan({}).merges.empty() && mergePilesPlan({}).cost == 0 && splitDp(0, one) == 0);
    assert(mergePiles({7}) == 0 && mergePilesPlan({7}).merges.empty() && splitDp(1, one) == 0);
    MergePlan two = mergePilesPlan({4, 9});
    assert(two.cost == 13 && two.merges == Merges({{0, 0, 1}}) && splitDp(2, [](int, int) { return 5LL; }) == 5);
    assert(mergePiles(Values(8, 5)) == 120 && mergePiles(Values(64, 1)) == 384 && mergePiles({0, 0, 0}) == 0);
    // cost is called once per range of two points or more, by increasing length.
    std::vector<std::pair<int, int>> seen;
    splitDp(6, [&seen](int i, int j) {
        seen.push_back({i, j});
        return static_cast<long long>(j - i);
    });
    assert(seen.size() == 15);
    for (std::size_t t = 1; t < seen.size(); ++t) assert(seen[t - 1].second - seen[t - 1].first <= seen[t].second - seen[t].first);
    std::cout << "OK testEdgeCases" << std::endl;
}

void testInvalidInputThrows() {
    assert(throws<std::invalid_argument>([] { mergePiles({3, -1, 2}); }));
    assert(throws<std::invalid_argument>([] { mergePilesPlan({3, -1, 2}); }));
    assert(throws<std::invalid_argument>([] { optimalBst({3, -1, 2}); }));
    assert(throws<std::invalid_argument>([] { mergePiles({-5}); }));
    assert(throws<std::invalid_argument>([] { splitDp(-1, [](int, int) { return 0LL; }); }));
    assert(throws<std::invalid_argument>([] { splitDp(3, [](int i, int j) { return static_cast<long long>(j - i - 2); }); }));
    std::cout << "OK testInvalidInputThrows" << std::endl;
}

void testOverflow() {
    const long long half = 1LL << 62;
    // 2^63 does not fit; 2^63 - 1 does.
    assert(throws<std::overflow_error>([&] { mergePiles({half, half}); }));
    assert(throws<std::overflow_error>([&] { mergePilesPlan({half, half}); }));
    assert(mergePiles({half, half - 1}) == LLONG_MAX);
    // The total fits, but every order costs 5 * 2^61.
    assert(throws<std::overflow_error>([] { mergePiles(Values(3, 1LL << 61)); }));
    // A cell inside the table does not fit (dp[0][2] = 5 * 2^61): its window stays in range, and
    // the answer, which is at least that cell, is reported. The sanitizers watch the indices.
    assert(throws<std::overflow_error>([] { mergePiles({1LL << 61, 1LL << 61, 1LL << 61, 0}); }));
    assert(throws<std::overflow_error>([] { mergePiles({1LL << 61, 1LL << 61, 1LL << 61, 0, 0, 0}); }));
    // The split after pile 1 would cost 2^63 + 1; the minimum, after pile 0, fits.
    MergePlan plan = mergePilesPlan({half, 0, 1});
    assert(plan.cost == half + 2 && plan.merges == Merges({{1, 1, 2}, {0, 0, 2}}));
    // One pile costs 0 whatever its size; two whose total does not fit cannot be merged.
    assert(mergePiles({LLONG_MAX}) == 0);
    assert(throws<std::overflow_error>([] { mergePiles({LLONG_MAX, 1}); }));
    // Keys: one key costs its frequency; 2^62 and 1 cost 2^62 + 2; three of 2^61 cost 5 * 2^61.
    assert(optimalBst({LLONG_MAX}) == LLONG_MAX && optimalBst({half, 1}) == half + 2);
    assert(throws<std::overflow_error>([&] { optimalBst({half, half}); }));
    assert(throws<std::overflow_error>([] { optimalBst(Values(3, 1LL << 61)); }));
    // A cost that does not fit in a sum: splitDp reports it the same way.
    assert(throws<std::overflow_error>([] { splitDp(3, [](int, int) { return LLONG_MAX; }); }));
    std::cout << "OK testOverflow" << std::endl;
}

void testWorkCounts() {
    std::mt19937 rng(1400);
    for (int t = 0; t < 400; ++t) {
        Values piles = randomValues(rng, 25, std::vector<int>{1, 9, 1000}[t % 3]);
        const int n = static_cast<int>(piles.size());
        knuth_detail::Counters c;
        knuth_detail::Tables tables = knuth_detail::fillMerge(piles, &c);
        assert(c.tries == telescoped(tables.split, n) && c.tries <= windowBound(n));
    }
    for (int n : {10, 20, 40, 80, 160}) {
        knuth_detail::Counters equal, narrowed, plain, ends;
        knuth_detail::Tables e = knuth_detail::fillMerge(Values(n, 1), &equal);
        assert(equal.tries == static_cast<long long>(n - 1) * (n - 1) && equal.tries == telescoped(e.split, n));
        Values piles;
        for (int x = 0; x < n; ++x) piles.push_back(std::uniform_int_distribution<int>(0, 1000000)(rng));
        knuth_detail::Tables r = knuth_detail::fillMerge(piles, &narrowed);
        assert(narrowed.tries == telescoped(r.split, n) && narrowed.tries <= windowBound(n));
        knuth_detail::fill(n, PileCost{prefixOf(piles)}, false, &plain);
        assert(plain.tries == (static_cast<long long>(n) * n * n - n) / 6);
        Values heavyEnds(n, 1);
        heavyEnds.front() = heavyEnds.back() = 1000;
        knuth_detail::fillMerge(heavyEnds, &ends);
        assert(ends.tries == windowBound(n));  // the bound is reached
    }
    // A fill that does not narrow tries (n^3 - n) / 6 splits, which is not the telescoped sum.
    for (int n = 4; n < 30; ++n) {
        Values piles;
        for (int x = 1; x <= n; ++x) piles.push_back(x);
        knuth_detail::Counters plain;
        knuth_detail::Tables t = knuth_detail::fill(n, PileCost{prefixOf(piles)}, false, &plain);
        assert(plain.tries != telescoped(t.split, n));
    }
    std::cout << "OK testWorkCounts" << std::endl;
}

// ---------------------------------------------------------------- agreement with Python

// Outputs computed by running the Python implementation (knuth_optimization.py): fixed cases
// first, then seeded random ones. merge_piles_plan's cost and merges with the number of splits
// tried, optimal_bst with the number of splits tried, and split_dp with the square root of the
// merged size as the cost, with the window and with every split.
struct PythonMerge {
    Values piles;
    long long cost;
    Merges merges;
    long long tries;
};

struct PythonBst {
    Values freq;
    long long cost;
    long long tries;
};

struct PythonRoot {
    Values piles;
    long long narrowed, plain;
};

const std::vector<PythonMerge> kPythonMerges = {
    {{3, 2, 4, 1}, 20LL, {{0, 0, 1}, {2, 2, 3}, {0, 1, 3}}, 8},
    {{}, 0LL, {}, 0},
    {{7}, 0LL, {}, 0},
    {{4, 9}, 13LL, {{0, 0, 1}}, 1},
    {{1, 1, 1}, 5LL, {{1, 1, 2}, {0, 0, 2}}, 4},
    {{1, 1, 1, 1}, 8LL, {{0, 0, 1}, {2, 2, 3}, {0, 1, 3}}, 9},
    {{2, 2, 2, 2, 2}, 24LL, {{0, 0, 1}, {3, 3, 4}, {2, 2, 4}, {0, 1, 4}}, 16},
    {{0, 0, 0, 0}, 0LL, {{2, 2, 3}, {1, 1, 3}, {0, 0, 3}}, 9},
    {{1, 2, 3}, 9LL, {{0, 0, 1}, {0, 1, 2}}, 4},
    {{3, 2, 1}, 9LL, {{1, 1, 2}, {0, 0, 2}}, 4},
    {{3, 2, 2, 3}, 20LL, {{0, 0, 1}, {2, 2, 3}, {0, 1, 3}}, 10},
    {{5, 1, 4, 2, 8, 3, 7, 6}, 106LL, {{1, 1, 2}, {1, 2, 3}, {0, 0, 3}, {0, 3, 4}, {5, 5, 6}, {5, 6, 7}, {0, 4, 7}}, 48},
    {{1000, 1, 1, 1, 1, 1, 1, 1000}, 3028LL, {{1, 1, 2}, {3, 3, 4}, {5, 5, 6}, {3, 4, 6}, {1, 2, 6}, {1, 6, 7}, {0, 0, 7}}, 64},
    {{4611686018427387904, 4611686018427387903}, 9223372036854775807LL, {{0, 0, 1}}, 1},
    {{4611686018427387904, 0, 1}, 4611686018427387906LL, {{1, 1, 2}, {0, 0, 2}}, 4},
    {{1000000000000000, 1000000000000000, 1000000000000000, 1000000000000000, 1000000000000000, 1000000000000000, 1000000000000000, 1000000000000000}, 24000000000000000LL, {{0, 0, 1}, {2, 2, 3}, {0, 1, 3}, {4, 4, 5}, {6, 6, 7}, {4, 5, 7}, {0, 3, 7}}, 49},
    {{57, 0}, 57LL, {{0, 0, 1}}, 1},
    {{190379, 801913, 1, 883708, 2, 81, 0, 92, 9, 0}, 4554742LL, {{1, 1, 2}, {0, 0, 2}, {5, 5, 6}, {4, 4, 6}, {8, 8, 9}, {7, 7, 9}, {4, 6, 9}, {3, 3, 9}, {0, 2, 9}}, 75},
    {{699440, 99, 5, 89, 96, 2}, 700406LL, {{2, 2, 3}, {4, 4, 5}, {2, 3, 5}, {1, 1, 5}, {0, 0, 5}}, 26},
    {{410627, 126436, 157898, 6, 208080, 51897, 4}, 2253395LL, {{2, 2, 3}, {1, 1, 3}, {5, 5, 6}, {4, 4, 6}, {1, 3, 6}, {0, 0, 6}}, 40},
    {{0, 2, 935940, 9, 72, 208123, 618599, 3, 0}, 4352388LL, {{0, 0, 1}, {0, 1, 2}, {3, 3, 4}, {3, 4, 5}, {7, 7, 8}, {6, 6, 8}, {3, 5, 8}, {0, 2, 8}}, 57},
    {{14, 65, 34}, 192LL, {{0, 0, 1}, {0, 1, 2}}, 4},
    {{804888, 0, 5, 472920, 788577, 0, 2, 3}, 4589421LL, {{1, 1, 2}, {1, 2, 3}, {5, 5, 6}, {5, 6, 7}, {4, 4, 7}, {1, 3, 7}, {0, 0, 7}}, 53},
    {{74, 13, 1, 3, 0, 72, 2, 0, 2}, 364LL, {{3, 3, 4}, {2, 2, 4}, {1, 1, 4}, {0, 0, 4}, {7, 7, 8}, {6, 6, 8}, {5, 5, 8}, {0, 4, 8}}, 72},
    {{573603, 0, 2, 24, 76, 73, 42, 0, 7}, 574359LL, {{1, 1, 2}, {1, 2, 3}, {1, 3, 4}, {7, 7, 8}, {6, 6, 8}, {5, 5, 8}, {1, 4, 8}, {0, 0, 8}}, 70},
    {{3, 92, 588159, 679997, 886030, 514710, 779205, 335403}, 10538406LL, {{0, 0, 1}, {0, 1, 2}, {0, 2, 3}, {0, 3, 4}, {6, 6, 7}, {5, 5, 7}, {0, 4, 7}}, 43},
    {{2, 2, 90, 0, 72, 1, 949401, 6, 8, 539952, 44}, 3519546LL, {{0, 0, 1}, {0, 1, 2}, {3, 3, 4}, {3, 4, 5}, {0, 2, 5}, {0, 5, 6}, {7, 7, 8}, {7, 8, 9}, {7, 9, 10}, {0, 6, 10}}, 91},
    {{3, 7, 40, 2, 610237, 7, 775455, 972924, 56, 5, 1, 16832}, 5988744LL, {{0, 0, 1}, {2, 2, 3}, {0, 1, 3}, {4, 4, 5}, {0, 3, 5}, {0, 5, 6}, {9, 9, 10}, {8, 8, 10}, {8, 10, 11}, {7, 7, 11}, {0, 6, 11}}, 102},
    {{9, 61, 10}, 150LL, {{0, 0, 1}, {0, 1, 2}}, 4},
    {{0, 2, 60, 43, 2, 1, 88, 4}, 513LL, {{0, 0, 1}, {0, 1, 2}, {4, 4, 5}, {3, 3, 5}, {0, 2, 5}, {6, 6, 7}, {0, 5, 7}}, 49},
    {{3, 938956, 2, 691962, 1, 730295, 220451, 881157, 2}, 11080450LL, {{0, 0, 1}, {3, 3, 4}, {2, 2, 4}, {0, 1, 4}, {5, 5, 6}, {7, 7, 8}, {5, 6, 8}, {0, 4, 8}}, 64},
    {{3, 24, 0, 5}, 64LL, {{0, 0, 1}, {2, 2, 3}, {0, 1, 3}}, 9},
    {{64, 1, 844998, 781538, 64, 1, 73, 66, 55}, 3254368LL, {{0, 0, 1}, {0, 1, 2}, {4, 4, 5}, {4, 5, 6}, {7, 7, 8}, {4, 6, 8}, {3, 3, 8}, {0, 2, 8}}, 57},
    {{2, 0, 64, 0}, 132LL, {{0, 0, 1}, {2, 2, 3}, {0, 1, 3}}, 8},
    {{7, 1, 27, 911935, 379588}, 2203571LL, {{0, 0, 1}, {0, 1, 2}, {0, 2, 3}, {0, 3, 4}}, 16},
    {{0, 12}, 12LL, {{0, 0, 1}}, 1},
    {{97, 2, 2, 12, 227503, 59, 3, 150106, 231772, 2, 688877}, 2895530LL, {{1, 1, 2}, {1, 2, 3}, {0, 0, 3}, {0, 3, 4}, {5, 5, 6}, {5, 6, 7}, {0, 4, 7}, {8, 8, 9}, {0, 7, 9}, {0, 9, 10}}, 109},
    {{46, 0, 907195, 7, 97, 1, 16, 830911, 3, 7, 949867, 297802}, 8541406LL, {{0, 0, 1}, {0, 1, 2}, {3, 3, 4}, {5, 5, 6}, {3, 4, 6}, {8, 8, 9}, {7, 7, 9}, {3, 6, 9}, {0, 2, 9}, {10, 10, 11}, {0, 9, 11}}, 136},
    {{372684, 121258, 1, 15, 572992}, 1682198LL, {{2, 2, 3}, {1, 1, 3}, {0, 0, 3}, {0, 3, 4}}, 19},
    {{70, 937689, 97, 99, 1, 319857, 711170, 7, 5, 1}, 4969545LL, {{0, 0, 1}, {3, 3, 4}, {2, 2, 4}, {2, 4, 5}, {8, 8, 9}, {7, 7, 9}, {6, 6, 9}, {2, 5, 9}, {0, 1, 9}}, 80},
};

const std::vector<PythonBst> kPythonBsts = {
    {{34, 8, 50}, 142LL, 10},
    {{34, 50}, 118LL, 4},
    {{}, 0LL, 0},
    {{7}, 7LL, 1},
    {{4, 9}, 17LL, 4},
    {{0, 0, 0}, 0LL, 9},
    {{5, 5, 5, 5, 5, 5, 5}, 85LL, 49},
    {{4611686018427387904, 1}, 4611686018427387906LL, 4},
    {{9223372036854775807}, 9223372036854775807LL, 1},
    {{1, 2, 3, 4, 5}, 30LL, 25},
    {{30, 101, 444}, 736LL, 9},
    {{226, 128, 521, 21, 1, 21, 313, 0, 621, 407}, 4801LL, 114},
    {{0}, 0LL, 1},
    {{860}, 860LL, 1},
    {{43, 3, 930, 19, 452, 106}, 2304LL, 32},
    {{310, 39, 34, 0}, 490LL, 16},
    {{15}, 15LL, 1},
    {{25, 95, 2, 521, 349, 19, 24, 3}, 1650LL, 54},
    {{31, 7, 852, 37, 50, 663}, 2559LL, 34},
    {{1, 203, 4, 364, 0}, 785LL, 23},
};

const std::vector<PythonRoot> kPythonRoots = {
    {{1, 1, 2, 1, 6}, 8, 7},
    {{11, 5, 8, 11, 15, 17}, 25, 25},
    {{18, 20, 9, 6, 15, 17, 8, 4, 17}, 45, 45},
    {{12, 7, 15, 6, 16, 5}, 25, 25},
    {{8, 7, 15, 0}, 11, 11},
    {{18, 10, 11, 18, 16, 11}, 30, 30},
    {{7, 19, 1, 4, 18, 15, 15, 10, 14, 19}, 52, 51},
    {{8, 7, 9, 11, 14, 11, 16, 18, 14}, 46, 45},
    {{9, 1, 9, 19, 18, 17, 8, 16, 19, 9}, 54, 53},
    {{6, 7, 7, 16, 9, 18, 13, 4, 9}, 42, 41},
    {{0, 8, 17, 9, 5, 9, 5, 16, 12, 10}, 44, 43},
    {{3, 17, 18, 15, 14, 8, 16, 6}, 40, 39},
    {{7, 18, 14, 6, 20, 7, 1, 8, 6}, 40, 39},
    {{6, 6, 18, 14, 17, 2, 19, 20}, 41, 40},
    {{7, 20, 9, 20, 0, 10, 8, 10, 17, 20}, 54, 53},
    {{4, 8, 15, 7, 0, 1, 19, 1, 6, 14}, 36, 35},
};

void testAgreementWithPython() {
    for (std::size_t i = 0; i < kPythonMerges.size(); ++i) {
        const PythonMerge& c = kPythonMerges[i];
        knuth_detail::Counters counters;
        knuth_detail::fillMerge(c.piles, &counters);
        MergePlan plan = mergePilesPlan(c.piles);
        bool same = plan.cost == c.cost && plan.merges == c.merges && mergePiles(c.piles) == c.cost && counters.tries == c.tries;
        if (!same) std::cerr << "merge case " << i << " differs from Python\n";
        assert(same);
    }
    for (std::size_t i = 0; i < kPythonBsts.size(); ++i) {
        knuth_detail::Counters counters;
        knuth_detail::fillBst(kPythonBsts[i].freq, &counters);
        bool same = optimalBst(kPythonBsts[i].freq) == kPythonBsts[i].cost && counters.tries == kPythonBsts[i].tries;
        if (!same) std::cerr << "bst case " << i << " differs from Python\n";
        assert(same);
    }
    for (std::size_t i = 0; i < kPythonRoots.size(); ++i) {
        const PythonRoot& c = kPythonRoots[i];
        RootCost root{prefixOf(c.piles)};
        const int n = static_cast<int>(c.piles.size());
        bool same = splitDp(n, root) == c.narrowed && splitDp(n, root, false) == c.plain;
        if (!same) std::cerr << "root case " << i << " differs from Python\n";
        assert(same);
    }
    std::cout << "OK testAgreementWithPython (" << kPythonMerges.size() << " + " << kPythonBsts.size() << " + " << kPythonRoots.size() << " cases)"
              << std::endl;
}

int main() {
    testWorkedExample();
    testAgainstThePlainDp();
    testWindow();
    testConditions();
    testPlan();
    testOptimalBst();
    testEdgeCases();
    testInvalidInputThrows();
    testOverflow();
    testWorkCounts();
    testAgreementWithPython();
    std::cout << "All Knuth Optimization tests passed!" << std::endl;
    return 0;
}
