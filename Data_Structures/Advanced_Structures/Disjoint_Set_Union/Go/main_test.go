package main

import (
	"math/rand"
	"reflect"
	"sort"
	"testing"
)

func TestInitialization(t *testing.T) {
	dsu := NewDSU(5)
	if dsu.GetComponentCount() != 5 {
		t.Errorf("Expected 5 components, got %d", dsu.GetComponentCount())
	}
	for i := 0; i < 5; i++ {
		if dsu.Find(i) != i {
			t.Errorf("Expected find(%d) == %d, got %d", i, i, dsu.Find(i))
		}
		if dsu.GetSize(i) != 1 {
			t.Errorf("Expected size(%d) == 1, got %d", i, dsu.GetSize(i))
		}
	}
}

func TestSingleElement(t *testing.T) {
	dsu := NewDSU(1)
	if dsu.GetComponentCount() != 1 {
		t.Errorf("Expected 1 component, got %d", dsu.GetComponentCount())
	}
	if dsu.Find(0) != 0 {
		t.Errorf("Expected find(0) == 0")
	}
	if dsu.GetSize(0) != 1 {
		t.Errorf("Expected size(0) == 1")
	}
}

func TestUnionTwoElements(t *testing.T) {
	dsu := NewDSU(5)
	merged := dsu.Union(0, 1)
	if !merged {
		t.Error("Expected union to succeed")
	}
	if dsu.GetComponentCount() != 4 {
		t.Errorf("Expected 4 components, got %d", dsu.GetComponentCount())
	}
	if !dsu.Connected(0, 1) {
		t.Error("0 and 1 should be connected")
	}
	if dsu.GetSize(0) != 2 {
		t.Errorf("Expected size 2, got %d", dsu.GetSize(0))
	}
}

func TestUnionAlreadySameSet(t *testing.T) {
	dsu := NewDSU(5)
	dsu.Union(0, 1)
	merged := dsu.Union(0, 1)
	if merged {
		t.Error("Expected union to return false for same set")
	}
	if dsu.GetComponentCount() != 4 {
		t.Errorf("Expected 4 components, got %d", dsu.GetComponentCount())
	}
}

func TestMultipleUnionsLargerSet(t *testing.T) {
	dsu := NewDSU(6)
	dsu.Union(0, 1)
	dsu.Union(2, 3)
	dsu.Union(1, 3)

	if !dsu.Connected(0, 2) {
		t.Error("0 and 2 should be connected")
	}
	if !dsu.Connected(0, 3) {
		t.Error("0 and 3 should be connected")
	}
	if !dsu.Connected(1, 2) {
		t.Error("1 and 2 should be connected")
	}
	if dsu.GetComponentCount() != 3 {
		t.Errorf("Expected 3 components, got %d", dsu.GetComponentCount())
	}
	if dsu.GetSize(0) != 4 {
		t.Errorf("Expected size 4, got %d", dsu.GetSize(0))
	}
}

func TestAllInOneSet(t *testing.T) {
	dsu := NewDSU(4)
	dsu.Union(0, 1)
	dsu.Union(1, 2)
	dsu.Union(2, 3)

	if dsu.GetComponentCount() != 1 {
		t.Errorf("Expected 1 component, got %d", dsu.GetComponentCount())
	}
	for i := 0; i < 4; i++ {
		for j := 0; j < 4; j++ {
			if !dsu.Connected(i, j) {
				t.Errorf("%d and %d should be connected", i, j)
			}
		}
	}
	if dsu.GetSize(0) != 4 {
		t.Errorf("Expected size 4, got %d", dsu.GetSize(0))
	}
}

func TestPathCompression(t *testing.T) {
	dsu := NewDSU(5)
	// union by rank: {0,1} and {2,3}, then roots 0 and 2 -> 2 hangs under 0
	dsu.Union(0, 1)
	dsu.Union(2, 3)
	dsu.Union(0, 2)
	if dsu.GetParent(3) != 2 {
		t.Errorf("Before find, parent of 3 should be 2, got %d", dsu.GetParent(3))
	}
	if dsu.Find(3) != 0 {
		t.Error("Find(3) should return the root 0")
	}
	if dsu.GetParent(3) != 0 {
		t.Error("After find, 3 should point directly to the root")
	}
}

func TestConnected(t *testing.T) {
	dsu := NewDSU(3)
	if dsu.Connected(0, 1) {
		t.Error("0 and 1 should not be connected initially")
	}
	if !dsu.Connected(0, 0) {
		t.Error("0 should be connected to itself")
	}

	dsu.Union(0, 2)
	if !dsu.Connected(0, 2) {
		t.Error("0 and 2 should be connected")
	}
	if dsu.Connected(0, 1) {
		t.Error("0 and 1 should not be connected")
	}
}

