package main

import (
	"errors"
	"math/rand"
	"reflect"
	"testing"
)

// The items of the 0/1 Knapsack topic: (weight, value) = (1, 1), (3, 4), (4, 5), (5, 7).
var (
	exWeights = []int{1, 3, 4, 5}
	exValues  = []int64{1, 4, 5, 7}
)

// bruteUnbounded tries every multiset that fits: up to capacity / weight copies of each item.
func bruteUnbounded(w []int, v []int64, capacity int) int64 {
	if len(w) == 0 {
		return 0
	}
	var best int64
	for k := 0; k*w[0] <= capacity; k++ {
		if got := int64(k)*v[0] + bruteUnbounded(w[1:], v[1:], capacity-k*w[0]); got > best {
			best = got
		}
	}
	return best
}

// bruteZeroOne tries every subset that fits.
func bruteZeroOne(w []int, v []int64, capacity int) int64 {
	var best int64
	for mask := 0; mask < 1<<len(w); mask++ {
		weight, value := 0, int64(0)
		for i := range w {
			if mask>>i&1 == 1 {
				weight += w[i]
				value += v[i]
			}
		}
		if weight <= capacity && value > best {
			best = value
		}
	}
	return best
}

func bruteCombinations(w []int, target int) int64 {
	if len(w) == 0 {
		if target == 0 {
			return 1
		}
		return 0
	}
	var ways int64
	for k := 0; k*w[0] <= target; k++ {
		ways += bruteCombinations(w[1:], target-k*w[0])
	}
	return ways
}

func brutePermutations(w []int, target int) int64 {
	if target == 0 {
		return 1
	}
	var ways int64
	for _, x := range w {
		if x <= target {
			ways += brutePermutations(w, target-x)
		}
	}
	return ways
}

func randomItems(rng *rand.Rand, maxItems, maxWeight, maxValue, maxCapacity int) ([]int, []int64, int) {
	n := rng.Intn(maxItems + 1)
	w := make([]int, n)
	v := make([]int64, n)
	for i := range w {
		w[i] = 1 + rng.Intn(maxWeight)
		v[i] = int64(rng.Intn(maxValue + 1))
	}
	return w, v, rng.Intn(maxCapacity + 1)
}

func mustValue(t *testing.T, got int64, err error, want int64) {
	t.Helper()
	if err != nil || got != want {
		t.Fatalf("got %d, %v; want %d", got, err, want)
	}
}

func mustItems(t *testing.T, w []int, v []int64, capacity int, wantValue int64, wantCounts []int) {
	t.Helper()
	value, counts, err := UnboundedKnapsackItems(w, v, capacity)
	if err != nil || value != wantValue || !reflect.DeepEqual(counts, wantCounts) {
		t.Fatalf("UnboundedKnapsackItems(%v, %v, %d) = %d, %v, %v; want %d, %v", w, v, capacity, value, counts, err, wantValue, wantCounts)
	}
}

func TestWorkedExample(t *testing.T) {
	got, err := UnboundedKnapsack(exWeights, exValues, 10)
	mustValue(t, got, err, 14)
	mustItems(t, exWeights, exValues, 10, 14, []int{0, 0, 0, 2}) // item 3 (weight 5) twice
	got, err = ZeroOneKnapsack(exWeights, exValues, 10)
	mustValue(t, got, err, 13)
	got, err = ZeroOneKnapsack(exWeights, exValues, 7)
	mustValue(t, got, err, 9)
	mustItems(t, exWeights, exValues, 7, 9, []int{1, 2, 0, 0})
	dp, choice, err := fillRow(exWeights, exValues, 10, true, nil)
	if err != nil || !reflect.DeepEqual(dp, []int64{0, 1, 2, 4, 5, 7, 8, 9, 11, 12, 14}) || !reflect.DeepEqual(choice, []int{-1, 0, 0, 1, 1, 3, 1, 1, 3, 1, 3}) {
		t.Fatalf("fillRow = %v, %v, %v", dp, choice, err)
	}
	table, err := UnboundedKnapsackTable(exWeights, exValues, 10)
	want := [][]int64{
		{0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0},
		{0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10},
		{0, 1, 2, 4, 5, 6, 8, 9, 10, 12, 13},
		{0, 1, 2, 4, 5, 6, 8, 9, 10, 12, 13},
		{0, 1, 2, 4, 5, 7, 8, 9, 11, 12, 14},
	}
	if err != nil || !reflect.DeepEqual(table, want) {
		t.Fatalf("UnboundedKnapsackTable = %v, %v", table, err)
	}
}

