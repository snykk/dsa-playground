package main

import (
	"math/rand"
	"sort"
	"testing"
)

func TestSingleElement(t *testing.T) {
	rng := rand.New(rand.NewSource(42))
	if got := Quickselect([]int{42}, 0, rng); got != 42 {
		t.Errorf("got %d, want 42", got)
	}
}

func TestSmallest(t *testing.T) {
	rng := rand.New(rand.NewSource(42))
	if got := Quickselect([]int{3, 1, 4, 1, 5, 9, 2, 6}, 0, rng); got != 1 {
		t.Errorf("got %d, want 1", got)
	}
}

func TestLargest(t *testing.T) {
	rng := rand.New(rand.NewSource(42))
	arr := []int{3, 1, 4, 1, 5, 9, 2, 6}
	if got := Quickselect(append([]int{}, arr...), len(arr)-1, rng); got != 9 {
		t.Errorf("got %d, want 9", got)
	}
}

func TestMedian(t *testing.T) {
	rng := rand.New(rand.NewSource(42))
	arr := []int{7, 2, 1, 8, 6, 3, 5, 4}
	// sorted = [1,2,3,4,5,6,7,8]; k=3 -> 4
	if got := Quickselect(append([]int{}, arr...), 3, rng); got != 4 {
		t.Errorf("got %d, want 4", got)
	}
}

func TestDuplicates(t *testing.T) {
	rng := rand.New(rand.NewSource(42))
	for k := 0; k < 5; k++ {
		arr := []int{5, 5, 5, 5, 5}
		if got := Quickselect(arr, k, rng); got != 5 {
			t.Errorf("k=%d: got %d, want 5", k, got)
		}
	}
}

func TestAlreadySorted(t *testing.T) {
	rng := rand.New(rand.NewSource(42))
	for k := 0; k < 20; k++ {
		arr := make([]int, 20)
		for i := range arr {
			arr[i] = i
		}
		if got := Quickselect(arr, k, rng); got != k {
			t.Errorf("sorted k=%d: got %d, want %d", k, got, k)
		}
	}
}

func TestReverseSorted(t *testing.T) {
	rng := rand.New(rand.NewSource(42))
	for k := 0; k < 20; k++ {
		arr := make([]int, 20)
		for i := range arr {
			arr[i] = 19 - i
		}
		if got := Quickselect(arr, k, rng); got != k {
			t.Errorf("reverse k=%d: got %d, want %d", k, got, k)
		}
	}
}

func TestMatchesSortOnRandomData(t *testing.T) {
	rng := rand.New(rand.NewSource(123))
	for trial := 0; trial < 20; trial++ {
		n := 1 + rng.Intn(100)
		arr := make([]int, n)
		for i := range arr {
			arr[i] = rng.Intn(2000) - 1000
		}
		sortedArr := append([]int{}, arr...)
		sort.Ints(sortedArr)
		for k := 0; k < n; k++ {
			work := append([]int{}, arr...)
			if got, want := Quickselect(work, k, rng), sortedArr[k]; got != want {
				t.Errorf("trial %d k=%d: got %d, want %d", trial, k, got, want)
			}
		}
	}
}

func TestTopKSmallest(t *testing.T) {
	rng := rand.New(rand.NewSource(42))
	arr := []int{3, 1, 4, 1, 5, 9, 2, 6}
	result := TopKSmallest(arr, 3, rng)
	sort.Ints(result)
	want := []int{1, 1, 2}
	if len(result) != len(want) {
		t.Fatalf("got %v, want %v", result, want)
	}
	for i := range result {
		if result[i] != want[i] {
			t.Errorf("got %v, want %v", result, want)
		}
	}
}

func TestTopKDoesNotMutate(t *testing.T) {
	rng := rand.New(rand.NewSource(42))
	arr := []int{5, 1, 3, 2, 4}
	original := append([]int{}, arr...)
	TopKSmallest(arr, 2, rng)
	for i := range arr {
		if arr[i] != original[i] {
			t.Errorf("TopKSmallest mutated input: got %v, want %v", arr, original)
		}
	}
}

func TestOutOfRangePanics(t *testing.T) {
	defer func() {
		if r := recover(); r == nil {
			t.Error("expected panic on k out of range")
		}
	}()
	rng := rand.New(rand.NewSource(42))
	Quickselect([]int{1, 2, 3}, -1, rng)
}

func TestEmptyPanics(t *testing.T) {
	defer func() {
		if r := recover(); r == nil {
			t.Error("expected panic on empty arr")
		}
	}()
	rng := rand.New(rand.NewSource(42))
	Quickselect([]int{}, 0, rng)
}
