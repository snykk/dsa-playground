package main

import (
	"fmt"
	"math"
)

type SqrtDecomposition struct {
	arr        []int
	n          int
	blockSize  int
	blockCount int
	blocks     []int
}

func NewSqrtDecomposition(arr []int) *SqrtDecomposition {
	n := len(arr)
	blockSize := int(math.Ceil(math.Sqrt(float64(n))))
	if blockSize < 1 {
		blockSize = 1
	}
	blockCount := (n + blockSize - 1) / blockSize
	blocks := make([]int, blockCount)

	// Precompute block sums
	for i := 0; i < n; i++ {
		blockIdx := i / blockSize
		blocks[blockIdx] += arr[i]
	}

	return &SqrtDecomposition{
		arr:        append([]int(nil), arr...), // copy: Update must not change the caller's slice
		n:          n,
		blockSize:  blockSize,
		blockCount: blockCount,
		blocks:     blocks,
	}
}

func (sd *SqrtDecomposition) Update(index int, value int) {
	blockIdx := index / sd.blockSize
	sd.blocks[blockIdx] += value - sd.arr[index]
	sd.arr[index] = value
}

func (sd *SqrtDecomposition) Query(left, right int) int {
	result := 0
	leftBlock := left / sd.blockSize
	rightBlock := right / sd.blockSize

	if leftBlock == rightBlock {
		// Same block
		for i := left; i <= right; i++ {
			result += sd.arr[i]
		}
	} else {
		// Left partial block
		for i := left; i < (leftBlock+1)*sd.blockSize; i++ {
			result += sd.arr[i]
		}

		// Middle complete blocks
		for i := leftBlock + 1; i < rightBlock; i++ {
			result += sd.blocks[i]
		}

		// Right partial block
		for i := rightBlock * sd.blockSize; i <= right; i++ {
			result += sd.arr[i]
		}
	}

	return result
}

func main() {
	fmt.Println("Square Root Decomposition Examples:")
	fmt.Println()

	arr := []int{1, 2, 3, 4, 5, 6, 7, 8, 9, 10}
	sd := NewSqrtDecomposition(arr)

	fmt.Printf("Array: %v\n", arr)
	fmt.Printf("Block size: %d\n", sd.blockSize)
	fmt.Println()

	result := sd.Query(2, 7)
	fmt.Printf("Sum of range [2, 7]: %d\n", result)

	sd.Update(5, 20)
	result = sd.Query(2, 7)
	fmt.Printf("Sum of range [2, 7] after update: %d\n", result)
}
