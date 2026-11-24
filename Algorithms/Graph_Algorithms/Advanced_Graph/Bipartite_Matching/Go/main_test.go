package main

import (
	"errors"
	"slices"
	"testing"
)

// L0 reaches R1, R2 and R3; L1, L2 and L3 reach only R0 and R1, so one of them stays free.
var example = [][2]int{{0, 1}, {0, 2}, {0, 3}, {1, 0}, {1, 1}, {2, 0}, {3, 1}}

type matcher func(nLeft, nRight int, edges [][2]int) (int, []int, error)

var matchers = map[string]matcher{"Kuhn": Kuhn, "HopcroftKarp": HopcroftKarp}

// mustMatch and mustCover also reject a nil slice: an empty result is []int{}, never nil.
func mustMatch(t *testing.T, name string, f matcher, nLeft, nRight int, edges [][2]int, wantSize int, want []int) {
	t.Helper()
	size, match, err := f(nLeft, nRight, edges)
	if err != nil || size != wantSize || !slices.Equal(match, want) || match == nil {
		t.Errorf("%s(%d, %d, %v) = %d, %v, %v; want %d, %v", name, nLeft, nRight, edges, size, match, err, wantSize, want)
	}
}

func mustCover(t *testing.T, nLeft, nRight int, edges [][2]int, wantLeft, wantRight []int) {
	t.Helper()
	left, right, err := MinVertexCover(nLeft, nRight, edges)
	if err != nil || !slices.Equal(left, wantLeft) || !slices.Equal(right, wantRight) || left == nil || right == nil {
		t.Errorf("MinVertexCover(%d, %d, %v) = %v, %v, %v; want %v, %v", nLeft, nRight, edges, left, right, err, wantLeft, wantRight)
	}
}

func TestWorkedExample(t *testing.T) {
	mustMatch(t, "Kuhn", Kuhn, 4, 4, example, 3, []int{2, 1, 0, -1})
	mustMatch(t, "HopcroftKarp", HopcroftKarp, 4, 4, example, 3, []int{2, 0, -1, 1})
	mustCover(t, 4, 4, example, []int{0}, []int{0, 1})
}

func TestEdgeCases(t *testing.T) {
	k35 := [][2]int{}
	for u := 0; u < 3; u++ {
		for v := 0; v < 5; v++ {
			k35 = append(k35, [2]int{u, v})
		}
	}
	doubled := [][2]int{{0, 0}, {0, 0}, {1, 0}, {1, 1}, {1, 0}, {2, 1}, {2, 1}}
	cases := []struct {
		name          string
		nLeft, nRight int
		edges         [][2]int
		size          int
		kuhn, hk      []int
		left, right   []int
	}{
		{"no edges", 3, 2, nil, 0, []int{-1, -1, -1}, []int{-1, -1, -1}, []int{}, []int{}},
		{"empty left side", 0, 3, nil, 0, []int{}, []int{}, []int{}, []int{}},
		{"empty right side", 2, 0, nil, 0, []int{-1, -1}, []int{-1, -1}, []int{}, []int{}},
		{"both sides empty", 0, 0, nil, 0, []int{}, []int{}, []int{}, []int{}},
		{"single edge", 1, 1, [][2]int{{0, 0}}, 1, []int{0}, []int{0}, []int{0}, []int{}},
		{"duplicate edges", 3, 2, doubled, 2, []int{0, 1, -1}, []int{0, 1, -1}, []int{}, []int{0, 1}},
		// Kuhn's root k first asks for R0 and pushes every earlier left vertex one place along;
		// Hopcroft-Karp's first phase gives each left vertex the first free right vertex.
		{"complete K3,5", 3, 5, k35, 3, []int{2, 1, 0}, []int{0, 1, 2}, []int{0, 1, 2}, []int{}},
		{"L1 and R2 without neighbours", 3, 3, [][2]int{{0, 0}, {2, 1}, {2, 0}}, 2, []int{0, -1, 1}, []int{0, -1, 1}, []int{0, 2}, []int{}},
		{"edge order K2,2", 2, 2, [][2]int{{0, 0}, {0, 1}, {1, 0}, {1, 1}}, 2, []int{1, 0}, []int{0, 1}, []int{0, 1}, []int{}},
		{"reversed order K2,2", 2, 2, [][2]int{{1, 1}, {1, 0}, {0, 1}, {0, 0}}, 2, []int{0, 1}, []int{1, 0}, []int{0, 1}, []int{}},
	}
	for _, c := range cases {
		t.Run(c.name, func(t *testing.T) {
			mustMatch(t, "Kuhn", Kuhn, c.nLeft, c.nRight, c.edges, c.size, c.kuhn)
			mustMatch(t, "HopcroftKarp", HopcroftKarp, c.nLeft, c.nRight, c.edges, c.size, c.hk)
			mustCover(t, c.nLeft, c.nRight, c.edges, c.left, c.right)
		})
	}
}

