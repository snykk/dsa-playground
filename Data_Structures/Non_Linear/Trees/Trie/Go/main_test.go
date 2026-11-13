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

func TestDeleteReturnValueAndPruning(t *testing.T) {
	trie := NewTrie()
	trie.Insert("apple")
	trie.Insert("app")
	trie.Insert("dog")
	if !trie.Delete("apple") {
		t.Error("Delete(apple) should report true")
	}
	if trie.Search("apple") || !trie.Search("app") {
		t.Error("apple should be gone and app should remain")
	}
	if trie.Delete("apple") || trie.Delete("appl") || trie.Delete("cat") {
		t.Error("deleting an absent word or a bare prefix should report false")
	}
	if trie.StartsWith("appl") {
		t.Error("unused nodes should be pruned")
	}
	if !trie.Delete("app") || !trie.Delete("dog") {
		t.Error("remaining words should delete")
	}
	if !trie.IsEmpty() {
		t.Error("trie should be empty again")
	}
}

func TestDeleteNonASCII(t *testing.T) {
	trie := NewTrie()
	trie.Insert("caf\u00e9")
	trie.Insert("x")
	if !trie.Delete("caf\u00e9") {
		t.Error("Delete(cafe with accent) should report true")
	}
	if trie.Search("caf\u00e9") || !trie.Search("x") {
		t.Error("the accented word should be gone and x should remain")
	}
}

func TestEmptyWordAndCount(t *testing.T) {
	trie := NewTrie()
	trie.Insert("")
	if trie.CountWords() != 1 || trie.IsEmpty() || !trie.Search("") {
		t.Error("the empty word is a stored word")
	}
	if !trie.Delete("") || !trie.IsEmpty() {
		t.Error("deleting the empty word should empty the trie")
	}
}
