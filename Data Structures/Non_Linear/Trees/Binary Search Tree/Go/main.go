package main

import (
	"container/list"
	"errors"
)

type TreeNode struct {
	data  int
	left  *TreeNode
	right *TreeNode
}

type BinarySearchTree struct {
	root *TreeNode
}

func NewBinarySearchTree() *BinarySearchTree {
	return &BinarySearchTree{root: nil}
}

func (bst *BinarySearchTree) Insert(data int) {
	bst.root = bst.insertRecursive(bst.root, data)
}

func (bst *BinarySearchTree) insertRecursive(node *TreeNode, data int) *TreeNode {
	if node == nil {
		return &TreeNode{data: data}
	}

	if data < node.data {
		node.left = bst.insertRecursive(node.left, data)
	} else if data > node.data {
		node.right = bst.insertRecursive(node.right, data)
	}
	// If data == node.data, we don't insert duplicates

	return node
}

func (bst *BinarySearchTree) Search(data int) bool {
	return bst.searchRecursive(bst.root, data)
}

func (bst *BinarySearchTree) searchRecursive(node *TreeNode, data int) bool {
	if node == nil {
		return false
	}
	if node.data == data {
		return true
	}
	if data < node.data {
		return bst.searchRecursive(node.left, data)
	}
	return bst.searchRecursive(node.right, data)
}

func (bst *BinarySearchTree) Delete(data int) {
	bst.root = bst.deleteRecursive(bst.root, data)
}

func (bst *BinarySearchTree) deleteRecursive(node *TreeNode, data int) *TreeNode {
	if node == nil {
		return nil
	}

	if data < node.data {
		node.left = bst.deleteRecursive(node.left, data)
	} else if data > node.data {
		node.right = bst.deleteRecursive(node.right, data)
	} else {
		// Node to delete found
		// Case 1: No child
		if node.left == nil && node.right == nil {
			return nil
		}
		// Case 2: One child
		if node.left == nil {
			return node.right
		}
		if node.right == nil {
			return node.left
		}
		// Case 3: Two children - find inorder successor
		successor := bst.findMinNode(node.right)
		node.data = successor.data
		node.right = bst.deleteRecursive(node.right, successor.data)
	}

	return node
}

func (bst *BinarySearchTree) FindMin() (int, error) {
	if bst.root == nil {
		return 0, errors.New("tree is empty")
	}
	minNode := bst.findMinNode(bst.root)
	return minNode.data, nil
}

func (bst *BinarySearchTree) findMinNode(node *TreeNode) *TreeNode {
	for node.left != nil {
		node = node.left
	}
	return node
}

func (bst *BinarySearchTree) FindMax() (int, error) {
	if bst.root == nil {
		return 0, errors.New("tree is empty")
	}
	maxNode := bst.findMaxNode(bst.root)
	return maxNode.data, nil
}

func (bst *BinarySearchTree) findMaxNode(node *TreeNode) *TreeNode {
	for node.right != nil {
		node = node.right
	}
	return node
}

func (bst *BinarySearchTree) InorderTraversal() []int {
	result := []int{}
	bst.inorderRecursive(bst.root, &result)
	return result
}

func (bst *BinarySearchTree) inorderRecursive(node *TreeNode, result *[]int) {
	if node != nil {
		bst.inorderRecursive(node.left, result)
		*result = append(*result, node.data)
		bst.inorderRecursive(node.right, result)
	}
}

func (bst *BinarySearchTree) PreorderTraversal() []int {
	result := []int{}
	bst.preorderRecursive(bst.root, &result)
	return result
}

func (bst *BinarySearchTree) preorderRecursive(node *TreeNode, result *[]int) {
	if node != nil {
		*result = append(*result, node.data)
		bst.preorderRecursive(node.left, result)
		bst.preorderRecursive(node.right, result)
	}
}

func (bst *BinarySearchTree) PostorderTraversal() []int {
	result := []int{}
	bst.postorderRecursive(bst.root, &result)
	return result
}

func (bst *BinarySearchTree) postorderRecursive(node *TreeNode, result *[]int) {
	if node != nil {
		bst.postorderRecursive(node.left, result)
		bst.postorderRecursive(node.right, result)
		*result = append(*result, node.data)
	}
}

func (bst *BinarySearchTree) LevelOrderTraversal() []int {
	result := []int{}
	if bst.root == nil {
		return result
	}

	queue := list.New()
	queue.PushBack(bst.root)

	for queue.Len() > 0 {
		front := queue.Front()
		queue.Remove(front)
		node := front.Value.(*TreeNode)

		result = append(result, node.data)

		if node.left != nil {
			queue.PushBack(node.left)
		}
		if node.right != nil {
			queue.PushBack(node.right)
		}
	}

	return result
}

func (bst *BinarySearchTree) Height() int {
	return bst.heightRecursive(bst.root)
}

func (bst *BinarySearchTree) heightRecursive(node *TreeNode) int {
	if node == nil {
		return -1
	}
	leftHeight := bst.heightRecursive(node.left)
	rightHeight := bst.heightRecursive(node.right)
	if leftHeight > rightHeight {
		return 1 + leftHeight
	}
	return 1 + rightHeight
}

func (bst *BinarySearchTree) Size() int {
	return bst.sizeRecursive(bst.root)
}

func (bst *BinarySearchTree) sizeRecursive(node *TreeNode) int {
	if node == nil {
		return 0
	}
	return 1 + bst.sizeRecursive(node.left) + bst.sizeRecursive(node.right)
}

func (bst *BinarySearchTree) IsEmpty() bool {
	return bst.root == nil
}

func main() {
	// Example usage
	bst := NewBinarySearchTree()
	bst.Insert(5)
	bst.Insert(3)
	bst.Insert(7)

	println("Search 3:", bst.Search(3))
	min, _ := bst.FindMin()
	println("Min:", min)
}

