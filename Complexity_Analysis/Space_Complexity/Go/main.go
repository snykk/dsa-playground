package main

import "fmt"

// ConstantSpaceExample demonstrates O(1) - Constant Space
func ConstantSpaceExample(n int) int {
	total := 0
	for i := 1; i <= n; i++ {
		total += i
	}
	return total
}

// LinearSpaceExample demonstrates O(n) - Linear Space
func LinearSpaceExample(n int) []int {
	result := make([]int, 0, n)
	for i := 1; i <= n; i++ {
		result = append(result, i)
	}
	return result
}

// QuadraticSpaceExample demonstrates O(n^2) - Quadratic Space
func QuadraticSpaceExample(n int) [][]int {
	matrix := make([][]int, n)
	for i := 0; i < n; i++ {
		matrix[i] = make([]int, n)
		for j := 0; j < n; j++ {
			matrix[i][j] = i*n + j
		}
	}
	return matrix
}

// InPlaceReverse demonstrates O(1) - Constant Space (in-place)
func InPlaceReverse(arr []int) {
	left, right := 0, len(arr)-1
	for left < right {
		arr[left], arr[right] = arr[right], arr[left]
		left++
		right--
	}
}

func DemonstrateSpaceComplexity() {
	fmt.Println("=== Space Complexity Examples ===")

	fmt.Println("O(1) - Constant Space:")
	fmt.Printf("  Sum 1 to 100: %d\n\n", ConstantSpaceExample(100))

	fmt.Println("O(n) - Linear Space:")
	arr := LinearSpaceExample(10)
	fmt.Printf("  Created array of size %d\n\n", len(arr))

	fmt.Println("O(n^2) - Quadratic Space:")
	matrix := QuadraticSpaceExample(3)
	fmt.Printf("  Created %dx%d matrix\n\n", len(matrix), len(matrix[0]))

	test := []int{1, 2, 3, 4, 5}
	InPlaceReverse(test)
	fmt.Println("O(1) - In-place Reverse:")
	fmt.Printf("  Reversed: %v\n\n", test)
}

func main() {
	DemonstrateSpaceComplexity()
}
