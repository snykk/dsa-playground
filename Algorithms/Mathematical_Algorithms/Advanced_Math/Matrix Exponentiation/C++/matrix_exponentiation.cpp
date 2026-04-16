/**
 * Matrix Exponentiation Implementation (C++)
 * 
 * Matrix exponentiation computes A^k efficiently using binary exponentiation,
 * where A is a square matrix and k is a non-negative integer.
 */

#include <vector>

typedef std::vector<std::vector<long long>> Matrix;

/**
 * Multiply two matrices A and B
 * Time Complexity: O(n × m × p)
 */
Matrix matrixMultiply(const Matrix& A, const Matrix& B, long long mod = -1) {
    int n = A.size();
    int m = B.size();
    int p = B[0].size();
    
    Matrix result(n, std::vector<long long>(p, 0));
    
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < p; j++) {
            for (int k = 0; k < m; k++) {
                if (mod != -1) {
                    result[i][j] = (result[i][j] + A[i][k] * B[k][j]) % mod;
                } else {
                    result[i][j] += A[i][k] * B[k][j];
                }
            }
        }
    }
    
    return result;
}

/**
 * Create n × n identity matrix
 */
Matrix matrixIdentity(int n) {
    Matrix I(n, std::vector<long long>(n, 0));
    for (int i = 0; i < n; i++) {
        I[i][i] = 1;
    }
    return I;
}

/**
 * Compute A^k using binary exponentiation
 * Time Complexity: O(n³ log k)
 */
Matrix matrixPower(const Matrix& A, long long k, long long mod = -1) {
    int n = A.size();
    
    // Base case: A^0 = I
    if (k == 0) {
        return matrixIdentity(n);
    }
    
    // Base case: A^1 = A
    if (k == 1) {
        if (mod != -1) {
            Matrix result(n, std::vector<long long>(n));
            for (int i = 0; i < n; i++) {
                for (int j = 0; j < n; j++) {
                    result[i][j] = A[i][j] % mod;
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
        // A^k = A × A^(k-1)
        return matrixMultiply(A, matrixPower(A, k - 1, mod), mod);
    }
}

/**
 * Compute A^k using iterative binary exponentiation
 * Time Complexity: O(n³ log k)
 */
Matrix matrixPowerIterative(const Matrix& A, long long k, long long mod = -1) {
    int n = A.size();
    Matrix result = matrixIdentity(n);
    Matrix base = A;
    
    if (mod != -1) {
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) {
                base[i][j] = base[i][j] % mod;
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
 * Compute nth Fibonacci number using matrix exponentiation
 * Time Complexity: O(log n)
 */
long long fibonacciMatrix(long long n, long long mod = -1) {
    if (n == 0) {
        return 0;
    }
    if (n == 1) {
        return 1;
    }
    
    // Transformation matrix
    Matrix T = {{1, 1}, {1, 0}};
    Matrix T_power = matrixPower(T, n - 1, mod);
    
    // Initial vector [F(1), F(0)]
    Matrix initial = {{1}, {0}};
    Matrix result = matrixMultiply(T_power, initial, mod);
    
    return result[0][0];
}

// Example usage (uncomment to use)
/*
#include <iostream>
#ifndef TESTING
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
*/

