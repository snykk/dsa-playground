package main

import "fmt"

// LinearSearchBestCase demonstrates Omega(1): at least one comparison on every
// input. Best case Theta(1), worst case Theta(n).
func LinearSearchBestCase(arr []int, target int) int {
	for i, element := range arr {
		if element == target {
			return i
		}
	}
	return -1
}

// BubbleSortBestCase demonstrates Omega(n) on every input (early-exit flag).
// Best case (sorted) Theta(n), worst case Theta(n^2).
func BubbleSortBestCase(arr []int) []int {
	result := make([]int, len(arr))
	copy(result, arr)
	n := len(result)

	for i := 0; i < n; i++ {
		swapped := false
		for j := 0; j < n-i-1; j++ {
			if result[j] > result[j+1] {
				result[j], result[j+1] = result[j+1], result[j]
				swapped = true
			}
		}
		if !swapped {
			break
		}
	}
	return result
}

// MatrixTraversalLowerBound visits all n^2 elements: Theta(n^2) in every case.
func MatrixTraversalLowerBound(matrix [][]int) int {
	total := 0
	for _, row := range matrix {
		for _, element := range row {
			total += element
		}
	}
	return total
}

func DemonstrateBigOmega() {
	fmt.Println("=== Big-Omega (Omega) Notation Examples ===")
	fmt.Println("Big-Omega is a LOWER BOUND on a function (any case can have one)")

	arr := []int{5, 3, 8, 1, 9}
	fmt.Println("Omega(1) - Constant Lower Bound:")
	fmt.Printf("  Linear search (best case): index %d\n\n", LinearSearchBestCase(arr, 5))

	sorted := []int{1, 2, 3, 4, 5}
	fmt.Println("Omega(n) - Linear Lower Bound:")
	fmt.Printf("  Bubble sort (best case): %v\n\n", BubbleSortBestCase(sorted))

	matrix := [][]int{{1, 2, 3}, {4, 5, 6}, {7, 8, 9}}
	fmt.Println("Omega(n^2) - Quadratic Lower Bound:")
	fmt.Printf("  Matrix traversal: sum = %d\n\n", MatrixTraversalLowerBound(matrix))
}

func main() {
	DemonstrateBigOmega()
}
