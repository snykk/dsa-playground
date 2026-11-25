/**
 * Unit tests for combinatorics. The pinned values (between the PINNED markers) were computed by
 * the Python implementation (combinatorics.py); the rest checks every count against a
 * brute-force enumeration on small inputs, the three binomial methods against each other, the
 * modular tables against Pascal's triangle taken modulo p, the edge cases and errors, and the
 * 64-bit limits: the last row of Pascal's triangle that fits, and the first count that throws.
 */
#include <algorithm>
#include <cassert>
#include <cstdint>
#include <functional>
#include <iostream>
#include <numeric>
#include <stdexcept>
#include <string>
#include <utility>
#include <vector>

#include "combinatorics.cpp"

namespace {

// PINNED (generated from Python)
struct BinomialCase {
    int64_t n, k;
    uint64_t value;
};
const std::vector<BinomialCase> PINNED_BINOMIALS = {
    {0, 0, 1}, {1, 0, 1}, {1, 1, 1},
    {5, 2, 10}, {6, 3, 20}, {10, 3, 120},
    {10, 7, 120}, {10, -1, 0}, {10, 11, 0},
    {-3, 2, 0}, {-1, -1, 0}, {20, 10, 184756},
    {30, 15, 155117520}, {52, 5, 2598960}, {60, 30, 118264581564861424ULL},
    {62, 31, 465428353255261088ULL}, {64, 32, 1832624140942590534ULL}, {66, 33, 7219428434016265740ULL},
    {67, 33, 14226520737620288370ULL}, {67, 34, 14226520737620288370ULL}, {100, 3, 161700},
    {100, 97, 161700}, {1000, 2, 499500}, {1000, 5, 8250291250200ULL},
    {4294967296LL, 2, 9223372034707292160ULL}, {1000000000, 2, 499999999500000000ULL}, {1000000000000000000LL, 1, 1000000000000000000ULL},
    {9223372036854775807LL, 1, 9223372036854775807ULL}, {9223372036854775807LL, 9223372036854775806LL, 9223372036854775807ULL}, {9223372036854775807LL, 9223372036854775807LL, 1},
};
const std::vector<std::pair<int64_t, int64_t>> PINNED_OVERFLOWS = {
    {68, 34}, {68, 33}, {100, 50}, {1000000000000000000LL, 2}, {8589934592LL, 3}, {9223372036854775807LL, 2},
};
const std::vector<uint64_t> PASCAL_ROW_10 = {1, 10, 45, 120, 210, 252, 210, 120, 45, 10, 1};
const std::vector<uint64_t> PASCAL_ROW_67 = {
    1, 67, 2211, 47905,
    766480, 9657648, 99795696, 869648208,
    6522361560ULL, 42757703560ULL, 247994680648ULL, 1285063345176ULL,
    5996962277488ULL, 25371763481680ULL, 97862516286480ULL, 345780890878896ULL,
    1123787895356412ULL, 3371363686069236ULL, 9364899127970100ULL, 24151581961607100ULL,
    57963796707857040ULL, 129728497393775280ULL, 271250494550621040ULL, 530707489338171600ULL,
    972963730453314600ULL, 1673497616379701112ULL, 2703342303382594104ULL, 4105075349580976232ULL,
    5864393356544251760ULL, 7886597962249166160ULL, 9989690752182277136ULL, 11923179284862717872ULL,
    13413576695470557606ULL, 14226520737620288370ULL, 14226520737620288370ULL, 13413576695470557606ULL,
    11923179284862717872ULL, 9989690752182277136ULL, 7886597962249166160ULL, 5864393356544251760ULL,
    4105075349580976232ULL, 2703342303382594104ULL, 1673497616379701112ULL, 972963730453314600ULL,
    530707489338171600ULL, 271250494550621040ULL, 129728497393775280ULL, 57963796707857040ULL,
    24151581961607100ULL, 9364899127970100ULL, 3371363686069236ULL, 1123787895356412ULL,
    345780890878896ULL, 97862516286480ULL, 25371763481680ULL, 5996962277488ULL,
    1285063345176ULL, 247994680648ULL, 42757703560ULL, 6522361560ULL,
    869648208, 99795696, 9657648, 766480,
    47905, 2211, 67, 1,
};
struct ModQuery {
    int64_t n, k;
    uint64_t value;
};
struct ModCase {
    int nMax;
    uint64_t p;
    std::vector<ModQuery> queries;
    long long multiplications;
};
const std::vector<ModCase> PINNED_MOD = {
    {6, 13, {{6, 2, 2}, {6, 3, 7}, {5, 2, 10}, {0, 0, 1}, {6, 7, 0}, {6, -1, 0}}, 19},
    {10, 1000000007, {{10, 3, 120}, {10, 5, 252}, {7, 7, 1}}, 65},
    {1000, 1000000007, {{1000, 500, 159835829}, {1000, 3, 166167000}, {999, 1, 999}}, 2045},
    {12, 13, {{12, 6, 1}, {12, 1, 12}, {11, 4, 5}}, 31},
    {50, 998244353, {{50, 25, 927528656}, {40, 20, 88808106}}, 158},
    {30, 2305843009213693951ULL, {{30, 15, 155117520}, {25, 12, 5200300}}, 181},
    {20, 18446744073709551557ULL, {{20, 10, 184756}, {20, 1, 20}}, 164},
    {1, 2, {{1, 0, 1}, {1, 1, 1}, {0, 0, 1}}, 2},
    {0, 2, {{0, 0, 1}, {0, 1, 0}}, 0},
};
const std::vector<uint64_t> FACT_6_MOD_13 = {1, 1, 2, 6, 11, 3, 5};
const std::vector<uint64_t> INV_FACT_6_MOD_13 = {1, 1, 7, 11, 6, 9, 8};
const std::vector<uint64_t> CATALAN_0_TO_36 = {
    1, 1, 2, 5,
    14, 42, 132, 429,
    1430, 4862, 16796, 58786,
    208012, 742900, 2674440, 9694845,
    35357670, 129644790, 477638700, 1767263190,
    6564120420ULL, 24466267020ULL, 91482563640ULL, 343059613650ULL,
    1289904147324ULL, 4861946401452ULL, 18367353072152ULL, 69533550916004ULL,
    263747951750360ULL, 1002242216651368ULL, 3814986502092304ULL, 14544636039226909ULL,
    55534064877048198ULL, 212336130412243110ULL, 812944042149730764ULL, 3116285494907301262ULL,
    11959798385860453492ULL,
};
const std::vector<uint64_t> DERANGEMENTS_0_TO_20 = {
    1, 0, 1, 2,
    9, 44, 265, 1854,
    14833, 133496, 1334961, 14684570,
    176214841, 2290792932ULL, 32071101049ULL, 481066515734ULL,
    7697064251745ULL, 130850092279664ULL, 2355301661033953ULL, 44750731559645106ULL,
    895014631192902121ULL,
};
struct StarsCase {
    int64_t n, k;
    uint64_t plain, positive;
};
const std::vector<StarsCase> PINNED_STARS = {
    {0, 0, 1, 1}, {5, 0, 0, 0}, {0, 3, 1, 0},
    {5, 3, 21, 6}, {3, 5, 35, 0}, {5, 5, 126, 1},
    {10, 4, 286, 84}, {1, 1, 1, 1}, {7, 1, 1, 1},
    {100, 10, 4263421511271ULL, 1731030945644ULL}, {60, 8, 869648208, 341149446},
};
// END PINNED

const uint64_t MOD = 1000000007ULL;

template <class E, class F>
bool throws(F f, const std::string& message = "") {
    try {
        f();
    } catch (const E& e) {
        return message.empty() || std::string(e.what()) == message;
    }
    return false;
}

bool isPrime(uint64_t n) {
    if (n < 2) return false;
    for (uint64_t d = 2; d <= n / d; d++) {
        if (n % d == 0) return false;
    }
    return true;
}

/** Pascal's triangle with every addition taken modulo m: an independent C(n, k) mod m. */
std::vector<std::vector<uint64_t>> pascalModM(int n, uint64_t m) {
    std::vector<std::vector<uint64_t>> rows = {{1 % m}};
    for (int r = 1; r <= n; r++) {
        std::vector<uint64_t> row(r + 1, 1 % m);
        for (int j = 1; j < r; j++) row[j] = (rows[r - 1][j - 1] + rows[r - 1][j]) % m;
        rows.push_back(row);
    }
    return rows;
}

uint64_t subsetsOfSize(int n, int k) {
    uint64_t count = 0;
    for (uint32_t mask = 0; mask < (1u << n); mask++) count += __builtin_popcount(mask) == k;
    return count;
}

uint64_t balancedStrings(int n) {
    uint64_t count = 0;
    for (uint32_t mask = 0; mask < (1u << (2 * n)); mask++) {
        int depth = 0;
        bool ok = true;
        for (int i = 0; i < 2 * n && ok; i++) {
            depth += (mask >> i & 1) ? 1 : -1;
            ok = depth >= 0;
        }
        count += ok && depth == 0;
    }
    return count;
}

uint64_t derangementsByEnumeration(int n) {
    std::vector<int> p(n);
    std::iota(p.begin(), p.end(), 0);
    uint64_t count = 0;
    do {
        bool none = true;
        for (int i = 0; i < n; i++) none = none && p[i] != i;
        count += none;
    } while (std::next_permutation(p.begin(), p.end()));
    return count;
}

/** k-tuples of counts, each at least atLeast, adding up to n. */
uint64_t distributions(int n, int k, int atLeast) {
    if (k == 0) return n == 0 ? 1 : 0;
    uint64_t count = 0;
    for (int first = atLeast; first <= n; first++) count += distributions(n - first, k - 1, atLeast);
    return count;
}

}  // namespace

