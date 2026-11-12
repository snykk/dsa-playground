package main

import (
	"reflect"
	"sort"
	"testing"
)

func TestBuildSuffixArray(t *testing.T) {
	text := "banana"
	sa := BuildSuffixArray(text)
	if len(sa) != 6 {
		t.Errorf("BuildSuffixArray(%q) length = %d, expected 6", text, len(sa))
	}

	// Verify all indices are present
	found := make([]bool, 6)
	for _, idx := range sa {
		if idx < 0 || idx >= 6 {
			t.Errorf("BuildSuffixArray(%q) contains invalid index %d", text, idx)
		}
		found[idx] = true
	}
	for i, f := range found {
		if !f {
			t.Errorf("BuildSuffixArray(%q) missing index %d", text, i)
		}
	}
}

func TestSearchPattern(t *testing.T) {
	text := "banana"
	sa := BuildSuffixArray(text)
	pattern := "ana"
	result := SearchPattern(sa, text, pattern)
	if len(result) != 2 {
		t.Errorf("SearchPattern(%q, %q) length = %d, expected 2", text, pattern, len(result))
	}

	// Verify indices are correct
	sort.Ints(result)
	if result[0] != 1 && result[0] != 3 {
		t.Errorf("SearchPattern(%q, %q) first index = %d, expected 1 or 3", text, pattern, result[0])
	}
}

func TestSearchPatternNotFound(t *testing.T) {
	text := "banana"
	sa := BuildSuffixArray(text)
	pattern := "xyz"
	result := SearchPattern(sa, text, pattern)
	if len(result) != 0 {
		t.Errorf("SearchPattern(%q, %q) length = %d, expected 0", text, pattern, len(result))
	}
}

func TestSearchPatternSingleChar(t *testing.T) {
	text := "banana"
	sa := BuildSuffixArray(text)
	pattern := "a"
	result := SearchPattern(sa, text, pattern)
	if len(result) != 3 {
		t.Errorf("SearchPattern(%q, %q) length = %d, expected 3", text, pattern, len(result))
	}
}

func TestEmptyString(t *testing.T) {
	text := ""
	sa := BuildSuffixArray(text)
	if len(sa) != 0 {
		t.Errorf("BuildSuffixArray(%q) length = %d, expected 0", text, len(sa))
	}
}

func TestBananaOrderAndExactResults(t *testing.T) {
	text := "banana"
	sa := BuildSuffixArray(text)
	if want := []int{5, 3, 1, 0, 4, 2}; !reflect.DeepEqual(sa, want) {
		t.Errorf("BuildSuffixArray(%q) = %v, want %v", text, sa, want)
	}
	tests := []struct {
		pattern string
		want    []int
	}{
		{"ana", []int{1, 3}},
		{"a", []int{1, 3, 5}},
		{"bananas", nil},
		{"", []int{0, 1, 2, 3, 4, 5}}, // the empty pattern is a prefix of every suffix
	}
	for _, tt := range tests {
		got := SearchPattern(sa, text, tt.pattern)
		if len(got) != len(tt.want) || (len(got) > 0 && !reflect.DeepEqual(got, tt.want)) {
			t.Errorf("SearchPattern(%q, %q) = %v, want %v", text, tt.pattern, got, tt.want)
		}
	}
	aaaa := BuildSuffixArray("aaaa")
	if got := SearchPattern(aaaa, "aaaa", "aa"); !reflect.DeepEqual(got, []int{0, 1, 2}) {
		t.Errorf("overlapping matches = %v, want [0 1 2]", got)
	}
}
