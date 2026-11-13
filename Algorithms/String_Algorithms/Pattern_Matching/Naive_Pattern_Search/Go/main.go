package main

import "fmt"

// NaivePatternSearch finds all occurrences of pattern in text using naive approach
func NaivePatternSearch(text, pattern string) []int {
	if len(pattern) == 0 {
		return []int{}
	}
	if len(text) == 0 || len(pattern) > len(text) {
		return []int{}
	}

	n := len(text)
	m := len(pattern)
	var result []int

	// Check each possible starting position
	for i := 0; i <= n-m; i++ {
		// Check if pattern matches at position i
		j := 0
		for j < m && text[i+j] == pattern[j] {
			j++
		}

		// If we matched the entire pattern
		if j == m {
			result = append(result, i)
		}
	}

	return result
}

// NaivePatternSearchCount counts occurrences of pattern in text
func NaivePatternSearchCount(text, pattern string) int {
	return len(NaivePatternSearch(text, pattern))
}

// NaivePatternSearchFirst finds first occurrence of pattern in text
func NaivePatternSearchFirst(text, pattern string) int {
	occurrences := NaivePatternSearch(text, pattern)
	if len(occurrences) == 0 {
		return -1
	}
	return occurrences[0]
}

func main() {
	// Example usage
	text := "ABABDABACDABABCABC"
	pattern := "ABABCABC"

	fmt.Println("Naive Pattern Search Example:")
	fmt.Printf("Text: %s\n", text)
	fmt.Printf("Pattern: %s\n", pattern)

	// Find all occurrences
	occurrences := NaivePatternSearch(text, pattern)
	fmt.Printf("Occurrences at indices: %v\n", occurrences)

	// Count occurrences
	count := NaivePatternSearchCount(text, pattern)
	fmt.Printf("Total occurrences: %d\n", count)

	// Find first occurrence
	first := NaivePatternSearchFirst(text, pattern)
	fmt.Printf("First occurrence at index: %d\n", first)

	// Example with multiple matches
	text2 := "AABAACAADAABAABA"
	pattern2 := "AABA"
	fmt.Printf("\nText: %s\n", text2)
	fmt.Printf("Pattern: %s\n", pattern2)
	occurrences2 := NaivePatternSearch(text2, pattern2)
	fmt.Printf("Occurrences at indices: %v\n", occurrences2)
}
