package main

import "testing"

func TestInsertAndSearch(t *testing.T) {
	bptree := NewBPlusTree(3)
	bptree.Insert(10, "value10")
	bptree.Insert(20, "value20")
	if bptree.Search(10) != "value10" {
		t.Error("Search failed")
	}
}

