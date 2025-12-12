package main

import "testing"

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

