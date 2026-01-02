package main

import (
	"fmt"
)

type HLD struct {
	n      int
	adj    [][]int
	parent []int
	depth  []int
	size   []int
	heavy  []int
	head   []int
	pos    []int
	curPos int
}

func NewHLD(n int, adj [][]int) *HLD {
	return &HLD{
		n:      n,
		adj:    adj,
		parent: make([]int, n),
		depth:  make([]int, n),
		size:   make([]int, n),
		heavy:  make([]int, n),
		head:   make([]int, n),
		pos:    make([]int, n),
		curPos: 0,
	}
}

func (hld *HLD) dfsSize(u, p int) int {
	hld.size[u] = 1
	hld.parent[u] = p
	maxSize := 0

	for _, v := range hld.adj[u] {
		if v != p {
			hld.depth[v] = hld.depth[u] + 1
			childSize := hld.dfsSize(v, u)
			hld.size[u] += childSize
			if childSize > maxSize {
				maxSize = childSize
				hld.heavy[u] = v
			}
		}
	}

	return hld.size[u]
}

func (hld *HLD) decompose(u, h int) {
	hld.head[u] = h
	hld.pos[u] = hld.curPos
	hld.curPos++

	if hld.heavy[u] != -1 {
		hld.decompose(hld.heavy[u], h)
	}

	for _, v := range hld.adj[u] {
		if v != hld.parent[u] && v != hld.heavy[u] {
			hld.decompose(v, v)
		}
	}
}

func (hld *HLD) Build(root int) {
	for i := range hld.heavy {
		hld.heavy[i] = -1
	}
	hld.dfsSize(root, -1)
	hld.decompose(root, root)
}

func (hld *HLD) LCA(u, v int) int {
	for hld.head[u] != hld.head[v] {
		if hld.depth[hld.head[u]] < hld.depth[hld.head[v]] {
			u, v = v, u
		}
		u = hld.parent[hld.head[u]]
	}

	if hld.depth[u] > hld.depth[v] {
		u, v = v, u
	}

	return u
}

func main() {
	fmt.Println("Heavy-Light Decomposition Examples:")
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

	hld := NewHLD(n, adj)
	hld.Build(0)

	u, v := 3, 6
	fmt.Printf("LCA of %d and %d: %d\n", u, v, hld.LCA(u, v))
}
