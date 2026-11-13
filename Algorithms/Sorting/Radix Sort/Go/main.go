package main

// RadixSort sorts a slice using LSD Radix Sort (base 10).
// Negative values are supported: when the minimum is negative, the digits are
// taken from the shifted key value-minimum, which is never negative and has the
// same order as the values.
func RadixSort(arr []int) {
	if len(arr) == 0 {
		return
	}

	minNum, maxNum := arr[0], arr[0]
	for _, num := range arr {
		if num > maxNum {
			maxNum = num
		}
		if num < minNum {
			minNum = num
		}
	}

	// Shift negative input so that every key (value - offset) is >= 0.
	offset := 0
	if minNum < 0 {
		offset = minNum
	}
	// uint64 arithmetic: value - offset can exceed the int range, and the
	// modular subtraction still gives the exact (non-negative) distance.
	maxKey := uint64(maxNum) - uint64(offset)

	for exp := uint64(1); maxKey/exp > 0; exp *= 10 {
		countingSortByDigit(arr, exp, offset)
		if exp > maxKey/10 { // no higher digit left; also keeps exp*10 from overflowing
			break
		}
	}
}

// countingSortByDigit is a stable counting sort of arr by the digit
// (key / exp) % 10 of key = value - offset.
func countingSortByDigit(arr []int, exp uint64, offset int) {
	n := len(arr)
	output := make([]int, n)
	count := make([]int, 10)
	digit := func(v int) int { return int((uint64(v) - uint64(offset)) / exp % 10) }

	for i := 0; i < n; i++ {
		count[digit(arr[i])]++
	}

	for i := 1; i < 10; i++ {
		count[i] += count[i-1]
	}

	for i := n - 1; i >= 0; i-- {
		output[count[digit(arr[i])]-1] = arr[i]
		count[digit(arr[i])]--
	}

	copy(arr, output)
}
