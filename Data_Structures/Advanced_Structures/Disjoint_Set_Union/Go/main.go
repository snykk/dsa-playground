// Package main implements a Disjoint Set Union (DSU) data structure
// with path compression and union by rank.
//
// This is a standalone data-structure implementation focused on core
// operations, optimizations, and component enumeration. It also has the
// graph-algorithm view: connected components, cycle detection and Kruskal's MST.
package main

import (
	"fmt"
	"sort"
)

// DSU represents a Disjoint Set Union data structure.
type DSU struct {
	parent []int
	rank   []int
	size   []int
	count  int
}

// NewDSU creates a new DSU with n singleton sets {0}, {1}, ..., {n-1}.
// Time: O(n), Space: O(n)
func NewDSU(n int) *DSU {
	parent := make([]int, n)
	rank := make([]int, n)
	size := make([]int, n)
	for i := 0; i < n; i++ {
		parent[i] = i
		size[i] = 1
	}
	return &DSU{parent: parent, rank: rank, size: size, count: n}
}

// Find returns the representative (root) of the set containing x.
// Uses path compression.
// Time: O(alpha(n)) amortized
func (d *DSU) Find(x int) int {
	if d.parent[x] != x {
		d.parent[x] = d.Find(d.parent[x])
	}
	return d.parent[x]
}

// Union merges the sets containing x and y using union by rank.
// Returns true if a merge occurred, false if already in the same set.
// Time: O(alpha(n)) amortized
func (d *DSU) Union(x, y int) bool {
	rootX := d.Find(x)
	rootY := d.Find(y)

	if rootX == rootY {
		return false
	}

	if d.rank[rootX] < d.rank[rootY] {
		d.parent[rootX] = rootY
		d.size[rootY] += d.size[rootX]
	} else if d.rank[rootX] > d.rank[rootY] {
		d.parent[rootY] = rootX
		d.size[rootX] += d.size[rootY]
	} else {
		d.parent[rootY] = rootX
		d.size[rootX] += d.size[rootY]
		d.rank[rootX]++
	}

	d.count--
	return true
}

// Connected checks whether x and y belong to the same set.
// Time: O(alpha(n)) amortized
func (d *DSU) Connected(x, y int) bool {
	return d.Find(x) == d.Find(y)
}

// GetComponentCount returns the current number of disjoint sets.
// Time: O(1)
func (d *DSU) GetComponentCount() int {
	return d.count
}

// GetCount is an alias of GetComponentCount.
func (d *DSU) GetCount() int {
	return d.count
}

// GetComponents returns a mapping from each root to the list of elements
// in its set.
// Time: O(n)
func (d *DSU) GetComponents() map[int][]int {
	components := make(map[int][]int)
	for i := 0; i < len(d.parent); i++ {
		root := d.Find(i)
		components[root] = append(components[root], i)
	}
	return components
}

// GetSize returns the size of the set containing x.
// Time: O(alpha(n)) amortized
func (d *DSU) GetSize(x int) int {
	return d.size[d.Find(x)]
}

// GetParent returns the direct parent of x (useful for testing path compression).
func (d *DSU) GetParent(x int) int {
	return d.parent[x]
}

// UnionFind is the name used by the graph-algorithm view of the structure.
type UnionFind = DSU

// NewUnionFind is an alias of NewDSU.
func NewUnionFind(n int) *UnionFind {
	return NewDSU(n)
}

// ConnectedComponents returns the connected components of an undirected graph
// on vertices 0..n-1, each as a list of vertices in increasing order.
// Time: O(E alpha(n) + n)
func ConnectedComponents(edges [][]int, n int) [][]int {
	d := NewDSU(n)
	for _, e := range edges {
		d.Union(e[0], e[1])
	}
	var result [][]int
	for _, members := range d.GetComponents() {
		result = append(result, members)
	}
	sort.Slice(result, func(i, j int) bool { return result[i][0] < result[j][0] })
	return result
}

// HasCycle reports whether the undirected graph has a cycle (self-loops and
// parallel edges count).
// Time: O(E alpha(n))
func HasCycle(edges [][]int, n int) bool {
	d := NewDSU(n)
	for _, e := range edges {
		if !d.Union(e[0], e[1]) {
			return true
		}
	}
	return false
}

// KruskalMST returns a minimum spanning forest; edges are {u, v, weight}.
// Time: O(E log E + E alpha(n))
func KruskalMST(edges [][]int, n int) [][]int {
	sorted := make([][]int, len(edges))
	copy(sorted, edges)
	sort.SliceStable(sorted, func(i, j int) bool { return sorted[i][2] < sorted[j][2] })
	d := NewDSU(n)
	var mst [][]int
	for _, e := range sorted {
		if d.Union(e[0], e[1]) {
			mst = append(mst, e)
		}
	}
	return mst
}

func main() {
	dsu := NewDSU(6)
	fmt.Printf("Initial component count: %d\n", dsu.GetComponentCount()) // 6

	dsu.Union(0, 1)
	dsu.Union(2, 3)
	dsu.Union(3, 4)
	fmt.Printf("After unions: count=%d\n", dsu.GetComponentCount()) // 3
	fmt.Printf("connected(0,1)=%v\n", dsu.Connected(0, 1))          // true
	fmt.Printf("connected(0,2)=%v\n", dsu.Connected(0, 2))          // false
	fmt.Printf("size of set containing 2: %d\n", dsu.GetSize(2))    // 3
	fmt.Printf("Components: %v\n", dsu.GetComponents())
}
