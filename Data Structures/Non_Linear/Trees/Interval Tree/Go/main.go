package main

// Interval represents an interval [low, high]
type Interval struct {
	Low  int
	High int
}

// NewInterval creates a new interval
func NewInterval(low, high int) Interval {
	if low > high {
		low, high = high, low
	}
	return Interval{Low: low, High: high}
}

// Overlaps checks if this interval overlaps with another
func (i Interval) Overlaps(other Interval) bool {
	return !(i.High < other.Low || other.High < i.Low)
}

// ContainsPoint checks if this interval contains a point
func (i Interval) ContainsPoint(point int) bool {
	return i.Low <= point && point <= i.High
}

// IntervalNode represents a node in the Interval Tree
type IntervalNode struct {
	interval Interval
	max      int
	left     *IntervalNode
	right    *IntervalNode
}

// IntervalTree represents an Interval Tree
type IntervalTree struct {
	root *IntervalNode
}

// NewIntervalTree creates a new empty Interval Tree
func NewIntervalTree() *IntervalTree {
	return &IntervalTree{root: nil}
}

// Insert inserts an interval into the tree
func (it *IntervalTree) Insert(interval Interval) {
	it.root = it.insertRecursive(it.root, interval)
	it.updateMax(it.root)
}

// insertRecursive is a helper for insertion
func (it *IntervalTree) insertRecursive(node *IntervalNode, interval Interval) *IntervalNode {
	if node == nil {
		return &IntervalNode{interval: interval, max: interval.High}
	}

	if interval.Low < node.interval.Low {
		node.left = it.insertRecursive(node.left, interval)
	} else {
		node.right = it.insertRecursive(node.right, interval)
	}

	if interval.High > node.max {
		node.max = interval.High
	}

	return node
}

// updateMax updates max values in the tree
func (it *IntervalTree) updateMax(node *IntervalNode) {
	if node == nil {
		return
	}

	it.updateMax(node.left)
	it.updateMax(node.right)

	node.max = node.interval.High
	if node.left != nil && node.left.max > node.max {
		node.max = node.left.max
	}
	if node.right != nil && node.right.max > node.max {
		node.max = node.right.max
	}
}

// SearchOverlapping finds all intervals that overlap with query
func (it *IntervalTree) SearchOverlapping(query Interval) []Interval {
	result := []Interval{}
	it.searchOverlappingRecursive(it.root, query, &result)
	return result
}

// searchOverlappingRecursive is a helper for overlap search
func (it *IntervalTree) searchOverlappingRecursive(node *IntervalNode, query Interval, result *[]Interval) {
	if node == nil {
		return
	}

	if node.interval.Overlaps(query) {
		*result = append(*result, node.interval)
	}

	if node.left != nil && node.left.max >= query.Low {
		it.searchOverlappingRecursive(node.left, query, result)
	}

	if node.right != nil && node.interval.Low <= query.High {
		it.searchOverlappingRecursive(node.right, query, result)
	}
}

// SearchContainingPoint finds all intervals containing a point
func (it *IntervalTree) SearchContainingPoint(point int) []Interval {
	query := NewInterval(point, point)
	return it.SearchOverlapping(query)
}

// IsEmpty checks if tree is empty
func (it *IntervalTree) IsEmpty() bool {
	return it.root == nil
}

