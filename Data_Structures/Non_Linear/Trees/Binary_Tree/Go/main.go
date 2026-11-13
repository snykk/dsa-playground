package main

import "container/list"

type TreeNode struct {
	data  int
	left  *TreeNode
	right *TreeNode
}

type BinaryTree struct {
	root *TreeNode
}

func NewBinaryTree() *BinaryTree {
	return &BinaryTree{root: nil}
}

func (bt *BinaryTree) Insert(data int) {
	if bt.root == nil {
		bt.root = &TreeNode{data: data}
		return
	}

	queue := list.New()
	queue.PushBack(bt.root)

	for queue.Len() > 0 {
		front := queue.Front()
		queue.Remove(front)
		node := front.Value.(*TreeNode)

		if node.left == nil {
			node.left = &TreeNode{data: data}
			return
		} else if node.right == nil {
			node.right = &TreeNode{data: data}
			return
		} else {
			queue.PushBack(node.left)
			queue.PushBack(node.right)
		}
	}
}

func (bt *BinaryTree) Search(data int) bool {
	return bt.searchRecursive(bt.root, data)
}

func (bt *BinaryTree) searchRecursive(node *TreeNode, data int) bool {
	if node == nil {
		return false
	}
	if node.data == data {
		return true
	}
	return bt.searchRecursive(node.left, data) || bt.searchRecursive(node.right, data)
}

func (bt *BinaryTree) InorderTraversal() []int {
	result := []int{}
	bt.inorderRecursive(bt.root, &result)
	return result
}

func (bt *BinaryTree) inorderRecursive(node *TreeNode, result *[]int) {
	if node != nil {
		bt.inorderRecursive(node.left, result)
		*result = append(*result, node.data)
		bt.inorderRecursive(node.right, result)
	}
}

func (bt *BinaryTree) PreorderTraversal() []int {
	result := []int{}
	bt.preorderRecursive(bt.root, &result)
	return result
}

func (bt *BinaryTree) preorderRecursive(node *TreeNode, result *[]int) {
	if node != nil {
		*result = append(*result, node.data)
		bt.preorderRecursive(node.left, result)
		bt.preorderRecursive(node.right, result)
	}
}

func (bt *BinaryTree) PostorderTraversal() []int {
	result := []int{}
	bt.postorderRecursive(bt.root, &result)
	return result
}

func (bt *BinaryTree) postorderRecursive(node *TreeNode, result *[]int) {
	if node != nil {
		bt.postorderRecursive(node.left, result)
		bt.postorderRecursive(node.right, result)
		*result = append(*result, node.data)
	}
}

func (bt *BinaryTree) LevelOrderTraversal() []int {
	result := []int{}
	if bt.root == nil {
		return result
	}

	queue := list.New()
	queue.PushBack(bt.root)

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

func (bt *BinaryTree) Height() int {
	return bt.heightRecursive(bt.root)
}

func (bt *BinaryTree) heightRecursive(node *TreeNode) int {
	if node == nil {
		return -1
	}
	leftHeight := bt.heightRecursive(node.left)
	rightHeight := bt.heightRecursive(node.right)
	if leftHeight > rightHeight {
		return 1 + leftHeight
	}
	return 1 + rightHeight
}

func (bt *BinaryTree) Size() int {
	return bt.sizeRecursive(bt.root)
}

func (bt *BinaryTree) sizeRecursive(node *TreeNode) int {
	if node == nil {
		return 0
	}
	return 1 + bt.sizeRecursive(node.left) + bt.sizeRecursive(node.right)
}

func (bt *BinaryTree) IsEmpty() bool {
	return bt.root == nil
}

func main() {
	// Example usage
	tree := NewBinaryTree()
	tree.Insert(1)
	tree.Insert(2)
	tree.Insert(3)

	println("Size:", tree.Size())
	println("Height:", tree.Height())
	println("Search 2:", tree.Search(2))
}

