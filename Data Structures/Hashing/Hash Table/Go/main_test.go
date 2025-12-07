package main

import (
	"testing"
)

func TestPutAndGet(t *testing.T) {
	table := NewHashTable(16)
	table.Put("apple", 5)
	table.Put("banana", 10)

	value, found := table.Get("apple")
	if !found || value != 5 {
		t.Errorf("Expected 5, got %v", value)
	}

	value, found = table.Get("banana")
	if !found || value != 10 {
		t.Errorf("Expected 10, got %v", value)
	}
}

func TestUpdate(t *testing.T) {
	table := NewHashTable(16)
	table.Put("apple", 5)
	table.Put("apple", 10)

	value, found := table.Get("apple")
	if !found || value != 10 {
		t.Errorf("Expected 10, got %v", value)
	}

	if table.Size() != 1 {
		t.Errorf("Expected size 1, got %d", table.Size())
	}
}

func TestRemove(t *testing.T) {
	table := NewHashTable(16)
	table.Put("apple", 5)
	table.Put("banana", 10)

	if !table.Remove("apple") {
		t.Error("Expected remove to succeed")
	}

	_, found := table.Get("apple")
	if found {
		t.Error("Expected key to be removed")
	}

	if table.Size() != 1 {
		t.Errorf("Expected size 1, got %d", table.Size())
	}
}

func TestContains(t *testing.T) {
	table := NewHashTable(16)
	table.Put("apple", 5)

	if !table.Contains("apple") {
		t.Error("Expected to contain 'apple'")
	}

	if table.Contains("banana") {
		t.Error("Expected not to contain 'banana'")
	}
}

func TestEmptyTable(t *testing.T) {
	table := NewHashTable(16)
	if !table.IsEmpty() {
		t.Error("Expected table to be empty")
	}

	_, found := table.Get("key")
	if found {
		t.Error("Expected key not to be found")
	}
}

