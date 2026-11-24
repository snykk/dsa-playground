// 0-1 BFS: single-source shortest paths when every edge weight is 0 or 1.
//
// The graph has numVertices vertices, numbered 0 .. numVertices-1, and a list of directed
// edges {U, V, Weight} with Weight 0 or 1; an undirected graph is given as both directions.
// A deque of (distance, vertex) entries replaces Dijkstra's priority queue: relaxing an edge
// of weight 0 pushes the vertex to the front, an edge of weight 1 to the back. The deque then
// holds at most two distances, d and d+1, in order, so the front entry always has the
// smallest distance, at O(1) per push and pop: O(V + E) in total.
//
// An unreachable vertex has distance -1 and parent -1; the source has parent -1 too. adj[u]
// keeps u's edges in the order given and the search relaxes them in that order, so the parent
// slice is the one the Python and C++ versions return.
package main

import (
	"errors"
	"fmt"
)

// Edge is a directed edge U -> V of weight 0 or 1.
type Edge struct {
	U, V, Weight int
}

// ErrInvalidGraph is returned for a negative vertex count, an endpoint out of range, a weight
// other than 0 or 1, or a start or target that is not a vertex.
var ErrInvalidGraph = errors.New("invalid 0-1 graph")

// ErrInvalidGrid is returned for a grid that is empty, ragged or has a cell other than '.' and
// '#', or a start or goal outside it.
var ErrInvalidGrid = errors.New("invalid grid")

type arc struct{ to, weight int }

type entry struct{ dist, vertex int }

// deque keeps the entries in front (a stack whose top is the front of the deque) and in
// back[head:] (in order). Both ends cost O(1), amortized for the appends.
type deque struct {
	front []entry
	back  []entry
	head  int
}

func (q *deque) len() int          { return len(q.front) + len(q.back) - q.head }
func (q *deque) pushFront(e entry) { q.front = append(q.front, e) }
func (q *deque) pushBack(e entry)  { q.back = append(q.back, e) }

func (q *deque) popFront() entry {
	if n := len(q.front); n > 0 {
		e := q.front[n-1]
		q.front = q.front[:n-1]
		return e
	}
	e := q.back[q.head]
	q.head++
	return e
}

// counters records the work of one search, for the tests: every pop (stale ones included),
// the stale pops, and every adjacency entry read.
type counters struct {
	pops, stalePops, edgeScans int
}

