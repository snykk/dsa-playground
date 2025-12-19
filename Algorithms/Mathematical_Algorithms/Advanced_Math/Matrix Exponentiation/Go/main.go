package main

import (
	"fmt"
)

// MatrixMultiply multiplies two matrices A and B
// Time Complexity: O(n × m × p)
func MatrixMultiply(A, B [][]int64, mod int64) [][]int64 {
	n := len(A)
	m := len(B)
	p := len(B[0])

	result := make([][]int64, n)
	for i := range result {
		result[i] = make([]int64, p)
	}

	for i := 0; i < n; i++ {
		for j := 0; j < p; j++ {
			for k := 0; k < m; k++ {
				if mod != -1 {
					result[i][j] = (result[i][j] + A[i][k]*B[k][j]) % mod
				} else {
					result[i][j] += A[i][k] * B[k][j]
				}
			}
		}
	}

	return result
}

// MatrixIdentity creates n × n identity matrix
func MatrixIdentity(n int) [][]int64 {
	I := make([][]int64, n)
	for i := range I {
		I[i] = make([]int64, n)
		I[i][i] = 1
	}
	return I
}

// MatrixPower computes A^k using binary exponentiation
// Time Complexity: O(n³ log k)
func MatrixPower(A [][]int64, k int64, mod int64) [][]int64 {
	n := len(A)

	// Base case: A^0 = I
	if k == 0 {
		return MatrixIdentity(n)
	}

	// Base case: A^1 = A
	if k == 1 {
		if mod != -1 {
			result := make([][]int64, n)
			for i := range result {
				result[i] = make([]int64, n)
				for j := range result[i] {
					result[i][j] = A[i][j] % mod
				}
			}
			return result
		}
		// Deep copy
		result := make([][]int64, n)
		for i := range result {
			result[i] = make([]int64, n)
			copy(result[i], A[i])
		}
		return result
	}

	// Recursive case: A^k = (A^(k/2))^2 if k is even
	if k%2 == 0 {
		halfPower := MatrixPower(A, k/2, mod)
		return MatrixMultiply(halfPower, halfPower, mod)
	}
	// A^k = A × A^(k-1)
	return MatrixMultiply(A, MatrixPower(A, k-1, mod), mod)
}

// MatrixPowerIterative computes A^k using iterative binary exponentiation
// Time Complexity: O(n³ log k)
func MatrixPowerIterative(A [][]int64, k int64, mod int64) [][]int64 {
	n := len(A)
	result := MatrixIdentity(n)
	base := make([][]int64, n)
	for i := range base {
		base[i] = make([]int64, n)
		copy(base[i], A[i])
	}

	if mod != -1 {
		for i := 0; i < n; i++ {
			for j := 0; j < n; j++ {
				base[i][j] = base[i][j] % mod
			}
		}
	}

	for k > 0 {
		if k%2 == 1 {
			result = MatrixMultiply(result, base, mod)
		}
		base = MatrixMultiply(base, base, mod)
		k /= 2
	}

	return result
}

// FibonacciMatrix computes nth Fibonacci number using matrix exponentiation
// Time Complexity: O(log n)
func FibonacciMatrix(n int64, mod int64) int64 {
	if n == 0 {
		return 0
	}
	if n == 1 {
		return 1
	}

	// Transformation matrix
	T := [][]int64{{1, 1}, {1, 0}}
	T_power := MatrixPower(T, n-1, mod)

	// Initial vector [F(1), F(0)]
	initial := [][]int64{{1}, {0}}
	result := MatrixMultiply(T_power, initial, mod)

	return result[0][0]
}

func main() {
	// Example usage
	fmt.Println("Matrix Exponentiation Examples:")

	// Example 1: Compute 2x2 matrix to power 5
	A := [][]int64{{1, 1}, {1, 0}}
	A_5 := MatrixPower(A, 5, -1)
	fmt.Printf("A^5 where A = [[1,1],[1,0]]:\n")
	for _, row := range A_5 {
		fmt.Println(row)
	}

	// Example 2: Fibonacci using matrix exponentiation
	fmt.Println("\nFibonacci numbers using matrix exponentiation:")
	for i := int64(0); i < 10; i++ {
		fib := FibonacciMatrix(i, -1)
		fmt.Printf("F(%d) = %d\n", i, fib)
	}

	// Example 3: Matrix power with modulus
	fmt.Println("\nMatrix power with modulus:")
	A_10_mod := MatrixPowerIterative(A, 10, 1000)
	for _, row := range A_10_mod {
		fmt.Println(row)
	}
}
