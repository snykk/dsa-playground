package main

import "testing"

func TestFindMinCapacity(t *testing.T) {
	weights := []int{1, 2, 3, 4, 5, 6, 7, 8, 9, 10}
	result := findMinCapacity(weights, 5)
	if result != 15 {
		t.Errorf("findMinCapacity failed, expected 15, got %d", result)
	}
}

func TestFindKthSmallestDistance(t *testing.T) {
	nums := []int{1, 3, 1}
	result := findKthSmallestDistance(nums, 1)
	if result != 0 {
		t.Errorf("findKthSmallestDistance failed, expected 0, got %d", result)
	}
}

func TestSplitArrayLargestSum(t *testing.T) {
	nums := []int{7, 2, 5, 10, 8}
	result := splitArrayLargestSum(nums, 2)
	if result != 18 {
		t.Errorf("splitArrayLargestSum failed, expected 18, got %d", result)
	}
}
