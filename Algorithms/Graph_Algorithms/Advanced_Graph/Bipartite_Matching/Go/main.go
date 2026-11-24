// Maximum matching in an unweighted bipartite graph: Kuhn's algorithm, Hopcroft-Karp, and a
// minimum vertex cover by Konig's theorem.
//
// The graph has nLeft vertices on the left (0 .. nLeft-1), nRight on the right (0 .. nRight-1)
// and a list of edges {u, v}, each joining left vertex u to right vertex v. adj[u] lists u's
// right neighbours in edge order, and every search tries them in that order, so the matching
// returned is the one the Python and C++ versions return.
//
// The depth-first searches keep their path in slices instead of recursing, the same loop as
// the Python and C++ versions.
package main

import (
	"errors"
	"fmt"
)

// ErrInvalidGraph is returned for a negative side size or an edge endpoint out of range.
var ErrInvalidGraph = errors.New("invalid bipartite graph")

// adjacency returns adj[u], the right neighbours of left vertex u in edge order (a duplicate
// edge stays).
func adjacency(nLeft, nRight int, edges [][2]int) ([][]int, error) {
	if nLeft < 0 || nRight < 0 {
		return nil, fmt.Errorf("%w: side sizes must be >= 0, got nLeft=%d, nRight=%d", ErrInvalidGraph, nLeft, nRight)
	}
	adj := make([][]int, nLeft)
	for _, e := range edges {
		u, v := e[0], e[1]
		if u < 0 || u >= nLeft || v < 0 || v >= nRight {
			return nil, fmt.Errorf("%w: edge (%d, %d) is outside the graph: u must be in [0, %d) and v in [0, %d)",
				ErrInvalidGraph, u, v, nLeft, nRight)
		}
		adj[u] = append(adj[u], v)
	}
	return adj, nil
}

func filled(n, value int) []int {
	s := make([]int, n)
	for i := range s {
		s[i] = value
	}
	return s
}

// flip turns the augmenting path stack[0] - through[0] - stack[1] - ... - through[len-1]
// around: every left vertex on it takes the right vertex after it.
func flip(stack, through, matchLeft, matchRight []int) {
	for k, left := range stack {
		matchLeft[left] = through[k]
		matchRight[through[k]] = left
	}
}

// kuhnAugment is Kuhn's DFS from the free left vertex root. seen[v] == root marks the right
// vertices this search has tried, so nothing is cleared between roots.
func kuhnAugment(root int, adj [][]int, matchLeft, matchRight, seen []int) bool {
	stack := []int{root} // left vertices on the current alternating path
	nextEdge := []int{0}
	through := []int{} // through[k]: the right vertex between stack[k] and stack[k+1]
	for len(stack) > 0 {
		top := len(stack) - 1
		u := stack[top]
		if nextEdge[top] == len(adj[u]) {
			stack, nextEdge = stack[:top], nextEdge[:top]
			if len(through) > 0 {
				through = through[:len(through)-1]
			}
			continue
		}
		v := adj[u][nextEdge[top]]
		nextEdge[top]++
		if seen[v] == root {
			continue
		}
		seen[v] = root
		through = append(through, v)
		if matchRight[v] == -1 {
			flip(stack, through, matchLeft, matchRight)
			return true
		}
		stack = append(stack, matchRight[v]) // v is taken: ask its partner to move
		nextEdge = append(nextEdge, 0)
	}
	return false
}

// bfsLayers is Hopcroft-Karp's BFS. Layer 0 is every free left vertex; a matched right vertex
// next to layer d puts its partner in layer d+1. It stops at the first free right vertex: the
// layer of its neighbour is the last one. It returns that layer, or -1 when no augmenting path
// is left; dist[u] is -1 for every vertex outside layers 0 .. last.
func bfsLayers(adj [][]int, matchLeft, matchRight, dist []int) int {
	queue := []int{}
	for u, partner := range matchLeft {
		dist[u] = -1
		if partner == -1 {
			dist[u] = 0
			queue = append(queue, u)
		}
	}
	for head := 0; head < len(queue); head++ {
		u := queue[head]
		for _, v := range adj[u] {
			w := matchRight[v]
			if w == -1 {
				last := dist[u]
				for x, d := range dist {
					if d > last {
						dist[x] = -1 // past the last layer: on no shortest augmenting path
					}
				}
				return last
			}
			if dist[w] == -1 {
				dist[w] = dist[u] + 1
				queue = append(queue, w)
			}
		}
	}
	return -1
}

