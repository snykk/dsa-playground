package main

import "testing"

func TestRabinKarpSearch(t *testing.T) {
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
		result := RabinKarpSearch(tt.text, tt.pattern)
		if !equal(result, tt.expected) {
			t.Errorf("RabinKarpSearch(%q, %q) = %v, expected %v", tt.text, tt.pattern, result, tt.expected)
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

