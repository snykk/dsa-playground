package main

import "testing"

func TestManacher(t *testing.T) {
	tests := []struct {
		s        string
		expected string
	}{
		{"babad", "bab"}, // "bab" and "aba" tie; the earlier one wins
		{"cbbd", "bb"},
		{"a", "a"},
		{"aaaa", "aaaa"},
		{"abc", "a"},
		{"racecar", "racecar"},
		{"", ""},
		{"aa", "aa"},
	}

	for _, tt := range tests {
		if result := Manacher(tt.s); result != tt.expected {
			t.Errorf("Manacher(%q) = %q, expected %q", tt.s, result, tt.expected)
		}
	}
}

// Regression: '^' and '$' were sentinels, so inputs containing them expanded past the
// sentinel or panicked with a slice-bounds error.
func TestSentinelCharactersInInput(t *testing.T) {
	tests := []struct{ s, expected string }{
		{"b^a^b^a", "b^a^b"},
		{"a^", "a"},
		{"$a", "$"},
		{"^^", "^^"},
		{"$a$", "$a$"},
	}
	for _, tt := range tests {
		if result := Manacher(tt.s); result != tt.expected {
			t.Errorf("Manacher(%q) = %q, expected %q", tt.s, result, tt.expected)
		}
	}
}

// Regression: the transformed string was built per rune but indexed per byte, so
// multi-byte UTF-8 broke the index mapping (a lone e-acute returned "").
func TestMultiByteRunes(t *testing.T) {
	tests := []struct{ s, expected string }{
		{"\xc3\xa9", "\xc3\xa9"},
		{"a\xc3\xa9a", "a\xc3\xa9a"},
		{"\xe6\x97\xa5\xe6\x9c\xac\xe6\x97\xa5", "\xe6\x97\xa5\xe6\x9c\xac\xe6\x97\xa5"},
		{"x\xc3\xa9\xc3\xa9y", "\xc3\xa9\xc3\xa9"},
	}
	for _, tt := range tests {
		if result := Manacher(tt.s); result != tt.expected {
			t.Errorf("Manacher(%q) = %q, expected %q", tt.s, result, tt.expected)
		}
	}
}
