// Unbounded Knapsack: the best total value within a capacity when every item may be taken any
// number of times.
//
// Item i weighs weights[i] (at least 1) and is worth values[i]. One row dp[0..W] holds, for
// every capacity w, the best value of a multiset of items whose total weight is at most w. For
// each item in input order, w runs UP from the item's weight to W:
//
//     dp[w] = max(dp[w], dp[w - weight] + value)
//
// Going up, dp[w - weight] has already been updated for this item, so taking it again is
// allowed. Running w DOWN (zeroOneKnapsack) reads the value from before this item instead, so
// each item is used at most once: the 0/1 knapsack. The loop direction is the only difference.
//
// Tie rule: dp[w] and choice[w] change only on a strict gain and the items are tried in input
// order, so choice[w] is the first item i such that items 0..i already reach the best value
// for w. The multiset read back from choice[] is the one the Python and Go versions return.
//
// A weight below 1, a negative capacity or target, and weights and values of different sizes
// throw std::invalid_argument. Values and counts are long long; a result above LLONG_MAX
// throws std::overflow_error (Python's integers do not overflow and return the exact number).
#include <climits>
#include <cstddef>
#include <stdexcept>
#include <string>
#include <vector>

// The best value and one optimal multiset: counts[i] copies of item i.
struct KnapsackChoice {
    long long value;
    std::vector<int> counts;
};

namespace unbounded_knapsack_detail {

// The work done by one fill, for the tests: every dp[w] = max(...) evaluated.
struct Counters {
    long long relaxations = 0;
};

inline void checkWeights(const std::vector<int>& weights) {
    for (std::size_t i = 0; i < weights.size(); ++i) {
        if (weights[i] < 1) {
            throw std::invalid_argument("item " + std::to_string(i) + " has weight " + std::to_string(weights[i]) +
                                        "; every weight must be at least 1");
        }
    }
}

inline void checkItems(const std::vector<int>& weights, const std::vector<long long>& values, int capacity) {
    if (weights.size() != values.size()) {
        throw std::invalid_argument(std::to_string(weights.size()) + " weights but " + std::to_string(values.size()) + " values");
    }
    if (capacity < 0) {
        throw std::invalid_argument("capacity must be >= 0, got " + std::to_string(capacity));
    }
    checkWeights(weights);
}

// dp[rest] + value, or std::overflow_error. dp[rest] >= 0, so only a positive value can overflow.
inline long long addValue(long long best, long long value) {
    if (value > 0 && best > LLONG_MAX - value) {
        throw std::overflow_error("the best value does not fit in long long");
    }
    return best + value;
}

struct Row {
    std::vector<long long> dp;  // dp[w]: the best value within capacity w
    std::vector<int> choice;    // choice[w]: the item that last raised dp[w], or -1
};

// The one-row table, w going up (each item reusable) or down (each item at most once).
inline Row fillRow(const std::vector<int>& weights, const std::vector<long long>& values, int capacity, bool upward,
                   Counters* counters = nullptr) {
    checkItems(weights, values, capacity);
    Row row{std::vector<long long>(capacity + 1, 0), std::vector<int>(capacity + 1, -1)};
    for (std::size_t i = 0; i < weights.size(); ++i) {
        const int weight = weights[i];
        // dp[w] = max(dp[w], dp[w - weight] + value); a strict gain makes item i the choice.
        auto relax = [&](int w) {
            if (counters) counters->relaxations++;
            const long long candidate = addValue(row.dp[w - weight], values[i]);
            if (candidate > row.dp[w]) {
                row.dp[w] = candidate;
                row.choice[w] = static_cast<int>(i);
            }
        };
        if (upward) {
            for (int w = weight; w <= capacity; ++w) relax(w);  // dp[w - weight] may already hold item i
        } else {
            for (int w = capacity; w >= weight; --w) relax(w);  // dp[w - weight] is still the old value
        }
    }
    return row;
}

// a + b for counts, where -1 stands for "more than LLONG_MAX" and absorbs everything.
inline long long addCount(long long a, long long b) {
    if (a < 0 || b < 0 || a > LLONG_MAX - b) return -1;
    return a + b;
}

inline long long finalCount(long long ways) {
    if (ways < 0) throw std::overflow_error("the number of ways does not fit in long long");
    return ways;
}

inline void checkTarget(int target) {
    if (target < 0) throw std::invalid_argument("target must be >= 0, got " + std::to_string(target));
}

}  // namespace unbounded_knapsack_detail

