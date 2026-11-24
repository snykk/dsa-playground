package main

import (
	"container/heap"
	"errors"
	"reflect"
	"testing"
)

// A to G are vertices 0 to 6. B is first reached by A->B (1), then by A->C->B (0 + 0).
var example = []Edge{{0, 1, 1}, {0, 2, 0}, {2, 1, 0}, {1, 3, 1}, {2, 4, 1}, {4, 3, 0}, {4, 5, 1}, {3, 5, 1}, {6, 0, 1}}

// Roads '.' cost 0 to enter, walls '#' cost 1. Column 5 is a wall from top to bottom.
var city = []string{"...#.#.", "##.#.#.", "...#.#.", ".###.#.", ".....#."}

func mustRun(t *testing.T, edges []Edge, n, start int, wantDist, wantParent []int) {
	t.Helper()
	dist, parent, err := ZeroOneBFS(edges, n, start)
	if err != nil {
		t.Fatalf("ZeroOneBFS(%v, %d, %d): %v", edges, n, start, err)
	}
	if !reflect.DeepEqual(dist, wantDist) || !reflect.DeepEqual(parent, wantParent) {
		t.Fatalf("ZeroOneBFS(%v, %d, %d) = %v, %v; want %v, %v", edges, n, start, dist, parent, wantDist, wantParent)
	}
}

func mustPath(t *testing.T, edges []Edge, n, start, target, wantDist int, wantPath []int) {
	t.Helper()
	d, path, err := ZeroOneBFSWithPath(edges, n, start, target)
	if err != nil || d != wantDist || !reflect.DeepEqual(path, wantPath) {
		t.Fatalf("ZeroOneBFSWithPath(.., %d, %d) = %d, %v, %v; want %d, %v", start, target, d, path, err, wantDist, wantPath)
	}
}

func TestWorkedExample(t *testing.T) {
	mustRun(t, example, 7, 0, []int{0, 0, 0, 1, 1, 2, -1}, []int{-1, 2, 0, 1, 2, 4, -1})
	mustRun(t, example, 7, 6, []int{1, 1, 1, 2, 2, 3, 0}, []int{6, 2, 0, 1, 2, 4, -1})
	mustPath(t, example, 7, 0, 5, 2, []int{0, 2, 4, 5})
	mustPath(t, example, 7, 0, 3, 1, []int{0, 2, 1, 3})
	mustPath(t, example, 7, 0, 0, 0, []int{0})
	mustPath(t, example, 7, 0, 6, -1, []int{})
	_, parent, _ := ZeroOneBFS(example, 7, 0)
	if path, err := PathTo(parent, 0, 4); err != nil || !reflect.DeepEqual(path, []int{0, 2, 4}) {
		t.Fatalf("PathTo(parent, 0, 4) = %v, %v", path, err)
	}
	// Seven pops, one of them B's stale entry; every edge but G->A is read once.
	adj, _ := adjacency(example, 7, 0)
	var c counters
	search(adj, 0, &c)
	if c != (counters{pops: 7, stalePops: 1, edgeScans: 8}) {
		t.Fatalf("counters = %+v", c)
	}
}

