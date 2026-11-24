// Interval DP: the best way to handle a contiguous range i..j, built from the best ways to
// handle shorter ranges inside it.
//
// dp[i][j] answers the question for the range i..j alone, from one choice inside it (a split
// point k, or the last action taken in it) and the answers for the two shorter ranges that
// choice leaves. The table is filled by increasing length, so those answers are always ready:
// O(n^3) time and O(n^2) space. Three problems:
//
//	MergePiles:        dp[i][j] = min over i <= k < j of dp[i][k] + dp[k+1][j] + sum(i..j)
//	BurstBalloons:     dp[l][r] = max over l < k < r of dp[l][k] + v[l] * v[k] * v[r] + dp[k][r]
//	                   (k is the LAST balloon burst between l and r, which are still there)
//	MinPalindromeCuts: cuts[i][j] = 0 for a palindrome, else min over k of cuts[i][k] + 1 + cuts[k+1][j]
//
// Tie rule (MergePilesPlan): the splits k are tried in increasing order and dp[i][j] changes
// only on a strict gain, so split[i][j] is the smallest k that reaches the minimum. The merges
// come in post-order of the split tree (left part, right part, then the merge joining them),
// the same list as the Python and C++ versions.
//
// Pile sizes and balloon values must be 0 or more (an error wrapping ErrInvalidInput). Costs
// and coins are int64; a result above math.MaxInt64 returns an error wrapping ErrOverflow.
// MinPalindromeCuts compares bytes.
package main

import (
	"errors"
	"fmt"
	"math"
)

// ErrInvalidInput is wrapped by every error about the input.
var ErrInvalidInput = errors.New("invalid input")

// ErrOverflow is wrapped when a cost or a number of coins does not fit in an int64.
var ErrOverflow = errors.New("result does not fit in int64")

// Merge joins the pile made of piles I..K with the pile made of piles K+1..J.
type Merge struct {
	I, K, J int
}

// counters records the work done by one fill, for the tests: every candidate tried for a cell.
type counters struct {
	candidates int
}

// tooLarge marks a cost that does not fit in an int64. Merge costs are never negative, so -1
// is free to mean "more than math.MaxInt64"; it absorbs every sum and loses every minimum.
const tooLarge int64 = -1

func addCost(a, b int64) int64 {
	if a == tooLarge || b == tooLarge || a > math.MaxInt64-b {
		return tooLarge
	}
	return a + b
}

func checkNonNegative(values []int64, what string) error {
	for i, v := range values {
		if v < 0 {
			return fmt.Errorf("%w: %s %d is %d; every %s must be 0 or more", ErrInvalidInput, what, i, v, what)
		}
	}
	return nil
}

// mergeTables holds dp[i][j] (tooLarge when it does not fit), split[i][j] (the smallest k that
// reaches it; -1 when i == j) and prefix[t] = piles[0] + ... + piles[t-1].
type mergeTables struct {
	dp     [][]int64
	split  [][]int
	prefix []int64
}

func newTables(piles []int64) (*mergeTables, error) {
	if err := checkNonNegative(piles, "pile"); err != nil {
		return nil, err
	}
	n := len(piles)
	t := &mergeTables{dp: make([][]int64, n), split: make([][]int, n), prefix: make([]int64, n+1)}
	for i := range t.dp {
		t.dp[i] = make([]int64, n)
		t.split[i] = make([]int, n)
		for j := range t.split[i] {
			t.split[i][j] = -1
		}
	}
	for i, size := range piles {
		// The last merge costs the total, so with two piles or more a total that does not fit
		// means a cost that does not fit; one pile costs 0 whatever its size.
		if t.prefix[i] > math.MaxInt64-size {
			return nil, fmt.Errorf("%w: the total of the piles", ErrOverflow)
		}
		t.prefix[i+1] = t.prefix[i] + size
	}
	return t, nil
}

