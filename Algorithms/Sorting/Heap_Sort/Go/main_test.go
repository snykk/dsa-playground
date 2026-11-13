package main

import (
	"reflect"
	"sort"
	"testing"
)

func TestHeapSort(t *testing.T) {
	arr := []int{64, 34, 25, 12, 22, 11, 90}
	expected := []int{11, 12, 22, 25, 34, 64, 90}
	
	HeapSort(arr)
	
	if !reflect.DeepEqual(arr, expected) {
		t.Errorf("Expected %v, got %v", expected, arr)
	}
}


func TestHeapSortEdgeCases(t *testing.T) {
	cases := [][]int{{}, {42}, {2, 1}, {3, -1, 3, 0, -1, 2, 2}, {5, 5, 5, 5}, {1, 2, 3, 4, 5, 6, 7}, {7, 6, 5, 4, 3, 2, 1}}
	for _, arr := range cases {
		expected := make([]int, len(arr))
		copy(expected, arr)
		sort.Ints(expected)

		HeapSort(arr)

		if !reflect.DeepEqual(arr, expected) {
			t.Errorf("Expected %v, got %v", expected, arr)
		}
	}
}
