package main

// CartesianNode represents a node in the Cartesian Tree
type CartesianNode struct {
	value int
	index int
	left  *CartesianNode
	right *CartesianNode
}

// CartesianTree represents a Cartesian Tree
type CartesianTree struct {
	root          *CartesianNode
	originalArray []int
}

// NewCartesianTree creates a new empty Cartesian Tree
func NewCartesianTree() *CartesianTree {
	return &CartesianTree{root: nil, originalArray: []int{}}
}

// NewCartesianTreeFromArray creates a Cartesian Tree from an array
func NewCartesianTreeFromArray(array []int) *CartesianTree {
	tree := &CartesianTree{root: nil, originalArray: make([]int, len(array))}
	copy(tree.originalArray, array)
	tree.buildFromArray(array)
	return tree
}

// buildFromArray builds the tree from array using stack-based approach
func (ct *CartesianTree) buildFromArray(array []int) {
	if len(array) == 0 {
		ct.root = nil
		return
	}

	stack := []*CartesianNode{}

	for i, value := range array {
		node := &CartesianNode{value: value, index: i}
		var lastPopped *CartesianNode

		// Pop nodes from stack until we find a node with smaller value
		for len(stack) > 0 && stack[len(stack)-1].value > value {
			lastPopped = stack[len(stack)-1]
			stack = stack[:len(stack)-1]
		}

		// If we popped something, make current node its parent
		if lastPopped != nil {
			node.left = lastPopped
		}

		// If stack is not empty, make current node right child of top
		if len(stack) > 0 {
			stack[len(stack)-1].right = node
		}

		stack = append(stack, node)
	}

	// Root is the bottom of the stack
	if len(stack) > 0 {
		ct.root = stack[0]
	}
}

// InorderTraversal returns the original array sequence
func (ct *CartesianTree) InorderTraversal() []int {
	result := []int{}
	ct.inorderRecursive(ct.root, &result)
	return result
}

// inorderRecursive is a helper for inorder traversal
func (ct *CartesianTree) inorderRecursive(node *CartesianNode, result *[]int) {
	if node != nil {
		ct.inorderRecursive(node.left, result)
		*result = append(*result, node.value)
		ct.inorderRecursive(node.right, result)
	}
}

// PreorderTraversal returns preorder sequence
func (ct *CartesianTree) PreorderTraversal() []int {
	result := []int{}
	ct.preorderRecursive(ct.root, &result)
	return result
}

// preorderRecursive is a helper for preorder traversal
func (ct *CartesianTree) preorderRecursive(node *CartesianNode, result *[]int) {
	if node != nil {
		*result = append(*result, node.value)
		ct.preorderRecursive(node.left, result)
		ct.preorderRecursive(node.right, result)
	}
}

// PostorderTraversal returns postorder sequence
func (ct *CartesianTree) PostorderTraversal() []int {
	result := []int{}
	ct.postorderRecursive(ct.root, &result)
	return result
}

// postorderRecursive is a helper for postorder traversal
func (ct *CartesianTree) postorderRecursive(node *CartesianNode, result *[]int) {
	if node != nil {
		ct.postorderRecursive(node.left, result)
		ct.postorderRecursive(node.right, result)
		*result = append(*result, node.value)
	}
}

// GetMinIndex returns the index of the minimum in array[left..right] (the
// leftmost one on ties), or -1 for an empty tree or an invalid range. The
// answer is the lowest common ancestor of the two end positions, found by
// walking down from the root: O(h).
func (ct *CartesianTree) GetMinIndex(left, right int) int {
	if ct.root == nil || left < 0 || right >= len(ct.originalArray) || left > right {
		return -1
	}
	node := ct.root
	for {
		if node.index < left {
			node = node.right
		} else if node.index > right {
			node = node.left
		} else {
			return node.index
		}
	}
}

// IsEmpty checks if tree is empty
func (ct *CartesianTree) IsEmpty() bool {
	return ct.root == nil
}

// Height returns the height of the tree
func (ct *CartesianTree) Height() int {
	return ct.heightRecursive(ct.root)
}

// heightRecursive is a helper to calculate height
func (ct *CartesianTree) heightRecursive(node *CartesianNode) int {
	if node == nil {
		return -1
	}
	leftHeight := ct.heightRecursive(node.left)
	rightHeight := ct.heightRecursive(node.right)
	if leftHeight > rightHeight {
		return 1 + leftHeight
	}
	return 1 + rightHeight
}

// Size returns the number of nodes in the tree
func (ct *CartesianTree) Size() int {
	return ct.sizeRecursive(ct.root)
}

// sizeRecursive is a helper to count nodes
func (ct *CartesianTree) sizeRecursive(node *CartesianNode) int {
	if node == nil {
		return 0
	}
	return 1 + ct.sizeRecursive(node.left) + ct.sizeRecursive(node.right)
}

// GetRootValue returns the root value (minimum in array)
func (ct *CartesianTree) GetRootValue() int {
	if ct.root == nil {
		return -1
	}
	return ct.root.value
}

func main() {
	tree := NewCartesianTreeFromArray([]int{9, 3, 7, 1, 8, 12, 10, 20, 15, 18, 5})
	println("Root value:", tree.GetRootValue())
	println("Index of min in [4, 8]:", tree.GetMinIndex(4, 8))
	println("Height:", tree.Height())
}
