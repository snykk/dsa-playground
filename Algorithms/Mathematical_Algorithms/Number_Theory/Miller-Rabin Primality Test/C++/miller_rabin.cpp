/**
 * Miller-Rabin Primality Test Implementation (C++)
 *
 * The Miller-Rabin test is a probabilistic algorithm for determining whether
 * a number is prime. It is based on Fermat's little theorem and is widely
 * used in practice.
 *
 * Every product of two residues goes through mulMod, which uses unsigned
 * __int128, so the test is correct for the whole 64-bit range. The long long
 * functions accept n up to 2^63 - 1 (negative n is not prime);
 * millerRabinDeterministicU64 takes the full unsigned range up to 2^64 - 1.
 */

#include <cstddef>
#include <random>
#include <vector>

typedef unsigned long long u64;

// (a * b) mod m without overflow, for m > 0.
static u64 mulMod(u64 a, u64 b, u64 m) {
    return static_cast<u64>(static_cast<unsigned __int128>(a) * b % m);
}

static u64 powModU64(u64 base, u64 exponent, u64 modulus) {
    if (modulus == 1) {
        return 0;
    }

    u64 result = 1;
    base %= modulus;

    while (exponent > 0) {
        if (exponent & 1) {
            result = mulMod(result, base, modulus);
        }
        exponent >>= 1;
        base = mulMod(base, base, modulus);
    }

    return result;
}

/**
 * Compute (base^exponent) mod modulus using binary exponentiation, for
 * modulus > 0 and exponent >= 0. A negative base is reduced into
 * [0, modulus) first; a negative exponent is treated as 0.
 */
long long modPow(long long base, long long exponent, long long modulus) {
    if (modulus == 1) {
        return 0;
    }
    long long b = base % modulus;
    if (b < 0) {
        b += modulus;
    }
    u64 e = exponent > 0 ? static_cast<u64>(exponent) : 0;
    return static_cast<long long>(powModU64(static_cast<u64>(b), e, modulus));
}

// One Miller-Rabin round for an odd n > 2 with n - 1 = d * 2^r and
// 2 <= a <= n - 2. Returns true when a proves n composite.
static bool isWitness(u64 a, u64 n, u64 d, int r) {
    u64 x = powModU64(a, d, n);
    if (x == 1 || x == n - 1) {
        return false;
    }
    for (int i = 0; i < r - 1; i++) {
        x = mulMod(x, x, n);
        if (x == n - 1) {
            return false;
        }
    }
    return true;
}

static void decompose(u64 n, u64& d, int& r) {
    d = n - 1;
    r = 0;
    while (d % 2 == 0) {
        d /= 2;
        r++;
    }
}

/**
 * Miller-Rabin primality test with k random witnesses.
 * Witnesses are drawn uniformly from [2, n - 2] with a Mersenne Twister that
 * is seeded from std::random_device once per thread.
 * A composite n passes with probability at most 4^-k.
 * Time Complexity: O(k log^3 n)
 */
bool millerRabin(long long n, int k = 5) {
    if (n < 2) {
        return false;
    }
    if (n == 2 || n == 3) {
        return true;
    }
    if (n % 2 == 0) {
        return false;
    }

    u64 un = static_cast<u64>(n);
    u64 d;
    int r;
    decompose(un, d, r);

    static thread_local std::mt19937_64 rng{std::random_device{}()};
    std::uniform_int_distribution<u64> pick(2, un - 2);
    for (int i = 0; i < k; i++) {
        if (isWitness(pick(rng), un, d, r)) {
            return false;  // Composite
        }
    }

    return true;  // Probably prime
}

/**
 * Check if n is prime using Miller-Rabin test
 */
bool isPrimeMillerRabin(long long n, int k = 5) {
    if (n < 2) {
        return false;
    }
    if (n == 2) {
        return true;
    }
    if (n % 2 == 0) {
        return false;
    }

    return millerRabin(n, k);
}

/**
 * Deterministic Miller-Rabin for every n in [0, 2^64 - 1].
 * The first twelve primes (2..37) as witnesses are exact for all
 * n < 318,665,857,834,031,151,167,461, which covers the whole 64-bit range.
 */
bool millerRabinDeterministicU64(u64 n) {
    if (n < 2) {
        return false;
    }
    if (n == 2 || n == 3) {
        return true;
    }
    if (n % 2 == 0) {
        return false;
    }

    static const std::vector<u64> bases = {2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37};

    u64 d;
    int r;
    decompose(n, d, r);

    for (u64 a : bases) {
        if (a >= n) {
            continue;
        }
        if (isWitness(a, n, d, r)) {
            return false;
        }
    }

    return true;
}

/**
 * Deterministic Miller-Rabin for every long long n (negative n is not prime).
 */
bool millerRabinDeterministic(long long n) {
    return n >= 0 && millerRabinDeterministicU64(static_cast<u64>(n));
}
