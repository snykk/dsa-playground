package main

import "testing"

func TestTopologicalSortKahn(t *testing.T) {
	graph := map[int][]int{
		1: {2, 4},
		2: {3},
		3: {},
		4: {},
	}

	result := TopologicalSortKahn(graph)
	if len(result) != 4 {
		t.Errorf("Expected 4 vertices, got %d", len(result))
	}

	// Check ordering: 1 before 2 and 4, 2 before 3
	index1 := indexOf(result, 1)
	index2 := indexOf(result, 2)
	index4 := indexOf(result, 4)
	index3 := indexOf(result, 3)

	if index1 >= index2 || index1 >= index4 {
		t.Error("Vertex 1 should come before 2 and 4")
	}
	if index2 >= index3 {
		t.Error("Vertex 2 should come before 3")
	}
}

func TestTopologicalSortCycle(t *testing.T) {
	graph := map[int][]int{
		1: {2},
		2: {3},
		3: {1}, // Cycle
	}

	result := TopologicalSortKahn(graph)
	if len(result) > 0 && len(result) == len(graph) {
		t.Error("Should detect cycle")
	}
}

func TestIsDAG(t *testing.T) {
	dag := map[int][]int{
		1: {2},
		2: {3},
		3: {},
	}
	if !IsDAG(dag) {
		t.Error("Should be DAG")
	}

	cycle := map[int][]int{
		1: {2},
		2: {1},
	}
	if IsDAG(cycle) {
		t.Error("Should not be DAG (has cycle)")
	}
}

// Regression: IsDAG compared the order length with len(graph), which counts
// keys only, and treated an empty order as a cycle.
func TestIsDAGEmptyAndNeighborOnlyVertices(t *testing.T) {
	if !IsDAG(map[int][]int{}) {
		t.Error("the empty graph is a DAG")
	}
	sinkNotAKey := map[int][]int{0: {1}}
	if got := len(TopologicalSortKahn(sinkNotAKey)); got != 2 {
		t.Errorf("expected 2 vertices in the order, got %d", got)
	}
	if !IsDAG(sinkNotAKey) {
		t.Error("0 -> 1 is a DAG even though 1 is not a key")
	}
	diamond := map[int][]int{0: {1, 2}, 1: {3}, 2: {3}}
	if !IsDAG(diamond) {
		t.Error("diamond with a neighbor-only sink is a DAG")
	}
	if IsDAG(map[int][]int{0: {1}, 1: {0, 2}}) {
		t.Error("cycle 0 <-> 1 with a tail is not a DAG")
	}
	if IsDAG(map[int][]int{0: {0}}) {
		t.Error("a self-loop is a cycle")
	}
}

func indexOf(slice []int, val int) int {
	for i, v := range slice {
		if v == val {
			return i
		}
	}
	return -1
}

