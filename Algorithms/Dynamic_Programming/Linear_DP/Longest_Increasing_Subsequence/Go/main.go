package main

// LISDP computes longest increasing subsequence
func LISDP(arr []int) int {
	if len(arr) == 0 {
		return 0
	}

	n := len(arr)
	dp := make([]int, n)
	for i := range dp {
		dp[i] = 1
	}

	for i := 1; i < n; i++ {
		for j := 0; j < i; j++ {
			if arr[j] < arr[i] && dp[j]+1 > dp[i] {
				dp[i] = dp[j] + 1
			}
		}
	}

	maxLen := 0
	for _, val := range dp {
		if val > maxLen {
			maxLen = val
		}
	}

	return maxLen
}

