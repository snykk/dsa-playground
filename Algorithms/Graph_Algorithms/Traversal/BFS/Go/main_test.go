package main

import (
	"reflect"
	"testing"
)

func TestBFSAdjacencyList(t *testing.T) {
	graph := map[int][]int{
		1: {2, 4},
		2: {3},
		3: {},
		4: {},
	}

	result := BFSAdjacencyList(graph, 1)
	expected := []int{1, 2, 4, 3}

	if !reflect.DeepEqual(result, expected) {
		t.Errorf("Expected %v, got %v", expected, result)
	}
}

func TestBFSWithPath(t *testing.T) {
	graph := map[int][]int{
		1: {2, 4},
		2: {3},
		3: {},
		4: {},
	}

	path := BFSWithPath(graph, 1, 3)
	expected := []int{1, 2, 3}

	if !reflect.DeepEqual(path, expected) {
		t.Errorf("Expected %v, got %v", expected, path)
	}
}

func TestBFSLevelOrder(t *testing.T) {
	graph := map[int][]int{
		1: {2, 4},
		2: {3},
		3: {},
		4: {},
	}

	levels := BFSLevelOrder(graph, 1)

	if len(levels) != 3 {
		t.Errorf("Expected 3 levels, got %d", len(levels))
	}

	if !reflect.DeepEqual(levels[0], []int{1}) {
		t.Errorf("Level 0 incorrect: got %v", levels[0])
	}

	// Level 1 should contain 2 and 4 (order may vary)
	if len(levels[1]) != 2 {
		t.Errorf("Level 1 should have 2 vertices, got %d", len(levels[1]))
	}
}

func TestBFSShortestDistance(t *testing.T) {
	graph := map[int][]int{
		1: {2, 4},
		2: {3},
		3: {},
		4: {},
	}

	distances := BFSShortestDistance(graph, 1)

	if distances[1] != 0 {
		t.Errorf("Distance to 1 should be 0, got %d", distances[1])
	}
	if distances[2] != 1 {
		t.Errorf("Distance to 2 should be 1, got %d", distances[2])
	}
	if distances[4] != 1 {
		t.Errorf("Distance to 4 should be 1, got %d", distances[4])
	}
	if distances[3] != 2 {
		t.Errorf("Distance to 3 should be 2, got %d", distances[3])
	}
}
