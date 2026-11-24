package main

import (
	"errors"
	"reflect"
	"slices"
	"testing"
)

// Two triangles joined by the edge 0-3; 0 and 3 have odd degree.
var example = [][2]int{{0, 3}, {0, 1}, {1, 2}, {2, 0}, {3, 4}, {4, 5}, {5, 3}}

// Directed: 0 -> 1 -> 4 with the cycle 1 -> 2 -> 3 -> 1 hanging off 1.
var directedExample = [][2]int{{0, 1}, {1, 4}, {1, 2}, {2, 3}, {3, 1}}

// Konigsberg: land masses A=0, B=1, C=2, D=3 and the seven bridges.
var konigsberg = [][2]int{{0, 1}, {0, 1}, {0, 2}, {0, 2}, {0, 3}, {1, 3}, {2, 3}}

func mustWalk(t *testing.T, n int, edges [][2]int, directed bool, wantVertices, wantEdges []int) {
	t.Helper()
	walk, ok, err := EulerianPath(n, edges, directed)
	if err != nil || !ok || !reflect.DeepEqual(walk.Vertices, wantVertices) || !reflect.DeepEqual(walk.EdgeIDs, wantEdges) {
		t.Errorf("EulerianPath(%d, %v, %v) = %v, %v, %v; want %v, %v", n, edges, directed, walk, ok, err, wantVertices, wantEdges)
	}
}

func mustNone(t *testing.T, n int, edges [][2]int, directed bool) {
	t.Helper()
	walk, ok, err := EulerianPath(n, edges, directed)
	kind, kindErr := EulerianKind(n, edges, directed)
	if err != nil || ok || walk.Vertices != nil || walk.EdgeIDs != nil || kindErr != nil || kind != None {
		t.Errorf("EulerianPath(%d, %v, %v) = %v, %v, %v (kind %v); want no walk", n, edges, directed, walk, ok, err, kind)
	}
}

func mustKind(t *testing.T, n int, edges [][2]int, directed bool, want Kind) {
	t.Helper()
	if kind, err := EulerianKind(n, edges, directed); err != nil || kind != want {
		t.Errorf("EulerianKind(%d, %v, %v) = %v, %v; want %v", n, edges, directed, kind, err, want)
	}
}

// checkWalk: every edge exactly once, and each edge starts where the one before it ends.
func checkWalk(t *testing.T, edges [][2]int, directed bool, walk Walk) {
	t.Helper()
	if len(edges) == 0 {
		if len(walk.Vertices) != 0 || len(walk.EdgeIDs) != 0 {
			t.Fatalf("no edges, but the walk is %v", walk)
		}
		return
	}
	if len(walk.Vertices) != len(edges)+1 || len(walk.EdgeIDs) != len(edges) {
		t.Fatalf("walk %v has the wrong length for %d edges", walk, len(edges))
	}
	seen := make([]bool, len(edges))
	for i, e := range walk.EdgeIDs {
		if e < 0 || e >= len(edges) || seen[e] {
			t.Fatalf("edge %d used twice or out of range in %v", e, walk)
		}
		seen[e] = true
		a, b := walk.Vertices[i], walk.Vertices[i+1]
		u, v := edges[e][0], edges[e][1]
		if !(a == u && b == v) && !(!directed && a == v && b == u) {
			t.Fatalf("edge %d (%d, %d) does not lead from %d to %d", e, u, v, a, b)
		}
	}
}

func TestWorkedExamples(t *testing.T) {
	mustKind(t, 6, example, false, Path)
	mustWalk(t, 6, example, false, []int{0, 1, 2, 0, 3, 4, 5, 3}, []int{1, 2, 3, 0, 4, 5, 6})
	mustKind(t, 5, directedExample, true, Path)
	mustWalk(t, 5, directedExample, true, []int{0, 1, 2, 3, 1, 4}, []int{0, 2, 3, 4, 1})
	mustNone(t, 4, konigsberg, false)
	eighth := append(slices.Clone(konigsberg), [2]int{1, 2}) // B-C leaves A and D odd
	mustWalk(t, 4, eighth, false, []int{0, 1, 0, 2, 0, 3, 1, 2, 3}, []int{0, 1, 2, 3, 4, 5, 7, 6})
	if Path.String() != "path" || Circuit.String() != "circuit" || None.String() != "none" {
		t.Errorf("Kind names: %v %v %v", Path, Circuit, None)
	}
}

