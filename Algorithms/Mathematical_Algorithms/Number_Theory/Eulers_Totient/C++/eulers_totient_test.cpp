/**
 * Unit tests for Euler's totient. The pinned values (between the PINNED markers) were computed
 * by the Python implementation (eulers_totient.py); the rest checks phi against a count of
 * gcds, the sieve against phi, the properties the code relies on, Euler's theorem and the
 * inverse against an extended Euclid, the edge cases and the 64-bit limits.
 */
#include <algorithm>
#include <cassert>
#include <cstdint>
#include <iostream>
#include <numeric>
#include <stdexcept>
#include <string>
#include <utility>
#include <vector>

#include "eulers_totient.cpp"

namespace {

// PINNED (generated from Python)
const std::vector<std::pair<uint64_t, uint64_t>> PINNED_PHI = {
    {1, 1}, {2, 1}, {3, 2},
    {4, 2}, {5, 4}, {6, 2},
    {7, 6}, {8, 4}, {9, 6},
    {10, 4}, {12, 4}, {30, 8},
    {36, 12}, {97, 96}, {100, 40},
    {360, 96}, {1001, 720}, {1024, 512},
    {65536, 32768}, {65537, 65536}, {999983, 999982},
    {4294967291ULL, 4294967290ULL}, {12884901873ULL, 8589934580ULL}, {999999999989ULL, 999999999988ULL},
    {1000000000000000000ULL, 400000000000000000ULL}, {9223372036854775808ULL, 4611686018427387904ULL}, {12157665459056928801ULL, 8105110306037952534ULL},
    {9223372036854775807ULL, 7713001620195508224ULL}, {18446744073709551614ULL, 7713001620195508224ULL}, {18446691297133592627ULL, 18446673704946499656ULL},
    {18446744073709551615ULL, 9208981628670443520ULL},
};
const std::vector<std::pair<uint64_t, std::vector<Factor>>> PINNED_FACTORS = {
    {1, {}},
    {2, {{2, 1}}},
    {360, {{2, 3}, {3, 2}, {5, 1}}},
    {1001, {{7, 1}, {11, 1}, {13, 1}}},
    {9223372036854775808ULL, {{2, 63}}},
    {1000000000000000000ULL, {{2, 18}, {5, 18}}},
    {9223372036854775807ULL, {{7, 2}, {73, 1}, {127, 1}, {337, 1}, {92737, 1}, {649657, 1}}},
    {18446744073709551615ULL, {{3, 1}, {5, 1}, {17, 1}, {257, 1}, {641, 1}, {65537, 1}, {6700417, 1}}},
};
const std::vector<std::vector<uint64_t>> PINNED_INVERSES = {
    {3, 7, 5}, {7, 360, 103},
    {2, 18446744073709551615ULL, 9223372036854775808ULL}, {1, 1, 0},
    {5, 1, 0}, {10, 17, 12},
    {3, 1000000000000000000ULL, 666666666666666667ULL}, {999999999999999999ULL, 1000000000000000000ULL, 999999999999999999ULL},
    {12345, 9223372036854775808ULL, 5288216061308878345ULL}, {2, 4294967291ULL, 2147483646},
    {7, 18446744073709551615ULL, 15811494920322472813ULL},
};
const std::vector<int> SIEVE30_PHI = {0, 1, 1, 2, 2, 4, 2, 6, 4, 6, 4, 10, 4, 12, 6, 8, 8, 16, 6, 18, 8, 12, 10, 22, 8, 20, 12, 18, 12, 28, 8};
const std::vector<int> SIEVE30_SPF = {0, 0, 2, 3, 2, 5, 2, 7, 2, 3, 2, 11, 2, 13, 2, 3, 2, 17, 2, 19, 2, 3, 2, 23, 2, 5, 2, 3, 2, 29, 2};
const std::vector<int> SIEVE30_PRIMES = {2, 3, 5, 7, 11, 13, 17, 19, 23, 29};
const long long SIEVE30_CROSSINGS = 19;
// END PINNED

uint64_t phiByGcd(uint64_t n) {
    uint64_t count = 0;
    for (uint64_t k = 1; k <= n; k++) count += std::gcd(k, n) == 1;
    return count;
}

bool isPrime(uint64_t n) {
    if (n < 2) return false;
    for (uint64_t d = 2; d <= n / d; d++) {
        if (n % d == 0) return false;
    }
    return true;
}

std::vector<uint64_t> divisorsFromFactors(const std::vector<Factor>& factors) {
    std::vector<uint64_t> ds = {1};
    for (const Factor& f : factors) {
        std::vector<uint64_t> next;
        for (uint64_t d : ds) {
            uint64_t power = 1;
            for (int e = 0; e <= f.second; e++) {
                next.push_back(d * power);
                if (e < f.second) power *= f.first;
            }
        }
        ds = next;
    }
    return ds;
}

/** The reference inverse: the extended Euclid on 128-bit signed coefficients, or 0 if none. */
bool inverseByExtendedGcd(uint64_t a, uint64_t n, uint64_t& out) {
    __int128 oldR = a % n, r = n, oldX = 1, x = 0;
    while (r != 0) {
        __int128 q = oldR / r;
        __int128 t = oldR - q * r;
        oldR = r;
        r = t;
        t = oldX - q * x;
        oldX = x;
        x = t;
    }
    if (oldR != 1 && n != 1) return false;
    __int128 v = oldX % static_cast<__int128>(n);
    if (v < 0) v += n;
    out = static_cast<uint64_t>(v);
    return true;
}

template <class F>
bool throwsInvalid(F f) {
    try {
        f();
    } catch (const std::invalid_argument&) {
        return true;
    }
    return false;
}

}  // namespace

