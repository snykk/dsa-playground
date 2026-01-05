package main

import (
	"fmt"
	"sort"
)

// TightBoundExample demonstrates Θ(n) - Linear Tight Bound
func TightBoundExample(arr []int) int {
	total := 0
	for _, element := range arr {
		total += element
	}
	return total
}

// BinarySearchExample demonstrates Θ(log n) - Logarithmic Tight Bound
func BinarySearchExample(arr []int, target int) int {
	left, right := 0, len(arr)-1

	for left <= right {
		mid := (left + right) / 2
		if arr[mid] == target {
			return mid
		} else if arr[mid] < target {
			left = mid + 1
		} else {
			right = mid - 1
		}
	}
	return -1
}

// MergeSortExample demonstrates Θ(n log n) - Linearithmic Tight Bound
func MergeSortExample(arr []int) []int {
	result := make([]int, len(arr))
	copy(result, arr)
	sort.Ints(result)
	return result
}

func DemonstrateBigTheta() {
	fmt.Println("=== Big-Theta (Θ) Notation Examples ===")
	fmt.Println("Big-Theta provides a TIGHT BOUND (both upper and lower)")

	arr := []int{1, 2, 3, 4, 5, 6, 7, 8, 9, 10}
	fmt.Println("Θ(n) - Linear Tight Bound:")
	fmt.Printf("  Sum: %d\n\n", TightBoundExample(arr))

	sorted := []int{1, 3, 5, 7, 9, 11, 13, 15}
	fmt.Println("Θ(log n) - Logarithmic Tight Bound:")
	fmt.Printf("  Binary search for 11: index %d\n\n", BinarySearchExample(sorted, 11))

	unsorted := []int{64, 34, 25, 12, 22, 11, 90}
	sortedResult := MergeSortExample(unsorted)
	fmt.Println("Θ(n log n) - Linearithmic Tight Bound:")
	fmt.Printf("  Sorted: %v\n\n", sortedResult)
}

func main() {
	DemonstrateBigTheta()
}