func TestEdgeCases(t *testing.T) {
	mustRun(t, nil, 1, 0, []int{0}, []int{-1})
	mustRun(t, []Edge{}, 3, 1, []int{-1, 0, -1}, []int{-1, -1, -1})
	mustPath(t, nil, 3, 1, 2, -1, []int{})
	// Unreachable: 2 and 3 only point into the reachable part, 4 has no edge.
	unreachable := []Edge{{0, 1, 1}, {2, 0, 0}, {3, 1, 1}}
	mustRun(t, unreachable, 5, 0, []int{0, 1, -1, -1, -1}, []int{-1, 0, -1, -1, -1})
	for _, target := range []int{2, 3, 4} {
		mustPath(t, unreachable, 5, 0, target, -1, []int{})
	}
	// Self-loops change nothing; a zero-weight cycle ends; the 0 copy of a parallel edge wins.
	mustRun(t, []Edge{{0, 0, 0}, {0, 0, 1}, {0, 1, 1}, {1, 1, 0}, {1, 2, 0}, {2, 2, 1}}, 3, 0, []int{0, 1, 1}, []int{-1, 0, 1})
	mustRun(t, []Edge{{0, 1, 0}, {1, 2, 0}, {2, 0, 0}, {2, 3, 1}}, 4, 1, []int{0, 0, 0, 1}, []int{2, -1, 1, 2})
	mustRun(t, []Edge{{0, 1, 1}, {0, 1, 0}}, 2, 0, []int{0, 0}, []int{-1, 0})
	mustRun(t, []Edge{{0, 1, 1}, {0, 1, 1}, {0, 2, 0}, {2, 1, 1}}, 3, 0, []int{0, 1, 0}, []int{-1, 0, 0})
	// Ties: back pushes come out in push order, front pushes in reverse.
	mustRun(t, []Edge{{0, 1, 1}, {0, 2, 1}, {1, 3, 0}, {2, 3, 0}}, 4, 0, []int{0, 1, 1, 1}, []int{-1, 0, 0, 1})
	mustRun(t, []Edge{{0, 1, 0}, {0, 2, 0}, {1, 3, 1}, {2, 3, 1}}, 4, 0, []int{0, 0, 0, 1}, []int{-1, 0, 0, 2})
}

func TestInvalidInput(t *testing.T) {
	bad := []struct {
		edges []Edge
		n     int
		start int
	}{
		{[]Edge{{0, 1, 0}, {1, 0, 2}}, 2, 0},
		{[]Edge{{0, 1, 0}, {1, 0, -1}}, 2, 0},
		{[]Edge{{0, 1, 0}, {2, 3, 5}}, 4, 0}, // an unreachable bad edge is still checked
		{nil, -1, 0},
		{nil, 0, 0},
		{[]Edge{{0, 2, 0}}, 2, 0},
		{[]Edge{{-1, 0, 1}}, 2, 0},
		{nil, 2, 2},
		{nil, 2, -1},
	}
	for _, b := range bad {
		dist, parent, err := ZeroOneBFS(b.edges, b.n, b.start)
		if !errors.Is(err, ErrInvalidGraph) || dist != nil || parent != nil {
			t.Errorf("ZeroOneBFS(%v, %d, %d) = %v, %v, %v; want ErrInvalidGraph", b.edges, b.n, b.start, dist, parent, err)
		}
	}
	if _, _, err := ZeroOneBFSWithPath(example, 7, 0, 7); !errors.Is(err, ErrInvalidGraph) {
		t.Errorf("target 7: %v", err)
	}
	if _, err := PathTo([]int{-1, 0}, 0, 2); !errors.Is(err, ErrInvalidGraph) {
		t.Errorf("PathTo target 2: %v", err)
	}
	if _, err := PathTo([]int{-1, 0}, 3, 1); !errors.Is(err, ErrInvalidGraph) {
		t.Errorf("PathTo start 3: %v", err)
	}
}

func TestLongChain(t *testing.T) {
	// 200000 vertices in a line of alternating weights.
	n := 200000
	edges := make([]Edge, 0, n-1)
	for i := 0; i+1 < n; i++ {
		edges = append(edges, Edge{i, i + 1, i % 2})
	}
	dist, parent, err := ZeroOneBFS(edges, n, 0)
	if err != nil || dist[n-1] != (n-1)/2 {
		t.Fatalf("dist[n-1] = %d, %v", dist[n-1], err)
	}
	if path, _ := PathTo(parent, 0, n-1); len(path) != n {
		t.Fatalf("path has %d vertices", len(path))
	}
}

