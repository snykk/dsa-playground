package main

// SplayNode represents a node in the Splay Tree
type SplayNode struct {
	key    int
	value  string
	left   *SplayNode
	right  *SplayNode
	parent *SplayNode
}

// SplayTree represents a self-adjusting binary search tree
type SplayTree struct {
	root *SplayNode
}

// NewSplayTree creates a new empty Splay Tree
func NewSplayTree() *SplayTree {
	return &SplayTree{root: nil}
}

// rightRotate performs a right rotation around node x
func (st *SplayTree) rightRotate(x *SplayNode) {
	y := x.left
	if y == nil {
		return
	}

	x.left = y.right
	if y.right != nil {
		y.right.parent = x
	}

	y.parent = x.parent
	if x.parent == nil {
		st.root = y
	} else if x == x.parent.left {
		x.parent.left = y
	} else {
		x.parent.right = y
	}

	y.right = x
	x.parent = y
}

// leftRotate performs a left rotation around node x
func (st *SplayTree) leftRotate(x *SplayNode) {
	y := x.right
	if y == nil {
		return
	}

	x.right = y.left
	if y.left != nil {
		y.left.parent = x
	}

	y.parent = x.parent
	if x.parent == nil {
		st.root = y
	} else if x == x.parent.left {
		x.parent.left = y
	} else {
		x.parent.right = y
	}

	y.left = x
	x.parent = y
}

// splay moves the given node to the root through rotations
func (st *SplayTree) splay(node *SplayNode) {
	for node.parent != nil {
		parent := node.parent
		grandparent := parent.parent

		if grandparent == nil {
			// Zig case
			if node == parent.left {
				st.rightRotate(parent)
			} else {
				st.leftRotate(parent)
			}
		} else if node == parent.left && parent == grandparent.left {
			// Zig-Zig case (left-left)
			st.rightRotate(grandparent)
			st.rightRotate(parent)
		} else if node == parent.right && parent == grandparent.right {
			// Zig-Zig case (right-right)
			st.leftRotate(grandparent)
			st.leftRotate(parent)
		} else if node == parent.right && parent == grandparent.left {
			// Zig-Zag case (left-right)
			st.leftRotate(parent)
			st.rightRotate(grandparent)
		} else {
			// Zig-Zag case (right-left)
			st.rightRotate(parent)
			st.leftRotate(grandparent)
		}
	}
}

// searchNode finds a node with the given key without splaying
func (st *SplayTree) searchNode(key int) *SplayNode {
	current := st.root
	for current != nil {
		if key == current.key {
			return current
		} else if key < current.key {
			if current.left == nil {
				return current
			}
			current = current.left
		} else {
			if current.right == nil {
				return current
			}
			current = current.right
		}
	}
	return nil
}

// Search searches for a key and splays it to root if found
func (st *SplayTree) Search(key int) (string, bool) {
	if st.root == nil {
		return "", false
	}

	node := st.searchNode(key)
	if node != nil && node.key == key {
		st.splay(node)
		return node.value, true
	}
	return "", false
}

// Insert inserts a key-value pair and splays to root
func (st *SplayTree) Insert(key int, value string) {
	if st.root == nil {
		st.root = &SplayNode{key: key, value: value}
		return
	}

	current := st.root
	var parent *SplayNode

	for current != nil {
		parent = current
		if key == current.key {
			// Key exists, update value and splay
			current.value = value
			st.splay(current)
			return
		} else if key < current.key {
			current = current.left
		} else {
			current = current.right
		}
	}

	// Insert new node
	newNode := &SplayNode{key: key, value: value, parent: parent}

	if key < parent.key {
		parent.left = newNode
	} else {
		parent.right = newNode
	}

	// Splay the new node to root
	st.splay(newNode)
}

// Delete deletes a key and splays parent to root
func (st *SplayTree) Delete(key int) bool {
	if st.root == nil {
		return false
	}

	node := st.searchNode(key)
	if node == nil || node.key != key {
		return false
	}

	// Splay the node to root
	st.splay(node)

	// If node has no children
	if node.left == nil && node.right == nil {
		st.root = nil
	} else if node.left == nil {
		// If node has only right child
		st.root = node.right
		st.root.parent = nil
	} else if node.right == nil {
		// If node has only left child
		st.root = node.left
		st.root.parent = nil
	} else {
		// If node has both children
		// Find maximum in left subtree
		maxLeft := node.left
		for maxLeft.right != nil {
			maxLeft = maxLeft.right
		}

		// Splay maxLeft to root of left subtree
		if maxLeft.parent != node {
			st.splay(maxLeft)
			maxLeft.parent = nil
		}

		// Attach right subtree to maxLeft
		maxLeft.right = node.right
		if node.right != nil {
			node.right.parent = maxLeft
		}

		st.root = maxLeft
	}

	return true
}

// FindMin finds the minimum key and splays to root
func (st *SplayTree) FindMin() (int, bool) {
	if st.root == nil {
		return 0, false
	}

	current := st.root
	for current.left != nil {
		current = current.left
	}

	st.splay(current)
	return current.key, true
}

// FindMax finds the maximum key and splays to root
func (st *SplayTree) FindMax() (int, bool) {
	if st.root == nil {
		return 0, false
	}

	current := st.root
	for current.right != nil {
		current = current.right
	}

	st.splay(current)
	return current.key, true
}

// InorderTraversal returns keys in sorted order
func (st *SplayTree) InorderTraversal() []int {
	result := []int{}
	st.inorderRecursive(st.root, &result)
	return result
}

// inorderRecursive is a helper for inorder traversal
func (st *SplayTree) inorderRecursive(node *SplayNode, result *[]int) {
	if node != nil {
		st.inorderRecursive(node.left, result)
		*result = append(*result, node.key)
		st.inorderRecursive(node.right, result)
	}
}

// IsEmpty checks if tree is empty
func (st *SplayTree) IsEmpty() bool {
	return st.root == nil
}

// Size returns the number of nodes in the tree
func (st *SplayTree) Size() int {
	return st.sizeRecursive(st.root)
}

// sizeRecursive is a helper to count nodes
func (st *SplayTree) sizeRecursive(node *SplayNode) int {
	if node == nil {
		return 0
	}
	return 1 + st.sizeRecursive(node.left) + st.sizeRecursive(node.right)
}