func TestTieRule(t *testing.T) {
	mustWalk(t, 3, [][2]int{{2, 1}, {1, 0}}, false, []int{0, 1, 2}, []int{1, 0}) // the smaller odd vertex
	mustWalk(t, 4, [][2]int{{3, 1}, {1, 2}, {2, 3}}, false, []int{1, 3, 2, 1}, []int{0, 2, 1})
	mustWalk(t, 5, [][2]int{{4, 2}, {2, 4}}, true, []int{2, 4, 2}, []int{1, 0})
	mustWalk(t, 4, [][2]int{{0, 1}, {1, 3}, {3, 0}, {3, 2}}, true, []int{3, 0, 1, 3, 2}, []int{2, 0, 1, 3})
	bowtie := [][2]int{{0, 1}, {1, 2}, {2, 0}, {0, 3}, {3, 4}, {4, 0}}
	mustWalk(t, 5, bowtie, false, []int{0, 1, 2, 0, 3, 4, 0}, []int{0, 1, 2, 3, 4, 5})
	slices.Reverse(bowtie)
	mustWalk(t, 5, bowtie, false, []int{0, 4, 3, 0, 2, 1, 0}, []int{0, 1, 2, 3, 4, 5})
}

func TestEdgeCases(t *testing.T) {
	for _, directed := range []bool{false, true} {
		// No vertices, or only isolated ones: the empty walk, as empty (not nil) slices.
		for _, n := range []int{0, 4} {
			mustKind(t, n, nil, directed, Circuit)
			walk, ok, err := EulerianPath(n, nil, directed)
			if err != nil || !ok || walk.Vertices == nil || walk.EdgeIDs == nil || len(walk.Vertices)+len(walk.EdgeIDs) != 0 {
				t.Errorf("EulerianPath(%d, nil, %v) = %#v, %v, %v; want two empty slices", n, directed, walk, ok, err)
			}
		}
		// A single self-loop, and a loop in the middle.
		mustKind(t, 1, [][2]int{{0, 0}}, directed, Circuit)
		mustWalk(t, 1, [][2]int{{0, 0}}, directed, []int{0, 0}, []int{0})
		mustWalk(t, 3, [][2]int{{2, 2}}, directed, []int{2, 2}, []int{0})
		mustWalk(t, 3, [][2]int{{0, 1}, {1, 1}, {1, 2}}, directed, []int{0, 1, 1, 2}, []int{0, 1, 2})
		// Isolated vertices play no part.
		mustWalk(t, 6, [][2]int{{3, 4}}, directed, []int{3, 4}, []int{0})
		// A disconnected edge set: even degrees, two triangles; a loop on its own.
		mustNone(t, 6, [][2]int{{0, 1}, {1, 2}, {2, 0}, {3, 4}, {4, 5}, {5, 3}}, directed)
		mustNone(t, 3, [][2]int{{0, 1}, {1, 0}, {2, 2}}, directed)
	}
	// Parallel edges are separate edges.
	mustWalk(t, 2, [][2]int{{0, 1}, {0, 1}}, false, []int{0, 1, 0}, []int{0, 1})
	mustWalk(t, 2, [][2]int{{0, 1}, {0, 1}, {0, 1}}, false, []int{0, 1, 0, 1}, []int{0, 1, 2})
	mustNone(t, 2, [][2]int{{0, 1}, {0, 1}}, true)
	mustNone(t, 4, [][2]int{{0, 1}, {2, 3}, {2, 3}, {2, 3}}, false)
	// Directed, weakly but not strongly connected: nothing leaves 3.
	mustKind(t, 4, [][2]int{{0, 1}, {1, 2}, {2, 0}, {2, 3}}, true, Path)
	mustWalk(t, 4, [][2]int{{0, 1}, {1, 2}, {2, 0}, {2, 3}}, true, []int{2, 0, 1, 2, 3}, []int{2, 0, 1, 3})
	// Directed degree failures; the same edges undirected are fine.
	mustNone(t, 3, [][2]int{{0, 1}, {0, 2}}, true)
	mustNone(t, 4, [][2]int{{0, 1}, {2, 3}}, true)
	mustWalk(t, 3, [][2]int{{1, 0}, {2, 0}}, false, []int{1, 0, 2}, []int{0, 1})
	// Four odd vertices.
	mustNone(t, 4, [][2]int{{0, 1}, {0, 2}, {0, 3}, {1, 2}, {1, 3}, {2, 3}}, false)
}

