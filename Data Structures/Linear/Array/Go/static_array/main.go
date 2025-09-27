package main

import "fmt"

func main() {
	var arr [5]int = [5]int{1, 2, 3, 4, 5}
	fmt.Println("Static Array:", arr)

	// Access & Update
	fmt.Println("Element at index 2:", arr[2])
	arr[2] = 10
	fmt.Println("After update:", arr)
}
