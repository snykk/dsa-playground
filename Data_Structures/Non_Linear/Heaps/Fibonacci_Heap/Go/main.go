package main

// FibonacciHeapNode is a node of the heap and also the handle that Insert
// returns: keep it to call DecreaseKey or Delete on that node later.
type FibonacciHeapNode struct {
	key    int
	degree int
	parent *FibonacciHeapNode
	child  *FibonacciHeapNode
	left   *FibonacciHeapNode
	right  *FibonacciHeapNode
	marked bool
	// false once the node has left its heap (ExtractMin, Delete, Clear): the
	// handle is then stale, and DecreaseKey and Delete panic on it.
	inHeap bool
}

// Key returns the node's current key; it panics on a nil handle.
func (n *FibonacciHeapNode) Key() int {
	if n == nil {
		panic("empty handle")
	}
	return n.key
}

// InHeap reports whether the node is still in a heap (false for nil).
func (n *FibonacciHeapNode) InHeap() bool {
	return n != nil && n.inHeap
}

type FibonacciHeap struct {
	minNode *FibonacciHeapNode
	count   int
	// Work counters for the amortized analysis: trees linked by consolidation
	// and nodes cut from their parent.
	links int
	cuts  int
}

func NewFibonacciHeap() *FibonacciHeap {
	return &FibonacciHeap{minNode: nil, count: 0}
}

func (h *FibonacciHeap) IsEmpty() bool {
	return h.minNode == nil
}

func (h *FibonacciHeap) Size() int {
	return h.count
}

// LinkCount is the number of links made by consolidation so far.
func (h *FibonacciHeap) LinkCount() int {
	return h.links
}

// CutCount is the number of nodes cut from their parent so far.
func (h *FibonacciHeap) CutCount() int {
	return h.cuts
}

func (h *FibonacciHeap) addToRootList(node *FibonacciHeapNode) {
	if h.minNode == nil {
		return
	}
	node.left = h.minNode
	node.right = h.minNode.right
	h.minNode.right.left = node
	h.minNode.right = node
}

func (h *FibonacciHeap) removeFromRootList(node *FibonacciHeapNode) {
	node.left.right = node.right
	node.right.left = node.left
}

func (h *FibonacciHeap) link(child, parent *FibonacciHeapNode) {
	h.removeFromRootList(child)
	child.parent = parent
	child.marked = false

	if parent.child == nil {
		parent.child = child
		child.left = child
		child.right = child
	} else {
		child.left = parent.child
		child.right = parent.child.right
		parent.child.right.left = child
		parent.child.right = child
	}

	parent.degree++
	h.links++
}

func (h *FibonacciHeap) consolidate() {
	if h.minNode == nil {
		return
	}

	degreeTable := make(map[int]*FibonacciHeapNode)
	// The degrees in the insertion order of Python's dict degree_table: a degree
	// that is deleted and stored again moves to the end. The new minimum is chosen
	// in this order, because ranging over a Go map has no fixed order.
	degreeOrder := []int{}
	nodesToProcess := []*FibonacciHeapNode{}

	current := h.minNode
	for {
		nodesToProcess = append(nodesToProcess, current)
		current = current.right
		if current == h.minNode {
			break
		}
	}

	for _, node := range nodesToProcess {
		degree := node.degree
		for {
			if other, exists := degreeTable[degree]; exists {
				if node.key > other.key {
					node, other = other, node
				}
				h.link(other, node)
				delete(degreeTable, degree)
				degreeOrder = removeDegree(degreeOrder, degree)
				degree++
			} else {
				break
			}
		}
		degreeTable[degree] = node
		degreeOrder = append(degreeOrder, degree)
	}

	h.minNode = nil
	for _, degree := range degreeOrder {
		node := degreeTable[degree]
		if h.minNode == nil || node.key < h.minNode.key {
			h.minNode = node
		}
	}
}

// removeDegree drops degree from order, keeping the others in place.
func removeDegree(order []int, degree int) []int {
	for i, d := range order {
		if d == degree {
			return append(order[:i], order[i+1:]...)
		}
	}
	return order
}

// Insert adds key and returns its node as a handle for DecreaseKey and Delete.
func (h *FibonacciHeap) Insert(key int) *FibonacciHeapNode {
	node := &FibonacciHeapNode{
		key:    key,
		degree: 0,
		parent: nil,
		child:  nil,
		marked: false,
		inHeap: true,
	}
	node.left = node
	node.right = node

	if h.minNode == nil {
		h.minNode = node
	} else {
		h.addToRootList(node)
		if key < h.minNode.key {
			h.minNode = node
		}
	}

	h.count++
	return node
}

