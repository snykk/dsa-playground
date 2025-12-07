package main

import (
	"reflect"
	"testing"
)

func TestMergeSort(t *testing.T) {
	arr := []int{64, 34, 25, 12, 22, 11, 90}
	expected := []int{11, 12, 22, 25, 34, 64, 90}
	
	MergeSort(arr)
	
	if !reflect.DeepEqual(arr, expected) {
		t.Errorf("Expected %v, got %v", expected, arr)
	}
}