func TestLoopDirection(t *testing.T) {
	up, _ := UnboundedKnapsack([]int{2}, []int64{3}, 4)
	down, _ := ZeroOneKnapsack([]int{2}, []int64{3}, 4)
	if up != 6 || down != 3 {
		t.Fatalf("one item (2, 3) in capacity 4: up %d, down %d; want 6 and 3", up, down)
	}
	rng := rand.New(rand.NewSource(20261124))
	for i := 0; i < 600; i++ {
		w, v, c := randomItems(rng, 4, 8, 20, 20)
		got, err := UnboundedKnapsack(w, v, c)
		if want := bruteUnbounded(w, v, c); err != nil || got != want {
			t.Fatalf("UnboundedKnapsack(%v, %v, %d) = %d, %v; brute force %d", w, v, c, got, err, want)
		}
	}
	for i := 0; i < 600; i++ {
		w, v, c := randomItems(rng, 7, 10, 30, 25)
		once, err := ZeroOneKnapsack(w, v, c)
		if want := bruteZeroOne(w, v, c); err != nil || once != want {
			t.Fatalf("ZeroOneKnapsack(%v, %v, %d) = %d, %v; brute force %d", w, v, c, once, err, want)
		}
		if up, _ := UnboundedKnapsack(w, v, c); once > up {
			t.Fatalf("going down (%d) beat going up (%d)", once, up)
		}
	}
}

func TestReconstruction(t *testing.T) {
	rng := rand.New(rand.NewSource(1449))
	for i := 0; i < 800; i++ {
		w, v, c := randomItems(rng, 6, 12, 50, 40)
		value, counts, err := UnboundedKnapsackItems(w, v, c)
		best, _ := UnboundedKnapsack(w, v, c)
		if err != nil || value != best || len(counts) != len(w) {
			t.Fatalf("UnboundedKnapsackItems(%v, %v, %d) = %d, %v, %v", w, v, c, value, counts, err)
		}
		weight, total := 0, int64(0)
		for j, k := range counts {
			if k < 0 {
				t.Fatalf("negative count %v", counts)
			}
			weight += k * w[j]
			total += int64(k) * v[j]
		}
		if total != value || weight > c {
			t.Fatalf("counts %v reach %d (want %d) with weight %d (capacity %d)", counts, total, value, weight, c)
		}
	}
	// Ties: the first item, in input order, that reaches the best value.
	mustItems(t, []int{3, 3}, []int64{4, 4}, 9, 12, []int{3, 0})
	mustItems(t, []int{2, 4, 2}, []int64{3, 6, 3}, 8, 12, []int{4, 0, 0})
	mustItems(t, []int{2, 4}, []int64{3, 6}, 4, 6, []int{2, 0})
	mustItems(t, []int{4, 2}, []int64{6, 3}, 4, 6, []int{1, 0})
	mustItems(t, exWeights, exValues, 6, 8, []int{0, 2, 0, 0})
	mustItems(t, []int{3}, []int64{5}, 7, 10, []int{2}) // weight 6 of capacity 7
}

func TestTable(t *testing.T) {
	rng := rand.New(rand.NewSource(474))
	for i := 0; i < 300; i++ {
		w, v, c := randomItems(rng, 6, 10, 40, 30)
		table, err := UnboundedKnapsackTable(w, v, c)
		if err != nil || len(table) != len(w)+1 {
			t.Fatalf("UnboundedKnapsackTable(%v, %v, %d): %d rows, %v", w, v, c, len(table), err)
		}
		for k := 0; k <= len(w); k++ {
			// The one row after the first k items is row k of the table.
			row, _, _ := fillRow(w[:k], v[:k], c, true, nil)
			if !reflect.DeepEqual(table[k], row) {
				t.Fatalf("row %d: table %v, one row %v", k, table[k], row)
			}
		}
	}
}

