package main

import "testing"

func TestSearch(t *testing.T) {
	sa := NewSuffixArray("banana")
	result := sa.Search("ana")
	if len(result) != 2 {
		t.Errorf("Expected 2 occurrences, got %d", len(result))
	}
}

