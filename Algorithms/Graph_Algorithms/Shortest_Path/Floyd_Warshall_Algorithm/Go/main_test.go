package main

import (
	"math"
	"testing"
)

// TestFloydWarshall tests basic Floyd-Warshall algorithm.
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
	if dist[1][1] != 0 {
		t.Errorf("Expected dist[1][1] to be 0, got %d", dist[1][1])
	}
	if dist[2][2] != 0 {
		t.Errorf("Expected dist[2][2] to be 0, got %d", dist[2][2])
	}
	if dist[3][3] != 0 {
		t.Errorf("Expected dist[3][3] to be 0, got %d", dist[3][3])
	}
	if dist[0][1] != 4 {
		t.Errorf("Expected dist[0][1] to be 4, got %d", dist[0][1])
	}
	if dist[0][2] != 2 {
		t.Errorf("Expected dist[0][2] to be 2, got %d", dist[0][2])
	}
	if dist[0][3] != 3 { // 0 -> 2 -> 3 = 2 + 1 = 3
		t.Errorf("Expected dist[0][3] to be 3, got %d", dist[0][3])
	}
	if dist[1][3] != 5 {
		t.Errorf("Expected dist[1][3] to be 5, got %d", dist[1][3])
	}
	if dist[2][3] != 1 {
		t.Errorf("Expected dist[2][3] to be 1, got %d", dist[2][3])
	}
}

// TestFloydWarshallAllPairs tests Floyd-Warshall finds all pairs shortest paths.
func TestFloydWarshallAllPairs(t *testing.T) {
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
	
	// Test all pairs
	for i := 0; i < 4; i++ {
		if dist[i][i] != 0 {
			t.Errorf("Expected dist[%d][%d] to be 0, got %d", i, i, dist[i][i])
		}
	}
	
	// Test specific paths
	if dist[1][0] != math.MaxInt { // No path from 1 to 0
		t.Errorf("Expected dist[1][0] to be MaxInt, got %d", dist[1][0])
	}
	if dist[2][0] != math.MaxInt { // No path from 2 to 0
		t.Errorf("Expected dist[2][0] to be MaxInt, got %d", dist[2][0])
	}
	if dist[3][0] != math.MaxInt { // No path from 3 to 0
		t.Errorf("Expected dist[3][0] to be MaxInt, got %d", dist[3][0])
	}
}

// TestFloydWarshallCompleteGraph tests Floyd-Warshall on complete graph.
func TestFloydWarshallCompleteGraph(t *testing.T) {
	graph := map[int][]struct {
		Neighbor int
		Weight   int
	}{
		0: {{Neighbor: 1, Weight: 1}, {Neighbor: 2, Weight: 3}},
		1: {{Neighbor: 0, Weight: 1}, {Neighbor: 2, Weight: 1}},
		2: {{Neighbor: 0, Weight: 3}, {Neighbor: 1, Weight: 1}},
	}
	
	dist := FloydWarshall(graph, 3)
	
	if dist[0][1] != 1 {
		t.Errorf("Expected dist[0][1] to be 1, got %d", dist[0][1])
	}
	if dist[0][2] != 2 { // 0 -> 1 -> 2 = 1 + 1 = 2
		t.Errorf("Expected dist[0][2] to be 2, got %d", dist[0][2])
	}
	if dist[1][2] != 1 {
		t.Errorf("Expected dist[1][2] to be 1, got %d", dist[1][2])
	}
}

// TestFloydWarshallSingleVertex tests Floyd-Warshall on graph with single vertex.
func TestFloydWarshallSingleVertex(t *testing.T) {
	graph := map[int][]struct {
		Neighbor int
		Weight   int
	}{
		0: {},
	}
	
	dist := FloydWarshall(graph, 1)
	
	if dist[0][0] != 0 {
		t.Errorf("Expected dist[0][0] to be 0, got %d", dist[0][0])
	}
	if len(dist) != 1 {
		t.Errorf("Expected 1 row, got %d", len(dist))
	}
}

// TestFloydWarshallEmptyGraph tests Floyd-Warshall on empty graph.
func TestFloydWarshallEmptyGraph(t *testing.T) {
	graph := map[int][]struct {
		Neighbor int
		Weight   int
	}{}
	
	dist := FloydWarshall(graph, 0)
	
	if len(dist) != 0 {
		t.Errorf("Expected empty dist, got %v", dist)
	}
}



// TestFloydWarshallParallelEdgesAndSelfLoop: parallel edges keep the cheapest
// weight (in either order) and a positive self-loop keeps dist[i][i] = 0.
func TestFloydWarshallParallelEdgesAndSelfLoop(t *testing.T) {
	cheapFirst := map[int][]struct {
		Neighbor int
		Weight   int
	}{0: {{Neighbor: 1, Weight: 3}, {Neighbor: 1, Weight: 7}}, 1: {}}
	cheapLast := map[int][]struct {
		Neighbor int
		Weight   int
	}{0: {{Neighbor: 1, Weight: 7}, {Neighbor: 1, Weight: 3}}, 1: {}}
	for _, graph := range []map[int][]struct {
		Neighbor int
		Weight   int
	}{cheapFirst, cheapLast} {
		if d := FloydWarshall(graph, 2); d[0][1] != 3 {
			t.Errorf("Expected dist[0][1] = 3 (cheapest parallel edge), got %d", d[0][1])
		}
	}

	selfLoop := map[int][]struct {
		Neighbor int
		Weight   int
	}{0: {{Neighbor: 0, Weight: 5}}}
	if d := FloydWarshall(selfLoop, 1); d == nil || d[0][0] != 0 {
		t.Errorf("Expected [[0]] for a positive self-loop, got %v", d)
	}
}

// TestFloydWarshallNegativeCycle: a negative cycle (including a negative
// self-loop) returns nil instead of a matrix with a negative diagonal.
func TestFloydWarshallNegativeCycle(t *testing.T) {
	graph := map[int][]struct {
		Neighbor int
		Weight   int
	}{
		0: {{Neighbor: 1, Weight: 1}},
		1: {{Neighbor: 2, Weight: -3}},
		2: {{Neighbor: 1, Weight: 1}, {Neighbor: 3, Weight: 1}},
		3: {},
	}
	if d := FloydWarshall(graph, 4); d != nil {
		t.Errorf("Expected nil (negative cycle), got %v", d)
	}

	negativeSelfLoop := map[int][]struct {
		Neighbor int
		Weight   int
	}{0: {{Neighbor: 0, Weight: -1}}}
	if d := FloydWarshall(negativeSelfLoop, 1); d != nil {
		t.Errorf("Expected nil for a negative self-loop, got %v", d)
	}
}
