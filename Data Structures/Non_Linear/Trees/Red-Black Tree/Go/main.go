package main

const (
	RED   = 0
	BLACK = 1
)

type RBNode struct {
	data   int
	left   *RBNode
	right  *RBNode
	parent *RBNode
	color  int
}

type RedBlackTree struct {
	root *RBNode
	nil  *RBNode
}

func NewRedBlackTree() *RedBlackTree {
	nilNode := &RBNode{color: BLACK}
	return &RedBlackTree{root: nilNode, nil: nilNode}
}

func (rbt *RedBlackTree) Insert(data int) {
	z := &RBNode{data: data, color: RED, left: rbt.nil, right: rbt.nil}
	
	y := rbt.nil
	x := rbt.root
	
	for x != rbt.nil {
		y = x
		if z.data < x.data {
			x = x.left
		} else {
			x = x.right
		}
	}
	
	z.parent = y
	if y == rbt.nil {
		rbt.root = z
	} else if z.data < y.data {
		y.left = z
	} else {
		y.right = z
	}
	
	rbt.insertFixup(z)
}

func (rbt *RedBlackTree) insertFixup(z *RBNode) {
	for z.parent.color == RED {
		if z.parent == z.parent.parent.left {
			y := z.parent.parent.right
			if y.color == RED {
				z.parent.color = BLACK
				y.color = BLACK
				z.parent.parent.color = RED
				z = z.parent.parent
			} else {
				if z == z.parent.right {
					z = z.parent
					rbt.leftRotate(z)
				}
				z.parent.color = BLACK
				z.parent.parent.color = RED
				rbt.rightRotate(z.parent.parent)
			}
		} else {
			y := z.parent.parent.left
			if y.color == RED {
				z.parent.color = BLACK
				y.color = BLACK
				z.parent.parent.color = RED
				z = z.parent.parent
			} else {
				if z == z.parent.left {
					z = z.parent
					rbt.rightRotate(z)
				}
				z.parent.color = BLACK
				z.parent.parent.color = RED
				rbt.leftRotate(z.parent.parent)
			}
		}
	}
	rbt.root.color = BLACK
}

func (rbt *RedBlackTree) leftRotate(x *RBNode) {
	y := x.right
	x.right = y.left
	if y.left != rbt.nil {
		y.left.parent = x
	}
	y.parent = x.parent
	if x.parent == rbt.nil {
		rbt.root = y
	} else if x == x.parent.left {
		x.parent.left = y
	} else {
		x.parent.right = y
	}
	y.left = x
	x.parent = y
}

func (rbt *RedBlackTree) rightRotate(y *RBNode) {
	x := y.left
	y.left = x.right
	if x.right != rbt.nil {
		x.right.parent = y
	}
	x.parent = y.parent
	if y.parent == rbt.nil {
		rbt.root = x
	} else if y == y.parent.left {
		y.parent.left = x
	} else {
		y.parent.right = x
	}
	x.right = y
	y.parent = x
}

func (rbt *RedBlackTree) Search(data int) bool {
	return rbt.searchRecursive(rbt.root, data)
}

func (rbt *RedBlackTree) searchRecursive(node *RBNode, data int) bool {
	if node == rbt.nil {
		return false
	}
	if node.data == data {
		return true
	}
	if data < node.data {
		return rbt.searchRecursive(node.left, data)
	}
	return rbt.searchRecursive(node.right, data)
}

func (rbt *RedBlackTree) InorderTraversal() []int {
	result := []int{}
	rbt.inorderRecursive(rbt.root, &result)
	return result
}

func (rbt *RedBlackTree) inorderRecursive(node *RBNode, result *[]int) {
	if node != rbt.nil {
		rbt.inorderRecursive(node.left, result)
		*result = append(*result, node.data)
		rbt.inorderRecursive(node.right, result)
	}
}

func (rbt *RedBlackTree) Size() int {
	return rbt.sizeRecursive(rbt.root)
}

func (rbt *RedBlackTree) sizeRecursive(node *RBNode) int {
	if node == rbt.nil {
		return 0
	}
	return 1 + rbt.sizeRecursive(node.left) + rbt.sizeRecursive(node.right)
}

func (rbt *RedBlackTree) IsEmpty() bool {
	return rbt.root == rbt.nil
}

func main() {
	rbt := NewRedBlackTree()
	rbt.Insert(10)
	rbt.Insert(20)
	rbt.Insert(30)
	println("Search 20:", rbt.Search(20))
}

