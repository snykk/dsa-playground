// Lowest Common Ancestor (LCA)
//
// The lowest common ancestor of u and v in a rooted tree is the deepest node that has both u
// and v in its subtree (a node is in its own subtree). Two types answer many queries on one
// fixed tree, given as n, a list of n - 1 edges on the nodes 0..n-1, and a root:
//
//   - BinaryLifting: up[k][v] is the 2^k-th ancestor of v. O(n log n) to build, O(log n) per
//     LCA, Distance or KthAncestor.
//   - EulerTour: the Euler tour of a depth-first walk and a sparse table of the shallowest node
//     over every power-of-two window of it. O(n log n) to build, O(1) per LCA.
//
// Every walk over the tree is a loop with an explicit queue or stack, never recursion.
package main

import (
	"errors"
	"fmt"
	"math/bits"
)

// ErrNotATree is wrapped by every error the constructors return.
var ErrNotATree = errors.New("lca: not a tree")

// RootedTree is a tree hung from its root: Adj in edge order, Parent (-1 for the root) and Depth.
type RootedTree struct {
	Adj    [][]int
	Parent []int
	Depth  []int
}

// NewRootedTree checks that the edges form one tree on 0..n-1 and hangs it from root,
// breadth-first. It returns an error wrapping ErrNotATree for n < 1, a root or an endpoint
// outside 0..n-1, a number of edges other than n - 1, or edges that do not reach every node
// from the root (with n - 1 edges, that means a cycle, a repeated edge or a loop).
func NewRootedTree(n int, edges [][2]int, root int) (*RootedTree, error) {
	if n < 1 {
		return nil, fmt.Errorf("%w: a tree needs at least one node", ErrNotATree)
	}
	if root < 0 || root >= n {
		return nil, fmt.Errorf("%w: root %d is not a node of 0..%d", ErrNotATree, root, n-1)
	}
	if len(edges) != n-1 {
		return nil, fmt.Errorf("%w: a tree on %d nodes has %d edges, got %d", ErrNotATree, n, n-1, len(edges))
	}
	t := &RootedTree{Adj: make([][]int, n), Parent: make([]int, n), Depth: make([]int, n)}
	for _, e := range edges {
		u, v := e[0], e[1]
		if u < 0 || u >= n || v < 0 || v >= n {
			return nil, fmt.Errorf("%w: edge (%d, %d) has an endpoint outside 0..%d", ErrNotATree, u, v, n-1)
		}
		t.Adj[u] = append(t.Adj[u], v)
		t.Adj[v] = append(t.Adj[v], u)
	}
	for i := range t.Parent {
		t.Parent[i] = -1
	}
	seen := make([]bool, n)
	seen[root] = true
	queue := []int{root}
	for head := 0; head < len(queue); head++ {
		u := queue[head]
		for _, v := range t.Adj[u] {
			if !seen[v] {
				seen[v] = true
				t.Parent[v] = u
				t.Depth[v] = t.Depth[u] + 1
				queue = append(queue, v)
			}
		}
	}
	if len(queue) != n {
		return nil, fmt.Errorf("%w: the edges reach %d of the %d nodes from the root", ErrNotATree, len(queue), n)
	}
	return t, nil
}

func checkNode(v, n int) {
	if v < 0 || v >= n {
		panic(fmt.Sprintf("lca: node %d is not in 0..%d", v, n-1))
	}
}

// BinaryLifting answers LCA queries with up[k][v], the 2^k-th ancestor of v. The root is its
// own parent (up[k][root] == root for every k), so a jump that would leave the tree stops at
// the root and the table needs no -1 checks.
type BinaryLifting struct {
	n      int
	levels int
	parent []int
	depth  []int
	up     [][]int
}

