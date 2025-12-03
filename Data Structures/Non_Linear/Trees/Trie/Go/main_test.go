package main

import "testing"

func TestInsertAndSearch(t *testing.T) {
	trie := NewTrie()
	trie.Insert("apple")
	trie.Insert("app")
	trie.Insert("application")
	if !trie.Search("apple") || !trie.Search("app") {
		t.Error("Search failed")
	}
	if trie.Search("appl") {
		t.Error("Should return false for incomplete word")
	}
}

func TestStartsWith(t *testing.T) {
	trie := NewTrie()
	trie.Insert("apple")
	trie.Insert("app")
	if !trie.StartsWith("app") {
		t.Error("Should return true for existing prefix")
	}
	if trie.StartsWith("ban") {
		t.Error("Should return false for non-existent prefix")
	}
}

func TestIsEmpty(t *testing.T) {
	trie := NewTrie()
	if !trie.IsEmpty() {
		t.Error("New trie should be empty")
	}
	trie.Insert("test")
	if trie.IsEmpty() {
		t.Error("Trie should not be empty after insert")
	}
}

func TestGetAllWords(t *testing.T) {
	trie := NewTrie()
	words := []string{"apple", "app", "application"}
	for _, word := range words {
		trie.Insert(word)
	}
	result := trie.GetAllWords()
	if len(result) != 3 {
		t.Errorf("Expected 3 words, got %d", len(result))
	}
}

