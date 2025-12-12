package main

import (
	"reflect"
	"testing"
)

// TestBFSAdjacencyList tests basic BFS traversal on simple graph.
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
	if len(result) != 4 {
		t.Errorf("Expected result length 4, got %d", len(result))
	}
	if result[0] != 1 {
		t.Errorf("Expected first vertex to be 1, got %d", result[0])
	}
	if result[len(result)-1] != 3 {
		t.Errorf("Expected last vertex to be 3, got %d", result[len(result)-1])
	}
}

// TestBFSAdjacencyListUndirected tests BFS on undirected graph.
func TestBFSAdjacencyListUndirected(t *testing.T) {
	graph := map[int][]int{
		1: {2, 5},
		2: {1, 3},
		3: {2, 4},
		4: {3},
		5: {1},
	}

	result := BFSAdjacencyList(graph, 1)
	if len(result) != 5 {
		t.Errorf("Expected 5 vertices, got %d", len(result))
	}
	if result[0] != 1 {
		t.Errorf("Expected first vertex to be 1, got %d", result[0])
	}
	
	// Check all vertices are present
	vertices := make(map[int]bool)
	for _, v := range result {
		vertices[v] = true
	}
	for i := 1; i <= 5; i++ {
		if !vertices[i] {
			t.Errorf("Vertex %d not found in result", i)
		}
	}
}

// TestBFSWithPath tests finding path when path exists.
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
	if path[0] != 1 {
		t.Errorf("Expected path to start at 1, got %d", path[0])
	}
	if path[len(path)-1] != 3 {
		t.Errorf("Expected path to end at 3, got %d", path[len(path)-1])
	}
}

// TestBFSWithPathNotFound tests finding path when no path exists.
func TestBFSWithPathNotFound(t *testing.T) {
	graph := map[int][]int{
		1: {2},
		2: {1},
		3: {4},
		4: {3},
	}

	path := BFSWithPath(graph, 1, 3)
	if path != nil && len(path) != 0 {
		t.Errorf("Expected empty path, got %v", path)
	}
}

// TestBFSWithPathSameVertex tests finding path from vertex to itself.
func TestBFSWithPathSameVertex(t *testing.T) {
	graph := map[int][]int{
		1: {2, 4},
		2: {3},
		3: {},
		4: {},
	}

	path := BFSWithPath(graph, 1, 1)
	if len(path) != 1 {
		t.Errorf("Expected path length 1, got %d", len(path))
	}
	if path[0] != 1 {
		t.Errorf("Expected path to contain 1, got %v", path)
	}
}

// TestBFSLevelOrder tests BFS level-order traversal.
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
	
	// Check level 2
	if !reflect.DeepEqual(levels[2], []int{3}) {
		t.Errorf("Level 2 incorrect: got %v", levels[2])
	}
}

// TestBFSShortestDistance tests finding shortest distances.
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
	if len(distances) != 4 {
		t.Errorf("Expected 4 distances, got %d", len(distances))
	}
}

// TestBFSEmptyGraph tests BFS on empty graph.
func TestBFSEmptyGraph(t *testing.T) {
	graph := map[int][]int{}
	result := BFSAdjacencyList(graph, 1)
	if len(result) != 0 {
		t.Errorf("Expected empty result, got %v", result)
	}
}

// TestBFSSingleVertex tests BFS on graph with single vertex.
func TestBFSSingleVertex(t *testing.T) {
	graph := map[int][]int{1: {}}
	result := BFSAdjacencyList(graph, 1)
	if len(result) != 1 {
		t.Errorf("Expected 1 vertex, got %d", len(result))
	}
	if result[0] != 1 {
		t.Errorf("Expected vertex 1, got %d", result[0])
	}
}

// TestBFSStartNotInGraph tests BFS when start vertex not in graph.
func TestBFSStartNotInGraph(t *testing.T) {
	graph := map[int][]int{
		1: {2},
		2: {3},
		3: {},
	}
	result := BFSAdjacencyList(graph, 99)
	if len(result) != 0 {
		t.Errorf("Expected empty result, got %v", result)
	}
}
