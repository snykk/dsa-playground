package main

import (
	"testing"
)

func TestAddEdge(t *testing.T) {
	graph := NewAdjacencyMatrix(5, false, false)
	graph.AddEdge(0, 1, 1.0)
	graph.AddEdge(1, 2, 1.0)

	if !graph.HasEdge(0, 1) {
		t.Error("Expected edge 0->1")
	}
	if !graph.HasEdge(1, 0) {
		t.Error("Expected edge 1->0 (undirected)")
	}
}

func TestGetNeighbors(t *testing.T) {
	graph := NewAdjacencyMatrix(5, false, false)
	graph.AddEdge(0, 1, 1.0)
	graph.AddEdge(0, 2, 1.0)

	neighbors := graph.GetNeighbors(0)
	if len(neighbors) != 2 {
		t.Errorf("Expected 2 neighbors, got %d", len(neighbors))
	}
}

