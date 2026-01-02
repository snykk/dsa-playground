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
	if parent[0] != -1 {
		t.Errorf("Root should have parent -1")
	}
}
