// Eulerian paths and circuits: a walk that uses every edge of a graph exactly once, found by
// Hierholzer's algorithm in O(V + E).
//
// The graph has n vertices, 0 .. n-1, and a list of edges {u, v}, all undirected or all
// directed. Self-loops, parallel edges and isolated vertices are allowed. A walk exists when
// the degrees pass the test (undirected: 0 or 2 odd vertices; directed: every vertex balanced,
// or one with out = in + 1 and one with in = out + 1) and every edge lies in one (weakly)
// connected component; the walk itself checks the second condition.
//
// adj[v] lists v's edges in input order (an undirected edge in both ends' lists, a self-loop
// twice), and the walk always leaves v by the first edge of adj[v] it has not used yet, so the
// walk returned is the one the Python and C++ versions return. The walk keeps its vertices in
// a slice, the same loop as the Python and C++ versions.
package main

import (
	"errors"
	"fmt"
)

// ErrInvalidGraph is returned for a negative number of vertices or an edge end out of range.
var ErrInvalidGraph = errors.New("invalid graph")

// Kind says which walk the graph has.
type Kind int

const (
	// None: no walk uses every edge exactly once.
	None Kind = iota
	// Path: an open walk does, but no closed one.
	Path
	// Circuit: a closed walk does (also when the graph has no edge).
	Circuit
)

func (k Kind) String() string {
	switch k {
	case Path:
		return "path"
	case Circuit:
		return "circuit"
	}
	return "none"
}

// Walk is a walk that uses every edge once: len(EdgeIDs)+1 vertices (none when there is no
// edge), and EdgeIDs[i] is the input index of the edge between Vertices[i] and Vertices[i+1].
type Walk struct {
	Vertices []int
	EdgeIDs  []int
}

type entry struct {
	to   int // the other end
	edge int // the edge's index in the input
}

// adjacency returns adj[u] in edge order: a directed edge in its tail's list, an undirected
// edge in both ends' lists (a self-loop twice in its vertex's list).
func adjacency(n int, edges [][2]int, directed bool) ([][]entry, error) {
	if n < 0 {
		return nil, fmt.Errorf("%w: the number of vertices must be >= 0, got %d", ErrInvalidGraph, n)
	}
	adj := make([][]entry, n)
	for e, edge := range edges {
		u, v := edge[0], edge[1]
		if u < 0 || u >= n || v < 0 || v >= n {
			return nil, fmt.Errorf("%w: edge %d (%d, %d) is outside the graph: both ends must be in [0, %d)",
				ErrInvalidGraph, e, u, v, n)
		}
		adj[u] = append(adj[u], entry{v, e})
		if !directed {
			adj[v] = append(adj[v], entry{u, e})
		}
	}
	return adj, nil
}

// degreeCheck is the degree half of the test: the kind the degrees allow and where the walk
// must start (the smaller odd vertex, the vertex with out = in + 1, or the smallest vertex with
// an edge), or (None, -1). With no edge it is (Circuit, -1).
func degreeCheck(n int, edges [][2]int, directed bool) (Kind, int) {
	if len(edges) == 0 {
		return Circuit, -1
	}
	first := n
	for _, e := range edges {
		first = min(first, e[0], e[1])
	}
	if directed {
		surplus := make([]int, n) // out-degree minus in-degree
		for _, e := range edges {
			surplus[e[0]]++
			surplus[e[1]]--
		}
		start, starts, ends, unbalanced := -1, 0, 0, 0
		for v, s := range surplus {
			if s != 0 {
				unbalanced++
			}
			if s == 1 {
				if starts == 0 {
					start = v
				}
				starts++
			}
			if s == -1 {
				ends++
			}
		}
		if unbalanced == 0 {
			return Circuit, first
		}
		if unbalanced == 2 && starts == 1 && ends == 1 {
			return Path, start
		}
		return None, -1
	}
	degree := make([]int, n)
	for _, e := range edges {
		degree[e[0]]++
		degree[e[1]]++ // a self-loop adds 2
	}
	var odd []int
	for v, d := range degree {
		if d%2 == 1 {
			odd = append(odd, v)
		}
	}
	switch len(odd) {
	case 0:
		return Circuit, first
	case 2:
		return Path, odd[0]
	}
	return None, -1
}