func TestEdgeCases(t *testing.T) {
	got, err := UnboundedKnapsack(exWeights, exValues, 0)
	mustValue(t, got, err, 0)
	mustItems(t, exWeights, exValues, 0, 0, []int{0, 0, 0, 0})
	if table, _ := UnboundedKnapsackTable(exWeights, exValues, 0); !reflect.DeepEqual(table, [][]int64{{0}, {0}, {0}, {0}, {0}}) {
		t.Fatalf("capacity 0 table %v", table)
	}
	got, err = UnboundedKnapsack(nil, nil, 10)
	mustValue(t, got, err, 0)
	got, err = ZeroOneKnapsack(nil, nil, 10)
	mustValue(t, got, err, 0)
	mustItems(t, []int{}, []int64{}, 10, 0, []int{})
	if table, _ := UnboundedKnapsackTable(nil, nil, 3); !reflect.DeepEqual(table, [][]int64{{0, 0, 0, 0}}) {
		t.Fatalf("no items table %v", table)
	}
	mustItems(t, []int{8, 9}, []int64{100, 200}, 7, 0, []int{0, 0})
	mustItems(t, []int{8, 2}, []int64{100, 1}, 7, 3, []int{0, 3})
	mustItems(t, []int{3}, []int64{5}, 2, 0, []int{0})
	mustItems(t, []int{1}, []int64{5}, 6, 30, []int{6})
	// Values of 0 or less are never taken.
	mustItems(t, []int{1, 2}, []int64{0, -3}, 5, 0, []int{0, 0})
	mustItems(t, []int{1, 2}, []int64{-1, 3}, 5, 6, []int{0, 2})
	got, err = ZeroOneKnapsack([]int{1, 2}, []int64{-1, 3}, 5)
	mustValue(t, got, err, 3)
	mustItems(t, []int{7, 10}, []int64{9, 13}, 100000, 130000, []int{0, 10000})
	// Counts.
	for _, c := range []struct {
		w          []int
		target     int
		comb, perm int64
	}{
		{nil, 0, 1, 1},
		{nil, 5, 0, 0},
		{[]int{2, 4}, 7, 0, 0},
		{[]int{2, 2}, 4, 3, 4}, // duplicates are different items
		{[]int{9}, 4, 0, 0},
		{[]int{1, 2, 5}, 5, 4, 9},
	} {
		comb, err1 := CountCombinations(c.w, c.target)
		perm, err2 := CountPermutations(c.w, c.target)
		if err1 != nil || err2 != nil || comb != c.comb || perm != c.perm {
			t.Fatalf("counts(%v, %d) = %d, %d; want %d, %d", c.w, c.target, comb, perm, c.comb, c.perm)
		}
	}
}

func TestInvalidInput(t *testing.T) {
	invalid := func(name string, err error) {
		t.Helper()
		if !errors.Is(err, ErrInvalidInput) {
			t.Errorf("%s: got %v, want an error wrapping ErrInvalidInput", name, err)
		}
	}
	// Weight 0 with a positive value could be taken without end: every function rejects it.
	_, err := UnboundedKnapsack([]int{0}, []int64{5}, 4)
	invalid("weight 0", err)
	_, _, err = UnboundedKnapsackItems([]int{2, 0}, []int64{3, 0}, 4)
	invalid("weight 0, items", err)
	_, err = UnboundedKnapsackTable([]int{1, -2}, []int64{1, 1}, 4)
	invalid("negative weight, table", err)
	_, err = ZeroOneKnapsack([]int{0}, []int64{5}, 4)
	invalid("weight 0, going down", err)
	_, err = CountCombinations([]int{1, 0}, 3)
	invalid("weight 0, combinations", err)
	_, err = CountPermutations([]int{1, 0}, 3)
	invalid("weight 0, permutations", err)
	_, err = UnboundedKnapsack([]int{1, 2}, []int64{3}, 4)
	invalid("lengths differ", err)
	_, _, err = UnboundedKnapsackItems([]int{1}, []int64{3}, -1)
	invalid("negative capacity, items", err)
	_, err = UnboundedKnapsackTable([]int{1}, []int64{3}, -1)
	invalid("negative capacity, table", err)
	_, err = ZeroOneKnapsack([]int{1}, []int64{3}, -1)
	invalid("negative capacity, going down", err)
	_, err = CountCombinations([]int{1, 2}, -1)
	invalid("negative target, combinations", err)
	_, err = CountPermutations([]int{1, 2}, -1)
	invalid("negative target, permutations", err)
}

