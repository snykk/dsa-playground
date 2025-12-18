package main

import "testing"

func TestManacher(t *testing.T) {
	tests := []struct {
		s        string
		expected []string // Possible valid results
		minLen   int
	}{
		{"babad", []string{"bab", "aba"}, 3},
		{"a", []string{"a"}, 1},
		{"aaaa", []string{"aaaa"}, 4},
		{"abc", []string{"a", "b", "c"}, 1},
		{"racecar", []string{"racecar"}, 7},
		{"", []string{""}, 0},
		{"aa", []string{"aa"}, 2},
	}

	for _, tt := range tests {
		result := Manacher(tt.s)
		if tt.minLen > 0 {
			if len(result) < tt.minLen {
				t.Errorf("Manacher(%q) = %q (len=%d), expected length >= %d", tt.s, result, len(result), tt.minLen)
			}
			// Check if result is in expected list
			found := false
			for _, exp := range tt.expected {
				if result == exp {
					found = true
					break
				}
			}
			if !found && len(tt.expected) > 0 && tt.expected[0] != "" {
				// For cases with multiple valid answers, just check length
				if len(result) != tt.minLen {
					t.Errorf("Manacher(%q) = %q (len=%d), expected length %d", tt.s, result, len(result), tt.minLen)
				}
			}
		} else {
			if result != tt.expected[0] {
				t.Errorf("Manacher(%q) = %q, expected %q", tt.s, result, tt.expected[0])
			}
		}
	}
}

