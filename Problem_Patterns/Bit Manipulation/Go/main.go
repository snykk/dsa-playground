package main

import "fmt"

// IsPowerOfTwo checks if n is a power of 2.
// Time Complexity: O(1)
func IsPowerOfTwo(n int64) bool {
	return n > 0 && (n&(n-1)) == 0
}

// CountSetBits counts the number of 1-bits using Brian Kernighan's algorithm.
// Time Complexity: O(k) where k is the number of set bits
func CountSetBits(n int64) int {
	count := 0
	for n != 0 {
		n &= (n - 1)
		count++
	}
	return count
}

// GetBit gets the i-th bit of n (0-indexed from LSB).
// Time Complexity: O(1)
func GetBit(n int64, i int) int {
	return int((n >> uint(i)) & 1)
}

// SetBit sets the i-th bit to 1.
// Time Complexity: O(1)
func SetBit(n int64, i int) int64 {
	return n | (1 << uint(i))
}

// ClearBit clears the i-th bit to 0.
// Time Complexity: O(1)
func ClearBit(n int64, i int) int64 {
	return n & ^(1 << uint(i))
}

// ToggleBit toggles the i-th bit.
// Time Complexity: O(1)
func ToggleBit(n int64, i int) int64 {
	return n ^ (1 << uint(i))
}

// LowestSetBit isolates the lowest set bit.
// Time Complexity: O(1)
func LowestSetBit(n int64) int64 {
	if n == 0 {
		return 0
	}
	return n & (-n)
}

// HighestSetBit finds the position of the highest set bit (0-indexed).
// Returns -1 if n <= 0.
// Time Complexity: O(log n)
func HighestSetBit(n int64) int {
	if n <= 0 {
		return -1
	}
	position := 0
	for n > 1 {
		n >>= 1
		position++
	}
	return position
}

// CountDifferingBits counts bits that differ between a and b (Hamming distance).
// Time Complexity: O(k) where k is the number of differing bits
func CountDifferingBits(a, b int64) int {
	return CountSetBits(a ^ b)
}

// SwapWithoutTemp swaps two values using XOR without a temporary variable.
// Time Complexity: O(1)
func SwapWithoutTemp(a, b int64) (int64, int64) {
	if a == b {
		return a, b
	}
	a ^= b
	b ^= a
	a ^= b
	return a, b
}

// IsEven checks if n is even using bit operation.
// Time Complexity: O(1)
func IsEven(n int64) bool {
	return (n & 1) == 0
}

// NextPowerOfTwo finds the next power of 2 >= n.
// Time Complexity: O(log n)
func NextPowerOfTwo(n int64) int64 {
	if n <= 1 {
		return 1
	}
	if IsPowerOfTwo(n) {
		return n
	}
	var power int64 = 1
	for power < n {
		power <<= 1
	}
	return power
}

// SubsetGeneration generates all subsets of an n-element set using bitmask enumeration.
// Elements are represented as indices 0 to n-1.
// Time Complexity: O(n * 2^n)
func SubsetGeneration(n int) [][]int {
	total := 1 << uint(n)
	subsets := make([][]int, 0, total)
	for mask := 0; mask < total; mask++ {
		subset := []int{}
		for i := 0; i < n; i++ {
			if mask&(1<<uint(i)) != 0 {
				subset = append(subset, i)
			}
		}
		subsets = append(subsets, subset)
	}
	return subsets
}

func main() {
	fmt.Println("Bit Manipulation Examples:")
	fmt.Printf("IsPowerOfTwo(16): %v\n", IsPowerOfTwo(16))
	fmt.Printf("CountSetBits(13): %d\n", CountSetBits(13))
	fmt.Printf("GetBit(13, 2): %d\n", GetBit(13, 2))
	fmt.Printf("SubsetGeneration(3): %v\n", SubsetGeneration(3))
}
