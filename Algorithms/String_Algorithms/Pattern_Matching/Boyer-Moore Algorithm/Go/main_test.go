package main

import "testing"

func TestBoyerMooreSearch(t *testing.T) {
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
		{"ABC", "", []int{}},
	}

	for _, tt := range tests {
		result := BoyerMooreSearch(tt.text, tt.pattern)
		if !equal(result, tt.expected) {
			t.Errorf("BoyerMooreSearch(%q, %q) = %v, expected %v", tt.text, tt.pattern, result, tt.expected)
		}
	}
}

func TestBuildBadCharTable(t *testing.T) {
	pattern := "ABC"
	table := buildBadCharTable(pattern)
	if table['A'] != 0 {
		t.Errorf("buildBadCharTable(%q)['A'] = %d, expected 0", pattern, table['A'])
	}
	if table['B'] != 1 {
		t.Errorf("buildBadCharTable(%q)['B'] = %d, expected 1", pattern, table['B'])
	}
	if table['C'] != 2 {
		t.Errorf("buildBadCharTable(%q)['C'] = %d, expected 2", pattern, table['C'])
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

