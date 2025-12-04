package main

import "testing"

func TestSearch(t *testing.T) {
	st := NewSuffixTree("banana")
	result := st.Search("ana")
	if len(result) == 0 {
		t.Error("Should find pattern 'ana'")
	}
}


