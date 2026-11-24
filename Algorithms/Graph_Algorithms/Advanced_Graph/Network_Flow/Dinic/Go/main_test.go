package main

import (
	"math"
	"slices"
	"sort"
	"testing"
)

var classic = map[int]map[int]int{
	0: {1: 16, 2: 13},
	1: {2: 10, 3: 12},
	2: {1: 4, 4: 14},
	3: {2: 9, 5: 20},
	4: {3: 7, 5: 4},
}

func graphOf(edges [][3]int) map[int]map[int]int {
	g := map[int]map[int]int{}
	for _, e := range edges {
		if g[e[0]] == nil {
			g[e[0]] = map[int]int{}
		}
		g[e[0]][e[1]] = e[2]
	}
	return g
}

func edgesOf(g map[int]map[int]int) [][3]int {
	edges := [][3]int{}
	for u, row := range g {
		for v, c := range row {
			edges = append(edges, [3]int{u, v, c})
		}
	}
	return edges
}

// referenceMaxFlow is Edmonds-Karp on an edge list. Every edge is an arc of its own, so
// parallel and anti-parallel edges never share an entry; arc i ^ 1 is the reverse of arc i.
func referenceMaxFlow(edges [][3]int, source, sink int) int {
	if source == sink {
		return 0
	}
	head, room, out := []int{}, []int{}, map[int][]int{}
	for _, e := range edges {
		out[e[0]] = append(out[e[0]], len(head))
		head, room = append(head, e[1]), append(room, e[2])
		out[e[1]] = append(out[e[1]], len(head))
		head, room = append(head, e[0]), append(room, 0)
	}
	flow := 0
	for {
		via := map[int]int{source: -1}
		queue := []int{source}
		for len(queue) > 0 {
			if _, done := via[sink]; done {
				break
			}
			u := queue[0]
			queue = queue[1:]
			for _, i := range out[u] {
				if _, seen := via[head[i]]; !seen && room[i] > 0 {
					via[head[i]] = i
					queue = append(queue, head[i])
				}
			}
		}
		if _, done := via[sink]; !done {
			return flow
		}
		bottleneck := math.MaxInt
		for v := sink; via[v] != -1; v = head[via[v]^1] {
			bottleneck = min(bottleneck, room[via[v]])
		}
		for v := sink; via[v] != -1; v = head[via[v]^1] {
			room[via[v]] -= bottleneck
			room[via[v]^1] += bottleneck
		}
		flow += bottleneck
	}
}

// checkMaximumFlow checks capacity limits, conservation, the value, and a cut whose capacity
// equals the flow.
func checkMaximumFlow(t *testing.T, graph map[int]map[int]int, source, sink int, r DinicResult) {
	t.Helper()
	balance := map[int]int{}
	for u, row := range graph {
		for v, c := range row {
			f, ok := r.Flows[u][v]
			if !ok || f < 0 || f > c {
				t.Fatalf("flow %d on %d->%d (capacity %d) in %v", f, u, v, c, graph)
			}
			balance[u] -= f
			balance[v] += f
		}
	}
	for v, b := range balance {
		if v != source && v != sink && b != 0 {
			t.Fatalf("flow is not conserved at %d in %v", v, graph)
		}
	}
	if balance[sink] != r.MaxFlow || balance[source] != -r.MaxFlow {
		t.Fatalf("the flows do not add up to %d in %v", r.MaxFlow, graph)
	}
	side := map[int]bool{}
	for _, v := range r.SourceSide {
		side[v] = true
	}
	if !sort.IntsAreSorted(r.SourceSide) || len(side) != len(r.SourceSide) || !side[source] || side[sink] {
		t.Fatalf("source side %v is not a cut between %d and %d", r.SourceSide, source, sink)
	}
	cut := 0
	for u, row := range graph {
		for v, c := range row {
			if side[u] && !side[v] {
				cut += c
			}
			if !side[u] && side[v] && r.Flows[u][v] != 0 {
				t.Fatalf("edge %d->%d into the source side carries flow", u, v)
			}
		}
	}
	if cut != r.MaxFlow {
		t.Fatalf("cut %d != flow %d in %v", cut, r.MaxFlow, graph)
	}
}