func TestOverflow(t *testing.T) {
	overflow := func(name string, err error) {
		t.Helper()
		if !errors.Is(err, ErrOverflow) {
			t.Errorf("%s: got %v, want an error wrapping ErrOverflow", name, err)
		}
	}
	const half = int64(1) << 62
	got, err := UnboundedKnapsack([]int{1}, []int64{half}, 1)
	mustValue(t, got, err, half)
	_, err = UnboundedKnapsack([]int{1}, []int64{half}, 2) // 2^63 does not fit
	overflow("two copies of 2^62", err)
	_, _, err = UnboundedKnapsackItems([]int{1}, []int64{half}, 2)
	overflow("items", err)
	_, err = UnboundedKnapsackTable([]int{1}, []int64{half}, 2)
	overflow("table", err)
	got, err = ZeroOneKnapsack([]int{1}, []int64{half}, 2) // once: it fits
	mustValue(t, got, err, half)
	got, err = UnboundedKnapsack([]int{1}, []int64{1000000000000}, 100000)
	mustValue(t, got, err, 100000000000000000)
	// Counts: Fibonacci numbers, the last one that fits, then one more.
	got, err = CountPermutations([]int{1, 2}, 91)
	mustValue(t, got, err, 7540113804746346429)
	_, err = CountPermutations([]int{1, 2}, 92)
	overflow("permutations of 1 and 2 making 92", err)
	ones := make([]int, 30)
	twos := make([]int, 30)
	for i := range ones {
		ones[i], twos[i] = 1, 2
	}
	_, err = CountCombinations(ones, 100)
	overflow("30 items of weight 1 making 100", err)
	// A table entry past MaxInt64 is fine when the target's own count fits.
	got, err = CountPermutations([]int{2, 4}, 191)
	mustValue(t, got, err, 0)
	got, err = CountCombinations(twos, 101)
	mustValue(t, got, err, 0)
}

func TestCountsAgainstBruteForce(t *testing.T) {
	rng := rand.New(rand.NewSource(1635))
	for i := 0; i < 500; i++ {
		w := make([]int, rng.Intn(5))
		for j := range w {
			w[j] = 1 + rng.Intn(6)
		}
		target := rng.Intn(15)
		comb, err1 := CountCombinations(w, target)
		perm, err2 := CountPermutations(w, target)
		if err1 != nil || err2 != nil || comb != bruteCombinations(w, target) || perm != brutePermutations(w, target) {
			t.Fatalf("counts(%v, %d) = %d, %d against brute force %d, %d", w, target, comb, perm, bruteCombinations(w, target), brutePermutations(w, target))
		}
	}
}

func TestWorkCounts(t *testing.T) {
	// Each item costs capacity - weight + 1 relaxations, in either direction.
	rng := rand.New(rand.NewSource(1634))
	for i := 0; i < 300; i++ {
		w, v, c := randomItems(rng, 8, 30, 50, 60)
		want := 0
		for _, x := range w {
			if c-x+1 > 0 {
				want += c - x + 1
			}
		}
		for _, upward := range []bool{true, false} {
			var cnt counters
			if _, _, err := fillRow(w, v, c, upward, &cnt); err != nil || cnt.relaxations != want {
				t.Fatalf("fillRow(%v, %d, upward %v): %d relaxations, want %d", w, c, upward, cnt.relaxations, want)
			}
		}
	}
	// Pseudo-polynomial: one more bit in W doubles the work.
	for k, want := range []int{3991, 7991, 15991, 31991, 63991} {
		var cnt counters
		fillRow(exWeights, exValues, 1000<<k, true, &cnt)
		if cnt.relaxations != want {
			t.Fatalf("W = %d: %d relaxations, want %d", 1000<<k, cnt.relaxations, want)
		}
	}
}

// Outputs computed by running the Python implementation (unbounded_knapsack.py): fixed cases
// first, then seeded random ones. Each case: weights, values, capacity, the best value, the
// counts unbounded_knapsack_items returns, and zero_one_knapsack's value.
type pythonCase struct {
	weights  []int
	values   []int64
	capacity int
	value    int64
	counts   []int
	once     int64
}

