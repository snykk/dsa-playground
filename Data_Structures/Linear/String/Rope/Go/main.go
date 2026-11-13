package main

import (
	"fmt"
	"strings"
)

// RopeNode represents a node in the rope binary tree.
// Leaf nodes store a non-empty string fragment in Data (height 0).
// Internal nodes store Weight (total length of the left subtree).
// Every node caches its total length and its height, so neither is
// recomputed by walking the tree.
type RopeNode struct {
	Left   *RopeNode
	Right  *RopeNode
	Weight int
	Data   string
	length int
	height int
}

func newLeaf(data string) *RopeNode {
	return &RopeNode{Data: data, Weight: len(data), length: len(data)}
}

// newInternal makes an internal node over two non-nil subtrees.
func newInternal(left, right *RopeNode) *RopeNode {
	h := left.height
	if right.height > h {
		h = right.height
	}
	return &RopeNode{
		Left:   left,
		Right:  right,
		Weight: left.length,
		length: left.length + right.length,
		height: h + 1,
	}
}

// Rope wraps a rope tree root for efficient string manipulation.
// Concat and Split rebalance the tree, so its height stays O(log n).
// Positions are byte offsets, so a Split inside a multi-byte character
// produces two invalid UTF-8 halves.
type Rope struct {
	Root *RopeNode
}

// NewRope builds a rope from the given string.
func NewRope(text string) *Rope {
	if text == "" {
		return &Rope{}
	}
	return &Rope{Root: buildNode(text, 10)}
}

func buildNode(text string, leafSize int) *RopeNode {
	if len(text) <= leafSize {
		return newLeaf(text)
	}
	mid := len(text) / 2
	return newInternal(buildNode(text[:mid], leafSize), buildNode(text[mid:], leafSize))
}

func nodeLength(node *RopeNode) int {
	if node == nil {
		return 0
	}
	return node.length
}

func nodeHeight(node *RopeNode) int {
	if node == nil {
		return -1
	}
	return node.height
}

// Height returns the height of the tree: 0 for a single leaf, -1 for an empty rope.
func (r *Rope) Height() int {
	return nodeHeight(r.Root)
}

// Len returns the total length of the string stored in the rope.
func (r *Rope) Len() int {
	return nodeLength(r.Root)
}

// Index returns the character at position i.
func (r *Rope) Index(i int) (byte, error) {
	return indexNode(r.Root, i)
}

func indexNode(node *RopeNode, i int) (byte, error) {
	if node == nil {
		return 0, fmt.Errorf("index out of range: %d", i)
	}
	if node.Data != "" {
		if i < 0 || i >= len(node.Data) {
			return 0, fmt.Errorf("index out of range: %d", i)
		}
		return node.Data[i], nil
	}
	if i < node.Weight {
		return indexNode(node.Left, i)
	}
	return indexNode(node.Right, i-node.Weight)
}

// ToString collects all leaf fragments into a single string.
func (r *Rope) ToString() string {
	var sb strings.Builder
	collectNode(r.Root, &sb)
	return sb.String()
}

func collectNode(node *RopeNode, sb *strings.Builder) {
	if node == nil {
		return
	}
	if node.Data != "" {
		sb.WriteString(node.Data)
		return
	}
	collectNode(node.Left, sb)
	collectNode(node.Right, sb)
}

// joinNodes concatenates two subtrees, keeping the heights of siblings within 1
// (AVL join): O(|height(left) - height(right)| + 1).
func joinNodes(left, right *RopeNode) *RopeNode {
	if left == nil {
		return right
	}
	if right == nil {
		return left
	}
	if left.height > right.height+1 {
		return joinRight(left, right)
	}
	if right.height > left.height+1 {
		return joinLeft(left, right)
	}
	return newInternal(left, right)
}

// joinRight: left is taller, so attach right somewhere down left's right spine.
func joinRight(left, right *RopeNode) *RopeNode {
	joined := joinNodes(left.Right, right)
	if joined.height <= left.Left.height+1 {
		return newInternal(left.Left, joined)
	}
	// joined is two levels taller than left.Left: rotate it up
	if joined.Left.height <= joined.Right.height {
		return newInternal(newInternal(left.Left, joined.Left), joined.Right)
	}
	return newInternal(
		newInternal(left.Left, joined.Left.Left),
		newInternal(joined.Left.Right, joined.Right),
	)
}

// joinLeft: right is taller, so attach left somewhere down right's left spine.
func joinLeft(left, right *RopeNode) *RopeNode {
	joined := joinNodes(left, right.Left)
	if joined.height <= right.Right.height+1 {
		return newInternal(joined, right.Right)
	}
	if joined.Right.height <= joined.Left.height {
		return newInternal(joined.Left, newInternal(joined.Right, right.Right))
	}
	return newInternal(
		newInternal(joined.Left, joined.Right.Left),
		newInternal(joined.Right.Right, right.Right),
	)
}

// Concat concatenates this rope with another, returning a new Rope.
func (r *Rope) Concat(other *Rope) *Rope {
	return &Rope{Root: joinNodes(r.Root, other.Root)}
}

func splitNode(node *RopeNode, i int) (*RopeNode, *RopeNode) {
	if node == nil {
		return nil, nil
	}

	if node.Data != "" {
		if i <= 0 {
			return nil, node
		}
		if i >= len(node.Data) {
			return node, nil
		}
		return newLeaf(node.Data[:i]), newLeaf(node.Data[i:])
	}

	if i < node.Weight {
		lp, rp := splitNode(node.Left, i)
		return lp, joinNodes(rp, node.Right)
	}

	if i > node.Weight {
		lp, rp := splitNode(node.Right, i-node.Weight)
		return joinNodes(node.Left, lp), rp
	}

	// i == node.Weight
	return node.Left, node.Right
}

// Split splits the rope at position i, returning two new Ropes.
func (r *Rope) Split(i int) (*Rope, *Rope) {
	left, right := splitNode(r.Root, i)
	return &Rope{Root: left}, &Rope{Root: right}
}

// Insert inserts the given text at position i.
func (r *Rope) Insert(i int, text string) {
	left, right := r.Split(i)
	mid := NewRope(text)
	merged := left.Concat(mid).Concat(right)
	r.Root = merged.Root
}

// Delete removes length characters starting at position i.
func (r *Rope) Delete(i int, length int) {
	left, rest := r.Split(i)
	_, right := rest.Split(length)
	merged := left.Concat(right)
	r.Root = merged.Root
}

func main() {
	r := NewRope("Hello, World!")
	fmt.Println("Rope:   ", r.ToString())
	fmt.Println("Length: ", r.Len())

	ch, _ := r.Index(7)
	fmt.Printf("Index 7: %c\n", ch)

	r1 := NewRope("Hello, ")
	r2 := NewRope("World!")
	r3 := r1.Concat(r2)
	fmt.Println("Concat: ", r3.ToString())

	left, right := r.Split(7)
	fmt.Println("Split L:", left.ToString())
	fmt.Println("Split R:", right.ToString())

	r4 := NewRope("Hello World!")
	r4.Insert(5, ",")
	fmt.Println("Insert: ", r4.ToString())

	r5 := NewRope("Hello, World!")
	r5.Delete(5, 2)
	fmt.Println("Delete: ", r5.ToString())
}