void testPinnedValues() {
    for (const BinomialCase& c : PINNED_BINOMIALS) {
        assert(binomial(c.n, c.k) == c.value);
        if (c.n <= 2000) assert(binomialPascal(c.n, c.k) == c.value);
    }
    for (const auto& c : PINNED_OVERFLOWS) {
        const int64_t n = c.first, k = c.second;
        assert(throws<std::overflow_error>([&] { binomial(n, k); }));
        if (n <= 2000) assert(throws<std::overflow_error>([&] { binomialPascal(n, k); }));
    }
    assert(pascalTriangle(10)[10] == PASCAL_ROW_10);
    for (const ModCase& c : PINNED_MOD) {
        ModBinomial t(c.nMax, c.p);
        assert(t.multiplications() == c.multiplications);
        for (const ModQuery& q : c.queries) assert(t.binomial(q.n, q.k) == q.value);
    }
    ModBinomial t(6, 13);
    assert(t.fact() == FACT_6_MOD_13);
    assert(t.invFact() == INV_FACT_6_MOD_13);
    assert(catalanNumbers(36) == CATALAN_0_TO_36);
    for (int n = 0; n <= 33; n++) assert(catalan(n) == CATALAN_0_TO_36[n]);
    assert(derangementNumbers(20) == DERANGEMENTS_0_TO_20);
    for (const StarsCase& c : PINNED_STARS) {
        assert(starsAndBars(c.n, c.k) == c.plain);
        assert(starsAndBarsPositive(c.n, c.k) == c.positive);
    }
}

