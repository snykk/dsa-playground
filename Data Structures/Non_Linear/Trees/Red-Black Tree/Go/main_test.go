package main

import "testing"

func TestInsertAndSearch(t *testing.T) {
	rbt := NewRedBlackTree()
	rbt.Insert(10)
	rbt.Insert(20)
	rbt.Insert(30)
	if !rbt.Search(10) || !rbt.Search(20) || !rbt.Search(30) {
		t.Error("Search failed")
	}
	if rbt.Search(40) {
		t.Error("Should return false for non-existent element")
	}
}

func TestIsEmpty(t *testing.T) {
	rbt := NewRedBlackTree()
	if !rbt.IsEmpty() {
		t.Error("New tree should be empty")
	}
	rbt.Insert(1)
	if rbt.IsEmpty() {
		t.Error("Tree should not be empty after insert")
	}
}

func TestSize(t *testing.T) {
	rbt := NewRedBlackTree()
	if rbt.Size() != 0 {
		t.Errorf("Expected size 0, got %d", rbt.Size())
	}
	rbt.Insert(10)
	rbt.Insert(20)
	rbt.Insert(30)
	if rbt.Size() != 3 {
		t.Errorf("Expected size 3, got %d", rbt.Size())
	}
}

