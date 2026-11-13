package main

import "fmt"

const (
	base = 256
	mod  = 101
)

// RabinKarpSearch finds all occurrences of pattern in text using Rabin-Karp algorithm
func RabinKarpSearch(text, pattern string) []int {
	if len(pattern) == 0 {
		return []int{}
	}
	if len(text) == 0 || len(pattern) > len(text) {
		return []int{}
	}

	n := len(text)
	m := len(pattern)
	var result []int

	patternHash := 0
	textHash := 0
	h := 1

	// Calculate h = base^(m-1) % mod
	for i := 0; i < m-1; i++ {
		h = (h * base) % mod
	}

	// Calculate initial hash values
	for i := 0; i < m; i++ {
		patternHash = (base*patternHash + int(pattern[i])) % mod
		textHash = (base*textHash + int(text[i])) % mod
	}

	// Slide the pattern over text
	for i := 0; i <= n-m; i++ {
		if patternHash == textHash {
			match := true
			for j := 0; j < m; j++ {
				if text[i+j] != pattern[j] {
					match = false
					break
				}
			}
			if match {
				result = append(result, i)
			}
		}

		// Calculate hash for next window
		if i < n-m {
			textHash = (base*(textHash-int(text[i])*h) + int(text[i+m])) % mod
			if textHash < 0 {
				textHash += mod
			}
		}
	}

	return result
}

func main() {
	text := "ABABDABACDABABCABC"
	pattern := "ABABCABC"

	fmt.Println("Rabin-Karp Algorithm Example:")
	occurrences := RabinKarpSearch(text, pattern)
	fmt.Printf("Occurrences at indices: %v\n", occurrences)
}
