package main

import (
	"math"
	"testing"
)

// TestBellmanFord tests basic Bellman-Ford algorithm.
func TestBellmanFord(t *testing.T) {
	edges := []Edge{
		{0, 1, 4},
		{0, 2, 2},
		{1, 3, 5},
		{2, 3, 1},
	}
	
	distances := BellmanFord(edges, 4, 0)
	
	if distances == nil {
		t.Error("Expected distances, got nil")
	}
	
	if distances[0] != 0 {
		t.Errorf("Expected distance to 0 to be 0, got %d", distances[0])
	}
	if distances[1] != 4 {
		t.Errorf("Expected distance to 1 to be 4, got %d", distances[1])
	}
	if distances[2] != 2 {
		t.Errorf("Expected distance to 2 to be 2, got %d", distances[2])
	}
	if distances[3] != 3 {
		t.Errorf("Expected distance to 3 to be 3, got %d", distances[3])
	}
	if len(distances) != 4 {
		t.Errorf("Expected 4 distances, got %d", len(distances))
	}
}

// TestBellmanFordNegativeEdge tests Bellman-Ford with negative edge weights.
func TestBellmanFordNegativeEdge(t *testing.T) {
	edges := []Edge{
		{0, 1, 4},
		{0, 2, 2},
		{1, 3, -5},
		{2, 3, 1},
	}
	
	distances := BellmanFord(edges, 4, 0)
	
	if distances == nil {
		t.Error("Expected distances, got nil")
	}
	
	if distances[0] != 0 {
		t.Errorf("Expected distance to 0 to be 0, got %d", distances[0])
	}
	if distances[1] != 4 {
		t.Errorf("Expected distance to 1 to be 4, got %d", distances[1])
	}
	if distances[2] != 2 {
		t.Errorf("Expected distance to 2 to be 2, got %d", distances[2])
	}
	if distances[3] != -1 { // 0 -> 1 -> 3 = 4 + (-5) = -1
		t.Errorf("Expected distance to 3 to be -1, got %d", distances[3])
	}
}

// TestBellmanFordNegativeCycle tests Bellman-Ford detects negative cycle.
func TestBellmanFordNegativeCycle(t *testing.T) {
	edges := []Edge{
		{0, 1, 1},
		{1, 2, -2},
		{2, 0, -1},
	}
	
	distances := BellmanFord(edges, 3, 0)
	
	if distances != nil {
		t.Error("Expected nil (negative cycle), got distances")
	}
}

// TestBellmanFordMultipleNegativeEdges tests Bellman-Ford with multiple negative edges (no cycle).
func TestBellmanFordMultipleNegativeEdges(t *testing.T) {
	edges := []Edge{
		{0, 1, 3},
		{1, 2, -2},
		{2, 3, -1},
		{0, 3, 5},
	}
	
	distances := BellmanFord(edges, 4, 0)
	
	if distances == nil {
		t.Error("Expected distances, got nil")
	}
	
	if distances[0] != 0 {
		t.Errorf("Expected distance to 0 to be 0, got %d", distances[0])
	}
	if distances[3] != 0 { // 0 -> 1 -> 2 -> 3 = 3 + (-2) + (-1) = 0
		t.Errorf("Expected distance to 3 to be 0, got %d", distances[3])
	}
}

// TestBellmanFordSingleVertex tests Bellman-Ford on graph with single vertex.
func TestBellmanFordSingleVertex(t *testing.T) {
	edges := []Edge{}
	distances := BellmanFord(edges, 1, 0)
	
	if distances == nil {
		t.Error("Expected distances, got nil")
	}
	
	if distances[0] != 0 {
		t.Errorf("Expected distance to 0 to be 0, got %d", distances[0])
	}
	if len(distances) != 1 {
		t.Errorf("Expected 1 distance, got %d", len(distances))
	}
}

// TestBellmanFordEmptyGraph tests Bellman-Ford on empty graph.
func TestBellmanFordEmptyGraph(t *testing.T) {
	edges := []Edge{}
	distances := BellmanFord(edges, 0, 0)
	
	if distances == nil {
		t.Error("Expected empty distances map, got nil")
	}
	if len(distances) != 0 {
		t.Errorf("Expected empty distances, got %v", distances)
	}
}

// TestBellmanFordNoPath tests Bellman-Ford when no path exists.
func TestBellmanFordNoPath(t *testing.T) {
	edges := []Edge{
		{0, 1, 1},
		{2, 3, 1},
	}
	
	distances := BellmanFord(edges, 4, 0)
	
	if distances == nil {
		t.Error("Expected distances, got nil")
	}
	
	if distances[0] != 0 {
		t.Errorf("Expected distance to 0 to be 0, got %d", distances[0])
	}
	if distances[1] != 1 {
		t.Errorf("Expected distance to 1 to be 1, got %d", distances[1])
	}
	if distances[2] != math.MaxInt {
		t.Errorf("Expected distance to 2 to be MaxInt, got %d", distances[2])
	}
	if distances[3] != math.MaxInt {
		t.Errorf("Expected distance to 3 to be MaxInt, got %d", distances[3])
	}
}



// TestBellmanFordOutOfRangeEdgePanics: an edge endpoint outside
// 0..numVertices-1 is an error, not a phantom vertex at distance 0.
func TestBellmanFordOutOfRangeEdgePanics(t *testing.T) {
	badInputs := [][]Edge{
		{{5, 1, 1}},            // source endpoint out of range (was read as distance 0)
		{{0, 1, 1}, {1, 7, 2}}, // target endpoint out of range
		{{-1, 1, 1}},           // negative vertex id
	}
	for _, edges := range badInputs {
		func() {
			defer func() {
				if recover() == nil {
					t.Errorf("Expected a panic for edges %v", edges)
				}
			}()
			BellmanFord(edges, 3, 0)
		}()
	}

	// Valid edges are unaffected; vertex 1 is unreachable from 0 here.
	distances := BellmanFord([]Edge{{2, 1, 1}}, 3, 0)
	if distances[0] != 0 || distances[1] != math.MaxInt {
		t.Errorf("Expected dist[0] = 0 and dist[1] = MaxInt, got %v", distances)
	}
}
