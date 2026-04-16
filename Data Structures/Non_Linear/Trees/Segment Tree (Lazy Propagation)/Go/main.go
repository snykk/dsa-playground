package main

// LazySegmentTree supports range sum queries and range updates with lazy propagation.
type LazySegmentTree struct {
	n    int
	tree []int64
	lazy []int64
}

// NewLazySegmentTree builds a segment tree with lazy propagation from the given array.
func NewLazySegmentTree(arr []int) *LazySegmentTree {
	n := len(arr)
	st := &LazySegmentTree{
		n:    n,
		tree: make([]int64, 4*n),
		lazy: make([]int64, 4*n),
	}
	if n > 0 {
		st.build(arr, 1, 0, n-1)
	}
	return st
}

func (st *LazySegmentTree) build(arr []int, node, start, end int) {
	if start == end {
		st.tree[node] = int64(arr[start])
	} else {
		mid := (start + end) / 2
		st.build(arr, 2*node, start, mid)
		st.build(arr, 2*node+1, mid+1, end)
		st.tree[node] = st.tree[2*node] + st.tree[2*node+1]
	}
}

func (st *LazySegmentTree) pushDown(node, start, end int) {
	if st.lazy[node] != 0 {
		mid := (start + end) / 2
		leftCount := int64(mid - start + 1)
		rightCount := int64(end - mid)

		st.tree[2*node] += st.lazy[node] * leftCount
		st.lazy[2*node] += st.lazy[node]

		st.tree[2*node+1] += st.lazy[node] * rightCount
		st.lazy[2*node+1] += st.lazy[node]

		st.lazy[node] = 0
	}
}

func (st *LazySegmentTree) updateRangeHelper(node, start, end, left, right int, val int64) {
	if right < start || end < left {
		return
	}
	if left <= start && end <= right {
		st.tree[node] += val * int64(end-start+1)
		st.lazy[node] += val
		return
	}
	st.pushDown(node, start, end)
	mid := (start + end) / 2
	st.updateRangeHelper(2*node, start, mid, left, right, val)
	st.updateRangeHelper(2*node+1, mid+1, end, left, right, val)
	st.tree[node] = st.tree[2*node] + st.tree[2*node+1]
}

func (st *LazySegmentTree) queryHelper(node, start, end, left, right int) int64 {
	if right < start || end < left {
		return 0
	}
	if left <= start && end <= right {
		return st.tree[node]
	}
	st.pushDown(node, start, end)
	mid := (start + end) / 2
	leftSum := st.queryHelper(2*node, start, mid, left, right)
	rightSum := st.queryHelper(2*node+1, mid+1, end, left, right)
	return leftSum + rightSum
}

// UpdateRange adds val to all elements in range [left, right] (inclusive, 0-indexed).
func (st *LazySegmentTree) UpdateRange(left, right int, val int64) {
	st.updateRangeHelper(1, 0, st.n-1, left, right, val)
}

// Query returns the sum of elements in range [left, right] (inclusive, 0-indexed).
func (st *LazySegmentTree) Query(left, right int) int64 {
	return st.queryHelper(1, 0, st.n-1, left, right)
}

func main() {
	arr := []int{1, 3, 5, 7, 9, 11}
	st := NewLazySegmentTree(arr)
	println("Query [0,5]:", st.Query(0, 5)) // 36
	st.UpdateRange(1, 4, 10)
	println("After update_range [1,4]+10, Query [0,5]:", st.Query(0, 5)) // 76
}
