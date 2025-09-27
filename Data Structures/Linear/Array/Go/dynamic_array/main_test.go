package main_test

import "testing"

func TestDynamicArray(t *testing.T) {
	arr := []int{0, 1, 2, 3, 4}

	// Test length
	if len(arr) != 5 {
		t.Errorf("Expected length 5, got %d", len(arr))
	}

	// Append
	arr = append(arr, 5)
	if len(arr) != 6 || arr[5] != 5 {
		t.Errorf("Append failed, got %+v", arr)
	}

	// Remove last element
	last := arr[len(arr)-1]
	arr = arr[:len(arr)-1]
	if last != 5 || len(arr) != 5 {
		t.Errorf("Pop failed, got %+v", arr)
	}
}
