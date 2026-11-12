package main

import (
	"fmt"
	"sort"
	"strings"
)

func BuildSuffixArray(s string) []int {
	n := len(s)
	type suffix struct {
		str string
		idx int
	}
	suffixes := make([]suffix, n)
	for i := 0; i < n; i++ {
		suffixes[i] = suffix{s[i:], i}
	}
	sort.Slice(suffixes, func(i, j int) bool {
		return suffixes[i].str < suffixes[j].str
	})

	result := make([]int, n)
	for i, suf := range suffixes {
		result[i] = suf.idx
	}
	return result
}

func SearchPattern(suffixArray []int, text, pattern string) []int {
	n := len(text)
	var result []int

	left, right := 0, n-1
	first := -1

	for left <= right {
		mid := (left + right) / 2
		idx := suffixArray[mid]
		suffix := text[idx:]

		if strings.HasPrefix(suffix, pattern) {
			first = mid
			right = mid - 1
		} else if suffix < pattern {
			left = mid + 1
		} else {
			right = mid - 1
		}
	}

	if first == -1 {
		return result
	}

	left, right = first, n-1
	last := first

	for left <= right {
		mid := (left + right) / 2
		idx := suffixArray[mid]
		suffix := text[idx:]

		if strings.HasPrefix(suffix, pattern) {
			last = mid
			left = mid + 1
		} else {
			right = mid - 1
		}
	}

	for i := first; i <= last; i++ {
		result = append(result, suffixArray[i])
	}
	sort.Ints(result)
	return result
}

func main() {
	text := "banana"
	fmt.Println("Suffix Array Example:")
	sa := BuildSuffixArray(text)
	fmt.Printf("Suffix array: %v\n", sa)

	pattern := "ana"
	occurrences := SearchPattern(sa, text, pattern)
	fmt.Printf("Pattern '%s' found at: %v\n", pattern, occurrences)
}