func TestInvalidInput(t *testing.T) {
	bad := []struct {
		n     int
		edges [][2]int
	}{{-1, nil}, {2, [][2]int{{0, 2}}}, {2, [][2]int{{-1, 0}}}, {0, [][2]int{{0, 0}}}}
	for _, directed := range []bool{false, true} {
		for _, c := range bad {
			walk, ok, err := EulerianPath(c.n, c.edges, directed)
			if !errors.Is(err, ErrInvalidGraph) || ok || walk.Vertices != nil {
				t.Errorf("EulerianPath(%d, %v, %v) = %v, %v, %v; want ErrInvalidGraph", c.n, c.edges, directed, walk, ok, err)
			}
			if _, err := EulerianKind(c.n, c.edges, directed); !errors.Is(err, ErrInvalidGraph) {
				t.Errorf("EulerianKind(%d, %v, %v) error = %v; want ErrInvalidGraph", c.n, c.edges, directed, err)
			}
		}
		if _, _, err := EulerianPath(2, [][2]int{{1, 1}}, directed); err != nil {
			t.Errorf("a valid graph failed: %v", err)
		}
	}
}

func TestDeepGraphs(t *testing.T) {
	// 10^6 edges in a row: the walk keeps its vertices in a slice, not in nested calls.
	const n = 1000000
	cycle := make([][2]int, n)
	for i := range cycle {
		cycle[i] = [2]int{i, (i + 1) % n}
	}
	walk, ok, err := EulerianPath(n, cycle, false)
	if err != nil || !ok || len(walk.Vertices) != n+1 || walk.Vertices[n] != 0 {
		t.Fatalf("cycle of %d edges: ok=%v err=%v", n, ok, err)
	}
	for i := 0; i < n; i++ {
		if walk.Vertices[i] != i || walk.EdgeIDs[i] != i {
			t.Fatalf("cycle: position %d holds vertex %d, edge %d", i, walk.Vertices[i], walk.EdgeIDs[i])
		}
	}
	path := make([][2]int, 0, n)
	for i := n - 1; i >= 0; i-- { // written backwards
		path = append(path, [2]int{i, i + 1})
	}
	walk, ok, err = EulerianPath(n+1, path, true)
	if err != nil || !ok {
		t.Fatalf("directed path of %d edges: ok=%v err=%v", n, ok, err)
	}
	for i := 0; i <= n; i++ {
		if walk.Vertices[i] != i {
			t.Fatalf("directed path: position %d holds vertex %d", i, walk.Vertices[i])
		}
	}
	checkWalk(t, path, true, walk)
}

// ---------------------------------------------------------------- random graphs

type lcg struct{ s uint64 }

func (r *lcg) below(n int) int {
	r.s = r.s*6364136223846793005 + 1442695040888963407
	return int((r.s >> 33) % uint64(n))
}