func TestInvalidInput(t *testing.T) {
	bad := []struct {
		nLeft, nRight int
		edges         [][2]int
	}{
		{-1, 2, nil}, {2, -1, nil}, {2, 2, [][2]int{{2, 0}}}, {2, 2, [][2]int{{0, 2}}}, {2, 2, [][2]int{{-1, 0}}}, {2, 0, [][2]int{{0, 0}}},
	}
	for _, b := range bad {
		for name, f := range matchers {
			if _, match, err := f(b.nLeft, b.nRight, b.edges); !errors.Is(err, ErrInvalidGraph) || match != nil {
				t.Errorf("%s(%d, %d, %v): err %v, match %v; want ErrInvalidGraph and nil", name, b.nLeft, b.nRight, b.edges, err, match)
			}
		}
		if _, _, err := MinVertexCover(b.nLeft, b.nRight, b.edges); !errors.Is(err, ErrInvalidGraph) {
			t.Errorf("MinVertexCover(%d, %d, %v): err %v; want ErrInvalidGraph", b.nLeft, b.nRight, b.edges, err)
		}
	}
}

func TestLongAugmentingPath(t *testing.T) {
	// L(n-1) reaches only R0: its path runs L(n-1) - R0 - L0 - R1 - ... - L(n-2) - R(n-1).
	const n = 200000
	edges := [][2]int{}
	for u := 0; u+1 < n; u++ {
		edges = append(edges, [2]int{u, u})
	}
	for u := 0; u+1 < n; u++ {
		edges = append(edges, [2]int{u, u + 1})
	}
	edges = append(edges, [2]int{n - 1, 0})
	want := make([]int, n)
	for u := 0; u+1 < n; u++ {
		want[u] = u + 1
	}
	for name, f := range matchers {
		size, match, err := f(n, n, edges)
		if err != nil || size != n || !slices.Equal(match, want) {
			t.Errorf("%s: size %d, err %v, matching differs from the shifted one", name, size, err)
		}
	}
}

// ---------------------------------------------------------------- random graphs

type lcg struct{ s uint64 }

func (r *lcg) below(n int) int {
	r.s = r.s*6364136223846793005 + 1442695040888963407
	return int((r.s >> 33) % uint64(n))
}

type graph struct {
	nLeft, nRight int
	edges         [][2]int
}

func randomGraph(r *lcg, maxSide, maxEdges int) graph {
	g := graph{1 + r.below(maxSide), 1 + r.below(maxSide), nil}
	m := r.below(maxEdges + 1)
	for i := 0; i < m; i++ {
		g.edges = append(g.edges, [2]int{r.below(g.nLeft), r.below(g.nRight)})
	}
	return g
}

// bruteMaxMatching tries every choice for each left vertex in turn.
func bruteMaxMatching(g graph, u int, used uint) int {
	if u == g.nLeft {
		return 0
	}
	best := bruteMaxMatching(g, u+1, used)
	for _, e := range g.edges {
		if e[0] == u && used&(1<<e[1]) == 0 {
			best = max(best, 1+bruteMaxMatching(g, u+1, used|1<<e[1]))
		}
	}
	return best
}

// reductionMaxFlow is Edmonds-Karp on source -> every left vertex -> right vertex -> sink, capacity 1.
func reductionMaxFlow(g graph) int {
	n := g.nLeft + g.nRight + 2
	source, sink := n-2, n-1
	capacity := make([][]int, n)
	for i := range capacity {
		capacity[i] = make([]int, n)
	}
	for u := 0; u < g.nLeft; u++ {
		capacity[source][u] = 1
	}
	for v := 0; v < g.nRight; v++ {
		capacity[g.nLeft+v][sink] = 1
	}
	for _, e := range g.edges {
		capacity[e[0]][g.nLeft+e[1]] = 1
	}
	flow := 0
	for {
		parent := filled(n, -1)
		parent[source] = source
		queue := []int{source}
		for head := 0; head < len(queue) && parent[sink] == -1; head++ {
			a := queue[head]
			for b := 0; b < n; b++ {
				if capacity[a][b] > 0 && parent[b] == -1 {
					parent[b] = a
					queue = append(queue, b)
				}
			}
		}
		if parent[sink] == -1 {
			return flow
		}
		for b := sink; b != source; b = parent[b] {
			capacity[parent[b]][b]--
			capacity[b][parent[b]]++
		}
		flow++
	}
}

