package main

import "testing"

func TestSubsetSum(t *testing.T) {
	arr := []int{1, 2, 3, 4, 5, 6}
	if !subsetSumMeetInMiddle(arr, 10) {
		t.Errorf("Subset sum failed")
	}
}

func TestUnreachableAndEdgeCases(t *testing.T) {
	cases := []struct {
		arr    []int
		target int
		want   bool
	}{
		{[]int{2, 4, 6}, 7, false}, // all sums are even
		{nil, 0, true},             // the empty subset
		{nil, 5, false},
		{[]int{9}, 9, true}, // odd length
		{[]int{9}, 8, false},
		{[]int{1, 2, 3}, 0, true},
		{[]int{1, 2, 3}, 7, false}, // total is 6
		{[]int{-1, 5, 3}, 2, true}, // -1 + 3
	}
	for _, c := range cases {
		if got := subsetSumMeetInMiddle(c.arr, c.target); got != c.want {
			t.Errorf("subsetSumMeetInMiddle(%v, %d) = %v; want %v", c.arr, c.target, got, c.want)
		}
	}
}
