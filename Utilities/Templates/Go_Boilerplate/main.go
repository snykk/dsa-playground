// Go Competitive Programming Boilerplate
//
// This template provides a complete starting point for competitive programming
// with commonly used utilities and data structures.

package main

import (
	"bufio"
	"fmt"
	"math"
	"os"
	"sort"
)

// Constants
const (
	MOD  = 1_000_000_007
	MOD2 = 998244353
	INF  = 1 << 60
)

// Fast I/O
var (
	reader = bufio.NewReader(os.Stdin)
	writer = bufio.NewWriter(os.Stdout)
)

func readInt() int {
	var x int
	fmt.Fscan(reader, &x)
	return x
}

func readInt64() int64 {
	var x int64
	fmt.Fscan(reader, &x)
	return x
}

func readString() string {
	var s string
	fmt.Fscan(reader, &s)
	return s
}

func readInts(n int) []int {
	a := make([]int, n)
	for i := 0; i < n; i++ {
		fmt.Fscan(reader, &a[i])
	}
	return a
}

func println(a ...interface{}) {
	fmt.Fprintln(writer, a...)
}

func printf(format string, a ...interface{}) {
	fmt.Fprintf(writer, format, a...)
}

// Math Utilities
func gcd(a, b int64) int64 {
	for b != 0 {
		a, b = b, a%b
	}
	return a
}

func lcm(a, b int64) int64 {
	return a / gcd(a, b) * b
}

func power(base, exp, mod int64) int64 {
	result := int64(1)
	base %= mod
	for exp > 0 {
		if exp&1 == 1 {
			result = result * base % mod
		}
		base = base * base % mod
		exp >>= 1
	}
	return result
}

func modInverse(a, mod int64) int64 {
	return power(a, mod-2, mod)
}

func abs(x int) int {
	if x < 0 {
		return -x
	}
	return x
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}

func max(a, b int) int {
	if a > b {
		return a
	}
	return b
}

func minInt64(a, b int64) int64 {
	if a < b {
		return a
	}
	return b
}

func maxInt64(a, b int64) int64 {
	if a > b {
		return a
	}
	return b
}

func isPrime(n int64) bool {
	if n < 2 {
		return false
	}
	if n == 2 {
		return true
	}
	if n%2 == 0 {
		return false
	}
	for i := int64(3); i*i <= n; i += 2 {
		if n%i == 0 {
			return false
		}
	}
	return true
}

// Combinatorics
type Combinatorics struct {
	fact    []int64
	invFact []int64
	mod     int64
}

func NewCombinatorics(n int, mod int64) *Combinatorics {
	c := &Combinatorics{
		fact:    make([]int64, n+1),
		invFact: make([]int64, n+1),
		mod:     mod,
	}

	c.fact[0] = 1
	for i := 1; i <= n; i++ {
		c.fact[i] = c.fact[i-1] * int64(i) % mod
	}

	c.invFact[n] = power(c.fact[n], mod-2, mod)
	for i := n - 1; i >= 0; i-- {
		c.invFact[i] = c.invFact[i+1] * int64(i+1) % mod
	}

	return c
}

func (c *Combinatorics) NCr(n, r int) int64 {
	if r < 0 || r > n {
		return 0
	}
	return c.fact[n] * c.invFact[r] % c.mod * c.invFact[n-r] % c.mod
}

func (c *Combinatorics) NPr(n, r int) int64 {
	if r < 0 || r > n {
		return 0
	}
	return c.fact[n] * c.invFact[n-r] % c.mod
}

// DSU (Union-Find)
type DSU struct {
	parent []int
	rank   []int
	size   []int
}

func NewDSU(n int) *DSU {
	parent := make([]int, n)
	rank := make([]int, n)
	size := make([]int, n)
	for i := 0; i < n; i++ {
		parent[i] = i
		size[i] = 1
	}
	return &DSU{parent, rank, size}
}

func (d *DSU) Find(x int) int {
	if d.parent[x] != x {
		d.parent[x] = d.Find(d.parent[x])
	}
	return d.parent[x]
}

func (d *DSU) Unite(x, y int) bool {
	px, py := d.Find(x), d.Find(y)
	if px == py {
		return false
	}
	if d.rank[px] < d.rank[py] {
		px, py = py, px
	}
	d.parent[py] = px
	d.size[px] += d.size[py]
	if d.rank[px] == d.rank[py] {
		d.rank[px]++
	}
	return true
}

func (d *DSU) Connected(x, y int) bool {
	return d.Find(x) == d.Find(y)
}

func (d *DSU) GetSize(x int) int {
	return d.size[d.Find(x)]
}

// Segment Tree
type SegTree struct {
	n    int
	tree []int64
}

func NewSegTree(n int) *SegTree {
	return &SegTree{
		n:    n,
		tree: make([]int64, 4*n),
	}
}

func (st *SegTree) update(node, start, end, idx int, val int64) {
	if start == end {
		st.tree[node] = val
	} else {
		mid := (start + end) / 2
		if idx <= mid {
			st.update(2*node, start, mid, idx, val)
		} else {
			st.update(2*node+1, mid+1, end, idx, val)
		}
		st.tree[node] = st.tree[2*node] + st.tree[2*node+1]
	}
}

func (st *SegTree) query(node, start, end, l, r int) int64 {
	if r < start || end < l {
		return 0
	}
	if l <= start && end <= r {
		return st.tree[node]
	}
	mid := (start + end) / 2
	return st.query(2*node, start, mid, l, r) + st.query(2*node+1, mid+1, end, l, r)
}

func (st *SegTree) Update(idx int, val int64) {
	st.update(1, 0, st.n-1, idx, val)
}

func (st *SegTree) Query(l, r int) int64 {
	return st.query(1, 0, st.n-1, l, r)
}

// Graph Utilities
type Graph struct {
	adj [][]int
	n   int
}

func NewGraph(n int) *Graph {
	return &Graph{
		adj: make([][]int, n),
		n:   n,
	}
}

func (g *Graph) AddEdge(u, v int, directed bool) {
	g.adj[u] = append(g.adj[u], v)
	if !directed {
		g.adj[v] = append(g.adj[v], u)
	}
}

func (g *Graph) BFS(start int) []int {
	dist := make([]int, g.n)
	for i := range dist {
		dist[i] = -1
	}
	dist[start] = 0
	queue := []int{start}

	for len(queue) > 0 {
		u := queue[0]
		queue = queue[1:]
		for _, v := range g.adj[u] {
			if dist[v] == -1 {
				dist[v] = dist[u] + 1
				queue = append(queue, v)
			}
		}
	}
	return dist
}

func (g *Graph) DFS(start int) []bool {
	visited := make([]bool, g.n)
	var dfs func(u int)
	dfs = func(u int) {
		visited[u] = true
		for _, v := range g.adj[u] {
			if !visited[v] {
				dfs(v)
			}
		}
	}
	dfs(start)
	return visited
}

// Binary Search
func lowerBound(arr []int, target int) int {
	return sort.Search(len(arr), func(i int) bool {
		return arr[i] >= target
	})
}

func upperBound(arr []int, target int) int {
	return sort.Search(len(arr), func(i int) bool {
		return arr[i] > target
	})
}

// Main Solution
func solve() {
	n := readInt()
	a := readInts(n)

	// Process and output
	ans := 0
	for _, x := range a {
		ans += x
	}

	println(ans)
}

func main() {
	defer writer.Flush()

	t := 1
	// t = readInt()  // Uncomment for multiple test cases

	for i := 0; i < t; i++ {
		solve()
	}
}

// Placeholder to use imported packages
var _ = math.Abs
var _ = sort.Ints
