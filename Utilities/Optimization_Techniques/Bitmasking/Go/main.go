// Bitmasking Techniques for Competitive Programming (Go)

package main

import "fmt"

// Basic Bit Operations

// GetBit checks if i-th bit is set
func GetBit(mask, i int) bool {
	return (mask>>i)&1 == 1
}

// SetBit sets i-th bit to 1
func SetBit(mask, i int) int {
	return mask | (1 << i)
}

// ClearBit clears i-th bit (set to 0)
func ClearBit(mask, i int) int {
	return mask &^ (1 << i)
}

// ToggleBit toggles i-th bit
func ToggleBit(mask, i int) int {
	return mask ^ (1 << i)
}

// CountBits counts number of set bits
func CountBits(mask int) int {
	count := 0
	for mask != 0 {
		count++
		mask &= mask - 1
	}
	return count
}

// LowestSetBit gets lowest set bit
func LowestSetBit(mask int) int {
	return mask & (-mask)
}

// ClearLowestBit clears lowest set bit
func ClearLowestBit(mask int) int {
	return mask & (mask - 1)
}

// Subset Enumeration

// EnumerateSubsets iterates through all subsets of a set
func EnumerateSubsets(mask int) []int {
	var subsets []int
	sub := mask
	for {
		subsets = append(subsets, sub)
		if sub == 0 {
			break
		}
		sub = (sub - 1) & mask
	}
	return subsets
}

// Bitmask DP

// TSP solves Traveling Salesman Problem using bitmask DP
func TSP(dist [][]int) int {
	n := len(dist)
	const INF = 1 << 30

	// dp[mask][last] = minimum distance to visit all cities in mask, ending at last
	dp := make([][]int, 1<<n)
	for i := range dp {
		dp[i] = make([]int, n)
		for j := range dp[i] {
			dp[i][j] = INF
		}
	}
	dp[1][0] = 0 // Start from city 0

	for mask := 1; mask < (1 << n); mask++ {
		for last := 0; last < n; last++ {
			if mask&(1<<last) == 0 {
				continue
			}
			if dp[mask][last] == INF {
				continue
			}

			for nextCity := 0; nextCity < n; nextCity++ {
				if mask&(1<<nextCity) != 0 {
					continue
				}

				newMask := mask | (1 << nextCity)
				newDist := dp[mask][last] + dist[last][nextCity]
				if newDist < dp[newMask][nextCity] {
					dp[newMask][nextCity] = newDist
				}
			}
		}
	}

	// Return to starting city
	fullMask := (1 << n) - 1
	result := INF
	for last := 1; last < n; last++ {
		total := dp[fullMask][last] + dist[last][0]
		if total < result {
			result = total
		}
	}
	return result
}

// CountSubsetSum counts subsets that sum to target
func CountSubsetSum(nums []int, target int) int {
	n := len(nums)
	count := 0

	for mask := 0; mask < (1 << n); mask++ {
		total := 0
		for i := 0; i < n; i++ {
			if mask&(1<<i) != 0 {
				total += nums[i]
			}
		}
		if total == target {
			count++
		}
	}

	return count
}

// Bit Manipulation Tricks

// IsPowerOf2 checks if n is power of 2
func IsPowerOf2(n int) bool {
	return n > 0 && (n&(n-1)) == 0
}

// NextPowerOf2 rounds up to next power of 2
func NextPowerOf2(n int) int {
	if n <= 0 {
		return 1
	}
	n--
	n |= n >> 1
	n |= n >> 2
	n |= n >> 4
	n |= n >> 8
	n |= n >> 16
	return n + 1
}

// SOSDP computes Sum Over Subsets DP
func SOSDP(a []int) []int {
	n := len(a)
	dp := make([]int, n)
	copy(dp, a)

	bits := 0
	for (1 << bits) < n {
		bits++
	}

	for i := 0; i < bits; i++ {
		for mask := 0; mask < n; mask++ {
			if mask&(1<<i) != 0 {
				dp[mask] += dp[mask^(1<<i)]
			}
		}
	}

	return dp
}

func main() {
	mask := 0b10110

	fmt.Printf("Original: %b\n", mask)
	fmt.Printf("Bit 1 set: %v\n", GetBit(mask, 1))
	fmt.Printf("Bit 3 set: %v\n", GetBit(mask, 3))
	fmt.Printf("Set bit 0: %b\n", SetBit(mask, 0))
	fmt.Printf("Clear bit 2: %b\n", ClearBit(mask, 2))
	fmt.Printf("Toggle bit 4: %b\n", ToggleBit(mask, 4))
	fmt.Printf("Count bits: %d\n", CountBits(mask))

	fmt.Println("\nSubsets of 0b111:")
	subsets := EnumerateSubsets(0b111)
	for _, sub := range subsets {
		fmt.Printf("  %b\n", sub)
	}
}
