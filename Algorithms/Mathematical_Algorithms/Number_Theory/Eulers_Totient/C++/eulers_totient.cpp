/**
 * Euler's Totient (C++)
 *
 * phi(n) counts the integers k with 1 <= k <= n and gcd(k, n) = 1. With the prime
 * factorization n = p1^k1 * ... * pr^kr it is n * (1 - 1/p1) * ... * (1 - 1/pr).
 *
 * - primeFactors and phi: trial division in O(sqrt n), for any n from 1 to 2^64 - 1. The loop
 *   test is p <= n / p, not p * p <= n: p * p wraps around once p reaches 2^32.
 * - linearSieve: phi, the smallest prime factor and the primes for every number up to n, in
 *   O(n). Each composite is crossed out exactly once, by its smallest prime factor, and
 *   crossings counts it.
 * - modInverseEuler: a^(phi(n) - 1) mod n, the inverse that Euler's theorem gives. Products of
 *   two residues go through mulMod, which multiplies in unsigned __int128 (a GCC and Clang
 *   extension), so every modulus up to 2^64 - 1 is safe.
 *
 * Invalid input throws std::invalid_argument: n = 0 (phi(0) is undefined), a negative sieve
 * limit, an a with gcd(a, n) != 1.
 */

#include <cstdint>
#include <iostream>
#include <numeric>
#include <stdexcept>
#include <string>
#include <utility>
#include <vector>

/** One prime factor and its exponent. */
using Factor = std::pair<uint64_t, int>;

/** The prime factorization of n >= 1 by trial division, primes increasing: O(sqrt n). */
std::vector<Factor> primeFactors(uint64_t n) {
    if (n == 0) throw std::invalid_argument("phi(0) is undefined: n must be at least 1");
    std::vector<Factor> factors;
    // p <= n / p means p * p <= n, but cannot overflow: p * p wraps once p reaches 2^32.
    for (uint64_t p = 2; p <= n / p; p++) {
        int k = 0;
        while (n % p == 0) {
            n /= p;
            k++;
        }
        if (k > 0) factors.emplace_back(p, k);
    }
    if (n > 1) factors.emplace_back(n, 1);  // what is left is one prime above sqrt(n)
    return factors;
}

/** Euler's totient of n >= 1: the product formula over the prime factors. O(sqrt n). */
uint64_t phi(uint64_t n) {
    uint64_t result = n;
    for (const Factor& f : primeFactors(n)) {
        result -= result / f.first;  // result * (1 - 1/p), exact: p still divides result
    }
    return result;
}

/** The tables of linearSieve(n): phi, spf of length n + 1, the primes, and the crossings. */
struct TotientSieve {
    std::vector<int> phi;     // phi[i] for i >= 1; phi[0] = 0 stands for "undefined"
    std::vector<int> spf;     // smallest prime factor of i >= 2; spf[0] = spf[1] = 0
    std::vector<int> primes;  // the primes up to n, increasing
    long long crossings = 0;  // numbers crossed out: once per composite
};

/**
 * phi, spf and the primes for 0..n in O(n). i crosses out i * p for the primes p up to
 * spf[i], so every composite m is crossed out once, by i = m / spf(m) and p = spf(m).
 * Throws std::invalid_argument for n < 0.
 */
TotientSieve linearSieve(int n) {
    if (n < 0) throw std::invalid_argument("the sieve limit must not be negative, got " + std::to_string(n));
    TotientSieve t;
    t.phi.assign(static_cast<size_t>(n) + 1, 0);
    t.spf.assign(static_cast<size_t>(n) + 1, 0);
    if (n >= 1) t.phi[1] = 1;
    for (int i = 2; i <= n; i++) {
        if (t.spf[i] == 0) {  // nothing crossed i out: i is prime
            t.spf[i] = i;
            t.phi[i] = i - 1;
            t.primes.push_back(i);
        }
        for (int p : t.primes) {
            // p > n / i is i * p > n, without forming i * p, which overflows an int.
            if (p > t.spf[i] || p > n / i) break;
            int m = i * p;
            t.spf[m] = p;
            // p divides i: phi(p^(k+1) r) = p phi(p^k r). Otherwise gcd(i, p) = 1: times p - 1.
            t.phi[m] = (p == t.spf[i]) ? t.phi[i] * p : t.phi[i] * (p - 1);
            t.crossings++;
        }
    }
    return t;
}

/** a * b mod m for any 64-bit values, m >= 1: the product is taken in 128 bits. */
uint64_t mulMod(uint64_t a, uint64_t b, uint64_t m) {
    return static_cast<uint64_t>(static_cast<unsigned __int128>(a) * b % m);
}

/** base^exp mod m by square and multiply, m >= 1: O(log exp) calls to mulMod. */
uint64_t powMod(uint64_t base, uint64_t exp, uint64_t m) {
    uint64_t result = 1 % m;
    base %= m;
    while (exp > 0) {
        if (exp & 1) result = mulMod(result, base, m);
        base = mulMod(base, base, m);
        exp >>= 1;
    }
    return result;
}

/**
 * The inverse of a modulo n by Euler's theorem: a^(phi(n) - 1) mod n, in 0..n-1 (0 for n = 1).
 * Throws std::invalid_argument for n = 0 or gcd(a, n) != 1.
 */
uint64_t modInverseEuler(uint64_t a, uint64_t n) {
    if (n == 0) throw std::invalid_argument("phi(0) is undefined: the modulus must be at least 1");
    uint64_t r = a % n;
    uint64_t g = std::gcd(r, n);
    if (g != 1) {
        throw std::invalid_argument(std::to_string(a) + " has no inverse modulo " + std::to_string(n) + ": gcd(" + std::to_string(a) + ", " +
                                    std::to_string(n) + ") = " + std::to_string(g));
    }
    return powMod(r, phi(n) - 1, n);
}

#ifndef IS_TEST_BUILD
int main() {
    std::cout << "phi(n) for n = 1..12:";
    for (uint64_t n = 1; n <= 12; n++) std::cout << ' ' << phi(n);
    std::cout << "\nprimeFactors(360):";
    for (const Factor& f : primeFactors(360)) std::cout << ' ' << f.first << '^' << f.second;
    std::cout << "  phi(360) = " << phi(360) << '\n';
    std::cout << "phi(2^64 - 1) = " << phi(UINT64_MAX) << '\n';
    TotientSieve t = linearSieve(30);
    std::cout << "linearSieve(30).phi:";
    for (int v : t.phi) std::cout << ' ' << v;
    std::cout << '\n' << t.primes.size() << " primes, " << t.crossings << " crossings (one per composite)\n";
    std::cout << "modInverseEuler(7, 360) = " << modInverseEuler(7, 360) << '\n';
    std::cout << "modInverseEuler(2, 2^64 - 1) = " << modInverseEuler(2, UINT64_MAX) << '\n';
    return 0;
}
#endif
