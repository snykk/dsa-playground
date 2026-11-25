// Divide and Conquer Optimization: a layered DP
//
//     dp[g][i] = min over j < i of dp[g - 1][j] + C(j, i)
//
// computed in O(n log n) per layer instead of O(n^2), when the best j, opt(g, i), never moves
// left as i grows: opt(g, i) <= opt(g, i + 1).
//
// The example problem: split values (each >= 0) into exactly k contiguous, non-empty groups so
// that the sum over the groups of (sum of the group)^2 is as small as possible. C(j, i) =
// (P[i] - P[j])^2 is the cost of the group values[j..i-1], read in O(1) from the prefix sums.
//
// One layer: solve the middle cell mid of [lo, hi] by trying every j in
// [optLo, min(optHi, mid - 1)], then the left half with j up to opt(mid) and the right half with
// j from opt(mid). O(m log m) cost evaluations for a layer of m cells, O(k n log n) in all,
// against O(k n^2) for the plain DP (minCostPartitionPlain).
//
// It is correct when C satisfies the quadrangle inequality C(a, c) + C(b, d) <= C(a, d) + C(b, c)
// for a <= b <= c <= d. For the square of the sum the difference of the two sides is
// -2 (P[b] - P[a]) (P[d] - P[c]), which is <= 0 when every value is >= 0; with a negative value
// partitionDp(..., true) can return a worse split than partitionDp(..., false), so the two
// concrete functions reject negative values.
//
// Tie rule: opt(g, i) is the smallest j that reaches the minimum, in both versions, as in the
// Python and Go code.
//
// k < 1, k > n (groups are not empty) and a negative value throw std::invalid_argument. Values
// and costs are long long: before the DP, minCostPartition checks that the total is at most
// 3037000499, whose square is the largest that fits; every number the DP forms is at most the
// square of the total, so nothing can overflow after that check. A larger total throws
// std::overflow_error (Python's integers do not overflow). partitionDp checks every sum it forms
// and throws std::overflow_error when one does not fit.
#include <algorithm>
#include <climits>
#include <cstddef>
#include <stdexcept>
#include <string>
#include <utility>
#include <vector>

// The best total and its groups: group g is values[bounds[g] .. bounds[g + 1] - 1].
struct Partition {
    long long cost;
    std::vector<int> bounds;
};

namespace dnc_optimization_detail {

// 3037000499^2 <= LLONG_MAX < 3037000500^2.
constexpr long long kMaxTotal = 3037000499LL;

inline void checkK(int n, int k) {
    if (k < 1) throw std::invalid_argument("k must be at least 1, got " + std::to_string(k));
    if (k > n) {
        throw std::invalid_argument("cannot split " + std::to_string(n) + " values into " + std::to_string(k) + " non-empty groups");
    }
}

// a + b, or std::overflow_error.
inline long long addChecked(long long a, long long b) {
    if ((b > 0 && a > LLONG_MAX - b) || (b < 0 && a < LLONG_MIN - b)) {
        throw std::overflow_error("a sum of costs does not fit in long long");
    }
    return a + b;
}

// P[i] = values[0] + ... + values[i - 1]. Every value must be >= 0, and the total at most kMaxTotal.
inline std::vector<long long> prefixSums(const std::vector<long long>& values) {
    for (std::size_t t = 0; t < values.size(); ++t) {
        if (values[t] < 0) {
            throw std::invalid_argument("values[" + std::to_string(t) + "] = " + std::to_string(values[t]) + "; every value must be >= 0");
        }
    }
    std::vector<long long> prefix(values.size() + 1, 0);
    for (std::size_t t = 0; t < values.size(); ++t) {
        if (values[t] > kMaxTotal - prefix[t]) {
            throw std::overflow_error("the total passes 3037000499, so its square does not fit in long long");
        }
        prefix[t + 1] = prefix[t] + values[t];
    }
    return prefix;
}

// min over j in [jLo, jHi] of prev[j] + cost(j, i), and the smallest j that reaches it.
template <typename Cost>
std::pair<long long, int> bestSplit(const std::vector<long long>& prev, Cost& cost, int i, int jLo, int jHi) {
    long long best = addChecked(prev[jLo], cost(jLo, i));
    int bestJ = jLo;
    for (int j = jLo + 1; j <= jHi; ++j) {
        const long long candidate = addChecked(prev[j], cost(j, i));
        if (candidate < best) {
            best = candidate;
            bestJ = j;
        }
    }
    return {best, bestJ};
}

// Fill cur[i] and optRow[i] for every i in [lo, hi] of layer g, given opt in [optLo, optHi].
template <typename Cost>
void solveRange(const std::vector<long long>& prev, std::vector<long long>& cur, std::vector<int>& optRow, Cost& cost, int g, int lo,
                int hi, int optLo, int optHi) {
    if (lo > hi) return;
    const int mid = lo + (hi - lo) / 2;
    // j < mid keeps the group non-empty; j >= g - 1 leaves g - 1 values for g - 1 groups.
    const std::pair<long long, int> best = bestSplit(prev, cost, mid, std::max(optLo, g - 1), std::min(optHi, mid - 1));
    cur[mid] = best.first;
    optRow[mid] = best.second;
    solveRange(prev, cur, optRow, cost, g, lo, mid - 1, optLo, optRow[mid]);  // left: j <= opt(mid)
    solveRange(prev, cur, optRow, cost, g, mid + 1, hi, optRow[mid], optHi);  // right: j >= opt(mid)
}

}  // namespace dnc_optimization_detail

