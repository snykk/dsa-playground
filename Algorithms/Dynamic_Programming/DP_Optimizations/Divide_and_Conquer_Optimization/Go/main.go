// Divide and Conquer Optimization: a layered DP
//
//	dp[g][i] = min over j < i of dp[g - 1][j] + C(j, i)
//
// computed in O(n log n) per layer instead of O(n^2), when the best j, opt(g, i), never moves
// left as i grows: opt(g, i) <= opt(g, i + 1).
//
// The example problem: split values (each >= 0) into exactly k contiguous, non-empty groups so
// that the sum over the groups of (sum of the group)^2 is as small as possible. C(j, i) =
// (P[i] - P[j])^2 is the cost of the group values[j:i], read in O(1) from the prefix sums.
//
// One layer: solve the middle cell mid of [lo, hi] by trying every j in
// [optLo, min(optHi, mid - 1)], then the left half with j up to opt(mid) and the right half with
// j from opt(mid). O(m log m) cost evaluations for a layer of m cells, O(k n log n) in all,
// against O(k n^2) for the plain DP (MinCostPartitionPlain).
//
// It is correct when C satisfies the quadrangle inequality C(a, c) + C(b, d) <= C(a, d) + C(b, c)
// for a <= b <= c <= d. For the square of the sum the difference of the two sides is
// -2 (P[b] - P[a]) (P[d] - P[c]), which is <= 0 when every value is >= 0; with a negative value
// PartitionDP(..., true) can return a worse split than PartitionDP(..., false), so the two
// concrete functions reject negative values.
//
// Tie rule: opt(g, i) is the smallest j that reaches the minimum, in both versions, as in the
// Python and C++ code.
//
// k < 1, k > n (groups are not empty) and a negative value return an error wrapping
// ErrInvalidInput. Values and costs are int64: MinCostPartition first checks that the total is
// at most 3037000499, whose square is the largest that fits; every number the DP forms is at
// most the square of the total, so nothing can overflow after that check. A larger total
// returns an error wrapping ErrOverflow. PartitionDP checks every sum it forms.
package main

import (
	"errors"
	"fmt"
	"math"
)

// ErrInvalidInput is wrapped by every error about the input.
var ErrInvalidInput = errors.New("invalid input")

// ErrOverflow is wrapped when a total or a sum of costs does not fit in an int64.
var ErrOverflow = errors.New("result does not fit in int64")

// maxTotal is the largest total whose square fits: 3037000499^2 <= MaxInt64 < 3037000500^2.
const maxTotal = 3037000499

// Partition is the best total and its groups: group g is values[Bounds[g]:Bounds[g+1]].
type Partition struct {
	Cost   int64
	Bounds []int
}

func checkK(n, k int) error {
	if k < 1 {
		return fmt.Errorf("%w: k must be at least 1, got %d", ErrInvalidInput, k)
	}
	if k > n {
		return fmt.Errorf("%w: cannot split %d values into %d non-empty groups", ErrInvalidInput, n, k)
	}
	return nil
}

// addChecked returns a + b, or ErrOverflow.
func addChecked(a, b int64) (int64, error) {
	if (b > 0 && a > math.MaxInt64-b) || (b < 0 && a < math.MinInt64-b) {
		return 0, fmt.Errorf("%w: a sum of costs", ErrOverflow)
	}
	return a + b, nil
}

// prefixSums returns P[i] = values[0] + ... + values[i-1]. Every value must be >= 0, and the
// total at most maxTotal.
func prefixSums(values []int64) ([]int64, error) {
	for t, v := range values {
		if v < 0 {
			return nil, fmt.Errorf("%w: values[%d] = %d; every value must be >= 0", ErrInvalidInput, t, v)
		}
	}
	prefix := make([]int64, len(values)+1)
	for t, v := range values {
		if v > maxTotal-prefix[t] {
			return nil, fmt.Errorf("%w: the total passes %d, so its square does not fit", ErrOverflow, maxTotal)
		}
		prefix[t+1] = prefix[t] + v
	}
	return prefix, nil
}

// bestSplit returns min over j in [jLo, jHi] of prev[j] + cost(j, i), and the smallest j that
// reaches it.
func bestSplit(prev []int64, cost func(j, i int) int64, i, jLo, jHi int) (int64, int, error) {
	best, err := addChecked(prev[jLo], cost(jLo, i))
	if err != nil {
		return 0, 0, err
	}
	bestJ := jLo
	for j := jLo + 1; j <= jHi; j++ {
		candidate, err := addChecked(prev[j], cost(j, i))
		if err != nil {
			return 0, 0, err
		}
		if candidate < best {
			best, bestJ = candidate, j
		}
	}
	return best, bestJ, nil
}

