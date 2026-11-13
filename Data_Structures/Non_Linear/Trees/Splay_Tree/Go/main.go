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

// Search searches for a key. The last visited node is splayed to the root on
// a hit and on a miss, which keeps unsuccessful searches amortized O(log n).
func (st *SplayTree) Search(key int) (string, bool) {
	if st.root == nil {
		return "", false
	}

	node := st.searchNode(key)
	st.splay(node)
	if node.key == key {
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

// Delete removes a key using split and merge: splay the key to the root,
// detach both subtrees, splay the maximum of the left one and attach the
// right one under it. A missing key splays the last visited node instead.
func (st *SplayTree) Delete(key int) bool {
	if st.root == nil {
		return false
	}

	node := st.searchNode(key)
	st.splay(node)
	if node.key != key {
		return false
	}

	left, right := node.left, node.right
	if left != nil {
		left.parent = nil
	}
	if right != nil {
		right.parent = nil
	}

	if left == nil {
		st.root = right
	} else if right == nil {
		st.root = left
	} else {
		st.root = left
		maxLeft := left
		for maxLeft.right != nil {
			maxLeft = maxLeft.right
		}
		st.splay(maxLeft)
		maxLeft.right = right
		right.parent = maxLeft
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

// InorderTraversal returns keys in sorted order. It is iterative because a
// splay tree is often a long path.
func (st *SplayTree) InorderTraversal() []int {
	result := []int{}
	stack := []*SplayNode{}
	current := st.root
	for len(stack) > 0 || current != nil {
		for current != nil {
			stack = append(stack, current)
			current = current.left
		}
		current = stack[len(stack)-1]
		stack = stack[:len(stack)-1]
		result = append(result, current.key)
		current = current.right
	}
	return result
}

// IsEmpty checks if tree is empty
func (st *SplayTree) IsEmpty() bool {
	return st.root == nil
}

// Size returns the number of nodes in the tree (iterative).
func (st *SplayTree) Size() int {
	if st.root == nil {
		return 0
	}
	count := 0
	stack := []*SplayNode{st.root}
	for len(stack) > 0 {
		n := stack[len(stack)-1]
		stack = stack[:len(stack)-1]
		count++
		if n.left != nil {
			stack = append(stack, n.left)
		}
		if n.right != nil {
			stack = append(stack, n.right)
		}
	}
	return count
}

// consistent checks BST order and parent links. It is used by the tests.
func (st *SplayTree) consistent() bool {
	if st.root == nil {
		return true
	}
	if st.root.parent != nil {
		return false
	}
	stack := []*SplayNode{st.root}
	for len(stack) > 0 {
		n := stack[len(stack)-1]
		stack = stack[:len(stack)-1]
		if n.left != nil {
			if n.left.parent != n || n.left.key >= n.key {
				return false
			}
			stack = append(stack, n.left)
		}
		if n.right != nil {
			if n.right.parent != n || n.right.key <= n.key {
				return false
			}
			stack = append(stack, n.right)
		}
	}
	return true
}

func main() {
	st := NewSplayTree()
	for _, k := range []int{5, 3, 8, 1} {
		st.Insert(k, "v")
	}
	v, ok := st.Search(3)
	println("Search 3:", v, ok)
	println("Inorder size:", st.Size())
}
