// Package main implements a Treap: randomized self-balancing BST
// via split/merge. Expected O(log n) per operation.
package main

import (
	"fmt"
	"math/rand"
)

type node struct {
	key         int
	priority    uint32
	left, right *node
}

// Treap is an ordered set of int keys with expected O(log n) operations.
type Treap struct {
	root *node
	size int
}

// NewTreap constructs an empty Treap.
func NewTreap() *Treap {
	return &Treap{}
}

// Len returns the number of keys in the treap.
func (t *Treap) Len() int { return t.size }

// Contains reports whether key is present.
func (t *Treap) Contains(key int) bool {
	n := t.root
	for n != nil {
		if n.key == key {
			return true
		}
		if key < n.key {
			n = n.left
		} else {
			n = n.right
		}
	}
	return false
}

// Insert adds key; returns true if inserted, false if already present.
func (t *Treap) Insert(key int) bool {
	if t.Contains(key) {
		return false
	}
	left, right := split(t.root, key)
	newNode := &node{key: key, priority: rand.Uint32()}
	t.root = merge(merge(left, newNode), right)
	t.size++
	return true
}

// Delete removes key; returns true if present and removed.
func (t *Treap) Delete(key int) bool {
	if !t.Contains(key) {
		return false
	}
	// rest holds keys >= key and key is present, so key is its minimum.
	// Dropping the minimum avoids key+1, which overflows at math.MaxInt.
	left, rest := split(t.root, key)
	t.root = merge(left, dropMin(rest))
	t.size--
	return true
}

// Inorder returns keys in sorted order.
func (t *Treap) Inorder() []int {
	var out []int
	var walk func(n *node)
	walk = func(n *node) {
		if n == nil {
			return
		}
		walk(n.left)
		out = append(out, n.key)
		walk(n.right)
	}
	walk(t.root)
	return out
}

// CheckHeapProperty validates that every parent's priority >= children's.
func (t *Treap) CheckHeapProperty() bool {
	var walk func(n *node) bool
	walk = func(n *node) bool {
		if n == nil {
			return true
		}
		if n.left != nil && n.left.priority > n.priority {
			return false
		}
		if n.right != nil && n.right.priority > n.priority {
			return false
		}
		return walk(n.left) && walk(n.right)
	}
	return walk(t.root)
}

func split(n *node, key int) (*node, *node) {
	if n == nil {
		return nil, nil
	}
	if n.key < key {
		l, r := split(n.right, key)
		n.right = l
		return n, r
	}
	l, r := split(n.left, key)
	n.left = r
	return l, n
}

func dropMin(n *node) *node {
	if n.left == nil {
		return n.right
	}
	n.left = dropMin(n.left)
	return n
}

func merge(a, b *node) *node {
	if a == nil {
		return b
	}
	if b == nil {
		return a
	}
	if a.priority > b.priority {
		a.right = merge(a.right, b)
		return a
	}
	b.left = merge(a, b.left)
	return b
}

func main() {
	t := NewTreap()
	for _, k := range []int{5, 3, 7, 1, 9, 4, 6, 2, 8} {
		t.Insert(k)
	}
	fmt.Printf("Inorder: %v\n", t.Inorder())
	fmt.Printf("Heap property: %v\n", t.CheckHeapProperty())
	t.Delete(5)
	fmt.Printf("After delete 5: %v\n", t.Inorder())
}
