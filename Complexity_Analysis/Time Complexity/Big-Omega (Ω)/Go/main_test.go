package main

import (
	"reflect"
	"testing"
)

func TestLinearSearchBestCase(t *testing.T) {
	arr := []int{5, 3, 8, 1, 9}

	// Best case: target at first position
	if LinearSearchBestCase(arr, 5) != 0 {
		t.Error("Expected 0")
	}

	// Worst case: target at last position
	if LinearSearchBestCase(arr, 9) != 4 {
		t.Error("Expected 4")
	}

	// Not found
	if LinearSearchBestCase(arr, 10) != -1 {
		t.Error("Expected -1")
	}
}

func TestBubbleSortBestCase(t *testing.T) {
	// Already sorted (best case)
	arr1 := []int{1, 2, 3, 4, 5}
	result1 := BubbleSortBestCase(arr1)
	expected1 := []int{1, 2, 3, 4, 5}
	if !reflect.DeepEqual(result1, expected1) {
		t.Errorf("Expected %v, got %v", expected1, result1)
	}

	// Reverse sorted (worst case)
	arr2 := []int{5, 4, 3, 2, 1}
	result2 := BubbleSortBestCase(arr2)
	expected2 := []int{1, 2, 3, 4, 5}
	if !reflect.DeepEqual(result2, expected2) {
		t.Errorf("Expected %v, got %v", expected2, result2)
	}
}

func TestMatrixTraversalLowerBound(t *testing.T) {
	matrix1 := [][]int{{1, 2}, {3, 4}}
	if MatrixTraversalLowerBound(matrix1) != 10 {
		t.Error("Expected 10")
	}

	matrix2 := [][]int{{1, 2, 3}, {4, 5, 6}, {7, 8, 9}}
	if MatrixTraversalLowerBound(matrix2) != 45 {
		t.Error("Expected 45")
	}
}