func TestGrid(t *testing.T) {
	cases := []struct {
		grid        []string
		start, goal [2]int
		want        int
	}{
		{city, [2]int{0, 0}, [2]int{4, 6}, 1},
		{city, [2]int{0, 0}, [2]int{4, 4}, 0},
		{city, [2]int{0, 6}, [2]int{0, 0}, 1},
		{[]string{"."}, [2]int{0, 0}, [2]int{0, 0}, 0},
		{[]string{"#"}, [2]int{0, 0}, [2]int{0, 0}, 0},
		{[]string{"#####"}, [2]int{0, 0}, [2]int{0, 4}, 4},
		{[]string{"####", "####", "####"}, [2]int{0, 0}, [2]int{2, 3}, 5},
	}
	for _, c := range cases {
		if got, err := MinWallBreaks(c.grid, c.start, c.goal); err != nil || got != c.want {
			t.Errorf("MinWallBreaks(%v, %v, %v) = %d, %v; want %d", c.grid, c.start, c.goal, got, err, c.want)
		}
	}
	edges, _ := GridEdges(city)
	dist, parent, _ := ZeroOneBFS(edges, 35, 0)
	path, _ := PathTo(parent, 0, 34)
	want := []int{0, 1, 2, 9, 16, 15, 14, 21, 28, 29, 30, 31, 32, 33, 34}
	if !reflect.DeepEqual(path, want) || dist[34] != 1 {
		t.Errorf("city path %v (dist %d); want %v", path, dist[34], want)
	}
	small, _ := GridEdges([]string{".#", ".."})
	wantSmall := []Edge{{0, 2, 0}, {0, 1, 1}, {1, 3, 0}, {1, 0, 0}, {2, 0, 0}, {2, 3, 0}, {3, 1, 1}, {3, 2, 0}}
	if !reflect.DeepEqual(small, wantSmall) {
		t.Errorf("GridEdges = %v", small)
	}
	badGrids := []struct {
		grid        []string
		start, goal [2]int
	}{
		{nil, [2]int{0, 0}, [2]int{0, 0}},
		{[]string{""}, [2]int{0, 0}, [2]int{0, 0}},
		{[]string{"..", "."}, [2]int{0, 0}, [2]int{0, 0}},
		{[]string{".x"}, [2]int{0, 0}, [2]int{0, 0}},
		{[]string{".."}, [2]int{0, 2}, [2]int{0, 0}},
		{[]string{".."}, [2]int{0, 0}, [2]int{1, 0}},
	}
	for _, b := range badGrids {
		if _, err := MinWallBreaks(b.grid, b.start, b.goal); !errors.Is(err, ErrInvalidGrid) {
			t.Errorf("MinWallBreaks(%v, %v, %v): %v; want ErrInvalidGrid", b.grid, b.start, b.goal, err)
		}
	}
}

// ---------------------------------------------------------------- random graphs and work

// lcg is the C++ test's generator, so the random graphs are the same on every platform.
type lcg struct{ state uint64 }

func (r *lcg) below(n int) int {
	r.state = r.state*6364136223846793005 + 1442695040888963407
	return int((r.state >> 33) % uint64(n))
}

type graph struct {
	n     int
	edges []Edge
	start int
}

func randomGraph(r *lcg, maxN, maxEdges int) graph {
	g := graph{n: 1 + r.below(maxN)}
	m := r.below(maxEdges + 1)
	for k := 0; k < m; k++ {
		g.edges = append(g.edges, Edge{r.below(g.n), r.below(g.n), r.below(2)})
	}
	g.start = r.below(g.n)
	return g
}

type item struct{ d, v int }
type minHeap []item

func (h minHeap) Len() int            { return len(h) }
func (h minHeap) Less(i, j int) bool  { return h[i].d < h[j].d }
func (h minHeap) Swap(i, j int)       { h[i], h[j] = h[j], h[i] }
func (h *minHeap) Push(x interface{}) { *h = append(*h, x.(item)) }
func (h *minHeap) Pop() interface{} {
	old := *h
	x := old[len(old)-1]
	*h = old[:len(old)-1]
	return x
}

