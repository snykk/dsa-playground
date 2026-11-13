package main

import (
	"math/rand"
	"reflect"
	"strings"
	"testing"
)

func bruteForce(text, pattern string) []int {
	result := []int{}
	for i := 0; i+len(pattern) <= len(text); i++ {
		if text[i:i+len(pattern)] == pattern {
			result = append(result, i)
		}
	}
	return result
}

func TestSearchBanana(t *testing.T) {
	st := NewSuffixTree("banana")
	cases := map[string][]int{
		"ana":     {1, 3},
		"ban":     {0},
		"a":       {1, 3, 5},
		"na":      {2, 4},
		"banana":  {0},
		"xyz":     {},
		"bananas": {},
	}
	for pattern, want := range cases {
		if got := st.Search(pattern); !reflect.DeepEqual(got, want) {
			t.Errorf("Search(%q) = %v, want %v", pattern, got, want)
		}
	}
}

// These failed when the tree never split edges.
func TestRegressionEdgeSplit(t *testing.T) {
	if got := NewSuffixTree("abac").Search("ac"); !reflect.DeepEqual(got, []int{2}) {
		t.Errorf("Search(ac) on abac = %v, want [2]", got)
	}
	if got := NewSuffixTree("banana").Search("a"); !reflect.DeepEqual(got, []int{1, 3, 5}) {
		t.Errorf("Search(a) on banana = %v, want [1 3 5]", got)
	}
}

func TestGetAllSuffixes(t *testing.T) {
	got := NewSuffixTree("banana").GetAllSuffixes()
	want := []string{"a", "ana", "anana", "banana", "na", "nana"}
	if !reflect.DeepEqual(got, want) {
		t.Errorf("GetAllSuffixes = %v, want %v", got, want)
	}
}

func TestEmptyAndSpecial(t *testing.T) {
	empty := NewSuffixTree("")
	if len(empty.Search("a")) != 0 || len(empty.GetAllSuffixes()) != 0 {
		t.Error("empty text must have no matches and no suffixes")
	}
	st := NewSuffixTree("a$a")
	if got := st.Search("a"); !reflect.DeepEqual(got, []int{0, 2}) {
		t.Errorf("Search(a) on a$a = %v, want [0 2]", got)
	}
	if len(st.Search("")) != 0 {
		t.Error("empty pattern must return no matches")
	}
	defer func() {
		if recover() == nil {
			t.Error("a NUL byte in the text must panic")
		}
	}()
	NewSuffixTree("a\x00b")
}

func TestDeepTree(t *testing.T) {
	text := strings.Repeat("a", 1500)
	st := NewSuffixTree(text)
	if got := len(st.Search("a")); got != 1500 {
		t.Errorf("got %d matches, want 1500", got)
	}
}

func TestRandomAgainstBruteForce(t *testing.T) {
	rng := rand.New(rand.NewSource(7))
	alphabet := "abc$"
	build := func(n int) string {
		b := make([]byte, n)
		for i := range b {
			b[i] = alphabet[rng.Intn(len(alphabet))]
		}
		return string(b)
	}
	for round := 0; round < 300; round++ {
		text := build(rng.Intn(31))
		st := NewSuffixTree(text)
		for q := 0; q < 20; q++ {
			pattern := build(1 + rng.Intn(5))
			if got, want := st.Search(pattern), bruteForce(text, pattern); !reflect.DeepEqual(got, want) {
				t.Fatalf("text %q pattern %q: got %v want %v", text, pattern, got, want)
			}
		}
	}
}
