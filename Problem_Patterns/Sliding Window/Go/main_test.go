package main

import "testing"

func TestMaxSumSubarray(t *testing.T) {
	tests := []struct {
		arr      []int
		k        int
		expected int
	}{
		{[]int{1, 4, 2, 10, 23, 3, 1, 0, 20}, 4, 39},
		{[]int{100, 200, 300, 400}, 2, 700},
		{[]int{1, 2, 3}, 5, 0},
	}

	for _, tt := range tests {
		result := maxSumSubarray(tt.arr, tt.k)
		if result != tt.expected {
			t.Errorf("maxSumSubarray(%v, %d) = %d, expected %d", tt.arr, tt.k, result, tt.expected)
		}
	}
}

func TestLongestSubstringKDistinct(t *testing.T) {
	tests := []struct {
		s        string
		k        int
		expected int
	}{
		{"eceba", 2, 3},
		{"aa", 1, 2},
		{"", 2, 0},
		{"a", 0, 0},
	}

	for _, tt := range tests {
		result := longestSubstringKDistinct(tt.s, tt.k)
		if result != tt.expected {
			t.Errorf("longestSubstringKDistinct(%s, %d) = %d, expected %d", tt.s, tt.k, result, tt.expected)
		}
	}
}

func TestMinWindowSubstring(t *testing.T) {
	tests := []struct {
		s        string
		t        string
		expected string
	}{
		{"ADOBECODEBANC", "ABC", "BANC"},
		{"a", "a", "a"},
		{"a", "aa", ""},
		{"", "a", ""},
	}

	for _, tt := range tests {
		result := minWindowSubstring(tt.s, tt.t)
		if result != tt.expected {
			t.Errorf("minWindowSubstring(%s, %s) = %s, expected %s", tt.s, tt.t, result, tt.expected)
		}
	}
}

func TestLongestSubstringNoRepeat(t *testing.T) {
	tests := []struct {
		s        string
		expected int
	}{
		{"abcabcbb", 3},
		{"bbbbb", 1},
		{"pwwkew", 3},
		{"", 0},
	}

	for _, tt := range tests {
		result := longestSubstringNoRepeat(tt.s)
		if result != tt.expected {
			t.Errorf("longestSubstringNoRepeat(%s) = %d, expected %d", tt.s, result, tt.expected)
		}
	}
}
