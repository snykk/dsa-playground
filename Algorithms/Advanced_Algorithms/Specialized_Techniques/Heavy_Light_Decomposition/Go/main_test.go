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

func TestBuildTwice(t *testing.T) {
	n := 7
	adj := make([][]int, n)
	adj[0] = []int{1, 2}
	adj[1] = []int{0, 3, 4}
	adj[2] = []int{0, 5}
	adj[3] = []int{1}
	adj[4] = []int{1, 6}
	adj[5] = []int{2}
	adj[6] = []int{4}

	hld := NewHLD(n, adj)
	hld.Build(0)
	hld.Build(0)
	seen := make(map[int]bool)
	for i := 0; i < n; i++ {
		if hld.pos[i] < 0 || hld.pos[i] >= n || seen[hld.pos[i]] {
			t.Fatalf("pos out of range or repeated after rebuild: %v", hld.pos)
		}
		seen[hld.pos[i]] = true
	}
	if hld.LCA(6, 5) != 0 || hld.LCA(3, 4) != 1 {
		t.Errorf("wrong LCA after rebuild")
	}
}
