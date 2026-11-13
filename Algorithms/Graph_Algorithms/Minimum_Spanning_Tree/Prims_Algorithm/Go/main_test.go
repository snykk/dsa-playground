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


// TestPrimNeighborOnlyVertex: len(graph) was used as the vertex count, so a
// vertex that appears only as a neighbor ended the loop before it was added.
func TestPrimNeighborOnlyVertex(t *testing.T) {
	graph := map[int][]Edge{0: {{1, 4}}}
	mst, weight := PrimMST(graph, 0)
	if len(mst) != 1 || weight != 4 {
		t.Errorf("Expected 1 edge of weight 4, got %d edges and weight %d", len(mst), weight)
	}
}

func TestPrimDisconnectedCoversStartComponentOnly(t *testing.T) {
	graph := map[int][]Edge{
		0: {{1, 1}},
		1: {{0, 1}},
		2: {{3, 1}},
		3: {{2, 1}},
	}
	mst, weight := PrimMST(graph, 0)
	if len(mst) != 1 || weight != 1 {
		t.Errorf("Expected 1 edge of weight 1, got %d edges and weight %d", len(mst), weight)
	}
}

func TestPrimNegativeWeights(t *testing.T) {
	graph := map[int][]Edge{
		0: {{1, -2}, {2, 7}},
		1: {{0, -2}, {2, 3}, {3, -5}},
		2: {{0, 7}, {1, 3}, {3, 1}},
		3: {{1, -5}, {2, 1}},
	}
	mst, weight := PrimMST(graph, 0)
	if len(mst) != 3 || weight != -6 {
		t.Errorf("Expected 3 edges of weight -6, got %d edges and weight %d", len(mst), weight)
	}
}

func TestPrimEmptyAndSingleVertex(t *testing.T) {
	if mst, weight := PrimMST(map[int][]Edge{}, 0); len(mst) != 0 || weight != 0 {
		t.Errorf("Expected an empty MST, got %v weight %d", mst, weight)
	}
	if mst, weight := PrimMST(map[int][]Edge{0: {}}, 0); len(mst) != 0 || weight != 0 {
		t.Errorf("Expected an empty MST, got %v weight %d", mst, weight)
	}
}
