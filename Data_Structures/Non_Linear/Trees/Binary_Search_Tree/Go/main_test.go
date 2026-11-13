package main

import "testing"

func TestInsertAndSearch(t *testing.T) {
	bst := NewBinarySearchTree()
	bst.Insert(5)
	bst.Insert(3)
	bst.Insert(7)
	if !bst.Search(5) || !bst.Search(3) || !bst.Search(7) {
		t.Error("Search failed for inserted elements")
	}
	if bst.Search(4) {
		t.Error("Search should return false for non-existent element")
	}
}

func TestIsEmpty(t *testing.T) {
	bst := NewBinarySearchTree()
	if !bst.IsEmpty() {
		t.Error("New BST should be empty")
	}
	bst.Insert(1)
	if bst.IsEmpty() {
		t.Error("BST should not be empty after insert")
	}
}

func TestSize(t *testing.T) {
	bst := NewBinarySearchTree()
	if bst.Size() != 0 {
		t.Errorf("Expected size 0, got %d", bst.Size())
	}
	bst.Insert(5)
	bst.Insert(3)
	bst.Insert(7)
	if bst.Size() != 3 {
		t.Errorf("Expected size 3, got %d", bst.Size())
	}
}

func TestHeight(t *testing.T) {
	bst := NewBinarySearchTree()
	if bst.Height() != -1 {
		t.Errorf("Expected height -1 for empty tree, got %d", bst.Height())
	}
	bst.Insert(5)
	if bst.Height() != 0 {
		t.Errorf("Expected height 0 for single node, got %d", bst.Height())
	}
	bst.Insert(3)
	bst.Insert(7)
	if bst.Height() != 1 {
		t.Errorf("Expected height 1, got %d", bst.Height())
	}
}

func TestFindMin(t *testing.T) {
	bst := NewBinarySearchTree()
	bst.Insert(5)
	bst.Insert(3)
	bst.Insert(7)
	bst.Insert(1)
	min, err := bst.FindMin()
	if err != nil {
		t.Error("FindMin should not return error")
	}
	if min != 1 {
		t.Errorf("Expected min 1, got %d", min)
	}
}

func TestFindMax(t *testing.T) {
	bst := NewBinarySearchTree()
	bst.Insert(5)
	bst.Insert(3)
	bst.Insert(7)
	bst.Insert(9)
	max, err := bst.FindMax()
	if err != nil {
		t.Error("FindMax should not return error")
	}
	if max != 9 {
		t.Errorf("Expected max 9, got %d", max)
	}
}

func TestInorderTraversalSorted(t *testing.T) {
	bst := NewBinarySearchTree()
	bst.Insert(5)
	bst.Insert(2)
	bst.Insert(8)
	bst.Insert(1)
	bst.Insert(3)
	result := bst.InorderTraversal()
	expected := []int{1, 2, 3, 5, 8}
	if !compareSlices(result, expected) {
		t.Errorf("Expected %v, got %v", expected, result)
	}
}

func TestDeleteLeaf(t *testing.T) {
	bst := NewBinarySearchTree()
	bst.Insert(5)
	bst.Insert(3)
	bst.Insert(7)
	bst.Delete(3)
	if bst.Search(3) {
		t.Error("Deleted element should not be found")
	}
	if !bst.Search(5) || !bst.Search(7) {
		t.Error("Other elements should still exist")
	}
	if bst.Size() != 2 {
		t.Errorf("Expected size 2, got %d", bst.Size())
	}
}

func TestDeleteOneChild(t *testing.T) {
	bst := NewBinarySearchTree()
	bst.Insert(5)
	bst.Insert(3)
	bst.Insert(2)
	bst.Delete(3)
	if bst.Search(3) {
		t.Error("Deleted element should not be found")
	}
	if !bst.Search(2) {
		t.Error("Child element should still exist")
	}
	if bst.Size() != 2 {
		t.Errorf("Expected size 2, got %d", bst.Size())
	}
}

func TestDeleteTwoChildren(t *testing.T) {
	bst := NewBinarySearchTree()
	bst.Insert(5)
	bst.Insert(3)
	bst.Insert(7)
	bst.Insert(2)
	bst.Insert(4)
	bst.Delete(3)
	if bst.Search(3) {
		t.Error("Deleted element should not be found")
	}
	if !bst.Search(2) || !bst.Search(4) {
		t.Error("Child elements should still exist")
	}
	if bst.Size() != 4 {
		t.Errorf("Expected size 4, got %d", bst.Size())
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