func (h *FibonacciHeap) ExtractMin() int {
	if h.IsEmpty() {
		panic("Heap is empty")
	}

	minNode := h.minNode
	minKey := minNode.key

	// Move the children to the root list; a root is never marked.
	if minNode.child != nil {
		child := minNode.child
		for {
			nextChild := child.right
			child.parent = nil
			child.marked = false
			h.addToRootList(child)
			if nextChild == minNode.child {
				break
			}
			child = nextChild
		}
	}

	if minNode == minNode.right {
		h.minNode = nil
	} else {
		h.minNode = minNode.right
		h.removeFromRootList(minNode)
		h.consolidate()
	}

	detach(minNode)
	h.count--
	return minKey
}

// detach forgets a node that left the heap: its handle is stale from now on.
func detach(node *FibonacciHeapNode) {
	node.inHeap = false
	node.parent = nil
	node.child = nil
	node.left = node
	node.right = node
}

func (h *FibonacciHeap) Peek() int {
	if h.IsEmpty() {
		panic("Heap is empty")
	}
	return h.minNode.key
}

func checkHandle(node *FibonacciHeapNode) {
	if !node.InHeap() {
		panic("stale handle: the node is no longer in a heap")
	}
}

// DecreaseKey lowers the key behind a handle. If the node now beats its
// parent, it is cut to the root list, and each marked ancestor is cut after it
// (cascading cut). It panics on a stale or nil handle and on a larger key.
func (h *FibonacciHeap) DecreaseKey(node *FibonacciHeapNode, newKey int) {
	checkHandle(node)
	if newKey > node.key {
		panic("new key is greater than the current key")
	}
	node.key = newKey
	parent := node.parent
	if parent != nil && node.key < parent.key {
		h.cut(node, parent)
		h.cascadingCut(parent)
	}
	if node.key < h.minNode.key {
		h.minNode = node
	}
}

// Delete removes the node behind a handle: decrease-key to minus infinity
// without a sentinel. The node is cut like a decreased one, made the minimum
// without changing its key, and extracted. It panics on a stale or nil handle.
func (h *FibonacciHeap) Delete(node *FibonacciHeapNode) {
	checkHandle(node)
	parent := node.parent
	if parent != nil {
		h.cut(node, parent)
		h.cascadingCut(parent)
	}
	h.minNode = node
	h.ExtractMin()
}

// cut moves node (with its subtree) from parent's children to the root list.
func (h *FibonacciHeap) cut(node, parent *FibonacciHeapNode) {
	if node.right == node {
		parent.child = nil
	} else {
		if parent.child == node {
			parent.child = node.right
		}
		node.left.right = node.right
		node.right.left = node.left
	}
	parent.degree--
	h.addToRootList(node)
	node.parent = nil
	node.marked = false
	h.cuts++
}

// cascadingCut walks up from a node that just lost a child: a non-root node
// that loses its first child is marked; a marked node that loses a second
// child is cut too, and the walk goes on with its parent. Roots are never marked.
func (h *FibonacciHeap) cascadingCut(node *FibonacciHeapNode) {
	parent := node.parent
	for parent != nil {
		if !node.marked {
			node.marked = true
			return
		}
		h.cut(node, parent)
		node = parent
		parent = node.parent
	}
}

// Merge moves every node of other into h in O(1): other's root list is
// spliced in right after minNode, and other is left empty. Handles from other
// stay valid and now belong to h. It panics when other is h.
func (h *FibonacciHeap) Merge(other *FibonacciHeap) {
	if other == h {
		panic("cannot merge a heap with itself")
	}
	if other.minNode != nil {
		if h.minNode == nil {
			h.minNode = other.minNode
		} else {
			first := other.minNode
			last := first.left
			after := h.minNode.right
			h.minNode.right = first
			first.left = h.minNode
			last.right = after
			after.left = last
			if first.key < h.minNode.key {
				h.minNode = first
			}
		}
		h.count += other.count
	}
	other.minNode = nil
	other.count = 0
}

// Clear removes every node in O(n): each one is flagged, so every handle
// becomes stale.
func (h *FibonacciHeap) Clear() {
	rings := []*FibonacciHeapNode{}
	if h.minNode != nil {
		rings = append(rings, h.minNode)
	}
	for len(rings) > 0 {
		start := rings[len(rings)-1]
		rings = rings[:len(rings)-1]
		ring := []*FibonacciHeapNode{}
		for current := start; ; {
			ring = append(ring, current)
			current = current.right
			if current == start {
				break
			}
		}
		for _, node := range ring {
			if node.child != nil {
				rings = append(rings, node.child)
			}
			detach(node)
		}
	}
	h.minNode = nil
	h.count = 0
}

func main() {
	heap := NewFibonacciHeap()
	heap.Insert(5)
	heap.Insert(3)
	seven := heap.Insert(7)
	heap.DecreaseKey(seven, 1)
	println("Peek:", heap.Peek()) // 1
}
