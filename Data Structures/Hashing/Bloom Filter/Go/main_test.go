package main

import (
	"testing"
)

func TestAddAndContains(t *testing.T) {
	bf := NewBloomFilter(100, 0.01)
	bf.Add("apple")
	bf.Add("banana")

	if !bf.Contains("apple") {
		t.Error("Expected 'apple' to be found")
	}

	if !bf.Contains("banana") {
		t.Error("Expected 'banana' to be found")
	}

	if bf.Contains("nonexistent") {
		t.Error("Expected 'nonexistent' not to be found")
	}
}

