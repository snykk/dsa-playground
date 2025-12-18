package main

import "testing"

func TestLongestCommonSubstring(t *testing.T) {
	tests := []struct {
		s1       string
		s2       string
		expected string
		minLen   int
	}{
		{"ABABC", "BABCA", "BABC", 4},
		{"ABC", "XYZ", "", 0},
		{"ABCD", "ABCD", "ABCD", 4},
		{"ABCD", "EFGC", "C", 1},
		{"", "ABC", "", 0},
		{"", "", "", 0},
	}

	for _, tt := range tests {
		result := LongestCommonSubstring(tt.s1, tt.s2)
		if tt.minLen > 0 {
			if len(result) < tt.minLen {
				t.Errorf("LongestCommonSubstring(%q, %q) = %q (len=%d), expected length >= %d", tt.s1, tt.s2, result, len(result), tt.minLen)
			}
		} else {
			if result != tt.expected {
				t.Errorf("LongestCommonSubstring(%q, %q) = %q, expected %q", tt.s1, tt.s2, result, tt.expected)
			}
		}
	}
}

