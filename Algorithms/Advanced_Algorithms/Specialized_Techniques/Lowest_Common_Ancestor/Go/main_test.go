package main

// Tests for the lowest common ancestor: binary lifting and the Euler tour with a sparse table.
// The tables of the 10-node tree are the ones the Python implementation computes; both types
// are also checked against a naive LCA (walk up one parent at a time) on every labelled tree
// with up to 6 nodes and on random trees with a fixed seed.

import (
	"errors"
	"math/rand"
	"reflect"
	"testing"
)

var edges10 = [][2]int{{0, 1}, {0, 2}, {1, 3}, {1, 4}, {2, 5}, {3, 6}, {3, 7}, {5, 8}, {6, 9}}

// naive holds parents and depths from a breadth-first walk and walks up one parent at a time.
type naive struct {
	parent, depth []int
}

func newNaive(n int, edges [][2]int, root int) *naive {
	adj := make([][]int, n)
	for _, e := range edges {
		adj[e[0]] = append(adj[e[0]], e[1])
		adj[e[1]] = append(adj[e[1]], e[0])
	}
	t := &naive{parent: make([]int, n), depth: make([]int, n)}
	for i := range t.parent {
		t.parent[i] = -1
	}
	seen := make([]bool, n)
	seen[root] = true
	order := []int{root}
	for i := 0; i < len(order); i++ {
		for _, v := range adj[order[i]] {
			if !seen[v] {
				seen[v] = true
				t.parent[v] = order[i]
				t.depth[v] = t.depth[order[i]] + 1
				order = append(order, v)
			}
		}
	}
	return t
}

func (t *naive) lca(u, v int) int {
	for t.depth[u] > t.depth[v] {
		u = t.parent[u]
	}
	for t.depth[v] > t.depth[u] {
		v = t.parent[v]
	}
	for u != v {
		u, v = t.parent[u], t.parent[v]
	}
	return u
}

func (t *naive) kthAncestor(v, k int) int {
	for i := 0; i < k && v != -1; i++ {
		v = t.parent[v]
	}
	return v
}

func (t *naive) distance(u, v int) int {
	return t.depth[u] + t.depth[v] - 2*t.depth[t.lca(u, v)]
}

func mustBuild(t *testing.T, n int, edges [][2]int, root int) (*BinaryLifting, *EulerTour) {
	t.Helper()
	lifting, err := NewBinaryLifting(n, edges, root)
	if err != nil {
		t.Fatalf("NewBinaryLifting(%d, %v, %d): %v", n, edges, root, err)
	}
	tour, err := NewEulerTour(n, edges, root)
	if err != nil {
		t.Fatalf("NewEulerTour(%d, %v, %d): %v", n, edges, root, err)
	}
	return lifting, tour
}

func randomTree(rng *rand.Rand, n int) [][2]int {
	label := rng.Perm(n)
	edges := make([][2]int, 0, n)
	for v := 1; v < n; v++ {
		u := rng.Intn(v)
		if rng.Float64() >= 0.6 {
			u = max(0, v-1-rng.Intn(2))
		}
		if rng.Intn(2) == 0 {
			edges = append(edges, [2]int{label[u], label[v]})
		} else {
			edges = append(edges, [2]int{label[v], label[u]})
		}
	}
	rng.Shuffle(len(edges), func(i, j int) { edges[i], edges[j] = edges[j], edges[i] })
	return edges
}

// pruferTree decodes a Pruefer sequence into the edges of a labelled tree on n >= 3 nodes.
func pruferTree(n int, seq []int) [][2]int {
	degree := make([]int, n)
	for i := range degree {
		degree[i] = 1
	}
	for _, x := range seq {
		degree[x]++
	}
	var edges [][2]int
	for _, x := range seq {
		leaf := 0
		for degree[leaf] != 1 {
			leaf++
		}
		edges = append(edges, [2]int{leaf, x})
		degree[leaf]--
		degree[x]--
	}
	var last []int
	for i := 0; i < n; i++ {
		if degree[i] == 1 {
			last = append(last, i)
		}
	}
	return append(edges, [2]int{last[0], last[1]})
}

