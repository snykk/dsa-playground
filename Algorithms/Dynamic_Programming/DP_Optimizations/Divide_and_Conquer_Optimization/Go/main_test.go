package main

import (
	"errors"
	"math"
	"math/rand"
	"reflect"
	"slices"
	"testing"
)

// The first eight digits of pi, split into three groups.
var exValues = []int64{3, 1, 4, 1, 5, 9, 2, 6}

// squareCost returns C(j, i) = (sum of values[j:i])^2 for any sign, counting calls in count
// when it is not nil.
func squareCost(values []int64, count *int64) func(j, i int) int64 {
	prefix := make([]int64, len(values)+1)
	for t, v := range values {
		prefix[t+1] = prefix[t] + v
	}
	return func(j, i int) int64 {
		if count != nil {
			*count++
		}
		s := prefix[i] - prefix[j]
		return s * s
	}
}

func splitCost(values []int64, bounds []int) int64 {
	var total int64
	for g := 0; g+1 < len(bounds); g++ {
		var s int64
		for _, v := range values[bounds[g]:bounds[g+1]] {
			s += v
		}
		total += s * s
	}
	return total
}

// bruteForce tries every split into k groups: the best cost, and of the best splits the one
// whose last cut is smallest, then the cut before it, and so on (the documented tie rule).
func bruteForce(values []int64, k int) Partition {
	n := len(values)
	best := Partition{Cost: math.MaxInt64}
	bounds := make([]int, k+1)
	bounds[k] = n
	reversed := func(b []int) []int {
		r := slices.Clone(b)
		slices.Reverse(r)
		return r
	}
	var rec func(g, from int)
	rec = func(g, from int) {
		if g == k {
			c := splitCost(values, bounds)
			if c < best.Cost || (c == best.Cost && slices.Compare(reversed(bounds), reversed(best.Bounds)) < 0) {
				best = Partition{c, slices.Clone(bounds)}
			}
			return
		}
		for cut := from; cut <= n-(k-g); cut++ {
			bounds[g] = cut
			rec(g+1, cut+1)
		}
	}
	rec(1, 1)
	return best
}

// quadrangleHolds reports whether C(a, c) + C(b, d) <= C(a, d) + C(b, c) for every
// a < b < c < d <= n.
func quadrangleHolds(n int, cost func(j, i int) int64) bool {
	for a := 0; a <= n; a++ {
		for b := a + 1; b <= n; b++ {
			for c := b + 1; c <= n; c++ {
				for d := c + 1; d <= n; d++ {
					if cost(a, c)+cost(b, d) > cost(a, d)+cost(b, c) {
						return false
					}
				}
			}
		}
	}
	return true
}

func randomCase(rng *rand.Rand, maxN int, negative bool) ([]int64, int) {
	highs := []int64{1, 3, 10, 100, 1000000}
	n := 1 + rng.Intn(maxN)
	high := highs[rng.Intn(len(highs))]
	values := make([]int64, n)
	for t := range values {
		if negative {
			values[t] = rng.Int63n(2*high+1) - high
		} else {
			values[t] = rng.Int63n(high + 1)
		}
	}
	return values, 1 + rng.Intn(n)
}

func mustPartition(t *testing.T, got Partition, err error, want Partition) {
	t.Helper()
	if err != nil || got.Cost != want.Cost || !reflect.DeepEqual(got.Bounds, want.Bounds) {
		t.Fatalf("got %v, %v; want %v", got, err, want)
	}
}

