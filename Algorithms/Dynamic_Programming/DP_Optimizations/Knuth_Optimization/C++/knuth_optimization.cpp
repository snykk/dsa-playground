// Knuth's optimization: the interval DP
//
//   dp[i][j] = min over i <= k < j of dp[i][k] + dp[k+1][j] + C(i, j),   dp[i][i] = 0
//
// in O(n^2) time instead of O(n^3). When the smallest best split moves in one direction only,
// split[i][j-1] <= split[i][j] <= split[i+1][j], the cell (i, j) only tries k from
// split[i][j-1] to split[i+1][j] (k = i alone for two points). Along one diagonal the upper end
// of a cell's window is the lower end of the next cell's, so the window sizes telescope to O(n)
// per diagonal. A sufficient condition: for every a <= b <= c <= d,
//
//   quadrangle inequality:  C(a, c) + C(b, d) <= C(a, d) + C(b, c)
//   monotone on intervals:  C(b, c) <= C(a, d)
//
// splitDp takes any cost of 0 or more (knuth = false tries every k: the plain interval DP);
// mergePiles and mergePilesPlan solve Interval DP's pile merging, C(i, j) = sum(i..j); and
// optimalBst the optimal binary search tree, C(i, j) = freq[i] + ... + freq[j-1] over the n + 1
// gaps between the keys.
//
// Tie rule: the k of a window are tried in increasing order and a cell changes only on a
// strict gain, so split[i][j] is the smallest best k, the same table as the plain DP's, and the
// merges come in the same post-order as the Python and Go versions.
//
// Values and costs must be 0 or more, and n 0 or more (std::invalid_argument otherwise). Costs
// are long long; a result above LLONG_MAX throws std::overflow_error, where Python returns the
// exact number.
#include <climits>
#include <cstddef>
#include <functional>
#include <stdexcept>
#include <string>
#include <utility>
#include <vector>

// One merge: the pile made of piles i..k joins the pile made of piles k+1..j.
struct Merge {
    int i, k, j;
    bool operator==(const Merge& other) const { return i == other.i && k == other.k && j == other.j; }
};

// The minimum cost and one order of merges that reaches it.
struct MergePlan {
    long long cost;
    std::vector<Merge> merges;
};

namespace knuth_detail {

// The work done by one fill, for the tests: every split tried.
struct Counters {
    long long tries = 0;
};

// A cost that does not fit in a long long. Costs are never negative, so -1 is free to mean
// "more than LLONG_MAX"; it absorbs every sum it enters and loses every minimum.
constexpr long long kTooLarge = -1;

inline long long addCost(long long a, long long b) {
    if (a == kTooLarge || b == kTooLarge || a > LLONG_MAX - b) return kTooLarge;
    return a + b;
}

// prefix[t] = values[0] + ... + values[t - 1], after checking that every value is 0 or more.
// With two points or more the top cell adds the whole total, so a total that does not fit
// means an answer that does not fit.
inline std::vector<long long> prefixSums(const std::vector<long long>& values, const std::string& what) {
    for (std::size_t i = 0; i < values.size(); ++i) {
        if (values[i] < 0) {
            throw std::invalid_argument(what + " " + std::to_string(i) + " is " + std::to_string(values[i]) + "; every " + what +
                                        " must be 0 or more");
        }
    }
    std::vector<long long> prefix(values.size() + 1, 0);
    for (std::size_t t = 0; t < values.size(); ++t) {
        if (prefix[t] > LLONG_MAX - values[t]) throw std::overflow_error("the total of the " + what + "s does not fit in long long");
        prefix[t + 1] = prefix[t] + values[t];
    }
    return prefix;
}

struct Tables {
    std::vector<std::vector<long long>> dp;  // dp[i][j]; kTooLarge when it does not fit
    std::vector<std::vector<int>> split;     // the smallest k that reaches dp[i][j]; -1 when i == j
};

// The splits Knuth's optimization tries for dp[i][j], both ends included: k = i alone for two
// points, otherwise split[i][j-1] to split[i+1][j].
inline std::pair<int, int> window(const std::vector<std::vector<int>>& split, int i, int j) {
    if (j - i == 1) return {i, i};
    return {split[i][j - 1], split[i + 1][j]};
}

// One candidate for dp[i][j]: the parts i..k and k+1..j, joined at the cost join = C(i, j). A
// strict gain keeps k, and a candidate too large to store never wins.
inline void trySplit(Tables& t, long long join, int i, int k, int j, Counters* counters) {
    if (counters) counters->tries++;
    const long long cost = addCost(addCost(t.dp[i][k], t.dp[k + 1][j]), join);
    if (cost != kTooLarge && (t.dp[i][j] == kTooLarge || cost < t.dp[i][j])) {
        t.dp[i][j] = cost;
        t.split[i][j] = k;
    }
}

// The tables for n points, by increasing length; with knuth = false every k from i to j - 1.
template <typename Cost>
Tables fill(int n, const Cost& cost, bool knuth, Counters* counters = nullptr) {
    Tables t{std::vector<std::vector<long long>>(n, std::vector<long long>(n, 0)), std::vector<std::vector<int>>(n, std::vector<int>(n, -1))};
    for (int length = 2; length <= n; ++length) {
        for (int i = 0; i + length - 1 < n; ++i) {
            const int j = i + length - 1;
            const std::pair<int, int> w = knuth ? window(t.split, i, j) : std::make_pair(i, j - 1);
            const long long join = cost(i, j);
            if (join < 0) {
                throw std::invalid_argument("cost(" + std::to_string(i) + ", " + std::to_string(j) + ") is " + std::to_string(join) +
                                            "; every cost must be 0 or more");
            }
            t.dp[i][j] = kTooLarge;  // no candidate yet: larger than any cost
            // If no candidate fits, the cell keeps the window's first k, so the windows that read
            // it stay in range; the answer is then too large anyway, since it is at least this cell.
            t.split[i][j] = w.first;
            for (int k = w.first; k <= w.second; ++k) trySplit(t, join, i, k, j, counters);
        }
    }
    return t;
}

inline long long answer(const Tables& t) {
    if (t.dp.empty()) return 0;
    const long long cost = t.dp.front().back();
    if (cost == kTooLarge) throw std::overflow_error("the minimum cost does not fit in long long");
    return cost;
}

inline Tables fillMerge(const std::vector<long long>& piles, Counters* counters = nullptr) {
    const std::vector<long long> prefix = prefixSums(piles, "pile");
    return fill(static_cast<int>(piles.size()), [&prefix](int i, int j) { return prefix[j + 1] - prefix[i]; }, true, counters);
}

// Over the n + 1 gaps between the keys: dp[i][j] is the best tree of keys i..j-1, and its root
// is split[i][j].
inline Tables fillBst(const std::vector<long long>& freq, Counters* counters = nullptr) {
    const std::vector<long long> prefix = prefixSums(freq, "frequency");
    return fill(static_cast<int>(freq.size()) + 1, [&prefix](int i, int j) { return prefix[j] - prefix[i]; }, true, counters);
}

// The merges of the split tree of i..j in post-order, with an explicit stack: each merge after
// the merges that build its two parts, the left part's first.
inline std::vector<Merge> readMerges(const std::vector<std::vector<int>>& split, int i, int j) {
    struct Item {
        int lo, hi;
        bool partsBuilt;
    };
    std::vector<Merge> merges;
    std::vector<Item> stack = {{i, j, false}};
    while (!stack.empty()) {
        const Item item = stack.back();
        stack.pop_back();
        if (item.lo == item.hi) continue;  // a single pile is already built
        const int k = split[item.lo][item.hi];
        if (item.partsBuilt) {
            merges.push_back({item.lo, k, item.hi});
        } else {
            stack.push_back({item.lo, item.hi, true});
            stack.push_back({k + 1, item.hi, false});
            stack.push_back({item.lo, k, false});
        }
    }
    return merges;
}

}  // namespace knuth_detail

