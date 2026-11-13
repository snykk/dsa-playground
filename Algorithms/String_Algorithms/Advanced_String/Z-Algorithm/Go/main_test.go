package main

import "testing"

func TestZAlgorithmSearch(t *testing.T) {
	tests := []struct {
		name     string
		text     string
		pattern  string
		expected []int
	}{
		{"basic match", "ABABDABACDABABCABC", "ABABCABC", []int{10}},
		{"multiple occurrences", "AABAACAADAABAABA", "AABA", []int{0, 9, 12}},
		{"no match", "ABCDEFG", "XYZ", []int{}},
		{"pattern longer than text", "ABC", "ABCDEF", []int{}},
		{"empty text", "", "ABC", []int{}},
		{"empty pattern", "ABC", "", []int{}},
		{"overlapping matches", "aaaa", "aaa", []int{0, 1}},
		{"pattern at end", "hellohello", "hello", []int{0, 5}},
		{"single char pattern", "banana", "a", []int{1, 3, 5}},
		{"whole text matches", "abc", "abc", []int{0}},
		{"repeating pattern", "abababab", "ab", []int{0, 2, 4, 6}},
		// Regression: with '$' in the input, z[i] can run past the separator
		// (z[i] > m); the old z[i] == m test dropped these matches.
		{"separator in text", "a$a", "a", []int{0, 2}},
		{"separator as pattern", "$$", "$", []int{0, 1}},
		{"match followed by separator", "ab$ab", "ab", []int{0, 3}},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := ZAlgorithmSearch(tt.text, tt.pattern)
			if !equal(result, tt.expected) {
				t.Errorf("ZAlgorithmSearch(%q, %q) = %v, expected %v",
					tt.text, tt.pattern, result, tt.expected)
			}
		})
	}
}

func TestBuildZArray(t *testing.T) {
	t.Run("empty string", func(t *testing.T) {
		if z := buildZArray(""); len(z) != 0 {
			t.Errorf("expected empty slice, got %v", z)
		}
	})

	t.Run("single character", func(t *testing.T) {
		z := buildZArray("a")
		if len(z) != 1 || z[0] != 0 {
			t.Errorf("expected [0], got %v", z)
		}
	})

	t.Run("all same characters", func(t *testing.T) {
		// For "aaaa" expect Z = [0, 3, 2, 1]
		got := buildZArray("aaaa")
		want := []int{0, 3, 2, 1}
		if !equal(got, want) {
			t.Errorf("buildZArray(\"aaaa\") = %v, want %v", got, want)
		}
	})

	t.Run("classic example", func(t *testing.T) {
		z := buildZArray("aabxaabxcaabxaabxay")
		if z[0] != 0 || z[4] != 4 || z[9] != 8 {
			t.Errorf("unexpected Z values: z[0]=%d z[4]=%d z[9]=%d (want 0,4,8)",
				z[0], z[4], z[9])
		}
	})

	t.Run("no repetition", func(t *testing.T) {
		z := buildZArray("abcdef")
		for i, v := range z {
			if v != 0 {
				t.Errorf("z[%d] = %d, want 0", i, v)
			}
		}
	})
}

func equal(a, b []int) bool {
	if len(a) == 0 && len(b) == 0 {
		return true
	}
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
