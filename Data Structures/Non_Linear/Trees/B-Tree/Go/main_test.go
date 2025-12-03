package main

import "testing"

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

