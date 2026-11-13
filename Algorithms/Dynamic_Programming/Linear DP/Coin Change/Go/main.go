package main

// CoinChangeMinCoins finds minimum coins to make amount, or -1 if it cannot be made.
// It panics if amount is negative.
func CoinChangeMinCoins(coins []int, amount int) int {
	if amount < 0 {
		panic("CoinChangeMinCoins: amount must be non-negative")
	}
	if amount == 0 {
		return 0
	}

	dp := make([]int, amount+1)
	for i := range dp {
		dp[i] = amount + 1
	}
	dp[0] = 0

	for _, coin := range coins {
		for i := coin; i <= amount; i++ {
			if dp[i-coin] != amount+1 {
				if dp[i-coin]+1 < dp[i] {
					dp[i] = dp[i-coin] + 1
				}
			}
		}
	}

	if dp[amount] > amount {
		return -1
	}
	return dp[amount]
}
