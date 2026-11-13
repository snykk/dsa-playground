// Package main implements Convex Hull Trick (min) and Li Chao Tree.
//
// MonotonicCHT: O(1) amortized per op; requires non-increasing slopes and
// non-decreasing queries.
// LiChaoTree: O(log V) per op; no ordering restrictions.
package main

import (
	"fmt"
	"math"
	"math/big"
)

// Line represents y = m*x + b.
type Line struct {
	M, B int64
}

// MonotonicCHT maintains the lower envelope for min queries.
type MonotonicCHT struct {
	lines []Line
}

// NewMonotonicCHT constructs an empty monotonic CHT.
func NewMonotonicCHT() *MonotonicCHT { return &MonotonicCHT{} }

// AddLine inserts (m, b). Caller must pass slopes in non-increasing order.
func (c *MonotonicCHT) AddLine(m, b int64) {
	if n := len(c.lines); n > 0 && c.lines[n-1].M == m {
		// Equal slopes: only the lower intercept can ever be optimal.
		if c.lines[n-1].B <= b {
			return
		}
		c.lines = c.lines[:n-1]
	}
	for len(c.lines) >= 2 &&
		isBad(c.lines[len(c.lines)-2], c.lines[len(c.lines)-1], Line{m, b}) {
		c.lines = c.lines[:len(c.lines)-1]
	}
	c.lines = append(c.lines, Line{m, b})
}

// Query returns the minimum y over all inserted lines at x.
// x must be non-decreasing across successive calls.
func (c *MonotonicCHT) Query(x int64) int64 {
	for len(c.lines) >= 2 &&
		eval(c.lines[0], x) >= eval(c.lines[1], x) {
		c.lines = c.lines[1:]
	}
	return eval(c.lines[0], x)
}

func eval(l Line, x int64) int64 { return l.M*x + l.B }

// isBad: is l2 redundant given l1 and l3? Integer cross-multiplication via big.Int
// to avoid overflow.
func isBad(l1, l2, l3 Line) bool {
	// (b3 - b1) * (m1 - m2) <= (b2 - b1) * (m1 - m3)
	diff := func(a, b int64) *big.Int { return new(big.Int).Sub(big.NewInt(a), big.NewInt(b)) }
	lhs := new(big.Int).Mul(diff(l3.B, l1.B), diff(l1.M, l2.M))
	rhs := new(big.Int).Mul(diff(l2.B, l1.B), diff(l1.M, l3.M))
	return lhs.Cmp(rhs) <= 0
}

// -----------------------------------------------------------------------------

type liNode struct {
	line        Line
	defined     bool
	left, right *liNode
}

// LiChaoTree supports arbitrary-order line insertion and O(log V) min queries
// over a fixed x range [lo, hi].
type LiChaoTree struct {
	lo, hi int64
	root   *liNode
}

// NewLiChaoTree constructs a tree over the range [lo, hi].
func NewLiChaoTree(lo, hi int64) *LiChaoTree {
	return &LiChaoTree{lo: lo, hi: hi, root: &liNode{}}
}

// AddLine inserts y = m*x + b.
func (t *LiChaoTree) AddLine(m, b int64) {
	insertLi(t.root, t.lo, t.hi, Line{m, b})
}

// Query returns min y at x.
func (t *LiChaoTree) Query(x int64) int64 {
	if x < t.lo || x > t.hi {
		panic(fmt.Sprintf("query x=%d out of range [%d, %d]", x, t.lo, t.hi))
	}
	return queryLi(t.root, t.lo, t.hi, x)
}

func insertLi(node *liNode, lo, hi int64, newLine Line) {
	if !node.defined {
		node.line = newLine
		node.defined = true
		return
	}
	mid := lo + (hi-lo)/2
	cur := node.line
	if eval(newLine, mid) < eval(cur, mid) {
		node.line, newLine = newLine, cur
	}
	if lo == hi {
		return
	}
	stored := node.line
	if eval(newLine, lo) < eval(stored, lo) {
		if node.left == nil {
			node.left = &liNode{}
		}
		insertLi(node.left, lo, mid, newLine)
	} else if eval(newLine, hi) < eval(stored, hi) {
		if node.right == nil {
			node.right = &liNode{}
		}
		insertLi(node.right, mid+1, hi, newLine)
	}
}

func queryLi(node *liNode, lo, hi int64, x int64) int64 {
	if node == nil || !node.defined {
		return math.MaxInt64
	}
	best := eval(node.line, x)
	if lo == hi {
		return best
	}
	mid := lo + (hi-lo)/2
	var other int64
	if x <= mid {
		other = queryLi(node.left, lo, mid, x)
	} else {
		other = queryLi(node.right, mid+1, hi, x)
	}
	if other < best {
		return other
	}
	return best
}

func main() {
	cht := NewMonotonicCHT()
	cht.AddLine(2, 5)
	cht.AddLine(1, 3)
	cht.AddLine(-1, 7)
	for _, x := range []int64{0, 3, 10} {
		fmt.Printf("min at x=%d -> %d\n", x, cht.Query(x))
	}
}
