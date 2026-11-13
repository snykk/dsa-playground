package main

import "sort"

// UnionFind represents a disjoint set union data structure
type UnionFind struct {
	parent []int
	rank   []int
}

// NewUnionFind creates a new UnionFind structure
func NewUnionFind(n int) *UnionFind {
	parent := make([]int, n)
	rank := make([]int, n)
	for i := range parent {
		parent[i] = i
	}
	return &UnionFind{parent: parent, rank: rank}
}

// Find finds the root of x with path compression
func (uf *UnionFind) Find(x int) int {
	if uf.parent[x] != x {
		uf.parent[x] = uf.Find(uf.parent[x])
	}
	return uf.parent[x]
}

// Union merges sets containing x and y
func (uf *UnionFind) Union(x, y int) bool {
	rootX := uf.Find(x)
	rootY := uf.Find(y)

	if rootX == rootY {
		return false
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
	return true
}

// KruskalMST finds MST using Kruskal's algorithm
func KruskalMST(edges [][]int, numVertices int) ([][]int, int) {
	if numVertices == 0 {
		return [][]int{}, 0
	}

	// Sort edges by weight
	sort.Slice(edges, func(i, j int) bool {
		return edges[i][2] < edges[j][2]
	})

	uf := NewUnionFind(numVertices)
	var mst [][]int
	totalWeight := 0

	for _, edge := range edges {
		u, v, weight := edge[0], edge[1], edge[2]

		if uf.Union(u, v) {
			mst = append(mst, edge)
			totalWeight += weight

			// MST has V-1 edges
			if len(mst) == numVertices-1 {
				break
			}
		}
	}

	return mst, totalWeight
}
