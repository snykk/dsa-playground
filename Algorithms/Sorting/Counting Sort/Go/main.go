package main

// CountingSort sorts a slice using Counting Sort algorithm
func CountingSort(arr []int, maxVal int) []int {
	if len(arr) == 0 {
		return arr
	}
	
	count := make([]int, maxVal+1)
	
	for _, num := range arr {
		count[num]++
	}
	
	for i := 1; i < len(count); i++ {
		count[i] += count[i-1]
	}
	
	output := make([]int, len(arr))
	
	for i := len(arr) - 1; i >= 0; i-- {
		output[count[arr[i]]-1] = arr[i]
		count[arr[i]]--
	}
	
	return output
}