// count_combinations and count_permutations on the same weights and target.
type pythonCount struct {
	weights                    []int
	target                     int
	combinations, permutations int64
}

var pythonCases = []pythonCase{
	{[]int{1, 3, 4, 5}, []int64{1, 4, 5, 7}, 10, 14, []int{0, 0, 0, 2}, 13},
	{[]int{1, 3, 4, 5}, []int64{1, 4, 5, 7}, 7, 9, []int{1, 2, 0, 0}, 9},
	{[]int{1, 3, 4, 5}, []int64{1, 4, 5, 7}, 6, 8, []int{0, 2, 0, 0}, 8},
	{[]int{1, 3, 4, 5}, []int64{1, 4, 5, 7}, 0, 0, []int{0, 0, 0, 0}, 0},
	{[]int{}, []int64{}, 10, 0, []int{}, 0},
	{[]int{2}, []int64{3}, 4, 6, []int{2}, 3},
	{[]int{3, 3}, []int64{4, 4}, 9, 12, []int{3, 0}, 8},
	{[]int{2, 4}, []int64{3, 6}, 4, 6, []int{2, 0}, 6},
	{[]int{4, 2}, []int64{6, 3}, 4, 6, []int{1, 0}, 6},
	{[]int{8, 9}, []int64{100, 200}, 7, 0, []int{0, 0}, 0},
	{[]int{8, 2}, []int64{100, 1}, 7, 3, []int{0, 3}, 1},
	{[]int{1, 2}, []int64{0, -3}, 5, 0, []int{0, 0}, 0},
	{[]int{1, 2}, []int64{-1, 3}, 5, 6, []int{0, 2}, 3},
	{[]int{3}, []int64{5}, 7, 10, []int{2}, 5},
	{[]int{7, 10}, []int64{9, 13}, 100000, 130000, []int{0, 10000}, 22},
	{[]int{10, 20, 30}, []int64{60, 100, 120}, 50, 300, []int{5, 0, 0}, 220},
	{[]int{11, 1}, []int64{2, 43}, 8, 344, []int{0, 8}, 43},
	{[]int{8, 8, 3, 8, 7}, []int64{49, 53, 36, 15, 4}, 0, 0, []int{0, 0, 0, 0, 0}, 0},
	{[]int{9, 1, 3, 11, 8}, []int64{18, 56, 1, 48, 50}, 34, 1904, []int{0, 34, 0, 0, 0}, 173},
	{[]int{10, 5, 2}, []int64{4, 33, 16}, 10, 80, []int{0, 0, 5}, 49},
	{[]int{9, 12, 6, 4}, []int64{50, 16, 37, 43}, 16, 172, []int{0, 0, 0, 4}, 93},
	{[]int{6, 10, 3}, []int64{32, 21, 1}, 19, 96, []int{3, 0, 0}, 54},
	{[]int{3}, []int64{59}, 1, 0, []int{0}, 0},
	{[]int{9, 8, 7}, []int64{30, 25, 47}, 38, 235, []int{0, 0, 5}, 102},
	{[]int{11, 7, 4, 6, 4}, []int64{50, 54, 11, 7, 12}, 31, 216, []int{0, 4, 0, 0, 0}, 127},
	{[]int{7, 4, 12, 2, 7, 3}, []int64{57, 38, 59, 27, 24, 31}, 6, 81, []int{0, 0, 0, 3, 0, 0}, 65},
	{[]int{1, 8, 7, 10}, []int64{48, 55, 6, 2}, 31, 1488, []int{31, 0, 0, 0}, 111},
	{[]int{9, 6}, []int64{31, 10}, 9, 31, []int{1, 0}, 31},
	{[]int{8, 11, 6, 1, 5, 7}, []int64{24, 22, 60, 32, 40, 20}, 37, 1184, []int{0, 0, 0, 37, 0, 0}, 178},
	{[]int{1}, []int64{5}, 8, 40, []int{8}, 5},
	{[]int{5, 4, 11, 7, 9}, []int64{32, 4, 13, 2, 28}, 3, 0, []int{0, 0, 0, 0, 0}, 0},
	{[]int{6}, []int64{29}, 18, 87, []int{3}, 29},
	{[]int{8, 7, 4, 7, 4, 12}, []int64{60, 13, 29, 49, 59, 17}, 13, 177, []int{0, 0, 0, 0, 3, 0}, 119},
	{[]int{6, 5, 1}, []int64{22, 52, 0}, 31, 312, []int{0, 6, 0}, 74},
	{[]int{10, 7, 11}, []int64{42, 1, 47}, 8, 1, []int{0, 1, 0}, 1},
	{[]int{4, 12, 4, 4, 9, 7}, []int64{9, 3, 40, 36, 13, 46}, 2, 0, []int{0, 0, 0, 0, 0, 0}, 0},
	{[]int{6, 1, 11, 7, 8, 6}, []int64{38, 55, 19, 13, 50, 56}, 5, 275, []int{0, 5, 0, 0, 0, 0}, 55},
	{[]int{9, 10, 5}, []int64{12, 46, 4}, 36, 142, []int{0, 3, 1}, 62},
	{[]int{6, 12}, []int64{8, 1}, 24, 32, []int{4, 0}, 9},
	{[]int{4, 7, 1, 8, 1, 11}, []int64{19, 34, 8, 32, 36, 17}, 25, 900, []int{0, 0, 0, 0, 25, 0}, 129},
	{[]int{9, 4, 3, 9}, []int64{50, 0, 53, 55}, 8, 106, []int{0, 0, 2, 0}, 53},
	{[]int{8, 12}, []int64{52, 11}, 21, 104, []int{2, 0}, 63},
	{[]int{6, 9, 10}, []int64{42, 12, 18}, 15, 84, []int{2, 0, 0}, 54},
	{[]int{10, 1, 8, 12, 8}, []int64{20, 21, 30, 47, 47}, 8, 168, []int{0, 8, 0, 0, 0}, 47},
}

