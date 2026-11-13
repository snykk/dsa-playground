package main

import (
	"fmt"
	"math/bits"
)

// A modulus is applied only when it is positive; mod <= 0 (the usual -1
// included) means "no modulus", the same rule as the Python and C++ versions.
// With a modulus every result lies in [0, mod), even for negative entries,
// and products go through a 128-bit intermediate (math/bits), so any mod up
// to 2^63 - 1 is exact. Without a modulus plain int64 arithmetic is used and
// overflow is the caller's responsibility.

// normalizeMod maps x into [0, mod).
func normalizeMod(x, mod int64) uint64 {
	r := x % mod
	if r < 0 {
		r += mod
	}
	return uint64(r)
}

// mulMod returns a*b mod m for a, b in [0, m).
func mulMod(a, b, m uint64) uint64 {
	hi, lo := bits.Mul64(a, b)
	return bits.Rem64(hi, lo, m)
}

// MatrixMultiply multiplies two matrices A and B (mod <= 0 means no modulus)
// Time Complexity: O(n x m x p)
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
			if mod > 0 {
				um := uint64(mod)
				var acc uint64
				for k := 0; k < m; k++ {
					acc = (acc + mulMod(normalizeMod(A[i][k], mod), normalizeMod(B[k][j], mod), um)) % um
				}
				result[i][j] = int64(acc)
			} else {
				for k := 0; k < m; k++ {
					result[i][j] += A[i][k] * B[k][j]
				}
			}
		}
	}

	return result
}

// MatrixIdentity creates the n x n identity matrix.
func MatrixIdentity(n int) [][]int64 {
	return identityMod(n, -1)
}

// identityMod is the identity with the diagonal reduced mod m (m == 1 gives
// the zero matrix, since everything is 0 modulo 1).
func identityMod(n int, mod int64) [][]int64 {
	I := make([][]int64, n)
	for i := range I {
		I[i] = make([]int64, n)
		if mod > 0 {
			I[i][i] = 1 % mod
		} else {
			I[i][i] = 1
		}
	}
	return I
}

// MatrixPower computes A^k using binary exponentiation.
// It panics if k is negative. mod <= 0 means no modulus.
// Time Complexity: O(n^3 log k)
func MatrixPower(A [][]int64, k int64, mod int64) [][]int64 {
	if k < 0 {
		panic("matrix: exponent must be non-negative")
	}
	n := len(A)

	// Base case: A^0 = I
	if k == 0 {
		return identityMod(n, mod)
	}

	// Base case: A^1 = A
	if k == 1 {
		if mod > 0 {
			result := make([][]int64, n)
			for i := range result {
				result[i] = make([]int64, n)
				for j := range result[i] {
					result[i][j] = int64(normalizeMod(A[i][j], mod))
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
	// A^k = A x A^(k-1)
	return MatrixMultiply(A, MatrixPower(A, k-1, mod), mod)
}

// MatrixPowerIterative computes A^k using iterative binary exponentiation.
// It panics if k is negative. mod <= 0 means no modulus.
// Time Complexity: O(n^3 log k)
func MatrixPowerIterative(A [][]int64, k int64, mod int64) [][]int64 {
	if k < 0 {
		panic("matrix: exponent must be non-negative")
	}
	n := len(A)
	result := identityMod(n, mod)
	base := make([][]int64, n)
	for i := range base {
		base[i] = make([]int64, n)
		copy(base[i], A[i])
	}

	if mod > 0 {
		for i := 0; i < n; i++ {
			for j := 0; j < n; j++ {
				base[i][j] = int64(normalizeMod(base[i][j], mod))
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

// FibonacciMatrix computes nth Fibonacci number using matrix exponentiation.
// Without a modulus F(n) must fit in int64, so n > 92 panics; n < 0 panics.
// Time Complexity: O(log n)
func FibonacciMatrix(n int64, mod int64) int64 {
	if n < 0 {
		panic("matrix: n must be non-negative")
	}
	if mod <= 0 && n > 92 {
		panic("matrix: F(n) does not fit in int64 for n > 92; pass a modulus")
	}
	if n == 0 {
		return 0
	}
	if n == 1 {
		if mod > 0 {
			return 1 % mod
		}
		return 1
	}

	// Transformation matrix
	T := [][]int64{{1, 1}, {1, 0}}
	tPower := MatrixPower(T, n-1, mod)

	// Initial vector [F(1), F(0)]
	initial := [][]int64{{1}, {0}}
	result := MatrixMultiply(tPower, initial, mod)

	return result[0][0]
}

func main() {
	// Example usage
	fmt.Println("Matrix Exponentiation Examples:")

	// Example 1: Compute 2x2 matrix to power 5
	A := [][]int64{{1, 1}, {1, 0}}
	a5 := MatrixPower(A, 5, -1)
	fmt.Printf("A^5 where A = [[1,1],[1,0]]:\n")
	for _, row := range a5 {
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
	a10Mod := MatrixPowerIterative(A, 10, 1000)
	for _, row := range a10Mod {
		fmt.Println(row)
	}
}