func TestWorkedExample(t *testing.T) {
	got, err := MinCostPartition(exValues, 3)
	mustPartition(t, got, err, Partition{341, []int{0, 4, 6, 8}}) // [3 1 4 1] [5 9] [2 6]: 81 + 196 + 64
	got, err = MinCostPartitionPlain(exValues, 3)
	mustPartition(t, got, err, Partition{341, []int{0, 4, 6, 8}})
	for k, want := range []int64{961, 485, 341, 245, 211, 187, 179, 173} {
		if got, err := MinCostPartition(exValues, k+1); err != nil || got.Cost != want {
			t.Fatalf("k = %d: %v, %v; want cost %d", k+1, got, err, want)
		}
	}
	got, err = MinCostPartition(exValues, 2)
	mustPartition(t, got, err, Partition{485, []int{0, 5, 8}})
	got, err = MinCostPartition(exValues, 4)
	mustPartition(t, got, err, Partition{245, []int{0, 3, 5, 6, 8}})
	// Cost evaluations: 8 + 19 + 14 with the recursion, 8 + 28 + 21 with the plain DP.
	var fast, plain int64
	PartitionDP(8, 3, squareCost(exValues, &fast), true)
	PartitionDP(8, 3, squareCost(exValues, &plain), false)
	if fast != 41 || plain != 57 {
		t.Fatalf("evaluations %d and %d; want 41 and 57", fast, plain)
	}
}

func TestAgainstPlainAndBruteForce(t *testing.T) {
	rng := rand.New(rand.NewSource(20261124))
	for i := 0; i < 1500; i++ {
		values, k := randomCase(rng, 40, false)
		fast, err1 := MinCostPartition(values, k)
		plain, err2 := MinCostPartitionPlain(values, k)
		if err1 != nil || err2 != nil || !reflect.DeepEqual(fast, plain) {
			t.Fatalf("%v, k = %d: %v against plain %v", values, k, fast, plain)
		}
	}
	for i := 0; i < 1500; i++ {
		values, k := randomCase(rng, 9, false)
		want := bruteForce(values, k)
		got, err := MinCostPartition(values, k)
		mustPartition(t, got, err, want)
		got, err = MinCostPartitionPlain(values, k)
		mustPartition(t, got, err, want)
	}
}

func TestGroups(t *testing.T) {
	rng := rand.New(rand.NewSource(868))
	for i := 0; i < 1000; i++ {
		values, k := randomCase(rng, 30, false)
		best, err := MinCostPartition(values, k)
		if err != nil || len(best.Bounds) != k+1 || best.Bounds[0] != 0 || best.Bounds[k] != len(values) {
			t.Fatalf("%v, k = %d: %v, %v", values, k, best, err)
		}
		for g := 0; g < k; g++ {
			if best.Bounds[g] >= best.Bounds[g+1] {
				t.Fatalf("empty group in %v", best.Bounds)
			}
		}
		if splitCost(values, best.Bounds) != best.Cost {
			t.Fatalf("the groups %v of %v do not reach the cost %d", best.Bounds, values, best.Cost)
		}
	}
}

func TestQuadrangleInequality(t *testing.T) {
	rng := rand.New(rand.NewSource(1433))
	for i := 0; i < 400; i++ {
		values, _ := randomCase(rng, 12, false)
		if !quadrangleHolds(len(values), squareCost(values, nil)) {
			t.Fatalf("the inequality fails for %v", values)
		}
	}
	// Other costs that satisfy it: a convex function of the length, and the square plus a fixed price.
	cube := func(j, i int) int64 { return int64(i-j) * int64(i-j) * int64(i-j) }
	for i := 0; i < 300; i++ {
		values, k := randomCase(rng, 25, false)
		square := squareCost(values, nil)
		priced := func(j, i int) int64 { return square(j, i) + 50 }
		for _, cost := range []func(j, i int) int64{cube, priced} {
			fast, _ := PartitionDP(len(values), k, cost, true)
			plain, _ := PartitionDP(len(values), k, cost, false)
			if !reflect.DeepEqual(fast, plain) {
				t.Fatalf("%v, k = %d: %v against plain %v", values, k, fast, plain)
			}
		}
	}
}

