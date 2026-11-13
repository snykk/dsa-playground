package main

import "fmt"

func buildBadCharTable(pattern string) map[byte]int {
	table := make(map[byte]int)
	for i := 0; i < len(pattern); i++ {
		table[pattern[i]] = i
	}
	return table
}

func BoyerMooreSearch(text, pattern string) []int {
	if len(pattern) == 0 || len(text) == 0 || len(pattern) > len(text) {
		return []int{}
	}

	n := len(text)
	m := len(pattern)
	var result []int
	badChar := buildBadCharTable(pattern)
	s := 0

	for s <= n-m {
		j := m - 1
		for j >= 0 && pattern[j] == text[s+j] {
			j--
		}
		if j < 0 {
			result = append(result, s)
			if s+m < n {
				if val, ok := badChar[text[s+m]]; ok {
					s += m - val
				} else {
					s += m + 1
				}
			} else {
				s++
			}
		} else {
			badCharShift := j
			if val, ok := badChar[text[s+j]]; ok {
				badCharShift = j - val
			} else {
				badCharShift = j + 1
			}
			if badCharShift < 1 {
				badCharShift = 1
			}
			s += badCharShift
		}
	}
	return result
}

func main() {
	text := "ABABDABACDABABCABC"
	pattern := "ABABCABC"
	fmt.Println("Boyer-Moore Algorithm Example:")
	fmt.Printf("Occurrences: %v\n", BoyerMooreSearch(text, pattern))
}
