package main

import (
	"fmt"
)

type CentroidDecomposition struct {
	n       int
	adj     [][]int
	size    []int
	removed []bool
	parent  []int
}

func NewCentroidDecomposition(n int, adj [][]int) *CentroidDecomposition {
	return &CentroidDecomposition{
		n:       n,
		adj:     adj,
		size:    make([]int, n),
		removed: make([]bool, n),
		parent:  make([]int, n),
	}
}

func (cd *CentroidDecomposition) dfsSize(u, p int) int {
	cd.size[u] = 1
	for _, v := range cd.adj[u] {
		if v != p && !cd.removed[v] {
			cd.size[u] += cd.dfsSize(v, u)
		}
	}
	return cd.size[u]
}

func (cd *CentroidDecomposition) findCentroid(u, p, total int) int {
	for _, v := range cd.adj[u] {
		if v != p && !cd.removed[v] && cd.size[v] > total/2 {
			return cd.findCentroid(v, u, total)
		}
	}
	return u
}

func (cd *CentroidDecomposition) decompose(u, p int) {
	total := cd.dfsSize(u, -1)
	centroid := cd.findCentroid(u, -1, total)

	cd.removed[centroid] = true
	cd.parent[centroid] = p

	for _, v := range cd.adj[centroid] {
		if !cd.removed[v] {
			cd.decompose(v, centroid)
		}
	}
}

func (cd *CentroidDecomposition) Build(root int) {
	for i := range cd.parent {
		cd.parent[i] = -1
		cd.removed[i] = false
	}
	cd.decompose(root, -1)
}

func (cd *CentroidDecomposition) GetParent() []int {
	return cd.parent
}

func main() {
	fmt.Println("Centroid Decomposition Examples:")
	fmt.Println()

	n := 7
	adj := make([][]int, n)
	adj[0] = []int{1, 2}
	adj[1] = []int{0, 3, 4}
	adj[2] = []int{0, 5}
	adj[3] = []int{1}
	adj[4] = []int{1, 6}
	adj[5] = []int{2}
	adj[6] = []int{4}

	cd := NewCentroidDecomposition(n, adj)
	cd.Build(0)

	parent := cd.GetParent()
	fmt.Println("Centroid tree parent array:")
	fmt.Println(parent)
}
