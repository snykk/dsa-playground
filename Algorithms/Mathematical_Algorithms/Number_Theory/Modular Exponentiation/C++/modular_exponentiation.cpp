/**
 * Modular Exponentiation Implementation (C++)
 *
 * Modular exponentiation computes (base^exponent) mod modulus efficiently
 * using binary exponentiation (also known as fast exponentiation).
 *
 * The modulus must be positive and every result is in [0, modulus), also for
 * a negative base. Products are formed in 128 bits (__int128), so any modulus
 * up to LLONG_MAX is safe.
 */

#include <cstdlib>

// Residue of a in [0, m), whatever the sign of a.
static long long floorMod(long long a, long long m) {
    long long r = a % m;
    return r < 0 ? r + m : r;
}

// (a * b) mod m without overflow, for a, b in [0, m).
static long long mulMod(long long a, long long b, long long m) {
    return static_cast<long long>(static_cast<__int128>(a) * b % m);
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
        return -1;
    }

    return floorMod(result.x, m);
}

/**
 * Compute (base^exponent) mod modulus using binary exponentiation, in
 * [0, modulus). A negative exponent means the inverse power,
 * base^(-e) = (base^-1)^e; it returns -1 if base has no inverse modulo
 * modulus. (LLONG_MIN as exponent is not supported.)
 * Time Complexity: O(log |exponent|)
 */
long long modPow(long long base, long long exponent, long long modulus) {
    if (exponent < 0) {
        long long inv = modInverse(base, modulus);
        if (inv == -1) {
            return -1;
        }
        return modPow(inv, -exponent, modulus);
    }
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
