// Package main implements Randomized Quickselect: O(n) expected-time
// selection of the k-th smallest element using Lomuto partition.
package main

import (
	"fmt"
	"math/rand"
)

// Quickselect returns the k-th smallest element (0-indexed) of arr.
// Mutates arr in place. Pass a copy if you need the original preserved.
// Uses the provided *rand.Rand for pivot selection (pass nil for default).
func Quickselect(arr []int, k int, rng *rand.Rand) int {
	if len(arr) == 0 {
		panic("arr must be non-empty")
	}
	if k < 0 || k >= len(arr) {
		panic(fmt.Sprintf("k=%d out of range [0, %d)", k, len(arr)))
	}
	if rng == nil {
		rng = rand.New(rand.NewSource(rand.Int63()))
	}

	lo, hi := 0, len(arr)-1
	for lo < hi {
		pivotIdx := partition(arr, lo, hi, lo+rng.Intn(hi-lo+1))
		switch {
		case k == pivotIdx:
			return arr[k]
		case k < pivotIdx:
			hi = pivotIdx - 1
		default:
			lo = pivotIdx + 1
		}
	}
	return arr[lo]
}

func partition(arr []int, lo, hi, pivotIdx int) int {
	arr[pivotIdx], arr[hi] = arr[hi], arr[pivotIdx]
	pivot := arr[hi]
	store := lo
	for i := lo; i < hi; i++ {
		if arr[i] < pivot {
			arr[i], arr[store] = arr[store], arr[i]
			store++
		}
	}
	arr[store], arr[hi] = arr[hi], arr[store]
	return store
}

// TopKSmallest returns (unordered) the k smallest elements of arr.
// Does not mutate the input.
func TopKSmallest(arr []int, k int, rng *rand.Rand) []int {
	if k <= 0 {
		return []int{}
	}
	if k >= len(arr) {
		out := make([]int, len(arr))
		copy(out, arr)
		return out
	}
	work := make([]int, len(arr))
	copy(work, arr)
	_ = Quickselect(work, k-1, rng)
	out := make([]int, k)
	copy(out, work[:k])
	return out
}

func main() {
	rng := rand.New(rand.NewSource(42))
	data := []int{7, 2, 1, 8, 6, 3, 5, 4}
	work := append([]int{}, data...)
	fmt.Printf("3rd smallest of %v: %d\n", data, Quickselect(work, 2, rng))
	fmt.Printf("Top-3 smallest: %v\n", TopKSmallest(data, 3, rng))
}
