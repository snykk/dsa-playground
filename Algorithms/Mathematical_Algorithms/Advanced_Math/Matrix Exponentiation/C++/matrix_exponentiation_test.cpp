/**
 * Unit tests for Matrix Exponentiation
 */

#include <cassert>
#include <iostream>
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
    
    for (const auto& row : result) {
        for (long long val : row) {
            assert(val >= 0 && val < 1000);
        }
    }
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
    long long fib_100 = fibonacciMatrix(100, 1000);
    assert(fib_100 >= 0 && fib_100 < 1000);
}

int main() {
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