void testPinnedValues() {
    for (const auto& [n, want] : PINNED_PHI) assert(phi(n) == want);
    for (const auto& [n, want] : PINNED_FACTORS) assert(primeFactors(n) == want);
    for (const auto& row : PINNED_INVERSES) assert(modInverseEuler(row[0], row[1]) == row[2]);
    TotientSieve t = linearSieve(30);
    assert(t.phi == SIEVE30_PHI);
    assert(t.spf == SIEVE30_SPF);
    assert(t.primes == SIEVE30_PRIMES);
    assert(t.crossings == SIEVE30_CROSSINGS);
}

void testAgainstGcdCount() {
    for (uint64_t n = 1; n <= 3000; n++) assert(phi(n) == phiByGcd(n));
}

void testOneZeroAndPrimes() {
    assert(phi(1) == 1);
    assert(primeFactors(1).empty());
    assert(throwsInvalid([] { phi(0); }));
    assert(throwsInvalid([] { primeFactors(0); }));
    for (uint64_t p = 2; p < 2000; p++) {
        if (isPrime(p)) {
            assert(phi(p) == p - 1);
            assert((primeFactors(p) == std::vector<Factor>{{p, 1}}));
        }
    }
    for (uint64_t p : {65537ULL, 999983ULL, 4294967291ULL, 999999999989ULL}) assert(phi(p) == p - 1);
}

void testPrimePowers() {
    // phi(p^k) = p^k - p^(k-1), up to the largest power below 2^64.
    for (uint64_t p : {2ULL, 3ULL, 5ULL, 7ULL, 11ULL, 13ULL, 101ULL, 65537ULL}) {
        uint64_t prev = 1, pk = p;
        for (int k = 1;; k++) {
            assert(phi(pk) == pk - prev);
            assert((primeFactors(pk) == std::vector<Factor>{{p, k}}));
            if (pk > UINT64_MAX / p) break;
            prev = pk;
            pk *= p;
        }
    }
}

void testMultiplicative() {
    for (uint64_t m = 1; m <= 120; m++) {
        for (uint64_t n = 1; n <= 120; n++) {
            uint64_t g = std::gcd(m, n);
            if (g == 1) {
                assert(phi(m * n) == phi(m) * phi(n));
            } else {
                assert(phi(m * n) * phi(g) == phi(m) * phi(n) * g);
            }
        }
    }
    assert(phi(4) != phi(2) * phi(2));
}

