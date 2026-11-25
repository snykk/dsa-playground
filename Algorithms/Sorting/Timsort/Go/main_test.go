package main

import (
	"math/rand"
	"slices"
	"sort"
	"strings"
	"testing"
)

// item is a key with a payload; the counter's less compares keys only.
type item struct{ key, tag int }

type counter struct{ comparisons int }

func (c *counter) less(a, b item) bool {
	c.comparisons++
	return a.key < b.key
}

func tagged(values []int) []item {
	out := make([]item, len(values))
	for i, v := range values {
		out[i] = item{v, i}
	}
	return out
}

// countSort sorts a tagged copy of values, checks it against sort.SliceStable (payload
// included) and returns the comparisons.
func countSort(t *testing.T, values []int, opts Options) int {
	t.Helper()
	var c counter
	arr := tagged(values)
	TimsortWith(arr, c.less, opts)
	want := tagged(values)
	sort.SliceStable(want, func(i, j int) bool { return want[i].key < want[j].key })
	if !slices.Equal(arr, want) {
		t.Fatalf("got %v, want %v", arr, want)
	}
	return c.comparisons
}

// lcgValues rebuilds the arrays of the Python test (lcg_values): a 64-bit LCG, top bits.
func lcgValues(seed uint64, n int, mod uint64) []int {
	out := make([]int, 0, n)
	x := seed
	for i := 0; i < n; i++ {
		x = x*6364136223846793005 + 1442695040888963407
		out = append(out, int((x>>33)%mod))
	}
	return out
}

// pinnedInput is pinned_input of the Python test: lcgValues plus drift * index, and with
// block > 0 every block sorted, ascending in even blocks and descending in odd ones.
func pinnedInput(seed uint64, n int, mod uint64, drift, block int) []int {
	v := lcgValues(seed, n, mod)
	for i := range v {
		v[i] += drift * i
	}
	if block > 0 {
		for start := 0; start < n; start += block {
			chunk := v[start:min(n, start+block)]
			sort.Ints(chunk)
			if (start/block)%2 == 1 {
				slices.Reverse(chunk)
			}
		}
	}
	return v
}

const longRuns = 6 // index of the long-runs shape

// shapes returns the structured inputs of the README.
func shapes(n int, rng *rand.Rand) [][]int {
	perm := make([]int, n)
	for i := range perm {
		perm[i] = i
	}
	random := slices.Clone(perm)
	rng.Shuffle(n, func(i, j int) { random[i], random[j] = random[j], random[i] })
	reversed := slices.Clone(perm)
	slices.Reverse(reversed)
	four := slices.Clone(random)
	quarter := max(1, n/4)
	for s := 0; s < n; s += quarter {
		sort.Ints(four[s:min(n, s+quarter)])
	}
	saw := make([]int, n)
	for i := range saw {
		saw[i] = i % 100
	}
	organ := []int{}
	for i := 0; i < n/2; i++ {
		organ = append(organ, i)
	}
	for i := n - n/2; i > 0; i-- {
		organ = append(organ, i)
	}
	cuts := []int{0, n}
	if n > 20 {
		cuts = append(cuts, rng.Perm(n - 1)[:19]...)
		for k := 2; k < len(cuts); k++ {
			cuts[k]++ // cut points in 1..n-1
		}
	}
	sort.Ints(cuts)
	pieces := [][]int{}
	for i := 0; i+1 < len(cuts); i++ {
		pieces = append(pieces, perm[cuts[i]:cuts[i+1]])
	}
	rng.Shuffle(len(pieces), func(i, j int) { pieces[i], pieces[j] = pieces[j], pieces[i] })
	long := []int{}
	for _, p := range pieces {
		long = append(long, p...)
	}
	return [][]int{random, perm, reversed, four, saw, organ, long}
}

func cpythonFormula(n uint64) int {
	if n < 64 {
		return int(n)
	}
	shift := 0
	for n>>shift >= 64 {
		shift++
	}
	extra := 0
	if n&(1<<shift-1) != 0 {
		extra = 1
	}
	return int(n>>shift) + extra
}

