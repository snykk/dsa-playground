package main

// InterpolationSearch searches for target in sorted, uniformly distributed slice
// Returns index of target if found, -1 otherwise
//
// Time Complexity: O(log log n) average, O(n) worst case
// Space Complexity: O(1)
func InterpolationSearch(arr []int, target int) int {
	left, right := 0, len(arr)-1

	for left <= right && arr[left] <= target && target <= arr[right] {
		// If search space has only one element, or all of its values are equal
		// (a run of duplicates): there is nothing to interpolate, and the
		// formula below would divide by zero (arr[right]-arr[left] == 0)
		if left == right || arr[left] == arr[right] {
			if arr[left] == target {
				return left
			}
			return -1
		}

		// Calculate position using interpolation formula
		pos := left + interpolationOffset(arr, target, left, right)

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

	// If search space has only one element, or all of its values are equal
	// (a run of duplicates): there is nothing to interpolate, and the
	// formula below would divide by zero (arr[right]-arr[left] == 0)
	if left == right || arr[left] == arr[right] {
		if arr[left] == target {
			return left
		}
		return -1
	}

	// Calculate position using interpolation formula
	pos := left + interpolationOffset(arr, target, left, right)

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

// interpolationOffset returns how far past left the target should sit, i.e.
// (target - arr[left]) * (right - left) / (arr[right] - arr[left]) truncated.
// It needs arr[left] <= target <= arr[right] and arr[left] < arr[right].
// The differences are taken as uint64: they are non-negative and always fit,
// while int subtraction can overflow (math.MaxInt64 - math.MinInt64).
func interpolationOffset(arr []int, target, left, right int) int {
	num := float64(uint64(target) - uint64(arr[left]))
	den := float64(uint64(arr[right]) - uint64(arr[left]))
	return int(num * float64(right-left) / den)
}
