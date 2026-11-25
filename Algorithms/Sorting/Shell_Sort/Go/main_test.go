package main

import (
	"math"
	"math/rand"
	"slices"
	"sort"
	"strings"
	"testing"
)

var allSequences = []Sequence{Shell, Knuth, Ciura}

var example = []int{98, 69, 74, 79, 60, 91, 41, 99, 18, 63, 93, 38}

// counter counts the calls to less (comparisons) and the calls that return true: HSortGeneric
// shifts an element exactly when less(key, arr[j-gap]) is true, so that is the shift count.
type counter struct{ comparisons, shifts int }

func (c *counter) less(a, b int) bool {
	c.comparisons++
	if a < b {
		c.shifts++
		return true
	}
	return false
}

func countSort(t *testing.T, values []int, seq Sequence) counter {
	t.Helper()
	var c counter
	arr := append([]int(nil), values...)
	ShellSortGeneric(arr, c.less, seq)
	want := append([]int(nil), values...)
	sort.Ints(want)
	if !slices.Equal(arr, want) {
		t.Fatalf("%v: got %v, want %v", seq, arr, want)
	}
	return c
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

// badInput is Shell's bad case for n a power of 2: 1, n/2 + 1, 2, n/2 + 2, ...
func badInput(n int) []int {
	out := []int{}
	for i := 0; i < n/2; i++ {
		out = append(out, i+1, n/2+i+1)
	}
	return out
}

func isHSorted(arr []int, h int) bool {
	for i := 0; i+h < len(arr); i++ {
		if arr[i] > arr[i+h] {
			return false
		}
	}
	return true
}

func mustPanic(t *testing.T, want string, f func()) {
	t.Helper()
	defer func() {
		r := recover()
		if r == nil {
			t.Fatalf("expected a panic containing %q", want)
		}
		if msg, ok := r.(string); !ok || !strings.Contains(msg, want) {
			t.Fatalf("panic %v does not contain %q", r, want)
		}
	}()
	f()
}

// ---------------------------------------------------------------- gap sequences

// Computed by the Python implementation (gap_sequence): n, Shell, Knuth, Ciura.
var gapCases = []struct {
	n                   int
	shell, knuth, ciura []int
}{
	{0, []int{}, []int{}, []int{}},
	{1, []int{}, []int{}, []int{}},
	{2, []int{1}, []int{1}, []int{1}},
	{5, []int{2, 1}, []int{4, 1}, []int{4, 1}},
	{11, []int{5, 2, 1}, []int{4, 1}, []int{10, 4, 1}},
	{24, []int{12, 6, 3, 1}, []int{13, 4, 1}, []int{23, 10, 4, 1}},
	{100, []int{50, 25, 12, 6, 3, 1}, []int{40, 13, 4, 1}, []int{57, 23, 10, 4, 1}},
	{702, []int{351, 175, 87, 43, 21, 10, 5, 2, 1}, []int{364, 121, 40, 13, 4, 1}, []int{701, 301, 132, 57, 23, 10, 4, 1}},
	{1578, []int{789, 394, 197, 98, 49, 24, 12, 6, 3, 1}, []int{1093, 364, 121, 40, 13, 4, 1}, []int{1577, 701, 301, 132, 57, 23, 10, 4, 1}},
	{100000, []int{50000, 25000, 12500, 6250, 3125, 1562, 781, 390, 195, 97, 48, 24, 12, 6, 3, 1}, []int{88573, 29524, 9841, 3280, 1093, 364, 121, 40, 13, 4, 1}, []int{90927, 40412, 17961, 7983, 3548, 1577, 701, 301, 132, 57, 23, 10, 4, 1}},
	{1000000, []int{500000, 250000, 125000, 62500, 31250, 15625, 7812, 3906, 1953, 976, 488, 244, 122, 61, 30, 15, 7, 3, 1}, []int{797161, 265720, 88573, 29524, 9841, 3280, 1093, 364, 121, 40, 13, 4, 1}, []int{460316, 204585, 90927, 40412, 17961, 7983, 3548, 1577, 701, 301, 132, 57, 23, 10, 4, 1}},
}

func TestGapSequences(t *testing.T) {
	for _, c := range gapCases {
		if !slices.Equal(ShellGaps(c.n), c.shell) || !slices.Equal(KnuthGaps(c.n), c.knuth) ||
			!slices.Equal(CiuraGaps(c.n), c.ciura) {
			t.Fatalf("n = %d: %v %v %v", c.n, ShellGaps(c.n), KnuthGaps(c.n), CiuraGaps(c.n))
		}
		if !slices.Equal(GapSequence(c.n, Shell), c.shell) || !slices.Equal(GapSequence(c.n, Knuth), c.knuth) ||
			!slices.Equal(GapSequence(c.n, Ciura), c.ciura) {
			t.Fatalf("GapSequence(%d) differs", c.n)
		}
	}
	for n := -3; n < 3000; n++ {
		for _, seq := range allSequences {
			gaps := GapSequence(n, seq)
			if n < 2 {
				if len(gaps) != 0 {
					t.Fatalf("%v, n = %d: %v", seq, n, gaps)
				}
				continue
			}
			if gaps[len(gaps)-1] != 1 || gaps[0] >= n {
				t.Fatalf("%v, n = %d: %v", seq, n, gaps)
			}
			for i := 1; i < len(gaps); i++ {
				if gaps[i-1] <= gaps[i] {
					t.Fatalf("%v, n = %d: not decreasing %v", seq, n, gaps)
				}
			}
		}
	}
}

func TestDefaultIsTheZeroValue(t *testing.T) {
	var seq Sequence
	if seq != Ciura || seq.String() != "ciura" || Knuth.String() != "knuth" || Shell.String() != "shell" {
		t.Fatal("Ciura must be the zero value; String must match the Python names")
	}
}

// The extension is floor(2.25 h), and no sequence overflows, even for n near math.MaxInt.
func TestGapsAtTheLimit(t *testing.T) {
	for _, n := range []int{math.MaxInt, math.MaxInt - 1, math.MaxInt/2 + 1, 4940934027514224368} {
		for _, seq := range allSequences {
			gaps := GapSequence(n, seq)
			if gaps[0] >= n || gaps[0] <= 0 || gaps[len(gaps)-1] != 1 {
				t.Fatalf("%v, n = %d: %v", seq, n, gaps)
			}
			for i := 1; i < len(gaps); i++ {
				if gaps[i-1] <= gaps[i] {
					t.Fatalf("%v, n = %d: not decreasing %v", seq, n, gaps)
				}
			}
		}
		ciura := CiuraGaps(n)
		slices.Reverse(ciura)
		if len(ciura) < 40 || ciura[7] != 701 || ciura[8] != 1577 || ciura[len(ciura)-1] <= n/3 {
			t.Fatalf("n = %d: %v", n, ciura)
		}
		for i := 8; i < len(ciura); i++ {
			if ciura[i] != 2*ciura[i-1]+ciura[i-1]/4 {
				t.Fatalf("n = %d: %d does not follow %d", n, ciura[i], ciura[i-1])
			}
		}
		knuth := KnuthGaps(n)
		for i := 1; i < len(knuth); i++ {
			if knuth[i-1] != 3*knuth[i]+1 {
				t.Fatalf("n = %d: %v", n, knuth)
			}
		}
	}
}

func TestUnknownSequencePanics(t *testing.T) {
	mustPanic(t, "shellsort: unknown gap sequence 7", func() { GapSequence(10, Sequence(7)) })
	mustPanic(t, "unknown gap sequence -1", func() { ShellSort([]int{3, 1, 2}, Sequence(-1)) })
	mustPanic(t, "unknown gap sequence 3", func() { ShellSort([]int{}, Sequence(3)) })
}

// ---------------------------------------------------------------- sorting

func TestShellSortEdgeCases(t *testing.T) {
	cases := [][]int{{}, {42}, {2, 1}, {3, -1, 3, 0, -1, 2, 2}, {5, 5, 5, 5, 5, 5},
		{1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12}, {12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1},
		{3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5}, example, {math.MaxInt, math.MinInt, 0, -1}}
	for _, seq := range allSequences {
		for _, c := range cases {
			arr := append([]int(nil), c...)
			want := append([]int(nil), c...)
			sort.Ints(want)
			ShellSort(arr, seq)
			if !slices.Equal(arr, want) {
				t.Errorf("%v: expected %v, got %v", seq, want, arr)
			}
		}
	}
	words := []string{"pear", "fig", "apple", "kiwi", "date", "plum"}
	ShellSortGeneric(words, func(a, b string) bool { return a < b }, Knuth)
	if !sort.StringsAreSorted(words) {
		t.Errorf("strings not sorted: %v", words)
	}
}

func TestRandomAgainstSortInts(t *testing.T) {
	rng := rand.New(rand.NewSource(20261124))
	for _, seq := range allSequences {
		for trial := 0; trial < 400; trial++ {
			n := rng.Intn(151)
			spread := []int{2, 10, 1000, 1000000000}[rng.Intn(4)]
			arr := make([]int, n)
			for i := range arr {
				arr[i] = rng.Intn(2*spread+1) - spread
			}
			want := append([]int(nil), arr...)
			sort.Ints(want)
			ShellSort(arr, seq)
			if !slices.Equal(arr, want) {
				t.Fatalf("%v: got %v, want %v", seq, arr, want)
			}
		}
		for _, n := range []int{1000, 5000, 20000} {
			arr := make([]int, n)
			for i := range arr {
				arr[i] = rng.Intn(n + 1)
			}
			want := append([]int(nil), arr...)
			sort.Ints(want)
			ShellSort(arr, seq)
			if !slices.Equal(arr, want) {
				t.Fatalf("%v, n = %d: not sorted", seq, n)
			}
		}
	}
}

// ShellSort is HSort over GapSequence; after each pass the array is h-sorted for that gap and
// still for every earlier one.
func TestEachPassLeavesTheArrayHSorted(t *testing.T) {
	rng := rand.New(rand.NewSource(4))
	for _, seq := range allSequences {
		for _, n := range []int{0, 1, 2, 3, 10, 57, 200, 1000, 3000} {
			arr := make([]int, n)
			for i := range arr {
				arr[i] = rng.Intn(51)
			}
			viaSort := append([]int(nil), arr...)
			ShellSort(viaSort, seq)
			done := []int{}
			for _, gap := range GapSequence(n, seq) {
				HSort(arr, gap)
				done = append(done, gap)
				for _, h := range done {
					if !isHSorted(arr, h) {
						t.Fatalf("%v, n = %d: not %d-sorted after the gap-%d pass", seq, n, h, gap)
					}
				}
			}
			if !slices.Equal(arr, viaSort) {
				t.Fatalf("%v, n = %d: the passes differ from ShellSort", seq, n)
			}
		}
	}
	arr := append([]int(nil), example...)
	want := [][]int{
		{93, 38, 74, 79, 60, 91, 41, 99, 18, 63, 98, 69},
		{18, 38, 41, 69, 60, 63, 74, 79, 93, 91, 98, 99},
		{18, 38, 41, 60, 63, 69, 74, 79, 91, 93, 98, 99},
	}
	for i, gap := range []int{10, 4, 1} {
		HSort(arr, gap)
		if !slices.Equal(arr, want[i]) {
			t.Fatalf("after gap %d: %v", gap, arr)
		}
	}
}

func TestHSort(t *testing.T) {
	arr := []int{9, 8, 7, 6, 5, 4, 3, 2, 1, 0}
	HSort(arr, 3)
	if !slices.Equal(arr, []int{0, 2, 1, 3, 5, 4, 6, 8, 7, 9}) {
		t.Errorf("one gap-3 pass: %v", arr)
	}
	same := []int{5, 4, 3, 2, 1}
	for _, gap := range []int{5, 6, 100} {
		HSort(same, gap)
		if !slices.Equal(same, []int{5, 4, 3, 2, 1}) {
			t.Errorf("gap %d >= n changed the slice: %v", gap, same)
		}
	}
	HSort([]int{}, 1)
	mustPanic(t, "shellsort: gap must be at least 1, got 0", func() { HSort([]int{3, 2, 1}, 0) })
	mustPanic(t, "got -2", func() { HSort([]int{3, 2, 1}, -2) })
}

// [2a, 2b, 2c, 2d, 1e]: the gap-4 pass swaps 2a and 1e, carrying 2a past its three twins.
func TestNotStable(t *testing.T) {
	type rec struct {
		key int
		tag byte
	}
	byKey := func(a, b rec) bool { return a.key < b.key }
	input := []rec{{2, 'a'}, {2, 'b'}, {2, 'c'}, {2, 'd'}, {1, 'e'}}
	tags := func(arr []rec) string {
		s := ""
		for _, r := range arr {
			s += string(r.tag)
		}
		return s
	}
	for _, c := range []struct {
		seq  Sequence
		want string
	}{{Ciura, "ebcda"}, {Knuth, "ebcda"}, {Shell, "ebadc"}} {
		arr := append([]rec(nil), input...)
		ShellSortGeneric(arr, byKey, c.seq)
		if got := tags(arr); got != c.want {
			t.Errorf("%v: got %s, want %s", c.seq, got, c.want)
		}
	}
	arr := append([]rec(nil), input...)
	HSortGeneric(arr, byKey, 1) // the gap-1 pass alone is insertion sort: stable
	if got := tags(arr); got != "eabcd" {
		t.Errorf("gap-1 pass: got %s", got)
	}
}

// ---------------------------------------------------------------- counted work

func TestCounts(t *testing.T) {
	// Sorted input: one comparison per element per pass, no shift. Fails when the inner loop
	// no longer stops at the first element that is not larger.
	for _, seq := range allSequences {
		for _, n := range []int{1, 2, 10, 1000, 5000} {
			sorted := make([]int, n)
			for i := range sorted {
				sorted[i] = i
			}
			want := 0
			for _, g := range GapSequence(n, seq) {
				want += n - g
			}
			if c := countSort(t, sorted, seq); c.comparisons != want || c.shifts != 0 {
				t.Errorf("%v, n = %d: %+v, want %d comparisons", seq, n, c, want)
			}
		}
	}
	// Shell's gaps on the bad input: n(n - 2)/8 + (log2(n) - 1) n + 1 comparisons.
	for k := 2; k < 12; k++ {
		n := 1 << k
		c := countSort(t, badInput(n), Shell)
		if c.shifts != n*(n-2)/8 || c.comparisons != n*(n-2)/8+(k-1)*n+1 {
			t.Errorf("bad input n = %d: %+v", n, c)
		}
	}
	if c := countSort(t, badInput(1024), Knuth); c != (counter{9447, 3912}) {
		t.Errorf("Knuth on the bad input: %+v", c)
	}
	if c := countSort(t, badInput(1024), Ciura); c != (counter{10621, 4008}) {
		t.Errorf("Ciura on the bad input: %+v", c)
	}
	for _, c := range []struct {
		seq  Sequence
		want counter
	}{{Ciura, counter{27, 12}}, {Knuth, counter{28, 14}}, {Shell, counter{38, 18}}} {
		if got := countSort(t, example, c.seq); got != c.want {
			t.Errorf("worked example, %v: %+v, want %+v", c.seq, got, c.want)
		}
	}
}

// ---------------------------------------------------------------- agreement with Python

// Comparisons and shifts counted on the Python implementation (shell_sort_test.py, PINNED) for
// the arrays lcgValues(seed, n, mod).
var pythonCases = []struct {
	seed                uint64
	n                   int
	mod                 uint64
	seq                 Sequence
	comparisons, shifts int
}{
	{1, 0, 10, Shell, 0, 0},
	{2, 1, 10, Ciura, 0, 0},
	{3, 2, 10, Knuth, 1, 1},
	{4, 5, 3, Ciura, 6, 2},
	{5, 7, 100, Shell, 15, 7},
	{6, 9, 5, Knuth, 15, 6},
	{7, 12, 1000, Ciura, 32, 16},
	{8, 16, 4, Shell, 53, 6},
	{9, 20, 1000, Knuth, 79, 45},
	{10, 24, 1000, Ciura, 92, 45},
	{11, 31, 2, Shell, 105, 15},
	{12, 33, 50, Knuth, 131, 66},
	{13, 40, 1000, Ciura, 229, 123},
	{14, 50, 7, Shell, 285, 98},
	{15, 64, 1000, Knuth, 386, 217},
	{16, 64, 1000, Ciura, 386, 184},
	{17, 64, 1000, Shell, 486, 191},
	{18, 100, 100, Ciura, 676, 310},
	{19, 127, 1000000, Knuth, 957, 564},
	{20, 128, 3, Shell, 907, 172},
	{21, 200, 1000000, Ciura, 1859, 977},
	{22, 255, 10, Knuth, 1679, 674},
	{23, 256, 1000000, Shell, 3435, 1763},
	{24, 300, 1000000, Ciura, 2980, 1550},
	{25, 500, 1000000, Knuth, 5693, 3436},
	{26, 500, 1000000, Shell, 6145, 2898},
	{27, 701, 1000000, Ciura, 8359, 4304},
	{28, 702, 1000000, Ciura, 8622, 4584},
	{29, 1000, 1000000, Shell, 14858, 7372},
	{30, 1000, 1000000, Knuth, 14370, 9348},
	{31, 1000, 1000000, Ciura, 13104, 6783},
	{32, 1000, 2, Ciura, 7247, 610},
	{33, 1578, 1000000, Ciura, 22481, 11861},
	{34, 2000, 1000000, Shell, 34406, 17379},
	{35, 2000, 1000000, Knuth, 33207, 21781},
	{36, 2000, 1000000, Ciura, 29947, 15689},
	{37, 4096, 1000000, Shell, 182694, 139731},
	{38, 4096, 1000000, Knuth, 79480, 53326},
	{39, 4096, 1000000, Ciura, 68653, 35909},
	{40, 5000, 100, Ciura, 68396, 26992},
}

func TestAgreementWithPython(t *testing.T) {
	for i, p := range pythonCases {
		c := countSort(t, lcgValues(p.seed, p.n, p.mod), p.seq)
		if c.comparisons != p.comparisons || c.shifts != p.shifts {
			t.Errorf("agreement case %d differs from Python: %+v, want %d and %d", i, c, p.comparisons, p.shifts)
		}
	}
}