func checkAgainstNaive(t *testing.T, n int, edges [][2]int, root int, pairs [][2]int, kth [][2]int) {
	t.Helper()
	ref := newNaive(n, edges, root)
	lifting, tour := mustBuild(t, n, edges, root)
	if !reflect.DeepEqual(lifting.Depth(), ref.depth) || !reflect.DeepEqual(lifting.Parent(), ref.parent) {
		t.Fatalf("%v root %d: depth %v parent %v, naive %v %v", edges, root, lifting.Depth(), lifting.Parent(), ref.depth, ref.parent)
	}
	if len(tour.Euler()) != 2*n-1 {
		t.Fatalf("%v root %d: tour of %d entries", edges, root, len(tour.Euler()))
	}
	for _, p := range pairs {
		u, v := p[0], p[1]
		want := ref.lca(u, v)
		if got := lifting.LCA(u, v); got != want {
			t.Fatalf("%v root %d: lifting LCA(%d, %d) = %d, naive %d", edges, root, u, v, got, want)
		}
		if got := tour.LCA(u, v); got != want {
			t.Fatalf("%v root %d: Euler LCA(%d, %d) = %d, naive %d", edges, root, u, v, got, want)
		}
		if lifting.Distance(u, v) != ref.distance(u, v) || tour.Distance(u, v) != ref.distance(u, v) {
			t.Fatalf("%v root %d: Distance(%d, %d) differs from %d", edges, root, u, v, ref.distance(u, v))
		}
	}
	for _, q := range kth {
		if got, want := lifting.KthAncestor(q[0], q[1]), ref.kthAncestor(q[0], q[1]); got != want {
			t.Fatalf("%v root %d: KthAncestor(%d, %d) = %d, naive %d", edges, root, q[0], q[1], got, want)
		}
	}
}

func TestDemoTables(t *testing.T) {
	lifting, tour := mustBuild(t, 10, edges10, 0)
	if want := []int{0, 1, 1, 2, 2, 2, 3, 3, 3, 4}; !reflect.DeepEqual(lifting.Depth(), want) {
		t.Errorf("depth %v, want %v", lifting.Depth(), want)
	}
	if lifting.Levels() != 4 {
		t.Errorf("levels %d, want 4", lifting.Levels())
	}
	zeros := make([]int, 10)
	up := [][]int{{0, 0, 0, 1, 1, 2, 3, 3, 5, 6}, {0, 0, 0, 0, 0, 0, 1, 1, 2, 3}, zeros, zeros}
	if !reflect.DeepEqual(lifting.Up(), up) {
		t.Errorf("up %v, want %v", lifting.Up(), up)
	}
	if want := []int{0, 1, 3, 6, 9, 6, 3, 7, 3, 1, 4, 1, 0, 2, 5, 8, 5, 2, 0}; !reflect.DeepEqual(tour.Euler(), want) {
		t.Errorf("euler %v, want %v", tour.Euler(), want)
	}
	if want := []int{0, 1, 13, 2, 10, 14, 3, 7, 15, 4}; !reflect.DeepEqual(tour.First(), want) {
		t.Errorf("first %v, want %v", tour.First(), want)
	}
	sparse := [][]int{
		{0, 1, 3, 6, 9, 6, 3, 7, 3, 1, 4, 1, 0, 2, 5, 8, 5, 2, 0},
		{0, 1, 3, 6, 6, 3, 3, 3, 1, 1, 1, 0, 0, 2, 5, 5, 2, 0},
		{0, 1, 3, 3, 3, 3, 1, 1, 1, 0, 0, 0, 0, 2, 2, 0},
		{0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0},
		{0, 0, 0, 0},
	}
	if !reflect.DeepEqual(tour.Sparse(), sparse) {
		t.Errorf("sparse %v, want %v", tour.Sparse(), sparse)
	}
}

func TestDemoQueries(t *testing.T) {
	lifting, tour := mustBuild(t, 10, edges10, 0)
	for _, c := range [][4]int{{9, 4, 1, 4}, {9, 8, 0, 7}, {7, 9, 3, 3}, {6, 7, 3, 2}, {8, 5, 5, 1}} {
		u, v, want, dist := c[0], c[1], c[2], c[3]
		if lifting.LCA(u, v) != want || lifting.LCA(v, u) != want || tour.LCA(u, v) != want || tour.LCA(v, u) != want {
			t.Errorf("LCA(%d, %d): want %d", u, v, want)
		}
		if lifting.Distance(u, v) != dist || tour.Distance(u, v) != dist {
			t.Errorf("Distance(%d, %d): want %d", u, v, dist)
		}
	}
	for k, want := range []int{9, 6, 3, 1, 0, -1, -1} {
		if got := lifting.KthAncestor(9, k); got != want {
			t.Errorf("KthAncestor(9, %d) = %d, want %d", k, got, want)
		}
	}
	if lifting.KthAncestor(8, 2) != 2 || lifting.KthAncestor(0, 1) != -1 || lifting.KthAncestor(4, 1_000_000_000) != -1 {
		t.Errorf("KthAncestor on the demo tree")
	}
	for v := 0; v < 10; v++ {
		if lifting.LCA(v, v) != v || tour.LCA(v, v) != v || lifting.LCA(0, v) != 0 || tour.LCA(0, v) != 0 {
			t.Errorf("LCA(%d, %d) or LCA(0, %d)", v, v, v)
		}
	}
	// u is an ancestor of v, in both argument orders
	if lifting.LCA(1, 9) != 1 || tour.LCA(9, 1) != 1 || lifting.LCA(2, 8) != 2 || tour.LCA(2, 8) != 2 {
		t.Errorf("an ancestor is its own LCA with a descendant")
	}
}

