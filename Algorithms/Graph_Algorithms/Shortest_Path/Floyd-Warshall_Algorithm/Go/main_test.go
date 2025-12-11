package main

import (
	"testing"
)

func TestFloydWarshall(t *testing.T) {
	graph := map[int][]struct {
		Neighbor int
		Weight   int
	}{
		0: {{Neighbor: 1, Weight: 4}, {Neighbor: 2, Weight: 2}},
		1: {{Neighbor: 3, Weight: 5}},
		2: {{Neighbor: 3, Weight: 1}},
		3: {},
	}
	
	dist := FloydWarshall(graph, 4)
	
	if dist[0][0] != 0 {
		t.Errorf("Expected dist[0][0] to be 0, got %d", dist[0][0])
	}
	if dist[0][1] != 4 {
		t.Errorf("Expected dist[0][1] to be 4, got %d", dist[0][1])
	}
	if dist[0][2] != 2 {
		t.Errorf("Expected dist[0][2] to be 2, got %d", dist[0][2])
	}
	if dist[0][3] != 3 {
		t.Errorf("Expected dist[0][3] to be 3, got %d", dist[0][3])
	}
}


