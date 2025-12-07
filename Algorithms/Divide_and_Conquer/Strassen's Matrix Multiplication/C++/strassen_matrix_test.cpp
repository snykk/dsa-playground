/**
 * Test cases for Strassen's Matrix Multiplication (C++)
 */

#include <iostream>
#include <vector>
#include <cassert>
#include "strassen_matrix.cpp"

using Matrix = std::vector<std::vector<int>>;

void test2x2() {
    Matrix A = {{1, 2}, {3, 4}};
    Matrix B = {{5, 6}, {7, 8}};
    Matrix C = strassenMultiply(A, B);
    assert(C[0][0] == 19 && C[0][1] == 22);
    assert(C[1][0] == 43 && C[1][1] == 50);
    std::cout << "✓ 2x2 test passed" << std::endl;
}

void test1x1() {
    Matrix A = {{2}};
    Matrix B = {{3}};
    Matrix C = strassenMultiply(A, B);
    assert(C[0][0] == 6);
    std::cout << "✓ 1x1 test passed" << std::endl;
}

int main() {
    std::cout << "Running Strassen's Matrix Multiplication tests..." << std::endl;
    test1x1();
    test2x2();
    std::cout << "\nAll tests passed! ✓" << std::endl;
    return 0;
}

