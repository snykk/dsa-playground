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

func TestSubstringBounds(t *testing.T) {
	cases := []struct {
		s          string
		start, end int
		want       string
	}{
		{"abc", 0, 4, "abc"}, // end past the length was NUL padded before
		{"abc", 0, 9, "abc"},
		{"abcdef", 3, 1, ""}, // end before start
		{"abcdef", 3, 3, ""},
		{"abcdef", 9, 12, ""}, // start past the end
		{"abcdef", -2, 2, "ab"},
		{"", 0, 0, ""},
	}
	for _, c := range cases {
		if got := Substring(c.s, c.start, c.end); got != c.want {
			t.Errorf("Substring(%q, %d, %d) = %q, want %q", c.s, c.start, c.end, got, c.want)
		}
	}
}

func TestSubstringWholeNonASCIIString(t *testing.T) {
	s := "h\u00e9llo"
	if StringLength(s) != 6 { // bytes: the accented letter takes 2
		t.Errorf("StringLength = %d, want 6", StringLength(s))
	}
	if got := Substring(s, 0, StringLength(s)); got != s {
		t.Errorf("Substring over the full length = %q, want %q", got, s)
	}
	if len(TraverseString(s)) != 5 { // runes: 5 characters
		t.Errorf("TraverseString should return 5 runes")
	}
}

func TestEmptyString(t *testing.T) {
	if StringLength("") != 0 || len(TraverseString("")) != 0 || Concatenate("", "") != "" {
		t.Errorf("empty string handling failed")
	}
}
