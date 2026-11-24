// Tests for divide_and_conquer_optimization.cpp: the worked example, the optimized DP against
// the plain DP and brute force, the groups, the quadrangle inequality and a cost that breaks
// it, edge cases, invalid input, overflow, the number of cost evaluations, and 44 + 12 + 8
// cases pinned to the Python outputs.
#include <algorithm>
#include <cassert>
#include <climits>
#include <cmath>
#include <cstddef>
#include <iostream>
#include <random>
#include <stdexcept>
#include <vector>

#include "divide_and_conquer_optimization.cpp"

using Values = std::vector<long long>;
using Ints = std::vector<int>;

// The first eight digits of pi, split into three groups.
const Values kValues = {3, 1, 4, 1, 5, 9, 2, 6};

Values prefixOf(const Values& values) {
    Values p(values.size() + 1, 0);
    for (std::size_t t = 0; t < values.size(); ++t) p[t + 1] = p[t] + values[t];
    return p;
}

// C(j, i) = (sum of values[j..i-1])^2, any sign, counting every call when count is not null.
struct SquareCost {
    Values prefix;
    long long* count;
    long long operator()(int j, int i) const {
        if (count) ++*count;
        const long long s = prefix[i] - prefix[j];
        return s * s;
    }
};

SquareCost squareCost(const Values& values, long long* count = nullptr) { return SquareCost{prefixOf(values), count}; }

long long splitCost(const Values& values, const Ints& bounds) {
    long long total = 0;
    for (std::size_t g = 0; g + 1 < bounds.size(); ++g) {
        long long s = 0;
        for (int t = bounds[g]; t < bounds[g + 1]; ++t) s += values[t];
        total += s * s;
    }
    return total;
}

// Every split into k groups: the best cost, and of the best splits the one whose last cut is
// smallest, then the cut before it, and so on (the documented tie rule).
Partition bruteForce(const Values& values, int k) {
    const int n = static_cast<int>(values.size());
    Partition best{LLONG_MAX, {}};
    Ints bounds(k + 1, 0);
    bounds[k] = n;
    // Choose the cuts bounds[1] < ... < bounds[k - 1] in 1..n-1.
    auto rec = [&](auto&& self, int g, int from) -> void {
        if (g == k) {
            const long long c = splitCost(values, bounds);
            Ints rb(bounds.rbegin(), bounds.rend()), rbest(best.bounds.rbegin(), best.bounds.rend());
            if (c < best.cost || (c == best.cost && rb < rbest)) best = Partition{c, bounds};
            return;
        }
        for (int cut = from; cut <= n - (k - g); ++cut) {
            bounds[g] = cut;
            self(self, g + 1, cut + 1);
        }
    };
    rec(rec, 1, 1);
    return best;
}

// Whether C(a, c) + C(b, d) <= C(a, d) + C(b, c) for every a < b < c < d <= n.
template <typename Cost>
bool quadrangleHolds(int n, Cost cost) {
    for (int a = 0; a <= n; ++a)
        for (int b = a + 1; b <= n; ++b)
            for (int c = b + 1; c <= n; ++c)
                for (int d = c + 1; d <= n; ++d)
                    if (cost(a, c) + cost(b, d) > cost(a, d) + cost(b, c)) return false;
    return true;
}

struct RandomCase {
    Values values;
    int k;
};

RandomCase randomCase(std::mt19937& rng, int maxN, bool negative = false) {
    auto pick = [&](long long lo, long long hi) { return std::uniform_int_distribution<long long>(lo, hi)(rng); };
    const long long highs[] = {1, 3, 10, 100, 1000000};
    const int n = static_cast<int>(pick(1, maxN));
    const long long high = highs[pick(0, 4)];
    RandomCase r{{}, 0};
    for (int t = 0; t < n; ++t) r.values.push_back(pick(negative ? -high : 0, high));
    r.k = static_cast<int>(pick(1, n));
    return r;
}

template <typename F>
bool throwsInvalid(F f) {
    try {
        f();
    } catch (const std::invalid_argument&) {
        return true;
    }
    return false;
}

template <typename F>
bool throwsOverflow(F f) {
    try {
        f();
    } catch (const std::overflow_error&) {
        return true;
    }
    return false;
}

bool same(const Partition& a, const Partition& b) { return a.cost == b.cost && a.bounds == b.bounds; }

