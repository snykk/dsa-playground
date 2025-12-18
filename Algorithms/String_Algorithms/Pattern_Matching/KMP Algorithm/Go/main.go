package main

import "fmt"

// BuildLPS builds Longest Proper Prefix which is also Suffix array
func BuildLPS(pattern string) []int {
	m := len(pattern)
	lps := make([]int, m)
	length := 0 // Length of previous longest prefix suffix
	i := 1

	for i < m {
		if pattern[i] == pattern[length] {
			length++
			lps[i] = length
			i++
		} else {
			if length != 0 {
				length = lps[length-1]
			} else {
				lps[i] = 0
				i++
			}
		}
	}

	return lps
}

// KMPSearch finds all occurrences of pattern in text using KMP algorithm
func KMPSearch(text, pattern string) []int {
	if len(pattern) == 0 {
		return []int{}
	}
	if len(text) == 0 || len(pattern) > len(text) {
		return []int{}
	}

	n := len(text)
	m := len(pattern)
	var result []int

	// Build LPS array
	lps := BuildLPS(pattern)

	i := 0 // Index for text
	j := 0 // Index for pattern

	for i < n {
		if text[i] == pattern[j] {
			i++
			j++
		}

		if j == m {
			result = append(result, i-j)
			j = lps[j-1]
		} else if i < n && text[i] != pattern[j] {
			if j != 0 {
				j = lps[j-1]
			} else {
				i++
			}
		}
	}

	return result
}

// KMPSearchCount counts occurrences of pattern in text
func KMPSearchCount(text, pattern string) int {
	return len(KMPSearch(text, pattern))
}

// KMPSearchFirst finds first occurrence of pattern in text
func KMPSearchFirst(text, pattern string) int {
	occurrences := KMPSearch(text, pattern)
	if len(occurrences) == 0 {
		return -1
	}
	return occurrences[0]
}

func main() {
	// Example usage
	text := "ABABDABACDABABCABC"
	pattern := "ABABCABC"

	fmt.Println("KMP Algorithm Example:")
	fmt.Printf("Text: %s\n", text)
	fmt.Printf("Pattern: %s\n", pattern)

	// Build LPS array
	lps := BuildLPS(pattern)
	fmt.Printf("LPS array: %v\n", lps)

	// Find all occurrences
	occurrences := KMPSearch(text, pattern)
	fmt.Printf("Occurrences at indices: %v\n", occurrences)

	// Count occurrences
	count := KMPSearchCount(text, pattern)
	fmt.Printf("Total occurrences: %d\n", count)

	// Find first occurrence
	first := KMPSearchFirst(text, pattern)
	fmt.Printf("First occurrence at index: %d\n", first)
}

