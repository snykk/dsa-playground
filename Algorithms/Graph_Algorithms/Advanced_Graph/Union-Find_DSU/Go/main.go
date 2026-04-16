package main

import "fmt"

// UnionFind represents a Union-Find (Disjoint Set Union) data structure
type UnionFind struct {
	parent []int
	rank   []int
	count  int
}

// NewUnionFind creates a new UnionFind structure for n elements
func NewUnionFind(n int) *UnionFind {
	parent := make([]int, n)
	rank := make([]int, n)
	for i := 0; i < n; i++ {
		parent[i] = i
	}
	return &UnionFind{parent: parent, rank: rank, count: n}
}

// Find returns the root of the set containing x with path compression
func (uf *UnionFind) Find(x int) int {
	if uf.parent[x] != x {
		uf.parent[x] = uf.Find(uf.parent[x]) // Path compression
	}
	return uf.parent[x]
}

// Union merges the sets containing x and y using union by rank
func (uf *UnionFind) Union(x, y int) bool {
	rootX := uf.Find(x)
	rootY := uf.Find(y)

	if rootX == rootY {
		return false // Already in same set
	}

	// Union by rank
	if uf.rank[rootX] < uf.rank[rootY] {
		uf.parent[rootX] = rootY
	} else if uf.rank[rootX] > uf.rank[rootY] {
		uf.parent[rootY] = rootX
	} else {
		uf.parent[rootY] = rootX
		uf.rank[rootX]++
	}

	uf.count--
	return true
}

// Connected checks if x and y are in the same set
func (uf *UnionFind) Connected(x, y int) bool {
	return uf.Find(x) == uf.Find(y)
}

// GetCount returns the number of disjoint sets
func (uf *UnionFind) GetCount() int {
	return uf.count
}

// UnionFindCycleDetection detects cycle in undirected graph
func UnionFindCycleDetection(edges [][]int, n int) bool {
	uf := NewUnionFind(n)

	for _, edge := range edges {
		if !uf.Union(edge[0], edge[1]) {
			return true // Cycle detected
		}
	}

	return false
}

func main() {
	// Example usage
	fmt.Println("Union-Find Example:")

	uf := NewUnionFind(5)
	fmt.Printf("Initial count: %d\n", uf.GetCount()) // 5

	uf.Union(0, 1)
	fmt.Printf("After union(0,1): count=%d, connected(0,1)=%v\n", uf.GetCount(), uf.Connected(0, 1))

	uf.Union(2, 3)
	fmt.Printf("After union(2,3): count=%d, connected(2,3)=%v\n", uf.GetCount(), uf.Connected(2, 3))

	uf.Union(1, 2)
	fmt.Printf("After union(1,2): count=%d, connected(0,3)=%v\n", uf.GetCount(), uf.Connected(0, 3))

	// Cycle detection
	fmt.Println("\nCycle Detection Example:")
	edges := [][]int{{0, 1}, {1, 2}, {2, 0}} // Triangle
	hasCycle := UnionFindCycleDetection(edges, 3)
	fmt.Printf("Graph with cycle: %v\n", hasCycle) // true

	edgesNoCycle := [][]int{{0, 1}, {1, 2}}
	hasCycle = UnionFindCycleDetection(edgesNoCycle, 3)
	fmt.Printf("Graph without cycle: %v\n", hasCycle) // false
}