func TestComputeMinrun(t *testing.T) {
	for n := 0; n < 70000; n++ {
		if got := ComputeMinrun(n); got != cpythonFormula(uint64(n)) {
			t.Fatalf("ComputeMinrun(%d) = %d", n, got)
		}
	}
	rng := rand.New(rand.NewSource(64))
	for i := 0; i < 2000; i++ {
		n := rng.Int63()
		if got := ComputeMinrun(int(n)); got != cpythonFormula(uint64(n)) {
			t.Fatalf("ComputeMinrun(%d) = %d", n, got)
		}
	}
	for k := 6; k < 63; k++ {
		if ComputeMinrun(1<<k) != 32 {
			t.Fatalf("ComputeMinrun(2^%d) != 32", k)
		}
	}
	want := map[int]int{0: 0, 63: 63, 65: 33, 100: 50, 1000: 63, 2112: 33, 1000000: 62}
	for n, m := range want {
		if ComputeMinrun(n) != m {
			t.Fatalf("ComputeMinrun(%d) = %d, want %d", n, ComputeMinrun(n), m)
		}
	}
}

func intLess(a, b int) bool { return a < b }

func TestCountRun(t *testing.T) {
	cases := []struct {
		values     []int
		n          int
		descending bool
	}{
		{[]int{5}, 1, false}, {[]int{1, 2}, 2, false}, {[]int{2, 1}, 2, true}, {[]int{2, 2}, 2, false},
		{[]int{1, 2, 2, 3, 1}, 4, false}, {[]int{5, 4, 3, 3, 1}, 3, true}, {[]int{5, 4, 3, 2, 1}, 5, true},
		{[]int{3, 3, 3, 2}, 3, false},
	}
	for _, c := range cases {
		n, d := CountRun(c.values, intLess, 0, len(c.values))
		if n != c.n || d != c.descending {
			t.Fatalf("CountRun(%v) = %d, %v", c.values, n, d)
		}
	}
	if n, d := CountRun([]int{9, 1, 2, 3, 0}, intLess, 1, 5); n != 3 || d {
		t.Fatalf("CountRun inside a slice = %d, %v", n, d)
	}
	var c counter
	if n, _ := CountRun(tagged([]int{0, 1, 2, 3, 4, 5, 6, 7, 8, 9}), c.less, 0, 10); n != 10 || c.comparisons != 9 {
		t.Fatalf("a full run of 10: %d after %d comparisons", n, c.comparisons)
	}
}

func TestBinaryInsertionSort(t *testing.T) {
	rng := rand.New(rand.NewSource(3))
	for trial := 0; trial < 300; trial++ {
		n := 1 + rng.Intn(40)
		start := rng.Intn(n + 1)
		values := make([]int, n)
		for i := range values {
			values[i] = rng.Intn(10)
		}
		sort.Ints(values[:start])
		var c counter
		arr := tagged(values)
		BinaryInsertionSort(arr, c.less, 0, n, start)
		want := tagged(values)
		sort.SliceStable(want, func(i, j int) bool { return want[i].key < want[j].key })
		if !slices.Equal(arr, want) {
			t.Fatalf("got %v, want %v", arr, want)
		}
	}
	part := []int{9, 9, 1, 4, 7, 3, 0, 9, 9}
	BinaryInsertionSort(part, intLess, 2, 7, 5)
	if !slices.Equal(part, []int{9, 9, 0, 1, 3, 4, 7, 9, 9}) {
		t.Fatalf("got %v", part)
	}
}