func TestClassic(t *testing.T) {
	if got := dinic(classic, 0, 5); got != 23 {
		t.Fatalf("dinic = %d, want 23", got)
	}
	r := dinicFlow(classic, 0, 5)
	want := map[int]map[int]int{0: {1: 12, 2: 11}, 1: {2: 0, 3: 12}, 2: {1: 0, 4: 11}, 3: {2: 0, 5: 19}, 4: {3: 7, 5: 4}}
	for u, row := range want {
		for v, f := range row {
			if r.Flows[u][v] != f {
				t.Errorf("flow on %d->%d = %d, want %d", u, v, r.Flows[u][v], f)
			}
		}
	}
	if r.MaxFlow != 23 || !slices.Equal(r.SourceSide, []int{0, 1, 2, 4}) || r.Phases != 3 || r.EdgeVisits != 40 {
		t.Errorf("got %d %v %d phases %d visits, want 23 [0 1 2 4] 3 40", r.MaxFlow, r.SourceSide, r.Phases, r.EdgeVisits)
	}
}

func TestEdgeCases(t *testing.T) {
	cases := []struct {
		name         string
		graph        map[int]map[int]int
		source, sink int
		maxFlow      int
		sourceSide   []int
		phases       int
	}{
		{"same source and sink", map[int]map[int]int{0: {1: 10}}, 0, 0, 0, []int{0}, 0},
		{"empty graph", map[int]map[int]int{}, 0, 1, 0, []int{0}, 1},
		{"sink unreachable", map[int]map[int]int{0: {1: 5}, 2: {3: 5}}, 0, 3, 0, []int{0, 1}, 1},
		{"sink without key", map[int]map[int]int{0: {1: 7}, 1: {2: 3}}, 0, 2, 3, []int{0, 1}, 2},
		{"source without key", map[int]map[int]int{1: {0: 5, 2: 4}}, 0, 2, 0, []int{0}, 1},
		{"anti-parallel edges", map[int]map[int]int{0: {1: 4}, 1: {0: 6, 2: 5}}, 0, 2, 4, []int{0}, 2},
		{"zero capacity", map[int]map[int]int{0: {1: 0, 2: 3}, 1: {3: 9}, 2: {3: 9}}, 0, 3, 3, []int{0}, 2},
		{"self-loops", map[int]map[int]int{0: {0: 5, 1: 2}, 1: {1: 9, 2: 4}}, 0, 2, 2, []int{0}, 2},
		// The cross edge 1 -> 2 joins two vertices of level 1, so the level graph leaves it out.
		{"1000/1 diamond", map[int]map[int]int{0: {1: 1000, 2: 1000}, 1: {2: 1, 3: 1000}, 2: {3: 1000}}, 0, 3, 2000, []int{0}, 2},
		{"negative and large ids", map[int]map[int]int{-5: {1000000000: 4, 7: 3}, 1000000000: {-2: 5}, 7: {-2: 1}}, -5, -2, 5, []int{-5, 7}, 2},
	}
	for _, c := range cases {
		t.Run(c.name, func(t *testing.T) {
			if got := dinic(c.graph, c.source, c.sink); got != c.maxFlow {
				t.Errorf("dinic = %d, want %d", got, c.maxFlow)
			}
			r := dinicFlow(c.graph, c.source, c.sink)
			if r.MaxFlow != c.maxFlow || !slices.Equal(r.SourceSide, c.sourceSide) || r.Phases != c.phases {
				t.Errorf("dinicFlow = %d %v %d phases, want %d %v %d", r.MaxFlow, r.SourceSide, r.Phases, c.maxFlow, c.sourceSide, c.phases)
			}
			for u, row := range c.graph {
				for v := range row {
					if _, ok := r.Flows[u][v]; !ok {
						t.Errorf("no flow for edge %d->%d", u, v)
					}
				}
			}
		})
	}
	// The net flow of two anti-parallel edges goes to the one it runs along.
	if r := dinicFlow(map[int]map[int]int{0: {1: 4}, 1: {0: 6, 2: 5}}, 0, 2); r.Flows[0][1] != 4 || r.Flows[1][0] != 0 || r.Flows[1][2] != 4 {
		t.Errorf("anti-parallel flows %v", r.Flows)
	}
	// 1 -> 2 carries flow first; the next phase cancels 2 of it through 2 -> 1's entry.
	both := map[int]map[int]int{0: {1: 2, 2: 3}, 1: {2: 2, 3: 3}, 2: {1: 2, 3: 1}}
	if dinic(both, 0, 3) != 4 || referenceMaxFlow(edgesOf(both), 0, 3) != 4 {
		t.Errorf("flow through both anti-parallel edges is not 4")
	}
	if r := dinicFlow(map[int]map[int]int{0: {1: 10}}, 0, 0); r.Flows[0][1] != 0 || r.EdgeVisits != 0 {
		t.Errorf("source == sink: %v", r)
	}
}

