package main

import "testing"

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

