package main

import (
	"fmt"
	"sort"
)

/*
 * Big-O Notation Implementation and Examples
 *
 * Big-O notation describes the upper bound of an algorithm's time complexity.
 * It is an upper bound on a function; that function can be the best, average or
 * worst-case running time (O is not a synonym for 'worst case').
 *
 * Formal Definition:
 * f(n) = O(g(n)) if there exist positive constants c and n_0 such that
 * 0 <= f(n) <= c*g(n) for all n >= n_0
 */

// ConstantTimeExample demonstrates O(1) - Constant Time
// Time complexity doesn't depend on input size.
//
// Time Complexity: O(1)
// Space Complexity: O(1)
func ConstantTimeExample(n int) int {
	return 42
}

// LogarithmicTimeExample demonstrates O(log n) - Logarithmic Time
// Time complexity grows logarithmically with input size.
// Common in binary search, balanced tree operations.
//
// Time Complexity: O(log n)
// Space Complexity: O(1)
func LogarithmicTimeExample(n int) int {
	count := 0
	i := n
	for i > 1 {
		i = i / 2
		count++
	}
	return count
}

// LinearTimeExample demonstrates O(n) - Linear Time
// Time complexity grows linearly with input size.
// Common in single loops, array traversal.
//
// Time Complexity: O(n)
// Space Complexity: O(1)
func LinearTimeExample(arr []int) int {
	total := 0
	for _, element := range arr {
		total += element
	}
	return total
}

// LinearithmicTimeExample demonstrates O(n log n) - Linearithmic Time
// Time complexity grows as n times log n.
// Common in efficient sorting algorithms (merge sort, heap sort).
//
// This calls the library sort (sort.Ints, a pattern-defeating quicksort), not a
// hand-written merge sort: O(n log n) worst case, but about O(n) on sorted input.
//
// Time Complexity: O(n log n)
// Space Complexity: O(n)
func LinearithmicTimeExample(arr []int) []int {
	result := make([]int, len(arr))
	copy(result, arr)
	sort.Ints(result)
	return result
}

// QuadraticTimeExample demonstrates O(n^2) - Quadratic Time
// Time complexity grows quadratically with input size.
// Common in nested loops, bubble sort, selection sort.
//
// Time Complexity: O(n^2)
// Space Complexity: O(n^2)
func QuadraticTimeExample(arr []int) [][2]int {
	var pairs [][2]int
	for i := 0; i < len(arr); i++ {
		for j := i + 1; j < len(arr); j++ {
			pairs = append(pairs, [2]int{arr[i], arr[j]})
		}
	}
	return pairs
}

// CubicTimeExample demonstrates O(n^3) - Cubic Time
// Time complexity grows cubically with input size.
// Common in triple nested loops, matrix multiplication (naive).
//
// Time Complexity: O(n^3)
// Space Complexity: O(1)
func CubicTimeExample(n int) int {
	count := 0
	for i := 0; i < n; i++ {
		for j := 0; j < n; j++ {
			for k := 0; k < n; k++ {
				count++
			}
		}
	}
	return count
}

// ExponentialTimeExample demonstrates O(2^n) - Exponential Time
// Time complexity grows exponentially with input size.
// Common in recursive algorithms without memoization (naive Fibonacci).
//
// Time Complexity: O(2^n) (valid but loose; the exact growth is Theta(phi^n),
// phi = (1 + sqrt(5)) / 2, about 1.618)
// Space Complexity: O(n) due to recursion stack
func ExponentialTimeExample(n int) int {
	if n <= 1 {
		return n
	}
	return ExponentialTimeExample(n-1) + ExponentialTimeExample(n-2)
}

// DemonstrateBigO demonstrates various Big-O complexities with examples
func DemonstrateBigO() {
	fmt.Println("=== Big-O Notation Examples ===")

	// O(1) - Constant
	fmt.Println("O(1) - Constant Time:")
	fmt.Printf("  Result: %d\n\n", ConstantTimeExample(1000))

	// O(log n) - Logarithmic
	fmt.Println("O(log n) - Logarithmic Time:")
	testSizes := []int{8, 16, 32, 64}
	for _, n := range testSizes {
		result := LogarithmicTimeExample(n)
		fmt.Printf("  n=%d: %d iterations\n", n, result)
	}
	fmt.Println()

	// O(n) - Linear
	fmt.Println("O(n) - Linear Time:")
	arr := []int{1, 2, 3, 4, 5, 6, 7, 8, 9, 10}
	fmt.Printf("  Sum of %d elements: %d\n\n", len(arr), LinearTimeExample(arr))

	// O(n log n) - Linearithmic
	fmt.Println("O(n log n) - Linearithmic Time:")
	unsorted := []int{64, 34, 25, 12, 22, 11, 90}
	sorted := LinearithmicTimeExample(unsorted)
	fmt.Printf("  Sorted: %v\n\n", sorted)

	// O(n^2) - Quadratic
	fmt.Println("O(n^2) - Quadratic Time:")
	testArr := []int{1, 2, 3, 4}
	pairs := QuadraticTimeExample(testArr)
	fmt.Printf("  All pairs: %v\n\n", pairs)

	// O(n^3) - Cubic
	fmt.Println("O(n^3) - Cubic Time:")
	n := 5
	count := CubicTimeExample(n)
	fmt.Printf("  n=%d: %d operations\n\n", n, count)

	// O(2^n) - Exponential
	fmt.Println("O(2^n) - Exponential Time:")
	for i := 0; i < 10; i++ {
		result := ExponentialTimeExample(i)
		fmt.Printf("  Fibonacci(%d) = %d\n", i, result)
	}
	fmt.Println()
}

func main() {
	DemonstrateBigO()
}
