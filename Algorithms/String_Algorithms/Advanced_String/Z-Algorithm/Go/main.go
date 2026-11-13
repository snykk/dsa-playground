package main

import "fmt"

func buildZArray(s string) []int {
	n := len(s)
	z := make([]int, n)
	l, r := 0, 0

	for i := 1; i < n; i++ {
		if i <= r {
			if r-i+1 < z[i-l] {
				z[i] = r - i + 1
			} else {
				z[i] = z[i-l]
			}
		}
		for i+z[i] < n && s[z[i]] == s[i+z[i]] {
			z[i]++
		}
		if i+z[i]-1 > r {
			l = i
			r = i + z[i] - 1
		}
	}
	return z
}

func ZAlgorithmSearch(text, pattern string) []int {
	if len(pattern) == 0 || len(text) == 0 || len(pattern) > len(text) {
		return []int{}
	}

	combined := pattern + "$" + text
	z := buildZArray(combined)
	var result []int
	m := len(pattern)

	// A text position i is a match when z[i] >= m. Use >=, not ==: when '$'
	// also occurs in the text or pattern, z[i] can run past the separator.
	for i := m + 1; i < len(combined); i++ {
		if z[i] >= m {
			result = append(result, i-m-1)
		}
	}
	return result
}

func main() {
	text := "ABABDABACDABABCABC"
	pattern := "ABABCABC"
	fmt.Println("Z-Algorithm Example:")
	fmt.Printf("Occurrences: %v\n", ZAlgorithmSearch(text, pattern))
}
