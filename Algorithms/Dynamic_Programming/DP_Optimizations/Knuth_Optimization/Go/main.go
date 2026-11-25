// Knuth's optimization: the interval DP
//
//	dp[i][j] = min over i <= k < j of dp[i][k] + dp[k+1][j] + C(i, j),   dp[i][i] = 0
//
// in O(n^2) time instead of O(n^3). When the smallest best split moves in one direction only,
// split[i][j-1] <= split[i][j] <= split[i+1][j], the cell (i, j) only tries k from
// split[i][j-1] to split[i+1][j] (k = i alone for two points). Along one diagonal the upper end
// of a cell's window is the lower end of the next cell's, so the window sizes telescope to O(n)
// per diagonal. A sufficient condition: for every a <= b <= c <= d,
//
//	quadrangle inequality:  C(a, c) + C(b, d) <= C(a, d) + C(b, c)
//	monotone on intervals:  C(b, c) <= C(a, d)
//
// SplitDP takes any cost of 0 or more (knuth false tries every k: the plain interval DP);
// MergePiles and MergePilesPlan solve Interval DP's pile merging, C(i, j) = sum(i..j); and
// OptimalBST the optimal binary search tree, C(i, j) = freq[i] + ... + freq[j-1] over the n + 1
// gaps between the keys.
//
// Tie rule: the k of a window are tried in increasing order and a cell changes only on a
// strict gain, so split[i][j] is the smallest best k, the same table as the plain DP's, and the
// merges come in the same post-order as the Python and C++ versions.
//
// Values and costs must be 0 or more, and n 0 or more (an error wrapping ErrInvalidInput).
// Costs are int64; a result above math.MaxInt64 returns an error wrapping ErrOverflow.
package main

import (
	"errors"
	"fmt"
	"math"
)

// ErrInvalidInput is wrapped by every error about the input.
var ErrInvalidInput = errors.New("invalid input")

// ErrOverflow is wrapped when a cost does not fit in an int64.
var ErrOverflow = errors.New("result does not fit in int64")

// Merge joins the pile made of piles I..K with the pile made of piles K+1..J.
type Merge struct {
	I, K, J int
}

// counters records the work done by one fill, for the tests: every split tried.
type counters struct {
	tries int
}

// tooLarge marks a cost that does not fit in an int64. Costs are never negative, so -1 is free
// to mean "more than math.MaxInt64"; it absorbs every sum and loses every minimum.
const tooLarge int64 = -1

func addCost(a, b int64) int64 {
	if a == tooLarge || b == tooLarge || a > math.MaxInt64-b {
		return tooLarge
	}
	return a + b
}

// prefixSums returns prefix[t] = values[0] + ... + values[t-1], after checking that every value
// is 0 or more. With two points or more the top cell adds the whole total, so a total that
// does not fit means an answer that does not fit.
func prefixSums(values []int64, what string) ([]int64, error) {
	for i, v := range values {
		if v < 0 {
			return nil, fmt.Errorf("%w: %s %d is %d; every %s must be 0 or more", ErrInvalidInput, what, i, v, what)
		}
	}
	prefix := make([]int64, len(values)+1)
	for t, v := range values {
		if prefix[t] > math.MaxInt64-v {
			return nil, fmt.Errorf("%w: the total of the %ss", ErrOverflow, what)
		}
		prefix[t+1] = prefix[t] + v
	}
	return prefix, nil
}

// tables holds dp[i][j] (tooLarge when it does not fit) and split[i][j] (the smallest k that
// reaches it; -1 when i == j).
type tables struct {
	dp    [][]int64
	split [][]int
}

// window returns the splits Knuth's optimization tries for dp[i][j], both ends included: k = i
// alone for two points, otherwise split[i][j-1] to split[i+1][j].
func window(split [][]int, i, j int) (int, int) {
	if j-i == 1 {
		return i, i
	}
	return split[i][j-1], split[i+1][j]
}

// trySplit is one candidate for dp[i][j]: the parts i..k and k+1..j, joined at the cost
// join = C(i, j). A strict gain keeps k, and a candidate too large to store never wins.
func (t *tables) trySplit(join int64, i, k, j int, c *counters) {
	if c != nil {
		c.tries++
	}
	cost := addCost(addCost(t.dp[i][k], t.dp[k+1][j]), join)
	if cost != tooLarge && (t.dp[i][j] == tooLarge || cost < t.dp[i][j]) {
		t.dp[i][j] = cost
		t.split[i][j] = k
	}
}

// fill computes the tables for n points by increasing length; with knuth false every k from i
// to j - 1 is tried. c may be nil.
func fill(n int, cost func(i, j int) int64, knuth bool, c *counters) (*tables, error) {
	t := &tables{dp: make([][]int64, n), split: make([][]int, n)}
	for i := range t.dp {
		t.dp[i] = make([]int64, n)
		t.split[i] = make([]int, n)
		for j := range t.split[i] {
			t.split[i][j] = -1
		}
	}
	for length := 2; length <= n; length++ {
		for i := 0; i+length-1 < n; i++ {
			j := i + length - 1
			lo, hi := i, j-1
			if knuth {
				lo, hi = window(t.split, i, j)
			}
			join := cost(i, j)
			if join < 0 {
				return nil, fmt.Errorf("%w: cost(%d, %d) is %d; every cost must be 0 or more", ErrInvalidInput, i, j, join)
			}
			t.dp[i][j] = tooLarge // no candidate yet: larger than any cost
			// If no candidate fits, the cell keeps the window's first k, so the windows that read
			// it stay in range; the answer is then too large anyway, since it is at least this cell.
			t.split[i][j] = lo
			for k := lo; k <= hi; k++ {
				t.trySplit(join, i, k, j, c)
			}
		}
	}
	return t, nil
}