void testWorkedExample() {
    const Partition best = minCostPartition(kValues, 3);
    assert(best.cost == 341 && best.bounds == Ints({0, 4, 6, 8}));  // [3 1 4 1] [5 9] [2 6]: 81 + 196 + 64
    assert(same(minCostPartitionPlain(kValues, 3), best));
    const long long want[] = {961, 485, 341, 245, 211, 187, 179, 173};
    for (int k = 1; k <= 8; ++k) assert(minCostPartition(kValues, k).cost == want[k - 1]);
    assert(minCostPartition(kValues, 2).bounds == Ints({0, 5, 8}));
    assert(minCostPartition(kValues, 4).bounds == Ints({0, 3, 5, 6, 8}));
    // Cost evaluations: 8 + 19 + 14 with the recursion, 8 + 28 + 21 with the plain DP.
    long long fast = 0, plain = 0;
    partitionDp(8, 3, squareCost(kValues, &fast), true);
    partitionDp(8, 3, squareCost(kValues, &plain), false);
    assert(fast == 41 && plain == 57);
    std::cout << "OK testWorkedExample" << std::endl;
}

void testAgainstPlainAndBruteForce() {
    std::mt19937 rng(20261124);
    for (int t = 0; t < 1500; ++t) {
        RandomCase r = randomCase(rng, 40);
        assert(same(minCostPartition(r.values, r.k), minCostPartitionPlain(r.values, r.k)));
    }
    for (int t = 0; t < 1500; ++t) {
        RandomCase r = randomCase(rng, 9);
        const Partition want = bruteForce(r.values, r.k);
        assert(same(minCostPartition(r.values, r.k), want));
        assert(same(minCostPartitionPlain(r.values, r.k), want));
    }
    std::cout << "OK testAgainstPlainAndBruteForce" << std::endl;
}

void testGroups() {
    std::mt19937 rng(868);
    for (int t = 0; t < 1000; ++t) {
        RandomCase r = randomCase(rng, 30);
        const Partition best = minCostPartition(r.values, r.k);
        assert(best.bounds.size() == static_cast<std::size_t>(r.k) + 1);
        assert(best.bounds.front() == 0 && best.bounds.back() == static_cast<int>(r.values.size()));
        for (int g = 0; g < r.k; ++g) assert(best.bounds[g] < best.bounds[g + 1]);  // non-empty
        assert(splitCost(r.values, best.bounds) == best.cost);                       // reaches the cost
    }
    std::cout << "OK testGroups" << std::endl;
}

void testQuadrangleInequality() {
    std::mt19937 rng(1433);
    for (int t = 0; t < 400; ++t) {
        RandomCase r = randomCase(rng, 12);
        assert(quadrangleHolds(static_cast<int>(r.values.size()), squareCost(r.values)));
    }
    // Other costs that satisfy it: a convex function of the length, and the square plus a fixed price.
    for (int t = 0; t < 300; ++t) {
        RandomCase r = randomCase(rng, 25);
        const int n = static_cast<int>(r.values.size());
        auto cube = [](int j, int i) { return static_cast<long long>(i - j) * (i - j) * (i - j); };
        const SquareCost square = squareCost(r.values);
        auto priced = [&square](int j, int i) { return square(j, i) + 50; };
        assert(same(partitionDp(n, r.k, cube, true), partitionDp(n, r.k, cube, false)));
        assert(same(partitionDp(n, r.k, priced, true), partitionDp(n, r.k, priced, false)));
    }
    std::cout << "OK testQuadrangleInequality" << std::endl;
}

