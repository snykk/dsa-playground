package main

import (
	"reflect"
	"testing"
)

func TestRadixSort(t *testing.T) {
	arr := []int{170, 45, 75, 90, 802, 24, 2, 66}
	expected := []int{2, 24, 45, 66, 75, 90, 170, 802}
	
	RadixSort(arr)
	
	if !reflect.DeepEqual(arr, expected) {
		t.Errorf("Expected %v, got %v", expected, arr)
	}
}

