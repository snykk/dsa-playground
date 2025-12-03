package main

type BTreeNode struct {
	keys     []int
	children []*BTreeNode
	isLeaf   bool
}

type BTree struct {
	root       *BTreeNode
	minDegree  int
	maxKeys    int
	minKeys    int
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
	newChild.keys = append(newChild.keys, fullChild.keys[mid+1:]...)
	fullChild.keys = fullChild.keys[:mid]
	
	if !fullChild.isLeaf {
		newChild.children = append(newChild.children, fullChild.children[mid+1:]...)
		fullChild.children = fullChild.children[:mid+1]
	}
	
	parent.keys = append(parent.keys, 0)
	copy(parent.keys[index+1:], parent.keys[index:])
	parent.keys[index] = fullChild.keys[mid]
	
	parent.children = append(parent.children, nil)
	copy(parent.children[index+2:], parent.children[index+1:])
	parent.children[index+1] = newChild
	
	fullChild.keys = fullChild.keys[:mid]
}

func main() {
	btree := NewBTree(3)
	btree.Insert(10)
	btree.Insert(20)
	println("Search 10:", btree.Search(10))
}

