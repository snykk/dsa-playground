/**
 * Matrix Exponentiation Implementation (C++)
 * 
 * Matrix exponentiation computes A^k efficiently using binary exponentiation,
 * where A is a square matrix and k is a non-negative integer.
 */

#include <stdexcept>
#include <vector>

typedef std::vector<std::vector<long long>> Matrix;

// A modulus is applied only when it is positive; mod <= 0 (the default -1
// included) means "no modulus", the same rule as the Python and Go versions.
// With a modulus every result lies in [0, mod), even for negative entries,
// and products use a 128-bit intermediate, so any mod up to 2^63 - 1 is exact.
// Without a modulus plain long long arithmetic is used and overflow is the
// caller's responsibility.
inline long long normalizeMod(long long x, long long mod) {
    long long r = x % mod;
    return r < 0 ? r + mod : r;
}

/**
 * Multiply two matrices A and B
 * Time Complexity: O(n x m x p)
 */
Matrix matrixMultiply(const Matrix& A, const Matrix& B, long long mod = -1) {
    int n = A.size();
    int m = B.size();
    int p = B[0].size();
    
    Matrix result(n, std::vector<long long>(p, 0));
    
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < p; j++) {
            if (mod > 0) {
                __int128 acc = 0;
                for (int k = 0; k < m; k++) {
                    acc = (acc + static_cast<__int128>(normalizeMod(A[i][k], mod)) *
                                     normalizeMod(B[k][j], mod)) % mod;
                }
                result[i][j] = static_cast<long long>(acc);
            } else {
                for (int k = 0; k < m; k++) {
                    result[i][j] += A[i][k] * B[k][j];
                }
            }
        }
    }
    
    return result;
}

/**
 * Create n x n identity matrix (with mod == 1 the diagonal reduces to 0)
 */
Matrix matrixIdentity(int n, long long mod = -1) {
    Matrix I(n, std::vector<long long>(n, 0));
    for (int i = 0; i < n; i++) {
        I[i][i] = mod > 0 ? 1 % mod : 1;
    }
    return I;
}

/**
 * Compute A^k using binary exponentiation
 * Time Complexity: O(n^3 log k)
 */
Matrix matrixPower(const Matrix& A, long long k, long long mod = -1) {
    if (k < 0) {
        throw std::invalid_argument("exponent must be non-negative");
    }
    int n = A.size();
    
    // Base case: A^0 = I
    if (k == 0) {
        return matrixIdentity(n, mod);
    }
    
    // Base case: A^1 = A
    if (k == 1) {
        if (mod > 0) {
            Matrix result(n, std::vector<long long>(n));
            for (int i = 0; i < n; i++) {
                for (int j = 0; j < n; j++) {
                    result[i][j] = normalizeMod(A[i][j], mod);
                }
            }
            return result;
        }
        return A;
    }
    
    // Recursive case: A^k = (A^(k/2))^2 if k is even
    if (k % 2 == 0) {
        Matrix halfPower = matrixPower(A, k / 2, mod);
        return matrixMultiply(halfPower, halfPower, mod);
    } else {
        // A^k = A x A^(k-1)
        return matrixMultiply(A, matrixPower(A, k - 1, mod), mod);
    }
}

/**
 * Compute A^k using iterative binary exponentiation
 * Time Complexity: O(n^3 log k)
 */
Matrix matrixPowerIterative(const Matrix& A, long long k, long long mod = -1) {
    if (k < 0) {
        throw std::invalid_argument("exponent must be non-negative");
    }
    int n = A.size();
    Matrix result = matrixIdentity(n, mod);
    Matrix base = A;
    
    if (mod > 0) {
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) {
                base[i][j] = normalizeMod(base[i][j], mod);
            }
        }
    }
    
    while (k > 0) {
        if (k % 2 == 1) {
            result = matrixMultiply(result, base, mod);
        }
        base = matrixMultiply(base, base, mod);
        k /= 2;
    }
    
    return result;
}

/**
 * Compute nth Fibonacci number using matrix exponentiation.
 * Without a modulus F(n) must fit in long long, so n > 92 throws
 * std::overflow_error; n < 0 throws std::invalid_argument.
 * Time Complexity: O(log n)
 */
long long fibonacciMatrix(long long n, long long mod = -1) {
    if (n < 0) {
        throw std::invalid_argument("n must be non-negative");
    }
    if (mod <= 0 && n > 92) {
        throw std::overflow_error("F(n) does not fit in long long for n > 92; pass a modulus");
    }
    if (n == 0) {
        return 0;
    }
    if (n == 1) {
        return mod > 0 ? 1 % mod : 1;
    }
    
    // Transformation matrix
    Matrix T = {{1, 1}, {1, 0}};
    Matrix tPower = matrixPower(T, n - 1, mod);
    
    // Initial vector [F(1), F(0)]
    Matrix initial = {{1}, {0}};
    Matrix result = matrixMultiply(tPower, initial, mod);
    
    return result[0][0];
}

// Example usage (uncomment to use)
/*
#include <iostream>
#ifndef TESTING
#ifndef IS_TEST_BUILD
int main() {
    Matrix A = {{1, 1}, {1, 0}};
    Matrix A_5 = matrixPower(A, 5);
    
    for (const auto& row : A_5) {
        for (long long val : row) {
            std::cout << val << " ";
        }
        std::cout << std::endl;
    }
    
    return 0;
}
#endif
#endif
*/
