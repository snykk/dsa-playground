package main

// TernarySearch searches for target in sorted slice using Ternary Search algorithm
// Returns index of target if found, -1 otherwise
//
// Time Complexity: O(log3(n))
// Space Complexity: O(1)
func TernarySearch(arr []int, target int) int {
	left, right := 0, len(arr)-1

	for left <= right {
		// Divide search space into three parts
		mid1 := left + (right-left)/3
		mid2 := right - (right-left)/3

		// Check if target is at mid1
		if arr[mid1] == target {
			return mid1
		}

		// Check if target is at mid2
		if arr[mid2] == target {
			return mid2
		}

		// If target is in left third
		if target < arr[mid1] {
			right = mid1 - 1
		} else if target > arr[mid2] {
			// If target is in right third
			left = mid2 + 1
		} else {
			// If target is in middle third
			left = mid1 + 1
			right = mid2 - 1
		}
	}

	// Target not found
	return -1
}

// TernarySearchRecursive searches for target recursively
// Returns index of target if found, -1 otherwise
//
// Time Complexity: O(log3(n))
// Space Complexity: O(log3(n)) due to recursion stack
func TernarySearchRecursive(arr []int, target int, left int, right int) int {
	// Base case: search space exhausted
	if left > right {
		return -1
	}

	// Divide search space into three parts
	mid1 := left + (right-left)/3
	mid2 := right - (right-left)/3

	// Check if target is at mid1
	if arr[mid1] == target {
		return mid1
	}

	// Check if target is at mid2
	if arr[mid2] == target {
		return mid2
	}

	// If target is in left third
	if target < arr[mid1] {
		return TernarySearchRecursive(arr, target, left, mid1-1)
	}
	// If target is in right third
	if target > arr[mid2] {
		return TernarySearchRecursive(arr, target, mid2+1, right)
	}
	// If target is in middle third
	return TernarySearchRecursive(arr, target, mid1+1, mid2-1)
}
