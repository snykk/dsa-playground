package main

import (
	"fmt"
	"sort"
)

// BucketSort sorts a slice of floats in [0.0, 1.0] using Bucket Sort with
// len(arr) buckets: x goes to bucket int(x*n) and 1.0 goes to the last bucket.
// It panics for any other value (negative, above 1.0 or NaN), which would have
// no bucket.
func BucketSort(arr []float64) {
	if len(arr) == 0 {
		return
	}

	for _, num := range arr {
		if !(num >= 0 && num <= 1) { // written this way to also reject NaN
			panic(fmt.Sprintf("BucketSort: value %v is outside [0, 1]", num))
		}
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