func TestComponentCountDecreases(t *testing.T) {
	dsu := NewDSU(5)
	expected := []int{5, 4, 3, 2, 1}
	pairs := [][2]int{{0, 1}, {2, 3}, {0, 2}, {0, 4}}

	if dsu.GetComponentCount() != expected[0] {
		t.Errorf("Expected %d, got %d", expected[0], dsu.GetComponentCount())
	}
	for i, p := range pairs {
		dsu.Union(p[0], p[1])
		if dsu.GetComponentCount() != expected[i+1] {
			t.Errorf("After union(%d,%d): expected %d, got %d", p[0], p[1], expected[i+1], dsu.GetComponentCount())
		}
	}

	// Redundant union should not change count
	dsu.Union(1, 3)
	if dsu.GetComponentCount() != 1 {
		t.Errorf("Expected 1 after redundant union, got %d", dsu.GetComponentCount())
	}
}

func TestGetComponents(t *testing.T) {
	dsu := NewDSU(5)
	dsu.Union(0, 1)
	dsu.Union(2, 3)

	components := dsu.GetComponents()
	if len(components) != 3 {
		t.Errorf("Expected 3 components, got %d", len(components))
	}

	sizes := make([]int, 0)
	for _, members := range components {
		sizes = append(sizes, len(members))
	}
	sort.Ints(sizes)
	if sizes[0] != 1 || sizes[1] != 2 || sizes[2] != 2 {
		t.Errorf("Expected sizes [1,2,2], got %v", sizes)
	}
}

func TestGetComponentsSingle(t *testing.T) {
	dsu := NewDSU(3)
	dsu.Union(0, 1)
	dsu.Union(1, 2)

	components := dsu.GetComponents()
	if len(components) != 1 {
		t.Errorf("Expected 1 component, got %d", len(components))
	}
	for _, members := range components {
		sort.Ints(members)
		if len(members) != 3 || members[0] != 0 || members[1] != 1 || members[2] != 2 {
			t.Errorf("Expected [0,1,2], got %v", members)
		}
	}
}

func TestGetSize(t *testing.T) {
	dsu := NewDSU(5)
	dsu.Union(0, 1)
	if dsu.GetSize(0) != 2 || dsu.GetSize(1) != 2 {
		t.Error("Expected size 2 after first union")
	}

	dsu.Union(2, 3)
	dsu.Union(0, 2)
	if dsu.GetSize(0) != 4 || dsu.GetSize(3) != 4 {
		t.Error("Expected size 4 after merging two pairs")
	}
	if dsu.GetSize(4) != 1 {
		t.Errorf("Expected size 1 for element 4, got %d", dsu.GetSize(4))
	}
}

// Random union/connected sequences checked against a label array.
func TestAgainstBruteForce(t *testing.T) {
	rng := rand.New(rand.NewSource(7))
	for round := 0; round < 200; round++ {
		n := 1 + rng.Intn(12)
		dsu := NewDSU(n)
		label := make([]int, n)
		for i := range label {
			label[i] = i
		}
		for k := rng.Intn(40); k > 0; k-- {
			x, y := rng.Intn(n), rng.Intn(n)
			if rng.Intn(10) < 6 {
				merged := label[x] != label[y]
				if dsu.Union(x, y) != merged {
					t.Fatalf("Union(%d, %d) result mismatch", x, y)
				}
				oldL, newL := label[y], label[x]
				for i := range label {
					if label[i] == oldL {
						label[i] = newL
					}
				}
			} else if dsu.Connected(x, y) != (label[x] == label[y]) {
				t.Fatalf("Connected(%d, %d) mismatch", x, y)
			}
			distinct := map[int]int{}
			for _, v := range label {
				distinct[v]++
			}
			if dsu.GetComponentCount() != len(distinct) || dsu.GetSize(x) != distinct[label[x]] {
				t.Fatalf("count or size mismatch")
			}
		}
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
	if uf.GetCount() != 1 || uf.Find(7) != 0 {
		t.Error("one set rooted at 0 expected")
	}
	if want := []int{0, 0, 0, 2, 0, 4, 0, 0}; !reflect.DeepEqual(uf.parent, want) {
		t.Errorf("parent after Find(7) = %v, want %v", uf.parent, want)
	}
}

func TestLongChainOfUnions(t *testing.T) {
	const n = 1000000
	uf := NewDSU(n)
	for i := 0; i+1 < n; i++ {
		uf.Union(i, i+1)
	}
	if uf.GetComponentCount() != 1 || !uf.Connected(0, n-1) {
		t.Error("all elements should be in one set")
	}
}

func TestGraphApplications(t *testing.T) {
	edges := [][]int{{0, 1}, {1, 2}, {3, 4}}
	if want := [][]int{{0, 1, 2}, {3, 4}}; !reflect.DeepEqual(ConnectedComponents(edges, 5), want) {
		t.Errorf("components = %v, want %v", ConnectedComponents(edges, 5), want)
	}
	if HasCycle(edges, 5) {
		t.Error("forest must not have a cycle")
	}
	if !HasCycle([][]int{{0, 1}, {1, 2}, {2, 0}}, 3) || !HasCycle([][]int{{0, 0}}, 1) {
		t.Error("cycle and self-loop must be detected")
	}
	mst := KruskalMST([][]int{{0, 1, 4}, {0, 2, 8}, {1, 2, 2}, {1, 3, 5}, {2, 3, 10}}, 4)
	total := 0
	for _, e := range mst {
		total += e[2]
	}
	if len(mst) != 3 || total != 11 {
		t.Errorf("MST = %v, want 3 edges of weight 11", mst)
	}
}
