package main

// Knapsack01 solves 0/1 knapsack problem
func Knapsack01(weights, values []int, capacity int) int {
	n := len(weights)
	dp := make([][]int, n+1)
	for i := range dp {
		dp[i] = make([]int, capacity+1)
	}

	for i := 1; i <= n; i++ {
		for w := 0; w <= capacity; w++ {
			if weights[i-1] <= w {
				take := dp[i-1][w-weights[i-1]] + values[i-1]
				skip := dp[i-1][w]
				if take > skip {
					dp[i][w] = take
				} else {
					dp[i][w] = skip
				}
			} else {
				dp[i][w] = dp[i-1][w]
			}
		}
	}

	return dp[n][capacity]
}