func checkMatching(t *testing.T, name string, g graph, size int, match []int) {
	t.Helper()
	edgeSet := map[[2]int]bool{}
	for _, e := range g.edges {
		edgeSet[e] = true
	}
	used := map[int]bool{}
	matched := 0
	for u, v := range match {
		if v == -1 {
			continue
		}
		matched++
		if !edgeSet[[2]int{u, v}] || used[v] {
			t.Fatalf("%s %v: pair (%d, %d) is not an edge or reuses R%d", name, g, u, v, v)
		}
		used[v] = true
	}
	if len(match) != g.nLeft || matched != size {
		t.Fatalf("%s %v: %d pairs for size %d", name, g, matched, size)
	}
}

func TestRandomGraphsAgainstBruteForceAndFlow(t *testing.T) {
	r := &lcg{20261122}
	for round := 0; round < 600; round++ {
		small := round < 400
		var g graph
		var want int
		if small {
			g = randomGraph(r, 6, 20)
			want = bruteMaxMatching(g, 0, 0)
			if flow := reductionMaxFlow(g); flow != want {
				t.Fatalf("%v: brute force %d, flow %d", g, want, flow)
			}
		} else {
			g = randomGraph(r, 30, 150)
			want = reductionMaxFlow(g)
		}
		for name, f := range matchers {
			size, match, err := f(g.nLeft, g.nRight, g.edges)
			if err != nil || size != want {
				t.Fatalf("%s %v: size %d, err %v; want %d", name, g, size, err, want)
			}
			checkMatching(t, name, g, size, match)
		}
		left, right, _ := MinVertexCover(g.nLeft, g.nRight, g.edges)
		if len(left)+len(right) != want {
			t.Fatalf("cover %v %v has %d vertices; want %d", left, right, len(left)+len(right), want)
		}
		for _, e := range g.edges {
			if !slices.Contains(left, e[0]) && !slices.Contains(right, e[1]) {
				t.Fatalf("%v: edge %v is not covered by %v %v", g, e, left, right)
			}
		}
	}
}

// ---------------------------------------------------------------- agreement with Python