func TestGallop(t *testing.T) {
	rng := rand.New(rand.NewSource(5))
	for trial := 0; trial < 300; trial++ {
		n := 1 + rng.Intn(40)
		a := make([]int, n)
		for i := range a {
			a[i] = rng.Intn(16)
		}
		sort.Ints(a)
		pad := rng.Intn(4)
		padded := append(append(make([]int, pad), a...), 99)
		for key := -1; key <= 16; key++ {
			left := sort.SearchInts(a, key)
			right := sort.SearchInts(a, key+1)
			for hint := 0; hint < n; hint++ {
				if got := GallopLeft(key, padded, intLess, pad, n, hint); got != left {
					t.Fatalf("GallopLeft(%d, %v, hint %d) = %d, want %d", key, a, hint, got, left)
				}
				if got := GallopRight(key, padded, intLess, pad, n, hint); got != right {
					t.Fatalf("GallopRight(%d, %v, hint %d) = %d, want %d", key, a, hint, got, right)
				}
			}
		}
	}
	// From hint 0, position i costs 2 floor(log2(i)) + 2 comparisons (1 for i = 0).
	a := make([]item, 4096)
	for i := range a {
		a[i] = item{2 * i, i}
	}
	for i := 0; i < 2048; i++ {
		want := 1
		if i > 0 {
			lg := 0
			for i>>(lg+1) > 0 {
				lg++
			}
			want = 2*lg + 2
		}
		var c counter
		if got := GallopLeft(item{2*i - 1, -1}, a, c.less, 0, len(a), 0); got != i || c.comparisons != want {
			t.Fatalf("GallopLeft to %d: %d after %d comparisons, want %d", i, got, c.comparisons, want)
		}
		c = counter{}
		if got := GallopRight(item{2*i - 1, -1}, a, c.less, 0, len(a), 0); got != i || c.comparisons != want {
			t.Fatalf("GallopRight to %d: %d after %d comparisons, want %d", i, got, c.comparisons, want)
		}
	}
}

func TestEdgeCases(t *testing.T) {
	cases := [][]int{
		{}, {42}, {2, 1}, {1, 2}, {64, 34, 25, 12, 22, 11, 90}, {3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5},
		{5, 5, 5, 5, 5, 5}, {3, -1, 3, 0, -1, 2, 2}, {int(^uint(0) >> 1), -int(^uint(0)>>1) - 1, 0, -1},
	}
	for _, values := range cases {
		for _, minrun := range []int{0, 1, 2, 4, 32} {
			countSort(t, values, Options{MinRun: minrun})
		}
		arr := slices.Clone(values)
		Timsort(arr)
		if !slices.IsSorted(arr) {
			t.Fatalf("Timsort(%v) = %v", values, arr)
		}
	}
	words := []string{"pear", "fig", "apple", "kiwi", "date", "plum", "fig"}
	TimsortFunc(words, func(a, b string) bool { return a < b })
	if !slices.IsSorted(words) {
		t.Fatalf("words: %v", words)
	}
	// A strictly descending run is reversed; equal keys stay out of it, so order is kept.
	arr := tagged([]int{5, 4, 3, 3, 3, 1, 0})
	TimsortFunc(arr, func(a, b item) bool { return a.key < b.key })
	tags := []int{}
	for _, it := range arr {
		tags = append(tags, it.tag)
	}
	if !slices.Equal(tags, []int{6, 5, 2, 3, 4, 1, 0}) {
		t.Fatalf("tags %v", tags)
	}
}

func TestNegativeMinRunPanics(t *testing.T) {
	for _, values := range [][]int{{3, 1, 2}, {}} {
		func() {
			defer func() {
				r := recover()
				msg, ok := r.(string)
				if !ok || !strings.Contains(msg, "timsort: MinRun must be 0 (computed) or positive, got -1") {
					t.Fatalf("panic %v", r)
				}
			}()
			TimsortWith(values, intLess, Options{MinRun: -1})
		}()
	}
}

