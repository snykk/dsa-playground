package main

import "testing"

func TestUnionFind(t *testing.T) {
	uf := NewUnionFind(5)

	if count := uf.GetCount(); count != 5 {
		t.Errorf("Initial count = %d; want 5", count)
	}

	// Test Union
	if !uf.Union(0, 1) {
		t.Error("Union(0, 1) should return true")
	}
	if uf.Union(0, 1) {
		t.Error("Union(0, 1) again should return false")
	}

	// Test Connectivity
	if !uf.Connected(0, 1) {
		t.Error("0 and 1 should be connected")
	}
	if uf.Connected(0, 2) {
		t.Error("0 and 2 should NOT be connected")
	}

	// Test Transitivity
	uf.Union(1, 2)
	if !uf.Connected(0, 2) {
		t.Error("0 and 2 should be connected transitively")
	}

	if count := uf.GetCount(); count != 3 { // Sets: {0,1,2}, {3}, {4}
		t.Errorf("Count after unions = %d; want 3", count)
	}
}

func TestLargeUnion(t *testing.T) {
	n := 100
	uf := NewUnionFind(n)

	// Union all elements 0..99
	for i := 0; i < n-1; i++ {
		uf.Union(i, i+1)
	}

	if uf.GetCount() != 1 {
		t.Errorf("Count should be 1, got %d", uf.GetCount())
	}

	if !uf.Connected(0, 99) {
		t.Error("0 and 99 should be connected")
	}
}
