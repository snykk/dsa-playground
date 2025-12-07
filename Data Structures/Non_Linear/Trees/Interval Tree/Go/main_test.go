package main

import (
	"testing"
)

func TestInsertAndSearch(t *testing.T) {
	tree := NewIntervalTree()
	tree.Insert(NewInterval(15, 20))
	tree.Insert(NewInterval(10, 30))
	tree.Insert(NewInterval(17, 19))

	result := tree.SearchOverlapping(NewInterval(14, 16))
	if len(result) == 0 {
		t.Error("Expected to find overlapping intervals")
	}
}

func TestSearchPoint(t *testing.T) {
	tree := NewIntervalTree()
	tree.Insert(NewInterval(10, 20))
	tree.Insert(NewInterval(15, 25))

	result := tree.SearchContainingPoint(15)
	if len(result) == 0 {
		t.Error("Expected to find intervals containing point 15")
	}
}

func TestEmptyTree(t *testing.T) {
	tree := NewIntervalTree()
	if !tree.IsEmpty() {
		t.Error("Expected tree to be empty")
	}

	result := tree.SearchOverlapping(NewInterval(10, 20))
	if len(result) != 0 {
		t.Error("Expected empty result from empty tree")
	}
}

