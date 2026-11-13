package main

import "math"

// MatrixChainMultiplication finds minimum scalar multiplications.
// It returns 0 when there are fewer than two matrices (len(dims) < 3).
func MatrixChainMultiplication(dims []int) int {
	if len(dims) < 3 {
		return 0 // fewer than two matrices: nothing to multiply
	}

	n := len(dims) - 1
	dp := make([][]int, n+1)
	for i := range dp {
		dp[i] = make([]int, n+1)
	}

	for l := 2; l <= n; l++ {
		for i := 1; i <= n-l+1; i++ {
			j := i + l - 1
			dp[i][j] = math.MaxInt

			for k := i; k < j; k++ {
				cost := dp[i][k] + dp[k+1][j] + dims[i-1]*dims[k]*dims[j]
				if cost < dp[i][j] {
					dp[i][j] = cost
				}
			}
		}
	}

	return dp[1][n]
}
