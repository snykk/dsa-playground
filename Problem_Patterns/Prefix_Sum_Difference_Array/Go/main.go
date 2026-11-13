package main

import "fmt"

type PrefixSum struct {
	prefix []int
}

func NewPrefixSum(arr []int) *PrefixSum {
	prefix := make([]int, len(arr)+1)
	for i, num := range arr {
		prefix[i+1] = prefix[i] + num
	}
	return &PrefixSum{prefix: prefix}
}

func (ps *PrefixSum) Query(left, right int) int {
	return ps.prefix[right+1] - ps.prefix[left]
}

type DifferenceArray struct {
	diff []int
	size int
}

func NewDifferenceArray(size int) *DifferenceArray {
	return &DifferenceArray{
		diff: make([]int, size+1),
		size: size,
	}
}

func (da *DifferenceArray) Update(left, right, value int) {
	da.diff[left] += value
	if right+1 < len(da.diff) {
		da.diff[right+1] -= value
	}
}

func (da *DifferenceArray) GetArray() []int {
	result := make([]int, da.size)
	current := 0
	for i := 0; i < da.size; i++ {
		current += da.diff[i]
		result[i] = current
	}
	return result
}

func main() {
	arr := []int{1, 2, 3, 4, 5}
	ps := NewPrefixSum(arr)
	fmt.Printf("Sum[0, 4]: %d\n", ps.Query(0, 4))
}
