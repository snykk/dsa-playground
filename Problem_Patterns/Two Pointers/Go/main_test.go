package main

import "testing"

func TestTwoSumSorted(t *testing.T) {
	arr := []int{2, 7, 11, 15}
	result := twoSumSorted(arr, 9)
	if len(result) != 2 || result[0] != 0 || result[1] != 1 {
		t.Errorf("twoSumSorted(%v, 9) = %v, expected [0, 1]", arr, result)
	}
}

func TestThreeSum(t *testing.T) {
	arr := []int{-1, 0, 1, 2, -1, -4}
	result := threeSum(arr, 0)
	if len(result) != 2 {
		t.Errorf("threeSum(%v, 0) returned %d triplets, expected 2", arr, len(result))
	}
}

func TestIsPalindrome(t *testing.T) {
	if !isPalindrome("A man, a plan, a canal: Panama") {
		t.Error("isPalindrome should return true for palindrome")
	}
	if isPalindrome("race a car") {
		t.Error("isPalindrome should return false for non-palindrome")
	}
}

func TestRemoveDuplicates(t *testing.T) {
	arr := []int{1, 1, 2, 2, 3, 4, 4, 5}
	length := removeDuplicates(arr)
	if length != 5 {
		t.Errorf("removeDuplicates returned length %d, expected 5", length)
	}
}

func TestContainerWithMostWater(t *testing.T) {
	heights := []int{1, 8, 6, 2, 5, 4, 8, 3, 7}
	result := containerWithMostWater(heights)
	if result != 49 {
		t.Errorf("containerWithMostWater(%v) = %d, expected 49", heights, result)
	}
}
