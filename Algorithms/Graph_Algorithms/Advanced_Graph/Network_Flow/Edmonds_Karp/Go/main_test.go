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

func TestSinkUnreachable(t *testing.T) {
	graph := map[int]map[int]int{0: {1: 5}, 2: {3: 5}}
	if got := edmondsKarp(graph, 0, 3); got != 0 {
		t.Errorf("Expected 0, got %d", got)
	}
}

func TestSinkWithoutKey(t *testing.T) {
	graph := map[int]map[int]int{0: {1: 7}, 1: {2: 3}}
	if got := edmondsKarp(graph, 0, 2); got != 3 {
		t.Errorf("Expected 3, got %d", got)
	}
}

func TestSameSourceSink(t *testing.T) {
	graph := map[int]map[int]int{0: {1: 10}}
	if got := edmondsKarp(graph, 0, 0); got != 0 {
		t.Errorf("Expected 0, got %d", got)
	}
}

func TestAntiParallelEdges(t *testing.T) {
	graph := map[int]map[int]int{0: {1: 4}, 1: {0: 6, 2: 5}}
	if got := edmondsKarp(graph, 0, 2); got != 4 {
		t.Errorf("Expected 4, got %d", got)
	}
}

func TestZeroCapacity(t *testing.T) {
	graph := map[int]map[int]int{0: {1: 0, 2: 3}, 1: {3: 9}, 2: {3: 9}}
	if got := edmondsKarp(graph, 0, 3); got != 3 {
		t.Errorf("Expected 3, got %d", got)
	}
}

func TestDiamondWithCrossEdge(t *testing.T) {
	graph := map[int]map[int]int{
		0: {1: 1000, 2: 1000},
		1: {2: 1, 3: 1000},
		2: {3: 1000},
	}
	if got := edmondsKarp(graph, 0, 3); got != 2000 {
		t.Errorf("Expected 2000, got %d", got)
	}
}

func TestLargeCapacitiesDoNotOverflow(t *testing.T) {
	const big = 2147483647
	graph := map[int]map[int]int{
		0: {1: big, 2: big},
		1: {3: big},
		2: {3: big},
	}
	if got := edmondsKarp(graph, 0, 3); got != 2*big {
		t.Errorf("Expected %d, got %d", 2*big, got)
	}
}
