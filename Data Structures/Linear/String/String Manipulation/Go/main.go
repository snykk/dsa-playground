package manipulation

import "strings"

func ReverseString(s string) string {
	r := []rune(s)
	for i, j := 0, len(r)-1; i < j; i, j = i+1, j-1 {
		r[i], r[j] = r[j], r[i]
	}
	return string(r)
}

func IsPalindrome(s string) bool {
	return s == ReverseString(s)
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

func ReplaceChar(s string, old, new rune) string {
	return strings.ReplaceAll(s, string(old), string(new))
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
