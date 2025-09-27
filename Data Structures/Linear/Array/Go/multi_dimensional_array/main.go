package main

import "fmt"

func main() {
	matrix := [3][3]int{{1, 2, 3}, {4, 5, 6}, {7, 8, 9}}

	fmt.Println("2D Matrix:")
	for _, row := range matrix {
		fmt.Println(row)
	}

	fmt.Println("Element at (1,2):", matrix[1][2])

	// Flattened 1D array
	flat := make([]int, 0, 9)
	for i := 0; i < 3; i++ {
		for j := 0; j < 3; j++ {
			flat = append(flat, matrix[i][j])
		}
	}
	fmt.Println("Flattened matrix:", flat)
}
