/**
 * Unit tests for Miller-Rabin Primality Test
 */

#include <cassert>
#include <iostream>
#include <vector>
#include "miller_rabin.cpp"

void testSmallPrimes() {
    std::vector<long long> primes = {2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 97, 101};
    for (long long p : primes) {
        assert(isPrimeMillerRabin(p, 10));
        assert(millerRabinDeterministic(p));
    }
}

void testComposites() {
    std::vector<long long> composites = {4, 6, 8, 9, 10, 12, 14, 15, 16, 18, 20, 21, 22, 24, 25, 100};
    for (long long c : composites) {
        assert(!isPrimeMillerRabin(c, 10));
        assert(!millerRabinDeterministic(c));
    }
}

void testEdgeCases() {
    assert(!isPrimeMillerRabin(0));
    assert(!isPrimeMillerRabin(1));
    assert(isPrimeMillerRabin(2));
    assert(!isPrimeMillerRabin(4));
}

void testDeterministic() {
    // Test deterministic version
    assert(millerRabinDeterministic(2));
    assert(millerRabinDeterministic(3));
    assert(millerRabinDeterministic(17));
    assert(millerRabinDeterministic(97));
    assert(!millerRabinDeterministic(100));
    assert(millerRabinDeterministic(101));
}

void testLargePrimesNearTwoPow63() {
    // Every one of these was reported composite when the product overflowed.
    std::vector<long long> primes = {
        4294967291LL, 4294967311LL, 1000000000039LL,
        2305843009213693951LL,   // 2^61 - 1
        9223372036854775783LL};  // 2^63 - 25, the largest prime below 2^63
    for (long long p : primes) {
        assert(millerRabinDeterministic(p));
        assert(isPrimeMillerRabin(p, 10));
        assert(millerRabin(p, 10));
    }
}

void testLargeCompositesNearTwoPow63() {
    std::vector<long long> composites = {
        4294967297LL,            // 2^32 + 1 = 641 * 6700417
        2305843009213693953LL,   // 2^61 + 1
        9223372036854775807LL,   // 2^63 - 1
        9223372012704246007LL,   // 3037000493 * 3037000499
        3215031751LL,            // strong pseudoprime to bases 2, 3, 5, 7
        3825123056546413051LL};  // strong pseudoprime to the first nine primes
    for (long long c : composites) {
        assert(!millerRabinDeterministic(c));
        assert(!isPrimeMillerRabin(c, 20));
    }
}

void testUnsigned64Range() {
    assert(millerRabinDeterministicU64(18446744073709551557ULL));  // 2^64 - 59, prime
    assert(!millerRabinDeterministicU64(18446744073709551615ULL)); // 2^64 - 1
    assert(!millerRabinDeterministicU64(9223372036854775809ULL));  // 2^63 + 1
    assert(millerRabinDeterministicU64(97));
    assert(!millerRabinDeterministicU64(0));
}

void testNegativeAndCarmichael() {
    assert(!millerRabinDeterministic(-7));
    assert(!isPrimeMillerRabin(-7, 10));
    for (long long c : {561LL, 1105LL, 1729LL, 2465LL, 2821LL}) {
        assert(!millerRabinDeterministic(c));
        assert(!isPrimeMillerRabin(c, 10));
    }
}

void testModPowLarge() {
    assert(modPow(3, 1000000, 1000000000000000003LL) == 390030038026333578LL);
    assert(modPow(-2, 3, 5) == 2);
}

void testMatchesTrialDivision() {
    for (long long n = 0; n < 5000; n++) {
        bool prime = n >= 2;
        for (long long i = 2; i * i <= n; i++) {
            if (n % i == 0) { prime = false; break; }
        }
        assert(millerRabinDeterministic(n) == prime);
        assert(isPrimeMillerRabin(n, 10) == prime);
    }
}

int main() {
    testSmallPrimes();
    testComposites();
    testEdgeCases();
    testDeterministic();
    testLargePrimesNearTwoPow63();
    testLargeCompositesNearTwoPow63();
    testUnsigned64Range();
    testNegativeAndCarmichael();
    testModPowLarge();
    testMatchesTrialDivision();
    
    std::cout << "All tests passed!" << std::endl;
    return 0;
}

