package main

import "testing"

func TestLISDP(t *testing.T) {
	arr := []int{10, 9, 2, 5, 3, 7, 101, 18}
	if LISDP(arr) != 4 {
		t.Error("Expected 4")
	}
}

