package main

import (
	"testing"
)

func TestAddEdgeUnweighted(t *testing.T) {
	g := NewEdgeList(false, false)
	g.AddEdge(1, 2, 1.0)
	g.AddEdge(2, 3, 1.0)

	if !g.HasEdge(1, 2) {
		t.Error("Expected edge 1->2")
	}
	if !g.HasEdge(2, 1) {
		t.Error("Expected edge 2->1 (undirected)")
	}
	if g.GetEdgeCount() != 2 {
		t.Errorf("Expected 2 edges, got %d", g.GetEdgeCount())
	}
}

func TestAddEdgeWeighted(t *testing.T) {
	g := NewEdgeList(false, true)
	g.AddEdge(1, 2, 5.0)
	g.AddEdge(2, 3, 3.0)

	if !g.HasEdge(1, 2) {
		t.Error("Expected edge 1->2")
	}
	if g.GetWeight(1, 2) != 5.0 {
		t.Errorf("Expected weight 5.0, got %f", g.GetWeight(1, 2))
	}
	if g.GetEdgeCount() != 2 {
		t.Errorf("Expected 2 edges, got %d", g.GetEdgeCount())
	}
}