// solveRange fills cur[i] and optRow[i] for every i in [lo, hi] of layer g, given opt in
// [optLo, optHi].
func solveRange(prev, cur []int64, optRow []int, cost func(j, i int) int64, g, lo, hi, optLo, optHi int) error {
	if lo > hi {
		return nil
	}
	mid := lo + (hi-lo)/2
	// j < mid keeps the group non-empty; j >= g - 1 leaves g - 1 values for g - 1 groups.
	best, bestJ, err := bestSplit(prev, cost, mid, max(optLo, g-1), min(optHi, mid-1))
	if err != nil {
		return err
	}
	cur[mid], optRow[mid] = best, bestJ
	if err := solveRange(prev, cur, optRow, cost, g, lo, mid-1, optLo, bestJ); err != nil { // left: j <= opt(mid)
		return err
	}
	return solveRange(prev, cur, optRow, cost, g, mid+1, hi, bestJ, optHi) // right: j >= opt(mid)
}

// PartitionDP splits positions 0..n-1 into k non-empty contiguous groups, minimizing the sum of
// cost(j, i) over the groups [j, i). optimized = true uses the divide-and-conquer recursion
// (correct when the smallest best j is monotone in i); false is the plain O(k n^2) DP, correct
// for any cost.
func PartitionDP(n, k int, cost func(j, i int) int64, optimized bool) (Partition, error) {
	if err := checkK(n, k); err != nil {
		return Partition{}, err
	}
	opt := make([][]int, k+1)
	for g := range opt {
		opt[g] = make([]int, n+1)
	}
	prev := make([]int64, n+1)
	for i := 1; i <= n; i++ {
		prev[i] = cost(0, i) // layer 1: one group
	}
	for g := 2; g <= k; g++ {
		cur := make([]int64, n+1)
		if optimized {
			if err := solveRange(prev, cur, opt[g], cost, g, g, n, g-1, n-1); err != nil {
				return Partition{}, err
			}
		} else {
			for i := g; i <= n; i++ {
				best, bestJ, err := bestSplit(prev, cost, i, g-1, i-1)
				if err != nil {
					return Partition{}, err
				}
				cur[i], opt[g][i] = best, bestJ
			}
		}
		prev = cur
	}
	bounds := make([]int, k+1)
	bounds[k] = n
	for g := k; g > 1; g-- {
		bounds[g-1] = opt[g][bounds[g]]
	}
	return Partition{Cost: prev[n], Bounds: bounds}, nil
}

func squareOfSum(values []int64, k int, optimized bool) (Partition, error) {
	if err := checkK(len(values), k); err != nil {
		return Partition{}, err
	}
	prefix, err := prefixSums(values)
	if err != nil {
		return Partition{}, err
	}
	cost := func(j, i int) int64 {
		s := prefix[i] - prefix[j]
		return s * s
	}
	return PartitionDP(len(values), k, cost, optimized)
}

// MinCostPartition returns the smallest sum of (group sum)^2 over k contiguous non-empty groups,
// and the groups, with the divide-and-conquer optimization. O(k n log n) time, O(k n) space.
func MinCostPartition(values []int64, k int) (Partition, error) {
	return squareOfSum(values, k, true)
}

// MinCostPartitionPlain returns the same answer and bounds from the plain DP. O(k n^2) time.
func MinCostPartitionPlain(values []int64, k int) (Partition, error) {
	return squareOfSum(values, k, false)
}

func main() {
	values := []int64{3, 1, 4, 1, 5, 9, 2, 6}
	best, _ := MinCostPartition(values, 3)
	fmt.Println("cost:", best.Cost)     // 341
	fmt.Println("bounds:", best.Bounds) // [0 4 6 8]
	plain, _ := MinCostPartitionPlain(values, 3)
	fmt.Println("plain DP:", plain.Cost) // 341
	// A negative value breaks the quadrangle inequality, and the recursion misses the best split.
	prefix := []int64{0, 1, 3, 7, 2} // values 1, 2, 4, -5
	square := func(j, i int) int64 { return (prefix[i] - prefix[j]) * (prefix[i] - prefix[j]) }
	fast, _ := PartitionDP(4, 2, square, true)
	slow, _ := PartitionDP(4, 2, square, false)
	fmt.Println("optimized:", fast.Cost, fast.Bounds) // 10 [0 2 4]: wrong
	fmt.Println("plain:", slow.Cost, slow.Bounds)     // 2 [0 1 4]
}
