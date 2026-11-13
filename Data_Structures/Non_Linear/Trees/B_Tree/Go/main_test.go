package main

import (
	"math/rand"
	"reflect"
	"sort"
	"testing"
)

// checkNode returns the leaf depth below node, failing the test on any
// broken invariant (fill bounds, key order, equal leaf depth).
func checkNode(t *testing.T, bt *BTree, node *BTreeNode, isRoot bool, lo, hi *int) int {
	t.Helper()
	n := len(node.keys)
	if n > bt.maxKeys || (!isRoot && n < bt.minKeys) || (isRoot && !node.isLeaf && n < 1) {
		t.Fatalf("bad key count %d", n)
	}
	for i, k := range node.keys {
		if i > 0 && node.keys[i-1] > k {
			t.Fatalf("keys out of order: %v", node.keys)
		}
		if (lo != nil && k < *lo) || (hi != nil && k > *hi) {
			t.Fatalf("key %d outside its separators", k)
		}
	}
	if node.isLeaf {
		if len(node.children) != 0 {
			t.Fatal("leaf has children")
		}
		return 0
	}
	if len(node.children) != n+1 {
		t.Fatalf("%d keys but %d children", n, len(node.children))
	}
	depth := -1
	for i, child := range node.children {
		cLo, cHi := lo, hi
		if i > 0 {
			cLo = &node.keys[i-1]
		}
		if i < n {
			cHi = &node.keys[i]
		}
		d := checkNode(t, bt, child, false, cLo, cHi)
		if depth == -1 {
			depth = d
		} else if depth != d {
			t.Fatal("leaves at different depths")
		}
	}
	return depth + 1
}

func checkTree(t *testing.T, bt *BTree) {
	t.Helper()
	checkNode(t, bt, bt.root, true, nil, nil)
}

func TestInsertAndSearch(t *testing.T) {
	btree := NewBTree(3)
	btree.Insert(10)
	btree.Insert(20)
	btree.Insert(5)
	if !btree.Search(10) || !btree.Search(20) {
		t.Error("Search failed")
	}
	if btree.Search(99) {
		t.Error("Should return false for non-existent key")
	}
}

// Regression: the first split (6th insert with t=3) used to panic.
func TestSplitDoesNotPanic(t *testing.T) {
	for deg := 2; deg <= 4; deg++ {
		btree := NewBTree(deg)
		for k := 1; k <= 100; k++ {
			btree.Insert(k)
		}
		checkTree(t, btree)
		got := btree.Traverse()
		if len(got) != 100 || got[0] != 1 || got[99] != 100 {
			t.Fatalf("t=%d: lost keys, got %d", deg, len(got))
		}
	}
}

func TestDeleteMiddleChildMerge(t *testing.T) {
	btree := NewBTree(3)
	for k := 1; k <= 12; k++ {
		btree.Insert(k)
	}
	if !btree.Delete(4) || btree.Search(4) || btree.Delete(4) {
		t.Fatal("delete of 4 misbehaved")
	}
	checkTree(t, btree)
	if len(btree.Traverse()) != 11 {
		t.Fatal("expected 11 keys")
	}
}

func TestRandomAgainstSet(t *testing.T) {
	for deg := 2; deg <= 4; deg++ {
		rng := rand.New(rand.NewSource(int64(deg)))
		btree := NewBTree(deg)
		ref := map[int]bool{}
		sorted := func() []int {
			out := []int{}
			for k := range ref {
				out = append(out, k)
			}
			sort.Ints(out)
			return out
		}
		for step := 0; step < 3000; step++ {
			key := rng.Intn(150)
			op := rng.Intn(10)
			switch {
			case op < 5:
				if !ref[key] {
					btree.Insert(key)
					ref[key] = true
				}
			case op < 9:
				if btree.Delete(key) != ref[key] {
					t.Fatalf("delete(%d) result mismatch", key)
				}
				delete(ref, key)
			default:
				if btree.Search(key) != ref[key] {
					t.Fatalf("search(%d) mismatch", key)
				}
			}
			if step%50 == 0 {
				checkTree(t, btree)
				if !reflect.DeepEqual(btree.Traverse(), sorted()) {
					t.Fatal("traverse mismatch")
				}
			}
		}
		for _, k := range sorted() {
			if !btree.Delete(k) {
				t.Fatalf("delete(%d) failed", k)
			}
			delete(ref, k)
			checkTree(t, btree)
		}
		if len(btree.Traverse()) != 0 {
			t.Fatal("tree should be empty")
		}
	}
}
