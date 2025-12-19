/**
 * Unit tests for Euclidean Algorithm
 */

#include <cassert>
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
    
    std::cout << "All tests passed!" << std::endl;
    return 0;
}