void testWhenItFails() {
    // With a negative value the square of the sum breaks the inequality:
    // C(1, 3) + C(2, 4) = 36 + 1 > C(1, 4) + C(2, 3) = 1 + 16.
    const Values values = {1, 2, 4, -5};
    const SquareCost cost = squareCost(values);
    assert(cost(1, 3) == 36 && cost(2, 4) == 1 && cost(1, 4) == 1 && cost(2, 3) == 16);
    assert(!quadrangleHolds(4, cost));
    const Partition fast = partitionDp(4, 2, cost, true);
    const Partition plain = partitionDp(4, 2, cost, false);
    assert(fast.cost == 10 && fast.bounds == Ints({0, 2, 4}));  // wrong
    assert(plain.cost == 2 && plain.bounds == Ints({0, 1, 4}));
    // On random inputs with negative values the recursion sometimes misses, never undercuts.
    std::mt19937 rng(1603);
    int differ = 0;
    for (int t = 0; t < 3000; ++t) {
        RandomCase r = randomCase(rng, 9, true);
        const int n = static_cast<int>(r.values.size());
        const SquareCost c = squareCost(r.values);
        const Partition f = partitionDp(n, r.k, c, true);
        const Partition p = partitionDp(n, r.k, c, false);
        assert(p.cost == bruteForce(r.values, r.k).cost);
        assert(splitCost(r.values, f.bounds) == f.cost && f.cost >= p.cost);
        if (!same(f, p)) {
            ++differ;
            assert(!quadrangleHolds(n, c));
        }
    }
    assert(differ > 0);
    assert(throwsInvalid([&] { minCostPartition(values, 2); }));
    assert(throwsInvalid([&] { minCostPartitionPlain(values, 2); }));
    std::cout << "OK testWhenItFails (" << differ << " of 3000 differ)" << std::endl;
}

void testEdgeCases() {
    assert(same(minCostPartition(kValues, 1), Partition{961, {0, 8}}));          // one group
    assert(same(minCostPartition({7}, 1), Partition{49, {0, 1}}));
    assert(same(minCostPartition(kValues, 8), Partition{173, {0, 1, 2, 3, 4, 5, 6, 7, 8}}));  // one value each
    // Equal values: the last cut is the smallest possible.
    assert(same(minCostPartition({1, 1, 1, 1, 1}, 2), Partition{13, {0, 2, 5}}));
    assert(same(minCostPartition({0, 0, 0, 0}, 2), Partition{0, {0, 1, 4}}));
    assert(same(minCostPartition({0, 0, 0, 0}, 3), Partition{0, {0, 1, 2, 4}}));
    assert(same(minCostPartition({5, 0, 0, 5}, 2), Partition{50, {0, 1, 4}}));
    assert(same(minCostPartition({0, 0, 9, 0, 0}, 3), Partition{81, {0, 1, 2, 5}}));
    std::cout << "OK testEdgeCases" << std::endl;
}

void testInvalidInput() {
    // Groups are not empty: k > n is an error, and so is any k for an empty list.
    assert(throwsInvalid([] { minCostPartition({1, 2, 3}, 4); }));
    assert(throwsInvalid([] { minCostPartitionPlain({1, 2, 3}, 4); }));
    assert(throwsInvalid([] { minCostPartition({}, 1); }));
    assert(throwsInvalid([] { minCostPartition({}, 0); }));
    assert(throwsInvalid([] { minCostPartition({1, 2}, 0); }));
    assert(throwsInvalid([] { minCostPartitionPlain({1, 2}, -1); }));
    assert(throwsInvalid([] { minCostPartition({3, -1, 2}, 2); }));
    assert(throwsInvalid([] { partitionDp(4, 5, [](int, int) { return 0LL; }); }));
    assert(throwsInvalid([] { partitionDp(4, 0, [](int, int) { return 0LL; }, false); }));
    // A negative value is reported before an overflowing total.
    assert(throwsInvalid([] { minCostPartition({4000000000LL, -1}, 1); }));
    std::cout << "OK testInvalidInput" << std::endl;
}

void testOverflow() {
    // 3037000499^2 is the largest square that fits in a long long.
    assert(same(minCostPartition({3037000499LL}, 1), Partition{9223372030926249001LL, {0, 1}}));
    assert(throwsOverflow([] { minCostPartition({3037000500LL}, 1); }));
    // The check is on the total, the one-group cost the DP forms in layer 1: two groups of
    // 3037000499 and 1 would cost 9223372030926249002, but the total does not square into 64 bits.
    assert(throwsOverflow([] { minCostPartition({3037000499LL, 1}, 2); }));
    assert(throwsOverflow([] { minCostPartitionPlain({LLONG_MAX, LLONG_MAX}, 2); }));
    assert(same(minCostPartition({1000000000, 1000000000, 1000000000}, 2), Partition{5000000000000000000LL, {0, 1, 3}}));
    // partitionDp checks every sum it forms.
    auto big = [](int, int) { return LLONG_MAX / 2 + 1; };
    assert(throwsOverflow([&] { partitionDp(3, 2, big); }));
    assert(throwsOverflow([&] { partitionDp(3, 3, big, false); }));
    assert(partitionDp(3, 1, big).cost == LLONG_MAX / 2 + 1);
    std::cout << "OK testOverflow" << std::endl;
}

