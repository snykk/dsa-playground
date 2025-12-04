package main

import (
	"reflect"
	"testing"
)

func TestAddVertex(t *testing.T) {
	g := NewGraph(false)
	g.AddVertex(1)
	g.AddVertex(2)

	vertices := g.GetVertices()
	if len(vertices) != 2 {
		t.Errorf("Expected 2 vertices, got %d", len(vertices))
	}
}

func TestAddEdgeUndirected(t *testing.T) {
	g := NewGraph(false)
	g.AddEdge(1, 2)
	g.AddEdge(2, 3)

	if !g.HasEdge(1, 2) {
		t.Error("Expected edge 1->2")
	}
	if !g.HasEdge(2, 1) {
		t.Error("Expected edge 2->1 (bidirectional)")
	}
	if g.HasEdge(1, 3) {
		t.Error("Should not have edge 1->3")
	}
}

func TestAddEdgeDirected(t *testing.T) {
	g := NewGraph(true)
	g.AddEdge(1, 2)
	g.AddEdge(2, 3)

	if !g.HasEdge(1, 2) {
		t.Error("Expected edge 1->2")
	}
	if g.HasEdge(2, 1) {
		t.Error("Should not have edge 2->1 (not bidirectional)")
	}
}

func TestBFS(t *testing.T) {
	g := NewGraph(false)
	g.AddEdge(1, 2)
	g.AddEdge(2, 3)
	g.AddEdge(1, 4)

	bfsResult := g.BFS(1)
	if len(bfsResult) != 4 {
		t.Errorf("Expected 4 vertices in BFS, got %d", len(bfsResult))
	}
	if bfsResult[0] != 1 {
		t.Error("BFS should start with vertex 1")
	}
}

func TestDFS(t *testing.T) {
	g := NewGraph(false)
	g.AddEdge(1, 2)
	g.AddEdge(2, 3)
	g.AddEdge(1, 4)

	dfsResult := g.DFS(1)
	if len(dfsResult) != 4 {
		t.Errorf("Expected 4 vertices in DFS, got %d", len(dfsResult))
	}
	if dfsResult[0] != 1 {
		t.Error("DFS should start with vertex 1")
	}
}

func TestIsConnected(t *testing.T) {
	g := NewGraph(false)
	g.AddEdge(1, 2)
	g.AddEdge(2, 3)

	if !g.IsConnected() {
		t.Error("Graph should be connected")
	}

	disconnected := NewGraph(false)
	disconnected.AddEdge(1, 2)
	disconnected.AddVertex(3) // Isolated vertex

	if disconnected.IsConnected() {
		t.Error("Graph should not be connected")
	}
}

func TestGetNeighbors(t *testing.T) {
	g := NewGraph(false)
	g.AddEdge(1, 2)
	g.AddEdge(1, 3)

	neighbors := g.GetNeighbors(1)
	expected := []int{2, 3}
	if !reflect.DeepEqual(neighbors, expected) && !reflect.DeepEqual(neighbors, []int{3, 2}) {
		t.Errorf("Expected neighbors [2, 3] or [3, 2], got %v", neighbors)
	}
}

