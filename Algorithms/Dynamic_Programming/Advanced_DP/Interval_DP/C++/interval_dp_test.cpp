// Tests for interval_dp.cpp: the worked example, the three problems against brute force, the
// merges read back and their tie rule, the top-down form, edge cases, invalid input, overflow,
// the work done, and 40 + 24 + 24 cases pinned to the Python outputs.
#include <algorithm>
#include <cassert>
#include <climits>
#include <cstddef>
#include <iostream>
#include <numeric>
#include <random>
#include <stdexcept>
#include <string>
#include <vector>

#include "interval_dp.cpp"

using Values = std::vector<long long>;
using Merges = std::vector<Merge>;

// The worked example of the README: four piles.
const Values kPiles = {3, 2, 4, 1};

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

// Every order of bursts, played out on a list.
long long bruteBurst(const Values& nums) {
    std::vector<int> order(nums.size());
    std::iota(order.begin(), order.end(), 0);
    long long best = 0;
    do {
        std::vector<int> alive(order.size());
        std::iota(alive.begin(), alive.end(), 0);
        long long coins = 0;
        for (int b : order) {
            const std::size_t p = std::find(alive.begin(), alive.end(), b) - alive.begin();
            const long long left = p > 0 ? nums[alive[p - 1]] : 1;
            const long long right = p + 1 < alive.size() ? nums[alive[p + 1]] : 1;
            coins += left * nums[b] * right;
            alive.erase(alive.begin() + p);
        }
        best = std::max(best, coins);
    } while (std::next_permutation(order.begin(), order.end()));
    return best;
}

bool isPalindrome(const std::string& s) { return std::equal(s.begin(), s.end(), s.rbegin()); }

// Every set of cut positions: a cut after position p for each bit p of the mask.
int bruteCuts(const std::string& s) {
    const int n = static_cast<int>(s.size());
    if (n == 0) return 0;
    int best = n - 1;
    for (unsigned mask = 0; mask < (1u << (n - 1)); ++mask) {
        bool ok = true;
        int start = 0;
        for (int p = 0; p < n && ok; ++p) {
            if (p == n - 1 || (mask >> p & 1u)) {
                ok = isPalindrome(s.substr(start, p - start + 1));
                start = p + 1;
            }
        }
        if (ok) best = std::min(best, __builtin_popcount(mask));
    }
    return best;
}

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
    assert(mergePiles(kPiles) == 20 && mergePilesMemo(kPiles) == 20);
    MergePlan plan = mergePilesPlan(kPiles);
    assert(plan.cost == 20 && plan.merges == Merges({{0, 0, 1}, {2, 2, 3}, {0, 1, 3}}));
    interval_dp_detail::Counters c;
    interval_dp_detail::MergeTables t = interval_dp_detail::fillMerge(kPiles, &c);
    assert(t.prefix == Values({0, 3, 5, 9, 10}));
    assert(t.dp == std::vector<Values>({{0, 5, 14, 20}, {0, 0, 6, 12}, {0, 0, 0, 5}, {0, 0, 0, 0}}));
    assert(t.split == std::vector<std::vector<int>>({{-1, 0, 1, 1}, {-1, -1, 1, 1}, {-1, -1, -1, 2}, {-1, -1, -1, -1}}));
    assert(c.candidates == 10);
    assert(burstBalloons({3, 1, 5, 8}) == 167 && burstBalloons({1, 5}) == 10);
    assert(minPalindromeCuts("aab") == 1 && minPalindromeCuts("banana") == 1 && minPalindromeCuts("abcde") == 4);
    std::cout << "OK testWorkedExample" << std::endl;
}

