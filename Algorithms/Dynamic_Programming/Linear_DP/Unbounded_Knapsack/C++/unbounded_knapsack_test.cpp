// Tests for unbounded_knapsack.cpp: the worked example, both loop directions against brute
// force, the multiset read back from choice[], the 2D table, the counts, edge cases, invalid
// input, overflow, the work done, and 44 + 24 cases pinned to the Python outputs.
#include <algorithm>
#include <cassert>
#include <climits>
#include <cstddef>
#include <iostream>
#include <random>
#include <stdexcept>
#include <vector>

#include "unbounded_knapsack.cpp"

using Ints = std::vector<int>;
using Values = std::vector<long long>;

// The items of the 0/1 Knapsack topic: (weight, value) = (1, 1), (3, 4), (4, 5), (5, 7).
const Ints kWeights = {1, 3, 4, 5};
const Values kValues = {1, 4, 5, 7};

// Every multiset that fits: up to capacity / weight copies of each item.
long long bruteUnbounded(const Ints& w, const Values& v, int capacity, std::size_t i = 0) {
    if (i == w.size()) return 0;
    long long best = 0;
    for (int k = 0; k * w[i] <= capacity; ++k) {
        best = std::max(best, k * v[i] + bruteUnbounded(w, v, capacity - k * w[i], i + 1));
    }
    return best;
}

// Every subset that fits.
long long bruteZeroOne(const Ints& w, const Values& v, int capacity) {
    long long best = 0;
    for (unsigned mask = 0; mask < (1u << w.size()); ++mask) {
        long long weight = 0, value = 0;
        for (std::size_t i = 0; i < w.size(); ++i) {
            if (mask >> i & 1u) {
                weight += w[i];
                value += v[i];
            }
        }
        if (weight <= capacity) best = std::max(best, value);
    }
    return best;
}

long long bruteCombinations(const Ints& w, int target, std::size_t i = 0) {
    if (i == w.size()) return target == 0 ? 1 : 0;
    long long ways = 0;
    for (int k = 0; k * w[i] <= target; ++k) ways += bruteCombinations(w, target - k * w[i], i + 1);
    return ways;
}

long long brutePermutations(const Ints& w, int target) {
    if (target == 0) return 1;
    long long ways = 0;
    for (int x : w) {
        if (x <= target) ways += brutePermutations(w, target - x);
    }
    return ways;
}

struct RandomItems {
    Ints weights;
    Values values;
    int capacity;
};

