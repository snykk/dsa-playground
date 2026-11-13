package main

import "fmt"

// CountingSort returns a sorted copy of arr using stable Counting Sort.
// Negative values are supported: a value x is counted in count[x-minVal], so
// the count array has maxVal-minVal+1 slots. It panics if a value is larger
// than maxVal.
func CountingSort(arr []int, maxVal int) []int {
	if len(arr) == 0 {
		return arr
	}

	minVal := arr[0]
	for _, num := range arr {
		if num > maxVal {
			panic(fmt.Sprintf("CountingSort: value %d is larger than maxVal %d", num, maxVal))
		}
		if num < minVal {
			minVal = num
		}
	}

	count := make([]int, maxVal-minVal+1)

	for _, num := range arr {
		count[num-minVal]++
	}

	for i := 1; i < len(count); i++ {
		count[i] += count[i-1]
	}

	output := make([]int, len(arr))

	for i := len(arr) - 1; i >= 0; i-- {
		output[count[arr[i]-minVal]-1] = arr[i]
		count[arr[i]-minVal]--
	}

	return output
}
