package main

import "testing"

func TestPrimMST(t *testing.T) {
	graph := map[int][]Edge{
		0: {{1, 10}, {2, 6}, {3, 5}},
		1: {{0, 10}, {3, 15}},
		2: {{0, 6}, {3, 4}},
		3: {{0, 5}, {1, 15}, {2, 4}},
	}
	mst, weight := PrimMST(graph, 0)
	if len(mst) != 3 {
		t.Errorf("Expected 3 edges in MST, got %d", len(mst))
	}
	if weight != 19 {
		t.Errorf("Expected weight 19, got %d", weight)
	}
}