// bruteForceKind tries every trail from every start vertex.
func bruteForceKind(n int, edges [][2]int, directed bool) Kind {
	if len(edges) == 0 {
		return Circuit
	}
	used := make([]bool, len(edges))
	hasPath, hasCircuit := false, false
	var extend func(start, v, depth int)
	extend = func(start, v, depth int) {
		if depth == len(edges) {
			hasPath = true
			if v == start {
				hasCircuit = true
			}
			return
		}
		for e, edge := range edges {
			if used[e] {
				continue
			}
			next := -1
			if edge[0] == v {
				next = edge[1]
			} else if !directed && edge[1] == v {
				next = edge[0]
			}
			if next == -1 {
				continue
			}
			used[e] = true
			extend(start, next, depth+1)
			used[e] = false
		}
	}
	for s := 0; s < n; s++ {
		extend(s, s, 0)
	}
	if hasCircuit {
		return Circuit
	}
	if hasPath {
		return Path
	}
	return None
}

// walkGraph returns the edges of a random walk, shuffled: always a graph with an Eulerian walk.
func walkGraph(r *lcg, n, length int, closed bool) [][2]int {
	v := r.below(n)
	first := v
	edges := make([][2]int, 0, length)
	for k := 0; k < length; k++ {
		w := r.below(n)
		if closed && k == length-1 {
			w = first
		}
		edges = append(edges, [2]int{v, w})
		v = w
	}
	for i := len(edges) - 1; i > 0; i-- {
		j := r.below(i + 1)
		edges[i], edges[j] = edges[j], edges[i]
	}
	return edges
}

func TestRandomGraphsAgainstBruteForce(t *testing.T) {
	r := &lcg{20261124}
	for round := 0; round < 1500; round++ {
		directed := round%2 == 1
		n := 1 + r.below(5)
		var edges [][2]int
		if round%3 == 0 {
			edges = walkGraph(r, n, 1+r.below(7), r.below(2) == 1)
		} else {
			for m := r.below(8); m > 0; m-- {
				edges = append(edges, [2]int{r.below(n), r.below(n)})
			}
		}
		want := bruteForceKind(n, edges, directed)
		mustKind(t, n, edges, directed, want)
		walk, ok, err := EulerianPath(n, edges, directed)
		if err != nil || ok != (want != None) {
			t.Fatalf("EulerianPath(%d, %v, %v): ok=%v err=%v, brute force says %v", n, edges, directed, ok, err, want)
		}
		if ok {
			checkWalk(t, edges, directed, walk)
			if len(edges) > 0 && (walk.Vertices[0] == walk.Vertices[len(edges)]) != (want == Circuit) {
				t.Fatalf("EulerianPath(%d, %v, %v) = %v: closed does not match %v", n, edges, directed, walk, want)
			}
		}
	}
}

// ---------------------------------------------------------------- agreement with Python