// dijkstraReference is plain Dijkstra with a binary heap; -1 for an unreachable vertex.
func dijkstraReference(edges []Edge, n, start int) []int {
	adj := make([][]arc, n)
	for _, e := range edges {
		adj[e.U] = append(adj[e.U], arc{e.V, e.Weight})
	}
	dist := filled(n, -1)
	h := &minHeap{{0, start}}
	for h.Len() > 0 {
		top := heap.Pop(h).(item)
		if dist[top.v] != -1 {
			continue
		}
		dist[top.v] = top.d
		for _, a := range adj[top.v] {
			if dist[a.to] == -1 {
				heap.Push(h, item{top.d + a.weight, a.to})
			}
		}
	}
	return dist
}

func TestRandomGraphsAgainstDijkstra(t *testing.T) {
	r := &lcg{20261124}
	for trial := 0; trial < 2000; trial++ {
		g := randomGraph(r, 12, 36)
		dist, parent, err := ZeroOneBFS(g.edges, g.n, g.start)
		if err != nil || !reflect.DeepEqual(dist, dijkstraReference(g.edges, g.n, g.start)) {
			t.Fatalf("%+v: dist %v, err %v; Dijkstra %v", g, dist, err, dijkstraReference(g.edges, g.n, g.start))
		}
		for v := 0; v < g.n; v++ {
			if v == g.start || dist[v] == -1 {
				if parent[v] != -1 {
					t.Fatalf("%+v: parent[%d] = %d", g, v, parent[v])
				}
				continue
			}
			found := false
			for _, e := range g.edges {
				found = found || (e.U == parent[v] && e.V == v && dist[e.U]+e.Weight == dist[v])
			}
			if !found {
				t.Fatalf("%+v: parent[%d] = %d is not on a shortest path", g, v, parent[v])
			}
		}
	}
}

func TestWorkIsLinear(t *testing.T) {
	r := &lcg{606}
	for trial := 0; trial < 500; trial++ {
		g := randomGraph(r, 30, 120)
		adj, _ := adjacency(g.edges, g.n, g.start)
		var c counters
		search(adj, g.start, &c)
		if c.pops > 2*g.n-1 || c.pops > len(g.edges)+1 || c.edgeScans > len(g.edges) {
			t.Fatalf("%+v: %+v", g, c)
		}
	}
	// Every vertex pushed twice: the worst case for pops, exactly 2V - 1.
	for _, n := range []int{10, 1000, 100000} {
		var edges []Edge
		for v := 1; v < n; v++ {
			edges = append(edges, Edge{0, v, 1})
		}
		edges = append(edges, Edge{0, 1, 0})
		for v := 1; v+1 < n; v++ {
			edges = append(edges, Edge{v, v + 1, 0})
		}
		adj, _ := adjacency(edges, n, 0)
		var c counters
		search(adj, 0, &c)
		if c != (counters{pops: 2*n - 1, stalePops: n - 1, edgeScans: len(edges)}) {
			t.Fatalf("n = %d: %+v", n, c)
		}
	}
	// Growing random graphs with E = 4V: the work stays a fixed share of V + E.
	lo, hi := 1e9, 0.0
	for _, n := range []int{1000, 4000, 16000, 64000} {
		g := &lcg{uint64(n)}
		edges := make([]Edge, 0, 4*n)
		for k := 0; k < 4*n; k++ {
			edges = append(edges, Edge{g.below(n), g.below(n), g.below(2)})
		}
		adj, _ := adjacency(edges, n, edges[0].U)
		var c counters
		search(adj, edges[0].U, &c) // a source with an edge out
		ratio := float64(c.pops+c.edgeScans) / float64(5*n)
		if ratio < lo {
			lo = ratio
		}
		if ratio > hi {
			hi = ratio
		}
	}
	if hi >= 2 || hi-lo >= 0.05 {
		t.Fatalf("work / (V + E) from %.3f to %.3f", lo, hi)
	}
}

