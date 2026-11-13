// Package main implements Monotonic Queue helpers for sliding-window max/min.
//
// The deque stores indices; values are compared via the original array.
// Time: O(n) total across all windows. Space: O(k).
package main

import "fmt"

// SlidingWindowMax returns the max of every contiguous window of size k.
// Returns an empty slice when k is non-positive, arr is empty, or k > len(arr).
func SlidingWindowMax(arr []int, k int) []int {
	n := len(arr)
	if k <= 0 || n == 0 || k > n {
		return []int{}
	}
	result := make([]int, 0, n-k+1)
	dq := make([]int, 0, k) // indices; arr[dq[front]] is current max

	for i := 0; i < n; i++ {
		// Evict indices outside the window
		for len(dq) > 0 && dq[0] <= i-k {
			dq = dq[1:]
		}
		// Maintain decreasing order at the back
		for len(dq) > 0 && arr[dq[len(dq)-1]] <= arr[i] {
			dq = dq[:len(dq)-1]
		}
		dq = append(dq, i)
		if i >= k-1 {
			result = append(result, arr[dq[0]])
		}
	}
	return result
}

// SlidingWindowMin returns the min of every contiguous window of size k.
func SlidingWindowMin(arr []int, k int) []int {
	n := len(arr)
	if k <= 0 || n == 0 || k > n {
		return []int{}
	}
	result := make([]int, 0, n-k+1)
	dq := make([]int, 0, k)

	for i := 0; i < n; i++ {
		for len(dq) > 0 && dq[0] <= i-k {
			dq = dq[1:]
		}
		for len(dq) > 0 && arr[dq[len(dq)-1]] >= arr[i] {
			dq = dq[:len(dq)-1]
		}
		dq = append(dq, i)
		if i >= k-1 {
			result = append(result, arr[dq[0]])
		}
	}
	return result
}

func main() {
	arr := []int{1, 3, -1, -3, 5, 3, 6, 7}
	fmt.Println(SlidingWindowMax(arr, 3)) // [3 3 5 5 6 7]
	fmt.Println(SlidingWindowMin(arr, 3)) // [-1 -3 -3 -3 3 3]
}
