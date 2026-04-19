package main

import (
	"sort"
	"testing"
)

type keyedMatch struct {
	end     int
	pattern string
}

func collect(ac *AhoCorasick, matches []Match) []keyedMatch {
	out := make([]keyedMatch, len(matches))
	for i, m := range matches {
		out[i] = keyedMatch{m.EndIndex, ac.Pattern(m.PatternID)}
	}
	sort.Slice(out, func(i, j int) bool {
		if out[i].end != out[j].end {
			return out[i].end < out[j].end
		}
		return out[i].pattern < out[j].pattern
	})
	return out
}

func sortedExpected(xs []keyedMatch) []keyedMatch {
	sort.Slice(xs, func(i, j int) bool {
		if xs[i].end != xs[j].end {
			return xs[i].end < xs[j].end
		}
		return xs[i].pattern < xs[j].pattern
	})
	return xs
}

func equal(a, b []keyedMatch) bool {
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

func TestSinglePatternMatch(t *testing.T) {
	ac := New([]string{"abc"})
	got := collect(ac, ac.Search("xxabcxx"))
	want := sortedExpected([]keyedMatch{{4, "abc"}})
	if !equal(got, want) {
		t.Errorf("got %v, want %v", got, want)
	}
}

func TestNoMatch(t *testing.T) {
	ac := New([]string{"abc", "def"})
	if m := ac.Search("xyz"); len(m) != 0 {
		t.Errorf("expected no matches, got %v", m)
	}
}

func TestEmptyText(t *testing.T) {
	ac := New([]string{"abc"})
	if m := ac.Search(""); len(m) != 0 {
		t.Errorf("expected no matches, got %v", m)
	}
}

func TestEmptyPatterns(t *testing.T) {
	ac := New([]string{})
	if m := ac.Search("hello"); len(m) != 0 {
		t.Errorf("expected no matches, got %v", m)
	}
}

func TestClassicUshers(t *testing.T) {
	ac := New([]string{"he", "she", "his", "hers"})
	got := collect(ac, ac.Search("ushers"))
	want := sortedExpected([]keyedMatch{
		{3, "he"},
		{3, "she"},
		{5, "hers"},
	})
	if !equal(got, want) {
		t.Errorf("got %v, want %v", got, want)
	}
}

func TestOverlappingPatterns(t *testing.T) {
	ac := New([]string{"ab", "bc", "abc"})
	got := collect(ac, ac.Search("abcabc"))
	want := sortedExpected([]keyedMatch{
		{1, "ab"}, {2, "abc"}, {2, "bc"},
		{4, "ab"}, {5, "abc"}, {5, "bc"},
	})
	if !equal(got, want) {
		t.Errorf("got %v, want %v", got, want)
	}
}

func TestPatternIsPrefixOfAnother(t *testing.T) {
	ac := New([]string{"ab", "abab", "aba"})
	got := collect(ac, ac.Search("ababab"))
	want := sortedExpected([]keyedMatch{
		{1, "ab"}, {2, "aba"}, {3, "ab"}, {3, "abab"},
		{4, "aba"}, {5, "ab"}, {5, "abab"},
	})
	if !equal(got, want) {
		t.Errorf("got %v, want %v", got, want)
	}
}

func TestSingleCharacterPatterns(t *testing.T) {
	ac := New([]string{"a", "b"})
	got := collect(ac, ac.Search("aabba"))
	want := sortedExpected([]keyedMatch{
		{0, "a"}, {1, "a"}, {2, "b"}, {3, "b"}, {4, "a"},
	})
	if !equal(got, want) {
		t.Errorf("got %v, want %v", got, want)
	}
}

func TestLongPattern(t *testing.T) {
	ac := New([]string{"abcdefgh"})
	got := collect(ac, ac.Search("xxabcdefghxx"))
	want := sortedExpected([]keyedMatch{{9, "abcdefgh"}})
	if !equal(got, want) {
		t.Errorf("got %v, want %v", got, want)
	}
}