// hkAugment is Hopcroft-Karp's DFS: from u, only to a partner in layer dist[u]+1. A free right
// vertex is only ever next to the last layer, so reaching one gives a shortest augmenting
// path. A left vertex whose search fails gets dist -1 and is not entered again in this phase.
func hkAugment(root int, adj [][]int, matchLeft, matchRight, dist []int) bool {
	stack := []int{root}
	nextEdge := []int{0}
	through := []int{}
	for len(stack) > 0 {
		top := len(stack) - 1
		u := stack[top]
		if nextEdge[top] == len(adj[u]) {
			dist[u] = -1 // a dead end for the rest of this phase
			stack, nextEdge = stack[:top], nextEdge[:top]
			if len(through) > 0 {
				through = through[:len(through)-1]
			}
			continue
		}
		v := adj[u][nextEdge[top]]
		nextEdge[top]++
		w := matchRight[v]
		if w == -1 {
			through = append(through, v)
			flip(stack, through, matchLeft, matchRight)
			return true
		}
		if dist[w] == dist[u]+1 {
			through = append(through, v)
			stack = append(stack, w)
			nextEdge = append(nextEdge, 0)
		}
	}
	return false
}

func runHopcroftKarp(adj [][]int, nRight int) (int, []int, []int) {
	nLeft := len(adj)
	matchLeft, matchRight := filled(nLeft, -1), filled(nRight, -1)
	dist := filled(nLeft, -1)
	size := 0
	for bfsLayers(adj, matchLeft, matchRight, dist) != -1 {
		for root := 0; root < nLeft; root++ {
			if matchLeft[root] == -1 && hkAugment(root, adj, matchLeft, matchRight, dist) {
				size++
			}
		}
	}
	return size, matchLeft, matchRight
}

// Kuhn returns the size of a maximum matching and the partner of every left vertex (-1 when
// unmatched), with one DFS for an augmenting path from each left vertex in order 0, 1, ...
// O(V * E) time, O(V + E) space.
func Kuhn(nLeft, nRight int, edges [][2]int) (int, []int, error) {
	adj, err := adjacency(nLeft, nRight, edges)
	if err != nil {
		return 0, nil, err
	}
	matchLeft, matchRight, seen := filled(nLeft, -1), filled(nRight, -1), filled(nRight, -1)
	size := 0
	for root := 0; root < nLeft; root++ {
		if kuhnAugment(root, adj, matchLeft, matchRight, seen) {
			size++
		}
	}
	return size, matchLeft, nil
}

// HopcroftKarp returns a maximum matching as Kuhn does, in phases of one BFS (the layers) and
// one DFS from each free left vertex, which take vertex-disjoint shortest augmenting paths.
// O(E * sqrt(V)) time, O(V + E) space.
func HopcroftKarp(nLeft, nRight int, edges [][2]int) (int, []int, error) {
	adj, err := adjacency(nLeft, nRight, edges)
	if err != nil {
		return 0, nil, err
	}
	size, matchLeft, _ := runHopcroftKarp(adj, nRight)
	return size, matchLeft, nil
}

// MinVertexCover returns a minimum vertex cover by Konig's theorem, from the Hopcroft-Karp
// matching: with Z the vertices reachable from the free left vertices by alternating paths,
// the cover is the left vertices outside Z and the right vertices inside it, each list in
// increasing order. It has as many vertices as the matching has edges.
func MinVertexCover(nLeft, nRight int, edges [][2]int) (left, right []int, err error) {
	adj, err := adjacency(nLeft, nRight, edges)
	if err != nil {
		return nil, nil, err
	}
	_, matchLeft, matchRight := runHopcroftKarp(adj, nRight)
	leftInZ, rightInZ := make([]bool, nLeft), make([]bool, nRight)
	stack := []int{}
	for u, partner := range matchLeft {
		if partner == -1 {
			leftInZ[u] = true
			stack = append(stack, u)
		}
	}
	for len(stack) > 0 {
		u := stack[len(stack)-1]
		stack = stack[:len(stack)-1]
		for _, v := range adj[u] {
			if rightInZ[v] {
				continue
			}
			rightInZ[v] = true
			w := matchRight[v] // matched, or the matching would not be maximum
			if !leftInZ[w] {
				leftInZ[w] = true
				stack = append(stack, w)
			}
		}
	}
	left, right = []int{}, []int{}
	for u := 0; u < nLeft; u++ {
		if !leftInZ[u] {
			left = append(left, u)
		}
	}
	for v := 0; v < nRight; v++ {
		if rightInZ[v] {
			right = append(right, v)
		}
	}
	return left, right, nil
}

func main() {
	// Four left and four right vertices; L1, L2 and L3 reach only R0 and R1.
	example := [][2]int{{0, 1}, {0, 2}, {0, 3}, {1, 0}, {1, 1}, {2, 0}, {3, 1}}
	size, match, _ := Kuhn(4, 4, example)
	fmt.Printf("Kuhn: size %d, matchLeft %v\n", size, match) // 3 [2 1 0 -1]
	size, match, _ = HopcroftKarp(4, 4, example)
	fmt.Printf("Hopcroft-Karp: size %d, matchLeft %v\n", size, match) // 3 [2 0 -1 1]
	left, right, _ := MinVertexCover(4, 4, example)
	fmt.Printf("Minimum vertex cover: left %v, right %v\n", left, right) // [0] [0 1]
}