func TestWhenItFails(t *testing.T) {
	// With a negative value the square of the sum breaks the inequality:
	// C(1, 3) + C(2, 4) = 36 + 1 > C(1, 4) + C(2, 3) = 1 + 16.
	values := []int64{1, 2, 4, -5}
	cost := squareCost(values, nil)
	if cost(1, 3) != 36 || cost(2, 4) != 1 || cost(1, 4) != 1 || cost(2, 3) != 16 || quadrangleHolds(4, cost) {
		t.Fatal("the costs of 1, 2, 4, -5 are not as documented")
	}
	fast, err := PartitionDP(4, 2, cost, true)
	mustPartition(t, fast, err, Partition{10, []int{0, 2, 4}}) // wrong
	plain, err := PartitionDP(4, 2, cost, false)
	mustPartition(t, plain, err, Partition{2, []int{0, 1, 4}})
	// On random inputs with negative values the recursion sometimes misses, never undercuts.
	rng := rand.New(rand.NewSource(1603))
	differ := 0
	for i := 0; i < 3000; i++ {
		values, k := randomCase(rng, 9, true)
		c := squareCost(values, nil)
		f, _ := PartitionDP(len(values), k, c, true)
		p, _ := PartitionDP(len(values), k, c, false)
		if p.Cost != bruteForce(values, k).Cost || splitCost(values, f.Bounds) != f.Cost || f.Cost < p.Cost {
			t.Fatalf("%v, k = %d: recursion %v, plain %v", values, k, f, p)
		}
		if !reflect.DeepEqual(f, p) {
			differ++
			if quadrangleHolds(len(values), c) {
				t.Fatalf("%v: the answers differ but the inequality holds", values)
			}
		}
	}
	if differ == 0 {
		t.Fatal("no random input with negative values made the recursion miss")
	}
	for _, fn := range []func([]int64, int) (Partition, error){MinCostPartition, MinCostPartitionPlain} {
		if _, err := fn(values, 2); !errors.Is(err, ErrInvalidInput) {
			t.Fatalf("negative value: got %v, want ErrInvalidInput", err)
		}
	}
}

func TestEdgeCases(t *testing.T) {
	cases := []struct {
		values []int64
		k      int
		want   Partition
	}{
		{exValues, 1, Partition{961, []int{0, 8}}}, // one group
		{[]int64{7}, 1, Partition{49, []int{0, 1}}},
		{exValues, 8, Partition{173, []int{0, 1, 2, 3, 4, 5, 6, 7, 8}}}, // one value each
		// Equal values: the last cut is the smallest possible.
		{[]int64{1, 1, 1, 1, 1}, 2, Partition{13, []int{0, 2, 5}}},
		{[]int64{0, 0, 0, 0}, 2, Partition{0, []int{0, 1, 4}}},
		{[]int64{0, 0, 0, 0}, 3, Partition{0, []int{0, 1, 2, 4}}},
		{[]int64{5, 0, 0, 5}, 2, Partition{50, []int{0, 1, 4}}},
		{[]int64{0, 0, 9, 0, 0}, 3, Partition{81, []int{0, 1, 2, 5}}},
	}
	for _, c := range cases {
		got, err := MinCostPartition(c.values, c.k)
		mustPartition(t, got, err, c.want)
	}
}

func TestInvalidInput(t *testing.T) {
	invalid := func(name string, err error) {
		t.Helper()
		if !errors.Is(err, ErrInvalidInput) {
			t.Errorf("%s: got %v, want an error wrapping ErrInvalidInput", name, err)
		}
	}
	// Groups are not empty: k > n is an error, and so is any k for an empty list.
	_, err := MinCostPartition([]int64{1, 2, 3}, 4)
	invalid("k > n", err)
	_, err = MinCostPartitionPlain([]int64{1, 2, 3}, 4)
	invalid("k > n, plain", err)
	_, err = MinCostPartition([]int64{}, 1)
	invalid("empty, k = 1", err)
	_, err = MinCostPartition(nil, 0)
	invalid("empty, k = 0", err)
	_, err = MinCostPartition([]int64{1, 2}, 0)
	invalid("k = 0", err)
	_, err = MinCostPartitionPlain([]int64{1, 2}, -1)
	invalid("k = -1", err)
	_, err = MinCostPartition([]int64{3, -1, 2}, 2)
	invalid("negative value", err)
	_, err = PartitionDP(4, 5, func(j, i int) int64 { return 0 }, true)
	invalid("PartitionDP, k > n", err)
	_, err = PartitionDP(4, 0, func(j, i int) int64 { return 0 }, false)
	invalid("PartitionDP, k = 0", err)
	// A negative value is reported before an overflowing total.
	_, err = MinCostPartition([]int64{4000000000, -1}, 1)
	invalid("negative value and a large one", err)
}

