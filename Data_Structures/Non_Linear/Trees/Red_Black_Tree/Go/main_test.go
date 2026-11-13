package main

import (
	"math/rand"
	"testing"
)

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


func TestInvariantsRandom(t *testing.T) {
	rng := rand.New(rand.NewSource(7))
	for trial := 0; trial < 50; trial++ {
		rbt := NewRedBlackTree()
		n := 1 + rng.Intn(200)
		for i := 0; i < n; i++ {
			rbt.Insert(rng.Intn(60)) // many duplicates on purpose
			if msg := rbt.checkInvariants(); msg != "" {
				t.Fatalf("trial %d after %d inserts: %s", trial, i+1, msg)
			}
		}
		if rbt.Size() != n {
			t.Fatalf("size %d, want %d", rbt.Size(), n)
		}
		out := rbt.InorderTraversal()
		for i := 1; i < len(out); i++ {
			if out[i-1] > out[i] {
				t.Fatal("inorder not sorted")
			}
		}
	}
}

func TestSortedInsertKeepsInvariants(t *testing.T) {
	rbt := NewRedBlackTree()
	for i := 0; i < 10000; i++ {
		rbt.Insert(i)
	}
	if msg := rbt.checkInvariants(); msg != "" {
		t.Fatal(msg)
	}
	if rbt.Size() != 10000 {
		t.Fatalf("size %d", rbt.Size())
	}
}
