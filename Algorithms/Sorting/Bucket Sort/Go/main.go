package main

import "sort"

// BucketSort sorts a slice of floats using Bucket Sort algorithm
func BucketSort(arr []float64) {
	if len(arr) == 0 {
		return
	}
	
	n := len(arr)
	buckets := make([][]float64, n)
	
	// Insert elements into buckets
	for _, num := range arr {
		bucketIndex := int(num * float64(n))
		if bucketIndex == n {
			bucketIndex = n - 1
		}
		buckets[bucketIndex] = append(buckets[bucketIndex], num)
	}
	
	// Sort individual buckets
	for _, bucket := range buckets {
		sort.Float64s(bucket)
	}
	
	// Concatenate all buckets
	index := 0
	for _, bucket := range buckets {
		for _, num := range bucket {
			arr[index] = num
			index++
		}
	}
}