// trySplit is one candidate for dp[i][j]: the last merge joins i..k and k+1..j. A strict gain
// keeps k, and a candidate too large to store never wins.
func (t *mergeTables) trySplit(i, k, j int, c *counters) {
	if c != nil {
		c.candidates++
	}
	cost := addCost(addCost(t.dp[i][k], t.dp[k+1][j]), t.prefix[j+1]-t.prefix[i])
	if cost != tooLarge && (t.dp[i][j] == tooLarge || cost < t.dp[i][j]) {
		t.dp[i][j] = cost
		t.split[i][j] = k
	}
}

// fillMerge fills the tables bottom-up, by increasing length: i..k and k+1..j are shorter than
// i..j, so already final. c may be nil.
func fillMerge(piles []int64, c *counters) (*mergeTables, error) {
	t, err := newTables(piles)
	if err != nil {
		return nil, err
	}
	n := len(piles)
	for length := 2; length <= n; length++ {
		for i := 0; i+length-1 < n; i++ {
			j := i + length - 1
			t.dp[i][j] = tooLarge // no candidate yet: larger than any cost
			for k := i; k < j; k++ {
				t.trySplit(i, k, j, c)
			}
		}
	}
	return t, nil
}

// fillMergeMemo fills the same cells top-down, each once, when a larger range first asks for
// it. The recursion goes up to n calls deep.
func fillMergeMemo(piles []int64, c *counters) (*mergeTables, error) {
	t, err := newTables(piles)
	if err != nil {
		return nil, err
	}
	n := len(piles)
	solved := make([][]bool, n)
	for i := range solved {
		solved[i] = make([]bool, n)
		solved[i][i] = true
	}
	var solve func(i, j int)
	solve = func(i, j int) {
		if solved[i][j] {
			return
		}
		t.dp[i][j] = tooLarge
		for k := i; k < j; k++ {
			solve(i, k)
			solve(k+1, j)
			t.trySplit(i, k, j, c)
		}
		solved[i][j] = true
	}
	if n > 0 {
		solve(0, n-1)
	}
	return t, nil
}

