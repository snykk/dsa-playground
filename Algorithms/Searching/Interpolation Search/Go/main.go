package main

// InterpolationSearch searches for target in sorted, uniformly distributed slice
// Returns index of target if found, -1 otherwise
//
// Time Complexity: O(log log n) average, O(n) worst case
// Space Complexity: O(1)
func InterpolationSearch(arr []int, target int) int {
	left, right := 0, len(arr)-1

	for left <= right && arr[left] <= target && target <= arr[right] {
		// If search space has only one element
		if left == right {
			if arr[left] == target {
				return left
			}
			return -1
		}

		// Calculate position using interpolation formula
		pos := left + int((float64(target-arr[left])*float64(right-left))/float64(arr[right]-arr[left]))

		// Check if target is at calculated position
		if arr[pos] == target {
			return pos
		}

		// If target is smaller, search left
		if arr[pos] > target {
			right = pos - 1
		} else {
			// If target is larger, search right
			left = pos + 1
		}
	}

	// Target not found
	return -1
}

// InterpolationSearchRecursive searches for target recursively
// Returns index of target if found, -1 otherwise
//
// Time Complexity: O(log log n) average, O(n) worst case
// Space Complexity: O(log log n) average, O(n) worst case
func InterpolationSearchRecursive(arr []int, target int, left int, right int) int {
	// Base case: search space exhausted or target out of range
	if left > right || arr[left] > target || arr[right] < target {
		return -1
	}

	// If search space has only one element
	if left == right {
		if arr[left] == target {
			return left
		}
		return -1
	}

	// Calculate position using interpolation formula
	pos := left + int((float64(target-arr[left])*float64(right-left))/float64(arr[right]-arr[left]))

	// Check if target is at calculated position
	if arr[pos] == target {
		return pos
	}

	// If target is smaller, search left
	if arr[pos] > target {
		return InterpolationSearchRecursive(arr, target, left, pos-1)
	}
	// If target is larger, search right
	return InterpolationSearchRecursive(arr, target, pos+1, right)
}

