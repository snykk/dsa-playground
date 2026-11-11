package main

// FibonacciTabulation computes nth Fibonacci using tabulation.
// It panics if n is negative.
// Time Complexity: O(n)
// Space Complexity: O(n)
func FibonacciTabulation(n int) int64 {
	if n < 0 {
		panic("FibonacciTabulation: n must be non-negative")
	}
	if n <= 1 {
		return int64(n)
	}

	dp := make([]int64, n+1)
	dp[0] = 0
	dp[1] = 1

	for i := 2; i <= n; i++ {
		dp[i] = dp[i-1] + dp[i-2]
	}

	return dp[n]
}

// FibonacciOptimized computes nth Fibonacci with O(1) space.
// It panics if n is negative.
// Time Complexity: O(n)
// Space Complexity: O(1)
func FibonacciOptimized(n int) int64 {
	if n < 0 {
		panic("FibonacciOptimized: n must be non-negative")
	}
	if n <= 1 {
		return int64(n)
	}

	var prev2, prev1 int64 = 0, 1

	for i := 2; i <= n; i++ {
		current := prev1 + prev2
		prev2 = prev1
		prev1 = current
	}

	return prev1
}
