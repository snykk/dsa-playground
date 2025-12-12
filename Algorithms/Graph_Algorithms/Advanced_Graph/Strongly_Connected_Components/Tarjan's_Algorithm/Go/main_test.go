package main

import "testing"

func TestTarjanSCC(t *testing.T) {
	graph := map[int][]int{
		1: {2},
		2: {3},
		3: {1},
		4: {5},
		5: {6},
		6: {4},
	}

	sccs := TarjanSCC(graph)
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
}

