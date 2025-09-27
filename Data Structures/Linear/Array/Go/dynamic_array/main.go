package main

import "fmt"

func main() {
	arr := []int{1, 2, 3}

	// Append
	arr = append(arr, 4)
	// Insert at index 1
	arr = append(arr[:1], append([]int{10}, arr[1:]...)...)
	// Remove index 2
	arr = append(arr[:2], arr[3:]...)

	fmt.Println("Dynamic Array:", arr)
	fmt.Println("Length:", len(arr), "Capacity:", cap(arr))
}
