package main

import "testing"

func TestSubsetSum(t *testing.T) {
	arr := []int{1, 2, 3, 4, 5, 6}
	if !subsetSumMeetInMiddle(arr, 10) {
		t.Errorf("Subset sum failed")
	}
}
