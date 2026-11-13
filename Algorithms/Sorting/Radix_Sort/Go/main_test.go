package main

import (
	"math"
	"math/rand"
	"reflect"
	"sort"
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

func expectSorted(t *testing.T, arr []int) {
	t.Helper()
	expected := append([]int(nil), arr...)
	sort.Ints(expected)
	got := append([]int(nil), arr...)
	RadixSort(got)
	if !reflect.DeepEqual(got, expected) {
		t.Errorf("RadixSort(%v) = %v, want %v", arr, got, expected)
	}
}

// Regression: all-negative input came back unchanged and mixed signs panicked
// with "index out of range [-1]".
func TestRadixSortNegative(t *testing.T) {
	cases := [][]int{{-3, -1, -2}, {3, -1, 2}, {-170, 45, -75, 0, 802, -2, 2}, {-5, -5}, {0, -10, 10, -100, 100}}
	for _, arr := range cases {
		expectSorted(t, arr)
	}
}

func TestRadixSortExtremes(t *testing.T) {
	expectSorted(t, []int{0, 0, 0})
	expectSorted(t, []int{2000000000, 7, 1999999999, 1000000000})
	expectSorted(t, []int{math.MinInt, math.MaxInt, 0, -1, 1, math.MinInt, math.MaxInt})
	expectSorted(t, []int{})
}

func TestRadixSortRandom(t *testing.T) {
	rng := rand.New(rand.NewSource(11))
	for c := 0; c < 300; c++ {
		arr := make([]int, rng.Intn(30))
		for i := range arr {
			arr[i] = rng.Intn(10001) - 5000
		}
		expectSorted(t, arr)
	}
}
