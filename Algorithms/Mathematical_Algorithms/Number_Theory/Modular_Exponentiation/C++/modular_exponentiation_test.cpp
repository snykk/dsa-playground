/**
 * Unit tests for Modular Exponentiation
 */

#include <cassert>
#include <iostream>

// Include implementation inline for testing
#include "modular_exponentiation.cpp"

void testModPowBasic() {
    assert(modPow(2, 10, 1000) == 24);
    assert(modPow(3, 5, 7) == 5);
    assert(modPow(5, 13, 11) == 4); // 5^13 mod 11 = 4 (verified)
}

void testModPowExponentZero() {
    assert(modPow(5, 0, 7) == 1);
    assert(modPow(10, 0, 100) == 1);
}

void testModPowBaseZero() {
    assert(modPow(0, 5, 7) == 0);
    assert(modPow(0, 0, 7) == 1);
}

void testModPowModulusOne() {
    assert(modPow(5, 10, 1) == 0);
}

void testModInverse() {
    long long result = modInverse(3, 11);
    assert(result == 4);
    assert((3 * result) % 11 == 1);
}

void testModInverseNotCoprime() {
    long long result = modInverse(4, 8);
    assert(result == -1);
}

void testLargeModulusNoOverflow() {
    assert(modPow(3, 1000000, 1000000000000000003LL) == 390030038026333578LL);
    // Fermat: a^(p-1) = 1 for the prime p = 2^61 - 1 (products need 122 bits).
    const long long p = 2305843009213693951LL;
    assert(modPow(123456789, p - 1, p) == 1);
    assert(modPow(2, 61, p) == 1);
    // 2^63 - 25 is the largest prime below 2^63.
    const long long q = 9223372036854775783LL;
    assert(modPow(5, q - 1, q) == 1);
}

void testNegativeBase() {
    assert(modPow(-2, 3, 5) == 2);
    assert(modPow(-1, 1000001, 7) == 6);
}

void testNegativeExponent() {
    assert(modPow(2, -1, 11) == 6);
    assert(modPow(2, -1, 12) == -1);
}

void testInverseOfNegativeNumber() {
    assert(modInverse(-3, 11) == 7);
    for (long long a = -30; a < 30; a++) {
        long long inv = modInverse(a, 11);
        if (a % 11 == 0) {
            assert(inv == -1);
        } else {
            assert(((a % 11 + 11) * inv) % 11 == 1);
        }
    }
}

void testExtendedGcdSignedIdentity() {
    unsigned seed = 5;
    auto next = [&seed]() { seed = seed * 1103515245u + 12345u; return seed >> 8; };
    for (int i = 0; i < 20000; i++) {
        long long a = static_cast<long long>(next() % 1001) - 500;
        long long b = static_cast<long long>(next() % 1001) - 500;
        ExtendedGCD r = extendedGcd(a, b);
        assert(a * r.x + b * r.y == r.gcd);
        assert(r.gcd >= 0);
    }
}

void testLargeExponent() {
    assert(modPow(2, 100, 1000) == 376);
    assert(modPow(2, 9223372036854775807LL, 1000000007LL) == 529367677LL);
}

int main() {
    testModPowBasic();
    testModPowExponentZero();
    testModPowBaseZero();
    testModPowModulusOne();
    testModInverse();
    testModInverseNotCoprime();
    testLargeModulusNoOverflow();
    testNegativeBase();
    testNegativeExponent();
    testInverseOfNegativeNumber();
    testExtendedGcdSignedIdentity();
    testLargeExponent();
    
    std::cout << "All tests passed!" << std::endl;
    return 0;
}

