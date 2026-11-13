package main

import "fmt"

// Manacher returns the longest palindromic substring of s (the first one when several
// tie). It works on runes, so multi-byte UTF-8 characters are never split, and it uses
// no sentinel characters, so any rune is safe in s.
func Manacher(s string) string {
	if len(s) == 0 {
		return ""
	}

	// The runes of s and the byte offset where each one starts (plus the end of s).
	runes := make([]rune, 0, len(s))
	offsets := make([]int, 0, len(s)+1)
	for i, r := range s {
		runes = append(runes, r)
		offsets = append(offsets, i)
	}
	offsets = append(offsets, len(s))

	// "abc" -> "#a#b#c#": a rune at index k sits at transformed index 2k+1; the value
	// -1 (never a valid rune) stands for the separator.
	n := 2*len(runes) + 1
	transformed := make([]rune, n)
	for i := range transformed {
		transformed[i] = -1
	}
	for k, r := range runes {
		transformed[2*k+1] = r
	}

	p := make([]int, n)
	center, right := 0, 0

	for i := 0; i < n; i++ {
		mirror := 2*center - i
		if i < right {
			if right-i < p[mirror] {
				p[i] = right - i
			} else {
				p[i] = p[mirror]
			}
		}

		for i+p[i]+1 < n && i-p[i]-1 >= 0 && transformed[i+p[i]+1] == transformed[i-p[i]-1] {
			p[i]++
		}

		if i+p[i] > right {
			center = i
			right = i + p[i]
		}
	}

	maxLen := 0
	centerIndex := 0
	for i := 0; i < n; i++ {
		if p[i] > maxLen {
			maxLen = p[i]
			centerIndex = i
		}
	}

	start := (centerIndex - maxLen) / 2
	return s[offsets[start]:offsets[start+maxLen]]
}

func main() {
	s := "babad"
	fmt.Println("Manacher's Algorithm Example:")
	fmt.Println("Longest palindromic substring:", Manacher(s))
}