func TestOverflow(t *testing.T) {
	overflow := func(name string, err error) {
		t.Helper()
		if !errors.Is(err, ErrOverflow) {
			t.Errorf("%s: got %v, want an error wrapping ErrOverflow", name, err)
		}
	}
	// 3037000499^2 is the largest square that fits in an int64.
	got, err := MinCostPartition([]int64{3037000499}, 1)
	mustPartition(t, got, err, Partition{9223372030926249001, []int{0, 1}})
	_, err = MinCostPartition([]int64{3037000500}, 1)
	overflow("3037000500", err)
	// The check is on the total, the one-group cost the DP forms in layer 1: two groups of
	// 3037000499 and 1 would cost 9223372030926249002, but the total does not square into 64 bits.
	_, err = MinCostPartition([]int64{3037000499, 1}, 2)
	overflow("3037000499 and 1", err)
	_, err = MinCostPartitionPlain([]int64{math.MaxInt64, math.MaxInt64}, 2)
	overflow("MaxInt64 twice", err)
	got, err = MinCostPartition([]int64{1000000000, 1000000000, 1000000000}, 2)
	mustPartition(t, got, err, Partition{5000000000000000000, []int{0, 1, 3}})
	// PartitionDP checks every sum it forms.
	big := func(j, i int) int64 { return math.MaxInt64/2 + 1 }
	_, err = PartitionDP(3, 2, big, true)
	overflow("PartitionDP, two big costs", err)
	_, err = PartitionDP(3, 3, big, false)
	overflow("PartitionDP plain, three big costs", err)
	got, err = PartitionDP(3, 1, big, true)
	if err != nil || got.Cost != math.MaxInt64/2+1 {
		t.Fatalf("one big cost: %v, %v", got, err)
	}
}

func boundOf(n, k int) int64 {
	b := int64(n)
	for g := 2; g <= k; g++ {
		m := int64(n - g + 1)
		b += m * (int64(math.Floor(math.Log2(float64(m)))) + 2)
	}
	return b
}

func plainOf(n, k int) int64 {
	p := int64(n)
	for g := 2; g <= k; g++ {
		m := int64(n - g + 1)
		p += m * (m + 1) / 2
	}
	return p
}

func countingValues(n int) []int64 {
	v := make([]int64, n)
	for t := range v {
		v[t] = int64((37*t + 11) % 101)
	}
	return v
}

func TestCostEvaluations(t *testing.T) {
	// At most m (log2 m + 2) evaluations for a layer of m cells, against m (m + 1) / 2.
	for _, n := range []int{64, 256, 1024, 4096} {
		var fast int64
		PartitionDP(n, 4, squareCost(countingValues(n), &fast), true)
		if fast > boundOf(n, 4) {
			t.Fatalf("n = %d: %d evaluations, bound %d", n, fast, boundOf(n, 4))
		}
	}
	rng := rand.New(rand.NewSource(833))
	for i := 0; i < 150; i++ {
		values, k := randomCase(rng, 200, false)
		var fast int64
		PartitionDP(len(values), k, squareCost(values, &fast), true)
		if fast > boundOf(len(values), k) {
			t.Fatalf("n = %d, k = %d: %d evaluations, bound %d", len(values), k, fast, boundOf(len(values), k))
		}
	}
	// The plain DP tries every j for every cell, as a recursion that never narrows would; it
	// fails the bound.
	for _, n := range []int{8, 64, 256} {
		var plain int64
		PartitionDP(n, 4, squareCost(countingValues(n), &plain), false)
		if plain != plainOf(n, 4) || (n >= 64 && plain <= boundOf(n, 4)) {
			t.Fatalf("n = %d: plain DP %d evaluations, want %d, above the bound %d", n, plain, plainOf(n, 4), boundOf(n, 4))
		}
	}
}