// hierholzer walks from start. The stack holds the current walk; a vertex with no unused edge
// left is popped onto the result, and the walk backs up to the vertex before it, which may
// start a detour that comes back to it as a closed circuit. ptr[v] only moves forward, so each
// entry of adj is read once. The result is reversed at the end.
func hierholzer(start int, adj [][]entry, nEdges int) Walk {
	used := make([]bool, nEdges)
	ptr := make([]int, len(adj))
	stack := []int{start} // the vertices of the current walk
	via := []int{-1}      // via[k]: the edge that led to stack[k]
	walk := Walk{Vertices: []int{}, EdgeIDs: []int{}}
	for len(stack) > 0 {
		v := stack[len(stack)-1]
		row := adj[v]
		taken, to := -1, -1
		for ptr[v] < len(row) {
			en := row[ptr[v]]
			ptr[v]++
			if !used[en.edge] {
				taken, to = en.edge, en.to
				break
			}
		}
		if taken == -1 {
			// v has no unused edge left: it is finished, and the walk backs up one step.
			walk.Vertices = append(walk.Vertices, v)
			stack = stack[:len(stack)-1]
			if e := via[len(via)-1]; e != -1 {
				walk.EdgeIDs = append(walk.EdgeIDs, e)
			}
			via = via[:len(via)-1]
		} else {
			used[taken] = true
			stack = append(stack, to)
			via = append(via, taken)
		}
	}
	reverse(walk.Vertices)
	reverse(walk.EdgeIDs)
	return walk
}

func reverse(xs []int) {
	for i, j := 0, len(xs)-1; i < j; i, j = i+1, j-1 {
		xs[i], xs[j] = xs[j], xs[i]
	}
}

func solve(n int, edges [][2]int, directed bool) (Kind, Walk, bool, error) {
	adj, err := adjacency(n, edges, directed)
	if err != nil {
		return None, Walk{}, false, err
	}
	kind, start := degreeCheck(n, edges, directed)
	if kind == None {
		return None, Walk{}, false, nil
	}
	if len(edges) == 0 {
		return Circuit, Walk{Vertices: []int{}, EdgeIDs: []int{}}, true, nil
	}
	walk := hierholzer(start, adj, len(edges))
	if len(walk.EdgeIDs) < len(edges) {
		// The walk used only the edges of the start's component: the others lie elsewhere.
		return None, Walk{}, false, nil
	}
	return kind, walk, true, nil
}

// EulerianKind says whether the graph has an Eulerian circuit (also when it has no edge), only
// an Eulerian path, or neither. O(V + E). For a negative n or an edge end out of range it
// returns an error wrapping ErrInvalidGraph.
func EulerianKind(n int, edges [][2]int, directed bool) (Kind, error) {
	kind, _, _, err := solve(n, edges, directed)
	return kind, err
}

// EulerianPath returns a walk that uses every edge exactly once and true, a circuit whenever
// one exists; a Walk of two empty slices and true when there is no edge; a zero Walk and false
// when no such walk exists. O(V + E). Errors as EulerianKind.
func EulerianPath(n int, edges [][2]int, directed bool) (Walk, bool, error) {
	_, walk, ok, err := solve(n, edges, directed)
	return walk, ok, err
}

func show(title string, n int, edges [][2]int, directed bool) {
	walk, ok, err := EulerianPath(n, edges, directed)
	switch {
	case err != nil:
		fmt.Printf("%s: %v\n", title, err)
	case !ok:
		fmt.Printf("%s: no Eulerian path\n", title)
	default:
		fmt.Printf("%s: vertices %v, edges %v\n", title, walk.Vertices, walk.EdgeIDs)
	}
}

func main() {
	// Two triangles joined by the edge 0-3: vertices 0 and 3 are odd, so a path from 0 to 3.
	show("Undirected", 6, [][2]int{{0, 3}, {0, 1}, {1, 2}, {2, 0}, {3, 4}, {4, 5}, {5, 3}}, false)
	// vertices [0 1 2 0 3 4 5 3], edges [1 2 3 0 4 5 6]
	show("Directed", 5, [][2]int{{0, 1}, {1, 4}, {1, 2}, {2, 3}, {3, 1}}, true)
	// vertices [0 1 2 3 1 4], edges [0 2 3 4 1]
	show("Konigsberg", 4, [][2]int{{0, 1}, {0, 1}, {0, 2}, {0, 2}, {0, 3}, {1, 3}, {2, 3}}, false)
	// no Eulerian path
}
