package main

import (
	"math/bits"
)

type SparseTable struct {
	n         int
	logN      int
	arr       []int
	table     [][]int
	queryType string
}

// NewSparseTable builds the table. queryType must be "min" or "max" (anything else
// panics). An empty slice is allowed; every Query on it panics. The slice is copied.
func NewSparseTable(arr []int, queryType string) *SparseTable {
	if queryType != "min" && queryType != "max" {
		panic("sparse table: queryType must be \"min\" or \"max\"")
	}
	arr = append([]int(nil), arr...)
	n := len(arr)
	// Number of levels: floor(log2(n)) + 1, with integers (0 for n = 0)
	logN := bits.Len(uint(n))

	// Build sparse table
	// table[i][j] = min/max of range starting at i with length 2^j
	table := make([][]int, n)
	for i := range table {
		table[i] = make([]int, logN)
		table[i][0] = arr[i]
	}

	// Fill table using dynamic programming
	for j := 1; j < logN; j++ {
		for i := 0; i < n-(1<<j)+1; i++ {
			if queryType == "min" {
				table[i][j] = min(
					table[i][j-1],
					table[i+(1<<(j-1))][j-1],
				)
			} else { // max
				table[i][j] = max(
					table[i][j-1],
					table[i+(1<<(j-1))][j-1],
				)
			}
		}
	}

	return &SparseTable{
		n:         n,
		logN:      logN,
		arr:       arr,
		table:     table,
		queryType: queryType,
	}
}

// Query returns the min or max of left..right (inclusive). Swapped bounds are
// reordered; an index outside [0, n) panics.
func (st *SparseTable) Query(left int, right int) int {
	if left > right {
		left, right = right, left
	}
	if left < 0 || right >= st.n {
		panic("sparse table: range out of bounds")
	}

	// Largest k with 2^k <= length
	length := right - left + 1
	k := bits.Len(uint(length)) - 1

	// Query two overlapping ranges of length 2^k
	if st.queryType == "min" {
		return min(
			st.table[left][k],
			st.table[right-(1<<k)+1][k],
		)
	} else { // max
		return max(
			st.table[left][k],
			st.table[right-(1<<k)+1][k],
		)
	}
}

func (st *SparseTable) Get(index int) int {
	if index < 0 || index >= st.n {
		panic("sparse table: index out of range")
	}
	return st.arr[index]
}

func main() {
	arr := []int{1, 3, 5, 7, 9, 11, 2, 4, 6, 8}
	st := NewSparseTable(arr, "min")
	println("Query [0,2]:", st.Query(0, 2)) // 1
}
