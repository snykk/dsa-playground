package main

import "testing"

func TestTernarySearch(t *testing.T) {
	tests := []struct {
		name     string
		arr      []int
		target   int
		expected int
	}{
		{
			name:     "Basic search found",
			arr:      []int{1, 2, 3, 4, 5, 6, 7, 8, 9, 10},
			target:   5,
			expected: 4,
		},
		{
			name:     "Basic search not found",
			arr:      []int{1, 2, 3, 4, 5, 6, 7, 8, 9, 10},
			target:   11,
			expected: -1,
		},
		{
			name:     "First element",
			arr:      []int{1, 2, 3, 4, 5},
			target:   1,
			expected: 0,
		},
		{
			name:     "Last element",
			arr:      []int{1, 2, 3, 4, 5},
			target:   5,
			expected: 4,
		},
		{
			name:     "Empty array",
			arr:      []int{},
			target:   10,
			expected: -1,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := TernarySearch(tt.arr, tt.target)
			if result != tt.expected {
				t.Errorf("Expected %d, got %d", tt.expected, result)
			}
		})
	}
}

func TestTernarySearchRecursive(t *testing.T) {
	arr := []int{1, 2, 3, 4, 5, 6, 7, 8, 9, 10}
	result := TernarySearchRecursive(arr, 7, 0, len(arr)-1)
	if result != 6 {
		t.Errorf("Expected 6, got %d", result)
	}
}
