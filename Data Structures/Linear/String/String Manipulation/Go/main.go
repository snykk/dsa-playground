package manipulation

import "strings"

func ReverseString(s string) string {
	r := []rune(s)
	for i, j := 0, len(r)-1; i < j; i, j = i+1, j-1 {
		r[i], r[j] = r[j], r[i]
	}
	return string(r)
}

// IsPalindrome compares code points from both ends with two indexes: O(n) time,
// no re-encoded copy of the string.
func IsPalindrome(s string) bool {
	r := []rune(s)
	for i, j := 0, len(r)-1; i < j; i, j = i+1, j-1 {
		if r[i] != r[j] {
			return false
		}
	}
	return true
}

func CountVowels(s string) int {
	count := 0
	for _, c := range s {
		if strings.ContainsRune("aeiouAEIOU", c) {
			count++
		}
	}
	return count
}

func ReplaceChar(s string, oldr, newr rune) string {
	return strings.ReplaceAll(s, string(oldr), string(newr))
}

func ToUpper(s string) string {
	return strings.ToUpper(s)
}

func ToLower(s string) string {
	return strings.ToLower(s)
}

func SplitString(s, sep string) []string {
	return strings.Split(s, sep)
}

func JoinString(arr []string, sep string) string {
	return strings.Join(arr, sep)
}
