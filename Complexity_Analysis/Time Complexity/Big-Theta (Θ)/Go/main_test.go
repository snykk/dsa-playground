package main

import (
	"reflect"
	"testing"
)

func TestTightBoundLinear(t *testing.T) {
	arr1 := []int{1, 2, 3, 4, 5}
	if TightBoundExample(arr1) != 15 {
		t.Error("Expected 15")
	}

	arr2 := []int{10, 20, 30}
	if TightBoundExample(arr2) != 60 {
		t.Error("Expected 60")
	}

	arr3 := []int{}
	if TightBoundExample(arr3) != 0 {
		t.Error("Expected 0")
	}
}

func TestBinarySearchTightBound(t *testing.T) {
	arr := []int{1, 3, 5, 7, 9, 11, 13, 15}

	// Found cases
	if BinarySearchExample(arr, 1) != 0 {
		t.Error("Expected 0")
	}
	if BinarySearchExample(arr, 7) != 3 {
		t.Error("Expected 3")
	}
	if BinarySearchExample(arr, 15) != 7 {
		t.Error("Expected 7")
	}

	// Not found cases
	if BinarySearchExample(arr, 0) != -1 {
		t.Error("Expected -1")
	}
	if BinarySearchExample(arr, 20) != -1 {
		t.Error("Expected -1")
	}
	if BinarySearchExample(arr, 6) != -1 {
		t.Error("Expected -1")
	}
}

func TestMergeSortTightBound(t *testing.T) {
	arr1 := []int{64, 34, 25, 12, 22, 11, 90}
	sorted1 := MergeSortExample(arr1)
	expected1 := []int{11, 12, 22, 25, 34, 64, 90}
	if !reflect.DeepEqual(sorted1, expected1) {
		t.Errorf("Expected %v, got %v", expected1, sorted1)
	}

	arr2 := []int{5, 2, 8, 1, 9}
	sorted2 := MergeSortExample(arr2)
	expected2 := []int{1, 2, 5, 8, 9}
	if !reflect.DeepEqual(sorted2, expected2) {
		t.Errorf("Expected %v, got %v", expected2, sorted2)
	}
}
