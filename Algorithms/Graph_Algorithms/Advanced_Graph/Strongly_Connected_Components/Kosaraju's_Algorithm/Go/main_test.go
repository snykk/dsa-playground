package main

import "testing"

func TestKosarajuSCC(t *testing.T) {
	graph := map[int][]int{
		1: {2},
		2: {3},
		3: {1},
		4: {5},
		5: {6},
		6: {4},
	}

	sccs := KosarajuSCC(graph)
	if len(sccs) != 2 {
		t.Errorf("Expected 2 SCCs, got %d", len(sccs))
	}
}

func TestIsStronglyConnected(t *testing.T) {
	graph := map[int][]int{
		1: {2},
		2: {3},
		3: {1},
	}

	if !IsStronglyConnected(graph) {
		t.Error("Graph should be strongly connected")
	}

	graph2 := map[int][]int{
		1: {2},
		2: {3},
		3: {},
	}

	if IsStronglyConnected(graph2) {
		t.Error("Graph should not be strongly connected")
	}
}

