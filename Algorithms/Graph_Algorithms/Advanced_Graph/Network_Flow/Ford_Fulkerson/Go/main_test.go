package main

import "testing"

func TestFordFulkerson(t *testing.T) {
	graph := map[int]map[int]int{
		0: {1: 16, 2: 13},
		1: {2: 10, 3: 12},
		2: {1: 4, 4: 14},
		3: {2: 9, 5: 20},
		4: {3: 7, 5: 4},
	}

	maxFlow := fordFulkerson(graph, 0, 5)
	if maxFlow != 23 {
		t.Errorf("Expected max flow 23, got %d", maxFlow)
	}
}

func TestSinkUnreachable(t *testing.T) {
	graph := map[int]map[int]int{0: {1: 5}, 2: {3: 5}}
	if got := fordFulkerson(graph, 0, 3); got != 0 {
		t.Errorf("Expected 0, got %d", got)
	}
}

func TestSinkWithoutKey(t *testing.T) {
	graph := map[int]map[int]int{0: {1: 7}, 1: {2: 3}}
	if got := fordFulkerson(graph, 0, 2); got != 3 {
		t.Errorf("Expected 3, got %d", got)
	}
}

func TestSameSourceSink(t *testing.T) {
	graph := map[int]map[int]int{0: {1: 10}}
	if got := fordFulkerson(graph, 0, 0); got != 0 {
		t.Errorf("Expected 0, got %d", got)
	}
}

func TestAntiParallelEdges(t *testing.T) {
	graph := map[int]map[int]int{0: {1: 4}, 1: {0: 6, 2: 5}}
	if got := fordFulkerson(graph, 0, 2); got != 4 {
		t.Errorf("Expected 4, got %d", got)
	}
}

func TestSmallNetwork(t *testing.T) {
	graph := map[int]map[int]int{
		0: {1: 10, 2: 5},
		1: {3: 5, 4: 3},
		2: {4: 7},
		3: {5: 8},
		4: {5: 6},
	}
	if got := fordFulkerson(graph, 0, 5); got != 11 {
		t.Errorf("Expected 11, got %d", got)
	}
}

func TestLargeVertexIds(t *testing.T) {
	graph := map[int]map[int]int{0: {1500: 5}, 1500: {1: 5}}
	if got := fordFulkerson(graph, 0, 1); got != 5 {
		t.Errorf("Expected 5, got %d", got)
	}
}

func TestLongChain(t *testing.T) {
	graph := map[int]map[int]int{}
	for i := 0; i < 20000; i++ {
		graph[i] = map[int]int{i + 1: 5}
	}
	if got := fordFulkerson(graph, 0, 20000); got != 5 {
		t.Errorf("Expected 5, got %d", got)
	}
}
