package intro

import "testing"

func TestStringIntro(t *testing.T) {
	if AccessChar("hello", 1) != 'e' {
		t.Errorf("AccessChar failed")
	}
	if StringLength("hello") != 5 {
		t.Errorf("StringLength failed")
	}
	tr := TraverseString("abc")
	if len(tr) != 3 || tr[0] != 'a' {
		t.Errorf("TraverseString failed")
	}
	if Concatenate("abc", "def") != "abcdef" {
		t.Errorf("Concatenate failed")
	}
	if Substring("abcdef", 1, 4) != "bcd" {
		t.Errorf("Substring failed")
	}
}
