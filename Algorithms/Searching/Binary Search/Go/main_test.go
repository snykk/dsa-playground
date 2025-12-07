package main

import "testing"

func TestBinarySearch(t *testing.T) {
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
		{
			name:     "Single element found",
			arr:      []int{42},
			target:   42,
			expected: 0,
		},
		{
			name:     "Single element not found",
			arr:      []int{42},
			target:   10,
			expected: -1,
		},
		{
			name:     "Negative numbers",
			arr:      []int{-10, -5, -2, 0, 3, 7},
			target:   -2,
			expected: 2,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := BinarySearch(tt.arr, tt.target)
			if result != tt.expected {
				t.Errorf("Expected %d, got %d", tt.expected, result)
			}
		})
	}
}

func TestBinarySearchRecursive(t *testing.T) {
	tests := []struct {
		name     string
		arr      []int
		target   int
		expected int
	}{
		{
			name:     "Recursive search found",
			arr:      []int{1, 2, 3, 4, 5, 6, 7, 8, 9, 10},
			target:   7,
			expected: 6,
		},
		{
			name:     "Recursive search not found",
			arr:      []int{1, 2, 3, 4, 5},
			target:   10,
			expected: -1,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := BinarySearchRecursive(tt.arr, tt.target, 0, len(tt.arr)-1)
			if result != tt.expected {
				t.Errorf("Expected %d, got %d", tt.expected, result)
			}
		})
	}
}

func TestBinarySearchFirstOccurrence(t *testing.T) {
	arr := []int{1, 2, 2, 2, 3, 4, 5}
	result := BinarySearchFirstOccurrence(arr, 2)
	if result != 1 {
		t.Errorf("Expected 1, got %d", result)
	}
}

func TestBinarySearchLastOccurrence(t *testing.T) {
	arr := []int{1, 2, 2, 2, 3, 4, 5}
	result := BinarySearchLastOccurrence(arr, 2)
	if result != 3 {
		t.Errorf("Expected 3, got %d", result)
	}
}

