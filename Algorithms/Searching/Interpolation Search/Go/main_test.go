package main

import (
	"math"
	"testing"
)

func TestInterpolationSearch(t *testing.T) {
	tests := []struct {
		name     string
		arr      []int
		target   int
		expected int
	}{
		{
			name:     "Basic search found",
			arr:      []int{10, 20, 30, 40, 50, 60, 70, 80, 90, 100},
			target:   50,
			expected: 4,
		},
		{
			name:     "Basic search not found",
			arr:      []int{10, 20, 30, 40, 50, 60, 70, 80, 90, 100},
			target:   55,
			expected: -1,
		},
		{
			name:     "First element",
			arr:      []int{10, 20, 30, 40, 50},
			target:   10,
			expected: 0,
		},
		{
			name:     "Last element",
			arr:      []int{10, 20, 30, 40, 50},
			target:   50,
			expected: 4,
		},
		{
			name:     "Empty array",
			arr:      []int{},
			target:   10,
			expected: -1,
		},
		{
			name:     "Single element found",
			arr:      []int{42},
			target:   42,
			expected: 0,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := InterpolationSearch(tt.arr, tt.target)
			if result != tt.expected {
				t.Errorf("Expected %d, got %d", tt.expected, result)
			}
		})
	}
}

func TestInterpolationSearchRecursive(t *testing.T) {
	arr := []int{10, 20, 30, 40, 50, 60, 70, 80, 90, 100}
	result := InterpolationSearchRecursive(arr, 70, 0, len(arr)-1)
	if result != 6 {
		t.Errorf("Expected 6, got %d", result)
	}
}

// Regression: equal window ends made the formula divide by zero; int(NaN) then
// panicked with an out-of-range index on amd64.
func TestInterpolationSearchAllEqual(t *testing.T) {
	arr := []int{5, 5, 5}
	if got := InterpolationSearch(arr, 5); got != 0 {
		t.Errorf("InterpolationSearch(%v, 5) = %d, want 0", arr, got)
	}
	if got := InterpolationSearchRecursive(arr, 5, 0, len(arr)-1); got != 0 {
		t.Errorf("InterpolationSearchRecursive(%v, 5) = %d, want 0", arr, got)
	}
	for _, target := range []int{4, 6} {
		if got := InterpolationSearch(arr, target); got != -1 {
			t.Errorf("InterpolationSearch(%v, %d) = %d, want -1", arr, target, got)
		}
	}
}

func TestInterpolationSearchDuplicates(t *testing.T) {
	arr := []int{1, 2, 2, 2, 2, 3, 7, 7, 9}
	for _, target := range []int{1, 2, 3, 7, 9} {
		for name, got := range map[string]int{
			"iterative": InterpolationSearch(arr, target),
			"recursive": InterpolationSearchRecursive(arr, target, 0, len(arr)-1),
		} {
			if got < 0 || arr[got] != target {
				t.Errorf("%s search for %d returned %d", name, target, got)
			}
		}
	}
	if got := InterpolationSearch(arr, 5); got != -1 {
		t.Errorf("InterpolationSearch(%v, 5) = %d, want -1", arr, got)
	}
}

// Regression: target-arr[left] and arr[right]-arr[left] overflowed int.
func TestInterpolationSearchWideRange(t *testing.T) {
	arr := []int{math.MinInt64, -7, 0, 42, math.MaxInt64}
	for want, target := range arr {
		if got := InterpolationSearch(arr, target); got != want {
			t.Errorf("InterpolationSearch(_, %d) = %d, want %d", target, got, want)
		}
		if got := InterpolationSearchRecursive(arr, target, 0, len(arr)-1); got != want {
			t.Errorf("InterpolationSearchRecursive(_, %d) = %d, want %d", target, got, want)
		}
	}
	if got := InterpolationSearch(arr, 1); got != -1 {
		t.Errorf("InterpolationSearch(_, 1) = %d, want -1", got)
	}
}