void testDivisorSum() {
    for (uint64_t n = 1; n <= 3000; n++) {
        uint64_t sum = 0;
        for (uint64_t d = 1; d <= n; d++) {
            if (n % d == 0) sum += phi(d);
        }
        assert(sum == n);
    }
    // At 64 bits the partial sums stay below n, so they cannot overflow.
    for (uint64_t n : {9223372036854775808ULL, 1000000000000000000ULL, 9223372036854775807ULL, UINT64_MAX}) {
        uint64_t sum = 0;
        for (uint64_t d : divisorsFromFactors(primeFactors(n))) sum += phi(d);
        assert(sum == n);
    }
}

void testFactorsMultiplyBack() {
    for (uint64_t n = 1; n <= 5000; n++) {
        uint64_t product = 1, last = 0;
        for (const Factor& f : primeFactors(n)) {
            assert(f.first > last && isPrime(f.first) && f.second >= 1);
            last = f.first;
            for (int e = 0; e < f.second; e++) product *= f.first;
        }
        assert(product == n);
    }
}

void testLargest64Bit() {
    assert(phi(UINT64_MAX) == 9208981628670443520ULL);
    assert(phi(UINT64_MAX) == 2ULL * 4 * 16 * 256 * 640 * 65536 * 6700416);
    // A product of two primes just below 2^20 and 2^44: trial division runs to about 2^22.
    assert((primeFactors(18446691297133592627ULL) == std::vector<Factor>{{1048573, 1}, {17592186044399ULL, 1}}));
}

void testSieveAgainstPhi() {
    const int n = 5000;
    TotientSieve t = linearSieve(n);
    assert(t.phi.size() == n + 1 && t.spf.size() == n + 1);
    for (int i = 1; i <= n; i++) assert(static_cast<uint64_t>(t.phi[i]) == phi(i));
    for (int i = 2; i <= n; i++) assert(static_cast<uint64_t>(t.spf[i]) == primeFactors(i)[0].first);
    std::vector<int> primes;
    for (int i = 2; i <= n; i++) {
        if (isPrime(i)) primes.push_back(i);
    }
    assert(t.primes == primes);
}

void testEachCompositeCrossedOnce() {
    // crossings counts every write; every composite needs at least one (its spf is set and
    // right), so crossings == the number of composites means exactly one each.
    for (int n : {0, 1, 2, 3, 4, 5, 9, 30, 100, 1000, 10007, 65536}) {
        TotientSieve t = linearSieve(n);
        long long composites = 0;
        for (int m = 4; m <= n; m++) {
            if (!isPrime(m)) {
                composites++;
                assert(static_cast<uint64_t>(t.spf[m]) == primeFactors(m)[0].first);
            }
        }
        assert(t.crossings == composites);
        assert(t.crossings == std::max(0, n - 1) - static_cast<long long>(t.primes.size()));
    }
}

void testSieveEdgesAndMillion() {
    TotientSieve t0 = linearSieve(0);
    assert(t0.phi == std::vector<int>{0} && t0.spf == std::vector<int>{0} && t0.primes.empty() && t0.crossings == 0);
    TotientSieve t1 = linearSieve(1);
    assert((t1.phi == std::vector<int>{0, 1}) && (t1.spf == std::vector<int>{0, 0}) && t1.primes.empty());
    TotientSieve t2 = linearSieve(2);
    assert((t2.phi == std::vector<int>{0, 1, 1}) && (t2.spf == std::vector<int>{0, 0, 2}) && (t2.primes == std::vector<int>{2}));
    TotientSieve t4 = linearSieve(4);
    assert((t4.phi == std::vector<int>{0, 1, 1, 2, 2}) && t4.crossings == 1);
    assert(throwsInvalid([] { linearSieve(-1); }));
    TotientSieve big = linearSieve(1000000);
    assert(big.primes.size() == 78498);
    assert(big.crossings == 1000000 - 1 - 78498);
    long long sum = 0;
    for (int v : big.phi) sum += v;
    assert(sum == 303963552392LL);
}

