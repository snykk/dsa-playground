package main

import (
	"math/rand"
	"reflect"
	"sort"
	"strings"
	"testing"
)

func TestBuildSuffixArray(t *testing.T) {
	text := "banana"
	sa := BuildSuffixArray(text)
	if len(sa) != 6 {
		t.Errorf("BuildSuffixArray(%q) length = %d, expected 6", text, len(sa))
	}

	// Verify all indices are present
	found := make([]bool, 6)
	for _, idx := range sa {
		if idx < 0 || idx >= 6 {
			t.Errorf("BuildSuffixArray(%q) contains invalid index %d", text, idx)
		}
		found[idx] = true
	}
	for i, f := range found {
		if !f {
			t.Errorf("BuildSuffixArray(%q) missing index %d", text, i)
		}
	}
}

func TestSearchPattern(t *testing.T) {
	text := "banana"
	sa := BuildSuffixArray(text)
	pattern := "ana"
	result := SearchPattern(sa, text, pattern)
	if len(result) != 2 {
		t.Errorf("SearchPattern(%q, %q) length = %d, expected 2", text, pattern, len(result))
	}

	// Verify indices are correct
	sort.Ints(result)
	if result[0] != 1 && result[0] != 3 {
		t.Errorf("SearchPattern(%q, %q) first index = %d, expected 1 or 3", text, pattern, result[0])
	}
}

func TestSearchPatternNotFound(t *testing.T) {
	text := "banana"
	sa := BuildSuffixArray(text)
	pattern := "xyz"
	result := SearchPattern(sa, text, pattern)
	if len(result) != 0 {
		t.Errorf("SearchPattern(%q, %q) length = %d, expected 0", text, pattern, len(result))
	}
}

func TestSearchPatternSingleChar(t *testing.T) {
	text := "banana"
	sa := BuildSuffixArray(text)
	pattern := "a"
	result := SearchPattern(sa, text, pattern)
	if len(result) != 3 {
		t.Errorf("SearchPattern(%q, %q) length = %d, expected 3", text, pattern, len(result))
	}
}

func TestEmptyString(t *testing.T) {
	text := ""
	sa := BuildSuffixArray(text)
	if len(sa) != 0 {
		t.Errorf("BuildSuffixArray(%q) length = %d, expected 0", text, len(sa))
	}
}

func TestBananaOrderAndExactResults(t *testing.T) {
	text := "banana"
	sa := BuildSuffixArray(text)
	if want := []int{5, 3, 1, 0, 4, 2}; !reflect.DeepEqual(sa, want) {
		t.Errorf("BuildSuffixArray(%q) = %v, want %v", text, sa, want)
	}
	tests := []struct {
		pattern string
		want    []int
	}{
		{"ana", []int{1, 3}},
		{"a", []int{1, 3, 5}},
		{"bananas", nil},
		{"", []int{0, 1, 2, 3, 4, 5}}, // the empty pattern is a prefix of every suffix
	}
	for _, tt := range tests {
		got := SearchPattern(sa, text, tt.pattern)
		if len(got) != len(tt.want) || (len(got) > 0 && !reflect.DeepEqual(got, tt.want)) {
			t.Errorf("SearchPattern(%q, %q) = %v, want %v", text, tt.pattern, got, tt.want)
		}
	}
	aaaa := BuildSuffixArray("aaaa")
	if got := SearchPattern(aaaa, "aaaa", "aa"); !reflect.DeepEqual(got, []int{0, 1, 2}) {
		t.Errorf("overlapping matches = %v, want [0 1 2]", got)
	}
}

func TestGetSuffixesAndLcp(t *testing.T) {
	sa := BuildSuffixArray("banana")
	want := []string{"a", "ana", "anana", "banana", "na", "nana"}
	if got := GetSuffixes(sa, "banana"); !reflect.DeepEqual(got, want) {
		t.Errorf("GetSuffixes = %v, want %v", got, want)
	}
	if got := LongestCommonPrefix("banana", 0, 3); got != 0 {
		t.Errorf("LCP(0,3) = %d, want 0", got)
	}
	if got := LongestCommonPrefix("banana", 1, 1); got != 5 {
		t.Errorf("LCP(1,1) = %d, want 5", got)
	}
	if got := LongestCommonPrefix("banana", 3, 1); got != 3 {
		t.Errorf("LCP(3,1) = %d, want 3", got)
	}
}

func TestClassView(t *testing.T) {
	sa := NewSuffixArray("banana")
	if !reflect.DeepEqual(sa.suffixArray, []int{5, 3, 1, 0, 4, 2}) {
		t.Errorf("suffixArray = %v", sa.suffixArray)
	}
	if got := sa.Search("ana"); !reflect.DeepEqual(got, []int{1, 3}) {
		t.Errorf("Search(ana) = %v", got)
	}
	if got := sa.Search(""); !reflect.DeepEqual(got, []int{0, 1, 2, 3, 4, 5}) {
		t.Errorf("Search(empty) = %v", got)
	}
	if sa.Suffixes()[0] != "a" || sa.LongestCommonPrefix(3, 1) != 3 {
		t.Errorf("Suffixes or LongestCommonPrefix wrong")
	}
	if got := NewSuffixArray("").Search("a"); len(got) != 0 {
		t.Errorf("Search on empty text = %v", got)
	}
}

func TestRandomAgainstBruteForce(t *testing.T) {
	rng := rand.New(rand.NewSource(7))
	randStr := func(alpha string, maxLen int) string {
		b := make([]byte, rng.Intn(maxLen+1))
		for i := range b {
			b[i] = alpha[rng.Intn(len(alpha))]
		}
		return string(b)
	}
	for iter := 0; iter < 300; iter++ {
		text := randStr("ab", 12)
		sa := BuildSuffixArray(text)
		order := make([]int, len(text))
		for i := range order {
			order[i] = i
		}
		sort.Slice(order, func(a, b int) bool { return text[order[a]:] < text[order[b]:] })
		if !reflect.DeepEqual(sa, order) {
			t.Fatalf("BuildSuffixArray(%q) = %v, want %v", text, sa, order)
		}
		for q := 0; q < 8; q++ {
			pat := randStr("abc", 4)
			var want []int
			for i := 0; i < len(text); i++ {
				if strings.HasPrefix(text[i:], pat) {
					want = append(want, i)
				}
			}
			got := SearchPattern(sa, text, pat)
			if len(got) != len(want) || (len(want) > 0 && !reflect.DeepEqual(got, want)) {
				t.Fatalf("SearchPattern(%q, %q) = %v, want %v", text, pat, got, want)
			}
		}
	}
}