// Outputs computed by running the Python implementation (divide_and_conquer_optimization.py):
// fixed cases first, then seeded random ones. Each case: values, k, the cost and the bounds
// that min_cost_partition returns (min_cost_partition_plain returns the same).
type pythonCase struct {
	values []int64
	k      int
	cost   int64
	bounds []int
}

// partition_dp with the square of the sum on values with negatives: the recursion's answer
// (optimized=True) and the plain DP's, which differ.
type pythonFailure struct {
	values      []int64
	k           int
	fastCost    int64
	fastBounds  []int
	plainCost   int64
	plainBounds []int
}

// Cost evaluations on values (37 t + 11) mod 101, t = 0..n-1: the recursion, then the plain DP.
type pythonCount struct {
	n, k        int
	fast, plain int64
}

var pythonCases = []pythonCase{
	{[]int64{3, 1, 4, 1, 5, 9, 2, 6}, 1, 961, []int{0, 8}},
	{[]int64{3, 1, 4, 1, 5, 9, 2, 6}, 2, 485, []int{0, 5, 8}},
	{[]int64{3, 1, 4, 1, 5, 9, 2, 6}, 3, 341, []int{0, 4, 6, 8}},
	{[]int64{3, 1, 4, 1, 5, 9, 2, 6}, 4, 245, []int{0, 3, 5, 6, 8}},
	{[]int64{3, 1, 4, 1, 5, 9, 2, 6}, 8, 173, []int{0, 1, 2, 3, 4, 5, 6, 7, 8}},
	{[]int64{7}, 1, 49, []int{0, 1}},
	{[]int64{1, 1, 1, 1, 1}, 2, 13, []int{0, 2, 5}},
	{[]int64{1, 1, 1, 1, 1, 1, 1}, 3, 17, []int{0, 2, 4, 7}},
	{[]int64{0, 0, 0, 0}, 2, 0, []int{0, 1, 4}},
	{[]int64{0, 0, 0, 0}, 3, 0, []int{0, 1, 2, 4}},
	{[]int64{5, 0, 0, 5}, 2, 50, []int{0, 1, 4}},
	{[]int64{0, 0, 9, 0, 0}, 2, 81, []int{0, 1, 5}},
	{[]int64{0, 0, 9, 0, 0}, 3, 81, []int{0, 1, 2, 5}},
	{[]int64{2, 7, 1, 8, 2, 8}, 3, 262, []int{0, 2, 4, 6}},
	{[]int64{4, 1, 3, 2, 5, 1, 2}, 3, 114, []int{0, 2, 4, 7}},
	{[]int64{3037000499}, 1, 9223372030926249001, []int{0, 1}},
	{[]int64{1000000000, 1000000000, 1000000000}, 2, 5000000000000000000, []int{0, 1, 3}},
	{[]int64{0, 0, 2, 9, 7, 7, 2, 7, 6, 9, 3, 1, 0, 9}, 9, 478, []int{0, 3, 4, 5, 6, 8, 9, 10, 12, 14}},
	{[]int64{7}, 1, 49, []int{0, 1}},
	{[]int64{75}, 1, 5625, []int{0, 1}},
	{[]int64{1, 0}, 2, 1, []int{0, 1, 2}},
	{[]int64{29, 33, 75, 86, 33, 34, 46, 73, 17}, 9, 24930, []int{0, 1, 2, 3, 4, 5, 6, 7, 8, 9}},
	{[]int64{1, 0, 0, 0, 1, 1}, 4, 3, []int{0, 1, 2, 5, 6}},
	{[]int64{773171, 637888, 540433, 688123, 448431, 219816, 331949, 907024}, 4, 5323521921609, []int{0, 2, 4, 7, 8}},
	{[]int64{1, 3, 7, 6, 3, 1, 6, 2, 9, 6, 6, 7, 1}, 8, 444, []int{0, 2, 3, 5, 8, 9, 10, 11, 13}},
	{[]int64{793767}, 1, 630066050289, []int{0, 1}},
	{[]int64{0, 1, 0, 1, 1, 0, 0, 1, 1, 0}, 5, 5, []int{0, 2, 4, 5, 8, 10}},
	{[]int64{403847, 370773, 995424, 524778, 666319, 341702, 611420, 93366, 8760, 93687, 145607, 882042, 574334, 288106}, 4, 9270824263433, []int{0, 3, 5, 11, 14}},
	{[]int64{580960, 538259, 79800, 213986, 35879, 461153, 930151, 65459, 6407, 353473, 488519}, 5, 2925375372370, []int{0, 1, 3, 6, 7, 11}},
	{[]int64{409069, 204507, 844632, 425774, 229757, 769223, 992989, 228216, 475437, 815886, 978897}, 5, 8273390610743, []int{0, 3, 6, 8, 10, 11}},
	{[]int64{46, 35, 2, 45}, 1, 16384, []int{0, 4}},
	{[]int64{354142, 606128, 407320, 690703, 689239, 19512, 779336, 921129, 147288, 660187, 207228}, 4, 7749977300650, []int{0, 3, 6, 8, 11}},
	{[]int64{150659, 63911, 663673, 601498}, 2, 1133110611053, []int{0, 3, 4}},
	{[]int64{1, 0, 1, 1, 1, 1, 0, 0, 1, 1, 0, 0}, 12, 7, []int{0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12}},
	{[]int64{5, 2, 0, 6, 3, 6, 0, 7, 0, 4}, 9, 175, []int{0, 1, 2, 3, 4, 5, 6, 7, 8, 10}},
	{[]int64{50, 55, 100}, 3, 15525, []int{0, 1, 2, 3}},
	{[]int64{8, 0, 2, 2}, 4, 72, []int{0, 1, 2, 3, 4}},
	{[]int64{5, 5, 5, 8, 9, 3, 4, 3, 8, 9, 0, 7, 7, 5}, 6, 1038, []int{0, 2, 4, 6, 9, 12, 14}},
	{[]int64{5, 7, 0, 8, 9, 4, 1, 4}, 4, 370, []int{0, 2, 4, 5, 8}},
	{[]int64{76, 5, 59, 62, 44, 36, 51, 99, 44, 70, 29, 36}, 8, 49539, []int{0, 1, 3, 5, 7, 8, 9, 10, 12}},
	{[]int64{1, 0, 1, 0, 1, 1}, 3, 6, []int{0, 1, 3, 6}},
	{[]int64{676193, 297562, 7707, 324174, 182444}, 5, 684214110354, []int{0, 1, 2, 3, 4, 5}},
	{[]int64{66, 86, 79, 73, 20, 52, 4, 78, 63, 4, 94, 74}, 8, 63399, []int{0, 1, 2, 3, 5, 8, 10, 11, 12}},
	{[]int64{271058, 738494, 730125, 105425, 701280, 249245, 508698, 159489, 843657, 925413, 961583, 753801, 526483, 723856}, 11, 6506538800407, []int{0, 1, 2, 3, 5, 8, 9, 10, 11, 12, 13, 14}},
}