// The best total value of items that fit in capacity, each item usable any number of times.
// O(n * W) time, O(W) space.
inline long long unboundedKnapsack(const std::vector<int>& weights, const std::vector<long long>& values, int capacity) {
    return unbounded_knapsack_detail::fillRow(weights, values, capacity, true).dp[capacity];
}

// The same one-row loop with w going down: each item at most once (the 0/1 knapsack).
inline long long zeroOneKnapsack(const std::vector<int>& weights, const std::vector<long long>& values, int capacity) {
    return unbounded_knapsack_detail::fillRow(weights, values, capacity, false).dp[capacity];
}

// The best value and one optimal multiset, read back from choice[] starting at w = capacity.
// The counts reach the value, and their total weight is at most the capacity.
inline KnapsackChoice unboundedKnapsackItems(const std::vector<int>& weights, const std::vector<long long>& values, int capacity) {
    unbounded_knapsack_detail::Row row = unbounded_knapsack_detail::fillRow(weights, values, capacity, true);
    KnapsackChoice result{row.dp[capacity], std::vector<int>(weights.size(), 0)};
    for (int w = capacity; row.choice[w] != -1; w -= weights[row.choice[w]]) {
        result.counts[row.choice[w]]++;
    }
    return result;
}

// The 2D form: table[i][w] is the best value within w using only the first i items, and
// table[i][w] = max(table[i-1][w], table[i][w - weight] + value) reads row i itself.
inline std::vector<std::vector<long long>> unboundedKnapsackTable(const std::vector<int>& weights, const std::vector<long long>& values,
                                                                  int capacity) {
    unbounded_knapsack_detail::checkItems(weights, values, capacity);
    const std::size_t n = weights.size();
    std::vector<std::vector<long long>> table(n + 1, std::vector<long long>(capacity + 1, 0));
    for (std::size_t i = 1; i <= n; ++i) {
        const int weight = weights[i - 1];
        for (int w = 0; w <= capacity; ++w) {
            table[i][w] = table[i - 1][w];
            if (weight <= w) {
                const long long candidate = unbounded_knapsack_detail::addValue(table[i][w - weight], values[i - 1]);
                if (candidate > table[i][w]) table[i][w] = candidate;
            }
        }
    }
    return table;
}

// The number of multisets of items (told apart by position) whose weights add up to exactly
// target: the items are the outer loop, so each combination is counted once.
inline long long countCombinations(const std::vector<int>& weights, int target) {
    unbounded_knapsack_detail::checkTarget(target);
    unbounded_knapsack_detail::checkWeights(weights);
    std::vector<long long> ways(target + 1, 0);
    ways[0] = 1;
    for (int weight : weights) {
        for (int t = weight; t <= target; ++t) {
            ways[t] = unbounded_knapsack_detail::addCount(ways[t], ways[t - weight]);
        }
    }
    return unbounded_knapsack_detail::finalCount(ways[target]);
}

// The number of sequences of items whose weights add up to exactly target: the totals are the
// outer loop and every possible last item is added, so every order is counted.
inline long long countPermutations(const std::vector<int>& weights, int target) {
    unbounded_knapsack_detail::checkTarget(target);
    unbounded_knapsack_detail::checkWeights(weights);
    std::vector<long long> ways(target + 1, 0);
    ways[0] = 1;
    for (int t = 1; t <= target; ++t) {
        for (int weight : weights) {
            if (weight <= t) ways[t] = unbounded_knapsack_detail::addCount(ways[t], ways[t - weight]);
        }
    }
    return unbounded_knapsack_detail::finalCount(ways[target]);
}

#ifndef IS_TEST_BUILD
#include <iostream>

int main() {
    // The items of the 0/1 Knapsack topic, with capacity 10.
    std::vector<int> weights = {1, 3, 4, 5};
    std::vector<long long> values = {1, 4, 5, 7};
    KnapsackChoice best = unboundedKnapsackItems(weights, values, 10);
    std::cout << "unbounded: " << unboundedKnapsack(weights, values, 10) << "\n";  // 14
    std::cout << "items:";
    for (int c : best.counts) std::cout << " " << c;  // 0 0 0 2
    std::cout << "\n";
    std::cout << "each item once: " << zeroOneKnapsack(weights, values, 10) << "\n";  // 13
    std::cout << "combinations: " << countCombinations({1, 2, 5}, 5) << "\n";        // 4
    std::cout << "permutations: " << countPermutations({1, 2, 5}, 5) << "\n";        // 9
    return 0;
}
#endif