// Outputs computed by running the Python implementation (eulerian_path.py): fixed cases first,
// then seeded random graphs, most of them built from one random walk.
var pythonCases = []struct {
	n        int
	directed bool
	edges    [][2]int
	kind     Kind
	found    bool
	vertices []int
	edgeIDs  []int
}{
	{6, false, [][2]int{{0, 3}, {0, 1}, {1, 2}, {2, 0}, {3, 4}, {4, 5}, {5, 3}}, Path, true, []int{0, 1, 2, 0, 3, 4, 5, 3}, []int{1, 2, 3, 0, 4, 5, 6}},
	{5, true, [][2]int{{0, 1}, {1, 4}, {1, 2}, {2, 3}, {3, 1}}, Path, true, []int{0, 1, 2, 3, 1, 4}, []int{0, 2, 3, 4, 1}},
	{4, false, [][2]int{{0, 1}, {0, 1}, {0, 2}, {0, 2}, {0, 3}, {1, 3}, {2, 3}}, None, false, []int{}, []int{}},
	{4, false, [][2]int{{0, 1}, {0, 1}, {0, 2}, {0, 2}, {0, 3}, {1, 3}, {2, 3}, {1, 2}}, Path, true, []int{0, 1, 0, 2, 0, 3, 1, 2, 3}, []int{0, 1, 2, 3, 4, 5, 7, 6}},
	{0, false, [][2]int{}, Circuit, true, []int{}, []int{}},
	{4, true, [][2]int{}, Circuit, true, []int{}, []int{}},
	{1, false, [][2]int{{0, 0}}, Circuit, true, []int{0, 0}, []int{0}},
	{1, true, [][2]int{{0, 0}}, Circuit, true, []int{0, 0}, []int{0}},
	{3, false, [][2]int{{0, 1}, {1, 1}, {1, 2}}, Path, true, []int{0, 1, 1, 2}, []int{0, 1, 2}},
	{2, false, [][2]int{{0, 1}, {0, 1}, {0, 1}}, Path, true, []int{0, 1, 0, 1}, []int{0, 1, 2}},
	{2, true, [][2]int{{0, 1}, {1, 0}, {0, 1}}, Path, true, []int{0, 1, 0, 1}, []int{0, 1, 2}},
	{6, false, [][2]int{{3, 4}}, Path, true, []int{3, 4}, []int{0}},
	{6, false, [][2]int{{0, 1}, {1, 2}, {2, 0}, {3, 4}, {4, 5}, {5, 3}}, None, false, []int{}, []int{}},
	{4, true, [][2]int{{0, 1}, {1, 2}, {2, 0}, {2, 3}}, Path, true, []int{2, 0, 1, 2, 3}, []int{2, 0, 1, 3}},
	{4, true, [][2]int{{0, 1}, {1, 3}, {3, 0}, {3, 2}}, Path, true, []int{3, 0, 1, 3, 2}, []int{2, 0, 1, 3}},
	{3, false, [][2]int{{2, 1}, {1, 0}}, Path, true, []int{0, 1, 2}, []int{1, 0}},
	{5, false, [][2]int{{0, 1}, {1, 2}, {2, 0}, {0, 3}, {3, 4}, {4, 0}}, Circuit, true, []int{0, 1, 2, 0, 3, 4, 0}, []int{0, 1, 2, 3, 4, 5}},
	{5, false, [][2]int{{4, 0}, {3, 4}, {0, 3}, {2, 0}, {1, 2}, {0, 1}}, Circuit, true, []int{0, 4, 3, 0, 2, 1, 0}, []int{0, 1, 2, 3, 4, 5}},
	{5, false, [][2]int{{0, 1}, {1, 2}, {2, 0}, {1, 3}, {3, 4}, {4, 1}}, Circuit, true, []int{0, 1, 3, 4, 1, 2, 0}, []int{0, 3, 4, 5, 1, 2}},
	{3, true, [][2]int{{0, 1}, {0, 2}}, None, false, []int{}, []int{}},
	{6, false, [][2]int{{5, 5}}, Circuit, true, []int{5, 5}, []int{0}},
	{5, false, [][2]int{{4, 1}, {3, 4}, {1, 0}}, Path, true, []int{0, 1, 4, 3}, []int{2, 0, 1}},
	{1, false, [][2]int{{0, 0}, {0, 0}, {0, 0}, {0, 0}, {0, 0}, {0, 0}}, Circuit, true, []int{0, 0, 0, 0, 0, 0, 0}, []int{0, 1, 2, 3, 4, 5}},
	{5, false, [][2]int{{1, 4}, {0, 4}, {2, 0}, {4, 1}, {4, 2}}, Circuit, true, []int{0, 4, 1, 4, 2, 0}, []int{1, 0, 3, 4, 2}},
	{5, false, [][2]int{{3, 3}, {4, 4}, {3, 1}, {2, 1}}, None, false, []int{}, []int{}},
	{2, false, [][2]int{{1, 0}, {0, 1}, {1, 1}, {0, 1}, {1, 1}, {1, 0}, {0, 1}, {0, 0}}, Path, true, []int{0, 1, 0, 1, 1, 1, 0, 0, 1}, []int{0, 1, 3, 2, 4, 5, 7, 6}},
	{3, true, [][2]int{{1, 2}, {1, 0}, {2, 1}}, Path, true, []int{1, 2, 1, 0}, []int{0, 2, 1}},
	{5, true, [][2]int{{1, 4}, {4, 1}}, Circuit, true, []int{1, 4, 1}, []int{0, 1}},
	{4, true, [][2]int{{0, 3}, {3, 0}}, Circuit, true, []int{0, 3, 0}, []int{0, 1}},
	{3, true, [][2]int{{1, 1}, {0, 1}, {0, 2}, {1, 0}, {1, 0}, {0, 1}, {2, 0}}, Circuit, true, []int{0, 1, 1, 0, 2, 0, 1, 0}, []int{1, 0, 3, 2, 6, 5, 4}},
	{3, false, [][2]int{{0, 2}}, Path, true, []int{0, 2}, []int{0}},
	{2, true, [][2]int{{1, 1}, {1, 0}, {0, 0}, {1, 1}, {1, 1}, {0, 1}, {0, 1}, {0, 0}, {1, 0}}, Circuit, true, []int{0, 0, 1, 1, 0, 1, 1, 1, 0, 0}, []int{2, 5, 0, 1, 6, 3, 4, 8, 7}},
	{2, false, [][2]int{{0, 0}, {0, 1}, {1, 0}}, Circuit, true, []int{0, 0, 1, 0}, []int{0, 1, 2}},
	{5, false, [][2]int{{1, 1}, {1, 4}, {4, 3}, {4, 1}, {3, 4}}, Circuit, true, []int{1, 1, 4, 3, 4, 1}, []int{0, 1, 2, 4, 3}},
	{6, false, [][2]int{{2, 2}, {2, 4}, {4, 5}, {1, 2}, {1, 4}, {4, 0}}, Path, true, []int{0, 4, 2, 2, 1, 4, 5}, []int{5, 1, 0, 3, 4, 2}},
	{6, false, [][2]int{{1, 2}, {5, 1}, {3, 5}, {2, 3}, {0, 5}, {5, 0}}, Circuit, true, []int{0, 5, 1, 2, 3, 5, 0}, []int{4, 1, 0, 3, 2, 5}},
	{6, false, [][2]int{{5, 5}, {2, 4}}, None, false, []int{}, []int{}},
	{4, true, [][2]int{{0, 3}, {3, 1}, {1, 2}, {2, 0}, {2, 3}, {2, 1}, {3, 2}}, Path, true, []int{2, 0, 3, 1, 2, 3, 2, 1}, []int{3, 0, 1, 2, 4, 6, 5}},
	{3, true, [][2]int{{2, 2}, {1, 2}, {2, 2}}, Path, true, []int{1, 2, 2, 2}, []int{1, 0, 2}},
	{5, true, [][2]int{{4, 4}, {1, 4}, {3, 2}, {2, 0}, {1, 3}, {0, 1}, {3, 1}, {4, 4}}, Path, true, []int{3, 2, 0, 1, 3, 1, 4, 4, 4}, []int{2, 3, 5, 4, 6, 1, 0, 7}},
}

func TestAgreementWithPython(t *testing.T) {
	for i, c := range pythonCases {
		kind, err := EulerianKind(c.n, c.edges, c.directed)
		walk, ok, err2 := EulerianPath(c.n, c.edges, c.directed)
		same := err == nil && err2 == nil && kind == c.kind && ok == c.found &&
			(!ok || (reflect.DeepEqual(walk.Vertices, c.vertices) && reflect.DeepEqual(walk.EdgeIDs, c.edgeIDs)))
		if !same {
			t.Errorf("case %d: %v %v %v differs from Python (%v %v %v)", i, kind, walk, ok, c.kind, c.vertices, c.edgeIDs)
		}
	}
}
