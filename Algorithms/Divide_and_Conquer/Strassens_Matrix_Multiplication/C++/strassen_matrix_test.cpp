/**
 * Test cases for Strassen's Matrix Multiplication (C++)
 */

#include <iostream>
#include <vector>
#include <cassert>
#include <cstdlib>
#include "strassen_matrix.cpp"

using Matrix = std::vector<std::vector<int>>;

void test2x2() {
    Matrix A = {{1, 2}, {3, 4}};
    Matrix B = {{5, 6}, {7, 8}};
    Matrix C = strassenMultiply(A, B);
    assert(C[0][0] == 19 && C[0][1] == 22);
    assert(C[1][0] == 43 && C[1][1] == 50);
    std::cout << "2x2 test passed" << std::endl;
}

void test1x1() {
    Matrix A = {{2}};
    Matrix B = {{3}};
    Matrix C = strassenMultiply(A, B);
    assert(C[0][0] == 6);
    std::cout << "1x1 test passed" << std::endl;
}

Matrix randomMatrix(int n, unsigned seed) {
    srand(seed);
    Matrix M(n, std::vector<int>(n));
    for (auto& row : M)
        for (auto& x : row) x = rand() % 19 - 9;
    return M;
}

Matrix naive(const Matrix& A, const Matrix& B) {
    int n = A.size();
    Matrix C(n, std::vector<int>(n, 0));
    for (int i = 0; i < n; ++i)
        for (int j = 0; j < n; ++j)
            for (int k = 0; k < n; ++k) C[i][j] += A[i][k] * B[k][j];
    return C;
}

void testSevenProductRecursion128() {
    Matrix A = randomMatrix(128, 1), B = randomMatrix(128, 2);
    assert(strassenMultiply(A, B) == naive(A, B));
    std::cout << "128x128 test passed" << std::endl;
}

// Regression: an odd n > 64 used to return a truncated (n-1) x (n-1) matrix.
void testOddSizeAboveCutoff() {
    for (int n : {65, 130}) {
        Matrix A = randomMatrix(n, 3), B = randomMatrix(n, 4);
        Matrix C = strassenMultiply(A, B);
        assert((int)C.size() == n);
        assert(C == naive(A, B));
    }
    std::cout << "odd size 65 and 130 tests passed" << std::endl;
}

int main() {
    std::cout << "Running Strassen's Matrix Multiplication tests..." << std::endl;
    test1x1();
    test2x2();
    testSevenProductRecursion128();
    testOddSizeAboveCutoff();
    std::cout << "\nAll tests passed!" << std::endl;
    return 0;
}

