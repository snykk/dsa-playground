// Package main implements a Disjoint Set Union (DSU) data structure
// with path compression and union by rank.
//
// This is a standalone data-structure implementation focused on core
// operations, optimizations, and component enumeration. For graph-algorithm
// applications see Algorithms/Graph_Algorithms/Advanced_Graph/Union-Find_DSU/.
package main

import "fmt"

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

func main() {
	dsu := NewDSU(6)
	fmt.Printf("Initial component count: %d\n", dsu.GetComponentCount()) // 6

	dsu.Union(0, 1)
	dsu.Union(2, 3)
	dsu.Union(3, 4)
	fmt.Printf("After unions: count=%d\n", dsu.GetComponentCount())   // 3
	fmt.Printf("connected(0,1)=%v\n", dsu.Connected(0, 1))           // true
	fmt.Printf("connected(0,2)=%v\n", dsu.Connected(0, 2))           // false
	fmt.Printf("size of set containing 2: %d\n", dsu.GetSize(2))     // 3
	fmt.Printf("Components: %v\n", dsu.GetComponents())
}
