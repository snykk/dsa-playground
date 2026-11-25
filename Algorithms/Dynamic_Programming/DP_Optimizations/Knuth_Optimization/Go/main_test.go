package main

import (
	"errors"
	"math"
	"math/rand"
	"reflect"
	"testing"
)

// The worked example of the README, the same row as Interval DP's.
var exPiles = []int64{3, 2, 4, 1}

func prefixOf(values []int64) []int64 {
	prefix := []int64{0}
	for _, v := range values {
		prefix = append(prefix, prefix[len(prefix)-1]+v)
	}
	return prefix
}

func pileCost(piles []int64) func(i, j int) int64 {
	prefix := prefixOf(piles)
	return func(i, j int) int64 { return prefix[j+1] - prefix[i] }
}

// isqrt returns the square root of a small number, rounded down.
func isqrt(v int64) int64 {
	r := int64(0)
	for (r+1)*(r+1) <= v {
		r++
	}
	return r
}

// rootCost is the square root of the merged size, rounded down: monotone, but concave.
func rootCost(piles []int64) func(i, j int) int64 {
	prefix := prefixOf(piles)
	return func(i, j int) int64 { return isqrt(prefix[j+1] - prefix[i]) }
}

// plainTables is the plain interval DP, written out again: every k, a strict < so the smallest
// best k is kept.
func plainTables(n int, cost func(i, j int) int64) ([][]int64, [][]int) {
	dp := make([][]int64, n)
	split := make([][]int, n)
	for i := range dp {
		dp[i] = make([]int64, n)
		split[i] = make([]int, n)
		for j := range split[i] {
			split[i][j] = -1
		}
	}
	for length := 2; length <= n; length++ {
		for i := 0; i+length-1 < n; i++ {
			j := i + length - 1
			dp[i][j] = math.MaxInt64
			for k := i; k < j; k++ {
				if c := dp[i][k] + dp[k+1][j] + cost(i, j); c < dp[i][j] {
					dp[i][j], split[i][j] = c, k
				}
			}
		}
	}
	return dp, split
}

// bruteMerge tries every order of merges: merge any two neighbours, then go on with the shorter row.
func bruteMerge(piles []int64) int64 {
	if len(piles) <= 1 {
		return 0
	}
	best := int64(math.MaxInt64)
	for t := 0; t+1 < len(piles); t++ {
		next := append(append(append([]int64{}, piles[:t]...), piles[t]+piles[t+1]), piles[t+2:]...)
		if cost := piles[t] + piles[t+1] + bruteMerge(next); cost < best {
			best = cost
		}
	}
	return best
}

// bruteBst tries every binary search tree on the keys: each key in turn as the root.
func bruteBst(freq []int64, depth int64) int64 {
	if len(freq) == 0 {
		return 0
	}
	best := int64(math.MaxInt64)
	for r := range freq {
		if c := freq[r]*depth + bruteBst(freq[:r], depth+1) + bruteBst(freq[r+1:], depth+1); c < best {
			best = c
		}
	}
	return best
}

// violation returns the first (a, b, c, d) with a <= b <= c <= d < n that breaks the quadrangle
// inequality, or the monotonicity on intervals, and false when there is none.
func violation(n int, cost func(i, j int) int64, quadrangle bool) ([4]int, bool) {
	for a := 0; a < n; a++ {
		for b := a; b < n; b++ {
			for c := b; c < n; c++ {
				for d := c; d < n; d++ {
					bad := cost(b, c) > cost(a, d)
					if quadrangle {
						bad = cost(a, c)+cost(b, d) > cost(a, d)+cost(b, c)
					}
					if bad {
						return [4]int{a, b, c, d}, true
					}
				}
			}
		}
	}
	return [4]int{}, false
}

// telescoped is the number of splits the windows hold, from the final split table, one
// diagonal at a time.
func telescoped(split [][]int, n int) int {
	total := 0
	if n >= 2 {
		total = n - 1
	}
	for length := 3; length <= n; length++ {
		total += (n - length + 1) + split[n-length+1][n-1] - split[0][length-2]
	}
	return total
}

// windowBound is the most a fill can try: (3n^2 - 9n + 8) / 2 for n >= 2.
func windowBound(n int) int {
	if n < 2 {
		return 0
	}
	return (3*n*n - 9*n + 8) / 2
}

