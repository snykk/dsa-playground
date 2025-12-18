package main

import "testing"

func TestKMPSearch(t *testing.T) {
	tests := []struct {
		text     string
		pattern  string
		expected []int
	}{
		{"ABABDABACDABABCABC", "ABABCABC", []int{10}},
		{"AABAACAADAABAABA", "AABA", []int{0, 9, 12}},
		{"ABCDEFG", "XYZ", []int{}},
	}

	for _, tt := range tests {
		result := KMPSearch(tt.text, tt.pattern)
		if !equal(result, tt.expected) {
			t.Errorf("KMPSearch(%q, %q) = %v, expected %v", tt.text, tt.pattern, result, tt.expected)
		}
	}
}

func TestBuildLPS(t *testing.T) {
	tests := []struct {
		pattern  string
		expected []int
	}{
		{"ABABCABC", []int{0, 0, 1, 2, 0, 1, 2, 0}},
		{"AAAA", []int{0, 1, 2, 3}},
		{"ABC", []int{0, 0, 0}},
	}

	for _, tt := range tests {
		result := BuildLPS(tt.pattern)
		if !equal(result, tt.expected) {
			t.Errorf("BuildLPS(%q) = %v, expected %v", tt.pattern, result, tt.expected)
		}
	}
}

func equal(a, b []int) bool {
	if len(a) != len(b) {
		return false
	}
	for i := range a {
		if a[i] != b[i] {
			return false
		}
	}
	return true
}