func (t *mergeTables) answer() (int64, error) {
	n := len(t.dp)
	if n == 0 {
		return 0, nil
	}
	if t.dp[0][n-1] == tooLarge {
		return 0, fmt.Errorf("%w: the minimum cost", ErrOverflow)
	}
	return t.dp[0][n-1], nil
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

// MergePiles returns the minimum total cost of merging adjacent piles into one; a merge costs
// the size of the pile it makes. 0 for no piles or one pile. O(n^3) time, O(n^2) space.
func MergePiles(piles []int64) (int64, error) {
	t, err := fillMerge(piles, nil)
	if err != nil {
		return 0, err
	}
	return t.answer()
}

// MergePilesPlan returns the minimum cost and the merges that reach it: Merge{I, K, J} joins
// piles I..K with piles K+1..J, in post-order, with the smallest K on ties.
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

// MergePilesMemo is MergePiles computed top-down with a memo: the same cells and the same answer.
func MergePilesMemo(piles []int64) (int64, error) {
	t, err := fillMergeMemo(piles, nil)
	if err != nil {
		return 0, err
	}
	return t.answer()
}

// product3 returns a * b * c for values of 0 or more, or ErrOverflow exactly when the product
// passes math.MaxInt64. A zero factor gives 0 before any product is formed.
func product3(a, b, c int64) (int64, error) {
	if a == 0 || b == 0 || c == 0 {
		return 0, nil
	}
	if a > math.MaxInt64/b {
		return 0, fmt.Errorf("%w: the coins", ErrOverflow)
	}
	ab := a * b
	if ab > math.MaxInt64/c {
		return 0, fmt.Errorf("%w: the coins", ErrOverflow)
	}
	return ab * c, nil
}

func addCoins(a, b int64) (int64, error) {
	if a > math.MaxInt64-b {
		return 0, fmt.Errorf("%w: the coins", ErrOverflow)
	}
	return a + b, nil
}

// tryLast is one candidate for dp[left][right]: balloon k is burst last between left and
// right. Every candidate is at most the final answer, so one that does not fit means the
// answer does not either.
func tryLast(dp [][]int64, vals []int64, left, k, right int, c *counters) error {
	if c != nil {
		c.candidates++
	}
	product, err := product3(vals[left], vals[k], vals[right])
	if err != nil {
		return err
	}
	coins, err := addCoins(dp[left][k], product)
	if err != nil {
		return err
	}
	if coins, err = addCoins(coins, dp[k][right]); err != nil {
		return err
	}
	if coins > dp[left][right] {
		dp[left][right] = coins
	}
	return nil
}

func burst(nums []int64, c *counters) (int64, error) {
	if err := checkNonNegative(nums, "balloon"); err != nil {
		return 0, err
	}
	vals := append(append([]int64{1}, nums...), 1)
	m := len(vals)
	dp := make([][]int64, m)
	for i := range dp {
		dp[i] = make([]int64, m)
	}
	for gap := 2; gap < m; gap++ { // right - left: the open range holds gap - 1 balloons
		for left := 0; left+gap < m; left++ {
			right := left + gap
			for k := left + 1; k < right; k++ {
				if err := tryLast(dp, vals, left, k, right, c); err != nil {
					return 0, err
				}
			}
		}
	}
	return dp[0][m-1], nil
}

// BurstBalloons returns the most coins from bursting every balloon; bursting one earns the
// product of its value and its current neighbours' values (1 past either end).
// O(n^3) time, O(n^2) space.
func BurstBalloons(nums []int64) (int64, error) {
	return burst(nums, nil)
}

// palindromeTable reports, for every range, whether s[i..j] reads the same both ways; it is
// filled by length, in O(n^2).
func palindromeTable(s string) [][]bool {
	n := len(s)
	pal := make([][]bool, n)
	for i := range pal {
		pal[i] = make([]bool, n)
	}
	for length := 1; length <= n; length++ {
		for i := 0; i+length-1 < n; i++ {
			j := i + length - 1
			pal[i][j] = s[i] == s[j] && (length <= 2 || pal[i+1][j-1])
		}
	}
	return pal
}

func cuts(s string, c *counters) int {
	n := len(s)
	if n == 0 {
		return 0
	}
	pal := palindromeTable(s)
	dp := make([][]int, n)
	for i := range dp {
		dp[i] = make([]int, n)
	}
	for length := 2; length <= n; length++ {
		for i := 0; i+length-1 < n; i++ {
			j := i + length - 1
			if pal[i][j] {
				continue // a palindrome needs no cut
			}
			dp[i][j] = j - i // a cut between every two neighbours is always enough
			for k := i; k < j; k++ {
				if c != nil {
					c.candidates++
				}
				if candidate := dp[i][k] + 1 + dp[k+1][j]; candidate < dp[i][j] {
					dp[i][j] = candidate
				}
			}
		}
	}
	return dp[0][n-1]
}

// MinPalindromeCuts returns the fewest cuts that split s into palindromes, comparing bytes.
// O(n^3) time, O(n^2) space.
func MinPalindromeCuts(s string) int {
	return cuts(s, nil)
}

func main() {
	piles := []int64{3, 2, 4, 1}
	cost, _ := MergePiles(piles)
	fmt.Println("MergePiles:", cost) // 20
	_, merges, _ := MergePilesPlan(piles)
	fmt.Println("merges:", merges) // [{0 0 1} {2 2 3} {0 1 3}]
	memo, _ := MergePilesMemo(piles)
	fmt.Println("MergePilesMemo:", memo) // 20
	coins, _ := BurstBalloons([]int64{3, 1, 5, 8})
	fmt.Println("BurstBalloons:", coins)                        // 167
	fmt.Println("MinPalindromeCuts:", MinPalindromeCuts("aab")) // 1
}