// applyMerges plays the merges out: each must join two neighbouring piles that are exactly
// I..K and K+1..J. It returns the total cost, or -1 if a merge is not possible.
func applyMerges(piles []int64, merges []Merge) int64 {
	built := make([][2]int, len(piles))
	for t := range built {
		built[t] = [2]int{t, t}
	}
	var total int64
	for _, m := range merges {
		p := -1
		for x, b := range built {
			if b == [2]int{m.I, m.K} {
				p = x
			}
		}
		if p < 0 || p+1 >= len(built) || built[p+1] != [2]int{m.K + 1, m.J} {
			return -1
		}
		built = append(append(built[:p:p], [2]int{m.I, m.J}), built[p+2:]...)
		for t := m.I; t <= m.J; t++ {
			total += piles[t]
		}
	}
	if len(piles) > 0 && len(built) != 1 {
		return -1
	}
	return total
}

func randomValues(r *rand.Rand, maxN, maxValue int) []int64 {
	v := make([]int64, r.Intn(maxN+1))
	for i := range v {
		v[i] = int64(r.Intn(maxValue + 1))
	}
	return v
}

// must returns the tables of a fill that has to succeed, and stops the test run otherwise.
func must(tb *tables, err error) *tables {
	if err != nil {
		panic(err)
	}
	return tb
}

func TestWorkedExample(t *testing.T) {
	cost, merges, err := MergePilesPlan(exPiles)
	if err != nil || cost != 20 || !reflect.DeepEqual(merges, []Merge{{0, 0, 1}, {2, 2, 3}, {0, 1, 3}}) {
		t.Fatalf("MergePilesPlan = %d %v %v", cost, merges, err)
	}
	var c counters
	tb := must(fillMerge(exPiles, &c))
	if !reflect.DeepEqual(tb.dp, [][]int64{{0, 5, 14, 20}, {0, 0, 6, 12}, {0, 0, 0, 5}, {0, 0, 0, 0}}) ||
		!reflect.DeepEqual(tb.split, [][]int{{-1, 0, 1, 1}, {-1, -1, 1, 1}, {-1, -1, -1, 2}, {-1, -1, -1, -1}}) {
		t.Fatalf("tables %v %v", tb.dp, tb.split)
	}
	if c.tries != 8 { // the plain DP tries 10: the top cell's window is k = 1 alone
		t.Fatalf("tries %d, want 8", c.tries)
	}
	if v, _ := SplitDP(4, pileCost(exPiles), true); v != 20 {
		t.Fatalf("SplitDP = %d", v)
	}
	if v, _ := OptimalBST([]int64{34, 8, 50}); v != 142 {
		t.Fatalf("OptimalBST = %d", v)
	}
	if v, _ := OptimalBST([]int64{34, 50}); v != 118 {
		t.Fatalf("OptimalBST = %d", v)
	}
	bst := must(fillBst([]int64{34, 8, 50}, nil))
	if bst.split[0][3] != 2 || bst.split[0][2] != 0 {
		t.Fatalf("roots %v", bst.split)
	}
}

func TestAgainstThePlainDP(t *testing.T) {
	r := rand.New(rand.NewSource(1000))
	sizes := []int{1, 3, 9, 100, 1000000}
	for x := 0; x < 1500; x++ {
		piles := randomValues(r, 14, sizes[x%5])
		got := must(fillMerge(piles, nil))
		dp, split := plainTables(len(piles), pileCost(piles))
		if !reflect.DeepEqual(got.dp, dp) || !reflect.DeepEqual(got.split, split) {
			t.Fatalf("%v: tables differ from the plain DP", piles)
		}
		plain, _ := SplitDP(len(piles), pileCost(piles), false)
		if want, _ := MergePiles(piles); plain != want {
			t.Fatalf("%v: SplitDP without knuth = %d, want %d", piles, plain, want)
		}
	}
	for x := 0; x < 400; x++ {
		piles := randomValues(r, 7, []int{3, 9, 50}[x%3])
		if got, _ := MergePiles(piles); got != bruteMerge(piles) {
			t.Fatalf("%v: %d, brute force %d", piles, got, bruteMerge(piles))
		}
	}
}

func TestWindow(t *testing.T) {
	r := rand.New(rand.NewSource(1100))
	for x := 0; x < 800; x++ {
		piles := randomValues(r, 12, []int{1, 5, 99}[x%3])
		n := len(piles)
		tb := must(fillMerge(piles, nil))
		for i := 0; i < n; i++ {
			for j := i + 2; j < n; j++ {
				if tb.split[i][j-1] > tb.split[i][j] || tb.split[i][j] > tb.split[i+1][j] {
					t.Fatalf("%v: split not monotone at (%d, %d)", piles, i, j)
				}
			}
		}
		// The plain DP's smallest best k lies inside the window built from the plain table.
		_, plain := plainTables(n, pileCost(piles))
		for i := 0; i < n; i++ {
			for j := i + 1; j < n; j++ {
				lo, hi := window(plain, i, j)
				if !(i <= lo && lo <= plain[i][j] && plain[i][j] <= hi && hi <= j-1) {
					t.Fatalf("%v: window [%d, %d] of (%d, %d) misses %d", piles, lo, hi, i, j, plain[i][j])
				}
			}
		}
	}
}

