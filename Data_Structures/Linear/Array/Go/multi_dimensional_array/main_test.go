package main_test

import "testing"

func TestMultiDimensionalArray(t *testing.T) {
	matrix := [3][3]int{
		{1, 2, 3},
		{4, 5, 6},
		{7, 8, 9},
	}

	if matrix[0][0] != 1 || matrix[1][2] != 6 || matrix[2][1] != 8 {
		t.Errorf("Matrix values incorrect, got %+v", matrix)
	}

	// Flatten
	flat := make([]int, 0, 9)
	for i := 0; i < 3; i++ {
		for j := 0; j < 3; j++ {
			flat = append(flat, matrix[i][j])
		}
	}

	expected := []int{1, 2, 3, 4, 5, 6, 7, 8, 9}
	for i := range expected {
		if flat[i] != expected[i] {
			t.Errorf("Flatten failed at index %d, expected %d, got %d", i, expected[i], flat[i])
		}
	}
}