// adjacency checks the whole input first, then builds adj[u]: u's edges in edge order.
func adjacency(edges []Edge, numVertices, start int) ([][]arc, error) {
	if numVertices < 0 {
		return nil, fmt.Errorf("%w: numVertices must be >= 0, got %d", ErrInvalidGraph, numVertices)
	}
	adj := make([][]arc, numVertices)
	for _, e := range edges {
		if e.U < 0 || e.U >= numVertices || e.V < 0 || e.V >= numVertices {
			return nil, fmt.Errorf("%w: edge (%d, %d, %d) has an endpoint outside [0, %d)", ErrInvalidGraph, e.U, e.V, e.Weight, numVertices)
		}
		if e.Weight != 0 && e.Weight != 1 {
			return nil, fmt.Errorf("%w: edge (%d, %d, %d) has weight %d; 0-1 BFS takes weights 0 and 1 only", ErrInvalidGraph, e.U, e.V, e.Weight, e.Weight)
		}
		adj[e.U] = append(adj[e.U], arc{e.V, e.Weight})
	}
	if start < 0 || start >= numVertices {
		return nil, fmt.Errorf("%w: start %d is not a vertex: it must be in [0, %d)", ErrInvalidGraph, start, numVertices)
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

// search is the 0-1 BFS itself. c may be nil.
func search(adj [][]arc, start int, c *counters) (dist, parent []int) {
	dist = filled(len(adj), -1)
	parent = filled(len(adj), -1)
	dist[start] = 0
	q := &deque{}
	q.pushBack(entry{0, start})
	for q.len() > 0 {
		top := q.popFront()
		d, u := top.dist, top.vertex
		if c != nil {
			c.pops++
		}
		if d > dist[u] {
			// Stale: u was pushed again with a smaller distance, and that entry was processed.
			if c != nil {
				c.stalePops++
			}
			continue
		}
		for _, a := range adj[u] {
			if c != nil {
				c.edgeScans++
			}
			nd := d + a.weight
			if dist[a.to] == -1 || nd < dist[a.to] {
				dist[a.to] = nd
				parent[a.to] = u
				if a.weight == 0 {
					q.pushFront(entry{nd, a.to}) // the same distance as u: before every d+1
				} else {
					q.pushBack(entry{nd, a.to}) // one more than u: behind everything
				}
			}
		}
	}
	return dist, parent
}

// ZeroOneBFS returns the shortest distance from start to every vertex (-1 when unreachable)
// and each vertex's parent on a shortest path (-1 for start and unreachable vertices).
// Self-loops and parallel edges are allowed. On bad input (numVertices == 0 included, since no
// start can be valid) it returns nil slices and an error wrapping ErrInvalidGraph.
// Time O(V + E), space O(V + E).
func ZeroOneBFS(edges []Edge, numVertices, start int) (dist, parent []int, err error) {
	adj, err := adjacency(edges, numVertices, start)
	if err != nil {
		return nil, nil, err
	}
	dist, parent = search(adj, start, nil)
	return dist, parent, nil
}

// PathTo returns the path start, ..., target along a parent slice from ZeroOneBFS(..., start):
// []int{start} when target == start, an empty slice when target is unreachable.
func PathTo(parent []int, start, target int) ([]int, error) {
	n := len(parent)
	if start < 0 || start >= n || target < 0 || target >= n {
		return nil, fmt.Errorf("%w: start %d and target %d must be in [0, %d)", ErrInvalidGraph, start, target, n)
	}
	if target == start {
		return []int{start}, nil
	}
	if parent[target] == -1 {
		return []int{}, nil
	}
	path := []int{target}
	for path[len(path)-1] != start {
		path = append(path, parent[path[len(path)-1]])
	}
	for i, j := 0, len(path)-1; i < j; i, j = i+1, j-1 {
		path[i], path[j] = path[j], path[i]
	}
	return path, nil
}

// ZeroOneBFSWithPath returns the distance from start to target and one shortest path, or
// (-1, []int{}) when there is none. The search runs to the end.
func ZeroOneBFSWithPath(edges []Edge, numVertices, start, target int) (int, []int, error) {
	dist, parent, err := ZeroOneBFS(edges, numVertices, start)
	if err != nil {
		return 0, nil, err
	}
	if target < 0 || target >= numVertices {
		return 0, nil, fmt.Errorf("%w: target %d is not a vertex: it must be in [0, %d)", ErrInvalidGraph, target, numVertices)
	}
	path, _ := PathTo(parent, start, target)
	return dist[target], path, nil
}

// GridEdges returns the 0-1 graph of a grid of '.' (road) and '#' (wall): cell (r, c) is
// vertex r*cols+c, and for every cell in row-major order and every neighbour up, down, left,
// right there is an edge into the neighbour of weight 0 for a road and 1 for a wall.
func GridEdges(grid []string) ([]Edge, error) {
	if len(grid) == 0 || len(grid[0]) == 0 {
		return nil, fmt.Errorf("%w: the grid needs at least one row and one column", ErrInvalidGrid)
	}
	rows, cols := len(grid), len(grid[0])
	for r, row := range grid {
		if len(row) != cols {
			return nil, fmt.Errorf("%w: row %d has %d cells, row 0 has %d", ErrInvalidGrid, r, len(row), cols)
		}
		for i := 0; i < len(row); i++ {
			if row[i] != '.' && row[i] != '#' {
				return nil, fmt.Errorf("%w: cell %q in row %d: use '.' for a road and '#' for a wall", ErrInvalidGrid, row[i], r)
			}
		}
	}
	steps := [4][2]int{{-1, 0}, {1, 0}, {0, -1}, {0, 1}}
	var edges []Edge
	for r := 0; r < rows; r++ {
		for c := 0; c < cols; c++ {
			for _, s := range steps {
				nr, nc := r+s[0], c+s[1]
				if nr >= 0 && nr < rows && nc >= 0 && nc < cols {
					w := 0
					if grid[nr][nc] == '#' {
						w = 1
					}
					edges = append(edges, Edge{r*cols + c, nr*cols + nc, w})
				}
			}
		}
	}
	return edges, nil
}

// MinWallBreaks returns the fewest walls to break to walk from start to goal ({row, col}),
// moving up, down, left or right. Entering a road costs 0 and a wall 1; the start cell is free
// even when it is a wall. Bad input gives an error wrapping ErrInvalidGrid.
func MinWallBreaks(grid []string, start, goal [2]int) (int, error) {
	edges, err := GridEdges(grid)
	if err != nil {
		return 0, err
	}
	rows, cols := len(grid), len(grid[0])
	for _, cell := range [][2]int{start, goal} {
		if cell[0] < 0 || cell[0] >= rows || cell[1] < 0 || cell[1] >= cols {
			return 0, fmt.Errorf("%w: cell (%d, %d) is outside the %d x %d grid", ErrInvalidGrid, cell[0], cell[1], rows, cols)
		}
	}
	dist, _, err := ZeroOneBFS(edges, rows*cols, start[0]*cols+start[1])
	if err != nil {
		return 0, err
	}
	return dist[goal[0]*cols+goal[1]], nil
}

func main() {
	// A to G are vertices 0 to 6. B is first reached by A->B (weight 1), then more cheaply by
	// A->C->B (0 + 0), so its first deque entry goes stale. Nothing leads to G.
	example := []Edge{{0, 1, 1}, {0, 2, 0}, {2, 1, 0}, {1, 3, 1}, {2, 4, 1}, {4, 3, 0}, {4, 5, 1}, {3, 5, 1}, {6, 0, 1}}
	dist, parent, _ := ZeroOneBFS(example, 7, 0)
	fmt.Println("dist:  ", dist)   // [0 0 0 1 1 2 -1]
	fmt.Println("parent:", parent) // [-1 2 0 1 2 4 -1]
	d, path, _ := ZeroOneBFSWithPath(example, 7, 0, 5)
	fmt.Println("distance to 5:", d, "path", path) // 2 [0 2 4 5]
	city := []string{"...#.#.", "##.#.#.", "...#.#.", ".###.#.", ".....#."}
	walls, _ := MinWallBreaks(city, [2]int{0, 0}, [2]int{4, 6})
	fmt.Println("walls to break:", walls) // 1
}