func TestConditions(t *testing.T) {
	r := rand.New(rand.NewSource(1200))
	for x := 0; x < 400; x++ {
		piles := randomValues(r, 9, []int{1, 9, 1000}[x%3])
		n := len(piles)
		prefix := prefixOf(piles)
		bstCost := func(i, j int) int64 { return prefix[j] - prefix[i] } // OptimalBST's, over n + 1 gaps
		for _, q := range []bool{true, false} {
			if at, bad := violation(n, pileCost(piles), q); bad {
				t.Fatalf("%v: the pile cost fails at %v", piles, at)
			}
			if at, bad := violation(n+1, bstCost, q); bad {
				t.Fatalf("%v: the key cost fails at %v", piles, at)
			}
		}
	}
	// The square root of the merged size is monotone, but breaks the inequality at (0, 1, 2, 3):
	// C(0, 2) + C(1, 3) = 2 + 2 > C(0, 3) + C(1, 2) = 2 + 1. The window then misses the best split.
	root := rootCost([]int64{1, 1, 2, 1, 6})
	if _, bad := violation(5, root, false); bad {
		t.Fatal("the square root cost should be monotone")
	}
	if at, bad := violation(5, root, true); !bad || at != [4]int{0, 1, 2, 3} {
		t.Fatalf("violation at %v %v", at, bad)
	}
	narrowed, _ := SplitDP(5, root, true)
	plain, _ := SplitDP(5, root, false)
	if narrowed != 8 || plain != 7 {
		t.Fatalf("SplitDP = %d and %d, want 8 and 7", narrowed, plain)
	}
	tb := must(fill(5, root, true, nil))
	_, ps := plainTables(5, root)
	if ps[0][4] != 3 || ps[0][3] != 1 || ps[1][4] != 2 || tb.split[0][4] != 1 {
		t.Fatalf("splits %v and %v", ps, tb.split)
	}
}

func TestPlan(t *testing.T) {
	r := rand.New(rand.NewSource(1547))
	for x := 0; x < 600; x++ {
		piles := randomValues(r, 12, []int{2, 9, 100}[x%3])
		cost, merges, err := MergePilesPlan(piles)
		want, _ := MergePiles(piles)
		if err != nil || cost != want || len(merges) != max(0, len(piles)-1) || applyMerges(piles, merges) != cost {
			t.Fatalf("%v: plan %d %v %v", piles, cost, merges, err)
		}
	}
	// The tie rule: the smallest k that reaches the minimum, in every cell, from brute force.
	for x := 0; x < 250; x++ {
		piles := randomValues(r, 6, []int{1, 2, 5}[x%3])
		tb := must(fillMerge(piles, nil))
		for i := range piles {
			for j := i + 1; j < len(piles); j++ {
				var sum int64
				for _, v := range piles[i : j+1] {
					sum += v
				}
				best := bruteMerge(piles[i : j+1])
				want := -1
				for k := i; k < j && want < 0; k++ {
					if bruteMerge(piles[i:k+1])+bruteMerge(piles[k+1:j+1])+sum == best {
						want = k
					}
				}
				if tb.split[i][j] != want {
					t.Fatalf("%v: split[%d][%d] = %d, want %d", piles, i, j, tb.split[i][j], want)
				}
			}
		}
	}
	for _, c := range []struct {
		piles  []int64
		merges []Merge
	}{
		{[]int64{1, 1, 1, 1}, []Merge{{0, 0, 1}, {2, 2, 3}, {0, 1, 3}}},
		{[]int64{1, 1, 1}, []Merge{{1, 1, 2}, {0, 0, 2}}},
		{[]int64{0, 0, 0, 0}, []Merge{{2, 2, 3}, {1, 1, 3}, {0, 0, 3}}},
	} {
		if _, merges, _ := MergePilesPlan(c.piles); !reflect.DeepEqual(merges, c.merges) {
			t.Fatalf("%v: %v, want %v", c.piles, merges, c.merges)
		}
	}
}