RandomItems randomItems(std::mt19937& rng, int maxItems, int maxWeight, int maxValue, int maxCapacity) {
    auto pick = [&](int lo, int hi) { return std::uniform_int_distribution<int>(lo, hi)(rng); };
    RandomItems r{{}, {}, 0};
    for (int n = pick(0, maxItems); n > 0; --n) {
        r.weights.push_back(pick(1, maxWeight));
        r.values.push_back(pick(0, maxValue));
    }
    r.capacity = pick(0, maxCapacity);
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

void testWorkedExample() {
    assert(unboundedKnapsack(kWeights, kValues, 10) == 14);
    KnapsackChoice best = unboundedKnapsackItems(kWeights, kValues, 10);
    assert(best.value == 14 && best.counts == Ints({0, 0, 0, 2}));  // item 3 (weight 5) twice
    assert(zeroOneKnapsack(kWeights, kValues, 10) == 13);
    assert(unboundedKnapsack(kWeights, kValues, 7) == 9 && zeroOneKnapsack(kWeights, kValues, 7) == 9);
    Values row;
    for (int w = 0; w <= 10; ++w) row.push_back(unboundedKnapsack(kWeights, kValues, w));
    assert(row == Values({0, 1, 2, 4, 5, 7, 8, 9, 11, 12, 14}));
    std::vector<Values> table = unboundedKnapsackTable(kWeights, kValues, 10);
    assert(table == std::vector<Values>({
                        {0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0},
                        {0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10},
                        {0, 1, 2, 4, 5, 6, 8, 9, 10, 12, 13},
                        {0, 1, 2, 4, 5, 6, 8, 9, 10, 12, 13},
                        {0, 1, 2, 4, 5, 7, 8, 9, 11, 12, 14},
                    }));
    unbounded_knapsack_detail::Row r = unbounded_knapsack_detail::fillRow(kWeights, kValues, 10, true);
    assert(r.choice == Ints({-1, 0, 0, 1, 1, 3, 1, 1, 3, 1, 3}));
    std::cout << "OK testWorkedExample" << std::endl;
}

void testLoopDirection() {
    assert(unboundedKnapsack({2}, {3}, 4) == 6);  // going up: the item twice
    assert(zeroOneKnapsack({2}, {3}, 4) == 3);    // going down: once
    std::mt19937 rng(20261124);
    for (int t = 0; t < 600; ++t) {
        RandomItems r = randomItems(rng, 4, 8, 20, 20);
        assert(unboundedKnapsack(r.weights, r.values, r.capacity) == bruteUnbounded(r.weights, r.values, r.capacity));
    }
    for (int t = 0; t < 600; ++t) {
        RandomItems r = randomItems(rng, 7, 10, 30, 25);
        long long once = zeroOneKnapsack(r.weights, r.values, r.capacity);
        assert(once == bruteZeroOne(r.weights, r.values, r.capacity));
        assert(once <= unboundedKnapsack(r.weights, r.values, r.capacity));
    }
    std::cout << "OK testLoopDirection" << std::endl;
}

void testReconstruction() {
    std::mt19937 rng(1449);
    for (int t = 0; t < 800; ++t) {
        RandomItems r = randomItems(rng, 6, 12, 50, 40);
        KnapsackChoice best = unboundedKnapsackItems(r.weights, r.values, r.capacity);
        assert(best.value == unboundedKnapsack(r.weights, r.values, r.capacity));
        assert(best.counts.size() == r.weights.size());
        long long weight = 0, value = 0;
        for (std::size_t i = 0; i < r.weights.size(); ++i) {
            assert(best.counts[i] >= 0);
            weight += static_cast<long long>(best.counts[i]) * r.weights[i];
            value += best.counts[i] * r.values[i];
        }
        assert(value == best.value);       // the multiset reaches the value
        assert(weight <= r.capacity);      // and fits
    }
    // Ties: the first item, in input order, that reaches the best value.
    assert(unboundedKnapsackItems({3, 3}, {4, 4}, 9).counts == Ints({3, 0}));
    assert(unboundedKnapsackItems({2, 4, 2}, {3, 6, 3}, 8).counts == Ints({4, 0, 0}));
    assert(unboundedKnapsackItems({2, 4}, {3, 6}, 4).counts == Ints({2, 0}));
    assert(unboundedKnapsackItems({4, 2}, {6, 3}, 4).counts == Ints({1, 0}));
    assert(unboundedKnapsackItems(kWeights, kValues, 6).counts == Ints({0, 2, 0, 0}));
    KnapsackChoice partial = unboundedKnapsackItems({3}, {5}, 7);  // weight 6 of capacity 7
    assert(partial.value == 10 && partial.counts == Ints({2}));
    std::cout << "OK testReconstruction" << std::endl;
}

void testTable() {
    std::mt19937 rng(474);
    for (int t = 0; t < 300; ++t) {
        RandomItems r = randomItems(rng, 6, 10, 40, 30);
        std::vector<Values> table = unboundedKnapsackTable(r.weights, r.values, r.capacity);
        assert(table.size() == r.weights.size() + 1);
        for (std::size_t i = 0; i <= r.weights.size(); ++i) {
            Ints w(r.weights.begin(), r.weights.begin() + i);
            Values v(r.values.begin(), r.values.begin() + i);
            // The one row after the first i items is row i of the table.
            assert(table[i] == unbounded_knapsack_detail::fillRow(w, v, r.capacity, true).dp);
        }
    }
    std::cout << "OK testTable" << std::endl;
}

void testEdgeCases() {
    assert(unboundedKnapsack(kWeights, kValues, 0) == 0);
    assert(unboundedKnapsackItems(kWeights, kValues, 0).counts == Ints({0, 0, 0, 0}));
    assert(unboundedKnapsackTable(kWeights, kValues, 0) == std::vector<Values>(5, Values{0}));
    assert(unboundedKnapsack({}, {}, 10) == 0 && zeroOneKnapsack({}, {}, 10) == 0);
    assert(unboundedKnapsackItems({}, {}, 10).counts.empty());
    assert(unboundedKnapsackTable({}, {}, 3) == std::vector<Values>({{0, 0, 0, 0}}));
    KnapsackChoice heavy = unboundedKnapsackItems({8, 9}, {100, 200}, 7);
    assert(heavy.value == 0 && heavy.counts == Ints({0, 0}));
    KnapsackChoice light = unboundedKnapsackItems({8, 2}, {100, 1}, 7);
    assert(light.value == 3 && light.counts == Ints({0, 3}));
    assert(unboundedKnapsackItems({3}, {5}, 2).value == 0);
    assert(unboundedKnapsackItems({1}, {5}, 6).counts == Ints({6}));
    // Values of 0 or less are never taken.
    KnapsackChoice none = unboundedKnapsackItems({1, 2}, {0, -3}, 5);
    assert(none.value == 0 && none.counts == Ints({0, 0}));
    KnapsackChoice some = unboundedKnapsackItems({1, 2}, {-1, 3}, 5);
    assert(some.value == 6 && some.counts == Ints({0, 2}));
    assert(zeroOneKnapsack({1, 2}, {-1, 3}, 5) == 3);
    KnapsackChoice large = unboundedKnapsackItems({7, 10}, {9, 13}, 100000);
    assert(large.value == 130000 && large.counts == Ints({0, 10000}));
    // Counts.
    assert(countCombinations({}, 0) == 1 && countPermutations({}, 0) == 1);
    assert(countCombinations({}, 5) == 0 && countPermutations({}, 5) == 0);
    assert(countCombinations({2, 4}, 7) == 0 && countPermutations({2, 4}, 7) == 0);
    assert(countCombinations({2, 2}, 4) == 3 && countPermutations({2, 2}, 4) == 4);  // duplicates are different items
    assert(countCombinations({9}, 4) == 0);
    std::cout << "OK testEdgeCases" << std::endl;
}

void testInvalidInputThrows() {
    // Weight 0 with a positive value could be taken without end: every function rejects it.
    assert(throwsInvalid([] { unboundedKnapsack({0}, {5}, 4); }));
    assert(throwsInvalid([] { unboundedKnapsackItems({2, 0}, {3, 0}, 4); }));
    assert(throwsInvalid([] { unboundedKnapsackTable({1, -2}, {1, 1}, 4); }));
    assert(throwsInvalid([] { zeroOneKnapsack({0}, {5}, 4); }));
    assert(throwsInvalid([] { countCombinations({1, 0}, 3); }));
    assert(throwsInvalid([] { countPermutations({1, 0}, 3); }));
    assert(throwsInvalid([] { unboundedKnapsack({1, 2}, {3}, 4); }));  // sizes differ
    assert(throwsInvalid([] { unboundedKnapsackItems({1}, {3}, -1); }));
    assert(throwsInvalid([] { unboundedKnapsackTable({1}, {3}, -1); }));
    assert(throwsInvalid([] { zeroOneKnapsack({1}, {3}, -1); }));
    assert(throwsInvalid([] { countCombinations({1, 2}, -1); }));
    assert(throwsInvalid([] { countPermutations({1, 2}, -1); }));
    std::cout << "OK testInvalidInputThrows" << std::endl;
}

void testOverflow() {
    const long long half = 1LL << 62;
    assert(unboundedKnapsack({1}, {half}, 1) == half);
    assert(throwsOverflow([&] { unboundedKnapsack({1}, {half}, 2); }));  // 2^63 does not fit
    assert(throwsOverflow([&] { unboundedKnapsackItems({1}, {half}, 2); }));
    assert(throwsOverflow([&] { unboundedKnapsackTable({1}, {half}, 2); }));
    assert(zeroOneKnapsack({1}, {half}, 2) == half);  // once: it fits
    assert(unboundedKnapsack({1}, {1000000000000LL}, 100000) == 100000000000000000LL);
    // Counts: Fibonacci numbers, the last one that fits, then one more.
    assert(countPermutations({1, 2}, 91) == 7540113804746346429LL);
    assert(throwsOverflow([] { countPermutations({1, 2}, 92); }));
    assert(throwsOverflow([] { countCombinations(Ints(30, 1), 100); }));
    // A table entry past LLONG_MAX is fine when the target's own count fits.
    assert(countPermutations({2, 4}, 191) == 0);
    assert(countCombinations(Ints(30, 2), 101) == 0);
    std::cout << "OK testOverflow" << std::endl;
}

void testCountsAgainstBruteForce() {
    std::mt19937 rng(1635);
    auto pick = [&](int lo, int hi) { return std::uniform_int_distribution<int>(lo, hi)(rng); };
    for (int t = 0; t < 500; ++t) {
        Ints w;
        for (int n = pick(0, 4); n > 0; --n) w.push_back(pick(1, 6));
        int target = pick(0, 14);
        assert(countCombinations(w, target) == bruteCombinations(w, target));
        assert(countPermutations(w, target) == brutePermutations(w, target));
    }
    assert(countCombinations({1, 2, 5}, 5) == 4 && countPermutations({1, 2, 5}, 5) == 9);
    std::cout << "OK testCountsAgainstBruteForce" << std::endl;
}

void testWorkCounts() {
    // Each item costs capacity - weight + 1 relaxations, in either direction.
    std::mt19937 rng(1634);
    for (int t = 0; t < 300; ++t) {
        RandomItems r = randomItems(rng, 8, 30, 50, 60);
        long long want = 0;
        for (int w : r.weights) want += std::max(0, r.capacity - w + 1);
        for (bool upward : {true, false}) {
            unbounded_knapsack_detail::Counters c;
            unbounded_knapsack_detail::fillRow(r.weights, r.values, r.capacity, upward, &c);
            assert(c.relaxations == want);
        }
    }
    // Pseudo-polynomial: one more bit in W doubles the work.
    long long expected[] = {3991, 7991, 15991, 31991, 63991};
    for (int k = 0; k < 5; ++k) {
        unbounded_knapsack_detail::Counters c;
        unbounded_knapsack_detail::fillRow(kWeights, kValues, 1000 << k, true, &c);
        assert(c.relaxations == expected[k]);
    }
    std::cout << "OK testWorkCounts" << std::endl;
}

// ---------------------------------------------------------------- agreement with Python

// Outputs computed by running the Python implementation (unbounded_knapsack.py): fixed cases
// first, then seeded random ones. Each case: weights, values, capacity, the best value, the
// counts unbounded_knapsack_items returns, and zero_one_knapsack's value.
struct PythonCase {
    Ints weights;
    Values values;
    int capacity;
    long long value;
    Ints counts;
    long long once;
};

// count_combinations and count_permutations on the same weights and target.
struct PythonCount {
    Ints weights;
    int target;
    long long combinations, permutations;
};

const std::vector<PythonCase> kPythonCases = {
    {{1, 3, 4, 5}, {1, 4, 5, 7}, 10, 14, {0, 0, 0, 2}, 13},
    {{1, 3, 4, 5}, {1, 4, 5, 7}, 7, 9, {1, 2, 0, 0}, 9},
    {{1, 3, 4, 5}, {1, 4, 5, 7}, 6, 8, {0, 2, 0, 0}, 8},
    {{1, 3, 4, 5}, {1, 4, 5, 7}, 0, 0, {0, 0, 0, 0}, 0},
    {{}, {}, 10, 0, {}, 0},
    {{2}, {3}, 4, 6, {2}, 3},
    {{3, 3}, {4, 4}, 9, 12, {3, 0}, 8},
    {{2, 4}, {3, 6}, 4, 6, {2, 0}, 6},
    {{4, 2}, {6, 3}, 4, 6, {1, 0}, 6},
    {{8, 9}, {100, 200}, 7, 0, {0, 0}, 0},
    {{8, 2}, {100, 1}, 7, 3, {0, 3}, 1},
    {{1, 2}, {0, -3}, 5, 0, {0, 0}, 0},
    {{1, 2}, {-1, 3}, 5, 6, {0, 2}, 3},
    {{3}, {5}, 7, 10, {2}, 5},
    {{7, 10}, {9, 13}, 100000, 130000, {0, 10000}, 22},
    {{10, 20, 30}, {60, 100, 120}, 50, 300, {5, 0, 0}, 220},
    {{11, 1}, {2, 43}, 8, 344, {0, 8}, 43},
    {{8, 8, 3, 8, 7}, {49, 53, 36, 15, 4}, 0, 0, {0, 0, 0, 0, 0}, 0},
    {{9, 1, 3, 11, 8}, {18, 56, 1, 48, 50}, 34, 1904, {0, 34, 0, 0, 0}, 173},
    {{10, 5, 2}, {4, 33, 16}, 10, 80, {0, 0, 5}, 49},
    {{9, 12, 6, 4}, {50, 16, 37, 43}, 16, 172, {0, 0, 0, 4}, 93},
    {{6, 10, 3}, {32, 21, 1}, 19, 96, {3, 0, 0}, 54},
    {{3}, {59}, 1, 0, {0}, 0},
    {{9, 8, 7}, {30, 25, 47}, 38, 235, {0, 0, 5}, 102},
    {{11, 7, 4, 6, 4}, {50, 54, 11, 7, 12}, 31, 216, {0, 4, 0, 0, 0}, 127},
    {{7, 4, 12, 2, 7, 3}, {57, 38, 59, 27, 24, 31}, 6, 81, {0, 0, 0, 3, 0, 0}, 65},
    {{1, 8, 7, 10}, {48, 55, 6, 2}, 31, 1488, {31, 0, 0, 0}, 111},
    {{9, 6}, {31, 10}, 9, 31, {1, 0}, 31},
    {{8, 11, 6, 1, 5, 7}, {24, 22, 60, 32, 40, 20}, 37, 1184, {0, 0, 0, 37, 0, 0}, 178},
    {{1}, {5}, 8, 40, {8}, 5},
    {{5, 4, 11, 7, 9}, {32, 4, 13, 2, 28}, 3, 0, {0, 0, 0, 0, 0}, 0},
    {{6}, {29}, 18, 87, {3}, 29},
    {{8, 7, 4, 7, 4, 12}, {60, 13, 29, 49, 59, 17}, 13, 177, {0, 0, 0, 0, 3, 0}, 119},
    {{6, 5, 1}, {22, 52, 0}, 31, 312, {0, 6, 0}, 74},
    {{10, 7, 11}, {42, 1, 47}, 8, 1, {0, 1, 0}, 1},
    {{4, 12, 4, 4, 9, 7}, {9, 3, 40, 36, 13, 46}, 2, 0, {0, 0, 0, 0, 0, 0}, 0},
    {{6, 1, 11, 7, 8, 6}, {38, 55, 19, 13, 50, 56}, 5, 275, {0, 5, 0, 0, 0, 0}, 55},
    {{9, 10, 5}, {12, 46, 4}, 36, 142, {0, 3, 1}, 62},
    {{6, 12}, {8, 1}, 24, 32, {4, 0}, 9},
    {{4, 7, 1, 8, 1, 11}, {19, 34, 8, 32, 36, 17}, 25, 900, {0, 0, 0, 0, 25, 0}, 129},
    {{9, 4, 3, 9}, {50, 0, 53, 55}, 8, 106, {0, 0, 2, 0}, 53},
    {{8, 12}, {52, 11}, 21, 104, {2, 0}, 63},
    {{6, 9, 10}, {42, 12, 18}, 15, 84, {2, 0, 0}, 54},
    {{10, 1, 8, 12, 8}, {20, 21, 30, 47, 47}, 8, 168, {0, 8, 0, 0, 0}, 47},
};

const std::vector<PythonCount> kPythonCounts = {
    {{1, 2, 5}, 5, 4LL, 9LL},
    {{1, 2, 5}, 11, 11LL, 218LL},
    {{2, 2}, 4, 3LL, 4LL},
    {{2, 4}, 7, 0LL, 0LL},
    {{}, 0, 1LL, 1LL},
    {{}, 5, 0LL, 0LL},
    {{3, 5}, 0, 1LL, 1LL},
    {{1, 2}, 91, 46LL, 7540113804746346429LL},
    {{2, 3, 5}, 9, 3LL, 8LL},
    {{1, 3, 4}, 6, 4LL, 9LL},
    {{8, 2}, 28, 4LL, 50LL},
    {{3}, 20, 0LL, 0LL},
    {{9}, 17, 0LL, 0LL},
    {{4, 1, 9}, 21, 11LL, 698LL},
    {{5, 2, 2}, 3, 0LL, 0LL},
    {{8, 4, 9}, 19, 0LL, 0LL},
    {{5, 7, 8}, 28, 3LL, 18LL},
    {{2}, 2, 1LL, 1LL},
    {{5, 7, 6, 3}, 28, 14LL, 570LL},
    {{7, 4, 7, 1}, 28, 45LL, 28844LL},
    {{9, 9}, 23, 0LL, 0LL},
    {{6, 1, 4, 2}, 26, 123LL, 2088402LL},
    {{9, 1, 2, 7}, 7, 5LL, 22LL},
    {{8}, 12, 0LL, 0LL},
};

void testAgreementWithPython() {
    for (std::size_t i = 0; i < kPythonCases.size(); ++i) {
        const PythonCase& c = kPythonCases[i];
        KnapsackChoice best = unboundedKnapsackItems(c.weights, c.values, c.capacity);
        bool same = best.value == c.value && best.counts == c.counts && unboundedKnapsack(c.weights, c.values, c.capacity) == c.value &&
                    zeroOneKnapsack(c.weights, c.values, c.capacity) == c.once;
        if (!same) std::cerr << "agreement case " << i << " differs from Python\n";
        assert(same);
    }
    for (std::size_t i = 0; i < kPythonCounts.size(); ++i) {
        const PythonCount& c = kPythonCounts[i];
        bool same = countCombinations(c.weights, c.target) == c.combinations && countPermutations(c.weights, c.target) == c.permutations;
        if (!same) std::cerr << "count case " << i << " differs from Python\n";
        assert(same);
    }
    std::cout << "OK testAgreementWithPython (" << kPythonCases.size() << " + " << kPythonCounts.size() << " cases)" << std::endl;
}

int main() {
    testWorkedExample();
    testLoopDirection();
    testReconstruction();
    testTable();
    testEdgeCases();
    testInvalidInputThrows();
    testOverflow();
    testCountsAgainstBruteForce();
    testWorkCounts();
    testAgreementWithPython();
    std::cout << "All Unbounded Knapsack tests passed!" << std::endl;
    return 0;
}