long long boundOf(int n, int k) {
    long long b = n;
    for (int g = 2; g <= k; ++g) {
        const long long m = n - g + 1;
        b += m * (static_cast<long long>(std::floor(std::log2(static_cast<double>(m)))) + 2);
    }
    return b;
}

long long plainOf(int n, int k) {
    long long p = n;
    for (int g = 2; g <= k; ++g) {
        const long long m = n - g + 1;
        p += m * (m + 1) / 2;
    }
    return p;
}

Values countingValues(int n) {
    Values v;
    for (int t = 0; t < n; ++t) v.push_back((37LL * t + 11) % 101);
    return v;
}

void testCostEvaluations() {
    // At most m (log2 m + 2) evaluations for a layer of m cells, against m (m + 1) / 2.
    for (int n : {64, 256, 1024, 4096}) {
        long long fast = 0;
        partitionDp(n, 4, squareCost(countingValues(n), &fast), true);
        assert(fast <= boundOf(n, 4));
    }
    std::mt19937 rng(833);
    for (int t = 0; t < 150; ++t) {
        RandomCase r = randomCase(rng, 200);
        const int n = static_cast<int>(r.values.size());
        long long fast = 0;
        partitionDp(n, r.k, squareCost(r.values, &fast), true);
        assert(fast <= boundOf(n, r.k));
    }
    // The plain DP tries every j for every cell, as a recursion that never narrows would; it
    // fails the bound.
    for (int n : {8, 64, 256}) {
        long long plain = 0;
        partitionDp(n, 4, squareCost(countingValues(n), &plain), false);
        assert(plain == plainOf(n, 4));
        if (n >= 64) assert(plain > boundOf(n, 4));
    }
    std::cout << "OK testCostEvaluations" << std::endl;
}

// ---------------------------------------------------------------- agreement with Python

// Outputs computed by running the Python implementation (divide_and_conquer_optimization.py):
// fixed cases first, then seeded random ones. Each case: values, k, the cost and the bounds
// that min_cost_partition returns (min_cost_partition_plain returns the same).
struct PythonCase {
    Values values;
    int k;
    long long cost;
    Ints bounds;
};

// partition_dp with the square of the sum on values with negatives: the recursion's answer
// (optimized=True) and the plain DP's, which differ.
struct PythonFailure {
    Values values;
    int k;
    long long fastCost;
    Ints fastBounds;
    long long plainCost;
    Ints plainBounds;
};

// Cost evaluations on values (37 t + 11) mod 101, t = 0..n-1: the recursion, then the plain DP.
struct PythonCount {
    int n, k;
    long long fast, plain;
};

