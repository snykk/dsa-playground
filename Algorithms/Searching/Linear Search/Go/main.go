package main

// LinearSearch searches for target in slice using Linear Search algorithm
// Returns index of target if found, -1 otherwise
//
// Time Complexity: O(n)
// Space Complexity: O(1)
func LinearSearch(arr []int, target int) int {
	for i, v := range arr {
		if v == target {
			return i
		}
	}
	return -1
}

// LinearSearchRecursive searches for target recursively
// Returns index of target if found, -1 otherwise
//
// Time Complexity: O(n)
// Space Complexity: O(n) due to recursion stack
func LinearSearchRecursive(arr []int, target int, index int) int {
	// Base case: reached end of array
	if index >= len(arr) {
		return -1
	}
	
	// Base case: found target
	if arr[index] == target {
		return index
	}
	
	// Recursive case: check next element
	return LinearSearchRecursive(arr, target, index+1)
}

// LinearSearchAllOccurrences finds all occurrences of target in slice
// Returns slice of indices where target is found
//
// Time Complexity: O(n)
// Space Complexity: O(k) where k is number of occurrences
func LinearSearchAllOccurrences(arr []int, target int) []int {
	indices := []int{}
	for i, v := range arr {
		if v == target {
			indices = append(indices, i)
		}
	}
	return indices
}

// LinearSearchGeneric searches for target in any comparable slice
func LinearSearchGeneric[T comparable](arr []T, target T) int {
	for i, v := range arr {
		if v == target {
			return i
		}
	}
	return -1
}

