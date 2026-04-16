package main

import (
	"testing"
)

func TestBuild(t *testing.T) {
	n := 5
	adj := make([][]int, n)
	adj[0] = []int{1, 2}
	adj[1] = []int{0, 3, 4}
	adj[2] = []int{0}
	adj[3] = []int{1}
	adj[4] = []int{1}

	cd := NewCentroidDecomposition(n, adj)
	cd.Build(0)
	parent := cd.GetParent()

	// The centroid of the tree is the root of the centroid decomposition
	// and should have parent -1. Exactly one node must be the root.
	rootCount := 0
	for i := 0; i < n; i++ {
		if parent[i] == -1 {
			rootCount++
		}
	}
	if rootCount != 1 {
		t.Errorf("Exactly one node should have parent -1, got %d", rootCount)
	}
}
