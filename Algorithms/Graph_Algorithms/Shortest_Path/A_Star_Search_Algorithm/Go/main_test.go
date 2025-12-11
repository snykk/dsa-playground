package main

import (
	"reflect"
	"testing"
)

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
}


