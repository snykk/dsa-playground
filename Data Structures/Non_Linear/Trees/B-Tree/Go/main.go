package main

type BTreeNode struct {
	keys     []int
	children []*BTreeNode
	isLeaf   bool
}

type BTree struct {
	root      *BTreeNode
	minDegree int
	maxKeys   int
	minKeys   int
}

func NewBTree(minDegree int) *BTree {
	return &BTree{
		root:      &BTreeNode{isLeaf: true},
		minDegree: minDegree,
		maxKeys:   2*minDegree - 1,
		minKeys:   minDegree - 1,
	}
}

func (bt *BTree) Search(key int) bool {
	return bt.searchRecursive(bt.root, key) != nil
}

func (bt *BTree) searchRecursive(node *BTreeNode, key int) *BTreeNode {
	i := 0
	for i < len(node.keys) && key > node.keys[i] {
		i++
	}

	if i < len(node.keys) && node.keys[i] == key {
		return node
	}

	if node.isLeaf {
		return nil
	}

	return bt.searchRecursive(node.children[i], key)
}

func (bt *BTree) Insert(key int) {
	if len(bt.root.keys) == bt.maxKeys {
		newRoot := &BTreeNode{isLeaf: false}
		newRoot.children = append(newRoot.children, bt.root)
		bt.splitChild(newRoot, 0)
		bt.root = newRoot
	}
	bt.insertNonFull(bt.root, key)
}

func (bt *BTree) insertNonFull(node *BTreeNode, key int) {
	i := len(node.keys) - 1

	if node.isLeaf {
		node.keys = append(node.keys, 0)
		for i >= 0 && node.keys[i] > key {
			node.keys[i+1] = node.keys[i]
			i--
		}
		node.keys[i+1] = key
	} else {
		for i >= 0 && node.keys[i] > key {
			i--
		}
		i++

		if len(node.children[i].keys) == bt.maxKeys {
			bt.splitChild(node, i)
			if node.keys[i] < key {
				i++
			}
		}

		bt.insertNonFull(node.children[i], key)
	}
}

func (bt *BTree) splitChild(parent *BTreeNode, index int) {
	fullChild := parent.children[index]
	newChild := &BTreeNode{isLeaf: fullChild.isLeaf}

	mid := bt.minKeys
	middleKey := fullChild.keys[mid]

	newChild.keys = append(newChild.keys, fullChild.keys[mid+1:]...)
	fullChild.keys = fullChild.keys[:mid]

	if !fullChild.isLeaf {
		newChild.children = append(newChild.children, fullChild.children[mid+1:]...)
		fullChild.children = fullChild.children[:mid+1]
	}

	parent.keys = append(parent.keys, 0)
	copy(parent.keys[index+1:], parent.keys[index:])
	parent.keys[index] = middleKey

	parent.children = append(parent.children, nil)
	copy(parent.children[index+2:], parent.children[index+1:])
	parent.children[index+1] = newChild
}

// Delete removes one occurrence of key and reports whether it was present.
func (bt *BTree) Delete(key int) bool {
	removed := bt.deleteRecursive(bt.root, key)
	if len(bt.root.keys) == 0 && !bt.root.isLeaf {
		bt.root = bt.root.children[0]
	}
	return removed
}

func (bt *BTree) deleteRecursive(node *BTreeNode, key int) bool {
	i := 0
	for i < len(node.keys) && node.keys[i] < key {
		i++
	}

	if i < len(node.keys) && node.keys[i] == key {
		if node.isLeaf {
			node.keys = append(node.keys[:i], node.keys[i+1:]...)
			return true
		}
		if len(node.children[i].keys) > bt.minKeys {
			pred := predecessor(node.children[i])
			node.keys[i] = pred
			return bt.deleteRecursive(node.children[i], pred)
		}
		if len(node.children[i+1].keys) > bt.minKeys {
			succ := successor(node.children[i+1])
			node.keys[i] = succ
			return bt.deleteRecursive(node.children[i+1], succ)
		}
		bt.mergeChildren(node, i)
		return bt.deleteRecursive(node.children[i], key)
	}

	if node.isLeaf {
		return false
	}

	if len(node.children[i].keys) == bt.minKeys {
		bt.fillChild(node, i)
	}
	// the last child may have merged into its left sibling
	if i > len(node.keys) {
		i--
	}
	return bt.deleteRecursive(node.children[i], key)
}

func predecessor(node *BTreeNode) int {
	for !node.isLeaf {
		node = node.children[len(node.children)-1]
	}
	return node.keys[len(node.keys)-1]
}

func successor(node *BTreeNode) int {
	for !node.isLeaf {
		node = node.children[0]
	}
	return node.keys[0]
}

// fillChild makes sure children[index] has more than minKeys keys.
func (bt *BTree) fillChild(parent *BTreeNode, index int) {
	switch {
	case index > 0 && len(parent.children[index-1].keys) > bt.minKeys:
		bt.borrowFromLeft(parent, index)
	case index < len(parent.children)-1 && len(parent.children[index+1].keys) > bt.minKeys:
		bt.borrowFromRight(parent, index)
	case index < len(parent.keys):
		bt.mergeChildren(parent, index)
	default:
		bt.mergeChildren(parent, index-1)
	}
}

func (bt *BTree) borrowFromLeft(parent *BTreeNode, index int) {
	child := parent.children[index]
	sibling := parent.children[index-1]

	child.keys = append([]int{parent.keys[index-1]}, child.keys...)
	parent.keys[index-1] = sibling.keys[len(sibling.keys)-1]
	sibling.keys = sibling.keys[:len(sibling.keys)-1]

	if !child.isLeaf {
		last := sibling.children[len(sibling.children)-1]
		sibling.children = sibling.children[:len(sibling.children)-1]
		child.children = append([]*BTreeNode{last}, child.children...)
	}
}

func (bt *BTree) borrowFromRight(parent *BTreeNode, index int) {
	child := parent.children[index]
	sibling := parent.children[index+1]

	child.keys = append(child.keys, parent.keys[index])
	parent.keys[index] = sibling.keys[0]
	sibling.keys = sibling.keys[1:]

	if !child.isLeaf {
		child.children = append(child.children, sibling.children[0])
		sibling.children = sibling.children[1:]
	}
}

// mergeChildren folds children[index+1] and keys[index] into children[index].
func (bt *BTree) mergeChildren(parent *BTreeNode, index int) {
	left := parent.children[index]
	right := parent.children[index+1]

	left.keys = append(left.keys, parent.keys[index])
	left.keys = append(left.keys, right.keys...)
	if !left.isLeaf {
		left.children = append(left.children, right.children...)
	}

	parent.keys = append(parent.keys[:index], parent.keys[index+1:]...)
	parent.children = append(parent.children[:index+1], parent.children[index+2:]...)
}

// Traverse returns all keys in sorted order.
func (bt *BTree) Traverse() []int {
	out := []int{}
	traverseNode(bt.root, &out)
	return out
}

func traverseNode(node *BTreeNode, out *[]int) {
	for i, k := range node.keys {
		if !node.isLeaf {
			traverseNode(node.children[i], out)
		}
		*out = append(*out, k)
	}
	if !node.isLeaf {
		traverseNode(node.children[len(node.children)-1], out)
	}
}

func main() {
	btree := NewBTree(3)
	btree.Insert(10)
	btree.Insert(20)
	println("Search 10:", btree.Search(10))
}
