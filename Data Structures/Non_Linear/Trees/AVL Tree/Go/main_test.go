package main

import "testing"

func TestInsertAndSearch(t *testing.T) {
	avl := NewAVLTree()
	avl.Insert(10)
	avl.Insert(20)
	avl.Insert(30)
	if !avl.Search(10) || !avl.Search(20) || !avl.Search(30) {
		t.Error("Search failed for inserted elements")
	}
	if avl.Search(40) {
		t.Error("Search should return false for non-existent element")
	}
	if !avl.IsBalanced() {
		t.Error("Tree should be balanced after insertions")
	}
}

func TestIsEmpty(t *testing.T) {
	avl := NewAVLTree()
	if !avl.IsEmpty() {
		t.Error("New AVL tree should be empty")
	}
	avl.Insert(1)
	if avl.IsEmpty() {
		t.Error("Tree should not be empty after insert")
	}
}

func TestSize(t *testing.T) {
	avl := NewAVLTree()
	if avl.Size() != 0 {
		t.Errorf("Expected size 0, got %d", avl.Size())
	}
	avl.Insert(10)
	avl.Insert(20)
	avl.Insert(30)
	if avl.Size() != 3 {
		t.Errorf("Expected size 3, got %d", avl.Size())
	}
}

func TestHeightBalanced(t *testing.T) {
	avl := NewAVLTree()
	if avl.Height() != 0 {
		t.Errorf("Expected height 0 for empty tree, got %d", avl.Height())
	}
	avl.Insert(10)
	if avl.Height() != 1 {
		t.Errorf("Expected height 1 for single node, got %d", avl.Height())
	}
	avl.Insert(20)
	avl.Insert(30)
	// After balancing, height should be 2 (not 3)
	if avl.Height() != 2 {
		t.Errorf("Expected height 2 after balancing, got %d", avl.Height())
	}
	if !avl.IsBalanced() {
		t.Error("Tree should be balanced")
	}
}

func TestFindMin(t *testing.T) {
	avl := NewAVLTree()
	avl.Insert(10)
	avl.Insert(5)
	avl.Insert(15)
	min, err := avl.FindMin()
	if err != nil {
		t.Error("FindMin should not return error")
	}
	if min != 5 {
		t.Errorf("Expected min 5, got %d", min)
	}
}

func TestFindMax(t *testing.T) {
	avl := NewAVLTree()
	avl.Insert(10)
	avl.Insert(5)
	avl.Insert(15)
	max, err := avl.FindMax()
	if err != nil {
		t.Error("FindMax should not return error")
	}
	if max != 15 {
		t.Errorf("Expected max 15, got %d", max)
	}
}

func TestInorderTraversalSorted(t *testing.T) {
	avl := NewAVLTree()
	avl.Insert(50)
	avl.Insert(30)
	avl.Insert(70)
	avl.Insert(20)
	avl.Insert(40)
	result := avl.InorderTraversal()
	expected := []int{20, 30, 40, 50, 70}
	if !compareSlices(result, expected) {
		t.Errorf("Expected %v, got %v", expected, result)
	}
	if !avl.IsBalanced() {
		t.Error("Tree should be balanced")
	}
}

func TestDeleteMaintainsBalance(t *testing.T) {
	avl := NewAVLTree()
	avl.Insert(10)
	avl.Insert(20)
	avl.Insert(30)
	avl.Insert(40)
	avl.Insert(50)
	if !avl.IsBalanced() {
		t.Error("Tree should be balanced after insertions")
	}

	avl.Delete(30)
	if avl.Search(30) {
		t.Error("Deleted element should not be found")
	}
	if !avl.IsBalanced() {
		t.Error("Tree should remain balanced after deletion")
	}

	avl.Delete(40)
	if !avl.IsBalanced() {
		t.Error("Tree should remain balanced after deletion")
	}
}

func trueHeight(t *testing.T, n *AVLNode) int {
	if n == nil {
		return 0
	}
	l, r := trueHeight(t, n.left), trueHeight(t, n.right)
	if l-r > 1 || r-l > 1 {
		t.Fatalf("node %d unbalanced: %d vs %d", n.data, l, r)
	}
	h := 1
	if l > r {
		h += l
	} else {
		h += r
	}
	if n.height != h {
		t.Fatalf("node %d stored height %d, true height %d", n.data, n.height, h)
	}
	return h
}

func TestRandomOpsKeepTrueBalance(t *testing.T) {
	avl := NewAVLTree()
	ref := map[int]bool{}
	seed := uint32(7)
	for i := 0; i < 3000; i++ {
		seed = seed*1664525 + 1013904223
		k := int((seed >> 8) % 200)
		if (seed>>4)%3 == 0 {
			avl.Delete(k)
			delete(ref, k)
		} else {
			avl.Insert(k)
			ref[k] = true
		}
		trueHeight(t, avl.root)
	}
	got := avl.InorderTraversal()
	if len(got) != len(ref) {
		t.Fatalf("size mismatch: %d vs %d", len(got), len(ref))
	}
	for i := 1; i < len(got); i++ {
		if got[i-1] >= got[i] {
			t.Fatal("inorder not strictly increasing")
		}
	}
}

func compareSlices(a, b []int) bool {
	if len(a) != len(b) {
		return false
	}
	for i := range a {
		if a[i] != b[i] {
			return false
		}
	}
	return true
}

