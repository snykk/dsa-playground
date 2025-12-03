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

