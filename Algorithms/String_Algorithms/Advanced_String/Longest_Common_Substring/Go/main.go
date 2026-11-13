package main

import "fmt"

func LongestCommonSubstring(s1, s2 string) string {
	m, n := len(s1), len(s2)
	dp := make([][]int, m+1)
	for i := range dp {
		dp[i] = make([]int, n+1)
	}

	maxLen := 0
	endI := 0

	for i := 1; i <= m; i++ {
		for j := 1; j <= n; j++ {
			if s1[i-1] == s2[j-1] {
				dp[i][j] = dp[i-1][j-1] + 1
				if dp[i][j] > maxLen {
					maxLen = dp[i][j]
					endI = i
				}
			}
		}
	}

	if maxLen == 0 {
		return ""
	}
	return s1[endI-maxLen : endI]
}

func main() {
	s1 := "ABABC"
	s2 := "BABCA"
	fmt.Println("Longest Common Substring:", LongestCommonSubstring(s1, s2))
}