void testSieveDivisorSum() {
    const int n = 20000;
    TotientSieve t = linearSieve(n);
    std::vector<long long> sums(n + 1, 0);
    for (int d = 1; d <= n; d++) {
        for (int m = d; m <= n; m += d) sums[m] += t.phi[d];
    }
    for (int m = 1; m <= n; m++) assert(sums[m] == m);
}

void testMulModAndPowMod() {
    // (-1) * (-1) = 1 and 2^63 * 2 = 2^64 = 1 modulo 2^64 - 1: the products need 128 bits.
    assert(mulMod(UINT64_MAX - 1, UINT64_MAX - 1, UINT64_MAX) == 1);
    assert(mulMod(1ULL << 63, 2, UINT64_MAX) == 1);
    assert(powMod(2, 64, UINT64_MAX) == 1);
    assert(powMod(5, 0, 1) == 0);
    assert(powMod(0, 0, 7) == 1);
    assert(powMod(3, 200, 1000000007) == 136318165);
}

void testEulersTheorem() {
    for (uint64_t n = 1; n <= 300; n++) {
        uint64_t f = phi(n);
        for (uint64_t a = 0; a < n; a++) {
            if (std::gcd(a, n) == 1) {
                assert(powMod(a, f, n) == 1 % n);
            } else if (n > 1) {
                assert(powMod(a, f, n) != 1);
            }
        }
    }
    for (uint64_t n : {UINT64_MAX, 9223372036854775808ULL, 1000000000000000000ULL, 4294967291ULL}) {
        uint64_t f = phi(n);
        for (uint64_t a : {2ULL, 3ULL, 7ULL, 1000000007ULL, UINT64_MAX - 2}) {
            if (std::gcd(a, n) == 1) assert(powMod(a, f, n) == 1);
        }
    }
}

void testInverseAgainstExtendedEuclid() {
    for (uint64_t n = 1; n <= 400; n++) {
        for (uint64_t a = 0; a < 2 * n; a++) {
            uint64_t want = 0;
            if (inverseByExtendedGcd(a, n, want)) {
                uint64_t got = modInverseEuler(a, n);
                assert(got == want);
                assert(a * got % n == 1 % n);
            } else {
                assert(throwsInvalid([&] { modInverseEuler(a, n); }));
            }
        }
    }
    for (const auto& row : PINNED_INVERSES) {
        uint64_t want = 0;
        assert(inverseByExtendedGcd(row[0], row[1], want) && want == row[2]);
    }
    const uint64_t p = 4294967291ULL;
    for (uint64_t a : {2ULL, 3ULL, 12345ULL, p - 1}) assert(modInverseEuler(a, p) == powMod(a, p - 2, p));
}

void testInverseErrors() {
    assert(modInverseEuler(0, 1) == 0);
    assert(modInverseEuler(5, 1) == 0);
    assert(modInverseEuler(10, 7) == 5);
    assert(throwsInvalid([] { modInverseEuler(6, 9); }));
    assert(throwsInvalid([] { modInverseEuler(0, 5); }));
    assert(throwsInvalid([] { modInverseEuler(3, 0); }));
    try {
        modInverseEuler(6, 9);
    } catch (const std::invalid_argument& e) {
        assert(std::string(e.what()) == "6 has no inverse modulo 9: gcd(6, 9) = 3");
    }
}

int main() {
    testPinnedValues();
    testAgainstGcdCount();
    testOneZeroAndPrimes();
    testPrimePowers();
    testMultiplicative();
    testDivisorSum();
    testFactorsMultiplyBack();
    testLargest64Bit();
    testSieveAgainstPhi();
    testEachCompositeCrossedOnce();
    testSieveEdgesAndMillion();
    testSieveDivisorSum();
    testMulModAndPowMod();
    testEulersTheorem();
    testInverseAgainstExtendedEuclid();
    testInverseErrors();
    std::cout << "All Euler's totient tests passed." << std::endl;
    return 0;
}
