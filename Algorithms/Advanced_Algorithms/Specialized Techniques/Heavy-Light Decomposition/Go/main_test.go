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

	hld := NewHLD(n, adj)
	hld.Build(0)
	if hld.LCA(3, 4) != 1 {
		t.Errorf("LCA of 3 and 4 should be 1")
	}
}
