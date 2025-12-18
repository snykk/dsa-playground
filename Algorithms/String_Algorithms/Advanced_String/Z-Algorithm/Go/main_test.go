package main

import "testing"

func TestZAlgorithmSearch(t *testing.T) {
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
		result := ZAlgorithmSearch(tt.text, tt.pattern)
		if !equal(result, tt.expected) {
			t.Errorf("ZAlgorithmSearch(%q, %q) = %v, expected %v", tt.text, tt.pattern, result, tt.expected)
		}
	}
}

func TestBuildZArray(t *testing.T) {
	s := "aabxaabxcaabxaabxay"
	z := buildZArray(s)
	if z[0] != 0 {
		t.Errorf("buildZArray(%q)[0] = %d, expected 0", s, z[0])
	}
	if z[1] <= 0 {
		t.Errorf("buildZArray(%q)[1] = %d, expected > 0", s, z[1])
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

