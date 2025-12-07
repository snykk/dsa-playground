package main

// RadixSort sorts a slice using Radix Sort algorithm
func RadixSort(arr []int) {
	if len(arr) == 0 {
		return
	}
	
	maxNum := arr[0]
	for _, num := range arr {
		if num > maxNum {
			maxNum = num
		}
	}
	
	for exp := 1; maxNum/exp > 0; exp *= 10 {
		countingSortByDigit(arr, exp)
	}
}

func countingSortByDigit(arr []int, exp int) {
	n := len(arr)
	output := make([]int, n)
	count := make([]int, 10)
	
	for i := 0; i < n; i++ {
		count[(arr[i]/exp)%10]++
	}
	
	for i := 1; i < 10; i++ {
		count[i] += count[i-1]
	}
	
	for i := n - 1; i >= 0; i-- {
		output[count[(arr[i]/exp)%10]-1] = arr[i]
		count[(arr[i]/exp)%10]--
	}
	
	copy(arr, output)
}

