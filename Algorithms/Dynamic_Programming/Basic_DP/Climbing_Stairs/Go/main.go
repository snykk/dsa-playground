package main

// ClimbingStairs computes ways to climb n steps taking 1 or 2 steps at a time.
// ClimbingStairs(0) is 1 (the empty climb); it panics if n is negative.
func ClimbingStairs(n int) int64 {
	if n < 0 {
		panic("ClimbingStairs: n must be non-negative")
	}
	if n == 0 {
		return 1 // one way to climb zero stairs: take no step
	}
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
