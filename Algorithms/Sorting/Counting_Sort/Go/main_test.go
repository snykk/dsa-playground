package main

import (
	"reflect"
	"sort"
	"testing"
)

func TestCountingSort(t *testing.T) {
	arr := []int{4, 2, 2, 8, 3, 3, 1}
	expected := []int{1, 2, 2, 3, 3, 4, 8}

	maxVal := 8
	result := CountingSort(arr, maxVal)

	if !reflect.DeepEqual(result, expected) {
		t.Errorf("Expected %v, got %v", expected, result)
	}
}

// Regression: negative values used to panic with "index out of range [-1]".
func TestCountingSortNegative(t *testing.T) {
	cases := [][]int{{3, -1, 2}, {-3, -1, -2}, {-5, 0, 5, -5, 0}, {0, 0}, {-7}}
	for _, arr := range cases {
		expected := append([]int(nil), arr...)
		sort.Ints(expected)
		maxVal := expected[len(expected)-1]
		if result := CountingSort(arr, maxVal); !reflect.DeepEqual(result, expected) {
			t.Errorf("CountingSort(%v) = %v, want %v", arr, result, expected)
		}
	}
}

// Regression: a maxVal below the real maximum used to panic with an index error;
// now it panics with a message that names the problem.
func TestCountingSortMaxValTooSmall(t *testing.T) {
	defer func() {
		if recover() == nil {
			t.Errorf("expected a panic for maxVal smaller than the largest value")
		}
	}()
	CountingSort([]int{5, 1}, 3)
}

func TestCountingSortLargerMaxVal(t *testing.T) {
	result := CountingSort([]int{5, -1, 1}, 9)
	if expected := []int{-1, 1, 5}; !reflect.DeepEqual(result, expected) {
		t.Errorf("Expected %v, got %v", expected, result)
	}
}
