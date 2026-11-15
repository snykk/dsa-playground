/**
 * Strassen's Matrix Multiplication Implementation (C++)
 * 
 * Divide and conquer algorithm for matrix multiplication
 * Time Complexity: O(n^log2(7)) ~ O(n^2.81)
 */

#include <vector>
#include <stdexcept>
#include <algorithm>

using Matrix = std::vector<std::vector<int>>;

Matrix matrixAdd(const Matrix& A, const Matrix& B) {
    int n = A.size();
    Matrix C(n, std::vector<int>(n));
    for (int i = 0; i < n; ++i) {
        for (int j = 0; j < n; ++j) {
            C[i][j] = A[i][j] + B[i][j];
        }
    }
    return C;
}

Matrix matrixSubtract(const Matrix& A, const Matrix& B) {
    int n = A.size();
    Matrix C(n, std::vector<int>(n));
    for (int i = 0; i < n; ++i) {
        for (int j = 0; j < n; ++j) {
            C[i][j] = A[i][j] - B[i][j];
        }
    }
    return C;
}

void splitMatrix(const Matrix& matrix, Matrix& A11, Matrix& A12, 
                 Matrix& A21, Matrix& A22) {
    int n = matrix.size();
    int mid = n / 2;
    
    A11.resize(mid, std::vector<int>(mid));
    A12.resize(mid, std::vector<int>(mid));
    A21.resize(mid, std::vector<int>(mid));
    A22.resize(mid, std::vector<int>(mid));
    
    for (int i = 0; i < mid; ++i) {
        for (int j = 0; j < mid; ++j) {
            A11[i][j] = matrix[i][j];
            A12[i][j] = matrix[i][j + mid];
            A21[i][j] = matrix[i + mid][j];
            A22[i][j] = matrix[i + mid][j + mid];
        }
    }
}

Matrix combineMatrices(const Matrix& C11, const Matrix& C12,
                      const Matrix& C21, const Matrix& C22) {
    int n = C11.size();
    Matrix C(2 * n, std::vector<int>(2 * n));
    
    for (int i = 0; i < n; ++i) {
        for (int j = 0; j < n; ++j) {
            C[i][j] = C11[i][j];
            C[i][j + n] = C12[i][j];
            C[i + n][j] = C21[i][j];
            C[i + n][j + n] = C22[i][j];
        }
    }
    
    return C;
}

// Sizes n <= cutoff use the naive triple loop instead of splitting again.
// Throws std::invalid_argument if cutoff is below 1.
Matrix strassenMultiply(const Matrix& A, const Matrix& B, int cutoff = 64) {
    if (cutoff < 1) {
        throw std::invalid_argument("cutoff must be at least 1");
    }
    int n = A.size();
    
    // Base case
    if (n == 1) {
        return {{A[0][0] * B[0][0]}};
    }
    
    // Threshold for switching to naive
    if (n <= cutoff) {
        Matrix C(n, std::vector<int>(n, 0));
        for (int i = 0; i < n; ++i) {
            for (int j = 0; j < n; ++j) {
                for (int k = 0; k < n; ++k) {
                    C[i][j] += A[i][k] * B[k][j];
                }
            }
        }
        return C;
    }
    
    // An odd size cannot be split into equal quadrants: pad by one zero row and
    // column, multiply, and cut the padding off again.
    if (n % 2 == 1) {
        Matrix PA(n + 1, std::vector<int>(n + 1, 0));
        Matrix PB(n + 1, std::vector<int>(n + 1, 0));
        for (int i = 0; i < n; ++i) {
            for (int j = 0; j < n; ++j) {
                PA[i][j] = A[i][j];
                PB[i][j] = B[i][j];
            }
        }
        Matrix PC = strassenMultiply(PA, PB, cutoff);
        Matrix C(n, std::vector<int>(n));
        for (int i = 0; i < n; ++i) {
            for (int j = 0; j < n; ++j) {
                C[i][j] = PC[i][j];
            }
        }
        return C;
    }
    
    // Split matrices
    Matrix A11, A12, A21, A22;
    Matrix B11, B12, B21, B22;
    splitMatrix(A, A11, A12, A21, A22);
    splitMatrix(B, B11, B12, B21, B22);
    
    // Calculate 7 products
    Matrix P1 = strassenMultiply(A11, matrixSubtract(B12, B22), cutoff);
    Matrix P2 = strassenMultiply(matrixAdd(A11, A12), B22, cutoff);
    Matrix P3 = strassenMultiply(matrixAdd(A21, A22), B11, cutoff);
    Matrix P4 = strassenMultiply(A22, matrixSubtract(B21, B11), cutoff);
    Matrix P5 = strassenMultiply(matrixAdd(A11, A22), matrixAdd(B11, B22), cutoff);
    Matrix P6 = strassenMultiply(matrixSubtract(A12, A22), matrixAdd(B21, B22), cutoff);
    Matrix P7 = strassenMultiply(matrixSubtract(A11, A21), matrixAdd(B11, B12), cutoff);
    
    // Calculate result quadrants
    Matrix C11 = matrixAdd(matrixSubtract(matrixAdd(P5, P4), P2), P6);
    Matrix C12 = matrixAdd(P1, P2);
    Matrix C21 = matrixAdd(P3, P4);
    Matrix C22 = matrixSubtract(matrixSubtract(matrixAdd(P5, P1), P3), P7);
    
    return combineMatrices(C11, C12, C21, C22);
}