func TestParallelEdgesAreAddedUp(t *testing.T) {
	// A map holds one capacity per edge, so parallel edges are given as their sum.
	multigraph := [][3]int{{0, 1, 3}, {0, 1, 4}, {1, 2, 2}, {1, 2, 2}, {1, 2, 1}, {0, 2, 1}}
	graph := map[int]map[int]int{0: {}, 1: {}}
	for _, e := range multigraph {
		graph[e[0]][e[1]] += e[2]
	}
	if graph[0][1] != 7 || graph[1][2] != 5 || dinic(graph, 0, 2) != 6 || referenceMaxFlow(multigraph, 0, 2) != 6 {
		t.Errorf("parallel edges: graph %v, flow %d", graph, dinic(graph, 0, 2))
	}
}

func TestLargeCapacitiesDoNotOverflow(t *testing.T) {
	const big = 2147483647
	graph := map[int]map[int]int{0: {1: big, 2: big}, 1: {3: big}, 2: {3: big}}
	if got := dinic(graph, 0, 3); got != 2*big {
		t.Errorf("Expected %d, got %d", 2*big, got)
	}
}

func TestLongPath(t *testing.T) {
	// Each search walks the whole chain of 200000 vertices; the path is kept in a slice.
	const n = 200000
	graph := map[int]map[int]int{}
	for u := 0; u+1 < n; u++ {
		c := 9
		if u == n/2 {
			c = 7
		}
		graph[u] = map[int]int{u + 1: c}
	}
	r := dinicFlow(graph, 0, n-1)
	if r.MaxFlow != 7 || r.Phases != 2 || len(r.SourceSide) != n/2+1 || r.SourceSide[n/2] != n/2 {
		t.Errorf("chain: flow %d, phases %d, side of %d vertices", r.MaxFlow, r.Phases, len(r.SourceSide))
	}
}

// ---------------------------------------------------------------- random networks

type lcg struct{ s uint64 }

func (r *lcg) below(n int) int {
	r.s = r.s*6364136223846793005 + 1442695040888963407
	return int((r.s >> 33) % uint64(n))
}

type network struct {
	graph        map[int]map[int]int
	source, sink int
}

// randomNetwork has 2 to maxN vertices, random edges (some anti-parallel, some of capacity 0),
// a random source and sink.
func randomNetwork(r *lcg, maxN, maxEdges int) network {
	n := 2 + r.below(maxN-1)
	net := network{map[int]map[int]int{}, r.below(n), 0}
	m := r.below(maxEdges + 1)
	for i := 0; i < m; i++ {
		u, v := r.below(n), r.below(n)
		if u == v {
			continue
		}
		if net.graph[u] == nil {
			net.graph[u] = map[int]int{}
		}
		if r.below(10) == 0 {
			net.graph[u][v] = 0
		} else {
			net.graph[u][v] = 1 + r.below(20)
		}
	}
	net.sink = (net.source + 1 + r.below(n-1)) % n
	return net
}

func TestRandomNetworksAgainstEdmondsKarp(t *testing.T) {
	r := &lcg{20261124}
	for round := 0; round < 700; round++ {
		var net network
		if round < 600 {
			net = randomNetwork(r, 9, 30)
		} else {
			net = randomNetwork(r, 60, 400)
		}
		res := dinicFlow(net.graph, net.source, net.sink)
		if want := referenceMaxFlow(edgesOf(net.graph), net.source, net.sink); res.MaxFlow != want {
			t.Fatalf("%v from %d to %d: flow %d, Edmonds-Karp %d", net.graph, net.source, net.sink, res.MaxFlow, want)
		}
		if dinic(net.graph, net.source, net.sink) != res.MaxFlow {
			t.Fatalf("dinic and dinicFlow disagree on %v", net.graph)
		}
		checkMaximumFlow(t, net.graph, net.source, net.sink, res)
	}
}

