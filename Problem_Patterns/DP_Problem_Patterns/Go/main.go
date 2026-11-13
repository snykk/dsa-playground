package main

import (
	"fmt"
	"sort"
)

// Knapsack01 solves 0/1 Knapsack problem.
// Returns maximum value possible.
// Time: O(N * W), Space: O(W)
func Knapsack01(weights, values []int, capacity int) int {
	n := len(weights)
	if n == 0 || capacity < 0 {
		return 0
	}

	dp := make([]int, capacity+1)

	for i := 0; i < n; i++ {
		for w := capacity; w >= weights[i]; w-- {
			if val := dp[w-weights[i]] + values[i]; val > dp[w] {
				dp[w] = val
			}
		}
	}

	return dp[capacity]
}

// LCS finds length of Longest Common Subsequence.
// Time: O(N * M), Space: O(min(N, M))
func LCS(text1, text2 string) int {
	if len(text1) < len(text2) {
		text1, text2 = text2, text1
	}

	m, n := len(text1), len(text2)
	prev := make([]int, n+1)
	curr := make([]int, n+1)

	for i := 1; i <= m; i++ {
		for j := 1; j <= n; j++ {
			if text1[i-1] == text2[j-1] {
				curr[j] = 1 + prev[j-1]
			} else {
				if prev[j] > curr[j-1] {
					curr[j] = prev[j]
				} else {
					curr[j] = curr[j-1]
				}
			}
		}
		copy(prev, curr)
	}

	return prev[n]
}

// LIS finds length of Longest Increasing Subsequence.
// Time: O(N log N), Space: O(N)
func LIS(nums []int) int {
	if len(nums) == 0 {
		return 0
	}

	tails := []int{}

	for _, num := range nums {
		// Binary search
		idx := sort.Search(len(tails), func(i int) bool { return tails[i] >= num })

		if idx < len(tails) {
			tails[idx] = num
		} else {
			tails = append(tails, num)
		}
	}

	return len(tails)
}

func main() {
	// Knapsack
	w := []int{10, 20, 30}
	v := []int{60, 100, 120}
	fmt.Printf("Knapsack Max Value: %d\n", Knapsack01(w, v, 50)) // 220

	// LCS
	s1, s2 := "abcde", "ace"
	fmt.Printf("LCS('%s', '%s'): %d\n", s1, s2, LCS(s1, s2)) // 3

	// LIS
	nums := []int{10, 9, 2, 5, 3, 7, 101, 18}
	fmt.Printf("LIS of %v: %d\n", nums, LIS(nums)) // 4
}