func TestOptimalBST(t *testing.T) {
	r := rand.New(rand.NewSource(1300))
	for x := 0; x < 400; x++ {
		freq := randomValues(r, 7, []int{1, 9, 60}[x%3])
		if got, _ := OptimalBST(freq); got != bruteBst(freq, 1) {
			t.Fatalf("%v: %d, brute force %d", freq, got, bruteBst(freq, 1))
		}
	}
	for x := 0; x < 300; x++ {
		freq := randomValues(r, 14, []int{1, 9, 1000000}[x%3])
		prefix := prefixOf(freq)
		got := must(fillBst(freq, nil))
		dp, split := plainTables(len(freq)+1, func(i, j int) int64 { return prefix[j] - prefix[i] })
		if !reflect.DeepEqual(got.dp, dp) || !reflect.DeepEqual(got.split, split) {
			t.Fatalf("%v: tables differ from the plain DP", freq)
		}
	}
	for _, c := range []struct {
		freq []int64
		want int64
	}{{[]int64{}, 0}, {[]int64{7}, 7}, {[]int64{0, 0, 0}, 0}, {[]int64{4, 9}, 17}, {[]int64{5, 5, 5, 5, 5, 5, 5}, 85}} {
		if got, err := OptimalBST(c.freq); err != nil || got != c.want {
			t.Fatalf("OptimalBST(%v) = %d %v, want %d", c.freq, got, err, c.want)
		}
	}
}

func TestEdgeCases(t *testing.T) {
	one := func(i, j int) int64 { return 1 }
	for _, n := range []int{0, 1} {
		if v, err := SplitDP(n, one, true); v != 0 || err != nil {
			t.Fatalf("SplitDP(%d) = %d %v", n, v, err)
		}
	}
	cost, merges, err := MergePilesPlan(nil)
	if cost != 0 || err != nil || merges == nil || len(merges) != 0 {
		t.Fatalf("empty: %d %v %v", cost, merges, err)
	}
	cost, merges, _ = MergePilesPlan([]int64{7})
	if cost != 0 || len(merges) != 0 {
		t.Fatalf("one pile: %d %v", cost, merges)
	}
	cost, merges, _ = MergePilesPlan([]int64{4, 9})
	if cost != 13 || !reflect.DeepEqual(merges, []Merge{{0, 0, 1}}) {
		t.Fatalf("two piles: %d %v", cost, merges)
	}
	if v, _ := SplitDP(2, func(i, j int) int64 { return 5 }, true); v != 5 {
		t.Fatalf("SplitDP(2) = %d", v)
	}
	equal := []int64{5, 5, 5, 5, 5, 5, 5, 5}
	if v, _ := MergePiles(equal); v != 120 {
		t.Fatalf("equal piles: %d", v)
	}
	if v, _ := MergePiles([]int64{0, 0, 0}); v != 0 {
		t.Fatalf("zeros: %d", v)
	}
	// cost is called once per range of two points or more, by increasing length.
	var seen [][2]int
	SplitDP(6, func(i, j int) int64 { seen = append(seen, [2]int{i, j}); return int64(j - i) }, true)
	if len(seen) != 15 {
		t.Fatalf("cost called %d times", len(seen))
	}
	for x := 1; x < len(seen); x++ {
		if seen[x-1][1]-seen[x-1][0] > seen[x][1]-seen[x][0] {
			t.Fatalf("not by length: %v", seen)
		}
	}
}

func TestInvalidInput(t *testing.T) {
	bad := []int64{3, -1, 2}
	if _, err := MergePiles(bad); !errors.Is(err, ErrInvalidInput) {
		t.Fatalf("MergePiles: %v", err)
	}
	if _, merges, err := MergePilesPlan(bad); !errors.Is(err, ErrInvalidInput) || merges != nil {
		t.Fatalf("MergePilesPlan: %v %v", merges, err)
	}
	if _, err := OptimalBST(bad); !errors.Is(err, ErrInvalidInput) {
		t.Fatalf("OptimalBST: %v", err)
	}
	if _, err := SplitDP(-1, func(i, j int) int64 { return 0 }, true); !errors.Is(err, ErrInvalidInput) {
		t.Fatalf("SplitDP(-1): %v", err)
	}
	if _, err := SplitDP(3, func(i, j int) int64 { return int64(j - i - 2) }, true); !errors.Is(err, ErrInvalidInput) {
		t.Fatalf("a negative cost: %v", err)
	}
}