func TestRandomAgainstStableSort(t *testing.T) {
	rng := rand.New(rand.NewSource(20261124))
	spreads := []int{1, 3, 10, 1000, 1000000000}
	minruns := []int{0, 0, 0, 1, 3, 8}
	for trial := 0; trial < 1500; trial++ {
		var n int
		switch rng.Intn(3) {
		case 0:
			n = rng.Intn(71)
		case 1:
			n = 64 + rng.Intn(637)
		default:
			n = 700 + rng.Intn(2301)
		}
		spread := spreads[rng.Intn(len(spreads))]
		values := make([]int, n)
		for i := range values {
			values[i] = rng.Intn(spread + 1)
		}
		countSort(t, values, Options{NoGallop: trial%2 == 1, MinRun: minruns[rng.Intn(len(minruns))]})
	}
}

func TestStructuredInputs(t *testing.T) {
	rng := rand.New(rand.NewSource(7))
	for _, n := range []int{0, 1, 2, 3, 63, 64, 65, 1000, 4097, 20000} {
		for _, values := range shapes(n, rng) {
			dups := slices.Clone(values)
			for i := range dups {
				dups[i] /= 7
			}
			for _, noGallop := range []bool{false, true} {
				countSort(t, values, Options{NoGallop: noGallop})
				countSort(t, dups, Options{NoGallop: noGallop})
			}
		}
	}
}

func TestGallopingOnAndOffGiveTheSameOutput(t *testing.T) {
	rng := rand.New(rand.NewSource(11))
	for _, n := range []int{100, 1000, 5000} {
		for _, values := range shapes(n, rng) {
			for i := range values {
				values[i] /= 3
			}
			var c counter
			on, off := tagged(values), tagged(values)
			TimsortWith(on, c.less, Options{})
			TimsortWith(off, c.less, Options{NoGallop: true})
			if !slices.Equal(on, off) {
				t.Fatalf("n = %d: galloping changed the output", n)
			}
		}
	}
}

func TestInvariantsAfterEveryCollapse(t *testing.T) {
	rng := rand.New(rand.NewSource(17))
	for _, n := range []int{100, 1000, 5000, 30000} {
		for _, values := range shapes(n, rng) {
			for _, minrun := range []int{0, 1, 2, 5} {
				arr := slices.Clone(values)
				collapses := 0
				TimsortWith(arr, intLess, Options{MinRun: minrun, AfterCollapse: func(runs []Run) {
					collapses++
					if !InvariantsHold(runs) {
						t.Fatalf("n = %d, minrun %d: invariants broken: %v", n, minrun, runs)
					}
					base := 0
					for _, r := range runs {
						if r.Base != base || !slices.IsSorted(arr[r.Base:r.Base+r.Length]) {
							t.Fatalf("run %v is out of place or unsorted", r)
						}
						base += r.Length
					}
				}})
				if !slices.IsSorted(arr) || (n > 0 && collapses == 0) {
					t.Fatalf("n = %d, minrun %d: not sorted", n, minrun)
				}
			}
		}
	}
}

// Runs of 240, 160, 50, 40 and 60: the corrected rule merges them all when 60 arrives (the
// pre-2015 rule would stop at 240, 160, 90, 60, which breaks 240 > 160 + 90).
func TestTheFourthRunCheck(t *testing.T) {
	values := []int{}
	for j, length := range []int{240, 160, 50, 40, 60} {
		for k := 0; k < length; k++ {
			values = append(values, (5-j)*1000+k)
		}
	}
	if ComputeMinrun(len(values)) != 35 {
		t.Fatalf("minrun %d", ComputeMinrun(len(values)))
	}
	stacks := [][]int{}
	TimsortWith(values, intLess, Options{AfterCollapse: func(runs []Run) {
		s := []int{}
		for _, r := range runs {
			s = append(s, r.Length)
		}
		stacks = append(stacks, s)
	}})
	want := [][]int{{240}, {240, 160}, {240, 160, 50}, {240, 160, 50, 40}, {550}}
	if !slices.EqualFunc(stacks, want, slices.Equal[[]int]) {
		t.Fatalf("stacks %v", stacks)
	}
	if InvariantsHold([]Run{{0, 240}, {240, 160}, {400, 90}, {490, 60}}) || !slices.IsSorted(values) {
		t.Fatal("240, 160, 90, 60 must break the invariant")
	}
}

