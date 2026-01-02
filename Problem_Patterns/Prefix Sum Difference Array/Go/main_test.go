package main

import "testing"

func TestPrefixSum(t *testing.T) {
	arr := []int{1, 2, 3, 4, 5}
	ps := NewPrefixSum(arr)
	if ps.Query(0, 4) != 15 {
		t.Errorf("Query failed")
	}
}
