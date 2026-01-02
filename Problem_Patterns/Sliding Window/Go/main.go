package main

import (
	"fmt"
)

// maxSumSubarray finds maximum sum of subarray of size k using fixed sliding window.
// Time Complexity: O(n)
// Space Complexity: O(1)
func maxSumSubarray(arr []int, k int) int {
	if len(arr) < k {
		return 0
	}

	// Calculate sum of first window
	windowSum := 0
	for i := 0; i < k; i++ {
		windowSum += arr[i]
	}

	maxSum := windowSum

	// Slide the window
	for i := k; i < len(arr); i++ {
		windowSum = windowSum - arr[i-k] + arr[i]
		if windowSum > maxSum {
			maxSum = windowSum
		}
	}

	return maxSum
}

// longestSubstringKDistinct finds length of longest substring with at most k distinct characters.
// Time Complexity: O(n)
// Space Complexity: O(k)
func longestSubstringKDistinct(s string, k int) int {
	if len(s) == 0 || k == 0 {
		return 0
	}

	charCount := make(map[byte]int)
	left := 0
	maxLen := 0

	for right := 0; right < len(s); right++ {
		charCount[s[right]]++

		// Shrink window if distinct chars exceed k
		for len(charCount) > k {
			charCount[s[left]]--
			if charCount[s[left]] == 0 {
				delete(charCount, s[left])
			}
			left++
		}

		if right-left+1 > maxLen {
			maxLen = right - left + 1
		}
	}

	return maxLen
}

// minWindowSubstring finds minimum window substring containing all characters of t.
// Time Complexity: O(|s| + |t|)
// Space Complexity: O(|s| + |t|)
func minWindowSubstring(s, t string) string {
	if len(s) == 0 || len(t) == 0 || len(s) < len(t) {
		return ""
	}

	// Count characters in t
	need := make(map[byte]int)
	for i := 0; i < len(t); i++ {
		need[t[i]]++
	}

	window := make(map[byte]int)
	left := 0
	valid := 0
	start := 0
	minLen := len(s) + 1

	for right := 0; right < len(s); right++ {
		c := s[right]

		// Add to window
		if _, exists := need[c]; exists {
			window[c]++
			if window[c] == need[c] {
				valid++
			}
		}

		// Shrink window
		for valid == len(need) {
			// Update minimum window
			if right-left+1 < minLen {
				start = left
				minLen = right - left + 1
			}

			// Remove left character
			leftChar := s[left]
			if _, exists := need[leftChar]; exists {
				if window[leftChar] == need[leftChar] {
					valid--
				}
				window[leftChar]--
			}
			left++
		}
	}

	if minLen == len(s)+1 {
		return ""
	}
	return s[start : start+minLen]
}

// longestSubstringNoRepeat finds length of longest substring without repeating characters.
// Time Complexity: O(n)
// Space Complexity: O(min(n, m)) where m is charset size
func longestSubstringNoRepeat(s string) int {
	charIndex := make(map[byte]int)
	left := 0
	maxLen := 0

	for right := 0; right < len(s); right++ {
		// If character seen before and within current window
		if idx, exists := charIndex[s[right]]; exists && idx >= left {
			left = idx + 1
		}

		charIndex[s[right]] = right
		if right-left+1 > maxLen {
			maxLen = right - left + 1
		}
	}

	return maxLen
}

func main() {
	fmt.Println("Sliding Window Examples:")
	fmt.Println()

	// Fixed window: Maximum sum subarray
	arr := []int{1, 4, 2, 10, 23, 3, 1, 0, 20}
	k := 4
	result := maxSumSubarray(arr, k)
	fmt.Printf("Maximum sum of subarray of size %d: %d\n", k, result)
	fmt.Println()

	// Variable window: Longest substring with k distinct
	s := "eceba"
	k = 2
	result = longestSubstringKDistinct(s, k)
	fmt.Printf("Longest substring with %d distinct chars: %d\n", k, result)
	fmt.Println()

	// Minimum window substring
	s = "ADOBECODEBANC"
	t := "ABC"
	resultStr := minWindowSubstring(s, t)
	fmt.Printf("Minimum window containing '%s': '%s'\n", t, resultStr)
	fmt.Println()

	// Longest substring without repeat
	s = "abcabcbb"
	result = longestSubstringNoRepeat(s)
	fmt.Printf("Longest substring without repeat: %d\n", result)
}
