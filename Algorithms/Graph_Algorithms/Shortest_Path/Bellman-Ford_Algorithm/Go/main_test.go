package main

import (
	"testing"
)

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
}

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