func TestOverflow(t *testing.T) {
	half := int64(1) << 62
	overflows := func(name string, err error) {
		t.Helper()
		if !errors.Is(err, ErrOverflow) {
			t.Fatalf("%s: %v, want ErrOverflow", name, err)
		}
	}
	_, err := MergePiles([]int64{half, half})
	overflows("2^62 + 2^62", err)
	_, _, err = MergePilesPlan([]int64{half, half})
	overflows("plan 2^62 + 2^62", err)
	if v, err := MergePiles([]int64{half, half - 1}); v != math.MaxInt64 || err != nil {
		t.Fatalf("2^62 + 2^62 - 1: %d %v", v, err)
	}
	q := int64(1) << 61
	_, err = MergePiles([]int64{q, q, q})
	overflows("three of 2^61", err)
	// A cell inside the table does not fit (dp[0][2] = 5 * 2^61): its window stays in range,
	// and the answer, which is at least that cell, is reported.
	_, err = MergePiles([]int64{q, q, q, 0})
	overflows("three of 2^61 and 0", err)
	_, err = MergePiles([]int64{q, q, q, 0, 0, 0})
	overflows("three of 2^61 and three 0", err)
	cost, merges, err := MergePilesPlan([]int64{half, 0, 1})
	if cost != half+2 || err != nil || !reflect.DeepEqual(merges, []Merge{{1, 1, 2}, {0, 0, 2}}) {
		t.Fatalf("2^62, 0, 1: %d %v %v", cost, merges, err)
	}
	if v, err := MergePiles([]int64{math.MaxInt64}); v != 0 || err != nil {
		t.Fatalf("one huge pile: %d %v", v, err)
	}
	_, err = MergePiles([]int64{math.MaxInt64, 1})
	overflows("total", err)
	if v, err := OptimalBST([]int64{math.MaxInt64}); v != math.MaxInt64 || err != nil {
		t.Fatalf("one huge key: %d %v", v, err)
	}
	if v, err := OptimalBST([]int64{half, 1}); v != half+2 || err != nil {
		t.Fatalf("2^62, 1: %d %v", v, err)
	}
	_, err = OptimalBST([]int64{half, half})
	overflows("keys 2^62, 2^62", err)
	_, err = OptimalBST([]int64{q, q, q})
	overflows("keys of 2^61", err)
	_, err = SplitDP(3, func(i, j int) int64 { return math.MaxInt64 }, true)
	overflows("SplitDP", err)
}

func TestWorkCounts(t *testing.T) {
	r := rand.New(rand.NewSource(1400))
	for x := 0; x < 400; x++ {
		piles := randomValues(r, 25, []int{1, 9, 1000}[x%3])
		var c counters
		tb := must(fillMerge(piles, &c))
		if c.tries != telescoped(tb.split, len(piles)) || c.tries > windowBound(len(piles)) {
			t.Fatalf("%v: %d tries", piles, c.tries)
		}
	}
	for _, n := range []int{10, 20, 40, 80, 160} {
		var equal, narrowed, plain, ends counters
		ones := make([]int64, n)
		heavyEnds := make([]int64, n)
		piles := make([]int64, n)
		for i := range ones {
			ones[i], heavyEnds[i], piles[i] = 1, 1, int64(r.Intn(1000001))
		}
		heavyEnds[0], heavyEnds[n-1] = 1000, 1000
		e := must(fillMerge(ones, &equal))
		if equal.tries != (n-1)*(n-1) || equal.tries != telescoped(e.split, n) {
			t.Fatalf("n = %d, equal piles: %d tries", n, equal.tries)
		}
		tb := must(fillMerge(piles, &narrowed))
		if narrowed.tries != telescoped(tb.split, n) || narrowed.tries > windowBound(n) {
			t.Fatalf("n = %d, random piles: %d tries", n, narrowed.tries)
		}
		must(fill(n, pileCost(piles), false, &plain))
		if plain.tries != (n*n*n-n)/6 {
			t.Fatalf("n = %d, plain: %d tries", n, plain.tries)
		}
		must(fillMerge(heavyEnds, &ends))
		if ends.tries != windowBound(n) { // the bound is reached
			t.Fatalf("n = %d, heavy ends: %d tries", n, ends.tries)
		}
	}
	// A fill that does not narrow tries (n^3 - n) / 6 splits, which is not the telescoped sum.
	for n := 4; n < 30; n++ {
		piles := make([]int64, n)
		for i := range piles {
			piles[i] = int64(i + 1)
		}
		var c counters
		tb := must(fill(n, pileCost(piles), false, &c))
		if c.tries == telescoped(tb.split, n) {
			t.Fatalf("n = %d: the plain fill matches the telescoped sum", n)
		}
	}
}

// Outputs computed by running the Python implementation (knuth_optimization.py): fixed cases
// first, then seeded random ones. merge_piles_plan's cost and merges with the number of splits
// tried, optimal_bst with the number of splits tried, and split_dp with the square root of the
// merged size as the cost, with the window and with every split.
type pythonMerge struct {
	piles  []int64
	cost   int64
	merges []Merge
	tries  int
}