// ---------------------------------------------------------------- agreement with Python

// Outputs computed by running the Python implementation (zero_one_bfs.py), whose distances
// equal those of the repository's dijkstra.py: fixed cases first, then seeded random graphs
// with self-loops and repeated edges.
var pythonCases = []struct {
	n            int
	edges        []Edge
	start        int
	dist, parent []int
}{
	{7, []Edge{{0, 1, 1}, {0, 2, 0}, {2, 1, 0}, {1, 3, 1}, {2, 4, 1}, {4, 3, 0}, {4, 5, 1}, {3, 5, 1}, {6, 0, 1}}, 0, []int{0, 0, 0, 1, 1, 2, -1}, []int{-1, 2, 0, 1, 2, 4, -1}},
	{7, []Edge{{0, 1, 1}, {0, 2, 0}, {2, 1, 0}, {1, 3, 1}, {2, 4, 1}, {4, 3, 0}, {4, 5, 1}, {3, 5, 1}, {6, 0, 1}}, 6, []int{1, 1, 1, 2, 2, 3, 0}, []int{6, 2, 0, 1, 2, 4, -1}},
	{1, []Edge{}, 0, []int{0}, []int{-1}},
	{3, []Edge{}, 1, []int{-1, 0, -1}, []int{-1, -1, -1}},
	{5, []Edge{{0, 1, 1}, {2, 0, 0}, {3, 1, 1}}, 0, []int{0, 1, -1, -1, -1}, []int{-1, 0, -1, -1, -1}},
	{3, []Edge{{0, 0, 0}, {0, 0, 1}, {0, 1, 1}, {1, 1, 0}, {1, 2, 0}, {2, 2, 1}}, 0, []int{0, 1, 1}, []int{-1, 0, 1}},
	{4, []Edge{{0, 1, 0}, {1, 2, 0}, {2, 0, 0}, {2, 3, 1}}, 1, []int{0, 0, 0, 1}, []int{2, -1, 1, 2}},
	{2, []Edge{{0, 1, 1}, {0, 1, 0}}, 0, []int{0, 0}, []int{-1, 0}},
	{3, []Edge{{0, 1, 1}, {0, 1, 1}, {0, 2, 0}, {2, 1, 1}}, 0, []int{0, 1, 0}, []int{-1, 0, 0}},
	{4, []Edge{{0, 1, 1}, {0, 2, 1}, {1, 3, 0}, {2, 3, 0}}, 0, []int{0, 1, 1, 1}, []int{-1, 0, 0, 1}},
	{4, []Edge{{0, 1, 0}, {0, 2, 0}, {1, 3, 1}, {2, 3, 1}}, 0, []int{0, 0, 0, 1}, []int{-1, 0, 0, 2}},
	{4, []Edge{{0, 1, 1}, {0, 2, 1}, {0, 3, 1}, {0, 1, 0}, {1, 2, 0}, {2, 3, 0}}, 0, []int{0, 0, 0, 0}, []int{-1, 0, 1, 2}},
	{1, []Edge{{0, 0, 0}, {0, 0, 1}, {0, 0, 1}, {0, 0, 1}, {0, 0, 0}, {0, 0, 1}, {0, 0, 1}, {0, 0, 0}, {0, 0, 1}, {0, 0, 0}, {0, 0, 1}}, 0, []int{0}, []int{-1}},
	{2, []Edge{{0, 1, 1}, {1, 1, 0}, {1, 1, 1}, {1, 1, 0}, {1, 1, 1}, {0, 1, 0}, {1, 1, 1}, {0, 1, 1}, {1, 0, 1}, {1, 1, 0}, {0, 1, 0}, {0, 0, 0}, {1, 1, 0}, {0, 0, 1}}, 1, []int{1, 0}, []int{1, -1}},
	{2, []Edge{{0, 1, 1}, {1, 0, 0}, {1, 0, 0}, {1, 1, 1}, {1, 1, 0}, {0, 0, 0}, {0, 0, 0}, {0, 1, 0}, {0, 0, 0}, {1, 1, 0}, {1, 1, 0}}, 1, []int{0, 0}, []int{1, -1}},
	{4, []Edge{{3, 2, 1}}, 3, []int{-1, -1, 1, 0}, []int{-1, -1, 3, -1}},
	{5, []Edge{{0, 3, 0}, {2, 2, 0}, {4, 2, 1}, {1, 3, 1}, {0, 3, 0}, {3, 3, 1}, {0, 4, 1}, {0, 1, 1}}, 0, []int{0, 1, 2, 0, 1}, []int{-1, 0, 4, 0, 0}},
	{4, []Edge{{2, 0, 0}, {1, 3, 0}, {2, 1, 0}, {3, 0, 1}, {3, 2, 0}, {0, 0, 1}, {3, 1, 0}, {3, 0, 1}, {3, 3, 0}, {2, 1, 1}, {0, 3, 0}, {1, 2, 0}}, 3, []int{0, 0, 0, 0}, []int{2, 3, 3, -1}},
	{4, []Edge{{1, 1, 0}, {3, 3, 0}, {3, 0, 1}, {3, 1, 1}, {3, 3, 0}, {0, 3, 0}, {1, 0, 1}, {2, 2, 1}, {3, 0, 0}, {1, 3, 1}, {3, 0, 0}, {1, 3, 0}, {2, 2, 1}}, 0, []int{0, 1, -1, 0}, []int{-1, 3, -1, 0}},
	{6, []Edge{}, 2, []int{-1, -1, 0, -1, -1, -1}, []int{-1, -1, -1, -1, -1, -1}},
	{2, []Edge{{1, 0, 1}}, 1, []int{1, 0}, []int{1, -1}},
	{5, []Edge{}, 3, []int{-1, -1, -1, 0, -1}, []int{-1, -1, -1, -1, -1}},
	{1, []Edge{{0, 0, 0}}, 0, []int{0}, []int{-1}},
	{7, []Edge{{0, 4, 0}, {5, 4, 0}}, 1, []int{-1, 0, -1, -1, -1, -1, -1}, []int{-1, -1, -1, -1, -1, -1, -1}},
	{4, []Edge{{3, 2, 1}, {1, 1, 1}, {0, 1, 1}, {1, 1, 0}, {2, 0, 0}, {3, 1, 1}, {1, 2, 1}, {3, 0, 1}, {0, 1, 0}}, 3, []int{1, 1, 1, 0}, []int{3, 3, 3, -1}},
	{3, []Edge{{0, 0, 1}}, 2, []int{-1, -1, 0}, []int{-1, -1, -1}},
	{2, []Edge{{0, 1, 1}, {1, 0, 0}, {0, 0, 1}, {0, 0, 1}, {1, 1, 0}, {1, 0, 0}, {1, 1, 0}, {0, 1, 0}, {1, 1, 0}, {0, 1, 0}, {0, 1, 1}, {1, 1, 1}, {0, 0, 1}, {0, 0, 1}, {1, 1, 0}}, 1, []int{0, 0}, []int{1, -1}},
	{3, []Edge{{2, 2, 0}, {2, 0, 1}, {2, 0, 1}, {0, 0, 1}, {1, 0, 0}, {2, 2, 1}, {1, 0, 0}, {2, 0, 1}, {1, 2, 0}, {2, 1, 1}, {1, 2, 1}, {1, 0, 0}, {2, 1, 1}}, 2, []int{1, 1, 0}, []int{2, 2, -1}},
	{3, []Edge{{1, 1, 0}, {0, 2, 1}, {0, 1, 0}, {0, 2, 1}, {1, 2, 0}, {1, 1, 0}, {0, 2, 1}, {1, 2, 1}, {1, 2, 0}, {2, 1, 0}, {2, 0, 1}, {1, 0, 0}, {1, 1, 1}, {1, 2, 1}, {2, 0, 0}, {2, 0, 0}, {2, 1, 1}, {2, 0, 0}}, 0, []int{0, 0, 0}, []int{-1, 0, 1}},
	{5, []Edge{{1, 4, 1}, {2, 2, 0}, {3, 0, 0}, {2, 4, 1}, {0, 0, 1}, {4, 4, 0}, {1, 3, 1}, {0, 0, 0}, {1, 3, 0}, {1, 3, 0}, {2, 0, 0}, {0, 0, 1}}, 0, []int{0, -1, -1, -1, -1}, []int{-1, -1, -1, -1, -1}},
	{2, []Edge{{0, 1, 1}, {0, 0, 0}, {0, 0, 1}, {0, 1, 1}, {0, 1, 1}, {0, 1, 1}, {0, 1, 0}, {0, 0, 1}, {0, 0, 0}, {0, 1, 1}, {1, 1, 0}, {0, 1, 1}, {0, 1, 1}, {1, 1, 1}, {1, 0, 0}}, 0, []int{0, 0}, []int{-1, 0}},
	{3, []Edge{{1, 2, 1}, {1, 1, 1}, {0, 1, 0}}, 1, []int{-1, 0, 1}, []int{-1, -1, 1}},
	{6, []Edge{}, 5, []int{-1, -1, -1, -1, -1, 0}, []int{-1, -1, -1, -1, -1, -1}},
	{5, []Edge{}, 1, []int{-1, 0, -1, -1, -1}, []int{-1, -1, -1, -1, -1}},
	{6, []Edge{{2, 5, 0}, {5, 2, 0}}, 2, []int{-1, -1, 0, -1, -1, 0}, []int{-1, -1, -1, -1, -1, 2}},
	{5, []Edge{{3, 4, 0}, {0, 0, 0}, {2, 1, 0}}, 4, []int{-1, -1, -1, -1, 0}, []int{-1, -1, -1, -1, -1}},
	{5, []Edge{{4, 0, 1}, {3, 0, 1}, {3, 0, 0}, {4, 3, 0}, {3, 1, 1}, {2, 0, 0}, {2, 3, 1}}, 1, []int{-1, 0, -1, -1, -1}, []int{-1, -1, -1, -1, -1}},
	{5, []Edge{{0, 3, 0}, {1, 4, 0}, {2, 3, 1}, {0, 1, 1}}, 1, []int{-1, 0, -1, -1, 0}, []int{-1, -1, -1, -1, 1}},
	{2, []Edge{{0, 1, 1}, {1, 0, 1}, {0, 0, 0}, {0, 0, 0}, {0, 0, 0}, {0, 0, 1}, {0, 0, 0}, {0, 1, 1}, {1, 0, 1}, {1, 0, 0}, {1, 1, 1}, {0, 0, 1}}, 1, []int{0, 0}, []int{1, -1}},
	{6, []Edge{{4, 2, 0}, {1, 3, 1}, {5, 1, 1}, {1, 4, 0}, {5, 3, 1}, {0, 5, 1}, {4, 2, 1}, {0, 5, 1}, {1, 3, 1}}, 3, []int{-1, -1, -1, 0, -1, -1}, []int{-1, -1, -1, -1, -1, -1}},
}

func TestAgreementWithPython(t *testing.T) {
	for i, c := range pythonCases {
		dist, parent, err := ZeroOneBFS(c.edges, c.n, c.start)
		if err != nil || !reflect.DeepEqual(dist, c.dist) || !reflect.DeepEqual(parent, c.parent) {
			t.Fatalf("agreement case %d differs from Python: %v %v %v", i, dist, parent, err)
		}
	}
}