// ---------------------------------------------------------------- unit networks

// matchingNetwork is the reduction: source -> every left vertex -> its right neighbours ->
// sink, capacity 1.
func matchingNetwork(nLeft, nRight int, edges [][2]int) network {
	net := network{map[int]map[int]int{}, nLeft + nRight, nLeft + nRight + 1}
	add := func(u, v int) {
		if net.graph[u] == nil {
			net.graph[u] = map[int]int{}
		}
		net.graph[u][v] = 1
	}
	for u := 0; u < nLeft; u++ {
		add(net.source, u)
	}
	for _, e := range edges {
		add(e[0], nLeft+e[1])
	}
	for v := 0; v < nRight; v++ {
		add(nLeft+v, net.sink)
	}
	return net
}

func TestBipartiteReductions(t *testing.T) {
	k35, k53 := [][2]int{}, [][2]int{}
	for u := 0; u < 3; u++ {
		for v := 0; v < 5; v++ {
			k35 = append(k35, [2]int{u, v})
		}
	}
	for u := 0; u < 5; u++ {
		for v := 0; v < 3; v++ {
			k53 = append(k53, [2]int{u, v})
		}
	}
	// size: computed by kuhn and hopcroft_karp in Bipartite_Matching/Python/bipartite_matching.py.
	cases := []struct {
		nLeft, nRight int
		edges         [][2]int
		size          int
	}{
		{4, 4, [][2]int{{0, 1}, {0, 2}, {0, 3}, {1, 0}, {1, 1}, {2, 0}, {3, 1}}, 3},
		{3, 2, nil, 0},
		{2, 2, [][2]int{{0, 0}, {0, 1}, {1, 0}, {1, 1}}, 2},
		{3, 5, k35, 3},
		{5, 3, k53, 3},
		{3, 2, [][2]int{{0, 0}, {0, 0}, {1, 0}, {1, 1}, {1, 0}, {2, 1}, {2, 1}}, 2},
		{3, 3, [][2]int{{0, 0}, {2, 1}, {2, 0}}, 2},
		{4, 1, [][2]int{{0, 0}, {1, 0}, {2, 0}, {3, 0}}, 1},
		{6, 6, [][2]int{{0, 0}, {1, 1}, {2, 2}, {3, 3}, {4, 4}, {0, 1}, {1, 2}, {2, 3}, {3, 4}, {4, 5}, {5, 0}}, 6},
		{7, 5, [][2]int{{0, 0}, {1, 0}, {3, 4}, {1, 3}, {2, 0}, {2, 2}, {6, 0}, {0, 1}, {6, 3}, {2, 4}, {1, 4}, {0, 4}, {0, 1}, {5, 0}}, 5},
		{9, 9, [][2]int{{8, 0}, {5, 1}, {2, 1}, {3, 8}, {7, 1}}, 3},
		{6, 6, [][2]int{{3, 4}, {0, 1}, {5, 1}, {0, 1}, {2, 5}, {4, 4}}, 3},
	}
	for _, c := range cases {
		net := matchingNetwork(c.nLeft, c.nRight, c.edges)
		r := dinicFlow(net.graph, net.source, net.sink)
		// The middle edges that carry flow form a matching of that size.
		lefts, rights, pairs := map[int]bool{}, map[int]bool{}, 0
		for u := 0; u < c.nLeft; u++ {
			for v, f := range r.Flows[u] {
				if f != 0 {
					pairs++
					lefts[u], rights[v] = true, true
				}
			}
		}
		if r.MaxFlow != c.size || pairs != c.size || len(lefts) != c.size || len(rights) != c.size {
			t.Errorf("%v: flow %d, %d pairs, want %d", c.edges, r.MaxFlow, pairs, c.size)
		}
	}
}

func TestUnitNetworkPhases(t *testing.T) {
	// On a unit network at most 2 sqrt(V) phases push flow, plus the last BFS.
	r := &lcg{1696}
	for round := 0; round < 100; round++ {
		nLeft, nRight := 1+r.below(40), 1+r.below(40)
		edges := [][2]int{}
		m := r.below(161)
		for i := 0; i < m; i++ {
			edges = append(edges, [2]int{r.below(nLeft), r.below(nRight)})
		}
		net := matchingNetwork(nLeft, nRight, edges)
		res := dinicFlow(net.graph, net.source, net.sink)
		if float64(res.Phases) > 2*math.Sqrt(float64(nLeft+nRight+2))+1 {
			t.Errorf("%d phases on a unit network of %d vertices", res.Phases, nLeft+nRight+2)
		}
	}
}

