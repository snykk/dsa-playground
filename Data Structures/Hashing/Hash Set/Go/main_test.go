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

