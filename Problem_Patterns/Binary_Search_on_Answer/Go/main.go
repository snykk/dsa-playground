package main

import (
	"fmt"
	"sort"
)

func binarySearchAnswer(left, right int, condition func(int) bool) int {
	result := -1
	for left <= right {
		mid := left + (right-left)/2
		if condition(mid) {
			result = mid
			right = mid - 1
		} else {
			left = mid + 1
		}
	}
	return result
}

func findMinCapacity(weights []int, days int) int {
	canShip := func(capacity int) bool {
		currentWeight := 0
		daysNeeded := 1
		for _, weight := range weights {
			if weight > capacity {
				return false
			}
			if currentWeight+weight > capacity {
				daysNeeded++
				currentWeight = weight
			} else {
				currentWeight += weight
			}
		}
		return daysNeeded <= days
	}

	left := 0
	right := 0
	for _, w := range weights {
		if w > left {
			left = w
		}
		right += w
	}

	return binarySearchAnswer(left, right, canShip)
}

func findKthSmallestDistance(nums []int, k int) int {
	// Sort nums first
	sorted := make([]int, len(nums))
	copy(sorted, nums)
	sort.Ints(sorted)

	countPairsWithDistanceLeq := func(dist int) int {
		count := 0
		left := 0
		for right := 0; right < len(sorted); right++ {
			for sorted[right]-sorted[left] > dist {
				left++
			}
			count += right - left
		}
		return count
	}

	left := 0
	right := sorted[len(sorted)-1] - sorted[0]
	return binarySearchAnswer(left, right, func(d int) bool {
		return countPairsWithDistanceLeq(d) >= k
	})
}

func splitArrayLargestSum(nums []int, m int) int {
	canSplit := func(maxSum int) bool {
		currentSum := 0
		splits := 1
		for _, num := range nums {
			if currentSum+num > maxSum {
				splits++
				currentSum = num
			} else {
				currentSum += num
			}
		}
		return splits <= m
	}

	left := 0
	right := 0
	for _, n := range nums {
		if n > left {
			left = n
		}
		right += n
	}

	return binarySearchAnswer(left, right, canSplit)
}

func main() {
	weights := []int{1, 2, 3, 4, 5, 6, 7, 8, 9, 10}
	days := 5
	result := findMinCapacity(weights, days)
	fmt.Printf("Minimum capacity: %d\n", result)

	nums := []int{1, 3, 1}
	k := 1
	result = findKthSmallestDistance(nums, k)
	fmt.Printf("K-th smallest distance: %d\n", result)

	nums = []int{7, 2, 5, 10, 8}
	m := 2
	result = splitArrayLargestSum(nums, m)
	fmt.Printf("Split array largest sum: %d\n", result)
}
