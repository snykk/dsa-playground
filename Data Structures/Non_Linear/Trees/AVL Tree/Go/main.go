package main

import "errors"

type AVLNode struct {
	data   int
	left   *AVLNode
	right  *AVLNode
	height int
}

type AVLTree struct {
	root *AVLNode
}

func NewAVLTree() *AVLTree {
	return &AVLTree{root: nil}
}

func height(node *AVLNode) int {
	if node == nil {
		return 0
	}
	return node.height
}

func updateHeight(node *AVLNode) {
	if node != nil {
		leftHeight := height(node.left)
		rightHeight := height(node.right)
		if leftHeight > rightHeight {
			node.height = 1 + leftHeight
		} else {
			node.height = 1 + rightHeight
		}
	}
}

func balanceFactor(node *AVLNode) int {
	if node == nil {
		return 0
	}
	return height(node.left) - height(node.right)
}

func rotateRight(y *AVLNode) *AVLNode {
	x := y.left
	T2 := x.right

	x.right = y
	y.left = T2

	updateHeight(y)
	updateHeight(x)

	return x
}

func rotateLeft(x *AVLNode) *AVLNode {
	y := x.right
	T2 := y.left

	y.left = x
	x.right = T2

	updateHeight(x)
	updateHeight(y)

	return y
}

func (avl *AVLTree) Insert(data int) {
	avl.root = avl.insertRecursive(avl.root, data)
}

func (avl *AVLTree) insertRecursive(node *AVLNode, data int) *AVLNode {
	if node == nil {
		return &AVLNode{data: data, height: 1}
	}

	if data < node.data {
		node.left = avl.insertRecursive(node.left, data)
	} else if data > node.data {
		node.right = avl.insertRecursive(node.right, data)
	} else {
		return node // Duplicates not allowed
	}

	updateHeight(node)

	balance := balanceFactor(node)

	// Left Left Case
	if balance > 1 && data < node.left.data {
		return rotateRight(node)
	}

	// Right Right Case
	if balance < -1 && data > node.right.data {
		return rotateLeft(node)
	}

	// Left Right Case
	if balance > 1 && data > node.left.data {
		node.left = rotateLeft(node.left)
		return rotateRight(node)
	}

	// Right Left Case
	if balance < -1 && data < node.right.data {
		node.right = rotateRight(node.right)
		return rotateLeft(node)
	}

	return node
}

func (avl *AVLTree) Search(data int) bool {
	return avl.searchRecursive(avl.root, data)
}

func (avl *AVLTree) searchRecursive(node *AVLNode, data int) bool {
	if node == nil {
		return false
	}
	if node.data == data {
		return true
	}
	if data < node.data {
		return avl.searchRecursive(node.left, data)
	}
	return avl.searchRecursive(node.right, data)
}

func (avl *AVLTree) Delete(data int) {
	avl.root = avl.deleteRecursive(avl.root, data)
}

func (avl *AVLTree) deleteRecursive(node *AVLNode, data int) *AVLNode {
	if node == nil {
		return nil
	}

	if data < node.data {
		node.left = avl.deleteRecursive(node.left, data)
	} else if data > node.data {
		node.right = avl.deleteRecursive(node.right, data)
	} else {
		if node.left == nil {
			return node.right
		} else if node.right == nil {
			return node.left
		} else {
			successor := avl.findMinNode(node.right)
			node.data = successor.data
			node.right = avl.deleteRecursive(node.right, successor.data)
		}
	}

	updateHeight(node)

	balance := balanceFactor(node)

	// Left Left Case
	if balance > 1 && balanceFactor(node.left) >= 0 {
		return rotateRight(node)
	}

	// Left Right Case
	if balance > 1 && balanceFactor(node.left) < 0 {
		node.left = rotateLeft(node.left)
		return rotateRight(node)
	}

	// Right Right Case
	if balance < -1 && balanceFactor(node.right) <= 0 {
		return rotateLeft(node)
	}

	// Right Left Case
	if balance < -1 && balanceFactor(node.right) > 0 {
		node.right = rotateRight(node.right)
		return rotateLeft(node)
	}

	return node
}

func (avl *AVLTree) findMinNode(node *AVLNode) *AVLNode {
	for node.left != nil {
		node = node.left
	}
	return node
}

func (avl *AVLTree) FindMin() (int, error) {
	if avl.root == nil {
		return 0, errors.New("tree is empty")
	}
	minNode := avl.findMinNode(avl.root)
	return minNode.data, nil
}

func (avl *AVLTree) FindMax() (int, error) {
	if avl.root == nil {
		return 0, errors.New("tree is empty")
	}
	node := avl.root
	for node.right != nil {
		node = node.right
	}
	return node.data, nil
}

func (avl *AVLTree) InorderTraversal() []int {
	result := []int{}
	avl.inorderRecursive(avl.root, &result)
	return result
}

func (avl *AVLTree) inorderRecursive(node *AVLNode, result *[]int) {
	if node != nil {
		avl.inorderRecursive(node.left, result)
		*result = append(*result, node.data)
		avl.inorderRecursive(node.right, result)
	}
}

func (avl *AVLTree) Height() int {
	return height(avl.root)
}

func (avl *AVLTree) Size() int {
	return avl.sizeRecursive(avl.root)
}

func (avl *AVLTree) sizeRecursive(node *AVLNode) int {
	if node == nil {
		return 0
	}
	return 1 + avl.sizeRecursive(node.left) + avl.sizeRecursive(node.right)
}

func (avl *AVLTree) IsEmpty() bool {
	return avl.root == nil
}

func (avl *AVLTree) IsBalanced() bool {
	return avl.isBalancedRecursive(avl.root)
}

func (avl *AVLTree) isBalancedRecursive(node *AVLNode) bool {
	if node == nil {
		return true
	}
	balance := balanceFactor(node)
	if balance < -1 || balance > 1 {
		return false
	}
	return avl.isBalancedRecursive(node.left) && avl.isBalancedRecursive(node.right)
}

func main() {
	// Example usage
	avl := NewAVLTree()
	avl.Insert(10)
	avl.Insert(20)
	avl.Insert(30)

	println("Search 20:", avl.Search(20))
	println("Is balanced:", avl.IsBalanced())
}

