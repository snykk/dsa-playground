// Unbounded Knapsack: the best total value within a capacity when every item may be taken any
// number of times.
//
// Item i weighs weights[i] (at least 1) and is worth values[i]. One row dp[0..W] holds, for
// every capacity w, the best value of a multiset of items whose total weight is at most w. For
// each item in input order, w runs UP from the item's weight to W:
//
//	dp[w] = max(dp[w], dp[w - weight] + value)
//
// Going up, dp[w - weight] has already been updated for this item, so taking it again is
// allowed. Running w DOWN (ZeroOneKnapsack) reads the value from before this item instead, so
// each item is used at most once: the 0/1 knapsack. The loop direction is the only difference.
//
// Tie rule: dp[w] and choice[w] change only on a strict gain and the items are tried in input
// order, so choice[w] is the first item i such that items 0..i already reach the best value
// for w. The multiset read back from choice[] is the one the Python and C++ versions return.
//
// A weight below 1, a negative capacity or target, and weights and values of different
// lengths return an error wrapping ErrInvalidInput. Values and counts are int64; a result
// above math.MaxInt64 returns an error wrapping ErrOverflow.
package main

import (
	"errors"
	"fmt"
	"math"
)

// ErrInvalidInput is wrapped by every error about the input.
var ErrInvalidInput = errors.New("invalid input")

// ErrOverflow is wrapped when a best value or a number of ways does not fit in an int64.
var ErrOverflow = errors.New("result does not fit in int64")

// counters records the work done by one fill, for the tests.
type counters struct {
	relaxations int
}

func checkWeights(weights []int) error {
	for i, w := range weights {
		if w < 1 {
			return fmt.Errorf("%w: item %d has weight %d; every weight must be at least 1", ErrInvalidInput, i, w)
		}
	}
	return nil
}

func checkItems(weights []int, values []int64, capacity int) error {
	if len(weights) != len(values) {
		return fmt.Errorf("%w: %d weights but %d values", ErrInvalidInput, len(weights), len(values))
	}
	if capacity < 0 {
		return fmt.Errorf("%w: capacity must be >= 0, got %d", ErrInvalidInput, capacity)
	}
	return checkWeights(weights)
}

// addValue returns best + value, or ErrOverflow. best >= 0, so only a positive value can overflow.
func addValue(best, value int64) (int64, error) {
	if value > 0 && best > math.MaxInt64-value {
		return 0, fmt.Errorf("%w: the best value", ErrOverflow)
	}
	return best + value, nil
}

// fillRow builds the one-row table, w going up (each item reusable) or down (each item at most
// once), and choice[w], the item that last raised dp[w] (-1: none). c may be nil.
func fillRow(weights []int, values []int64, capacity int, upward bool, c *counters) ([]int64, []int, error) {
	if err := checkItems(weights, values, capacity); err != nil {
		return nil, nil, err
	}
	dp := make([]int64, capacity+1)
	choice := make([]int, capacity+1)
	for w := range choice {
		choice[w] = -1
	}
	for i, weight := range weights {
		// dp[w] = max(dp[w], dp[w - weight] + value); a strict gain makes item i the choice.
		relax := func(w int) error {
			if c != nil {
				c.relaxations++
			}
			candidate, err := addValue(dp[w-weight], values[i])
			if err != nil {
				return err
			}
			if candidate > dp[w] {
				dp[w] = candidate
				choice[w] = i
			}
			return nil
		}
		if upward {
			for w := weight; w <= capacity; w++ { // dp[w - weight] may already hold item i
				if err := relax(w); err != nil {
					return nil, nil, err
				}
			}
		} else {
			for w := capacity; w >= weight; w-- { // dp[w - weight] is still the old value
				if err := relax(w); err != nil {
					return nil, nil, err
				}
			}
		}
	}
	return dp, choice, nil
}

// UnboundedKnapsack returns the best total value of items that fit in capacity, each item
// usable any number of times. O(n * W) time, O(W) space.
func UnboundedKnapsack(weights []int, values []int64, capacity int) (int64, error) {
	dp, _, err := fillRow(weights, values, capacity, true, nil)
	if err != nil {
		return 0, err
	}
	return dp[capacity], nil
}

