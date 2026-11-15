package main

import "strconv"

// CountNumbersWithDigitSum counts the numbers from 0 to n whose decimal digit
// sum equals targetSum, with a memoized recursion over (position, tight, sum).
// It returns 0 when n < 0 (so count(R) - count(L - 1) works for L = 0) and
// when targetSum < 0, as Python does.
// Time Complexity: O(digits * targetSum * 10)
// Space Complexity: O(digits * targetSum)
func CountNumbersWithDigitSum(n int64, targetSum int) int64 {
	if n < 0 || targetSum < 0 {
		return 0
	}
	digits := strconv.FormatInt(n, 10)

	// memo[pos][tight][sum]: the count for that state, or -1 if not computed
	// yet. A stored sum never exceeds the target, nor 9 per digit.
	maxSum := min(targetSum, 9*len(digits))
	memo := make([][2][]int64, len(digits))
	for pos := range memo {
		for tight := range memo[pos] {
			memo[pos][tight] = make([]int64, maxSum+1)
			for sum := range memo[pos][tight] {
				memo[pos][tight][sum] = -1
			}
		}
	}

	var dp func(pos int, tight bool, sum int) int64
	dp = func(pos int, tight bool, sum int) int64 {
		if pos == len(digits) {
			if sum == targetSum {
				return 1
			}
			return 0
		}

		t := 0
		if tight {
			t = 1
		}
		if cached := memo[pos][t][sum]; cached != -1 {
			return cached
		}

		limit := 9
		if tight {
			limit = int(digits[pos] - '0')
		}
		var count int64
		for d := 0; d <= limit; d++ {
			newTight := tight && d == limit
			newSum := sum + d
			if newSum <= targetSum {
				count += dp(pos+1, newTight, newSum)
			}
		}

		memo[pos][t][sum] = count
		return count
	}

	return dp(0, true, 0)
}
