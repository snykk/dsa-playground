package main

import (
	"reflect"
	"testing"
)

func TestUnionFind(t *testing.T) {
	uf := NewUnionFind(5)

	if uf.GetCount() != 5 {
		t.Errorf("Expected 5 sets, got %d", uf.GetCount())
	}

	if uf.Connected(0, 1) {
		t.Error("0 and 1 should not be connected initially")
	}

	if !uf.Union(0, 1) {
		t.Error("Union should succeed")
	}
	if uf.GetCount() != 4 {
		t.Errorf("Expected 4 sets, got %d", uf.GetCount())
	}
	if !uf.Connected(0, 1) {
		t.Error("0 and 1 should be connected")
	}

	uf.Union(2, 3)
	if uf.GetCount() != 3 {
		t.Errorf("Expected 3 sets, got %d", uf.GetCount())
	}

	uf.Union(1, 2)
	if !uf.Connected(0, 3) {
		t.Error("0 and 3 should be connected after union")
	}
}

func TestCycleDetection(t *testing.T) {
	edges := [][]int{{0, 1}, {1, 2}, {2, 0}}
	if !UnionFindCycleDetection(edges, 3) {
		t.Error("Should detect cycle")
	}

	noCycle := [][]int{{0, 1}, {1, 2}}
	if UnionFindCycleDetection(noCycle, 3) {
		t.Error("Should not detect cycle")
	}
}

// The trace from the README: eight singletons merged pairwise.
func TestUnionByRankAndPathCompression(t *testing.T) {
	uf := NewUnionFind(8)
	for _, p := range [][2]int{{0, 1}, {2, 3}, {0, 2}, {4, 5}, {6, 7}, {4, 6}, {0, 4}} {
		if !uf.Union(p[0], p[1]) {
			t.Fatalf("Union(%d, %d) should merge two sets", p[0], p[1])
		}
	}
	if want := []int{0, 0, 0, 2, 0, 4, 4, 6}; !reflect.DeepEqual(uf.parent, want) {
		t.Errorf("parent = %v, want %v", uf.parent, want)
	}
	if want := []int{3, 0, 1, 0, 2, 0, 1, 0}; !reflect.DeepEqual(uf.rank, want) {
		t.Errorf("rank = %v, want %v", uf.rank, want)
	}
	// Find(7) walks 7 -> 6 -> 4 -> 0 and points 7 and 6 straight at the root.
	if uf.Find(7) != 0 {
		t.Error("the root of 7 should be 0")
	}
	if want := []int{0, 0, 0, 2, 0, 4, 0, 0}; !reflect.DeepEqual(uf.parent, want) {
		t.Errorf("parent after Find(7) = %v, want %v", uf.parent, want)
	}
}

func TestUnionWithinOneSet(t *testing.T) {
	uf := NewUnionFind(4)
	if !uf.Union(0, 1) || uf.Union(1, 0) {
		t.Error("the second union of the same pair must return false")
	}
	if uf.GetCount() != 3 {
		t.Errorf("count = %d, want 3", uf.GetCount())
	}
}

func TestLongChainOfUnions(t *testing.T) {
	const n = 1000000
	uf := NewUnionFind(n)
	for i := 0; i+1 < n; i++ {
		uf.Union(i, i+1)
	}
	if uf.GetCount() != 1 || !uf.Connected(0, n-1) {
		t.Error("all elements should be in one set")
	}
}
