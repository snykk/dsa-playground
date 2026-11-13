package main

// Interval represents an interval [low, high]
type Interval struct {
	Low  int
	High int
}

// NewInterval creates a new interval (a low greater than high swaps the bounds)
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

// IntervalTree is an augmented binary search tree (not self-balancing) keyed by low,
// each node storing the maximum high of its subtree. Insert and delete cost O(h),
// h = height: about log n on random input, up to n on sorted input.
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

// recomputeMax recomputes node.max from its own interval and its children.
func recomputeMax(node *IntervalNode) {
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

// SearchContainedIn finds all intervals completely inside query
func (it *IntervalTree) SearchContainedIn(query Interval) []Interval {
	result := []Interval{}
	it.searchContainedRecursive(it.root, query, &result)
	return result
}

func (it *IntervalTree) searchContainedRecursive(node *IntervalNode, query Interval, result *[]Interval) {
	if node == nil {
		return
	}
	if query.Low <= node.interval.Low && node.interval.High <= query.High {
		*result = append(*result, node.interval)
	}
	if node.left != nil && node.left.max >= query.Low {
		it.searchContainedRecursive(node.left, query, result)
	}
	if node.right != nil && node.interval.Low <= query.High {
		it.searchContainedRecursive(node.right, query, result)
	}
}

// Delete removes one interval equal to the argument and reports whether one existed.
func (it *IntervalTree) Delete(interval Interval) bool {
	removed := false
	it.root = it.deleteRecursive(it.root, interval, &removed)
	return removed
}

func (it *IntervalTree) deleteRecursive(node *IntervalNode, interval Interval, removed *bool) *IntervalNode {
	if node == nil {
		return nil
	}
	if interval.Low < node.interval.Low {
		node.left = it.deleteRecursive(node.left, interval, removed)
	} else if interval.Low > node.interval.Low || node.interval.High != interval.High {
		// equal lows go right, so a same-low interval with another high is on the right
		node.right = it.deleteRecursive(node.right, interval, removed)
	} else {
		*removed = true
		if node.left == nil {
			return node.right
		}
		if node.right == nil {
			return node.left
		}
		successor := node.right
		for successor.left != nil {
			successor = successor.left
		}
		node.interval = successor.interval
		unused := false
		node.right = it.deleteRecursive(node.right, successor.interval, &unused)
	}
	recomputeMax(node)
	return node
}

// InorderTraversal returns all intervals sorted by low (ties in insertion order).
func (it *IntervalTree) InorderTraversal() []Interval {
	result := []Interval{}
	var walk func(*IntervalNode)
	walk = func(n *IntervalNode) {
		if n == nil {
			return
		}
		walk(n.left)
		result = append(result, n.interval)
		walk(n.right)
	}
	walk(it.root)
	return result
}

// Size returns the number of stored intervals.
func (it *IntervalTree) Size() int {
	return len(it.InorderTraversal())
}

// IsEmpty checks if tree is empty
func (it *IntervalTree) IsEmpty() bool {
	return it.root == nil
}

func main() {
	tree := NewIntervalTree()
	for _, iv := range [][2]int{{15, 20}, {10, 30}, {17, 19}, {5, 20}, {12, 15}, {30, 40}} {
		tree.Insert(NewInterval(iv[0], iv[1]))
	}
	println("Overlaps [14,16]:", len(tree.SearchOverlapping(NewInterval(14, 16)))) // 4
}
