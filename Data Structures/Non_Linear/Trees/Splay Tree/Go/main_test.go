package main

import (
	"reflect"
	"testing"
)

func TestInsertAndSearch(t *testing.T) {
	tree := NewSplayTree()
	tree.Insert(10, "ten")
	tree.Insert(5, "five")
	tree.Insert(15, "fifteen")

	value, found := tree.Search(10)
	if !found || value != "ten" {
		t.Errorf("Expected 'ten', got %s", value)
	}

	value, found = tree.Search(5)
	if !found || value != "five" {
		t.Errorf("Expected 'five', got %s", value)
	}

	value, found = tree.Search(15)
	if !found || value != "fifteen" {
		t.Errorf("Expected 'fifteen', got %s", value)
	}

	_, found = tree.Search(20)
	if found {
		t.Error("Expected key 20 not to be found")
	}
}

func TestSplayOperation(t *testing.T) {
	tree := NewSplayTree()
	tree.Insert(50, "")
	tree.Insert(30, "")
	tree.Insert(70, "")
	tree.Insert(20, "")
	tree.Insert(40, "")

	// Search for 20, should splay to root
	tree.Search(20)
	// After search, accessed node should be at root
	if tree.root.key != 20 {
		t.Errorf("Expected root key 20, got %d", tree.root.key)
	}
}

func TestDelete(t *testing.T) {
	tree := NewSplayTree()
	tree.Insert(10, "")
	tree.Insert(5, "")
	tree.Insert(15, "")
	tree.Insert(3, "")
	tree.Insert(7, "")

	if !tree.Delete(3) {
		t.Error("Expected delete to succeed")
	}

	_, found := tree.Search(3)
	if found {
		t.Error("Expected key 3 to be deleted")
	}

	if !tree.Delete(5) {
		t.Error("Expected delete to succeed")
	}

	if !tree.Delete(10) {
		t.Error("Expected delete to succeed")
	}

	if tree.Delete(100) {
		t.Error("Expected delete to fail for non-existent key")
	}
}

func TestFindMinMax(t *testing.T) {
	tree := NewSplayTree()
	tree.Insert(50, "")
	tree.Insert(30, "")
	tree.Insert(70, "")
	tree.Insert(20, "")
	tree.Insert(40, "")
	tree.Insert(60, "")
	tree.Insert(80, "")

	min, found := tree.FindMin()
	if !found || min != 20 {
		t.Errorf("Expected min 20, got %d", min)
	}

	max, found := tree.FindMax()
	if !found || max != 80 {
		t.Errorf("Expected max 80, got %d", max)
	}
}

func TestInorderTraversal(t *testing.T) {
	tree := NewSplayTree()
	keys := []int{50, 30, 70, 20, 40, 60, 80}
	for _, key := range keys {
		tree.Insert(key, "")
	}

	result := tree.InorderTraversal()
	expected := []int{20, 30, 40, 50, 60, 70, 80}

	if !reflect.DeepEqual(result, expected) {
		t.Errorf("Expected %v, got %v", expected, result)
	}
}

func TestEmptyTree(t *testing.T) {
	tree := NewSplayTree()
	if !tree.IsEmpty() {
		t.Error("Expected tree to be empty")
	}

	if tree.Size() != 0 {
		t.Errorf("Expected size 0, got %d", tree.Size())
	}

	_, found := tree.Search(10)
	if found {
		t.Error("Expected search to fail on empty tree")
	}

	_, found = tree.FindMin()
	if found {
		t.Error("Expected FindMin to fail on empty tree")
	}

	_, found = tree.FindMax()
	if found {
		t.Error("Expected FindMax to fail on empty tree")
	}

	result := tree.InorderTraversal()
	if len(result) != 0 {
		t.Error("Expected empty traversal result")
	}
}

func TestUpdateExistingKey(t *testing.T) {
	tree := NewSplayTree()
	tree.Insert(10, "old")
	tree.Insert(10, "new")

	value, found := tree.Search(10)
	if !found || value != "new" {
		t.Errorf("Expected 'new', got %s", value)
	}

	if tree.root.key != 10 {
		t.Errorf("Expected root key 10, got %d", tree.root.key)
	}
}

func TestSingleNode(t *testing.T) {
	tree := NewSplayTree()
	tree.Insert(42, "")

	if tree.IsEmpty() {
		t.Error("Expected tree not to be empty")
	}

	if tree.Size() != 1 {
		t.Errorf("Expected size 1, got %d", tree.Size())
	}

	if tree.root.key != 42 {
		t.Errorf("Expected root key 42, got %d", tree.root.key)
	}

	min, found := tree.FindMin()
	if !found || min != 42 {
		t.Errorf("Expected min 42, got %d", min)
	}

	max, found := tree.FindMax()
	if !found || max != 42 {
		t.Errorf("Expected max 42, got %d", max)
	}
}