const std::vector<PythonCase> kPythonCases = {
    {{3, 1, 4, 1, 5, 9, 2, 6}, 1, 961LL, {0, 8}},
    {{3, 1, 4, 1, 5, 9, 2, 6}, 2, 485LL, {0, 5, 8}},
    {{3, 1, 4, 1, 5, 9, 2, 6}, 3, 341LL, {0, 4, 6, 8}},
    {{3, 1, 4, 1, 5, 9, 2, 6}, 4, 245LL, {0, 3, 5, 6, 8}},
    {{3, 1, 4, 1, 5, 9, 2, 6}, 8, 173LL, {0, 1, 2, 3, 4, 5, 6, 7, 8}},
    {{7}, 1, 49LL, {0, 1}},
    {{1, 1, 1, 1, 1}, 2, 13LL, {0, 2, 5}},
    {{1, 1, 1, 1, 1, 1, 1}, 3, 17LL, {0, 2, 4, 7}},
    {{0, 0, 0, 0}, 2, 0LL, {0, 1, 4}},
    {{0, 0, 0, 0}, 3, 0LL, {0, 1, 2, 4}},
    {{5, 0, 0, 5}, 2, 50LL, {0, 1, 4}},
    {{0, 0, 9, 0, 0}, 2, 81LL, {0, 1, 5}},
    {{0, 0, 9, 0, 0}, 3, 81LL, {0, 1, 2, 5}},
    {{2, 7, 1, 8, 2, 8}, 3, 262LL, {0, 2, 4, 6}},
    {{4, 1, 3, 2, 5, 1, 2}, 3, 114LL, {0, 2, 4, 7}},
    {{3037000499}, 1, 9223372030926249001LL, {0, 1}},
    {{1000000000, 1000000000, 1000000000}, 2, 5000000000000000000LL, {0, 1, 3}},
    {{0, 0, 2, 9, 7, 7, 2, 7, 6, 9, 3, 1, 0, 9}, 9, 478LL, {0, 3, 4, 5, 6, 8, 9, 10, 12, 14}},
    {{7}, 1, 49LL, {0, 1}},
    {{75}, 1, 5625LL, {0, 1}},
    {{1, 0}, 2, 1LL, {0, 1, 2}},
    {{29, 33, 75, 86, 33, 34, 46, 73, 17}, 9, 24930LL, {0, 1, 2, 3, 4, 5, 6, 7, 8, 9}},
    {{1, 0, 0, 0, 1, 1}, 4, 3LL, {0, 1, 2, 5, 6}},
    {{773171, 637888, 540433, 688123, 448431, 219816, 331949, 907024}, 4, 5323521921609LL, {0, 2, 4, 7, 8}},
    {{1, 3, 7, 6, 3, 1, 6, 2, 9, 6, 6, 7, 1}, 8, 444LL, {0, 2, 3, 5, 8, 9, 10, 11, 13}},
    {{793767}, 1, 630066050289LL, {0, 1}},
    {{0, 1, 0, 1, 1, 0, 0, 1, 1, 0}, 5, 5LL, {0, 2, 4, 5, 8, 10}},
    {{403847, 370773, 995424, 524778, 666319, 341702, 611420, 93366, 8760, 93687, 145607, 882042, 574334, 288106}, 4, 9270824263433LL, {0, 3, 5, 11, 14}},
    {{580960, 538259, 79800, 213986, 35879, 461153, 930151, 65459, 6407, 353473, 488519}, 5, 2925375372370LL, {0, 1, 3, 6, 7, 11}},
    {{409069, 204507, 844632, 425774, 229757, 769223, 992989, 228216, 475437, 815886, 978897}, 5, 8273390610743LL, {0, 3, 6, 8, 10, 11}},
    {{46, 35, 2, 45}, 1, 16384LL, {0, 4}},
    {{354142, 606128, 407320, 690703, 689239, 19512, 779336, 921129, 147288, 660187, 207228}, 4, 7749977300650LL, {0, 3, 6, 8, 11}},
    {{150659, 63911, 663673, 601498}, 2, 1133110611053LL, {0, 3, 4}},
    {{1, 0, 1, 1, 1, 1, 0, 0, 1, 1, 0, 0}, 12, 7LL, {0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12}},
    {{5, 2, 0, 6, 3, 6, 0, 7, 0, 4}, 9, 175LL, {0, 1, 2, 3, 4, 5, 6, 7, 8, 10}},
    {{50, 55, 100}, 3, 15525LL, {0, 1, 2, 3}},
    {{8, 0, 2, 2}, 4, 72LL, {0, 1, 2, 3, 4}},
    {{5, 5, 5, 8, 9, 3, 4, 3, 8, 9, 0, 7, 7, 5}, 6, 1038LL, {0, 2, 4, 6, 9, 12, 14}},
    {{5, 7, 0, 8, 9, 4, 1, 4}, 4, 370LL, {0, 2, 4, 5, 8}},
    {{76, 5, 59, 62, 44, 36, 51, 99, 44, 70, 29, 36}, 8, 49539LL, {0, 1, 3, 5, 7, 8, 9, 10, 12}},
    {{1, 0, 1, 0, 1, 1}, 3, 6LL, {0, 1, 3, 6}},
    {{676193, 297562, 7707, 324174, 182444}, 5, 684214110354LL, {0, 1, 2, 3, 4, 5}},
    {{66, 86, 79, 73, 20, 52, 4, 78, 63, 4, 94, 74}, 8, 63399LL, {0, 1, 2, 3, 5, 8, 10, 11, 12}},
    {{271058, 738494, 730125, 105425, 701280, 249245, 508698, 159489, 843657, 925413, 961583, 753801, 526483, 723856}, 11, 6506538800407LL, {0, 1, 2, 3, 5, 8, 9, 10, 11, 12, 13, 14}},
};