type pythonBst struct {
	freq  []int64
	cost  int64
	tries int
}

type pythonRoot struct {
	piles           []int64
	narrowed, plain int64
}

var pythonMerges = []pythonMerge{
	{[]int64{3, 2, 4, 1}, 20, []Merge{{0, 0, 1}, {2, 2, 3}, {0, 1, 3}}, 8},
	{[]int64{}, 0, []Merge{}, 0},
	{[]int64{7}, 0, []Merge{}, 0},
	{[]int64{4, 9}, 13, []Merge{{0, 0, 1}}, 1},
	{[]int64{1, 1, 1}, 5, []Merge{{1, 1, 2}, {0, 0, 2}}, 4},
	{[]int64{1, 1, 1, 1}, 8, []Merge{{0, 0, 1}, {2, 2, 3}, {0, 1, 3}}, 9},
	{[]int64{2, 2, 2, 2, 2}, 24, []Merge{{0, 0, 1}, {3, 3, 4}, {2, 2, 4}, {0, 1, 4}}, 16},
	{[]int64{0, 0, 0, 0}, 0, []Merge{{2, 2, 3}, {1, 1, 3}, {0, 0, 3}}, 9},
	{[]int64{1, 2, 3}, 9, []Merge{{0, 0, 1}, {0, 1, 2}}, 4},
	{[]int64{3, 2, 1}, 9, []Merge{{1, 1, 2}, {0, 0, 2}}, 4},
	{[]int64{3, 2, 2, 3}, 20, []Merge{{0, 0, 1}, {2, 2, 3}, {0, 1, 3}}, 10},
	{[]int64{5, 1, 4, 2, 8, 3, 7, 6}, 106, []Merge{{1, 1, 2}, {1, 2, 3}, {0, 0, 3}, {0, 3, 4}, {5, 5, 6}, {5, 6, 7}, {0, 4, 7}}, 48},
	{[]int64{1000, 1, 1, 1, 1, 1, 1, 1000}, 3028, []Merge{{1, 1, 2}, {3, 3, 4}, {5, 5, 6}, {3, 4, 6}, {1, 2, 6}, {1, 6, 7}, {0, 0, 7}}, 64},
	{[]int64{4611686018427387904, 4611686018427387903}, 9223372036854775807, []Merge{{0, 0, 1}}, 1},
	{[]int64{4611686018427387904, 0, 1}, 4611686018427387906, []Merge{{1, 1, 2}, {0, 0, 2}}, 4},
	{[]int64{1000000000000000, 1000000000000000, 1000000000000000, 1000000000000000, 1000000000000000, 1000000000000000, 1000000000000000, 1000000000000000}, 24000000000000000, []Merge{{0, 0, 1}, {2, 2, 3}, {0, 1, 3}, {4, 4, 5}, {6, 6, 7}, {4, 5, 7}, {0, 3, 7}}, 49},
	{[]int64{57, 0}, 57, []Merge{{0, 0, 1}}, 1},
	{[]int64{190379, 801913, 1, 883708, 2, 81, 0, 92, 9, 0}, 4554742, []Merge{{1, 1, 2}, {0, 0, 2}, {5, 5, 6}, {4, 4, 6}, {8, 8, 9}, {7, 7, 9}, {4, 6, 9}, {3, 3, 9}, {0, 2, 9}}, 75},
	{[]int64{699440, 99, 5, 89, 96, 2}, 700406, []Merge{{2, 2, 3}, {4, 4, 5}, {2, 3, 5}, {1, 1, 5}, {0, 0, 5}}, 26},
	{[]int64{410627, 126436, 157898, 6, 208080, 51897, 4}, 2253395, []Merge{{2, 2, 3}, {1, 1, 3}, {5, 5, 6}, {4, 4, 6}, {1, 3, 6}, {0, 0, 6}}, 40},
	{[]int64{0, 2, 935940, 9, 72, 208123, 618599, 3, 0}, 4352388, []Merge{{0, 0, 1}, {0, 1, 2}, {3, 3, 4}, {3, 4, 5}, {7, 7, 8}, {6, 6, 8}, {3, 5, 8}, {0, 2, 8}}, 57},
	{[]int64{14, 65, 34}, 192, []Merge{{0, 0, 1}, {0, 1, 2}}, 4},
	{[]int64{804888, 0, 5, 472920, 788577, 0, 2, 3}, 4589421, []Merge{{1, 1, 2}, {1, 2, 3}, {5, 5, 6}, {5, 6, 7}, {4, 4, 7}, {1, 3, 7}, {0, 0, 7}}, 53},
	{[]int64{74, 13, 1, 3, 0, 72, 2, 0, 2}, 364, []Merge{{3, 3, 4}, {2, 2, 4}, {1, 1, 4}, {0, 0, 4}, {7, 7, 8}, {6, 6, 8}, {5, 5, 8}, {0, 4, 8}}, 72},
	{[]int64{573603, 0, 2, 24, 76, 73, 42, 0, 7}, 574359, []Merge{{1, 1, 2}, {1, 2, 3}, {1, 3, 4}, {7, 7, 8}, {6, 6, 8}, {5, 5, 8}, {1, 4, 8}, {0, 0, 8}}, 70},
	{[]int64{3, 92, 588159, 679997, 886030, 514710, 779205, 335403}, 10538406, []Merge{{0, 0, 1}, {0, 1, 2}, {0, 2, 3}, {0, 3, 4}, {6, 6, 7}, {5, 5, 7}, {0, 4, 7}}, 43},
	{[]int64{2, 2, 90, 0, 72, 1, 949401, 6, 8, 539952, 44}, 3519546, []Merge{{0, 0, 1}, {0, 1, 2}, {3, 3, 4}, {3, 4, 5}, {0, 2, 5}, {0, 5, 6}, {7, 7, 8}, {7, 8, 9}, {7, 9, 10}, {0, 6, 10}}, 91},
	{[]int64{3, 7, 40, 2, 610237, 7, 775455, 972924, 56, 5, 1, 16832}, 5988744, []Merge{{0, 0, 1}, {2, 2, 3}, {0, 1, 3}, {4, 4, 5}, {0, 3, 5}, {0, 5, 6}, {9, 9, 10}, {8, 8, 10}, {8, 10, 11}, {7, 7, 11}, {0, 6, 11}}, 102},
	{[]int64{9, 61, 10}, 150, []Merge{{0, 0, 1}, {0, 1, 2}}, 4},
	{[]int64{0, 2, 60, 43, 2, 1, 88, 4}, 513, []Merge{{0, 0, 1}, {0, 1, 2}, {4, 4, 5}, {3, 3, 5}, {0, 2, 5}, {6, 6, 7}, {0, 5, 7}}, 49},
	{[]int64{3, 938956, 2, 691962, 1, 730295, 220451, 881157, 2}, 11080450, []Merge{{0, 0, 1}, {3, 3, 4}, {2, 2, 4}, {0, 1, 4}, {5, 5, 6}, {7, 7, 8}, {5, 6, 8}, {0, 4, 8}}, 64},
	{[]int64{3, 24, 0, 5}, 64, []Merge{{0, 0, 1}, {2, 2, 3}, {0, 1, 3}}, 9},
	{[]int64{64, 1, 844998, 781538, 64, 1, 73, 66, 55}, 3254368, []Merge{{0, 0, 1}, {0, 1, 2}, {4, 4, 5}, {4, 5, 6}, {7, 7, 8}, {4, 6, 8}, {3, 3, 8}, {0, 2, 8}}, 57},
	{[]int64{2, 0, 64, 0}, 132, []Merge{{0, 0, 1}, {2, 2, 3}, {0, 1, 3}}, 8},
	{[]int64{7, 1, 27, 911935, 379588}, 2203571, []Merge{{0, 0, 1}, {0, 1, 2}, {0, 2, 3}, {0, 3, 4}}, 16},
	{[]int64{0, 12}, 12, []Merge{{0, 0, 1}}, 1},
	{[]int64{97, 2, 2, 12, 227503, 59, 3, 150106, 231772, 2, 688877}, 2895530, []Merge{{1, 1, 2}, {1, 2, 3}, {0, 0, 3}, {0, 3, 4}, {5, 5, 6}, {5, 6, 7}, {0, 4, 7}, {8, 8, 9}, {0, 7, 9}, {0, 9, 10}}, 109},
	{[]int64{46, 0, 907195, 7, 97, 1, 16, 830911, 3, 7, 949867, 297802}, 8541406, []Merge{{0, 0, 1}, {0, 1, 2}, {3, 3, 4}, {5, 5, 6}, {3, 4, 6}, {8, 8, 9}, {7, 7, 9}, {3, 6, 9}, {0, 2, 9}, {10, 10, 11}, {0, 9, 11}}, 136},
	{[]int64{372684, 121258, 1, 15, 572992}, 1682198, []Merge{{2, 2, 3}, {1, 1, 3}, {0, 0, 3}, {0, 3, 4}}, 19},
	{[]int64{70, 937689, 97, 99, 1, 319857, 711170, 7, 5, 1}, 4969545, []Merge{{0, 0, 1}, {3, 3, 4}, {2, 2, 4}, {2, 4, 5}, {8, 8, 9}, {7, 7, 9}, {6, 6, 9}, {2, 5, 9}, {0, 1, 9}}, 80},
}

