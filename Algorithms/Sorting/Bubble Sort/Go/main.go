package main

// BubbleSort sorts a slice using Bubble Sort algorithm
func BubbleSort(arr []int) {
	n := len(arr)
	
	for i := 0; i < n; i++ {
		swapped := false
		
		// Last i elements are already in place
		for j := 0; j < n-i-1; j++ {
			if arr[j] > arr[j+1] {
				arr[j], arr[j+1] = arr[j+1], arr[j]
				swapped = true
			}
		}
		
		// If no swaps occurred, array is sorted
		if !swapped {
			break
		}
	}
}

// BubbleSortGeneric sorts any comparable slice
func BubbleSortGeneric[T comparable](arr []T, less func(T, T) bool) {
	n := len(arr)
	
	for i := 0; i < n; i++ {
		swapped := false
		
		for j := 0; j < n-i-1; j++ {
			if less(arr[j+1], arr[j]) {
				arr[j], arr[j+1] = arr[j+1], arr[j]
				swapped = true
			}
		}
		
		if !swapped {
			break
		}
	}
}

