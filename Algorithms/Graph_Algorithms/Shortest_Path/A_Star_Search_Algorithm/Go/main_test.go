package main

import (
	"reflect"
	"testing"
)

// TestAStar tests basic A* search algorithm.
func TestAStar(t *testing.T) {
	graph := map[int][]struct {
		Neighbor int
		Weight   int
	}{
		0: {{Neighbor: 1, Weight: 4}, {Neighbor: 2, Weight: 2}},
		1: {{Neighbor: 3, Weight: 5}},
		2: {{Neighbor: 3, Weight: 1}},
		3: {},
	}
	
	heuristic := func(node int) int {
		if node == 3 {
			return 0
		}
		return 1
	}
	
	distance, path := AStar(graph, 0, 3, heuristic)
	
	if distance != 3 {
		t.Errorf("Expected distance to be 3, got %d", distance)
	}
	
	expectedPath := []int{0, 2, 3}
	if !reflect.DeepEqual(path, expectedPath) {
		t.Errorf("Expected path %v, got %v", expectedPath, path)
	}
	if path[0] != 0 {
		t.Errorf("Expected path to start at 0, got %d", path[0])
	}
	if path[len(path)-1] != 3 {
		t.Errorf("Expected path to end at 3, got %d", path[len(path)-1])
	}
}

// TestAStarMultiplePaths tests A* with multiple possible paths.
func TestAStarMultiplePaths(t *testing.T) {
	graph := map[int][]struct {
		Neighbor int
		Weight   int
	}{
		0: {{Neighbor: 1, Weight: 1}, {Neighbor: 2, Weight: 4}},
		1: {{Neighbor: 2, Weight: 2}, {Neighbor: 3, Weight: 5}},
		2: {{Neighbor: 3, Weight: 1}},
		3: {},
	}
	
	heuristic := func(node int) int {
		if node == 3 {
			return 0
		}
		return 1
	}
	
	distance, path := AStar(graph, 0, 3, heuristic)
	
	if distance != 4 { // 0 -> 1 -> 2 -> 3 = 1 + 2 + 1 = 4
		t.Errorf("Expected distance to be 4, got %d", distance)
	}
	if path[0] != 0 {
		t.Errorf("Expected path to start at 0, got %d", path[0])
	}
	if path[len(path)-1] != 3 {
		t.Errorf("Expected path to end at 3, got %d", path[len(path)-1])
	}
}

// TestAStarSameVertex tests A* from vertex to itself.
func TestAStarSameVertex(t *testing.T) {
	graph := map[int][]struct {
		Neighbor int
		Weight   int
	}{
		0: {{Neighbor: 1, Weight: 4}, {Neighbor: 2, Weight: 2}},
		1: {{Neighbor: 3, Weight: 5}},
		2: {{Neighbor: 3, Weight: 1}},
		3: {},
	}
	
	heuristic := func(node int) int {
		return 0
	}
	
	distance, path := AStar(graph, 0, 0, heuristic)
	
	if distance != 0 {
		t.Errorf("Expected distance to be 0, got %d", distance)
	}
	if len(path) != 1 {
		t.Errorf("Expected path length 1, got %d", len(path))
	}
	if path[0] != 0 {
		t.Errorf("Expected path to contain 0, got %v", path)
	}
}

// TestAStarNoPath tests A* when no path exists.
func TestAStarNoPath(t *testing.T) {
	graph := map[int][]struct {
		Neighbor int
		Weight   int
	}{
		0: {{Neighbor: 1, Weight: 1}},
		1: {},
		2: {},
	}
	
	heuristic := func(node int) int {
		if node == 2 {
			return 0
		}
		return 1
	}
	
	distance, path := AStar(graph, 0, 2, heuristic)
	
	if distance != -1 {
		t.Errorf("Expected distance to be -1, got %d", distance)
	}
	if path != nil && len(path) != 0 {
		t.Errorf("Expected empty path, got %v", path)
	}
}

// TestAStarZeroHeuristic tests A* with zero heuristic (equivalent to Dijkstra's).
func TestAStarZeroHeuristic(t *testing.T) {
	graph := map[int][]struct {
		Neighbor int
		Weight   int
	}{
		0: {{Neighbor: 1, Weight: 4}, {Neighbor: 2, Weight: 2}},
		1: {{Neighbor: 3, Weight: 5}},
		2: {{Neighbor: 3, Weight: 1}},
		3: {},
	}
	
	heuristic := func(node int) int {
		return 0
	}
	
	distance, path := AStar(graph, 0, 3, heuristic)
	
	if distance != 3 {
		t.Errorf("Expected distance to be 3, got %d", distance)
	}
	expectedPath := []int{0, 2, 3}
	if !reflect.DeepEqual(path, expectedPath) {
		t.Errorf("Expected path %v, got %v", expectedPath, path)
	}
}

// TestAStarEmptyGraph tests A* on empty graph.
func TestAStarEmptyGraph(t *testing.T) {
	graph := map[int][]struct {
		Neighbor int
		Weight   int
	}{}
	
	heuristic := func(node int) int {
		return 0
	}
	
	distance, path := AStar(graph, 0, 3, heuristic)
	
	if distance != -1 {
		t.Errorf("Expected distance to be -1, got %d", distance)
	}
	if path != nil && len(path) != 0 {
		t.Errorf("Expected empty path, got %v", path)
	}
}

// TestAStarSingleVertex tests A* on graph with single vertex.
func TestAStarSingleVertex(t *testing.T) {
	graph := map[int][]struct {
		Neighbor int
		Weight   int
	}{
		0: {},
	}
	
	heuristic := func(node int) int {
		return 0
	}
	
	distance, path := AStar(graph, 0, 0, heuristic)
	
	if distance != 0 {
		t.Errorf("Expected distance to be 0, got %d", distance)
	}
	if len(path) != 1 {
		t.Errorf("Expected path length 1, got %d", len(path))
	}
	if path[0] != 0 {
		t.Errorf("Expected path to contain 0, got %v", path)
	}
}


