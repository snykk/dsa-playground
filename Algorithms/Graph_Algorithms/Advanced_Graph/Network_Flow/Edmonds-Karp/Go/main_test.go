package main

import "testing"

func TestEdmondsKarp(t *testing.T) {
	graph := map[int]map[int]int{
		0: {1: 16, 2: 13},
		1: {2: 10, 3: 12},
		2: {1: 4, 4: 14},
		3: {2: 9, 5: 20},
		4: {3: 7, 5: 4},
	}

	maxFlow := edmondsKarp(graph, 0, 5)
	if maxFlow != 23 {
		t.Errorf("Expected max flow 23, got %d", maxFlow)
	}
}