// ---------------------------------------------------------------- the current arc

// comb is 0 -> 1 (capacity k); 1 -> k dead ends 2 .. k+1; 1 -> k+2 .. 2k+1 -> the sink 2k+2
// (capacity 1). Vertex 1 meets the k dead ends before any vertex that leads on, and all k
// paths go through it.
func comb(k int) network {
	net := network{map[int]map[int]int{0: {1: k}, 1: {}}, 0, 2*k + 2}
	for d := 2; d < k+2; d++ {
		net.graph[1][d] = 1
	}
	for b := k + 2; b < 2*k+2; b++ {
		net.graph[1][b] = 1
		net.graph[b] = map[int]int{2*k + 2: 1}
	}
	return net
}

func TestCurrentArc(t *testing.T) {
	// Vertex 1's pointer passes the k dead ends once per phase, so the visits are 7k + 1.
	// A search that started every vertex at its first entry again would make about 2.5 k^2.
	for _, k := range []int{10, 20, 40, 80, 160, 320} {
		net := comb(k)
		r := dinicFlow(net.graph, net.source, net.sink)
		if r.MaxFlow != k || r.Phases != 2 || r.EdgeVisits != 7*k+1 {
			t.Errorf("comb(%d): flow %d, %d phases, %d visits; want %d, 2, %d", k, r.MaxFlow, r.Phases, r.EdgeVisits, k, 7*k+1)
		}
	}
}

// ---------------------------------------------------------------- agreement with Python

