package main

import (
	"testing"
)

func TestDFSAdjacencyList(t *testing.T) {
	graph := map[int][]int{
		1: {2, 4},
		2: {3},
		3: {},
		4: {},
	}

	result := DFSAdjacencyList(graph, 1)

	if len(result) != 4 {
		t.Errorf("Expected 4 vertices, got %d", len(result))
	}

	if result[0] != 1 {
		t.Errorf("Expected first vertex to be 1, got %d", result[0])
	}
}

func TestDFSRecursive(t *testing.T) {
	graph := map[int][]int{
		1: {2, 4},
		2: {3},
		3: {},
		4: {},
	}

	result := DFSRecursive(graph, 1)

	if len(result) != 4 {
		t.Errorf("Expected 4 vertices, got %d", len(result))
	}

	if result[0] != 1 {
		t.Errorf("Expected first vertex to be 1, got %d", result[0])
	}
}

func TestDFSWithPath(t *testing.T) {
	graph := map[int][]int{
		1: {2, 4},
		2: {3},
		3: {},
		4: {},
	}

	path := DFSWithPath(graph, 1, 3)

	if len(path) == 0 {
		t.Error("Expected path to be found")
	}

	if path[0] != 1 {
		t.Errorf("Expected path to start with 1, got %d", path[0])
	}

	if path[len(path)-1] != 3 {
		t.Errorf("Expected path to end with 3, got %d", path[len(path)-1])
	}
}

func TestDFSDetectCycle(t *testing.T) {
	cyclicGraph := map[int][]int{
		1: {2},
		2: {3},
		3: {1},
	}

	hasCycle := DFSDetectCycle(cyclicGraph, true)
	if !hasCycle {
		t.Error("Expected cycle to be detected")
	}

	acyclicGraph := map[int][]int{
		1: {2},
		2: {3},
		3: {},
	}

	hasCycle = DFSDetectCycle(acyclicGraph, true)
	if hasCycle {
		t.Error("Expected no cycle")
	}
}
