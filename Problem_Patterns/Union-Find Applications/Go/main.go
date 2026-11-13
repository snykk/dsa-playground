package main

import "fmt"

// UnionFind implements Disjoint Set Union with Path Compression and Union by Rank.
type UnionFind struct {
	parent []int
	rank   []int
	count  int
}

// NewUnionFind initializes DSU with size elements.
// Time Complexity: O(n)
func NewUnionFind(size int) *UnionFind {
	parent := make([]int, size)
	rank := make([]int, size)
	for i := 0; i < size; i++ {
		parent[i] = i
		rank[i] = 1
	}
	return &UnionFind{
		parent: parent,
		rank:   rank,
		count:  size,
	}
}

// Find returns the representative (root) of the set containing x.
// Applies Path Compression.
// Time Complexity: O(alpha(n))
func (uf *UnionFind) Find(x int) int {
	if uf.parent[x] != x {
		uf.parent[x] = uf.Find(uf.parent[x])
	}
	return uf.parent[x]
}

// Union merges the sets containing x and y.
// Applies Union by Rank.
// Returns true if sets were merged, false if they were already same.
// Time Complexity: O(alpha(n))
func (uf *UnionFind) Union(x, y int) bool {
	rootX := uf.Find(x)
	rootY := uf.Find(y)

	if rootX == rootY {
		return false
	}

	// Union by Rank
	if uf.rank[rootX] > uf.rank[rootY] {
		uf.parent[rootY] = rootX
	} else if uf.rank[rootX] < uf.rank[rootY] {
		uf.parent[rootX] = rootY
	} else {
		uf.parent[rootY] = rootX
		uf.rank[rootX]++
	}

	uf.count--
	return true
}

// Connected checks if x and y are in the same set.
func (uf *UnionFind) Connected(x, y int) bool {
	return uf.Find(x) == uf.Find(y)
}

// GetCount returns the number of disjoint sets.
func (uf *UnionFind) GetCount() int {
	return uf.count
}

func main() {
	fmt.Println("=== Union-Find Example ===")

	n := 5
	uf := NewUnionFind(n)
	fmt.Printf("Initial sets: %d\n", uf.GetCount())

	fmt.Println("Union(0, 1)")
	uf.Union(0, 1)

	fmt.Println("Union(2, 3)")
	uf.Union(2, 3)

	fmt.Println("Union(0, 4)")
	uf.Union(0, 4)

	fmt.Printf("Sets count: %d\n", uf.GetCount())            // Expected: 2
	fmt.Printf("0 connected to 4? %v\n", uf.Connected(0, 4)) // Expected: true
	fmt.Printf("0 connected to 3? %v\n", uf.Connected(0, 3)) // Expected: false
}
