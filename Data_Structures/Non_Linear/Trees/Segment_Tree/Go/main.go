package main

type SegmentTree struct {
	n    int
	size int
	tree []int
}

func NewSegmentTree(arr []int) *SegmentTree {
	n := len(arr)
	size := 1
	for size < n {
		size *= 2
	}
	tree := make([]int, 2*size)

	for i := 0; i < n; i++ {
		tree[size+i] = arr[i]
	}
	for i := size - 1; i > 0; i-- {
		tree[i] = tree[2*i] + tree[2*i+1]
	}

	return &SegmentTree{n: n, size: size, tree: tree}
}

// check panics unless 0 <= index < n.
func (st *SegmentTree) check(index int) {
	if index < 0 || index >= st.n {
		panic("segment tree: index out of range")
	}
}

// Update assigns value to element index.
func (st *SegmentTree) Update(index int, value int) {
	st.check(index)
	index += st.size
	st.tree[index] = value
	index /= 2
	for index > 0 {
		st.tree[index] = st.tree[2*index] + st.tree[2*index+1]
		index /= 2
	}
}

// Query returns the sum of elements left..right, inclusive.
func (st *SegmentTree) Query(left int, right int) int {
	st.check(left)
	st.check(right)
	if left > right {
		panic("segment tree: left is greater than right")
	}
	left += st.size
	right += st.size
	result := 0

	for left <= right {
		if left%2 == 1 {
			result += st.tree[left]
			left++
		}
		if right%2 == 0 {
			result += st.tree[right]
			right--
		}
		left /= 2
		right /= 2
	}

	return result
}

func (st *SegmentTree) Get(index int) int {
	st.check(index)
	return st.tree[st.size+index]
}

func main() {
	arr := []int{1, 3, 5, 7, 9, 11}
	st := NewSegmentTree(arr)
	println("Query [0,2]:", st.Query(0, 2)) // 9
}
