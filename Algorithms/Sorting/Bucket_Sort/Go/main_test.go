package main

import (
	"math"
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

func TestBucketSortOneAndZero(t *testing.T) {
	arr := []float64{0.5, 1.0, 0.25}
	BucketSort(arr)
	if expected := []float64{0.25, 0.5, 1.0}; !reflect.DeepEqual(arr, expected) {
		t.Errorf("Expected %v, got %v", expected, arr)
	}
	edges := []float64{1, 0, 1, 0}
	BucketSort(edges)
	if expected := []float64{0, 0, 1, 1}; !reflect.DeepEqual(edges, expected) {
		t.Errorf("Expected %v, got %v", expected, edges)
	}
}

// Regression: negative values used to panic with "index out of range [-2]";
// out-of-range values now panic with a message that names the problem.
func TestBucketSortOutOfRangePanics(t *testing.T) {
	cases := [][]float64{{-0.9, 0.1, 0.5}, {1.5, 0.2}, {0.3, math.NaN()}}
	for _, arr := range cases {
		func() {
			defer func() {
				if recover() == nil {
					t.Errorf("BucketSort(%v): expected a panic", arr)
				}
			}()
			BucketSort(arr)
		}()
	}
}
