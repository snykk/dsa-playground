/**
 * Unit tests for Euclidean Algorithm
 */

#include <cassert>
#include <numeric>
#include <iostream>
#include "euclidean_algorithm.cpp"

void testGcdBasic() {
    assert(gcd(48, 18) == 6);
    assert(gcd(100, 25) == 25);
    assert(gcd(17, 13) == 1);
}

void testGcdCommutative() {
    assert(gcd(48, 18) == gcd(18, 48));
    assert(gcd(100, 25) == gcd(25, 100));
}

void testGcdWithZero() {
    assert(gcd(0, 5) == 5);
    assert(gcd(5, 0) == 5);
    assert(gcd(0, 0) == 0);
}

void testGcdNegative() {
    assert(gcd(-48, 18) == 6);
    assert(gcd(48, -18) == 6);
    assert(gcd(-48, -18) == 6);
}

void testGcdIterative() {
    assert(gcdIterative(48, 18) == 6);
    assert(gcdIterative(100, 25) == 25);
    assert(gcdIterative(17, 13) == 1);
    assert(gcdIterative(48, 18) == gcd(48, 18));
}

void testLcmBasic() {
    assert(lcm(12, 18) == 36);
    assert(lcm(7, 5) == 35);
    assert(lcm(4, 6) == 12);
}

void testLcmCommutative() {
    assert(lcm(12, 18) == lcm(18, 12));
    assert(lcm(7, 5) == lcm(5, 7));
}

void testLcmWithZero() {
    assert(lcm(0, 5) == 0);
    assert(lcm(5, 0) == 0);
}

void testLcmGcdRelationship() {
    long long a = 12, b = 18;
    assert(lcm(a, b) * gcd(a, b) == std::abs(a * b));
    
    a = 7; b = 5;
    assert(lcm(a, b) * gcd(a, b) == std::abs(a * b));
}

void testExtendedGcd() {
    ExtendedGCD result = extendedGcd(48, 18);
    assert(result.gcd == 6);
    assert(48 * result.x + 18 * result.y == result.gcd);
    
    result = extendedGcd(100, 25);
    assert(result.gcd == 25);
    assert(100 * result.x + 25 * result.y == result.gcd);
}

void testExtendedGcdCoprime() {
    ExtendedGCD result = extendedGcd(17, 13);
    assert(result.gcd == 1);
    assert(17 * result.x + 13 * result.y == 1);
}

void testExtendedGcdNegativeInputs() {
    ExtendedGCD r = extendedGcd(-48, 18);
    assert(r.gcd == 6);
    assert(-48 * r.x + 18 * r.y == 6);
    r = extendedGcd(48, -18);
    assert(48 * r.x - 18 * r.y == 6);
    r = extendedGcd(-48, -18);
    assert(-48 * r.x - 18 * r.y == 6);
}

void testExtendedGcdIdentityRandomSigned() {
    unsigned seed = 2026;
    auto next = [&seed]() { seed = seed * 1103515245u + 12345u; return seed >> 8; };
    for (int i = 0; i < 20000; i++) {
        long long a = static_cast<long long>(next() % 2000001) - 1000000;
        long long b = static_cast<long long>(next() % 2000001) - 1000000;
        ExtendedGCD r = extendedGcd(a, b);
        assert(r.gcd == std::gcd(a, b));
        assert(a * r.x + b * r.y == r.gcd);
    }
}

void testExtendedGcdZero() {
    ExtendedGCD r = extendedGcd(0, 0);
    assert(r.gcd == 0 && r.x == 1 && r.y == 0);
    r = extendedGcd(-7, 0);
    assert(r.gcd == 7 && -7 * r.x == 7);
    r = extendedGcd(0, -7);
    assert(r.gcd == 7 && -7 * r.y == 7);
}

void testLcmDoesNotOverflow() {
    // |a * b| = 1.6e19 does not fit in 64 bits, the lcm 4e9 does.
    assert(lcm(4000000000LL, 4000000000LL) == 4000000000LL);
    assert(lcm(-4000000000LL, 4000000000LL) == 4000000000LL);
    assert(lcm(100000007LL, 100000037LL) == 10000004400000259LL);
}

void testGcdLargeValues() {
    assert(gcd(9007199254740993LL, 3) == 3);  // 2^53 + 1
    assert(gcdIterative(9007199254740993LL, 3) == 3);
}

int main() {
    testGcdBasic();
    testGcdCommutative();
    testGcdWithZero();
    testGcdNegative();
    testGcdIterative();
    testLcmBasic();
    testLcmCommutative();
    testLcmWithZero();
    testLcmGcdRelationship();
    testExtendedGcd();
    testExtendedGcdCoprime();
    testExtendedGcdNegativeInputs();
    testExtendedGcdIdentityRandomSigned();
    testExtendedGcdZero();
    testLcmDoesNotOverflow();
    testGcdLargeValues();
    
    std::cout << "All tests passed!" << std::endl;
    return 0;
}