// Split positions 0..n-1 into k non-empty contiguous groups, minimizing the sum of cost(j, i)
// over the groups [j, i). optimized = true uses the divide-and-conquer recursion (correct when
// the smallest best j is monotone in i); false is the plain O(k n^2) DP, correct for any cost.
// cost is any callable long long(int j, int i).
template <typename Cost>
Partition partitionDp(int n, int k, Cost cost, bool optimized = true) {
    namespace d = dnc_optimization_detail;
    d::checkK(n, k);
    std::vector<std::vector<int>> opt(k + 1, std::vector<int>(n + 1, 0));
    std::vector<long long> prev(n + 1, 0);
    for (int i = 1; i <= n; ++i) prev[i] = cost(0, i);  // layer 1: one group
    for (int g = 2; g <= k; ++g) {
        std::vector<long long> cur(n + 1, 0);
        if (optimized) {
            d::solveRange(prev, cur, opt[g], cost, g, g, n, g - 1, n - 1);
        } else {
            for (int i = g; i <= n; ++i) {
                const std::pair<long long, int> best = d::bestSplit(prev, cost, i, g - 1, i - 1);
                cur[i] = best.first;
                opt[g][i] = best.second;
            }
        }
        prev.swap(cur);
    }
    Partition result{prev[n], std::vector<int>(k + 1, 0)};
    result.bounds[k] = n;
    for (int g = k; g > 1; --g) result.bounds[g - 1] = opt[g][result.bounds[g]];
    return result;
}

namespace dnc_optimization_detail {

inline Partition squareOfSum(const std::vector<long long>& values, int k, bool optimized) {
    checkK(static_cast<int>(values.size()), k);
    const std::vector<long long> prefix = prefixSums(values);
    auto cost = [&prefix](int j, int i) {
        const long long s = prefix[i] - prefix[j];
        return s * s;
    };
    return partitionDp(static_cast<int>(values.size()), k, cost, optimized);
}

}  // namespace dnc_optimization_detail

// The smallest sum of (group sum)^2 over k contiguous non-empty groups, and the groups, with the
// divide-and-conquer optimization. O(k n log n) time, O(k n) space.
inline Partition minCostPartition(const std::vector<long long>& values, int k) {
    return dnc_optimization_detail::squareOfSum(values, k, true);
}

// The same answer and bounds from the plain DP. O(k n^2) time, O(k n) space.
inline Partition minCostPartitionPlain(const std::vector<long long>& values, int k) {
    return dnc_optimization_detail::squareOfSum(values, k, false);
}

#ifndef IS_TEST_BUILD
#include <iostream>

int main() {
    const std::vector<long long> values = {3, 1, 4, 1, 5, 9, 2, 6};
    const Partition best = minCostPartition(values, 3);
    std::cout << "cost: " << best.cost << "\n";  // 341
    std::cout << "bounds:";
    for (int b : best.bounds) std::cout << " " << b;  // 0 4 6 8
    std::cout << "\n";
    std::cout << "plain DP: " << minCostPartitionPlain(values, 3).cost << "\n";  // 341
    // A negative value breaks the quadrangle inequality, and the recursion misses the best split.
    const std::vector<long long> prefix = {0, 1, 3, 7, 2};  // values 1, 2, 4, -5
    auto square = [&prefix](int j, int i) { return (prefix[i] - prefix[j]) * (prefix[i] - prefix[j]); };
    std::cout << "optimized: " << partitionDp(4, 2, square, true).cost << "\n";  // 10: wrong
    std::cout << "plain: " << partitionDp(4, 2, square, false).cost << "\n";     // 2
    return 0;
}
#endif
