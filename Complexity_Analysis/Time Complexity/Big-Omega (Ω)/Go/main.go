package main

import "fmt"

// LinearSearchBestCase demonstrates Ω(1) - Constant Lower Bound
func LinearSearchBestCase(arr []int, target int) int {
	for i, element := range arr {
		if element == target {
			return i
		}
	}
	return -1
}

// BubbleSortBestCase demonstrates Ω(n) - Linear Lower Bound
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

// MatrixTraversalLowerBound demonstrates Ω(n²) - Quadratic Lower Bound
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
	fmt.Println("=== Big-Omega (Ω) Notation Examples ===")
	fmt.Println("Big-Omega provides a LOWER BOUND (best case)")

	arr := []int{5, 3, 8, 1, 9}
	fmt.Println("Ω(1) - Constant Lower Bound:")
	fmt.Printf("  Linear search (best case): index %d\n\n", LinearSearchBestCase(arr, 5))

	sorted := []int{1, 2, 3, 4, 5}
	fmt.Println("Ω(n) - Linear Lower Bound:")
	fmt.Printf("  Bubble sort (best case): %v\n\n", BubbleSortBestCase(sorted))

	matrix := [][]int{{1, 2, 3}, {4, 5, 6}, {7, 8, 9}}
	fmt.Println("Ω(n²) - Quadratic Lower Bound:")
	fmt.Printf("  Matrix traversal: sum = %d\n\n", MatrixTraversalLowerBound(matrix))
}

func main() {
	DemonstrateBigOmega()
}
