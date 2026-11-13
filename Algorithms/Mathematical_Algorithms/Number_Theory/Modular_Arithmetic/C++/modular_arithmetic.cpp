/**
 * Modular Arithmetic Implementation (C++)
 *
 * Modular arithmetic is a system of arithmetic for integers, where numbers
 * "wrap around" after reaching a certain value (the modulus).
 *
 * Conventions: the modulus m must be positive, every result is in [0, m)
 * (also for negative operands), and no function overflows for any m up to
 * LLONG_MAX: sums use a subtract-first comparison and products use __int128.
 * modInverse and modDivide return -1 when the inverse does not exist.
 */

#include <cstdlib>

// Residue of a in [0, m), whatever the sign of a.
static long long floorMod(long long a, long long m) {
    long long r = a % m;
    return r < 0 ? r + m : r;
}

/**
 * Compute (a + b) mod m, in [0, m)
 * Time Complexity: O(1)
 */
long long modAdd(long long a, long long b, long long m) {
    long long x = floorMod(a, m);
    long long y = floorMod(b, m);
    // x + y can exceed LLONG_MAX when m > 2^62, so compare against m - y.
    return x >= m - y ? x - (m - y) : x + y;
}

/**
 * Compute (a - b) mod m, in [0, m)
 * Time Complexity: O(1)
 */
long long modSubtract(long long a, long long b, long long m) {
    long long x = floorMod(a, m);
    long long y = floorMod(b, m);
    return x >= y ? x - y : x + (m - y);
}

/**
 * Compute (a * b) mod m, in [0, m). The product is formed in 128 bits.
 * Time Complexity: O(1)
 */
long long modMultiply(long long a, long long b, long long m) {
    return static_cast<long long>(static_cast<__int128>(floorMod(a, m)) *
                                  floorMod(b, m) % m);
}

/**
 * Extended Euclidean Algorithm helper
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
// sign: it runs on |a| and |b|, then negates x when a < 0 and y when b < 0.
// (LLONG_MIN is not supported.)
ExtendedGCD extendedGcd(long long a, long long b) {
    ExtendedGCD result = extendedGcdNonNeg(std::llabs(a), std::llabs(b));
    if (a < 0) result.x = -result.x;
    if (b < 0) result.y = -result.y;
    return result;
}

/**
 * Compute modular multiplicative inverse, in [0, m)
 * Returns -1 if inverse doesn't exist
 * Time Complexity: O(log min(a, m))
 */
long long modInverse(long long a, long long m) {
    ExtendedGCD result = extendedGcd(a, m);

    if (result.gcd != 1) {
        return -1;  // Inverse doesn't exist
    }

    return floorMod(result.x, m);
}

/**
 * Compute (a / b) mod m using modular inverse
 * Returns -1 if inverse doesn't exist
 * Time Complexity: O(log min(b, m))
 */
long long modDivide(long long a, long long b, long long m) {
    long long inv = modInverse(b, m);
    if (inv == -1) {
        return -1;  // Inverse doesn't exist
    }

    return modMultiply(a, inv, m);
}

/**
 * Compute (base^exponent) mod m using binary exponentiation, in [0, m).
 * A negative exponent means the inverse power, base^(-e) = (base^-1)^e; it
 * returns -1 if base has no inverse modulo m.
 * (LLONG_MIN as exponent is not supported.)
 * Time Complexity: O(log |exponent|)
 */
long long modPower(long long base, long long exponent, long long m) {
    if (exponent < 0) {
        long long inv = modInverse(base, m);
        if (inv == -1) {
            return -1;
        }
        return modPower(inv, -exponent, m);
    }
    if (m == 1) {
        return 0;
    }

    long long result = 1;
    base = floorMod(base, m);

    while (exponent > 0) {
        if (exponent % 2 == 1) {
            result = modMultiply(result, base, m);
        }
        exponent = exponent >> 1;
        base = modMultiply(base, base, m);
    }

    return result;
}