func TestAnotherRoot(t *testing.T) {
	lifting, tour := mustBuild(t, 10, edges10, 4)
	if want := []int{4, 1, 0, 2, 5, 8, 5, 2, 0, 1, 3, 6, 9, 6, 3, 7, 3, 1, 4}; !reflect.DeepEqual(tour.Euler(), want) {
		t.Errorf("euler %v, want %v", tour.Euler(), want)
	}
	if lifting.LCA(9, 8) != 1 || tour.LCA(9, 8) != 1 || lifting.LCA(0, 3) != 1 || tour.LCA(0, 3) != 1 {
		t.Errorf("LCA with root 4")
	}
	if lifting.Distance(9, 8) != 7 || tour.Distance(9, 8) != 7 {
		t.Errorf("the distance does not depend on the root")
	}
}

func TestEveryTreeUpToSixNodes(t *testing.T) {
	trees := 0
	for n := 1; n <= 6; n++ {
		var all [][][2]int
		switch n {
		case 1:
			all = append(all, nil)
		case 2:
			all = append(all, [][2]int{{0, 1}})
		default:
			seq := make([]int, n-2)
			for {
				all = append(all, pruferTree(n, seq))
				i := 0
				for i < n-2 {
					seq[i]++
					if seq[i] < n {
						break
					}
					seq[i] = 0
					i++
				}
				if i == n-2 {
					break
				}
			}
		}
		var pairs, kth [][2]int
		for u := 0; u < n; u++ {
			for v := 0; v < n; v++ {
				pairs = append(pairs, [2]int{u, v})
			}
			for k := 0; k <= n; k++ {
				kth = append(kth, [2]int{u, k})
			}
		}
		for _, edges := range all {
			trees++
			for root := 0; root < n; root++ {
				checkAgainstNaive(t, n, edges, root, pairs, kth)
			}
		}
	}
	if trees != 1+1+3+16+125+1296 {
		t.Errorf("%d trees", trees)
	}
}

func TestRandomTrees(t *testing.T) {
	rng := rand.New(rand.NewSource(2026))
	for i := 0; i < 300; i++ {
		n := 1 + rng.Intn(120)
		edges := randomTree(rng, n)
		var pairs, kth [][2]int
		for q := 0; q < 40; q++ {
			pairs = append(pairs, [2]int{rng.Intn(n), rng.Intn(n)})
		}
		for q := 0; q < 20; q++ {
			kth = append(kth, [2]int{rng.Intn(n), rng.Intn(n + 2)})
		}
		checkAgainstNaive(t, n, edges, rng.Intn(n), pairs, kth)
	}
}

func TestSingleNodeAndTwoNodes(t *testing.T) {
	lifting, tour := mustBuild(t, 1, nil, 0)
	if !reflect.DeepEqual(lifting.Up(), [][]int{{0}}) || !reflect.DeepEqual(tour.Euler(), []int{0}) || !reflect.DeepEqual(tour.Sparse(), [][]int{{0}}) {
		t.Errorf("tables of one node: %v %v %v", lifting.Up(), tour.Euler(), tour.Sparse())
	}
	if lifting.LCA(0, 0) != 0 || tour.LCA(0, 0) != 0 || lifting.Distance(0, 0) != 0 || tour.Distance(0, 0) != 0 {
		t.Errorf("queries on one node")
	}
	if lifting.KthAncestor(0, 0) != 0 || lifting.KthAncestor(0, 1) != -1 {
		t.Errorf("KthAncestor on one node")
	}
	for root := 0; root < 2; root++ {
		l2, t2 := mustBuild(t, 2, [][2]int{{0, 1}}, root)
		if !reflect.DeepEqual(t2.Euler(), []int{root, 1 - root, root}) || l2.LCA(0, 1) != root || t2.LCA(1, 0) != root || l2.KthAncestor(1-root, 1) != root {
			t.Errorf("two nodes rooted at %d", root)
		}
	}
}

func TestStar(t *testing.T) {
	const n = 50
	var edges [][2]int
	for i := 1; i < n; i++ {
		edges = append(edges, [2]int{0, i})
	}
	var pairs [][2]int
	for u := 0; u < n; u++ {
		for v := 0; v < n; v++ {
			pairs = append(pairs, [2]int{u, v})
		}
	}
	for _, root := range []int{0, 17} {
		checkAgainstNaive(t, n, edges, root, pairs, nil)
	}
	_, tour := mustBuild(t, n, edges, 0)
	if !reflect.DeepEqual(tour.Euler()[:5], []int{0, 1, 0, 2, 0}) {
		t.Errorf("star tour starts %v", tour.Euler()[:5])
	}
}

