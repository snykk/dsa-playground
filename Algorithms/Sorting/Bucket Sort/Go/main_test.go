package main

import (
	"reflect"
	"testing"
)

func TestBucketSort(t *testing.T) {
	arr := []float64{0.897, 0.565, 0.656, 0.1234, 0.665, 0.3434}
	expected := []float64{0.1234, 0.3434, 0.565, 0.656, 0.665, 0.897}
	
	BucketSort(arr)
	
	if !reflect.DeepEqual(arr, expected) {
		t.Errorf("Expected %v, got %v", expected, arr)
	}
}