func (t *tables) answer() (int64, error) {
	n := len(t.dp)
	if n == 0 {
		return 0, nil
	}
	if t.dp[0][n-1] == tooLarge {
		return 0, fmt.Errorf("%w: the minimum cost", ErrOverflow)
	}
	return t.dp[0][n-1], nil
}

func fillMerge(piles []int64, c *counters) (*tables, error) {
	prefix, err := prefixSums(piles, "pile")
	if err != nil {
		return nil, err
	}
	return fill(len(piles), func(i, j int) int64 { return prefix[j+1] - prefix[i] }, true, c)
}

// fillBst works over the n + 1 gaps between the keys: dp[i][j] is the best tree of keys
// i..j-1, and its root is split[i][j].
func fillBst(freq []int64, c *counters) (*tables, error) {
	prefix, err := prefixSums(freq, "frequency")
	if err != nil {
		return nil, err
	}
	return fill(len(freq)+1, func(i, j int) int64 { return prefix[j] - prefix[i] }, true, c)
}

// readMerges lists the merges of the split tree of i..j in post-order, with an explicit stack:
// each merge after the merges that build its two parts, the left part's first.
func readMerges(split [][]int, i, j int) []Merge {
	type item struct {
		lo, hi     int
		partsBuilt bool
	}
	merges := []Merge{}
	stack := []item{{i, j, false}}
	for len(stack) > 0 {
		it := stack[len(stack)-1]
		stack = stack[:len(stack)-1]
		if it.lo == it.hi {
			continue // a single pile is already built
		}
		k := split[it.lo][it.hi]
		if it.partsBuilt {
			merges = append(merges, Merge{it.lo, k, it.hi})
		} else {
			stack = append(stack, item{it.lo, it.hi, true}, item{k + 1, it.hi, false}, item{it.lo, k, false})
		}
	}
	return merges
}

// SplitDP returns dp[0][n-1] for dp[i][j] = min over i <= k < j of dp[i][k] + dp[k+1][j] +
// cost(i, j); 0 for n of 0 or 1. With knuth only the window is tried, which is right when the
// cost satisfies the quadrangle inequality and is monotone; without it every k is tried.
// O(n^2) with knuth, O(n^3) without; O(n^2) space.
func SplitDP(n int, cost func(i, j int) int64, knuth bool) (int64, error) {
	if n < 0 {
		return 0, fmt.Errorf("%w: n is %d; it must be 0 or more", ErrInvalidInput, n)
	}
	t, err := fill(n, cost, knuth, nil)
	if err != nil {
		return 0, err
	}
	return t.answer()
}

// MergePiles returns the minimum total cost of merging adjacent piles into one; a merge costs
// the size of the pile it makes. 0 for no piles or one pile. O(n^2) time and space.
func MergePiles(piles []int64) (int64, error) {
	t, err := fillMerge(piles, nil)
	if err != nil {
		return 0, err
	}
	return t.answer()
}

// MergePilesPlan returns the minimum cost and the merges that reach it: Merge{I, K, J} joins
// piles I..K with piles K+1..J, in post-order, with the smallest K on ties; the same as
// Interval DP's MergePilesPlan.
func MergePilesPlan(piles []int64) (int64, []Merge, error) {
	t, err := fillMerge(piles, nil)
	if err != nil {
		return 0, nil, err
	}
	cost, err := t.answer()
	if err != nil {
		return 0, nil, err
	}
	if len(piles) == 0 {
		return 0, []Merge{}, nil
	}
	return cost, readMerges(t.split, 0, len(piles)-1), nil
}

// OptimalBST returns the least total search cost sum(freq[t] * depth(t)) of a binary search
// tree on keys 0..n-1 in order, the root at depth 1. 0 for no keys. O(n^2) time and space.
func OptimalBST(freq []int64) (int64, error) {
	t, err := fillBst(freq, nil)
	if err != nil {
		return 0, err
	}
	return t.answer()
}

func main() {
	piles := []int64{3, 2, 4, 1}
	cost, _ := MergePiles(piles)
	fmt.Println("MergePiles:", cost) // 20
	_, merges, _ := MergePilesPlan(piles)
	fmt.Println("merges:", merges) // [{0 0 1} {2 2 3} {0 1 3}]
	bst, _ := OptimalBST([]int64{34, 8, 50})
	fmt.Println("OptimalBST:", bst) // 142
	// A merge that costs the square root of its size, rounded down, breaks the quadrangle
	// inequality: on these piles the window misses the best split.
	prefix := []int64{0, 1, 2, 4, 5, 11}
	rootCost := func(i, j int) int64 {
		size, root := prefix[j+1]-prefix[i], int64(0)
		for (root+1)*(root+1) <= size {
			root++
		}
		return root
	}
	narrowed, _ := SplitDP(5, rootCost, true)
	plain, _ := SplitDP(5, rootCost, false)
	fmt.Println("SplitDP:", narrowed, plain) // 8 7
}
