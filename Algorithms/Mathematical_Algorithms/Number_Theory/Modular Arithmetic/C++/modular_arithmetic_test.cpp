/**
 * Unit tests for Modular Arithmetic
 */

#include <cassert>
#include <iostream>
#include "modular_arithmetic.cpp"

void testModAdd() {
    assert(modAdd(7, 5, 11) == 1);
    assert(modAdd(10, 5, 11) == 4);
    assert(modAdd(0, 0, 11) == 0);
}

void testModSubtract() {
    assert(modSubtract(7, 5, 11) == 2);
    assert(modSubtract(3, 5, 11) == 9);  // 3 - 5 = -2 ≡ 9 (mod 11)
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
    
    std::cout << "All tests passed!" << std::endl;
    return 0;
}

