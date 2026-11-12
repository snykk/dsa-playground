package main

import (
	"sort"
	"strings"
)

type SuffixArray struct {
	text        string
	n           int
	suffixArray []int
}

func NewSuffixArray(text string) *SuffixArray {
	n := len(text)
	suffixes := make([]struct {
		suffix string
		index  int
	}, n)

	for i := 0; i < n; i++ {
		suffixes[i] = struct {
			suffix string
			index  int
		}{text[i:], i}
	}

	sort.Slice(suffixes, func(i, j int) bool {
		return suffixes[i].suffix < suffixes[j].suffix
	})

	suffixArray := make([]int, n)
	for i, s := range suffixes {
		suffixArray[i] = s.index
	}

	return &SuffixArray{
		text:        text,
		n:           n,
		suffixArray: suffixArray,
	}
}

func (sa *SuffixArray) Search(pattern string) []int {
	left := 0
	right := sa.n - 1
	firstOccurrence := -1

	for left <= right {
		mid := (left + right) / 2
		idx := sa.suffixArray[mid]
		suffix := sa.text[idx:]

		if strings.HasPrefix(suffix, pattern) {
			firstOccurrence = mid
			right = mid - 1
		} else if suffix < pattern {
			left = mid + 1
		} else {
			right = mid - 1
		}
	}

	if firstOccurrence == -1 {
		return []int{}
	}

	left = firstOccurrence
	right = sa.n - 1
	lastOccurrence := firstOccurrence

	for left <= right {
		mid := (left + right) / 2
		idx := sa.suffixArray[mid]
		suffix := sa.text[idx:]

		if strings.HasPrefix(suffix, pattern) {
			lastOccurrence = mid
			left = mid + 1
		} else {
			right = mid - 1
		}
	}

	result := []int{}
	for i := firstOccurrence; i <= lastOccurrence; i++ {
		result = append(result, sa.suffixArray[i])
	}

	sort.Ints(result)
	return result
}

func main() {
	sa := NewSuffixArray("banana")
	result := sa.Search("ana")
	println("Found at positions:", len(result))
}