var pythonCounts = []pythonCount{
	{[]int{1, 2, 5}, 5, 4, 9},
	{[]int{1, 2, 5}, 11, 11, 218},
	{[]int{2, 2}, 4, 3, 4},
	{[]int{2, 4}, 7, 0, 0},
	{[]int{}, 0, 1, 1},
	{[]int{}, 5, 0, 0},
	{[]int{3, 5}, 0, 1, 1},
	{[]int{1, 2}, 91, 46, 7540113804746346429},
	{[]int{2, 3, 5}, 9, 3, 8},
	{[]int{1, 3, 4}, 6, 4, 9},
	{[]int{8, 2}, 28, 4, 50},
	{[]int{3}, 20, 0, 0},
	{[]int{9}, 17, 0, 0},
	{[]int{4, 1, 9}, 21, 11, 698},
	{[]int{5, 2, 2}, 3, 0, 0},
	{[]int{8, 4, 9}, 19, 0, 0},
	{[]int{5, 7, 8}, 28, 3, 18},
	{[]int{2}, 2, 1, 1},
	{[]int{5, 7, 6, 3}, 28, 14, 570},
	{[]int{7, 4, 7, 1}, 28, 45, 28844},
	{[]int{9, 9}, 23, 0, 0},
	{[]int{6, 1, 4, 2}, 26, 123, 2088402},
	{[]int{9, 1, 2, 7}, 7, 5, 22},
	{[]int{8}, 12, 0, 0},
}

func TestAgreementWithPython(t *testing.T) {
	for i, c := range pythonCases {
		value, counts, err := UnboundedKnapsackItems(c.weights, c.values, c.capacity)
		best, err2 := UnboundedKnapsack(c.weights, c.values, c.capacity)
		once, err3 := ZeroOneKnapsack(c.weights, c.values, c.capacity)
		if err != nil || err2 != nil || err3 != nil || value != c.value || best != c.value || once != c.once || !reflect.DeepEqual(counts, c.counts) {
			t.Fatalf("agreement case %d differs from Python: %d %v %d %d", i, value, counts, best, once)
		}
	}
	for i, c := range pythonCounts {
		comb, err1 := CountCombinations(c.weights, c.target)
		perm, err2 := CountPermutations(c.weights, c.target)
		if err1 != nil || err2 != nil || comb != c.combinations || perm != c.permutations {
			t.Fatalf("count case %d differs from Python: %d %d", i, comb, perm)
		}
	}
}
