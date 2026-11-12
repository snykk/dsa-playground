/**
 * Unit tests for Matrix Exponentiation
 */

#include <cassert>
#include <iostream>
#include <stdexcept>
#include <vector>
#include "matrix_exponentiation.cpp"

void testMatrixIdentity() {
    Matrix I = matrixIdentity(3);
    assert(I.size() == 3);
    assert(I[0].size() == 3);
    assert(I[0][0] == 1 && I[0][1] == 0 && I[0][2] == 0);
    assert(I[1][0] == 0 && I[1][1] == 1 && I[1][2] == 0);
    assert(I[2][0] == 0 && I[2][1] == 0 && I[2][2] == 1);
}

void testMatrixMultiply() {
    Matrix A = {{1, 2}, {3, 4}};
    Matrix B = {{5, 6}, {7, 8}};
    Matrix result = matrixMultiply(A, B);
    
    assert(result[0][0] == 19);
    assert(result[0][1] == 22);
    assert(result[1][0] == 43);
    assert(result[1][1] == 50);
}

void testMatrixPower() {
    Matrix A = {{1, 1}, {1, 0}};
    Matrix A_2 = matrixPower(A, 2);
    assert(A_2[0][0] == 2 && A_2[0][1] == 1);
    assert(A_2[1][0] == 1 && A_2[1][1] == 1);
}

void testMatrixPowerIterative() {
    Matrix A = {{1, 1}, {1, 0}};
    Matrix result1 = matrixPower(A, 5);
    Matrix result2 = matrixPowerIterative(A, 5);
    
    assert(result1.size() == result2.size());
    for (size_t i = 0; i < result1.size(); i++) {
        for (size_t j = 0; j < result1[i].size(); j++) {
            assert(result1[i][j] == result2[i][j]);
        }
    }
}

void testMatrixPowerWithMod() {
    Matrix A = {{1, 1}, {1, 0}};
    Matrix result = matrixPower(A, 10, 1000);

    // [[1,1],[1,0]]^10 = [[89, 55], [55, 34]]
    assert(result[0][0] == 89 && result[0][1] == 55);
    assert(result[1][0] == 55 && result[1][1] == 34);
    // [[1,1],[1,0]]^11 = [[144, 89], [89, 55]], reduced mod 100
    Matrix r11 = matrixPower(A, 11, 100);
    assert(r11[0][0] == 44 && r11[0][1] == 89 && r11[1][0] == 89 && r11[1][1] == 55);
}

void testFibonacciMatrix() {
    assert(fibonacciMatrix(0) == 0);
    assert(fibonacciMatrix(1) == 1);
    assert(fibonacciMatrix(2) == 1);
    assert(fibonacciMatrix(3) == 2);
    assert(fibonacciMatrix(4) == 3);
    assert(fibonacciMatrix(5) == 5);
    assert(fibonacciMatrix(6) == 8);
    assert(fibonacciMatrix(7) == 13);
}

void testFibonacciMatrixLarge() {
    long long fib_10 = fibonacciMatrix(10);
    assert(fib_10 == 55);
    
    long long fib_20 = fibonacciMatrix(20);
    assert(fib_20 == 6765);
}

void testFibonacciMatrixWithMod() {
    // F(100) = 354224848179261915075
    assert(fibonacciMatrix(100, 1000) == 75);
    assert(fibonacciMatrix(100, 1000000007LL) == 687995182LL);
}

void testMatrixPowerFiveExact() {
    Matrix A = {{1, 1}, {1, 0}};
    Matrix A5 = matrixPower(A, 5);
    assert(A5[0][0] == 8 && A5[0][1] == 5 && A5[1][0] == 5 && A5[1][1] == 3);
}

void testNegativeEntriesReduceIntoRange() {
    Matrix A = {{-1}};
    assert(matrixPower(A, 3, 5)[0][0] == 4);
    assert(matrixPowerIterative(A, 3, 5)[0][0] == 4);
}

void testLargeModulus() {
    // 4e9 * 4e9 + 1 = 16000000000000000001 does not fit in long long
    long long mod = 5000000011LL;
    Matrix A = {{4000000000LL, 1}, {1, 0}};
    Matrix r = matrixPower(A, 2, mod);
    __int128 expected = (static_cast<__int128>(4000000000LL) * 4000000000LL + 1) % mod;
    assert(r[0][0] == static_cast<long long>(expected));
}

void testNegativeExponentThrows() {
    Matrix A = {{1, 1}, {1, 0}};
    bool threw = false;
    try { matrixPower(A, -1); } catch (const std::invalid_argument&) { threw = true; }
    assert(threw);
    threw = false;
    try { matrixPowerIterative(A, -1); } catch (const std::invalid_argument&) { threw = true; }
    assert(threw);
}

void testModulusOneAndZero() {
    Matrix A = {{1, 1}, {1, 0}};
    Matrix z = matrixPower(A, 0, 1);
    assert(z[0][0] == 0 && z[1][1] == 0);
    // mod 0 means "no modulus" instead of a division by zero
    Matrix r = matrixPower(A, 5, 0);
    assert(r[0][0] == 8 && r[1][1] == 3);
}

void testFibonacciOverflowGuard() {
    assert(fibonacciMatrix(92) == 7540113804746346429LL);
    bool threw = false;
    try { fibonacciMatrix(93); } catch (const std::overflow_error&) { threw = true; }
    assert(threw);
    assert(fibonacciMatrix(93, 1000000007LL) >= 0);
}

int main() {
    testMatrixPowerFiveExact();
    testNegativeEntriesReduceIntoRange();
    testLargeModulus();
    testNegativeExponentThrows();
    testModulusOneAndZero();
    testFibonacciOverflowGuard();
    testMatrixIdentity();
    testMatrixMultiply();
    testMatrixPower();
    testMatrixPowerIterative();
    testMatrixPowerWithMod();
    testFibonacciMatrix();
    testFibonacciMatrixLarge();
    testFibonacciMatrixWithMod();
    
    std::cout << "All tests passed!" << std::endl;
    return 0;
}