func TestStackStaysLogarithmic(t *testing.T) {
	rng := rand.New(rand.NewSource(19))
	for _, n := range []int{1000, 30000} {
		bound := 2
		for a, b := 1, 1; b <= n; bound++ {
			a, b = b, a+b
		}
		values := make([]int, n)
		for i := range values {
			values[i] = rng.Intn(4)
		}
		height := 0
		TimsortWith(values, intLess, Options{MinRun: 1, AfterCollapse: func(runs []Run) { height = max(height, len(runs)) }})
		if height > bound {
			t.Fatalf("n = %d: stack of %d runs, bound %d", n, height, bound)
		}
	}
}

func mergeTwo(left, right []int, gallop bool) ([]item, *mergeState[item], int) {
	var c counter
	arr := tagged(append(slices.Clone(left), right...))
	ms := &mergeState[item]{arr: arr, less: c.less, gallop: gallop, minGallop: MinGallop}
	ms.pending = []Run{{0, len(left)}, {len(left), len(right)}}
	ms.mergeAt(0)
	return arr, ms, c.comparisons
}

func TestMerges(t *testing.T) {
	rng := rand.New(rand.NewSource(23))
	for trial := 0; trial < 2000; trial++ {
		left, right := make([]int, 1+rng.Intn(30)), make([]int, 1+rng.Intn(30))
		for i := range left {
			left[i] = rng.Intn(7)
		}
		for i := range right {
			right[i] = rng.Intn(7)
		}
		sort.Ints(left)
		sort.Ints(right)
		for _, gallop := range []bool{true, false} {
			arr, ms, _ := mergeTwo(left, right, gallop)
			for i := 1; i < len(arr); i++ {
				if arr[i-1].key > arr[i].key || (arr[i-1].key == arr[i].key && arr[i-1].tag > arr[i].tag) {
					t.Fatalf("not a stable merge: %v", arr)
				}
			}
			if len(ms.pending) != 1 || ms.pending[0].Length != len(arr) {
				t.Fatalf("stack after the merge: %v", ms.pending)
			}
		}
	}
	// Blocks of 10 and 90 values take turns: min_gallop falls to 1, and galloping saves.
	tens, nineties := []int{}, []int{}
	for k := 0; k < 20; k++ {
		for j := 0; j < 10; j++ {
			tens = append(tens, k*100+j)
		}
		for j := 0; j < 90; j++ {
			nineties = append(nineties, k*100+10+j)
		}
	}
	for _, c := range []struct {
		left, right []int
		on, off     int
	}{{tens, nineties, 437, 1911}, {nineties, tens, 439, 1991}} {
		_, ms, on := mergeTwo(c.left, c.right, true)
		_, msOff, off := mergeTwo(c.left, c.right, false)
		if ms.minGallop != 1 || msOff.minGallop != MinGallop || on != c.on || off != c.off {
			t.Fatalf("min_gallop %d and %d, comparisons %d and %d", ms.minGallop, msOff.minGallop, on, off)
		}
	}
}

func TestCounts(t *testing.T) {
	for _, n := range []int{1, 2, 3, 63, 64, 65, 100, 129, 1000, 4096, 65537, 100000} {
		sorted, descending, equal := make([]int, n), make([]int, n), make([]int, n)
		for i := 0; i < n; i++ {
			sorted[i], descending[i], equal[i] = i, n-i, 5
		}
		for _, values := range [][]int{sorted, descending, equal} {
			if c := countSort(t, values, Options{}); c != n-1 {
				t.Fatalf("n = %d: %d comparisons, want %d", n, c, n-1)
			}
		}
	}
	if countSort(t, []int{}, Options{}) != 0 || countSort(t, []int{7}, Options{}) != 0 {
		t.Fatal("fewer than 2 values must cost nothing")
	}
	rng := rand.New(rand.NewSource(12))
	for _, n := range []int{2000, 20000} {
		values := shapes(n, rng)[longRuns]
		on, off := countSort(t, values, Options{}), countSort(t, values, Options{NoGallop: true})
		if on*2 >= off {
			t.Fatalf("n = %d: galloping %d, without %d", n, on, off)
		}
	}
}

