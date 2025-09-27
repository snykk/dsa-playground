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
