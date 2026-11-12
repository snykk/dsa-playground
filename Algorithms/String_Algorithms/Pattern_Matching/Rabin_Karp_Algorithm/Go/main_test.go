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
		{"aaaa", "aa", []int{0, 1, 2}},
		{"AAAAA", "AAA", []int{0, 1, 2}},
		{"xxabc", "abc", []int{2}},
		// With base 256 and mod 101, "JU" and "AB" share the hash 41: a spurious hit
		// that the character comparison must reject.
		{"XJUAB", "AB", []int{3}},
		// Bytes above 0x7F ("caf" + e-acute in UTF-8).
		{"caf\xc3\xa9 caf\xc3\xa9", "caf\xc3\xa9", []int{0, 6}},
		{"a\xff", "\xff", []int{1}},
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
