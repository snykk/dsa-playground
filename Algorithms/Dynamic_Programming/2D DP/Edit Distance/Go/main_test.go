package main

import "testing"

func TestEditDistance(t *testing.T) {
	if EditDistance("kitten", "sitting") != 3 {
		t.Error("Expected 3")
	}

	tests := []struct {
		s1, s2   string
		expected int
	}{
		{"horse", "ros", 3},
		{"intention", "execution", 5},
		{"sunday", "saturday", 3},
		{"flaw", "lawn", 2},
		{"cat", "feline", 6}, // no shared letters
		{"", "", 0},          // both empty
		{"abc", "", 3},       // delete everything
		{"", "abc", 3},       // insert everything
		{"abc", "abc", 0},    // identical
		{"a", "b", 1},        // one replacement
		{"ab", "ba", 2},      // no transpositions in Levenshtein
	}
	for _, tt := range tests {
		if got := EditDistance(tt.s1, tt.s2); got != tt.expected {
			t.Errorf("EditDistance(%q, %q) = %d, expected %d", tt.s1, tt.s2, got, tt.expected)
		}
		if got := EditDistance(tt.s2, tt.s1); got != tt.expected {
			t.Errorf("EditDistance(%q, %q) = %d, expected %d (symmetry)", tt.s2, tt.s1, got, tt.expected)
		}
	}
}