// Outputs computed by running the Python implementation (bipartite_matching.py): fixed cases
// first, then seeded random graphs with repeated edges.
var pythonCases = []struct {
	nLeft, nRight         int
	edges                 [][2]int
	size                  int
	kuhn, hopcroftKarp    []int
	coverLeft, coverRight []int
}{
	{4, 4, [][2]int{{0, 1}, {0, 2}, {0, 3}, {1, 0}, {1, 1}, {2, 0}, {3, 1}}, 3, []int{2, 1, 0, -1}, []int{2, 0, -1, 1}, []int{0}, []int{0, 1}},
	{2, 2, [][2]int{{0, 0}, {0, 1}, {1, 0}, {1, 1}}, 2, []int{1, 0}, []int{0, 1}, []int{0, 1}, []int{}},
	{2, 2, [][2]int{{1, 1}, {1, 0}, {0, 1}, {0, 0}}, 2, []int{0, 1}, []int{1, 0}, []int{0, 1}, []int{}},
	{3, 5, [][2]int{{0, 0}, {0, 1}, {0, 2}, {0, 3}, {0, 4}, {1, 0}, {1, 1}, {1, 2}, {1, 3}, {1, 4}, {2, 0}, {2, 1}, {2, 2}, {2, 3}, {2, 4}}, 3, []int{2, 1, 0}, []int{0, 1, 2}, []int{0, 1, 2}, []int{}},
	{5, 3, [][2]int{{0, 0}, {0, 1}, {0, 2}, {1, 0}, {1, 1}, {1, 2}, {2, 0}, {2, 1}, {2, 2}, {3, 0}, {3, 1}, {3, 2}, {4, 0}, {4, 1}, {4, 2}}, 3, []int{2, 1, 0, -1, -1}, []int{0, 1, 2, -1, -1}, []int{}, []int{0, 1, 2}},
	{3, 2, [][2]int{{0, 0}, {0, 0}, {1, 0}, {1, 1}, {1, 0}, {2, 1}, {2, 1}}, 2, []int{0, 1, -1}, []int{0, 1, -1}, []int{}, []int{0, 1}},
	{3, 3, [][2]int{{0, 0}, {2, 1}, {2, 0}}, 2, []int{0, -1, 1}, []int{0, -1, 1}, []int{0, 2}, []int{}},
	{4, 1, [][2]int{{0, 0}, {1, 0}, {2, 0}, {3, 0}}, 1, []int{0, -1, -1, -1}, []int{0, -1, -1, -1}, []int{}, []int{0}},
	{5, 5, [][2]int{{0, 0}, {0, 1}, {1, 0}, {2, 1}, {2, 2}, {3, 2}, {3, 3}, {4, 3}, {4, 4}}, 5, []int{1, 0, 2, 3, 4}, []int{1, 0, 2, 3, 4}, []int{0, 1, 2, 3, 4}, []int{}},
	{6, 6, [][2]int{{5, 0}, {0, 0}, {1, 1}, {2, 2}, {3, 3}, {4, 4}, {0, 1}, {1, 2}, {2, 3}, {3, 4}, {4, 5}}, 6, []int{1, 2, 3, 4, 5, 0}, []int{1, 2, 3, 4, 5, 0}, []int{0, 1, 2, 3, 4, 5}, []int{}},
	{5, 5, [][2]int{{3, 4}, {0, 0}, {3, 0}, {1, 3}}, 3, []int{0, 3, -1, 4, -1}, []int{0, 3, -1, 4, -1}, []int{0, 1, 3}, []int{}},
	{4, 6, [][2]int{{1, 5}, {2, 2}, {3, 4}, {2, 5}, {3, 2}, {2, 1}, {3, 4}, {2, 4}}, 3, []int{-1, 5, 2, 4}, []int{-1, 5, 2, 4}, []int{1, 2, 3}, []int{}},
	{6, 4, [][2]int{{1, 2}, {4, 1}, {3, 1}, {4, 3}, {2, 0}, {0, 3}, {2, 3}, {1, 1}, {4, 2}, {5, 3}}, 4, []int{3, 2, 0, 1, -1, -1}, []int{3, 2, 0, 1, -1, -1}, []int{2}, []int{1, 2, 3}},
	{3, 2, [][2]int{{2, 0}, {2, 1}, {2, 0}, {1, 0}, {2, 1}, {1, 1}, {0, 1}, {2, 1}, {2, 1}}, 2, []int{1, 0, -1}, []int{1, 0, -1}, []int{}, []int{0, 1}},
	{4, 1, [][2]int{{1, 0}, {1, 0}, {2, 0}, {0, 0}, {0, 0}, {1, 0}, {2, 0}}, 1, []int{0, -1, -1, -1}, []int{0, -1, -1, -1}, []int{}, []int{0}},
	{4, 6, [][2]int{{1, 5}, {3, 1}, {1, 1}, {3, 5}}, 2, []int{-1, 5, -1, 1}, []int{-1, 5, -1, 1}, []int{1, 3}, []int{}},
	{3, 1, [][2]int{{2, 0}, {1, 0}}, 1, []int{-1, 0, -1}, []int{-1, 0, -1}, []int{}, []int{0}},
	{2, 3, [][2]int{{0, 1}, {0, 0}}, 1, []int{1, -1}, []int{1, -1}, []int{0}, []int{}},
	{5, 4, [][2]int{{2, 1}, {4, 3}, {0, 1}, {3, 2}}, 3, []int{1, -1, -1, 2, 3}, []int{1, -1, -1, 2, 3}, []int{3, 4}, []int{1}},
	{6, 1, [][2]int{{4, 0}, {5, 0}, {5, 0}, {0, 0}, {1, 0}, {1, 0}, {0, 0}, {4, 0}, {1, 0}, {4, 0}, {3, 0}, {4, 0}, {0, 0}, {0, 0}}, 1, []int{0, -1, -1, -1, -1, -1}, []int{0, -1, -1, -1, -1, -1}, []int{}, []int{0}},
	{4, 1, [][2]int{{1, 0}}, 1, []int{-1, 0, -1, -1}, []int{-1, 0, -1, -1}, []int{1}, []int{}},
	{1, 3, [][2]int{{0, 1}, {0, 0}, {0, 2}, {0, 2}, {0, 2}}, 1, []int{1}, []int{1}, []int{0}, []int{}},
	{1, 4, [][2]int{{0, 0}, {0, 3}, {0, 3}, {0, 0}, {0, 1}, {0, 1}, {0, 0}}, 1, []int{0}, []int{0}, []int{0}, []int{}},
	{4, 3, [][2]int{{0, 0}, {1, 2}, {0, 1}, {2, 2}}, 2, []int{0, 2, -1, -1}, []int{0, 2, -1, -1}, []int{0}, []int{2}},
	{3, 4, [][2]int{{1, 2}, {2, 3}, {1, 2}, {2, 3}, {0, 2}}, 2, []int{2, -1, 3}, []int{2, -1, 3}, []int{2}, []int{2}},
	{1, 1, [][2]int{{0, 0}, {0, 0}, {0, 0}, {0, 0}, {0, 0}, {0, 0}}, 1, []int{0}, []int{0}, []int{0}, []int{}},
	{6, 6, [][2]int{{3, 5}, {0, 5}}, 1, []int{5, -1, -1, -1, -1, -1}, []int{5, -1, -1, -1, -1, -1}, []int{}, []int{5}},
	{1, 1, [][2]int{{0, 0}, {0, 0}}, 1, []int{0}, []int{0}, []int{0}, []int{}},
	{2, 2, [][2]int{{1, 1}, {1, 0}, {1, 0}, {0, 0}, {1, 0}, {1, 1}}, 2, []int{0, 1}, []int{0, 1}, []int{0, 1}, []int{}},
	{1, 5, [][2]int{{0, 0}, {0, 1}, {0, 4}, {0, 4}, {0, 3}, {0, 0}, {0, 0}, {0, 1}, {0, 3}, {0, 2}, {0, 4}, {0, 4}}, 1, []int{0}, []int{0}, []int{0}, []int{}},
	{2, 4, [][2]int{{0, 0}, {1, 0}, {1, 2}, {1, 2}, {0, 1}, {0, 1}, {0, 1}, {1, 3}}, 2, []int{1, 0}, []int{0, 2}, []int{0, 1}, []int{}},
	{3, 5, [][2]int{{1, 4}, {2, 2}, {0, 1}, {2, 2}, {1, 4}}, 3, []int{1, 4, 2}, []int{1, 4, 2}, []int{0, 1, 2}, []int{}},
	{6, 2, [][2]int{{2, 0}, {4, 0}}, 1, []int{-1, -1, 0, -1, -1, -1}, []int{-1, -1, 0, -1, -1, -1}, []int{}, []int{0}},
	{4, 3, [][2]int{{3, 2}, {3, 0}, {0, 2}, {0, 0}, {3, 0}, {3, 2}, {2, 2}, {3, 0}}, 2, []int{0, -1, 2, -1}, []int{2, -1, -1, 0}, []int{}, []int{0, 2}},
	{2, 3, [][2]int{{1, 0}, {1, 2}, {1, 1}, {0, 1}}, 2, []int{1, 0}, []int{1, 0}, []int{0, 1}, []int{}},
	{3, 5, [][2]int{{0, 2}, {2, 1}, {0, 0}, {0, 3}, {2, 0}}, 2, []int{2, -1, 1}, []int{2, -1, 1}, []int{0, 2}, []int{}},
	{1, 4, [][2]int{{0, 0}, {0, 3}}, 1, []int{0}, []int{0}, []int{0}, []int{}},
	{6, 3, [][2]int{{1, 2}, {3, 1}, {0, 0}, {3, 2}, {3, 0}, {5, 1}, {0, 0}, {3, 1}, {3, 2}}, 3, []int{0, 2, -1, 1, -1, -1}, []int{0, 2, -1, 1, -1, -1}, []int{}, []int{0, 1, 2}},
	{2, 5, [][2]int{{0, 2}, {0, 0}, {1, 2}, {0, 3}, {1, 4}, {0, 1}, {1, 0}, {0, 0}, {0, 0}, {1, 3}, {0, 0}}, 2, []int{0, 2}, []int{2, 4}, []int{0, 1}, []int{}},
	{5, 6, [][2]int{{4, 1}, {1, 1}, {4, 1}, {0, 0}, {1, 1}, {3, 1}, {2, 2}, {3, 1}, {0, 0}, {3, 5}, {1, 4}, {0, 2}, {4, 1}}, 5, []int{0, 4, 2, 5, 1}, []int{0, 4, 2, 5, 1}, []int{0, 1, 2, 3, 4}, []int{}},
}

func TestAgreementWithPython(t *testing.T) {
	for i, c := range pythonCases {
		mustMatch(t, "Kuhn", Kuhn, c.nLeft, c.nRight, c.edges, c.size, c.kuhn)
		mustMatch(t, "HopcroftKarp", HopcroftKarp, c.nLeft, c.nRight, c.edges, c.size, c.hopcroftKarp)
		mustCover(t, c.nLeft, c.nRight, c.edges, c.coverLeft, c.coverRight)
		if t.Failed() {
			t.Fatalf("agreement case %d differs from Python", i)
		}
	}
}