var pythonBsts = []pythonBst{
	{[]int64{34, 8, 50}, 142, 10},
	{[]int64{34, 50}, 118, 4},
	{[]int64{}, 0, 0},
	{[]int64{7}, 7, 1},
	{[]int64{4, 9}, 17, 4},
	{[]int64{0, 0, 0}, 0, 9},
	{[]int64{5, 5, 5, 5, 5, 5, 5}, 85, 49},
	{[]int64{4611686018427387904, 1}, 4611686018427387906, 4},
	{[]int64{9223372036854775807}, 9223372036854775807, 1},
	{[]int64{1, 2, 3, 4, 5}, 30, 25},
	{[]int64{30, 101, 444}, 736, 9},
	{[]int64{226, 128, 521, 21, 1, 21, 313, 0, 621, 407}, 4801, 114},
	{[]int64{0}, 0, 1},
	{[]int64{860}, 860, 1},
	{[]int64{43, 3, 930, 19, 452, 106}, 2304, 32},
	{[]int64{310, 39, 34, 0}, 490, 16},
	{[]int64{15}, 15, 1},
	{[]int64{25, 95, 2, 521, 349, 19, 24, 3}, 1650, 54},
	{[]int64{31, 7, 852, 37, 50, 663}, 2559, 34},
	{[]int64{1, 203, 4, 364, 0}, 785, 23},
}