// Comparisons counted on the Python implementation (timsort_test.py, PINNED) for the arrays
// pinnedInput(seed, n, mod, drift, block).
var pythonCases = []struct {
	seed            uint64
	n               int
	mod             uint64
	drift, block    int
	minrun, on, off int
}{
	{1, 0, 10, 0, 0, 0, 0, 0},
	{2, 1, 10, 0, 0, 0, 0, 0},
	{3, 2, 10, 0, 0, 0, 1, 1},
	{4, 5, 3, 0, 0, 0, 8, 8},
	{5, 12, 100, 0, 0, 4, 35, 35},
	{6, 16, 1000, 1, 4, 2, 39, 39},
	{7, 24, 4, 0, 0, 4, 91, 91},
	{8, 32, 1000, 50, 8, 4, 98, 98},
	{9, 63, 1000000, 0, 0, 0, 295, 295},
	{10, 64, 1000000, 0, 0, 0, 299, 299},
	{11, 65, 1000000, 0, 0, 0, 305, 305},
	{12, 100, 2, 0, 0, 0, 441, 453},
	{13, 128, 1000, 0, 32, 0, 491, 489},
	{14, 200, 1000, 5, 40, 0, 886, 884},
	{15, 255, 10, 0, 0, 0, 1564, 1637},
	{16, 256, 1000000, 0, 0, 0, 1716, 1716},
	{17, 300, 1000, 20, 100, 0, 730, 794},
	{18, 500, 1000000, 0, 0, 0, 3816, 3815},
	{19, 500, 1000, 0, 250, 0, 1955, 2147},
	{20, 640, 100, 3, 64, 0, 2196, 2289},
	{21, 1000, 1000000, 0, 0, 0, 8624, 8624},
	{22, 1000, 7, 0, 0, 0, 6285, 8040},
	{23, 1000, 1000000, 0, 77, 0, 4975, 4973},
	{24, 1000, 1000, 10, 50, 0, 4970, 5021},
	{25, 1000, 50, 1, 333, 0, 2695, 3145},
	{26, 1024, 1000000, 0, 0, 0, 8897, 8895},
	{27, 2000, 1000000, 0, 0, 0, 19269, 19264},
	{28, 2000, 1000, 100, 200, 0, 3028, 3439},
	{29, 2112, 1000000, 0, 0, 0, 20543, 20542},
	{30, 2500, 3, 0, 500, 0, 2769, 5709},
	{31, 3000, 1000000, 0, 1000, 0, 7990, 7992},
	{32, 3000, 1000000, 0, 0, 16, 31235, 31233},
	{33, 4096, 1000000, 0, 0, 0, 43833, 43830},
	{34, 4096, 100, 2, 128, 0, 12580, 14521},
	{35, 5000, 1000000, 0, 0, 0, 54951, 54948},
	{36, 5000, 1000, 1000, 5000, 0, 4999, 4999},
	{37, 5000, 1000000, 0, 0, 1, 58365, 58393},
	{38, 5000, 10, 0, 0, 0, 35244, 51217},
	{39, 6000, 1000, 50, 600, 0, 8705, 12877},
	{40, 8192, 1000000, 0, 0, 0, 95860, 95856},
}

func TestAgreementWithPython(t *testing.T) {
	for i, p := range pythonCases {
		values := pinnedInput(p.seed, p.n, p.mod, p.drift, p.block)
		on := countSort(t, values, Options{MinRun: p.minrun})
		off := countSort(t, values, Options{MinRun: p.minrun, NoGallop: true})
		if on != p.on || off != p.off {
			t.Fatalf("case %d: %d and %d comparisons, Python counted %d and %d", i, on, off, p.on, p.off)
		}
	}
}
