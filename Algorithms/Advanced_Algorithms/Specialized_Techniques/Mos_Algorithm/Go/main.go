package main

import (
	"fmt"
	"math"
	"sort"
)

type MoSAlgorithm struct {
	arr       []int
	n         int
	blockSize int
}

func NewMoSAlgorithm(arr []int) *MoSAlgorithm {
	n := len(arr)
	blockSize := int(math.Sqrt(float64(n)))
	if blockSize < 1 {
		blockSize = 1
	}
	return &MoSAlgorithm{
		arr:       arr,
		n:         n,
		blockSize: blockSize,
	}
}

func (mo *MoSAlgorithm) getBlock(index int) int {
	return index / mo.blockSize
}

func (mo *MoSAlgorithm) add(currentAns int, value int, freq map[int]int) int {
	freq[value]++
	if freq[value] == 1 {
		return currentAns + 1
	}
	return currentAns
}

func (mo *MoSAlgorithm) remove(currentAns int, value int, freq map[int]int) int {
	freq[value]--
	if freq[value] == 0 {
		delete(freq, value)
		return currentAns - 1
	}
	return currentAns
}

func (mo *MoSAlgorithm) processQueries(queries [][]int) []int {
	type queryWithIdx struct {
		idx int
		l   int
		r   int
	}

	sortedQueries := make([]queryWithIdx, len(queries))
	for i, q := range queries {
		sortedQueries[i] = queryWithIdx{i, q[0], q[1]}
	}

	sort.Slice(sortedQueries, func(i, j int) bool {
		blockI := mo.getBlock(sortedQueries[i].l)
		blockJ := mo.getBlock(sortedQueries[j].l)
		if blockI != blockJ {
			return blockI < blockJ
		}
		return sortedQueries[i].r < sortedQueries[j].r
	})

	answers := make([]int, len(queries))
	currentL := 0
	currentR := -1
	currentAns := 0
	freq := make(map[int]int)

	for _, q := range sortedQueries {
		l, r := q.l, q.r

		for currentL > l {
			currentL--
			currentAns = mo.add(currentAns, mo.arr[currentL], freq)
		}

		for currentR < r {
			currentR++
			currentAns = mo.add(currentAns, mo.arr[currentR], freq)
		}

		for currentL < l {
			currentAns = mo.remove(currentAns, mo.arr[currentL], freq)
			currentL++
		}

		for currentR > r {
			currentAns = mo.remove(currentAns, mo.arr[currentR], freq)
			currentR--
		}

		answers[q.idx] = currentAns
	}

	return answers
}

func countDistinctInRanges(arr []int, queries [][]int) []int {
	mo := NewMoSAlgorithm(arr)
	return mo.processQueries(queries)
}

func main() {
	fmt.Println("Mo's Algorithm Examples:")
	fmt.Println()

	arr := []int{1, 1, 2, 1, 3, 4, 3, 3, 4}
	queries := [][]int{{0, 4}, {1, 3}, {2, 6}, {0, 8}}

	fmt.Printf("Array: %v\n", arr)
	fmt.Printf("Queries: %v\n", queries)
	fmt.Println()

	results := countDistinctInRanges(arr, queries)
	fmt.Println("Distinct counts for each query:")
	for i, q := range queries {
		fmt.Printf("  Range [%d, %d]: %d distinct elements\n", q[0], q[1], results[i])
	}
}
