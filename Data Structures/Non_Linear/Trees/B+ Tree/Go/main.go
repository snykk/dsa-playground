package main

type BPlusTreeNode struct {
	keys     []int
	children []*BPlusTreeNode
	values   []string
	isLeaf   bool
	next     *BPlusTreeNode
}

type BPlusTree struct {
	root      *BPlusTreeNode
	minDegree int
	maxKeys   int
	minKeys   int
}

func NewBPlusTree(minDegree int) *BPlusTree {
	return &BPlusTree{
		root:      &BPlusTreeNode{isLeaf: true},
		minDegree: minDegree,
		maxKeys:   2*minDegree - 1,
		minKeys:   minDegree - 1,
	}
}

func (bpt *BPlusTree) findLeaf(key int) *BPlusTreeNode {
	node := bpt.root
	for !node.isLeaf {
		i := 0
		for i < len(node.keys) && key >= node.keys[i] {
			i++
		}
		node = node.children[i]
	}
	return node
}

func (bpt *BPlusTree) Search(key int) string {
	leaf := bpt.findLeaf(key)
	for i, k := range leaf.keys {
		if k == key {
			return leaf.values[i]
		}
	}
	return ""
}

func (bpt *BPlusTree) Insert(key int, value string) {
	if len(bpt.root.keys) == bpt.maxKeys {
		newRoot := &BPlusTreeNode{isLeaf: false}
		newRoot.children = append(newRoot.children, bpt.root)
		bpt.splitChild(newRoot, 0)
		bpt.root = newRoot
	}
	bpt.insertNonFull(bpt.root, key, value)
}

func (bpt *BPlusTree) insertNonFull(node *BPlusTreeNode, key int, value string) {
	if node.isLeaf {
		i := 0
		for i < len(node.keys) && node.keys[i] < key {
			i++
		}
		node.keys = append(node.keys, 0)
		copy(node.keys[i+1:], node.keys[i:])
		node.keys[i] = key
		
		node.values = append(node.values, "")
		copy(node.values[i+1:], node.values[i:])
		node.values[i] = value
	} else {
		i := 0
		for i < len(node.keys) && key >= node.keys[i] {
			i++
		}
		
		if len(node.children[i].keys) == bpt.maxKeys {
			bpt.splitChild(node, i)
			if key >= node.keys[i] {
				i++
			}
		}
		
		bpt.insertNonFull(node.children[i], key, value)
	}
}

func (bpt *BPlusTree) splitChild(parent *BPlusTreeNode, index int) {
	fullChild := parent.children[index]
	newChild := &BPlusTreeNode{isLeaf: fullChild.isLeaf}
	
	mid := bpt.minKeys
	
	if fullChild.isLeaf {
		newChild.keys = append(newChild.keys, fullChild.keys[mid:]...)
		newChild.values = append(newChild.values, fullChild.values[mid:]...)
		fullChild.keys = fullChild.keys[:mid]
		fullChild.values = fullChild.values[:mid]
		
		newChild.next = fullChild.next
		fullChild.next = newChild
		
		parent.keys = append(parent.keys, 0)
		copy(parent.keys[index+1:], parent.keys[index:])
		parent.keys[index] = newChild.keys[0]
	} else {
		newChild.keys = append(newChild.keys, fullChild.keys[mid+1:]...)
		newChild.children = append(newChild.children, fullChild.children[mid+1:]...)
		promoteKey := fullChild.keys[mid]
		fullChild.keys = fullChild.keys[:mid]
		fullChild.children = fullChild.children[:mid+1]
		
		parent.keys = append(parent.keys, 0)
		copy(parent.keys[index+1:], parent.keys[index:])
		parent.keys[index] = promoteKey
	}
	
	parent.children = append(parent.children, nil)
	copy(parent.children[index+2:], parent.children[index+1:])
	parent.children[index+1] = newChild
}

func main() {
	bptree := NewBPlusTree(3)
	bptree.Insert(10, "value10")
	bptree.Insert(20, "value20")
	println("Search 10:", bptree.Search(10))
}

