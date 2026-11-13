package main

// KadaneAlgorithm finds maximum sum of contiguous subarray
func KadaneAlgorithm(arr []int) int {
	if len(arr) == 0 {
		return 0
	}

	maxSum := arr[0]
	currentSum := arr[0]

	for i := 1; i < len(arr); i++ {
		if currentSum < 0 {
			currentSum = arr[i]
		} else {
			currentSum += arr[i]
		}
		if currentSum > maxSum {
			maxSum = currentSum
		}
	}

	return maxSum
}

