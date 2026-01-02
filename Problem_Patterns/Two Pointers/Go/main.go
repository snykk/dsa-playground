package main

import (
	"fmt"
	"sort"
	"unicode"
)

// twoSumSorted finds two numbers that add up to target in sorted array.
// Time Complexity: O(n)
// Space Complexity: O(1)
func twoSumSorted(arr []int, target int) []int {
	left, right := 0, len(arr)-1

	for left < right {
		currentSum := arr[left] + arr[right]
		if currentSum == target {
			return []int{left, right}
		} else if currentSum < target {
			left++
		} else {
			right--
		}
	}

	return nil
}

// threeSum finds all unique triplets that sum to target.
// Time Complexity: O(n²)
// Space Complexity: O(1) excluding output
func threeSum(arr []int, target int) [][]int {
	sorted := make([]int, len(arr))
	copy(sorted, arr)
	sort.Ints(sorted)

	var result [][]int

	for i := 0; i < len(sorted)-2; i++ {
		if i > 0 && sorted[i] == sorted[i-1] {
			continue
		}

		left, right := i+1, len(sorted)-1

		for left < right {
			currentSum := sorted[i] + sorted[left] + sorted[right]
			if currentSum == target {
				result = append(result, []int{sorted[i], sorted[left], sorted[right]})
				for left < right && sorted[left] == sorted[left+1] {
					left++
				}
				for left < right && sorted[right] == sorted[right-1] {
					right--
				}
				left++
				right--
			} else if currentSum < target {
				left++
			} else {
				right--
			}
		}
	}

	return result
}

// isPalindrome checks if string is palindrome using two pointers.
// Time Complexity: O(n)
// Space Complexity: O(1)
func isPalindrome(s string) bool {
	left, right := 0, len(s)-1

	for left < right {
		for left < right && !unicode.IsLetter(rune(s[left])) && !unicode.IsDigit(rune(s[left])) {
			left++
		}
		for left < right && !unicode.IsLetter(rune(s[right])) && !unicode.IsDigit(rune(s[right])) {
			right--
		}

		if unicode.ToLower(rune(s[left])) != unicode.ToLower(rune(s[right])) {
			return false
		}

		left++
		right--
	}

	return true
}

// removeDuplicates removes duplicates from sorted array in-place.
// Time Complexity: O(n)
// Space Complexity: O(1)
func removeDuplicates(arr []int) int {
	if len(arr) == 0 {
		return 0
	}

	writeIndex := 1

	for readIndex := 1; readIndex < len(arr); readIndex++ {
		if arr[readIndex] != arr[writeIndex-1] {
			arr[writeIndex] = arr[readIndex]
			writeIndex++
		}
	}

	return writeIndex
}

// containerWithMostWater finds maximum area of water that can be contained.
// Time Complexity: O(n)
// Space Complexity: O(1)
func containerWithMostWater(heights []int) int {
	left, right := 0, len(heights)-1
	maxArea := 0

	for left < right {
		width := right - left
		height := heights[left]
		if heights[right] < height {
			height = heights[right]
		}
		area := width * height
		if area > maxArea {
			maxArea = area
		}

		if heights[left] < heights[right] {
			left++
		} else {
			right--
		}
	}

	return maxArea
}

func main() {
	fmt.Println("Two Pointers Examples:")
	fmt.Println()

	arr := []int{2, 7, 11, 15}
	result := twoSumSorted(arr, 9)
	fmt.Printf("Two sum 9: [%d, %d]\n", result[0], result[1])
	fmt.Println()

	arr2 := []int{-1, 0, 1, 2, -1, -4}
	result2 := threeSum(arr2, 0)
	fmt.Printf("Three sum 0: %d triplets\n", len(result2))
	fmt.Println()

	s := "A man, a plan, a canal: Panama"
	fmt.Printf("Is palindrome: %v\n", isPalindrome(s))
	fmt.Println()

	arr3 := []int{1, 1, 2, 2, 3, 4, 4, 5}
	length := removeDuplicates(arr3)
	fmt.Printf("After removing duplicates: %v\n", arr3[:length])
	fmt.Println()

	heights := []int{1, 8, 6, 2, 5, 4, 8, 3, 7}
	area := containerWithMostWater(heights)
	fmt.Printf("Maximum water area: %d\n", area)
}
