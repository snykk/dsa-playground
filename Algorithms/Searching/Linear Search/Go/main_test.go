package main

import (
	"reflect"
	"testing"
)

func TestLinearSearch(t *testing.T) {
	tests := []struct {
		name     string
		arr      []int
		target   int
		expected int
	}{
		{
			name:     "Basic search found",
			arr:      []int{10, 20, 30, 40, 50},
			target:   30,
			expected: 2,
		},
		{
			name:     "Basic search not found",
			arr:      []int{10, 20, 30, 40, 50},
			target:   25,
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
		{
			name:     "Single element not found",
			arr:      []int{42},
			target:   10,
			expected: -1,
		},
		{
			name:     "Duplicate elements",
			arr:      []int{10, 20, 30, 20, 40, 20},
			target:   20,
			expected: 1, // Returns first occurrence
		},
		{
			name:     "Negative numbers",
			arr:      []int{-5, -2, 0, 3, 7},
			target:   -2,
			expected: 1,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := LinearSearch(tt.arr, tt.target)
			if result != tt.expected {
				t.Errorf("Expected %d, got %d", tt.expected, result)
			}
		})
	}
}

func TestLinearSearchRecursive(t *testing.T) {
	tests := []struct {
		name     string
		arr      []int
		target   int
		expected int
	}{
		{
			name:     "Recursive search found",
			arr:      []int{10, 20, 30, 40, 50},
			target:   30,
			expected: 2,
		},
		{
			name:     "Recursive search not found",
			arr:      []int{10, 20, 30, 40, 50},
			target:   25,
			expected: -1,
		},
		{
			name:     "Recursive empty array",
			arr:      []int{},
			target:   10,
			expected: -1,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := LinearSearchRecursive(tt.arr, tt.target, 0)
			if result != tt.expected {
				t.Errorf("Expected %d, got %d", tt.expected, result)
			}
		})
	}
}

func TestLinearSearchAllOccurrences(t *testing.T) {
	tests := []struct {
		name     string
		arr      []int
		target   int
		expected []int
	}{
		{
			name:     "All occurrences",
			arr:      []int{10, 20, 30, 20, 40, 20},
			target:   20,
			expected: []int{1, 3, 5},
		},
		{
			name:     "All occurrences not found",
			arr:      []int{10, 20, 30, 40, 50},
			target:   25,
			expected: []int{},
		},
		{
			name:     "All occurrences single",
			arr:      []int{10, 20, 30, 40, 50},
			target:   30,
			expected: []int{2},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := LinearSearchAllOccurrences(tt.arr, tt.target)
			if !reflect.DeepEqual(result, tt.expected) {
				t.Errorf("Expected %v, got %v", tt.expected, result)
			}
		})
	}
}

func TestLinearSearchGeneric(t *testing.T) {
	// Test with integers
	intArr := []int{10, 20, 30, 40, 50}
	result := LinearSearchGeneric(intArr, 30)
	if result != 2 {
		t.Errorf("Expected 2, got %d", result)
	}

	// Test with strings
	strArr := []string{"apple", "banana", "cherry", "date"}
	resultStr := LinearSearchGeneric(strArr, "cherry")
	if resultStr != 2 {
		t.Errorf("Expected 2, got %d", resultStr)
	}
}

