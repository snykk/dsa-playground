// Interval DP: the best way to handle a contiguous range i..j, built from the best ways to
// handle shorter ranges inside it.
//
// dp[i][j] answers the question for the range i..j alone, from one choice inside it (a split
// point k, or the last action taken in it) and the answers for the two shorter ranges that
// choice leaves. The table is filled by increasing length, so those answers are always ready:
// O(n^3) time and O(n^2) space. Three problems:
//
//   mergePiles:        dp[i][j] = min over i <= k < j of dp[i][k] + dp[k+1][j] + sum(i..j)
//   burstBalloons:     dp[l][r] = max over l < k < r of dp[l][k] + v[l] * v[k] * v[r] + dp[k][r]
//                      (k is the LAST balloon burst between l and r, which are still there)
//   minPalindromeCuts: cuts[i][j] = 0 for a palindrome, else min over k of cuts[i][k] + 1 + cuts[k+1][j]
//
// Tie rule (mergePilesPlan): the splits k are tried in increasing order and dp[i][j] changes
// only on a strict gain, so split[i][j] is the smallest k that reaches the minimum. The merges
// come in post-order of the split tree (left part, right part, then the merge joining them),
// the same list as the Python and Go versions.
//
// Pile sizes and balloon values must be 0 or more (std::invalid_argument otherwise). Costs and
// coins are long long; a result above LLONG_MAX throws std::overflow_error, where Python
// returns the exact number. minPalindromeCuts compares bytes.
#include <climits>
#include <cstddef>
#include <stdexcept>
#include <string>
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

namespace interval_dp_detail {

// The work done by one fill, for the tests: every candidate tried for a cell.
struct Counters {
    long long candidates = 0;
};

// A cost that does not fit in a long long. Merge costs are never negative, so -1 is free to
// mean "more than LLONG_MAX"; it absorbs every sum it enters and loses every minimum.
constexpr long long kTooLarge = -1;

inline long long addCost(long long a, long long b) {
    if (a == kTooLarge || b == kTooLarge || a > LLONG_MAX - b) return kTooLarge;
    return a + b;
}

inline void checkNonNegative(const std::vector<long long>& values, const std::string& what) {
    for (std::size_t i = 0; i < values.size(); ++i) {
        if (values[i] < 0) {
            throw std::invalid_argument(what + " " + std::to_string(i) + " is " + std::to_string(values[i]) + "; every " + what +
                                        " must be 0 or more");
        }
    }
}

struct MergeTables {
    std::vector<std::vector<long long>> dp;  // dp[i][j]; kTooLarge when it does not fit
    std::vector<std::vector<int>> split;     // the smallest k that reaches dp[i][j]; -1 when i == j
    std::vector<long long> prefix;           // prefix[t] = piles[0] + ... + piles[t - 1]
};

inline MergeTables newTables(const std::vector<long long>& piles) {
    checkNonNegative(piles, "pile");
    const std::size_t n = piles.size();
    MergeTables t{std::vector<std::vector<long long>>(n, std::vector<long long>(n, 0)), std::vector<std::vector<int>>(n, std::vector<int>(n, -1)),
                  std::vector<long long>(n + 1, 0)};
    for (std::size_t i = 0; i < n; ++i) {
        // The last merge costs the total, so with two piles or more a total that does not fit
        // means a cost that does not fit; one pile costs 0 whatever its size.
        if (t.prefix[i] > LLONG_MAX - piles[i]) throw std::overflow_error("the total of the piles does not fit in long long");
        t.prefix[i + 1] = t.prefix[i] + piles[i];
    }
    return t;
}

// One candidate for dp[i][j]: the last merge joins i..k and k+1..j. A strict gain keeps k, and
// a candidate too large to store never wins.
inline void trySplit(MergeTables& t, int i, int k, int j, Counters* counters) {
    if (counters) counters->candidates++;
    const long long cost = addCost(addCost(t.dp[i][k], t.dp[k + 1][j]), t.prefix[j + 1] - t.prefix[i]);
    if (cost != kTooLarge && (t.dp[i][j] == kTooLarge || cost < t.dp[i][j])) {
        t.dp[i][j] = cost;
        t.split[i][j] = k;
    }
}

// Bottom-up, by increasing length: i..k and k+1..j are shorter than i..j, so already final.
inline MergeTables fillMerge(const std::vector<long long>& piles, Counters* counters = nullptr) {
    MergeTables t = newTables(piles);
    const int n = static_cast<int>(piles.size());
    for (int length = 2; length <= n; ++length) {
        for (int i = 0; i + length - 1 < n; ++i) {
            const int j = i + length - 1;
            t.dp[i][j] = kTooLarge;  // no candidate yet: larger than any cost
            for (int k = i; k < j; ++k) trySplit(t, i, k, j, counters);
        }
    }
    return t;
}

// Top-down: the same cells, each computed once, when a larger range first asks for it. The
// recursion goes up to n calls deep.
struct MemoSolver {
    MergeTables& t;
    std::vector<std::vector<char>> solved;
    Counters* counters;