// ZeroOneKnapsack runs the same one-row loop with w going down: each item at most once.
func ZeroOneKnapsack(weights []int, values []int64, capacity int) (int64, error) {
	dp, _, err := fillRow(weights, values, capacity, false, nil)
	if err != nil {
		return 0, err
	}
	return dp[capacity], nil
}

// UnboundedKnapsackItems returns the best value and one optimal multiset, counts[i] copies of
// item i, read back from choice[] starting at w = capacity. The counts reach the value, and
// their total weight is at most the capacity.
func UnboundedKnapsackItems(weights []int, values []int64, capacity int) (int64, []int, error) {
	dp, choice, err := fillRow(weights, values, capacity, true, nil)
	if err != nil {
		return 0, nil, err
	}
	counts := make([]int, len(weights))
	for w := capacity; choice[w] != -1; w -= weights[choice[w]] {
		counts[choice[w]]++
	}
	return dp[capacity], counts, nil
}

// UnboundedKnapsackTable returns the 2D form: table[i][w] is the best value within w using only
// the first i items, and table[i][w] = max(table[i-1][w], table[i][w - weight] + value) reads
// row i itself.
func UnboundedKnapsackTable(weights []int, values []int64, capacity int) ([][]int64, error) {
	if err := checkItems(weights, values, capacity); err != nil {
		return nil, err
	}
	table := make([][]int64, len(weights)+1)
	for i := range table {
		table[i] = make([]int64, capacity+1)
	}
	for i := 1; i <= len(weights); i++ {
		weight := weights[i-1]
		for w := 0; w <= capacity; w++ {
			table[i][w] = table[i-1][w]
			if weight <= w {
				candidate, err := addValue(table[i][w-weight], values[i-1])
				if err != nil {
					return nil, err
				}
				if candidate > table[i][w] {
					table[i][w] = candidate
				}
			}
		}
	}
	return table, nil
}

// addCount returns a + b for counts, where -1 stands for "more than math.MaxInt64".
func addCount(a, b int64) int64 {
	if a < 0 || b < 0 || a > math.MaxInt64-b {
		return -1
	}
	return a + b
}

func checkCount(weights []int, target int) error {
	if target < 0 {
		return fmt.Errorf("%w: target must be >= 0, got %d", ErrInvalidInput, target)
	}
	return checkWeights(weights)
}

func finalCount(ways int64) (int64, error) {
	if ways < 0 {
		return 0, fmt.Errorf("%w: the number of ways", ErrOverflow)
	}
	return ways, nil
}

// CountCombinations returns the number of multisets of items (told apart by position) whose
// weights add up to exactly target: the items are the outer loop, so each is counted once.
func CountCombinations(weights []int, target int) (int64, error) {
	if err := checkCount(weights, target); err != nil {
		return 0, err
	}
	ways := make([]int64, target+1)
	ways[0] = 1
	for _, weight := range weights {
		for t := weight; t <= target; t++ {
			ways[t] = addCount(ways[t], ways[t-weight])
		}
	}
	return finalCount(ways[target])
}

// CountPermutations returns the number of sequences of items whose weights add up to exactly
// target: the totals are the outer loop and every possible last item is added.
func CountPermutations(weights []int, target int) (int64, error) {
	if err := checkCount(weights, target); err != nil {
		return 0, err
	}
	ways := make([]int64, target+1)
	ways[0] = 1
	for t := 1; t <= target; t++ {
		for _, weight := range weights {
			if weight <= t {
				ways[t] = addCount(ways[t], ways[t-weight])
			}
		}
	}
	return finalCount(ways[target])
}

func main() {
	// The items of the 0/1 Knapsack topic, with capacity 10.
	weights, values := []int{1, 3, 4, 5}, []int64{1, 4, 5, 7}
	best, _ := UnboundedKnapsack(weights, values, 10)
	_, counts, _ := UnboundedKnapsackItems(weights, values, 10)
	once, _ := ZeroOneKnapsack(weights, values, 10)
	fmt.Println("unbounded:", best)      // 14
	fmt.Println("items:", counts)        // [0 0 0 2]
	fmt.Println("each item once:", once) // 13
	comb, _ := CountCombinations([]int{1, 2, 5}, 5)
	perm, _ := CountPermutations([]int{1, 2, 5}, 5)
	fmt.Println("combinations:", comb) // 4
	fmt.Println("permutations:", perm) // 9
}