// NewBinaryLifting builds the table in O(n log n).
func NewBinaryLifting(n int, edges [][2]int, root int) (*BinaryLifting, error) {
	t, err := NewRootedTree(n, edges, root)
	if err != nil {
		return nil, err
	}
	// floor(log2 n) + 1 levels: jumps 1, 2, ..., 2^(levels-1) add up to at least n - 1.
	levels := bits.Len(uint(n))
	up := make([][]int, levels)
	up[0] = make([]int, n)
	for v, p := range t.Parent {
		if p == -1 {
			up[0][v] = root
		} else {
			up[0][v] = p
		}
	}
	for k := 1; k < levels; k++ {
		// Two jumps of 2^(k-1) make one jump of 2^k.
		up[k] = make([]int, n)
		for v := 0; v < n; v++ {
			up[k][v] = up[k-1][up[k-1][v]]
		}
	}
	return &BinaryLifting{n: n, levels: levels, parent: t.Parent, depth: t.Depth, up: up}, nil
}

// KthAncestor returns the ancestor k levels above v (v for k = 0), or -1 when k > depth(v).
// It panics for a node outside 0..n-1 or a negative k.
func (b *BinaryLifting) KthAncestor(v, k int) int {
	checkNode(v, b.n)
	if k < 0 {
		panic("lca: k must be at least 0")
	}
	if k > b.depth[v] {
		return -1
	}
	for level := 0; k > 0; level, k = level+1, k>>1 {
		if k&1 == 1 {
			v = b.up[level][v]
		}
	}
	return v
}

// LCA lifts the deeper node to the other's depth, then lifts both while their ancestors differ.
func (b *BinaryLifting) LCA(u, v int) int {
	checkNode(u, b.n)
	checkNode(v, b.n)
	if b.depth[u] < b.depth[v] {
		u, v = v, u
	}
	u = b.KthAncestor(u, b.depth[u]-b.depth[v])
	if u == v {
		return u
	}
	for k := b.levels - 1; k >= 0; k-- {
		if b.up[k][u] != b.up[k][v] {
			u, v = b.up[k][u], b.up[k][v]
		}
	}
	return b.up[0][u]
}

// Distance is the number of edges on the path from u to v.
func (b *BinaryLifting) Distance(u, v int) int {
	w := b.LCA(u, v)
	return b.depth[u] + b.depth[v] - 2*b.depth[w]
}

// Levels is the number of rows of the table, floor(log2 n) + 1.
func (b *BinaryLifting) Levels() int { return b.levels }

// Depth returns a copy of the depths.
func (b *BinaryLifting) Depth() []int { return append([]int(nil), b.depth...) }

// Parent returns a copy of the parents (-1 for the root).
func (b *BinaryLifting) Parent() []int { return append([]int(nil), b.parent...) }

// Up returns a copy of the table: Up()[k][v] is the 2^k-th ancestor of v.
func (b *BinaryLifting) Up() [][]int { return copyRows(b.up) }

// EulerTour answers LCA queries with the Euler tour of a depth-first walk and a sparse table
// over it. Between first[u] and first[v] the walk stays in the subtree of the LCA and passes
// through it, so the LCA is the shallowest node of that range.
type EulerTour struct {
	n      int
	parent []int
	depth  []int
	euler  []int
	first  []int
	sparse [][]int
}

