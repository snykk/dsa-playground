package main

import (
	"testing"
)

func TestCountDistinct(t *testing.T) {
	arr := []int{1, 1, 2, 1, 3, 4, 3, 3, 4}
	queries := [][]int{{0, 4}, {1, 3}, {2, 6}, {0, 8}}
	results := countDistinctInRanges(arr, queries)
	if results[0] != 3 {
		t.Errorf("Expected 3 distinct, got %d", results[0])
	}
	if results[1] != 2 {
		t.Errorf("Expected 2 distinct, got %d", results[1])
	}
	if results[2] != 4 {
		t.Errorf("Expected 4 distinct, got %d", results[2])
	}
	if results[3] != 4 {
		t.Errorf("Expected 4 distinct, got %d", results[3])
	}
}

func TestSingleElement(t *testing.T) {
	arr := []int{5, 5, 5, 5}
	queries := [][]int{{0, 3}}
	results := countDistinctInRanges(arr, queries)
	if results[0] != 1 {
		t.Errorf("Expected 1 distinct, got %d", results[0])
	}
}

func TestEmptyArrayNoQueries(t *testing.T) {
	results := countDistinctInRanges([]int{}, [][]int{})
	if len(results) != 0 {
		t.Errorf("Expected no answers, got %v", results)
	}
}

func TestAnswersFollowInputOrder(t *testing.T) {
	arr := []int{1, 2, 1, 3, 2, 3, 4}
	queries := [][]int{{5, 6}, {0, 0}, {2, 4}, {0, 6}, {3, 3}}
	want := []int{2, 1, 3, 4, 1}
	got := countDistinctInRanges(arr, queries)
	for i := range want {
		if got[i] != want[i] {
			t.Errorf("query %d: want %d, got %d", i, want[i], got[i])
		}
	}
}