var pythonFailures = []pythonFailure{
	{[]int64{1, 2, 4, -5}, 2, 10, []int{0, 2, 4}, 2, []int{0, 1, 4}},
	{[]int64{-1, 1, 2, -4}, 2, 4, []int{0, 2, 4}, 2, []int{0, 1, 4}},
	{[]int64{2, 1, 0, 3, -4}, 2, 10, []int{0, 2, 5}, 4, []int{0, 1, 5}},
	{[]int64{3, 0, 3, 3, 0, -5, -1, 4, 1}, 7, 40, []int{0, 1, 2, 3, 6, 7, 8, 9}, 32, []int{0, 1, 2, 3, 4, 5, 8, 9}},
	{[]int64{-1, 1, 0, -6, 0, 2}, 3, 30, []int{0, 1, 4, 6}, 16, []int{0, 2, 3, 6}},
	{[]int64{1, 4, 5, 2, -4, 6, -3}, 2, 73, []int{0, 5, 7}, 61, []int{0, 2, 7}},
	{[]int64{6, 3, -2, -1, 3, -2, 4, 2, -6}, 4, 65, []int{0, 1, 5, 7, 9}, 37, []int{0, 1, 3, 6, 9}},
	{[]int64{3, -2, 5, 6, -2, -1}, 2, 45, []int{0, 3, 6}, 45, []int{0, 1, 6}},
	{[]int64{-3, 5, -4, -1, 4, -4, 3, 0}, 5, 18, []int{0, 1, 4, 6, 7, 8}, 14, []int{0, 3, 4, 6, 7, 8}},
	{[]int64{6, 0, 4, -3, 3, 4, 2, -6, 3}, 4, 55, []int{0, 1, 4, 8, 9}, 55, []int{0, 1, 4, 5, 9}},
	{[]int64{6, 6, 3, 4, 4, -6}, 3, 121, []int{0, 1, 3, 6}, 97, []int{0, 1, 2, 6}},
	{[]int64{0, 1, 5, 3, 5, -1, 3, -6, -6}, 3, 70, []int{0, 3, 4, 9}, 10, []int{0, 1, 2, 9}},
}

