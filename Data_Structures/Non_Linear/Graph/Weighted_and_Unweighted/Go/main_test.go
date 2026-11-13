package main

import (
	"testing"
)

func TestAddEdgeWeighted(t *testing.T) {
	g := NewWeightedGraph(false)
	g.AddEdge(1, 2, 5.0)
	g.AddEdge(2, 3, 3.0)

	if !g.HasEdge(1, 2) {
		t.Error("Expected edge 1->2")
	}
	if g.GetWeight(1, 2) != 5.0 {
		t.Errorf("Expected weight 5.0, got %f", g.GetWeight(1, 2))
	}
}

func TestGetTotalWeight(t *testing.T) {
	g := NewWeightedGraph(false)
	g.AddEdge(1, 2, 5.0)
	g.AddEdge(2, 3, 3.0)
	g.AddEdge(1, 4, 2.0)

	total := g.GetTotalWeight()
	if total != 10.0 {
		t.Errorf("Expected total weight 10.0, got %f", total)
	}
}


func TestRemoveEdgeUndirected(t *testing.T) {
	g := NewWeightedGraph(false)
	g.AddEdge(1, 2, 4.5)
	g.RemoveEdge(1, 2)
	if g.HasEdge(1, 2) || g.HasEdge(2, 1) {
		t.Error("both directions should be removed")
	}
	if g.GetTotalWeight() != 0 {
		t.Errorf("Expected total weight 0, got %f", g.GetTotalWeight())
	}
}
