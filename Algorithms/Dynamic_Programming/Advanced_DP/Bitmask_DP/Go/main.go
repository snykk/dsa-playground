package main

import "math"

// TravelingSalesmanDP returns the minimum cost to visit all cities and return
// to city 0. distances is an n x n matrix; math.Inf(1) marks a missing edge.
// The result is math.Inf(1) if no tour exists (every tour uses a missing edge)
// and 0 for no cities.
//
// dp[mask][last] is the cheapest path that starts at city 0, visits exactly
// the cities in mask and stands at city last.
// Time Complexity: O(n^2 * 2^n)
// Space Complexity: O(n * 2^n)
func TravelingSalesmanDP(distances [][]float64) float64 {
	n := len(distances)
	if n == 0 {
		return 0
	}

	inf := math.Inf(1)
	full := 1<<n - 1
	dp := make([][]float64, full+1)
	for mask := range dp {
		dp[mask] = make([]float64, n)
		for last := range dp[mask] {
			dp[mask][last] = inf
		}
	}
	dp[1][0] = 0 // Start at city 0

	for mask := 1; mask <= full; mask++ {
		if mask&1 == 0 {
			continue // every tour starts at city 0
		}
		for last := 0; last < n; last++ {
			if mask&(1<<last) == 0 {
				continue
			}
			for next := 0; next < n; next++ {
				if mask&(1<<next) != 0 {
					continue
				}
				newMask := mask | 1<<next
				if cost := dp[mask][last] + distances[last][next]; cost < dp[newMask][next] {
					dp[newMask][next] = cost
				}
			}
		}
	}

	// Return to start
	result := inf
	for last := 0; last < n; last++ {
		if cost := dp[full][last] + distances[last][0]; cost < result {
			result = cost
		}
	}
	return result
}
