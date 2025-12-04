package main

import (
	"math"
)

type SparseTable struct {
	n         int
	logN      int
	arr       []int
	table     [][]int
	queryType string
}

func NewSparseTable(arr []int, queryType string) *SparseTable {
	n := len(arr)
	logN := int(math.Floor(math.Log2(float64(n)))) + 1

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

func (st *SparseTable) Query(left int, right int) int {
	if left > right {
		left, right = right, left
	}

	// Find largest power of 2 that fits in range length
	length := right - left + 1
	k := int(math.Floor(math.Log2(float64(length))))

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
	return st.arr[index]
}

func main() {
	arr := []int{1, 3, 5, 7, 9, 11, 2, 4, 6, 8}
	st := NewSparseTable(arr, "min")
	println("Query [0,2]:", st.Query(0, 2)) // 1
}

