// Package main implements Randomized Quickselect: O(n) expected-time
// selection of the k-th smallest element using a three-way (Dutch flag)
// partition, so duplicates cannot cause quadratic time.
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
		lt, gt := partition3(arr, lo, hi, lo+rng.Intn(hi-lo+1))
		switch {
		case k < lt:
			hi = lt - 1
		case k > gt:
			lo = gt + 1
		default:
			return arr[k] // k falls inside the band of keys equal to the pivot
		}
	}
	return arr[lo]
}

// partition3 reorders arr[lo..hi] into  < pivot | == pivot | > pivot  around
// arr[pivotIdx] and returns (lt, gt): arr[lt..gt] holds exactly the keys equal
// to the pivot.
func partition3(arr []int, lo, hi, pivotIdx int) (int, int) {
	pivot := arr[pivotIdx]
	lt, i, gt := lo, lo, hi
	for i <= gt {
		switch {
		case arr[i] < pivot:
			arr[lt], arr[i] = arr[i], arr[lt]
			lt++
			i++
		case arr[i] > pivot:
			arr[i], arr[gt] = arr[gt], arr[i]
			gt--
		default:
			i++
		}
	}
	return lt, gt
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
