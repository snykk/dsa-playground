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


func TestKruskalDisconnectedGivesSpanningForest(t *testing.T) {
	edges := [][]int{{0, 1, 5}, {2, 3, 3}}
	mst, weight := KruskalMST(edges, 4)
	if len(mst) != 2 || weight != 8 {
		t.Errorf("Expected 2 edges of total weight 8, got %d edges and weight %d", len(mst), weight)
	}
}

func TestKruskalNegativeWeights(t *testing.T) {
	edges := [][]int{{0, 1, -2}, {0, 2, 7}, {1, 2, 3}, {1, 3, -5}, {2, 3, 1}}
	mst, weight := KruskalMST(edges, 4)
	if len(mst) != 3 || weight != -6 {
		t.Errorf("Expected 3 edges of total weight -6, got %d edges and weight %d", len(mst), weight)
	}
}

func TestKruskalEmptyAndSingleVertex(t *testing.T) {
	if mst, weight := KruskalMST(nil, 0); len(mst) != 0 || weight != 0 {
		t.Errorf("Expected an empty MST, got %v weight %d", mst, weight)
	}
	if mst, weight := KruskalMST(nil, 1); len(mst) != 0 || weight != 0 {
		t.Errorf("Expected an empty MST, got %v weight %d", mst, weight)
	}
}
