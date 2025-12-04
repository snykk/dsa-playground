package main

import (
	"testing"
)

func TestAddEdge(t *testing.T) {
	graph := NewAdjacencyList(false, true)
	graph.AddEdge(1, 2, 5.0)
	graph.AddEdge(2, 3, 3.0)

	if !graph.HasEdge(1, 2) {
		t.Error("Expected edge 1->2")
	}
	if !graph.HasEdge(2, 1) {
		t.Error("Expected edge 2->1 (undirected)")
	}
}

func TestGetNeighbors(t *testing.T) {
	graph := NewAdjacencyList(false, false)
	graph.AddEdge(1, 2, 1.0)
	graph.AddEdge(1, 3, 1.0)

	neighbors := graph.GetNeighbors(1)
	if len(neighbors) != 2 {
		t.Errorf("Expected 2 neighbors, got %d", len(neighbors))
	}
}