// NewEulerTour builds the tour (2n - 1 entries, children in adjacency order) and the sparse
// table in O(n log n).
func NewEulerTour(n int, edges [][2]int, root int) (*EulerTour, error) {
	t, err := NewRootedTree(n, edges, root)
	if err != nil {
		return nil, err
	}
	e := &EulerTour{n: n, parent: t.Parent, depth: t.Depth, euler: []int{root}, first: make([]int, n)}
	for i := range e.first {
		e.first[i] = -1
	}
	e.first[root] = 0
	// next[u] is the next neighbour of u to try.
	next := make([]int, n)
	stack := []int{root}
	for len(stack) > 0 {
		u := stack[len(stack)-1]
		if next[u] < len(t.Adj[u]) {
			v := t.Adj[u][next[u]]
			next[u]++
			if v != e.parent[u] {
				e.first[v] = len(e.euler)
				e.euler = append(e.euler, v)
				stack = append(stack, v)
			}
		} else {
			stack = stack[:len(stack)-1]
			if len(stack) > 0 {
				// Back in the parent after the whole subtree of u.
				e.euler = append(e.euler, stack[len(stack)-1])
			}
		}
	}
	// sparse[k][i] is the shallowest node of euler[i .. i + 2^k - 1].
	m := len(e.euler)
	e.sparse = [][]int{append([]int(nil), e.euler...)}
	for k := 1; 1<<k <= m; k++ {
		prev := e.sparse[k-1]
		half := 1 << (k - 1)
		row := make([]int, m-(1<<k)+1)
		for i := range row {
			row[i] = e.shallower(prev[i], prev[i+half])
		}
		e.sparse = append(e.sparse, row)
	}
	return e, nil
}

// shallower returns the shallower of two nodes; on equal depths the left one.
func (e *EulerTour) shallower(a, b int) int {
	if e.depth[a] <= e.depth[b] {
		return a
	}
	return b
}

// LCA is the shallowest node of euler[first[u] .. first[v]], from two overlapping windows: O(1).
// It panics for a node outside 0..n-1.
func (e *EulerTour) LCA(u, v int) int {
	checkNode(u, e.n)
	checkNode(v, e.n)
	left, right := e.first[u], e.first[v]
	if left > right {
		left, right = right, left
	}
	k := bits.Len(uint(right-left+1)) - 1
	return e.shallower(e.sparse[k][left], e.sparse[k][right-(1<<k)+1])
}

// Distance is the number of edges on the path from u to v.
func (e *EulerTour) Distance(u, v int) int {
	w := e.LCA(u, v)
	return e.depth[u] + e.depth[v] - 2*e.depth[w]
}

// Depth returns a copy of the depths.
func (e *EulerTour) Depth() []int { return append([]int(nil), e.depth...) }

// Euler returns a copy of the tour.
func (e *EulerTour) Euler() []int { return append([]int(nil), e.euler...) }

// First returns a copy of first: First()[v] is the index where v first appears in the tour.
func (e *EulerTour) First() []int { return append([]int(nil), e.first...) }

// Sparse returns a copy of the table: Sparse()[k][i] is the shallowest node of euler[i .. i + 2^k - 1].
func (e *EulerTour) Sparse() [][]int { return copyRows(e.sparse) }

func copyRows(rows [][]int) [][]int {
	out := make([][]int, len(rows))
	for i, r := range rows {
		out[i] = append([]int(nil), r...)
	}
	return out
}

func main() {
	//         0
	//       /   \
	//      1     2
	//     / \     \
	//    3   4     5
	//   / \         \
	//  6   7         8
	//  |
	//  9
	edges := [][2]int{{0, 1}, {0, 2}, {1, 3}, {1, 4}, {2, 5}, {3, 6}, {3, 7}, {5, 8}, {6, 9}}
	lifting, err := NewBinaryLifting(10, edges, 0)
	if err != nil {
		panic(err)
	}
	tour, err := NewEulerTour(10, edges, 0)
	if err != nil {
		panic(err)
	}
	fmt.Println("euler:", tour.Euler())
	for _, q := range [][2]int{{9, 4}, {9, 8}, {7, 9}, {3, 3}} {
		u, v := q[0], q[1]
		fmt.Printf("lca(%d, %d) = %d (lifting), %d (Euler tour); distance %d\n", u, v, lifting.LCA(u, v), tour.LCA(u, v), lifting.Distance(u, v))
	}
	fmt.Println("KthAncestor(9, 3) =", lifting.KthAncestor(9, 3))
	fmt.Println("KthAncestor(9, 5) =", lifting.KthAncestor(9, 5))
}
