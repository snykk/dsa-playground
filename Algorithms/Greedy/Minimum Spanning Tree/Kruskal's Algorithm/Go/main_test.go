package main

import "testing"

func TestKruskalMST(t *testing.T) {
	edges := [][]int{
		{0, 1, 10},
		{0, 2, 6},
		{0, 3, 5},
		{1, 3, 15},
		{2, 3, 4},
	}
	mst, weight := KruskalMST(edges, 4)
	if len(mst) != 3 {
		t.Errorf("Expected 3 edges in MST, got %d", len(mst))
	}
	if weight != 19 {
		t.Errorf("Expected weight 19, got %d", weight)
	}
}

