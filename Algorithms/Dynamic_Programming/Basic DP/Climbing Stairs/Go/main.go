package main

// ClimbingStairs computes ways to climb n steps
func ClimbingStairs(n int) int64 {
	if n <= 2 {
		return int64(n)
	}

	var prev2, prev1 int64 = 1, 2

	for i := 3; i <= n; i++ {
		current := prev1 + prev2
		prev2 = prev1
		prev1 = current
	}

	return prev1
}