    void solve(int i, int j) {
        if (solved[i][j]) return;
        t.dp[i][j] = kTooLarge;
        for (int k = i; k < j; ++k) {
            solve(i, k);
            solve(k + 1, j);
            trySplit(t, i, k, j, counters);
        }
        solved[i][j] = 1;
    }
};

inline MergeTables fillMergeMemo(const std::vector<long long>& piles, Counters* counters = nullptr) {
    MergeTables t = newTables(piles);
    const std::size_t n = piles.size();
    MemoSolver solver{t, std::vector<std::vector<char>>(n, std::vector<char>(n, 0)), counters};
    for (std::size_t i = 0; i < n; ++i) solver.solved[i][i] = 1;
    if (n > 0) solver.solve(0, static_cast<int>(n) - 1);
    return t;
}

inline long long answer(const MergeTables& t) {
    if (t.dp.empty()) return 0;
    const long long cost = t.dp.front().back();
    if (cost == kTooLarge) throw std::overflow_error("the minimum cost does not fit in long long");
    return cost;
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

// a * b * c for values of 0 or more, or std::overflow_error. A zero factor gives 0 before any
// product is formed, so a large partial product never raises a false alarm.
inline long long product3(long long a, long long b, long long c) {
    if (a == 0 || b == 0 || c == 0) return 0;
    if (a > LLONG_MAX / b) throw std::overflow_error("the coins do not fit in long long");
    const long long ab = a * b;
    if (ab > LLONG_MAX / c) throw std::overflow_error("the coins do not fit in long long");
    return ab * c;
}

inline long long addCoins(long long a, long long b) {
    if (a > LLONG_MAX - b) throw std::overflow_error("the coins do not fit in long long");
    return a + b;
}

// One candidate for dp[left][right]: balloon k is burst last between left and right. Every
// candidate is at most the final answer, so one that does not fit means the answer does not.
inline void tryLast(std::vector<std::vector<long long>>& dp, const std::vector<long long>& vals, int left, int k, int right, Counters* counters) {
    if (counters) counters->candidates++;
    const long long coins = addCoins(addCoins(dp[left][k], product3(vals[left], vals[k], vals[right])), dp[k][right]);
    if (coins > dp[left][right]) dp[left][right] = coins;
}

inline long long burst(const std::vector<long long>& nums, Counters* counters) {
    checkNonNegative(nums, "balloon");
    std::vector<long long> vals = {1};
    vals.insert(vals.end(), nums.begin(), nums.end());
    vals.push_back(1);
    const int m = static_cast<int>(vals.size());
    std::vector<std::vector<long long>> dp(m, std::vector<long long>(m, 0));
    for (int gap = 2; gap < m; ++gap) {  // right - left: the open range holds gap - 1 balloons
        for (int left = 0; left + gap < m; ++left) {
            const int right = left + gap;
            for (int k = left + 1; k < right; ++k) tryLast(dp, vals, left, k, right, counters);
        }
    }
    return dp[0][m - 1];
}

// pal[i][j]: s[i..j] reads the same both ways; filled by length, O(n^2).
inline std::vector<std::vector<char>> palindromeTable(const std::string& s) {
    const int n = static_cast<int>(s.size());
    std::vector<std::vector<char>> pal(n, std::vector<char>(n, 0));
    for (int length = 1; length <= n; ++length) {
        for (int i = 0; i + length - 1 < n; ++i) {
            const int j = i + length - 1;
            pal[i][j] = s[i] == s[j] && (length <= 2 || pal[i + 1][j - 1]);
        }
    }
    return pal;
}

inline int cuts(const std::string& s, Counters* counters) {
    const int n = static_cast<int>(s.size());
    if (n == 0) return 0;
    const std::vector<std::vector<char>> pal = palindromeTable(s);
    std::vector<std::vector<int>> dp(n, std::vector<int>(n, 0));
    for (int length = 2; length <= n; ++length) {
        for (int i = 0; i + length - 1 < n; ++i) {
            const int j = i + length - 1;
            if (pal[i][j]) continue;  // a palindrome needs no cut
            dp[i][j] = j - i;         // a cut between every two neighbours is always enough
            for (int k = i; k < j; ++k) {
                if (counters) counters->candidates++;
                const int candidate = dp[i][k] + 1 + dp[k + 1][j];
                if (candidate < dp[i][j]) dp[i][j] = candidate;
            }
        }
    }
    return dp[0][n - 1];
}

}  // namespace interval_dp_detail

// The minimum total cost of merging adjacent piles into one; a merge costs the size of the pile
// it makes. 0 for no piles or one pile. O(n^3) time, O(n^2) space.
inline long long mergePiles(const std::vector<long long>& piles) {
    return interval_dp_detail::answer(interval_dp_detail::fillMerge(piles));
}

// The minimum cost and the merges that reach it: (i, k, j) joins piles i..k with piles k+1..j,
// in post-order, with the smallest k on ties.
inline MergePlan mergePilesPlan(const std::vector<long long>& piles) {
    interval_dp_detail::MergeTables t = interval_dp_detail::fillMerge(piles);
    MergePlan plan{interval_dp_detail::answer(t), {}};
    if (!piles.empty()) plan.merges = interval_dp_detail::readMerges(t.split, 0, static_cast<int>(piles.size()) - 1);
    return plan;
}

// mergePiles computed top-down with a memo: the same cells and the same answer.
inline long long mergePilesMemo(const std::vector<long long>& piles) {
    return interval_dp_detail::answer(interval_dp_detail::fillMergeMemo(piles));
}

// The most coins from bursting every balloon; bursting one earns the product of its value and
// its current neighbours' values (1 past either end). O(n^3) time, O(n^2) space.
inline long long burstBalloons(const std::vector<long long>& nums) {
    return interval_dp_detail::burst(nums, nullptr);
}

// The fewest cuts that split s into palindromes, comparing bytes. O(n^3) time, O(n^2) space.
inline int minPalindromeCuts(const std::string& s) {
    return interval_dp_detail::cuts(s, nullptr);
}

#ifndef IS_TEST_BUILD
#include <iostream>

int main() {
    const std::vector<long long> piles = {3, 2, 4, 1};
    std::cout << "mergePiles: " << mergePiles(piles) << "\n";  // 20
    std::cout << "merges:";
    for (const Merge& m : mergePilesPlan(piles).merges) std::cout << " (" << m.i << ", " << m.k << ", " << m.j << ")";
    std::cout << "\n";                                                      // (0, 0, 1) (2, 2, 3) (0, 1, 3)
    std::cout << "mergePilesMemo: " << mergePilesMemo(piles) << "\n";     // 20
    std::cout << "burstBalloons: " << burstBalloons({3, 1, 5, 8}) << "\n";  // 167
    std::cout << "minPalindromeCuts: " << minPalindromeCuts("aab") << "\n";  // 1
    return 0;
}
#endif