// dp[0][n-1] for dp[i][j] = min over i <= k < j of dp[i][k] + dp[k+1][j] + cost(i, j); 0 for
// n of 0 or 1. With knuth (the default) only the window is tried, which is right when the cost
// satisfies the quadrangle inequality and is monotone; without it every k is tried.
// O(n^2) with knuth, O(n^3) without; O(n^2) space.
inline long long splitDp(int n, const std::function<long long(int, int)>& cost, bool knuth = true) {
    if (n < 0) throw std::invalid_argument("n is " + std::to_string(n) + "; it must be 0 or more");
    return knuth_detail::answer(knuth_detail::fill(n, cost, knuth));
}

// The minimum total cost of merging adjacent piles into one; a merge costs the size of the pile
// it makes. 0 for no piles or one pile. O(n^2) time and space.
inline long long mergePiles(const std::vector<long long>& piles) {
    return knuth_detail::answer(knuth_detail::fillMerge(piles));
}

// The minimum cost and the merges that reach it: (i, k, j) joins piles i..k with piles k+1..j,
// in post-order, with the smallest k on ties; the same as Interval DP's mergePilesPlan.
inline MergePlan mergePilesPlan(const std::vector<long long>& piles) {
    knuth_detail::Tables t = knuth_detail::fillMerge(piles);
    MergePlan plan{knuth_detail::answer(t), {}};
    if (!piles.empty()) plan.merges = knuth_detail::readMerges(t.split, 0, static_cast<int>(piles.size()) - 1);
    return plan;
}

// The least total search cost sum(freq[t] * depth(t)) of a binary search tree on keys 0..n-1
// in order, the root at depth 1. 0 for no keys. O(n^2) time and space.
inline long long optimalBst(const std::vector<long long>& freq) {
    return knuth_detail::answer(knuth_detail::fillBst(freq));
}

#ifndef IS_TEST_BUILD
#include <iostream>

int main() {
    const std::vector<long long> piles = {3, 2, 4, 1};
    std::cout << "mergePiles: " << mergePiles(piles) << "\n";  // 20
    std::cout << "merges:";
    for (const Merge& m : mergePilesPlan(piles).merges) std::cout << " (" << m.i << ", " << m.k << ", " << m.j << ")";
    std::cout << "\n";                                                 // (0, 0, 1) (2, 2, 3) (0, 1, 3)
    std::cout << "optimalBst: " << optimalBst({34, 8, 50}) << "\n";  // 142
    // A merge that costs the square root of its size, rounded down, breaks the quadrangle
    // inequality: on these piles the window misses the best split.
    const std::vector<long long> prefix = {0, 1, 2, 4, 5, 11};
    auto rootCost = [&prefix](int i, int j) {
        long long size = prefix[j + 1] - prefix[i], root = 0;
        while ((root + 1) * (root + 1) <= size) ++root;
        return root;
    };
    std::cout << "splitDp: " << splitDp(5, rootCost) << " " << splitDp(5, rootCost, false) << "\n";  // 8 7
    return 0;
}
#endif
