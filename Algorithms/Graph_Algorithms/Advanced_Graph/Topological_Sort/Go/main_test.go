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

func indexOf(slice []int, val int) int {
	for i, v := range slice {
		if v == val {
			return i
		}
	}
	return -1
}

