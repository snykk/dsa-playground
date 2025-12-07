package main

import (
	"testing"
)

func TestChaining(t *testing.T) {
	table := NewHashTableChaining(16)
	table.Put("apple", 5)
	table.Put("banana", 10)

	value, found := table.Get("apple")
	if !found || value != 5 {
		t.Errorf("Expected 5, got %v", value)
	}
}

func TestOpenAddressing(t *testing.T) {
	table := NewHashTableOpenAddressing(16)
	table.Put("apple", 5)
	table.Put("banana", 10)

	value, found := table.Get("apple")
	if !found || value != 5 {
		t.Errorf("Expected 5, got %v", value)
	}
}

