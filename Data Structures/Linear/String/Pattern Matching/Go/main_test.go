package pattern

import "testing"

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
