package main

import "fmt"

func subsetSumMeetInMiddle(arr []int, target int) bool {
	n := len(arr)
	mid := n / 2

	leftSums := make(map[int]bool)
	leftSums[0] = true
	for i := 0; i < mid; i++ {
		newSums := make(map[int]bool)
		for s := range leftSums {
			newSums[s+arr[i]] = true
		}
		for s := range newSums {
			leftSums[s] = true
		}
	}

	rightSums := make(map[int]bool)
	rightSums[0] = true
	for i := mid; i < n; i++ {
		newSums := make(map[int]bool)
		for s := range rightSums {
			newSums[s+arr[i]] = true
		}
		for s := range newSums {
			rightSums[s] = true
		}
	}

	for leftSum := range leftSums {
		if rightSums[target-leftSum] {
			return true
		}
	}
	return false
}

func main() {
	arr := []int{1, 2, 3, 4, 5, 6}
	fmt.Printf("Subset sum 10: %v\n", subsetSumMeetInMiddle(arr, 10))
}
