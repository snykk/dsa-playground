package main

import (
	"testing"
)

func TestAdd(t *testing.T) {
	set := NewHashSet(16)
	if !set.Add("apple") {
		t.Error("Expected add to succeed")
	}
	if set.Add("apple") {
		t.Error("Expected duplicate add to fail")
	}
	if set.Size() != 1 {
		t.Errorf("Expected size 1, got %d", set.Size())
	}
}

func TestRemove(t *testing.T) {
	set := NewHashSet(16)
	set.Add("apple")

	if !set.Remove("apple") {
		t.Error("Expected remove to succeed")
	}
	if set.Contains("apple") {
		t.Error("Expected element to be removed")
	}
}

func TestResizeKeepsElements(t *testing.T) {
	// The set used to ignore its load factor: many adds stayed in 16 buckets.
	set := NewHashSet(4)
	for k := 0; k < 1000; k++ {
		if !set.Add(k) {
			t.Fatalf("Add(%d) reported a duplicate", k)
		}
	}
	if set.capacity <= 4 || float64(set.Size())/float64(set.capacity) > 0.75 {
		t.Errorf("capacity %d for %d elements", set.capacity, set.Size())
	}
	for k := 0; k < 1000; k++ {
		if !set.Contains(k) {
			t.Fatalf("lost %d", k)
		}
	}
	if set.Add(500) {
		t.Error("duplicate add should fail")
	}
}

func TestNegativeAndOtherKeys(t *testing.T) {
	// Negative ints gave a negative index, and other key types panicked.
	set := NewHashSet(8)
	keys := []interface{}{-1, -9, int64(7), 2.5, true}
	for _, k := range keys {
		if !set.Add(k) {
			t.Errorf("Add(%v) failed", k)
		}
	}
	for _, k := range keys {
		if !set.Contains(k) {
			t.Errorf("Contains(%v) = false", k)
		}
	}
	if set.Contains(7) {
		t.Error("int 7 is not int64 7")
	}
}

func TestChainLongerThanOneAndClear(t *testing.T) {
	set := NewHashSet(16)
	for _, k := range []int{0, 16, 32, 48} {
		set.Add(k)
	}
	if len(set.buckets[0]) != 4 {
		t.Fatalf("bucket 0 holds %d, want 4", len(set.buckets[0]))
	}
	if !set.Remove(16) || set.Contains(16) || !set.Contains(48) {
		t.Error("remove inside a chain failed")
	}
	set.Clear()
	if !set.IsEmpty() || set.Contains(48) {
		t.Error("Clear should empty the set")
	}
}
