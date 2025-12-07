package main

import (
	"reflect"
	"testing"
)

func TestCountingSort(t *testing.T) {
	arr := []int{4, 2, 2, 8, 3, 3, 1}
	expected := []int{1, 2, 2, 3, 3, 4, 8}
	
	maxVal := 8
	result := CountingSort(arr, maxVal)
	
	if !reflect.DeepEqual(result, expected) {
		t.Errorf("Expected %v, got %v", expected, result)
	}
}

