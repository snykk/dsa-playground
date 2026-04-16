package main

import (
	"fmt"
	"strings"
)

// RopeNode represents a node in the rope binary tree.
// Leaf nodes store a string fragment in Data.
// Internal nodes store Weight (total length of the left subtree).
type RopeNode struct {
	Left   *RopeNode
	Right  *RopeNode
	Weight int
	Data   string
}

// Rope wraps a rope tree root for efficient string manipulation.
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
		return &RopeNode{Data: text, Weight: len(text)}
	}
	mid := len(text) / 2
	left := buildNode(text[:mid], leafSize)
	right := buildNode(text[mid:], leafSize)
	return &RopeNode{
		Left:   left,
		Right:  right,
		Weight: nodeLength(left),
	}
}

func nodeLength(node *RopeNode) int {
	if node == nil {
		return 0
	}
	if node.Data != "" {
		return len(node.Data)
	}
	return node.Weight + nodeLength(node.Right)
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

func concatNodes(left, right *RopeNode) *RopeNode {
	if left == nil {
		return right
	}
	if right == nil {
		return left
	}
	return &RopeNode{
		Left:   left,
		Right:  right,
		Weight: nodeLength(left),
	}
}

// Concat concatenates this rope with another, returning a new Rope.
func (r *Rope) Concat(other *Rope) *Rope {
	return &Rope{Root: concatNodes(r.Root, other.Root)}
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
		leftLeaf := &RopeNode{Data: node.Data[:i], Weight: i}
		rightLeaf := &RopeNode{Data: node.Data[i:], Weight: len(node.Data) - i}
		return leftLeaf, rightLeaf
	}

	if i < node.Weight {
		lp, rp := splitNode(node.Left, i)
		newRight := &RopeNode{
			Left:   rp,
			Right:  node.Right,
			Weight: nodeLength(rp),
		}
		return lp, newRight
	}

	if i > node.Weight {
		lp, rp := splitNode(node.Right, i-node.Weight)
		newLeft := &RopeNode{
			Left:   node.Left,
			Right:  lp,
			Weight: node.Weight,
		}
		return newLeft, rp
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
