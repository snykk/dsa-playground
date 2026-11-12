package main

import "testing"

func TestLCSLength(t *testing.T) {
	tests := []struct {
		s1, s2   string
		expected int
	}{
		{"ABCDGH", "AEDFHR", 3},
		{"ABCBDAB", "BDCAB", 4},
		{"AGGTAB", "GXTXAYB", 4},
		{"", "abc", 0},
		{"abc", "cba", 1}, // order matters
		{"AAAA", "AA", 2},
		{"abc", "abc", 3},
	}
	for _, tt := range tests {
		if got := LCSLength(tt.s1, tt.s2); got != tt.expected {
			t.Errorf("LCSLength(%q, %q) = %d, expected %d", tt.s1, tt.s2, got, tt.expected)
		}
		if got := LCSLength(tt.s2, tt.s1); got != tt.expected {
			t.Errorf("LCSLength(%q, %q) = %d, expected %d (symmetry)", tt.s2, tt.s1, got, tt.expected)
		}
	}
}
