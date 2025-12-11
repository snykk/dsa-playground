package main

import (
	"reflect"
	"testing"
)

func TestDijkstra(t *testing.T) {
	graph := map[int][]struct {
		Neighbor int
		Weight   int
	}{
		1: {{Neighbor: 2, Weight: 4}, {Neighbor: 3, Weight: 2}},
		2: {{Neighbor: 4, Weight: 5}},
		3: {{Neighbor: 4, Weight: 1}},
		4: {},
	}
	
	distances := Dijkstra(graph, 1)
	
	if distances[1] != 0 {
		t.Errorf("Expected distance to 1 to be 0, got %d", distances[1])
	}
	if distances[2] != 4 {
		t.Errorf("Expected distance to 2 to be 4, got %d", distances[2])
	}
	if distances[3] != 2 {
		t.Errorf("Expected distance to 3 to be 2, got %d", distances[3])
	}
	if distances[4] != 3 {
		t.Errorf("Expected distance to 4 to be 3, got %d", distances[4])
	}
}

func TestDijkstraWithPath(t *testing.T) {
	graph := map[int][]struct {
		Neighbor int
		Weight   int
	}{
		1: {{Neighbor: 2, Weight: 4}, {Neighbor: 3, Weight: 2}},
		2: {{Neighbor: 4, Weight: 5}},
		3: {{Neighbor: 4, Weight: 1}},
		4: {},
	}
	
	distance, path := DijkstraWithPath(graph, 1, 4)
	
	if distance != 3 {
		t.Errorf("Expected distance to be 3, got %d", distance)
	}
	
	expectedPath := []int{1, 3, 4}
	if !reflect.DeepEqual(path, expectedPath) {
		t.Errorf("Expected path %v, got %v", expectedPath, path)
	}
}