const std::vector<PythonFailure> kPythonFailures = {
    {{1, 2, 4, -5}, 2, 10, {0, 2, 4}, 2, {0, 1, 4}},
    {{-1, 1, 2, -4}, 2, 4, {0, 2, 4}, 2, {0, 1, 4}},
    {{2, 1, 0, 3, -4}, 2, 10, {0, 2, 5}, 4, {0, 1, 5}},
    {{3, 0, 3, 3, 0, -5, -1, 4, 1}, 7, 40, {0, 1, 2, 3, 6, 7, 8, 9}, 32, {0, 1, 2, 3, 4, 5, 8, 9}},
    {{-1, 1, 0, -6, 0, 2}, 3, 30, {0, 1, 4, 6}, 16, {0, 2, 3, 6}},
    {{1, 4, 5, 2, -4, 6, -3}, 2, 73, {0, 5, 7}, 61, {0, 2, 7}},
    {{6, 3, -2, -1, 3, -2, 4, 2, -6}, 4, 65, {0, 1, 5, 7, 9}, 37, {0, 1, 3, 6, 9}},
    {{3, -2, 5, 6, -2, -1}, 2, 45, {0, 3, 6}, 45, {0, 1, 6}},
    {{-3, 5, -4, -1, 4, -4, 3, 0}, 5, 18, {0, 1, 4, 6, 7, 8}, 14, {0, 3, 4, 6, 7, 8}},
    {{6, 0, 4, -3, 3, 4, 2, -6, 3}, 4, 55, {0, 1, 4, 8, 9}, 55, {0, 1, 4, 5, 9}},
    {{6, 6, 3, 4, 4, -6}, 3, 121, {0, 1, 3, 6}, 97, {0, 1, 2, 6}},
    {{0, 1, 5, 3, 5, -1, 3, -6, -6}, 3, 70, {0, 3, 4, 9}, 10, {0, 1, 2, 9}},
};

const std::vector<PythonCount> kPythonCounts = {
    {8, 3, 43, 57},
    {64, 4, 1140, 5924},
    {256, 4, 6225, 97412},
    {1024, 4, 31234, 1569284},
    {100, 1, 100, 100},
    {100, 2, 773, 5050},
    {100, 10, 5455, 41170},
    {300, 7, 14802, 264935},
};

void testAgreementWithPython() {
    for (std::size_t i = 0; i < kPythonCases.size(); ++i) {
        const PythonCase& c = kPythonCases[i];
        const Partition want{c.cost, c.bounds};
        const bool ok = same(minCostPartition(c.values, c.k), want) && same(minCostPartitionPlain(c.values, c.k), want);
        if (!ok) std::cerr << "agreement case " << i << " differs from Python\n";
        assert(ok);
    }
    for (std::size_t i = 0; i < kPythonFailures.size(); ++i) {
        const PythonFailure& c = kPythonFailures[i];
        const SquareCost cost = squareCost(c.values);
        const int n = static_cast<int>(c.values.size());
        const bool ok = same(partitionDp(n, c.k, cost, true), Partition{c.fastCost, c.fastBounds}) &&
                        same(partitionDp(n, c.k, cost, false), Partition{c.plainCost, c.plainBounds});
        if (!ok) std::cerr << "failure case " << i << " differs from Python\n";
        assert(ok);
    }
    for (std::size_t i = 0; i < kPythonCounts.size(); ++i) {
        const PythonCount& c = kPythonCounts[i];
        long long fast = 0, plain = 0;
        partitionDp(c.n, c.k, squareCost(countingValues(c.n), &fast), true);
        partitionDp(c.n, c.k, squareCost(countingValues(c.n), &plain), false);
        if (fast != c.fast || plain != c.plain) std::cerr << "count case " << i << " differs from Python\n";
        assert(fast == c.fast && plain == c.plain);
    }
    std::cout << "OK testAgreementWithPython (" << kPythonCases.size() << " + " << kPythonFailures.size() << " + " << kPythonCounts.size()
              << " cases)" << std::endl;
}

int main() {
    testWorkedExample();
    testAgainstPlainAndBruteForce();
    testGroups();
    testQuadrangleInequality();
    testWhenItFails();
    testEdgeCases();
    testInvalidInput();
    testOverflow();
    testCostEvaluations();
    testAgreementWithPython();
    std::cout << "All Divide and Conquer Optimization tests passed!" << std::endl;
    return 0;
}
