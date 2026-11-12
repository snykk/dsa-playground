package manipulation

import "testing"

func TestStringManipulation(t *testing.T) {
	if ReverseString("hello") != "olleh" {
		t.Errorf("ReverseString failed")
	}
	if !IsPalindrome("level") || IsPalindrome("hello") {
		t.Errorf("IsPalindrome failed")
	}
	if CountVowels("hello") != 2 {
		t.Errorf("CountVowels failed")
	}
	if ReplaceChar("hello", 'l', 'x') != "hexxo" {
		t.Errorf("ReplaceChar failed")
	}
	if ToUpper("abc") != "ABC" || ToLower("ABC") != "abc" {
		t.Errorf("Case conversion failed")
	}
	arr := SplitString("a b c", " ")
	if len(arr) != 3 || arr[0] != "a" {
		t.Errorf("SplitString failed")
	}
	if JoinString(arr, "-") != "a-b-c" {
		t.Errorf("JoinString failed")
	}
}

func TestIsPalindromeEdgeCases(t *testing.T) {
	cases := []struct {
		s    string
		want bool
	}{
		{"", true},
		{"a", true},
		{"abba", true},
		{"racecar", true},
		{"abca", false},
		{"Aa", false},
		{"\u00e9\u00e9", true}, // multi-byte runes compare as one unit
		{"a\u00e9a", true},
		{"\xff", true}, // invalid UTF-8: used to be false (decoded copies differ)
		{"\xffa", false},
	}
	for _, c := range cases {
		if got := IsPalindrome(c.s); got != c.want {
			t.Errorf("IsPalindrome(%q) = %v, want %v", c.s, got, c.want)
		}
	}
}

func TestReverseStringEdgeCases(t *testing.T) {
	if ReverseString("") != "" || ReverseString("a") != "a" {
		t.Errorf("empty and single-character strings must be unchanged")
	}
	if got := ReverseString("h\u00e9llo"); got != "oll\u00e9h" {
		t.Errorf("ReverseString reverses runes, got %q", got)
	}
}

func TestSplitJoinEdgeCases(t *testing.T) {
	if got := SplitString("", " "); len(got) != 1 || got[0] != "" {
		t.Errorf("SplitString(\"\") = %q, want one empty field", got)
	}
	got := SplitString("a b ", " ")
	if len(got) != 3 || got[2] != "" {
		t.Errorf("trailing separator must give an empty last field, got %q", got)
	}
	if JoinString(nil, "-") != "" || JoinString([]string{"x"}, "-") != "x" {
		t.Errorf("JoinString of 0 or 1 items failed")
	}
	if JoinString(got, " ") != "a b " {
		t.Errorf("join(split(s)) must give s back")
	}
}

func TestReplaceAndVowelsEdgeCases(t *testing.T) {
	if ReplaceChar("", 'a', 'b') != "" || ReplaceChar("aaa", 'a', 'b') != "bbb" {
		t.Errorf("ReplaceChar edge cases failed")
	}
	if ReplaceChar("caf\u00e9", '\u00e9', 'e') != "cafe" {
		t.Errorf("ReplaceChar works on runes")
	}
	if CountVowels("") != 0 || CountVowels("AEIOUaeiou") != 10 {
		t.Errorf("CountVowels edge cases failed")
	}
}