func TestPathOf100000NodesDoesNotRecurse(t *testing.T) {
	const n = 100_000
	edges := make([][2]int, 0, n-1)
	for i := 0; i+1 < n; i++ {
		edges = append(edges, [2]int{i, i + 1})
	}
	lifting, tour := mustBuild(t, n, edges, 0)
	if lifting.Depth()[n-1] != n-1 || len(tour.Euler()) != 2*n-1 {
		t.Fatalf("depth or tour length of the path")
	}
	for _, c := range [][3]int{{n - 1, 0, 0}, {n - 1, 54_321, 54_321}, {77_777, 12_345, 12_345}} {
		if lifting.LCA(c[0], c[1]) != c[2] || tour.LCA(c[0], c[1]) != c[2] {
			t.Errorf("LCA(%d, %d), want %d", c[0], c[1], c[2])
		}
	}
	if lifting.Distance(n-1, 0) != n-1 || tour.Distance(n-1, 0) != n-1 {
		t.Errorf("Distance along the path")
	}
	if lifting.KthAncestor(n-1, n-1) != 0 || lifting.KthAncestor(n-1, 65_537) != n-1-65_537 || lifting.KthAncestor(n-1, n) != -1 {
		t.Errorf("KthAncestor along the path")
	}
	middle, middleTour := mustBuild(t, n, edges, n/2)
	if middle.LCA(0, n-1) != n/2 || middleTour.LCA(0, n-1) != n/2 || middleTour.LCA(10, 20) != 20 {
		t.Errorf("LCA on the path rooted in the middle")
	}
}

func TestInvalidInput(t *testing.T) {
	cases := []struct {
		name  string
		n     int
		edges [][2]int
		root  int
	}{
		{"no nodes", 0, nil, 0},
		{"root past the end", 3, [][2]int{{0, 1}, {1, 2}}, 3},
		{"negative root", 3, [][2]int{{0, 1}, {1, 2}}, -1},
		{"endpoint past the end", 3, [][2]int{{0, 1}, {1, 3}}, 0},
		{"negative endpoint", 3, [][2]int{{0, 1}, {-1, 2}}, 0},
		{"forest with too few edges", 4, [][2]int{{0, 1}, {2, 3}}, 0},
		{"cycle with n edges", 3, [][2]int{{0, 1}, {1, 2}, {2, 0}}, 0},
		{"triangle and a lone node", 4, [][2]int{{0, 1}, {1, 2}, {2, 0}}, 0},
		{"the same edge twice", 3, [][2]int{{0, 1}, {0, 1}}, 0},
		{"a loop", 3, [][2]int{{0, 1}, {2, 2}}, 0},
		{"the root sees only itself", 4, [][2]int{{1, 2}, {2, 3}, {3, 1}}, 0},
	}
	for _, c := range cases {
		if _, err := NewBinaryLifting(c.n, c.edges, c.root); !errors.Is(err, ErrNotATree) {
			t.Errorf("%s: NewBinaryLifting error %v", c.name, err)
		}
		if _, err := NewEulerTour(c.n, c.edges, c.root); !errors.Is(err, ErrNotATree) {
			t.Errorf("%s: NewEulerTour error %v", c.name, err)
		}
	}
}

func mustPanic(t *testing.T, what string, f func()) {
	t.Helper()
	defer func() {
		if recover() == nil {
			t.Errorf("%s did not panic", what)
		}
	}()
	f()
}

func TestQueriesOutsideTheTreePanic(t *testing.T) {
	lifting, tour := mustBuild(t, 3, [][2]int{{0, 1}, {1, 2}}, 0)
	for _, p := range [][2]int{{3, 0}, {0, 3}, {-1, 0}, {0, -1}} {
		u, v := p[0], p[1]
		mustPanic(t, "lifting LCA", func() { lifting.LCA(u, v) })
		mustPanic(t, "Euler LCA", func() { tour.LCA(u, v) })
		mustPanic(t, "lifting Distance", func() { lifting.Distance(u, v) })
		mustPanic(t, "Euler Distance", func() { tour.Distance(u, v) })
	}
	mustPanic(t, "KthAncestor(3, 0)", func() { lifting.KthAncestor(3, 0) })
	mustPanic(t, "KthAncestor(-1, 0)", func() { lifting.KthAncestor(-1, 0) })
	mustPanic(t, "KthAncestor(2, -1)", func() { lifting.KthAncestor(2, -1) })
}
