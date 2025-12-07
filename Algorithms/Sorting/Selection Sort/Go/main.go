package main

// SelectionSort sorts a slice using Selection Sort algorithm
func SelectionSort(arr []int) {
	n := len(arr)
	
	for i := 0; i < n; i++ {
		minIdx := i
		
		for j := i + 1; j < n; j++ {
			if arr[j] < arr[minIdx] {
				minIdx = j
			}
		}
		
		arr[i], arr[minIdx] = arr[minIdx], arr[i]
	}
}