void testAgainstEnumeration() {
    for (int n = 0; n <= 16; n++) {
        for (int k = -2; k <= n + 2; k++) {
            uint64_t want = (k >= 0 && k <= n) ? subsetsOfSize(n, k) : 0;
            assert(binomial(n, k) == want);
            assert(binomialPascal(n, k) == want);
        }
    }
    for (int n = 0; n <= 10; n++) {
        assert(catalanNumbers(n).back() == balancedStrings(n));
        assert(catalan(n) == balancedStrings(n));
    }
    std::vector<uint64_t> d = derangementNumbers(9);
    for (int n = 0; n <= 9; n++) assert(d[n] == derangementsByEnumeration(n));
    for (int n = 0; n <= 8; n++) {
        for (int k = 0; k <= 5; k++) {
            assert(starsAndBars(n, k) == distributions(n, k, 0));
            assert(starsAndBarsPositive(n, k) == distributions(n, k, 1));
        }
    }
}

void testThreeMethodsAgree() {
    auto rows = pascalTriangle(67);
    ModBinomial table(67, MOD);
    for (int n = 0; n <= 67; n++) {
        assert(rows[n].size() == static_cast<size_t>(n) + 1);
        for (int k = -1; k <= n + 1; k++) {
            uint64_t want = (k >= 0 && k <= n) ? rows[n][k] : 0;
            assert(binomial(n, k) == want);
            assert(binomialPascal(n, k) == want);
            assert(table.binomial(n, k) == want % MOD);
        }
    }
    // Large n, small k (as far as C(n, k) fits): the multiplicative formula against its symmetric side.
    for (const auto& [n, maxK] : std::vector<std::pair<int64_t, int64_t>>{{1000, 3}, {2000000, 3}, {4294967296LL, 2}, {1000000000000LL, 1}}) {
        for (int64_t k = 0; k <= maxK; k++) assert(binomial(n, k) == binomial(n, n - k));
    }
    assert(binomial(2000000, 3) == 1333331333334000000ULL);
    assert(binomial(4294967296LL, 2) == 9223372034707292160ULL);
}

