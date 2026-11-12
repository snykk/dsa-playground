/**
 * Unit tests for Modular Arithmetic
 */

#include <cassert>
#include <numeric>
#include <iostream>
#include "modular_arithmetic.cpp"

void testModAdd() {
    assert(modAdd(7, 5, 11) == 1);
    assert(modAdd(10, 5, 11) == 4);
    assert(modAdd(0, 0, 11) == 0);
}

void testModSubtract() {
    assert(modSubtract(7, 5, 11) == 2);
    assert(modSubtract(3, 5, 11) == 9);  // 3 - 5 = -2, which is 9 modulo 11
    assert(modSubtract(0, 0, 11) == 0);
}

void testModMultiply() {
    assert(modMultiply(7, 5, 11) == 2);
    assert(modMultiply(3, 4, 11) == 1);
    assert(modMultiply(0, 5, 11) == 0);
}

void testModDivide() {
    assert(modDivide(7, 5, 11) == 8);
    assert(modDivide(6, 3, 11) == 2);
    long long result = modDivide(4, 8, 11);
    assert(result != -1);
    assert((result * 8) % 11 == 4);
}

void testModDivideNoInverse() {
    long long result = modDivide(4, 8, 12);  // GCD(8, 12) = 4 != 1
    assert(result == -1);
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

void testModPower() {
    assert(modPower(2, 5, 11) == 10);
    assert(modPower(3, 5, 7) == 5);
    assert(modPower(5, 0, 11) == 1);
}

void testModArithmeticProperties() {
    long long m = 11;
    long long a = 7, b = 5, c = 3;
    
    // Associativity of addition
    assert(modAdd(modAdd(a, b, m), c, m) == modAdd(a, modAdd(b, c, m), m));
    
    // Associativity of multiplication
    assert(modMultiply(modMultiply(a, b, m), c, m) == modMultiply(a, modMultiply(b, c, m), m));
    
    // Distributivity
    assert(modMultiply(a, modAdd(b, c, m), m) == modAdd(modMultiply(a, b, m), modMultiply(a, c, m), m));
}

void testNegativeOperandsStayInRange() {
    assert(modAdd(-3, 1, 11) == 9);
    assert(modMultiply(-3, 4, 11) == 10);
    assert(modPower(-2, 3, 5) == 2);
    assert(modSubtract(-3, -5, 11) == 2);
}

void testExtendedGcdSignedIdentity() {
    unsigned seed = 11;
    auto next = [&seed]() { seed = seed * 1103515245u + 12345u; return seed >> 8; };
    for (int i = 0; i < 20000; i++) {
        long long a = static_cast<long long>(next() % 1001) - 500;
        long long b = static_cast<long long>(next() % 1001) - 500;
        ExtendedGCD r = extendedGcd(a, b);
        assert(r.gcd == std::gcd(a, b));
        assert(a * r.x + b * r.y == r.gcd);
    }
}

void testInverseOfNegativeNumber() {
    assert(modInverse(-3, 11) == 7);
    assert(modDivide(1, -3, 11) == 7);
    assert(modDivide(-1, 1, 11) == 10);  // not confused with the -1 sentinel
    for (long long a = -30; a < 30; a++) {
        long long inv = modInverse(a, 11);
        if (a % 11 == 0) {
            assert(inv == -1);
        } else {
            assert(modMultiply(a, inv, 11) == 1);
        }
    }
}

void testNegativeExponent() {
    assert(modPower(2, -1, 11) == 6);
    assert(modPower(2, -1, 12) == -1);
}

void testLargeModulusNoOverflow() {
    const long long m = 1000000000000000003LL;
    assert(modMultiply(1000000000000LL, 1000000000000LL, m) == 999999999997000003LL);
    assert(modPower(3, 1000000, m) == 390030038026333578LL);
    // m > 2^62: a plain x + y would overflow.
    const long long big = 9223372036854775783LL;  // 2^63 - 25
    assert(modAdd(big - 1, big - 2, big) == big - 3);
    assert(modSubtract(1, big - 1, big) == 2);
    assert(modMultiply(big - 1, big - 1, big) == 1);
    long long inv = modInverse(1234567890123LL, big);
    assert(inv != -1 && modMultiply(1234567890123LL, inv, big) == 1);
}

int main() {
    testModAdd();
    testModSubtract();
    testModMultiply();
    testModDivide();
    testModDivideNoInverse();
    testModInverse();
    testModInverseNotCoprime();
    testModPower();
    testModArithmeticProperties();
    testNegativeOperandsStayInRange();
    testExtendedGcdSignedIdentity();
    testInverseOfNegativeNumber();
    testNegativeExponent();
    testLargeModulusNoOverflow();
    
    std::cout << "All tests passed!" << std::endl;
    return 0;
}