var pythonCounts = []pythonCount{
	{8, 3, 43, 57},
	{64, 4, 1140, 5924},
	{256, 4, 6225, 97412},
	{1024, 4, 31234, 1569284},
	{100, 1, 100, 100},
	{100, 2, 773, 5050},
	{100, 10, 5455, 41170},
	{300, 7, 14802, 264935},
}

func TestAgreementWithPython(t *testing.T) {
	for i, c := range pythonCases {
		want := Partition{c.cost, c.bounds}
		fast, err1 := MinCostPartition(c.values, c.k)
		plain, err2 := MinCostPartitionPlain(c.values, c.k)
		if err1 != nil || err2 != nil || !reflect.DeepEqual(fast, want) || !reflect.DeepEqual(plain, want) {
			t.Fatalf("agreement case %d differs from Python: %v, %v", i, fast, plain)
		}
	}
	for i, c := range pythonFailures {
		cost := squareCost(c.values, nil)
		fast, err1 := PartitionDP(len(c.values), c.k, cost, true)
		plain, err2 := PartitionDP(len(c.values), c.k, cost, false)
		if err1 != nil || err2 != nil || !reflect.DeepEqual(fast, Partition{c.fastCost, c.fastBounds}) ||
			!reflect.DeepEqual(plain, Partition{c.plainCost, c.plainBounds}) {
			t.Fatalf("failure case %d differs from Python: %v, %v", i, fast, plain)
		}
	}
	for i, c := range pythonCounts {
		var fast, plain int64
		PartitionDP(c.n, c.k, squareCost(countingValues(c.n), &fast), true)
		PartitionDP(c.n, c.k, squareCost(countingValues(c.n), &plain), false)
		if fast != c.fast || plain != c.plain {
			t.Fatalf("count case %d differs from Python: %d, %d", i, fast, plain)
		}
	}
}
