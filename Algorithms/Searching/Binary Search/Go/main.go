package main

// BinarySearch searches for target in sorted slice using Binary Search algorithm
// Returns index of target if found, -1 otherwise
//
// Time Complexity: O(log n)
// Space Complexity: O(1)
func BinarySearch(arr []int, target int) int {
	left, right := 0, len(arr)-1

	for left <= right {
		mid := left + (right-left)/2

		// Check if target is present at mid
		if arr[mid] == target {
			return mid
		}
		// If target is greater, ignore left half
		if arr[mid] < target {
			left = mid + 1
		} else {
			// If target is smaller, ignore right half
			right = mid - 1
		}
	}

	// Target not found
	return -1
}

// BinarySearchRecursive searches for target recursively
// Returns index of target if found, -1 otherwise
//
// Time Complexity: O(log n)
// Space Complexity: O(log n) due to recursion stack
func BinarySearchRecursive(arr []int, target int, left int, right int) int {
	// Base case: search space exhausted
	if left > right {
		return -1
	}

	mid := left + (right-left)/2

	// Check if target is present at mid
	if arr[mid] == target {
		return mid
	}
	// If target is greater, search right half
	if arr[mid] < target {
		return BinarySearchRecursive(arr, target, mid+1, right)
	}
	// If target is smaller, search left half
	return BinarySearchRecursive(arr, target, left, mid-1)
}

// BinarySearchFirstOccurrence finds first occurrence of target in sorted slice
// Returns index of first occurrence if found, -1 otherwise
//
// Time Complexity: O(log n)
// Space Complexity: O(1)
func BinarySearchFirstOccurrence(arr []int, target int) int {
	left, right := 0, len(arr)-1
	result := -1

	for left <= right {
		mid := left + (right-left)/2

		if arr[mid] == target {
			result = mid
			right = mid - 1 // Continue searching left
		} else if arr[mid] < target {
			left = mid + 1
		} else {
			right = mid - 1
		}
	}

	return result
}

// BinarySearchLastOccurrence finds last occurrence of target in sorted slice
// Returns index of last occurrence if found, -1 otherwise
//
// Time Complexity: O(log n)
// Space Complexity: O(1)
func BinarySearchLastOccurrence(arr []int, target int) int {
	left, right := 0, len(arr)-1
	result := -1

	for left <= right {
		mid := left + (right-left)/2

		if arr[mid] == target {
			result = mid
			left = mid + 1 // Continue searching right
		} else if arr[mid] < target {
			left = mid + 1
		} else {
			right = mid - 1
		}
	}

	return result
}