void testModAgainstPascalModP() {
    for (uint64_t p = 2; p < 200; p++) {
        if (!isPrime(p)) continue;
        ModBinomial table(static_cast<int>(p) - 1, p);  // the largest table p allows
        auto rows = pascalModM(static_cast<int>(p) - 1, p);
        for (int n = 0; n < static_cast<int>(p); n++) {
            for (int k = 0; k <= n; k++) assert(table.binomial(n, k) == rows[n][k]);
        }
    }
    // 64-bit moduli: the products need 128 bits, and the exact values are small enough to compare.
    for (uint64_t p : {2305843009213693951ULL, 18446744073709551557ULL, 998244353ULL}) {
        ModBinomial table(40, p);
        for (int n = 0; n <= 40; n++) {
            for (int k = 0; k <= n; k++) assert(table.binomial(n, k) == binomial(n, k) % p);
        }
    }
    ModBinomial big(1000000, MOD);
    assert(big.binomial(1000000, 500000) == 996692777ULL);
}

void testCompositeModulus() {
    // Either the constructor refuses m, or every answer it gives is right.
    int accepted = 0;
    for (uint64_t m = 2; m < 160; m++) {
        auto rows = pascalModM(24, m);
        for (int nMax = 0; nMax < static_cast<int>(std::min<uint64_t>(m, 25)); nMax++) {
            try {
                ModBinomial table(nMax, m);
                accepted += !isPrime(m);
                for (int n = 0; n <= nMax; n++) {
                    for (int k = 0; k <= n; k++) assert(table.binomial(n, k) == rows[n][k]);
                }
            } catch (const std::invalid_argument& e) {
                assert(!isPrime(m));
                assert(std::string(e.what()).find("is not prime") != std::string::npos);
            }
        }
    }
    assert(accepted > 0);
    assert(throws<std::invalid_argument>([] { ModBinomial(6, 8); }, "p = 8 is not prime: 0 * 0 % 8 = 0, so the power p - 2 did not invert 6! modulo p"));
    assert(throws<std::invalid_argument>([] { ModBinomial(2, 9); }, "p = 9 is not prime: 2 * 2 % 9 = 4, so the power p - 2 did not invert 2! modulo p"));
}

void testWorkCounters() {
    // One modular inverse: the build makes 2 * nMax products plus those of a single power.
    for (const auto& [nMax, p] : std::vector<std::pair<int, uint64_t>>{{0, 2}, {10, 13}, {1000, MOD}, {100000, 998244353ULL}, {20, 18446744073709551557ULL}}) {
        ModBinomial t(nMax, p);
        long long power = 0;
        powMod(t.fact()[nMax], p - 2, p, &power);
        assert(t.multiplications() == 2LL * nMax + power);
        assert(t.multiplications() <= 2LL * nMax + 128);
    }
    long long count = 0;
    assert(powMod(2, 10, 1000, &count) == 24 && count == 6);
    count = 0;
    assert(powMod(5, 11, 13, &count) == 8 && count == 7);
    assert(powMod(7, 0, 1) == 0);
    assert(mulMod(UINT64_MAX - 1, UINT64_MAX - 1, UINT64_MAX) == 1);
}

void test64BitLimits() {
    // Row 67 is the last row of Pascal's triangle that fits in 64 bits; row 66 the last in int64_t.
    auto rows = pascalTriangle(67);
    assert(rows[67] == PASCAL_ROW_67);
    assert(*std::max_element(rows[66].begin(), rows[66].end()) <= static_cast<uint64_t>(INT64_MAX));
    assert(*std::max_element(rows[67].begin(), rows[67].end()) > static_cast<uint64_t>(INT64_MAX));
    assert(throws<std::overflow_error>([] { pascalTriangle(68); }, "C(68, 31) does not fit in 64 bits"));
    assert(binomial(67, 33) == 14226520737620288370ULL);
    assert(throws<std::overflow_error>([] { binomial(68, 34); }, "C(68, 34) does not fit in 64 bits"));
    assert(throws<std::overflow_error>([] { binomialPascal(68, 34); }, "C(68, 34) does not fit in 64 bits"));
    assert(throws<std::overflow_error>([] { binomialPascal(100, 20); }));  // k = 20: found by a sum that wraps
    assert(binomialPascal(67, 34) == 14226520737620288370ULL);
    assert(binomial(INT64_MAX, INT64_MAX - 1) == static_cast<uint64_t>(INT64_MAX));
    assert(throws<std::overflow_error>([] { binomial(INT64_MAX, 2); }));
    // Catalan: the recurrence reaches C_36; the closed form needs C(2n, n) and stops at n = 33.
    assert(catalanNumbers(36).back() == 11959798385860453492ULL);
    assert(throws<std::overflow_error>([] { catalanNumbers(37); }, "the Catalan number C_37 does not fit in 64 bits"));
    assert(catalan(33) == 212336130412243110ULL);
    assert(throws<std::overflow_error>([] { catalan(34); }, "C(68, 34) does not fit in 64 bits"));
    assert(throws<std::overflow_error>([] { catalan(INT64_MAX); }));
    assert(derangementNumbers(20).back() == 895014631192902121ULL);
    assert(throws<std::overflow_error>([] { derangementNumbers(21); }, "D(21) does not fit in 64 bits"));
    assert(throws<std::overflow_error>([] { derangementNumbers(1000000000); }));  // stops at D(21), allocates nothing big
    assert(throws<std::overflow_error>([] { starsAndBars(INT64_MAX, 2); }));
}

