package main

import "testing"

func TestInsertAndSearch(t *testing.T) {
	tree := NewBinaryTree()
	tree.Insert(1)
	tree.Insert(2)
	tree.Insert(3)
	if !tree.Search(1) || !tree.Search(2) || !tree.Search(3) {
		t.Error("Search failed for inserted elements")
	}
	if tree.Search(4) {
		t.Error("Search should return false for non-existent element")
	}
}

func TestIsEmpty(t *testing.T) {
	tree := NewBinaryTree()
	if !tree.IsEmpty() {
		t.Error("New tree should be empty")
	}
	tree.Insert(1)
	if tree.IsEmpty() {
		t.Error("Tree should not be empty after insert")
	}
}

func TestSize(t *testing.T) {
	tree := NewBinaryTree()
	if tree.Size() != 0 {
		t.Errorf("Expected size 0, got %d", tree.Size())
	}
	tree.Insert(1)
	tree.Insert(2)
	tree.Insert(3)
	if tree.Size() != 3 {
		t.Errorf("Expected size 3, got %d", tree.Size())
	}
}

func TestHeight(t *testing.T) {
	tree := NewBinaryTree()
	if tree.Height() != -1 {
		t.Errorf("Expected height -1 for empty tree, got %d", tree.Height())
	}
	tree.Insert(1)
	if tree.Height() != 0 {
		t.Errorf("Expected height 0 for single node, got %d", tree.Height())
	}
	tree.Insert(2)
	tree.Insert(3)
	if tree.Height() != 1 {
		t.Errorf("Expected height 1, got %d", tree.Height())
	}
}

func TestInorderTraversal(t *testing.T) {
	tree := NewBinaryTree()
	tree.Insert(1)
	tree.Insert(2)
	tree.Insert(3)
	tree.Insert(4)
	tree.Insert(5)
	result := tree.InorderTraversal()
	expected := []int{4, 2, 5, 1, 3}
	if !compareSlices(result, expected) {
		t.Errorf("Expected %v, got %v", expected, result)
	}
}

func TestPreorderTraversal(t *testing.T) {
	tree := NewBinaryTree()
	tree.Insert(1)
	tree.Insert(2)
	tree.Insert(3)
	result := tree.PreorderTraversal()
	expected := []int{1, 2, 3}
	if !compareSlices(result, expected) {
		t.Errorf("Expected %v, got %v", expected, result)
	}
}

func TestPostorderTraversal(t *testing.T) {
	tree := NewBinaryTree()
	tree.Insert(1)
	tree.Insert(2)
	tree.Insert(3)
	result := tree.PostorderTraversal()
	expected := []int{2, 3, 1}
	if !compareSlices(result, expected) {
		t.Errorf("Expected %v, got %v", expected, result)
	}
}

func TestLevelOrderTraversal(t *testing.T) {
	tree := NewBinaryTree()
	tree.Insert(1)
	tree.Insert(2)
	tree.Insert(3)
	tree.Insert(4)
	tree.Insert(5)
	result := tree.LevelOrderTraversal()
	expected := []int{1, 2, 3, 4, 5}
	if !compareSlices(result, expected) {
		t.Errorf("Expected %v, got %v", expected, result)
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

