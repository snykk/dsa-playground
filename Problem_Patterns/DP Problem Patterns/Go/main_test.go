package main

import "testing"

func TestKnapsack01(t *testing.T) {
	weights := []int{10, 20, 30}
	values := []int{60, 100, 120}
	if val := Knapsack01(weights, values, 50); val != 220 {
		t.Errorf("Knapsack01 = %d; want 220", val)
	}
	if val := Knapsack01(weights, values, 0); val != 0 {
		t.Errorf("Knapsack01(cap=0) = %d; want 0", val)
	}
}

func TestLCS(t *testing.T) {
	if val := LCS("abcde", "ace"); val != 3 {
		t.Errorf("LCS('abcde', 'ace') = %d; want 3", val)
	}
	if val := LCS("abc", "def"); val != 0 {
		t.Errorf("LCS('abc', 'def') = %d; want 0", val)
	}
}

func TestLIS(t *testing.T) {
	nums := []int{10, 9, 2, 5, 3, 7, 101, 18}
	if val := LIS(nums); val != 4 {
		t.Errorf("LIS = %d; want 4", val)
	}
	if val := LIS([]int{7, 7, 7}); val != 1 {
		t.Errorf("LIS([7,7,7]) = %d; want 1", val)
	}
}
