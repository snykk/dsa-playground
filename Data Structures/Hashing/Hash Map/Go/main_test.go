package main

import (
	"testing"
)

func TestGetOrDefault(t *testing.T) {
	hm := NewHashMap(16)
	hm.Put("apple", 5)

	value := hm.GetOrDefault("apple", 0)
	if value != 5 {
		t.Errorf("Expected 5, got %v", value)
	}

	value = hm.GetOrDefault("nonexistent", 0)
	if value != 0 {
		t.Errorf("Expected 0, got %v", value)
	}
}

func TestPutIfAbsent(t *testing.T) {
	hm := NewHashMap(16)

	if !hm.PutIfAbsent("apple", 5) {
		t.Error("Expected put to succeed")
	}

	if hm.PutIfAbsent("apple", 10) {
		t.Error("Expected put to fail")
	}

	value, _ := hm.Get("apple")
	if value != 5 {
		t.Errorf("Expected 5, got %v", value)
	}
}

