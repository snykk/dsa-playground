package main

// QuickSort sorts a slice using Quick Sort algorithm
func QuickSort(arr []int) {
	if len(arr) <= 1 {
		return
	}
	
	low, high := 0, len(arr)-1
	quickSort(arr, low, high)
}

func quickSort(arr []int, low, high int) {
	if low < high {
		pi := partition(arr, low, high)
		quickSort(arr, low, pi-1)
		quickSort(arr, pi+1, high)
	}
}

func partition(arr []int, low, high int) int {
	pivot := arr[high]
	i := low
	
	for j := low; j < high; j++ {
		if arr[j] <= pivot {
			arr[i], arr[j] = arr[j], arr[i]
			i++
		}
	}
	arr[i], arr[high] = arr[high], arr[i]
	return i
}

