package main

import "testing"

func TestNaivePatternSearch(t *testing.T) {
	tests := []struct {
		text     string
		pattern  string
		expected []int
	}{
		{"ABABDABACDABABCABC", "ABABCABC", []int{10}},
		{"AABAACAADAABAABA", "AABA", []int{0, 9, 12}},
		{"ABCDEFG", "XYZ", []int{}},
		{"ABC", "ABCDEF", []int{}},
		{"", "ABC", []int{}},
		{"ABC", "ABC", []int{0}},
		{"AAAAA", "A", []int{0, 1, 2, 3, 4}},
		{"ABC", "", []int{}},
		{"aaaa", "aa", []int{0, 1, 2}},
		{"xxabc", "abc", []int{2}},
	}

	for _, tt := range tests {
		result := NaivePatternSearch(tt.text, tt.pattern)
		if !equal(result, tt.expected) {
			t.Errorf("NaivePatternSearch(%q, %q) = %v, expected %v", tt.text, tt.pattern, result, tt.expected)
		}
	}
}

func TestNaivePatternSearchCount(t *testing.T) {
	tests := []struct {
		text     string
		pattern  string
		expected int
	}{
		{"AABAACAADAABAABA", "AABA", 3},
		{"ABCDEFG", "XYZ", 0},
		{"AAAAA", "A", 5},
	}

	for _, tt := range tests {
		result := NaivePatternSearchCount(tt.text, tt.pattern)
		if result != tt.expected {
			t.Errorf("NaivePatternSearchCount(%q, %q) = %d, expected %d", tt.text, tt.pattern, result, tt.expected)
		}
	}
}

func TestNaivePatternSearchFirst(t *testing.T) {
	tests := []struct {
		text     string
		pattern  string
		expected int
	}{
		{"AABAACAADAABAABA", "AABA", 0},
		{"ABCDEF", "XYZ", -1},
		{"ABABDABACDABABCABC", "ABABCABC", 10},
	}

	for _, tt := range tests {
		result := NaivePatternSearchFirst(tt.text, tt.pattern)
		if result != tt.expected {
			t.Errorf("NaivePatternSearchFirst(%q, %q) = %d, expected %d", tt.text, tt.pattern, result, tt.expected)
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
