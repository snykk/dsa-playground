// Package main implements Tarjan's algorithm for bridges and
// articulation points in an undirected graph in O(V + E).
package main

import (
	"fmt"
	"sort"
)

// Edge is an undirected edge.
type Edge struct{ U, V int }

type adjEntry struct {
	to     int
	edgeID int
}

// Result holds the computed bridges and articulation points.
type Result struct {
	Bridges       []Edge
	Articulations []int
}

// FindBridgesAndArticulations runs Tarjan's algorithm.
// Vertices are 0..n-1. Parallel edges and self-loops are handled correctly.
func FindBridgesAndArticulations(n int, edges []Edge) Result {
	adj := make([][]adjEntry, n)
	for i, e := range edges {
		adj[e.U] = append(adj[e.U], adjEntry{e.V, i})
		adj[e.V] = append(adj[e.V], adjEntry{e.U, i})
	}

	disc := make([]int, n)
	low := make([]int, n)
	for i := range disc {
		disc[i] = -1
	}

	bridges := make(map[Edge]struct{})
	apSet := make(map[int]struct{})
	timer := 0

	var dfs func(u, parentEdge int)
	dfs = func(u, parentEdge int) {
		disc[u] = timer
		low[u] = timer
		timer++
		children := 0
		for _, a := range adj[u] {
			if a.edgeID == parentEdge {
				continue
			}
			v := a.to
			if disc[v] == -1 {
				children++
				dfs(v, a.edgeID)
				if low[v] < low[u] {
					low[u] = low[v]
				}
				if low[v] > disc[u] {
					a, b := u, v
					if a > b {
						a, b = b, a
					}
					bridges[Edge{a, b}] = struct{}{}
				}
				if parentEdge != -1 && low[v] >= disc[u] {
					apSet[u] = struct{}{}
				}
			} else {
				if disc[v] < low[u] {
					low[u] = disc[v]
				}
			}
		}
		if parentEdge == -1 && children > 1 {
			apSet[u] = struct{}{}
		}
	}

	for i := 0; i < n; i++ {
		if disc[i] == -1 {
			dfs(i, -1)
		}
	}

	res := Result{}
	for e := range bridges {
		res.Bridges = append(res.Bridges, e)
	}
	sort.Slice(res.Bridges, func(i, j int) bool {
		if res.Bridges[i].U != res.Bridges[j].U {
			return res.Bridges[i].U < res.Bridges[j].U
		}
		return res.Bridges[i].V < res.Bridges[j].V
	})
	for v := range apSet {
		res.Articulations = append(res.Articulations, v)
	}
	sort.Ints(res.Articulations)
	return res
}

func main() {
	edges := []Edge{{0, 1}, {1, 2}, {2, 0}, {2, 3}}
	r := FindBridgesAndArticulations(4, edges)
	fmt.Printf("Bridges: %v\n", r.Bridges)
	fmt.Printf("Articulation points: %v\n", r.Articulations)
}
