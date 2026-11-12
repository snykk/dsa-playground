package main

import (
	"reflect"
	"testing"
)

func TestSearch(t *testing.T) {
	sa := NewSuffixArray("banana")
	tests := []struct {
		pattern string
		want    []int
	}{
		{"ana", []int{1, 3}},
		{"a", []int{1, 3, 5}},
		{"nan", []int{2}},
		{"xyz", []int{}},
		{"bananas", []int{}},
		{"", []int{0, 1, 2, 3, 4, 5}},
	}
	for _, tt := range tests {
		if got := sa.Search(tt.pattern); !reflect.DeepEqual(got, tt.want) {
			t.Errorf("Search(%q) = %v, want %v", tt.pattern, got, tt.want)
		}
	}
}

func TestSuffixOrder(t *testing.T) {
	sa := NewSuffixArray("banana")
	want := []int{5, 3, 1, 0, 4, 2}
	if !reflect.DeepEqual(sa.suffixArray, want) {
		t.Errorf("suffixArray = %v, want %v", sa.suffixArray, want)
	}
}

func TestEmptyText(t *testing.T) {
	sa := NewSuffixArray("")
	if got := sa.Search("a"); len(got) != 0 {
		t.Errorf("Search on empty text = %v, want empty", got)
	}
}
