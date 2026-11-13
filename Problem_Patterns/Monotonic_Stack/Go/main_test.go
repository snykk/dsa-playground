package main

import (
	"reflect"
	"testing"
)

func TestNextGreaterElement(t *testing.T) {
	tests := []struct {
		arr      []int
		expected []int
	}{
		{[]int{4, 5, 2, 10, 8}, []int{5, 10, 10, -1, -1}},
		{[]int{5, 4, 3, 2, 1}, []int{-1, -1, -1, -1, -1}},
		{[]int{1, 2, 3, 4, 5}, []int{2, 3, 4, 5, -1}},
		{[]int{42}, []int{-1}},
		{[]int{}, []int{}},
		{[]int{2, 2, 2}, []int{-1, -1, -1}},
		{[]int{1, 3, 2, 4}, []int{3, 4, 4, -1}},
	}

	for _, tt := range tests {
		result := NextGreaterElement(tt.arr)
		if !reflect.DeepEqual(result, tt.expected) {
			t.Errorf("NextGreaterElement(%v) = %v, expected %v", tt.arr, result, tt.expected)
		}
	}
}

func TestNextSmallerElement(t *testing.T) {
	tests := []struct {
		arr      []int
		expected []int
	}{
		{[]int{4, 5, 2, 10, 8}, []int{2, 2, -1, 8, -1}},
		{[]int{1, 2, 3, 4, 5}, []int{-1, -1, -1, -1, -1}},
		{[]int{5, 4, 3, 2, 1}, []int{4, 3, 2, 1, -1}},
		{[]int{42}, []int{-1}},
		{[]int{}, []int{}},
		{[]int{3, 3, 3}, []int{-1, -1, -1}},
	}

	for _, tt := range tests {
		result := NextSmallerElement(tt.arr)
		if !reflect.DeepEqual(result, tt.expected) {
			t.Errorf("NextSmallerElement(%v) = %v, expected %v", tt.arr, result, tt.expected)
		}
	}
}

func TestPreviousGreaterElement(t *testing.T) {
	tests := []struct {
		arr      []int
		expected []int
	}{
		{[]int{4, 5, 2, 10, 8}, []int{-1, -1, 5, -1, 10}},
		{[]int{5, 4, 3, 2, 1}, []int{-1, 5, 4, 3, 2}},
		{[]int{1, 2, 3, 4, 5}, []int{-1, -1, -1, -1, -1}},
		{[]int{42}, []int{-1}},
		{[]int{}, []int{}},
		{[]int{3, 3, 3}, []int{-1, -1, -1}},
	}

	for _, tt := range tests {
		result := PreviousGreaterElement(tt.arr)
		if !reflect.DeepEqual(result, tt.expected) {
			t.Errorf("PreviousGreaterElement(%v) = %v, expected %v", tt.arr, result, tt.expected)
		}
	}
}

func TestPreviousSmallerElement(t *testing.T) {
	tests := []struct {
		arr      []int
		expected []int
	}{
		{[]int{4, 5, 2, 10, 8}, []int{-1, 4, -1, 2, 2}},
		{[]int{1, 2, 3, 4, 5}, []int{-1, 1, 2, 3, 4}},
		{[]int{5, 4, 3, 2, 1}, []int{-1, -1, -1, -1, -1}},
		{[]int{42}, []int{-1}},
		{[]int{}, []int{}},
		{[]int{3, 3, 3}, []int{-1, -1, -1}},
	}

	for _, tt := range tests {
		result := PreviousSmallerElement(tt.arr)
		if !reflect.DeepEqual(result, tt.expected) {
			t.Errorf("PreviousSmallerElement(%v) = %v, expected %v", tt.arr, result, tt.expected)
		}
	}
}

func TestLargestRectangleHistogram(t *testing.T) {
	tests := []struct {
		heights  []int
		expected int
	}{
		{[]int{2, 1, 5, 6, 2, 3}, 10},
		{[]int{5}, 5},
		{[]int{3, 3, 3, 3}, 12},
		{[]int{1, 2, 3, 4, 5}, 9},
		{[]int{5, 4, 3, 2, 1}, 9},
		{[]int{}, 0},
		{[]int{2, 4}, 4},
		{[]int{6, 2, 5, 4, 5, 1, 6}, 12},
	}

	for _, tt := range tests {
		result := LargestRectangleHistogram(tt.heights)
		if result != tt.expected {
			t.Errorf("LargestRectangleHistogram(%v) = %d, expected %d", tt.heights, result, tt.expected)
		}
	}
}

func TestDailyTemperatures(t *testing.T) {
	tests := []struct {
		temperatures []int
		expected     []int
	}{
		{[]int{73, 74, 75, 71, 69, 72, 76, 73}, []int{1, 1, 4, 2, 1, 1, 0, 0}},
		{[]int{5, 4, 3, 2, 1}, []int{0, 0, 0, 0, 0}},
		{[]int{1, 2, 3, 4, 5}, []int{1, 1, 1, 1, 0}},
		{[]int{30}, []int{0}},
		{[]int{}, []int{}},
		{[]int{70, 70, 70}, []int{0, 0, 0}},
	}

	for _, tt := range tests {
		result := DailyTemperatures(tt.temperatures)
		if !reflect.DeepEqual(result, tt.expected) {
			t.Errorf("DailyTemperatures(%v) = %v, expected %v", tt.temperatures, result, tt.expected)
		}
	}
}

func TestStockSpan(t *testing.T) {
	tests := []struct {
		prices   []int
		expected []int
	}{
		{[]int{100, 80, 60, 70, 60, 75, 85}, []int{1, 1, 1, 2, 1, 4, 6}},
		{[]int{10, 20, 30, 40}, []int{1, 2, 3, 4}},
		{[]int{40, 30, 20, 10}, []int{1, 1, 1, 1}},
		{[]int{100}, []int{1}},
		{[]int{}, []int{}},
		{[]int{50, 50, 50}, []int{1, 2, 3}},
	}

	for _, tt := range tests {
		result := StockSpan(tt.prices)
		if !reflect.DeepEqual(result, tt.expected) {
			t.Errorf("StockSpan(%v) = %v, expected %v", tt.prices, result, tt.expected)
		}
	}
}