var pythonRoots = []pythonRoot{
	{[]int64{1, 1, 2, 1, 6}, 8, 7},
	{[]int64{11, 5, 8, 11, 15, 17}, 25, 25},
	{[]int64{18, 20, 9, 6, 15, 17, 8, 4, 17}, 45, 45},
	{[]int64{12, 7, 15, 6, 16, 5}, 25, 25},
	{[]int64{8, 7, 15, 0}, 11, 11},
	{[]int64{18, 10, 11, 18, 16, 11}, 30, 30},
	{[]int64{7, 19, 1, 4, 18, 15, 15, 10, 14, 19}, 52, 51},
	{[]int64{8, 7, 9, 11, 14, 11, 16, 18, 14}, 46, 45},
	{[]int64{9, 1, 9, 19, 18, 17, 8, 16, 19, 9}, 54, 53},
	{[]int64{6, 7, 7, 16, 9, 18, 13, 4, 9}, 42, 41},
	{[]int64{0, 8, 17, 9, 5, 9, 5, 16, 12, 10}, 44, 43},
	{[]int64{3, 17, 18, 15, 14, 8, 16, 6}, 40, 39},
	{[]int64{7, 18, 14, 6, 20, 7, 1, 8, 6}, 40, 39},
	{[]int64{6, 6, 18, 14, 17, 2, 19, 20}, 41, 40},
	{[]int64{7, 20, 9, 20, 0, 10, 8, 10, 17, 20}, 54, 53},
	{[]int64{4, 8, 15, 7, 0, 1, 19, 1, 6, 14}, 36, 35},
}

func TestAgreementWithPython(t *testing.T) {
	for i, c := range pythonMerges {
		var cnt counters
		must(fillMerge(c.piles, &cnt))
		cost, merges, err := MergePilesPlan(c.piles)
		single, _ := MergePiles(c.piles)
		if err != nil || cost != c.cost || single != c.cost || !reflect.DeepEqual(merges, c.merges) || cnt.tries != c.tries {
			t.Errorf("merge case %d %v: %d %v %d tries, Python %d %v %d", i, c.piles, cost, merges, cnt.tries, c.cost, c.merges, c.tries)
		}
	}
	for i, c := range pythonBsts {
		var cnt counters
		must(fillBst(c.freq, &cnt))
		if got, err := OptimalBST(c.freq); err != nil || got != c.cost || cnt.tries != c.tries {
			t.Errorf("bst case %d %v: %d (%d tries), Python %d (%d tries)", i, c.freq, got, cnt.tries, c.cost, c.tries)
		}
	}
	for i, c := range pythonRoots {
		narrowed, _ := SplitDP(len(c.piles), rootCost(c.piles), true)
		plain, _ := SplitDP(len(c.piles), rootCost(c.piles), false)
		if narrowed != c.narrowed || plain != c.plain {
			t.Errorf("root case %d %v: %d and %d, Python %d and %d", i, c.piles, narrowed, plain, c.narrowed, c.plain)
		}
	}
}
