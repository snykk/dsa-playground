package main

type FibonacciHeapNode struct {
	key      int
	degree   int
	parent   *FibonacciHeapNode
	child    *FibonacciHeapNode
	left     *FibonacciHeapNode
	right    *FibonacciHeapNode
	marked   bool
}

type FibonacciHeap struct {
	minNode *FibonacciHeapNode
	count   int
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
}

func (h *FibonacciHeap) consolidate() {
	if h.minNode == nil {
		return
	}

	degreeTable := make(map[int]*FibonacciHeapNode)
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
				degree++
			} else {
				break
			}
		}
		degreeTable[degree] = node
	}

	h.minNode = nil
	for _, node := range degreeTable {
		if h.minNode == nil || node.key < h.minNode.key {
			h.minNode = node
		}
	}
}

func (h *FibonacciHeap) Insert(key int) {
	node := &FibonacciHeapNode{
		key:    key,
		degree: 0,
		parent: nil,
		child:  nil,
		marked: false,
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
}

func (h *FibonacciHeap) ExtractMin() int {
	if h.IsEmpty() {
		panic("Heap is empty")
	}

	minNode := h.minNode
	minKey := minNode.key

	if minNode.child != nil {
		child := minNode.child
		for {
			nextChild := child.right
			child.parent = nil
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

	h.count--
	return minKey
}

func (h *FibonacciHeap) Peek() int {
	if h.IsEmpty() {
		panic("Heap is empty")
	}
	return h.minNode.key
}

func (h *FibonacciHeap) Clear() {
	for !h.IsEmpty() {
		h.ExtractMin()
	}
}

func main() {
	heap := NewFibonacciHeap()
	heap.Insert(5)
	heap.Insert(3)
	heap.Insert(7)
	println("Peek:", heap.Peek()) // 3
}

