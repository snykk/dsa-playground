package main

type FenwickTree struct {
	n    int
	tree []int
}

func NewFenwickTree(arr []int) *FenwickTree {
	n := len(arr)
	tree := make([]int, n+1)

	ft := &FenwickTree{n: n, tree: tree}
	for i := 0; i < n; i++ {
		ft.Update(i, arr[i])
	}
	return ft
}

func (ft *FenwickTree) lsb(index int) int {
	return index & (-index)
}

// check panics unless 0 <= index < n (a negative index would loop forever).
func (ft *FenwickTree) check(index int) {
	if index < 0 || index >= ft.n {
		panic("fenwick tree: index out of range")
	}
}

func (ft *FenwickTree) Update(index int, delta int) {
	ft.check(index)
	index++
	for index <= ft.n {
		ft.tree[index] += delta
		index += ft.lsb(index)
	}
}

func (ft *FenwickTree) PrefixSum(index int) int {
	ft.check(index)
	index++
	result := 0
	for index > 0 {
		result += ft.tree[index]
		index -= ft.lsb(index)
	}
	return result
}

func (ft *FenwickTree) Query(left int, right int) int {
	ft.check(left)
	ft.check(right)
	if left > right {
		panic("fenwick tree: left is greater than right")
	}
	if left == 0 {
		return ft.PrefixSum(right)
	}
	return ft.PrefixSum(right) - ft.PrefixSum(left-1)
}

func (ft *FenwickTree) Get(index int) int {
	return ft.Query(index, index)
}

func main() {
	arr := []int{1, 3, 5, 7, 9, 11}
	ft := NewFenwickTree(arr)
	println("Query [0,2]:", ft.Query(0, 2)) // 9
}
