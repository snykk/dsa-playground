/**
 * Chinese Remainder Theorem Implementation (C++)
 *
 * Solves systems of simultaneous congruences x = r_i (mod m_i). With pairwise
 * coprime moduli the solution is unique modulo their product. Moduli that are
 * not coprime are accepted too: the congruences are merged one at a time and
 * -1 is returned only when two of them contradict each other.
 *
 * Every product of two residues goes through mulMod, which uses __int128, so
 * moduli up to LLONG_MAX are safe. The combined modulus lcm(m_1..m_n) must
 * itself fit in a long long, otherwise the functions return -1.
 */

#include <climits>
#include <cstdlib>
#include <vector>

/**
 * Extended Euclidean Algorithm
 */
struct ExtendedGCD {
    long long gcd;
    long long x;
    long long y;
};

// Extended Euclid for a, b >= 0.
static ExtendedGCD extendedGcdNonNeg(long long a, long long b) {
    if (b == 0) {
        return {a, 1, 0};
    }
    ExtendedGCD result = extendedGcdNonNeg(b, a % b);
    return {result.gcd, result.y, result.x - (a / b) * result.y};
}

// Returns {g, x, y} with a*x + b*y = g = gcd(a, b) >= 0, for inputs of any
// sign: it runs on |a| and |b|, then flips x (or y) when a (or b) is negative.
// (LLONG_MIN has no positive counterpart and is not supported.)
ExtendedGCD extendedGcd(long long a, long long b) {
    ExtendedGCD r = extendedGcdNonNeg(a < 0 ? -a : a, b < 0 ? -b : b);
    if (a < 0) r.x = -r.x;
    if (b < 0) r.y = -r.y;
    return r;
}

// Residue of a in [0, m) for m > 0, whatever the sign of a.
static long long floorMod(long long a, long long m) {
    long long r = a % m;
    return r < 0 ? r + m : r;
}

// (a * b) mod m without overflow, for a, b >= 0 and m > 0.
static long long mulMod(long long a, long long b, long long m) {
    return static_cast<long long>(static_cast<__int128>(a) * b % m);
}

/**
 * Compute modular multiplicative inverse in [0, m), or -1 if none exists.
 */
long long modInverse(long long a, long long m) {
    ExtendedGCD result = extendedGcd(a, m);

    if (result.gcd != 1) {
        return -1;
    }

    return floorMod(result.x, m);
}

/**
 * Compute (base^exponent) mod modulus, for modulus > 0 and exponent >= 0
 */
long long modPow(long long base, long long exponent, long long modulus) {
    if (modulus == 1) {
        return 0;
    }

    long long result = 1;
    base = floorMod(base, modulus);

    while (exponent > 0) {
        if (exponent % 2 == 1) {
            result = mulMod(result, base, modulus);
        }
        exponent = exponent >> 1;
        base = mulMod(base, base, modulus);
    }

    return result;
}

// Merge x = r1 (mod m1) and x = r2 (mod m2), with 0 <= r1 < m1, 0 <= r2 < m2.
// On success stores the solution r in [0, lcm) and lcm(m1, m2).
// Fails when the congruences contradict or lcm does not fit in a long long.
static bool mergeCongruences(long long r1, long long m1, long long r2,
                             long long m2, long long& r, long long& lcm) {
    ExtendedGCD e = extendedGcd(m1, m2);  // m1*x + m2*y = g
    long long g = e.gcd;
    long long diff = r2 - r1;
    if (diff % g != 0) {
        return false;
    }
    long long m2g = m2 / g;
    __int128 lcm128 = static_cast<__int128>(m1 / g) * m2;
    if (lcm128 > LLONG_MAX) {
        return false;
    }
    long long t = mulMod(floorMod(diff / g, m2g), floorMod(e.x, m2g), m2g);
    lcm = static_cast<long long>(lcm128);
    r = r1 + m1 * t;  // r1 < m1 and t < m2/g, so r < lcm
    return true;
}

/**
 * Solve x = remainders[i] (mod moduli[i]) for all i.
 * Returns the smallest non-negative solution (unique modulo lcm of the
 * moduli; the product when they are pairwise coprime), or -1 when the lists
 * differ in length, a modulus is not positive, the system has no solution,
 * or the combined modulus overflows long long. An empty system returns 0.
 * Remainders may be negative.
 * Time Complexity: O(n log max(moduli))
 */
long long chineseRemainderTheorem(const std::vector<long long>& remainders,
                                  const std::vector<long long>& moduli) {
    size_t n = remainders.size();
    if (n != moduli.size()) {
        return -1;
    }
    for (long long m : moduli) {
        if (m <= 0) {
            return -1;
        }
    }

    long long x = 0, lcm = 1;
    for (size_t i = 0; i < n; i++) {
        long long nx, nlcm;
        if (!mergeCongruences(x, lcm, floorMod(remainders[i], moduli[i]),
                              moduli[i], nx, nlcm)) {
            return -1;
        }
        x = nx;
        lcm = nlcm;
    }
    return x;
}

/**
 * Solve two congruences with coprime moduli.
 * Returns x mod (m1 * m2), or -1 if the moduli are not positive, not coprime,
 * or their product overflows long long.
 */
long long chineseRemainderTheoremPairwise(long long a1, long long m1,
                                          long long a2, long long m2) {
    if (m1 <= 0 || m2 <= 0 || extendedGcd(m1, m2).gcd != 1) {
        return -1;
    }
    long long x, lcm;
    if (!mergeCongruences(floorMod(a1, m1), m1, floorMod(a2, m2), m2, x, lcm)) {
        return -1;
    }
    return x;
}

/**
 * Verify that x satisfies all congruences. Remainders are reduced modulo each
 * modulus first, so 8 (mod 3) means 2 and -1 (mod 7) means 6.
 */
bool verifyCrtSolution(long long x, const std::vector<long long>& remainders,
                      const std::vector<long long>& moduli) {
    for (size_t i = 0; i < remainders.size(); i++) {
        if (floorMod(x, moduli[i]) != floorMod(remainders[i], moduli[i])) {
            return false;
        }
    }
    return true;
}
