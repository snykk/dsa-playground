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


func TestRemoveEdgeUndirectedRemovesBothDirections(t *testing.T) {
	graph := NewAdjacencyList(false, false)
	graph.AddEdge(1, 2, 1.0)
	graph.RemoveEdge(1, 2)
	if graph.HasEdge(1, 2) || graph.HasEdge(2, 1) {
		t.Error("both directions should be removed")
	}
	if got := graph.BFS(2); len(got) != 1 {
		t.Errorf("BFS(2) = %v, want only vertex 2", got)
	}

	directed := NewAdjacencyList(true, false)
	directed.AddEdge(1, 2, 1.0)
	directed.AddEdge(2, 1, 1.0)
	directed.RemoveEdge(1, 2)
	if directed.HasEdge(1, 2) || !directed.HasEdge(2, 1) {
		t.Error("directed removal must touch one direction only")
	}
	directed.RemoveEdge(9, 10)
	if len(directed.GetNeighbors(9)) != 0 || directed.vertices[9] {
		t.Error("removing an unknown edge must not create vertices")
	}
}