void testAgainstBruteForce() {
    std::mt19937 rng(1000);
    for (int t = 0; t < 400; ++t) {
        Values piles = randomValues(rng, 7, std::vector<int>{3, 9, 50}[t % 3]);
        const long long want = bruteMerge(piles);
        assert(mergePiles(piles) == want && mergePilesMemo(piles) == want && mergePilesPlan(piles).cost == want);
    }
    for (int t = 0; t < 300; ++t) {
        Values nums = randomValues(rng, 6, std::vector<int>{3, 9, 20}[t % 3]);
        assert(burstBalloons(nums) == bruteBurst(nums));
    }
    for (int t = 0; t < 500; ++t) {
        const std::string alphabet = std::vector<std::string>{"ab", "abc", "abcd"}[t % 3];
        std::string s;
        for (int n = std::uniform_int_distribution<int>(0, 12)(rng); n > 0; --n) s += alphabet[rng() % alphabet.size()];
        assert(minPalindromeCuts(s) == bruteCuts(s));
    }
    std::cout << "OK testAgainstBruteForce" << std::endl;
}

void testPlan() {
    std::mt19937 rng(1547);
    for (int t = 0; t < 600; ++t) {
        Values piles = randomValues(rng, 9, std::vector<int>{2, 9, 100}[t % 3]);
        MergePlan plan = mergePilesPlan(piles);
        assert(plan.cost == mergePiles(piles));
        assert(plan.merges.size() == (piles.empty() ? 0 : piles.size() - 1));
        assert(applyMerges(piles, plan.merges) == plan.cost);  // the merges reach the value
    }
    // The tie rule: the smallest k that reaches the minimum, in every cell.
    for (int t = 0; t < 250; ++t) {
        Values piles = randomValues(rng, 6, std::vector<int>{1, 2, 5}[t % 3]);
        interval_dp_detail::MergeTables tables = interval_dp_detail::fillMerge(piles);
        const int n = static_cast<int>(piles.size());
        for (int i = 0; i < n; ++i) {
            for (int j = i + 1; j < n; ++j) {
                const long long sum = tables.prefix[j + 1] - tables.prefix[i];
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
    assert(mergePilesPlan({2, 2, 2, 2, 2}).merges == Merges({{0, 0, 1}, {3, 3, 4}, {2, 2, 4}, {0, 1, 4}}));
    assert(mergePilesPlan({0, 0, 0, 0}).merges == Merges({{2, 2, 3}, {1, 1, 3}, {0, 0, 3}}));
    assert(mergePilesPlan({1, 2, 3}).merges == Merges({{0, 0, 1}, {0, 1, 2}}));
    assert(mergePilesPlan({3, 2, 1}).merges == Merges({{1, 1, 2}, {0, 0, 2}}));
    std::cout << "OK testPlan" << std::endl;
}

void testTopDown() {
    std::mt19937 rng(877);
    for (int t = 0; t < 300; ++t) {
        Values piles = randomValues(rng, 10, std::vector<int>{2, 9, 99}[t % 3]);
        interval_dp_detail::MergeTables up = interval_dp_detail::fillMerge(piles);
        interval_dp_detail::MergeTables down = interval_dp_detail::fillMergeMemo(piles);
        assert(up.dp == down.dp && up.split == down.split);
    }
    std::cout << "OK testTopDown" << std::endl;
}

void testEdgeCases() {
    assert(mergePiles({}) == 0 && mergePilesMemo({}) == 0);
    MergePlan none = mergePilesPlan({});
    assert(none.cost == 0 && none.merges.empty());
    assert(burstBalloons({}) == 0 && minPalindromeCuts("") == 0);
    assert(mergePiles({7}) == 0 && mergePilesMemo({7}) == 0 && mergePilesPlan({7}).merges.empty());
    assert(burstBalloons({7}) == 7 && minPalindromeCuts("x") == 0);
    MergePlan two = mergePilesPlan({4, 9});
    assert(two.cost == 13 && two.merges == Merges({{0, 0, 1}}) && mergePilesMemo({4, 9}) == 13);
    assert(burstBalloons({4, 9}) == 45);
    assert(minPalindromeCuts("ab") == 1 && minPalindromeCuts("aa") == 0);
    assert(mergePiles(Values(8, 5)) == 120);
    assert(burstBalloons({2, 2, 2, 2}) == 22);
    assert(minPalindromeCuts("aaaaaa") == 0);
    assert(mergePiles({0, 0, 0}) == 0 && burstBalloons({0, 0}) == 0 && burstBalloons({0, 5, 0}) == 5);
    assert(mergePiles(Values(64, 1)) == 384);
    std::string ab;
    for (int t = 0; t < 30; ++t) ab += "ab";
    assert(minPalindromeCuts(ab) == 1);
    // Bytes, not characters: the two bytes of the UTF-8 e-acute are different, so "a e-acute a"
    // is four bytes and no palindrome (Python compares code points and returns 0).
    assert(minPalindromeCuts("a\xc3\xa9" "a") == 3);
    std::cout << "OK testEdgeCases" << std::endl;
}

void testInvalidInputThrows() {
    assert(throws<std::invalid_argument>([] { mergePiles({3, -1, 2}); }));
    assert(throws<std::invalid_argument>([] { mergePilesPlan({3, -1, 2}); }));
    assert(throws<std::invalid_argument>([] { mergePilesMemo({3, -1, 2}); }));
    assert(throws<std::invalid_argument>([] { burstBalloons({3, -1, 2}); }));
    assert(throws<std::invalid_argument>([] { mergePiles({-5}); }));
    std::cout << "OK testInvalidInputThrows" << std::endl;
}

void testOverflow() {
    const long long half = 1LL << 62;
    // 2^63 does not fit; 2^63 - 1 does.
    assert(throws<std::overflow_error>([&] { mergePiles({half, half}); }));
    assert(throws<std::overflow_error>([&] { mergePilesPlan({half, half}); }));
    assert(throws<std::overflow_error>([&] { mergePilesMemo({half, half}); }));
    assert(mergePiles({half, half - 1}) == LLONG_MAX);
    // The total fits, but every split costs more than LLONG_MAX: 5 * 2^61.
    assert(throws<std::overflow_error>([] { mergePiles(Values(3, 1LL << 61)); }));
    assert(throws<std::overflow_error>([] { mergePilesMemo(Values(3, 1LL << 61)); }));
    // The split after pile 1 would cost 2^63 + 1; the minimum, after pile 0, fits.
    MergePlan plan = mergePilesPlan({half, 0, 1});
    assert(plan.cost == half + 2 && plan.merges == Merges({{1, 1, 2}, {0, 0, 2}}));
    assert(mergePilesMemo({half, 0, 1}) == half + 2);
    // One pile costs 0 whatever its size; two whose total does not fit cannot be merged.
    assert(mergePiles({LLONG_MAX}) == 0);
    assert(throws<std::overflow_error>([] { mergePiles({LLONG_MAX, 1}); }));
    // Coins: 3037000499^2 + 3037000499 fits, 3037000500^2 does not.
    assert(burstBalloons({3037000499LL, 3037000499LL}) == 9223372033963249500LL);
    assert(throws<std::overflow_error>([] { burstBalloons({3037000500LL, 3037000500LL}); }));
    assert(burstBalloons({LLONG_MAX}) == LLONG_MAX);
    assert(throws<std::overflow_error>([] { burstBalloons({LLONG_MAX, 1}); }));
    std::cout << "OK testOverflow" << std::endl;
}

void testWorkCounts() {
    for (long long n = 0; n <= 25; ++n) {
        const long long want = (n * n * n - n) / 6;  // sum over lengths L of (n - L + 1)(L - 1)
        interval_dp_detail::Counters up, down, burst, cut, same;
        interval_dp_detail::fillMerge(Values(n, 1), &up);
        interval_dp_detail::fillMergeMemo(Values(n, 1), &down);
        assert(up.candidates == want && down.candidates == want);
        interval_dp_detail::burst(Values(n, 1), &burst);
        assert(burst.candidates == n * (n + 1) * (n + 2) / 6);  // n + 2 boundaries
        std::string distinct;
        for (int t = 0; t < n; ++t) distinct += static_cast<char>('A' + t);
        interval_dp_detail::cuts(distinct, &cut);  // no palindrome longer than one letter
        assert(cut.candidates == want);
        interval_dp_detail::cuts(std::string(n, 'a'), &same);  // every range is a palindrome
        assert(same.candidates == 0);
    }
    // A range that is not a palindrome tries its j - i cuts; a palindrome tries none.
    std::mt19937 rng(131);
    for (int t = 0; t < 200; ++t) {
        std::string s;
        for (int n = std::uniform_int_distribution<int>(0, 14)(rng); n > 0; --n) s += "abc"[rng() % 3];
        long long want = 0;
        for (int i = 0; i < static_cast<int>(s.size()); ++i) {
            for (int j = i + 1; j < static_cast<int>(s.size()); ++j) {
                if (!isPalindrome(s.substr(i, j - i + 1))) want += j - i;
            }
        }
        interval_dp_detail::Counters c;
        interval_dp_detail::cuts(s, &c);
        assert(c.candidates == want);
    }
    long long expected[] = {165, 1330, 10660, 85320};
    int sizes[] = {10, 20, 40, 80};
    for (int t = 0; t < 4; ++t) {
        interval_dp_detail::Counters c;
        interval_dp_detail::fillMerge(Values(sizes[t], 1), &c);
        assert(c.candidates == expected[t]);
    }
    std::cout << "OK testWorkCounts" << std::endl;
}

// ---------------------------------------------------------------- agreement with Python

// Outputs computed by running the Python implementation (interval_dp.py): fixed cases first,
// then seeded random ones. merge_piles_plan's cost and merges (merge_piles and
// merge_piles_memo return the same cost), burst_balloons, and min_palindrome_cuts.
struct PythonMerge {
    Values piles;
    long long cost;
    Merges merges;
};

struct PythonBurst {
    Values nums;
    long long coins;
};

struct PythonCuts {
    std::string s;
    int cuts;
};

const std::vector<PythonMerge> kPythonMerges = {
    {{3, 2, 4, 1}, 20LL, {{0, 0, 1}, {2, 2, 3}, {0, 1, 3}}},
    {{}, 0LL, {}},
    {{7}, 0LL, {}},
    {{4, 9}, 13LL, {{0, 0, 1}}},
    {{1, 1, 1}, 5LL, {{1, 1, 2}, {0, 0, 2}}},
    {{1, 1, 1, 1}, 8LL, {{0, 0, 1}, {2, 2, 3}, {0, 1, 3}}},
    {{2, 2, 2, 2, 2}, 24LL, {{0, 0, 1}, {3, 3, 4}, {2, 2, 4}, {0, 1, 4}}},
    {{0, 0, 0, 0}, 0LL, {{2, 2, 3}, {1, 1, 3}, {0, 0, 3}}},
    {{1, 2, 3}, 9LL, {{0, 0, 1}, {0, 1, 2}}},
    {{3, 2, 1}, 9LL, {{1, 1, 2}, {0, 0, 2}}},
    {{5, 1, 4, 2, 8, 3}, 58LL, {{1, 1, 2}, {1, 2, 3}, {0, 0, 3}, {4, 4, 5}, {0, 3, 5}}},
    {{10, 0, 10, 0, 10}, 70LL, {{1, 1, 2}, {3, 3, 4}, {1, 2, 4}, {0, 0, 4}}},
    {{4611686018427387904, 4611686018427387903}, 9223372036854775807LL, {{0, 0, 1}}},
    {{4611686018427387904, 0, 1}, 4611686018427387906LL, {{1, 1, 2}, {0, 0, 2}}},
    {{1000000000000000, 1000000000000000, 1000000000000000, 1000000000000000, 1000000000000000, 1000000000000000, 1000000000000000, 1000000000000000}, 24000000000000000LL, {{0, 0, 1}, {2, 2, 3}, {0, 1, 3}, {4, 4, 5}, {6, 6, 7}, {4, 5, 7}, {0, 3, 7}}},
    {{97, 3, 2, 5, 55, 1, 30, 15}, 476LL, {{1, 1, 2}, {1, 2, 3}, {1, 3, 4}, {5, 5, 6}, {5, 6, 7}, {1, 4, 7}, {0, 0, 7}}},
    {{85, 7, 5, 3, 3}, 138LL, {{3, 3, 4}, {2, 2, 4}, {1, 1, 4}, {0, 0, 4}}},
    {{25, 3, 98, 1, 90, 2, 2, 0}, 567LL, {{0, 0, 1}, {0, 1, 2}, {3, 3, 4}, {6, 6, 7}, {5, 5, 7}, {3, 4, 7}, {0, 2, 7}}},
    {{2, 16, 15, 2, 10, 29, 2}, 209LL, {{0, 0, 1}, {3, 3, 4}, {2, 2, 4}, {0, 1, 4}, {5, 5, 6}, {0, 4, 6}}},
    {{2, 14, 15, 35, 10, 0, 3, 91, 1}, 453LL, {{0, 0, 1}, {0, 1, 2}, {5, 5, 6}, {4, 4, 6}, {3, 3, 6}, {0, 2, 6}, {7, 7, 8}, {0, 6, 8}}},
    {{2, 1, 2, 10, 15, 25}, 108LL, {{1, 1, 2}, {0, 0, 2}, {0, 2, 3}, {0, 3, 4}, {0, 4, 5}}},
    {{1, 2, 13, 0, 75, 21, 3, 19}, 322LL, {{0, 0, 1}, {2, 2, 3}, {0, 1, 3}, {0, 3, 4}, {6, 6, 7}, {5, 5, 7}, {0, 4, 7}}},
    {{12, 3, 1, 1, 0, 6, 0, 1, 34}, 110LL, {{3, 3, 4}, {2, 2, 4}, {1, 1, 4}, {6, 6, 7}, {5, 5, 7}, {1, 4, 7}, {0, 0, 7}, {0, 7, 8}}},
    {{43, 1, 6, 1, 46}, 163LL, {{2, 2, 3}, {1, 1, 3}, {0, 0, 3}, {0, 3, 4}}},
    {{3, 7, 2, 2}, 28LL, {{0, 0, 1}, {2, 2, 3}, {0, 1, 3}}},
    {{1, 67}, 68LL, {{0, 0, 1}}},
    {{3, 2, 52, 99, 0, 19, 3, 3, 20}, 502LL, {{0, 0, 1}, {0, 1, 2}, {4, 4, 5}, {6, 6, 7}, {4, 5, 7}, {4, 7, 8}, {3, 3, 8}, {0, 2, 8}}},
    {{3, 2, 2, 2, 0}, 20LL, {{0, 0, 1}, {3, 3, 4}, {2, 2, 4}, {0, 1, 4}}},
    {{100, 77, 0, 63, 4}, 518LL, {{2, 2, 3}, {2, 3, 4}, {1, 1, 4}, {0, 0, 4}}},
    {{90, 48, 6, 77}, 406LL, {{1, 1, 2}, {1, 2, 3}, {0, 0, 3}}},
    {{3, 10, 10, 13, 27}, 135LL, {{0, 0, 1}, {2, 2, 3}, {0, 1, 3}, {0, 3, 4}}},
    {{2, 82, 9, 2}, 190LL, {{0, 0, 1}, {2, 2, 3}, {0, 1, 3}}},
    {{20, 5, 7, 8}, 72LL, {{1, 1, 2}, {1, 2, 3}, {0, 0, 3}}},
    {{17, 11, 1}, 41LL, {{1, 1, 2}, {0, 0, 2}}},
    {{16, 90, 88, 1, 3, 0, 2, 3, 66}, 633LL, {{0, 0, 1}, {3, 3, 4}, {5, 5, 6}, {5, 6, 7}, {3, 4, 7}, {3, 7, 8}, {2, 2, 8}, {0, 1, 8}}},
    {{11, 17, 66, 14, 0}, 230LL, {{0, 0, 1}, {3, 3, 4}, {2, 2, 4}, {0, 1, 4}}},
    {{14, 6, 0, 74, 4, 2, 0, 1, 20}, 279LL, {{1, 1, 2}, {0, 0, 2}, {0, 2, 3}, {6, 6, 7}, {5, 5, 7}, {4, 4, 7}, {4, 7, 8}, {0, 3, 8}}},
    {{9, 39, 0, 63, 55}, 364LL, {{1, 1, 2}, {0, 0, 2}, {0, 2, 3}, {0, 3, 4}}},
    {{1, 6, 1, 14, 1, 8, 1}, 88LL, {{1, 1, 2}, {0, 0, 2}, {0, 2, 3}, {5, 5, 6}, {4, 4, 6}, {0, 3, 6}}},
    {{1, 16, 3, 2, 14, 14, 1}, 139LL, {{0, 0, 1}, {2, 2, 3}, {0, 1, 3}, {5, 5, 6}, {4, 4, 6}, {0, 3, 6}}},
};

const std::vector<PythonBurst> kPythonBursts = {
    {{3, 1, 5, 8}, 167LL},
    {{1, 5}, 10LL},
    {{}, 0LL},
    {{7}, 7LL},
    {{4, 9}, 45LL},
    {{2, 2, 2, 2}, 22LL},
    {{0, 0}, 0LL},
    {{0, 5, 0}, 5LL},
    {{3037000499, 3037000499}, 9223372033963249500LL},
    {{9223372036854775807}, 9223372036854775807LL},
    {{48, 5, 2}, 624LL},
    {{3, 56, 2, 42}, 11928LL},
    {{2, 5, 19}, 247LL},
    {{2, 10, 0, 3, 1}, 72LL},
    {{3}, 3LL},
    {{39, 3, 6}, 975LL},
    {{88, 1, 5, 76}, 40656LL},
    {{3, 1, 5}, 35LL},
    {{62, 12, 4, 3}, 3968LL},
    {{13, 0, 18, 0, 2, 2}, 579LL},
    {{3, 5, 30, 1}, 600LL},
    {{1, 4, 0, 15, 3, 56}, 6216LL},
    {{4}, 4LL},
    {{93, 34, 27, 8, 65}, 285378LL},
};

const std::vector<PythonCuts> kPythonCuts = {
    {"aab", 1},
    {"", 0},
    {"x", 0},
    {"ab", 1},
    {"aa", 0},
    {"banana", 1},
    {"abcde", 4},
    {"racecar", 0},
    {"aaaaaa", 0},
    {"abacdc", 1},
    {"abababababababababababababababababababababababababababababab", 1},
    {"bababaadbccaaa", 5},
    {"ababaadaaaba", 3},
    {"cab", 2},
    {"cbaac", 3},
    {"bdbcaaab", 3},
    {"badbabbbabaab", 5},
    {"bdbbc", 2},
    {"abaaccdacb", 6},
    {"caca", 1},
    {"aa", 0},
    {"bbbbbbc", 1},
    {"abacbaac", 4},
    {"cbabaababaab", 3},
};

void testAgreementWithPython() {
    for (std::size_t i = 0; i < kPythonMerges.size(); ++i) {
        const PythonMerge& c = kPythonMerges[i];
        MergePlan plan = mergePilesPlan(c.piles);
        bool same = plan.cost == c.cost && plan.merges == c.merges && mergePiles(c.piles) == c.cost && mergePilesMemo(c.piles) == c.cost;
        if (!same) std::cerr << "merge case " << i << " differs from Python\n";
        assert(same);
    }
    for (std::size_t i = 0; i < kPythonBursts.size(); ++i) {
        bool same = burstBalloons(kPythonBursts[i].nums) == kPythonBursts[i].coins;
        if (!same) std::cerr << "burst case " << i << " differs from Python\n";
        assert(same);
    }
    for (std::size_t i = 0; i < kPythonCuts.size(); ++i) {
        bool same = minPalindromeCuts(kPythonCuts[i].s) == kPythonCuts[i].cuts;
        if (!same) std::cerr << "cuts case " << i << " differs from Python\n";
        assert(same);
    }
    std::cout << "OK testAgreementWithPython (" << kPythonMerges.size() << " + " << kPythonBursts.size() << " + " << kPythonCuts.size() << " cases)"
              << std::endl;
}

int main() {
    testWorkedExample();
    testAgainstBruteForce();
    testPlan();
    testTopDown();
    testEdgeCases();
    testInvalidInputThrows();
    testOverflow();
    testWorkCounts();
    testAgreementWithPython();
    std::cout << "All Interval DP tests passed!" << std::endl;
    return 0;
}
