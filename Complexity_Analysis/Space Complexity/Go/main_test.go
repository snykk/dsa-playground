package main

import (
	"reflect"
	"testing"
)

func TestConstantSpace(t *testing.T) {
	if ConstantSpaceExample(10) != 55 {
		t.Error("Expected 55")
	}
	if ConstantSpaceExample(100) != 5050 {
		t.Error("Expected 5050")
	}
}

func TestLinearSpace(t *testing.T) {
	result := LinearSpaceExample(5)
	if len(result) != 5 {
		t.Errorf("Expected length 5, got %d", len(result))
	}
	if result[0] != 1 {
		t.Error("Expected 1")
	}
	if result[4] != 5 {
		t.Error("Expected 5")
	}
}

func TestQuadraticSpace(t *testing.T) {
	matrix := QuadraticSpaceExample(3)
	if len(matrix) != 3 {
		t.Errorf("Expected 3 rows, got %d", len(matrix))
	}
	if len(matrix[0]) != 3 {
		t.Errorf("Expected 3 columns, got %d", len(matrix[0]))
	}
	if matrix[0][0] != 0 {
		t.Error("Expected 0")
	}
	if matrix[2][2] != 8 {
		t.Error("Expected 8")
	}
}

func TestInPlaceReverse(t *testing.T) {
	arr1 := []int{1, 2, 3, 4, 5}
	InPlaceReverse(arr1)
	expected1 := []int{5, 4, 3, 2, 1}
	if !reflect.DeepEqual(arr1, expected1) {
		t.Errorf("Expected %v, got %v", expected1, arr1)
	}

	arr2 := []int{1}
	InPlaceReverse(arr2)
	expected2 := []int{1}
	if !reflect.DeepEqual(arr2, expected2) {
		t.Errorf("Expected %v, got %v", expected2, arr2)
	}
}