void testEdgesAndErrors() {
    for (auto f : {binomial, binomialPascal}) {
        assert(f(0, 0) == 1);
        assert(f(0, 1) == 0 && f(0, -1) == 0);
        assert(f(5, -1) == 0 && f(5, 6) == 0);
        assert(f(-4, 2) == 0 && f(-4, -5) == 0);
        assert(f(7, 0) == 1 && f(7, 7) == 1 && f(7, 1) == 7);
    }
    assert(pascalTriangle(0) == (std::vector<std::vector<uint64_t>>{{1}}));
    assert(catalanNumbers(0) == std::vector<uint64_t>{1});
    assert(catalan(0) == 1 && catalan(1) == 1);
    assert(derangementNumbers(0) == std::vector<uint64_t>{1});
    assert((derangementNumbers(1) == std::vector<uint64_t>{1, 0}));
    assert(starsAndBars(0, 0) == 1 && starsAndBars(4, 0) == 0 && starsAndBars(0, 4) == 1);
    assert(starsAndBarsPositive(0, 0) == 1 && starsAndBarsPositive(3, 4) == 0 && starsAndBarsPositive(4, 4) == 1);
    assert(throws<std::invalid_argument>([] { pascalTriangle(-1); }, "n = -1 must not be negative"));
    assert(throws<std::invalid_argument>([] { catalanNumbers(-1); }));
    assert(throws<std::invalid_argument>([] { catalan(-1); }));
    assert(throws<std::invalid_argument>([] { derangementNumbers(-1); }));
    assert(throws<std::invalid_argument>([] { starsAndBars(-1, 3); }));
    assert(throws<std::invalid_argument>([] { starsAndBars(3, -1); }));
    assert(throws<std::invalid_argument>([] { starsAndBarsPositive(-1, -1); }));
    assert(throws<std::invalid_argument>([] { ModBinomial(-1, 13); }, "nMax = -1 must not be negative"));
    assert(throws<std::invalid_argument>([] { ModBinomial(0, 1); }, "p = 1 is not prime: the modulus must be a prime"));
    assert(throws<std::invalid_argument>([] { ModBinomial(0, 0); }));
    for (const auto& c : std::vector<std::pair<int, uint64_t>>{{7, 7}, {9, 7}, {2, 2}, {100, 97}}) {
        assert(throws<std::invalid_argument>([&] { ModBinomial(c.first, c.second); }));
    }
    assert(throws<std::invalid_argument>([] { ModBinomial(9, 7); },
                                         "nMax = 9 >= p = 7: p divides n! for every n >= p, so n! has no inverse modulo p; Lucas's theorem handles n >= p"));
    ModBinomial t(5, 13);
    assert(throws<std::out_of_range>([&] { t.binomial(6, 2); }, "n = 6 is past the table: it was built for n <= 5"));
    assert(t.binomial(6, 7) == 0 && t.binomial(-1, 0) == 0);  // the guard comes before the table
    ModBinomial smallest(0, 2);
    assert(smallest.binomial(0, 0) == 1 && smallest.multiplications() == 0);
}

int main() {
    testPinnedValues();
    testAgainstEnumeration();
    testThreeMethodsAgree();
    testModAgainstPascalModP();
    testCompositeModulus();
    testWorkCounters();
    test64BitLimits();
    testEdgesAndErrors();
    std::cout << "All combinatorics tests passed." << std::endl;
    return 0;
}