// pythonCases are outputs computed by running the Python implementation (dinic.py's
// dinic_flow): fixed cases first, then seeded random networks. flows lists the flow of each
// edge in the order of edges.
var pythonCases = []struct {
	edges        [][3]int
	source, sink int
	maxFlow      int
	flows        []int
	sourceSide   []int
	phases       int
	edgeVisits   int
}{
	{[][3]int{{0, 1, 16}, {0, 2, 13}, {1, 2, 10}, {1, 3, 12}, {2, 1, 4}, {2, 4, 14}, {3, 2, 9}, {3, 5, 20}, {4, 3, 7}, {4, 5, 4}}, 0, 5, 23, []int{12, 11, 0, 12, 0, 11, 0, 19, 7, 4}, []int{0, 1, 2, 4}, 3, 40},
	{[][3]int{{0, 1, 1000}, {0, 2, 1000}, {1, 2, 1}, {1, 3, 1000}, {2, 3, 1000}}, 0, 3, 2000, []int{1000, 1000, 0, 1000, 1000}, []int{0}, 2, 10},
	{[][3]int{{0, 1, 4}, {1, 0, 6}, {1, 2, 5}}, 0, 2, 4, []int{4, 0, 4}, []int{0}, 2, 4},
	{[][3]int{{0, 1, 2}, {0, 2, 3}, {1, 2, 2}, {1, 3, 3}, {2, 1, 2}, {2, 3, 1}}, 0, 3, 4, []int{2, 2, 0, 3, 1, 1}, []int{0, 1, 2}, 3, 22},
	{[][3]int{{0, 1, 0}, {0, 2, 3}, {1, 3, 9}, {2, 3, 9}}, 0, 3, 3, []int{0, 3, 0, 3}, []int{0}, 2, 5},
	{[][3]int{{0, 1, 5}, {2, 3, 5}}, 0, 3, 0, []int{0, 0}, []int{0, 1}, 1, 0},
	{[][3]int{{0, 1, 7}, {1, 2, 3}}, 0, 2, 3, []int{3, 3}, []int{0, 1}, 2, 5},
	{[][3]int{{1, 0, 5}, {1, 2, 4}}, 0, 2, 0, []int{0, 0}, []int{0}, 1, 0},
	{[][3]int{{0, 0, 5}, {0, 1, 2}, {1, 1, 9}, {1, 2, 4}}, 0, 2, 2, []int{0, 2, 0, 2}, []int{0}, 2, 6},
	{[][3]int{{-5, 7, 3}, {-5, 1000000000, 4}, {7, -2, 1}, {1000000000, -2, 5}}, -5, -2, 5, []int{1, 4, 1, 4}, []int{-5, 7}, 2, 9},
	{[][3]int{{0, 1, 10}}, 0, 0, 0, []int{0}, []int{0}, 0, 0},
	{[][3]int{{0, 1, 4}, {1, 2, 1}, {1, 3, 1}, {1, 4, 1}, {1, 5, 1}, {1, 6, 1}, {1, 7, 1}, {1, 8, 1}, {1, 9, 1}, {6, 10, 1}, {7, 10, 1}, {8, 10, 1}, {9, 10, 1}}, 0, 10, 4, []int{4, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1}, []int{0}, 2, 29},
	{[][3]int{{0, 5, 1}, {0, 6, 1}, {0, 7, 1}, {1, 4, 1}, {1, 5, 1}, {2, 4, 1}, {3, 5, 1}, {4, 9, 1}, {5, 9, 1}, {6, 9, 1}, {7, 9, 1}, {8, 0, 1}, {8, 1, 1}, {8, 2, 1}, {8, 3, 1}}, 8, 9, 3, []int{0, 1, 0, 1, 0, 0, 1, 1, 1, 1, 0, 1, 1, 0, 1}, []int{1, 2, 3, 4, 5, 8}, 3, 40},
	{[][3]int{{0, 2, 14}, {0, 3, 9}, {1, 0, 13}, {2, 1, 7}, {2, 3, 15}, {3, 0, 19}, {3, 1, 20}}, 0, 3, 23, []int{14, 9, 0, 0, 14, 0, 0}, []int{0}, 3, 20},
	{[][3]int{{0, 1, 14}, {0, 3, 11}, {0, 4, 13}, {0, 5, 7}, {1, 2, 8}, {1, 4, 0}, {2, 6, 2}, {3, 6, 11}, {4, 3, 7}, {4, 5, 19}, {4, 6, 10}, {5, 0, 7}, {6, 0, 17}, {6, 1, 18}, {6, 5, 6}}, 0, 6, 23, []int{2, 11, 10, 0, 2, 0, 2, 11, 0, 0, 10, 0, 0, 0, 0}, []int{0, 1, 2, 3, 4, 5}, 3, 50},
	{[][3]int{{0, 4, 19}, {0, 5, 16}, {1, 2, 6}, {3, 5, 20}, {4, 0, 1}, {4, 3, 14}, {5, 0, 12}, {5, 1, 4}}, 0, 5, 30, []int{14, 16, 0, 14, 0, 14, 0, 0}, []int{0, 4}, 3, 15},
	{[][3]int{{0, 1, 3}, {0, 2, 11}, {1, 3, 8}, {2, 1, 2}}, 0, 3, 5, []int{3, 2, 5, 2}, []int{0, 2}, 3, 17},
	{[][3]int{{0, 1, 2}, {0, 3, 13}, {0, 5, 3}, {1, 4, 10}, {1, 5, 0}, {4, 5, 11}}, 0, 5, 5, []int{2, 0, 3, 2, 0, 2}, []int{0, 3}, 3, 19},
	{[][3]int{{0, 1, 4}, {0, 2, 3}, {1, 0, 20}, {1, 2, 15}, {1, 3, 6}, {2, 1, 1}, {3, 1, 3}, {3, 2, 15}}, 0, 3, 5, []int{4, 1, 0, 0, 5, 1, 0, 0}, []int{0, 2}, 3, 19},
	{[][3]int{{0, 1, 15}, {0, 2, 20}, {0, 4, 18}, {1, 0, 3}, {1, 3, 1}, {1, 4, 13}, {2, 1, 3}, {3, 0, 18}, {3, 1, 1}, {3, 4, 17}, {4, 0, 10}}, 0, 4, 32, []int{14, 0, 18, 0, 1, 13, 0, 0, 0, 1, 0}, []int{0, 1, 2}, 4, 44},
	{[][3]int{{0, 1, 2}, {0, 2, 9}, {0, 3, 6}, {1, 2, 12}, {2, 0, 11}, {2, 3, 14}, {3, 1, 16}, {3, 2, 5}}, 0, 3, 17, []int{2, 9, 6, 2, 0, 11, 0, 0}, []int{0}, 4, 29},
	{[][3]int{{0, 1, 13}, {0, 2, 10}, {0, 3, 6}, {1, 0, 10}, {1, 2, 20}, {1, 3, 20}, {2, 0, 2}, {2, 1, 4}, {3, 1, 0}, {3, 2, 0}}, 0, 3, 23, []int{13, 4, 6, 0, 0, 17, 0, 4, 0, 0}, []int{0, 2}, 4, 31},
	{[][3]int{{0, 1, 13}, {0, 4, 8}, {1, 0, 2}, {1, 2, 11}, {1, 3, 12}, {2, 1, 3}, {3, 2, 0}, {3, 4, 7}, {4, 0, 11}, {4, 3, 10}}, 0, 4, 15, []int{7, 8, 0, 0, 7, 0, 0, 7, 0, 0}, []int{0, 1, 2, 3}, 3, 24},
	{[][3]int{{0, 2, 15}, {0, 3, 1}, {0, 4, 14}, {0, 5, 5}, {1, 2, 7}, {2, 5, 3}, {3, 2, 17}, {3, 6, 6}, {4, 1, 9}, {4, 2, 1}, {4, 3, 0}, {4, 6, 18}, {5, 1, 0}, {5, 4, 3}, {6, 0, 18}, {6, 5, 19}}, 0, 6, 18, []int{0, 1, 14, 3, 0, 0, 0, 1, 0, 0, 0, 17, 0, 3, 0, 0}, []int{0, 2, 5}, 3, 56},
	{[][3]int{{0, 1, 14}, {0, 2, 2}, {0, 3, 14}, {1, 0, 20}, {2, 0, 5}, {2, 3, 1}, {3, 1, 20}}, 0, 3, 15, []int{0, 1, 14, 0, 0, 1, 0}, []int{0, 1, 2}, 3, 17},
	{[][3]int{{0, 3, 14}, {0, 4, 2}, {1, 2, 0}, {1, 4, 14}, {2, 0, 19}, {2, 1, 15}, {2, 3, 0}, {3, 1, 12}, {3, 4, 13}, {4, 0, 5}, {4, 1, 7}, {4, 2, 5}}, 0, 4, 16, []int{14, 2, 0, 1, 0, 0, 0, 1, 13, 0, 0, 0}, []int{0}, 4, 32},
	{[][3]int{{0, 5, 18}, {0, 6, 4}, {1, 3, 20}, {1, 5, 7}, {2, 3, 0}, {2, 6, 11}, {3, 2, 20}, {5, 1, 1}, {6, 1, 17}, {6, 3, 6}}, 0, 6, 5, []int{1, 4, 1, 0, 0, 1, 1, 1, 0, 0}, []int{0, 5}, 3, 19},
	{[][3]int{{0, 1, 5}, {0, 2, 1}, {0, 3, 1}, {1, 0, 17}, {1, 2, 5}, {1, 3, 18}, {2, 1, 13}, {3, 0, 12}, {3, 1, 0}, {3, 2, 3}}, 0, 3, 7, []int{5, 1, 1, 0, 0, 6, 1, 0, 0, 0}, []int{0}, 4, 29},
	{[][3]int{{0, 1, 19}, {0, 2, 4}, {1, 2, 10}, {1, 4, 1}, {2, 4, 9}, {3, 0, 0}, {3, 1, 13}, {3, 2, 9}, {4, 0, 1}}, 0, 4, 10, []int{6, 4, 5, 1, 9, 0, 0, 0, 0}, []int{0, 1, 2}, 3, 30},
	{[][3]int{{0, 1, 6}, {0, 4, 20}, {1, 0, 11}, {1, 2, 2}, {1, 4, 18}, {2, 0, 7}, {2, 1, 14}, {2, 4, 2}, {3, 1, 17}, {4, 1, 10}}, 0, 4, 26, []int{6, 20, 0, 0, 6, 0, 0, 0, 0, 0}, []int{0}, 3, 22},
	{[][3]int{{0, 2, 17}, {0, 3, 3}, {1, 0, 16}, {2, 3, 18}, {3, 0, 3}, {3, 2, 9}}, 0, 3, 20, []int{17, 3, 0, 17, 0, 0}, []int{0}, 3, 12},
	{[][3]int{{0, 3, 6}, {0, 4, 1}, {1, 0, 20}, {2, 1, 9}, {2, 5, 6}, {3, 1, 13}, {3, 2, 13}, {3, 5, 3}, {4, 1, 7}, {5, 2, 2}}, 0, 5, 6, []int{6, 0, 0, 0, 3, 0, 3, 3, 0, 0}, []int{0, 1, 4}, 3, 34},
	{[][3]int{{0, 1, 13}, {0, 3, 10}, {1, 0, 3}, {1, 3, 9}, {2, 0, 1}, {2, 3, 7}, {3, 0, 15}}, 0, 3, 19, []int{9, 10, 0, 9, 0, 0, 0}, []int{0, 1}, 3, 13},
	{[][3]int{{0, 1, 6}, {0, 4, 2}, {1, 4, 2}, {2, 4, 14}, {3, 2, 10}, {3, 4, 12}, {4, 0, 14}, {4, 2, 1}}, 0, 4, 4, []int{2, 2, 2, 0, 0, 0, 0, 0}, []int{0, 1}, 3, 11},
	{[][3]int{{0, 2, 14}, {0, 4, 16}, {1, 2, 9}, {1, 3, 6}, {2, 4, 16}, {3, 0, 18}, {3, 2, 17}, {3, 4, 20}, {4, 1, 1}, {4, 2, 14}, {4, 3, 1}}, 0, 4, 30, []int{14, 16, 0, 0, 14, 0, 0, 0, 0, 0, 0}, []int{0}, 3, 16},
	{[][3]int{{0, 1, 6}, {0, 3, 4}, {0, 4, 10}, {1, 2, 11}, {2, 3, 3}, {3, 4, 20}, {3, 6, 17}, {5, 3, 9}, {5, 6, 6}, {6, 2, 0}, {6, 5, 19}}, 0, 6, 7, []int{3, 4, 0, 3, 3, 0, 7, 0, 0, 0, 0}, []int{0, 1, 2, 4}, 3, 34},
	{[][3]int{{0, 2, 13}, {0, 3, 8}, {1, 3, 11}, {2, 0, 17}, {2, 3, 4}, {3, 0, 16}, {3, 1, 0}, {3, 2, 12}}, 0, 3, 12, []int{4, 8, 0, 0, 4, 0, 0, 0}, []int{0, 2}, 3, 11},
	{[][3]int{{0, 1, 20}, {0, 3, 0}, {0, 4, 3}, {0, 6, 18}, {1, 7, 16}, {2, 4, 10}, {2, 6, 9}, {3, 7, 19}, {4, 5, 11}, {5, 0, 11}, {5, 7, 17}, {6, 1, 9}, {7, 4, 7}, {7, 6, 14}}, 0, 7, 19, []int{16, 0, 3, 0, 16, 0, 0, 0, 3, 0, 3, 0, 0, 0}, []int{0, 1, 6}, 3, 40},
	{[][3]int{{0, 4, 10}, {0, 7, 7}, {1, 2, 9}, {3, 0, 14}, {4, 1, 9}, {4, 3, 5}, {4, 5, 12}, {4, 7, 2}, {5, 1, 10}, {5, 2, 0}, {5, 4, 12}, {6, 0, 19}}, 0, 7, 9, []int{2, 7, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0}, []int{0, 1, 2, 3, 4, 5}, 3, 41},
	{[][3]int{{0, 1, 20}, {0, 4, 12}, {1, 2, 16}, {1, 3, 18}, {2, 1, 4}, {2, 4, 15}, {3, 0, 14}, {3, 1, 1}, {4, 0, 15}, {4, 1, 19}, {4, 3, 7}}, 0, 4, 27, []int{15, 12, 15, 0, 0, 15, 0, 0, 0, 0, 0}, []int{0, 1, 2, 3}, 3, 28},
}

func TestAgreementWithPython(t *testing.T) {
	for i, c := range pythonCases {
		r := dinicFlow(graphOf(c.edges), c.source, c.sink)
		same := r.MaxFlow == c.maxFlow && slices.Equal(r.SourceSide, c.sourceSide) && r.Phases == c.phases && r.EdgeVisits == c.edgeVisits
		for k, e := range c.edges {
			same = same && r.Flows[e[0]][e[1]] == c.flows[k]
		}
		if !same {
			t.Errorf("agreement case %d differs from Python: %+v", i, r)
		}
	}
}
