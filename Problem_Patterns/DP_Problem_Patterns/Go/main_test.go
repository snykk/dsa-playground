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

func TestKnapsack01ZeroWeightItem(t *testing.T) {
	// Regression: a zero-weight item fits in capacity 0 (Python and C++ return 5)
	if val := Knapsack01([]int{0}, []int{5}, 0); val != 5 {
		t.Errorf("Knapsack01([0],[5],0) = %d; want 5", val)
	}
	if val := Knapsack01([]int{0, 3}, []int{5, 4}, 2); val != 5 {
		t.Errorf("Knapsack01([0,3],[5,4],2) = %d; want 5", val)
	}
	if val := Knapsack01([]int{1, 3, 4, 5}, []int{1, 4, 5, 7}, 7); val != 9 {
		t.Errorf("Knapsack01 = %d; want 9", val)
	}
}

func TestLCS(t *testing.T) {
	if val := LCS("abcde", "ace"); val != 3 {
		t.Errorf("LCS('abcde', 'ace') = %d; want 3", val)
	}
	if val := LCS("abc", "def"); val != 0 {
		t.Errorf("LCS('abc', 'def') = %d; want 0", val)
	}
	if val := LCS("abcbdab", "bdcaba"); val != 4 {
		t.Errorf("LCS('abcbdab', 'bdcaba') = %d; want 4", val)
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
	if val := LIS([]int{10, 9, 2, 5, 3}); val != 2 {
		t.Errorf("LIS([10,9,2,5,3]) = %d; want 2", val)
	}
}
