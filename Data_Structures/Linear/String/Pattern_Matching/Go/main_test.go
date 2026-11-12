package pattern

import (
	"reflect"
	"testing"
)

func TestPatternMatching(t *testing.T) {
	text := "ababcabcabc"
	pattern := "abc"
	exp := []int{2, 5, 8}

	res1 := NaiveSearch(text, pattern)
	res2 := KMPSearch(text, pattern)

	if len(res1) != len(exp) {
		t.Errorf("NaiveSearch length mismatch")
	}
	for i, v := range res1 {
		if v != exp[i] {
			t.Errorf("NaiveSearch value mismatch")
		}
	}

	if len(res2) != len(exp) {
		t.Errorf("KMPSearch length mismatch")
	}
	for i, v := range res2 {
		if v != exp[i] {
			t.Errorf("KMPSearch value mismatch")
		}
	}
}

// Regression: KMPSearch panicked on an empty pattern (pattern[0] with m == 0).
func TestEmptyPattern(t *testing.T) {
	want := []int{0, 1, 2, 3}
	if got := KMPSearch("abc", ""); !reflect.DeepEqual(got, want) {
		t.Errorf("KMPSearch(%q, %q) = %v, want %v", "abc", "", got, want)
	}
	if got := NaiveSearch("abc", ""); !reflect.DeepEqual(got, want) {
		t.Errorf("NaiveSearch(%q, %q) = %v, want %v", "abc", "", got, want)
	}
	if got := KMPSearch("", ""); !reflect.DeepEqual(got, []int{0}) {
		t.Errorf("KMPSearch(%q, %q) = %v, want [0]", "", "", got)
	}
}

func TestEdgeCases(t *testing.T) {
	tests := []struct {
		text, pattern string
		want          []int
	}{
		{"ab", "abc", []int{}},
		{"", "a", []int{}},
		{"aaaa", "aa", []int{0, 1, 2}},
		{"abc", "xyz", []int{}},
	}
	for _, tt := range tests {
		if got := NaiveSearch(tt.text, tt.pattern); !reflect.DeepEqual(got, tt.want) {
			t.Errorf("NaiveSearch(%q, %q) = %v, want %v", tt.text, tt.pattern, got, tt.want)
		}
		if got := KMPSearch(tt.text, tt.pattern); !reflect.DeepEqual(got, tt.want) {
			t.Errorf("KMPSearch(%q, %q) = %v, want %v", tt.text, tt.pattern, got, tt.want)
		}
	}
}
