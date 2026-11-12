package main

import (
	"reflect"
	"sort"
	"testing"
)

func TestQuickSort(t *testing.T) {
	arr := []int{64, 34, 25, 12, 22, 11, 90}
	expected := []int{11, 12, 22, 25, 34, 64, 90}
	
	QuickSort(arr)
	
	if !reflect.DeepEqual(arr, expected) {
		t.Errorf("Expected %v, got %v", expected, arr)
	}
}


func TestQuickSortEdgeCases(t *testing.T) {
	cases := [][]int{{}, {42}, {2, 1}, {3, -1, 3, 0, -1, 2, 2}, {5, 5, 5, 5}, {1, 2, 3, 4, 5}, {5, 4, 3, 2, 1}}
	// Sorted, reversed and all-equal input are the worst cases for a last-element pivot.
	sortedBig := make([]int, 2000)
	reversedBig := make([]int, 2000)
	equalBig := make([]int, 2000)
	for i := range sortedBig {
		sortedBig[i] = i
		reversedBig[i] = 2000 - i
		equalBig[i] = 7
	}
	cases = append(cases, sortedBig, reversedBig, equalBig)
	for _, arr := range cases {
		expected := make([]int, len(arr))
		copy(expected, arr)
		sort.Ints(expected)

		QuickSort(arr)

		if !reflect.DeepEqual(arr, expected) {
			t.Errorf("sorting %d elements: result differs from the expected order", len(arr))
		}
	}
}
