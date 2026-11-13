package main

import "testing"

func TestLongestCommonSubstring(t *testing.T) {
	tests := []struct {
		s1       string
		s2       string
		expected string
	}{
		{"ABABC", "BABCA", "BABC"},
		{"ABC", "XYZ", ""},
		{"ABCD", "ABCD", "ABCD"},
		{"ABCD", "EFGC", "C"},
		{"", "ABC", ""},
		{"", "", ""},
		{"abcxyz", "xyzabc", "abc"}, // tie: the one that ends first in s1 wins
		{"aaaa", "aa", "aa"},
		{"abcde", "ace", "a"}, // "ace" is a subsequence, not a substring
	}

	for _, tt := range tests {
		result := LongestCommonSubstring(tt.s1, tt.s2)
		if result != tt.expected {
			t.Errorf("LongestCommonSubstring(%q, %q) = %q, expected %q", tt.s1, tt.s2, result, tt.expected)
		}
	}
}
