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

int main() {
    testModPowBasic();
    testModPowExponentZero();
    testModPowBaseZero();
    testModPowModulusOne();
    testModInverse();
    testModInverseNotCoprime();
    
    std::cout << "All tests passed!" << std::endl;
    return 0;
}

