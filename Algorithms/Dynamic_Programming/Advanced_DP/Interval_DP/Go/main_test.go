package main

import (
	"errors"
	"math"
	"math/rand"
	"reflect"
	"strings"
	"testing"
)

// The worked example of the README: four piles.
var exPiles = []int64{3, 2, 4, 1}

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

// bruteBurst tries every order of bursts, by recursion on the next balloon to burst.
func bruteBurst(nums []int64) int64 {
	var best int64
	for p := range nums {
		left, right := int64(1), int64(1)
		if p > 0 {
			left = nums[p-1]
		}
		if p+1 < len(nums) {
			right = nums[p+1]
		}
		rest := append(append([]int64{}, nums[:p]...), nums[p+1:]...)
		if coins := left*nums[p]*right + bruteBurst(rest); coins > best {
			best = coins
		}
	}
	return best
}

func isPalindrome(s string) bool {
	for i, j := 0, len(s)-1; i < j; i, j = i+1, j-1 {
		if s[i] != s[j] {
			return false
		}
	}
	return true
}

// bruteCuts tries every set of cut positions: a cut after position p for each bit p of the mask.
func bruteCuts(s string) int {
	n := len(s)
	if n == 0 {
		return 0
	}
	best := n - 1
	for mask := 0; mask < 1<<(n-1); mask++ {
		ok, start, used := true, 0, 0
		for p := 0; p < n && ok; p++ {
			if p == n-1 || mask>>p&1 == 1 {
				ok = isPalindrome(s[start : p+1])
				start = p + 1
				if p < n-1 {
					used++
				}
			}
		}
		if ok && used < best {
			best = used
		}
	}
	return best
}

// applyMerges plays the merges out on the row of piles: each one must join two neighbouring
// piles that are exactly i..k and k+1..j. It returns the total cost and the piles left.
func applyMerges(t *testing.T, piles []int64, merges []Merge) (int64, [][2]int) {
	built := make([][2]int, len(piles))
	for i := range built {
		built[i] = [2]int{i, i}
	}
	var total int64
	for _, m := range merges {
		p := -1
		for q, b := range built {
			if b == [2]int{m.I, m.K} {
				p = q
			}
		}
		if p < 0 || p+1 >= len(built) || built[p+1] != [2]int{m.K + 1, m.J} {
			t.Fatalf("merge %v does not join two neighbouring piles in %v", m, built)
		}
		built = append(append(built[:p:p], [2]int{m.I, m.J}), built[p+2:]...)
		for x := m.I; x <= m.J; x++ {
			total += piles[x]
		}
	}
	return total, built
}

func randomValues(rng *rand.Rand, maxN, maxValue int) []int64 {
	v := make([]int64, rng.Intn(maxN+1))
	for i := range v {
		v[i] = int64(rng.Intn(maxValue + 1))
	}
	return v
}

func mustMerge(t *testing.T, piles []int64, want int64) {
	t.Helper()
	got, err := MergePiles(piles)
	memo, err2 := MergePilesMemo(piles)
	cost, _, err3 := MergePilesPlan(piles)
	if err != nil || err2 != nil || err3 != nil || got != want || memo != want || cost != want {
		t.Fatalf("merge %v = %d, %d, %d (%v %v %v), want %d", piles, got, memo, cost, err, err2, err3, want)
	}
}

func mustPlan(t *testing.T, piles []int64, wantCost int64, want []Merge) {
	t.Helper()
	cost, merges, err := MergePilesPlan(piles)
	if err != nil || cost != wantCost || !reflect.DeepEqual(merges, want) {
		t.Fatalf("MergePilesPlan(%v) = %d, %v, %v; want %d, %v", piles, cost, merges, err, wantCost, want)
	}
}

func mustBurst(t *testing.T, nums []int64, want int64) {
	t.Helper()
	if got, err := BurstBalloons(nums); err != nil || got != want {
		t.Fatalf("BurstBalloons(%v) = %d, %v; want %d", nums, got, err, want)
	}
}

func TestWorkedExample(t *testing.T) {
	mustMerge(t, exPiles, 20)
	mustPlan(t, exPiles, 20, []Merge{{0, 0, 1}, {2, 2, 3}, {0, 1, 3}})
	var c counters
	tables, err := fillMerge(exPiles, &c)
	if err != nil {
		t.Fatal(err)
	}
	if !reflect.DeepEqual(tables.prefix, []int64{0, 3, 5, 9, 10}) ||
		!reflect.DeepEqual(tables.dp, [][]int64{{0, 5, 14, 20}, {0, 0, 6, 12}, {0, 0, 0, 5}, {0, 0, 0, 0}}) ||
		!reflect.DeepEqual(tables.split, [][]int{{-1, 0, 1, 1}, {-1, -1, 1, 1}, {-1, -1, -1, 2}, {-1, -1, -1, -1}}) ||
		c.candidates != 10 {
		t.Fatalf("tables %v %v %v, %d candidates", tables.prefix, tables.dp, tables.split, c.candidates)
	}
	mustBurst(t, []int64{3, 1, 5, 8}, 167)
	mustBurst(t, []int64{1, 5}, 10)
	for s, want := range map[string]int{"aab": 1, "banana": 1, "abcde": 4} {
		if got := MinPalindromeCuts(s); got != want {
			t.Fatalf("MinPalindromeCuts(%q) = %d, want %d", s, got, want)
		}
	}
}

func TestAgainstBruteForce(t *testing.T) {
	rng := rand.New(rand.NewSource(1000))
	for n := 0; n < 400; n++ {
		piles := randomValues(rng, 7, []int{3, 9, 50}[n%3])
		mustMerge(t, piles, bruteMerge(piles))
	}
	for n := 0; n < 300; n++ {
		nums := randomValues(rng, 6, []int{3, 9, 20}[n%3])
		mustBurst(t, nums, bruteBurst(nums))
	}
	for n := 0; n < 500; n++ {
		alphabet := []string{"ab", "abc", "abcd"}[n%3]
		var b strings.Builder
		for size := rng.Intn(13); size > 0; size-- {
			b.WriteByte(alphabet[rng.Intn(len(alphabet))])
		}
		if s := b.String(); MinPalindromeCuts(s) != bruteCuts(s) {
			t.Fatalf("MinPalindromeCuts(%q) = %d, brute force %d", s, MinPalindromeCuts(s), bruteCuts(s))
		}
	}
}

func TestPlan(t *testing.T) {
	rng := rand.New(rand.NewSource(1547))
	for n := 0; n < 600; n++ {
		piles := randomValues(rng, 9, []int{2, 9, 100}[n%3])
		cost, merges, err := MergePilesPlan(piles)
		best, _ := MergePiles(piles)
		if err != nil || cost != best || len(merges) != max(0, len(piles)-1) {
			t.Fatalf("MergePilesPlan(%v) = %d, %v, %v", piles, cost, merges, err)
		}
		total, built := applyMerges(t, piles, merges)
		if total != cost || (len(piles) > 0 && len(built) != 1) {
			t.Fatalf("the merges of %v cost %d and leave %v, want %d and one pile", piles, total, built, cost)
		}
	}
	// The tie rule: the smallest k that reaches the minimum, in every cell.
	for n := 0; n < 250; n++ {
		piles := randomValues(rng, 6, []int{1, 2, 5}[n%3])
		tables, _ := fillMerge(piles, nil)
		for i := range piles {
			for j := i + 1; j < len(piles); j++ {
				sum := tables.prefix[j+1] - tables.prefix[i]
				best := bruteMerge(piles[i : j+1])
				want := -1
				for k := i; k < j && want < 0; k++ {
					if bruteMerge(piles[i:k+1])+bruteMerge(piles[k+1:j+1])+sum == best {
						want = k
					}
				}
				if tables.split[i][j] != want {
					t.Fatalf("split[%d][%d] of %v = %d, want %d", i, j, piles, tables.split[i][j], want)
				}
			}
		}
	}
	mustPlan(t, []int64{1, 1, 1, 1}, 8, []Merge{{0, 0, 1}, {2, 2, 3}, {0, 1, 3}})
	mustPlan(t, []int64{1, 1, 1}, 5, []Merge{{1, 1, 2}, {0, 0, 2}})
	mustPlan(t, []int64{2, 2, 2, 2, 2}, 24, []Merge{{0, 0, 1}, {3, 3, 4}, {2, 2, 4}, {0, 1, 4}})
	mustPlan(t, []int64{0, 0, 0, 0}, 0, []Merge{{2, 2, 3}, {1, 1, 3}, {0, 0, 3}})
	mustPlan(t, []int64{1, 2, 3}, 9, []Merge{{0, 0, 1}, {0, 1, 2}})
	mustPlan(t, []int64{3, 2, 1}, 9, []Merge{{1, 1, 2}, {0, 0, 2}})
}

func TestTopDown(t *testing.T) {
	rng := rand.New(rand.NewSource(877))
	for n := 0; n < 300; n++ {
		piles := randomValues(rng, 10, []int{2, 9, 99}[n%3])
		up, _ := fillMerge(piles, nil)
		down, _ := fillMergeMemo(piles, nil)
		if !reflect.DeepEqual(up, down) {
			t.Fatalf("top-down tables of %v differ: %v %v", piles, up, down)
		}
	}
}

func TestEdgeCases(t *testing.T) {
	mustMerge(t, nil, 0)
	mustPlan(t, []int64{}, 0, []Merge{})
	mustBurst(t, nil, 0)
	mustMerge(t, []int64{7}, 0)
	mustPlan(t, []int64{7}, 0, []Merge{})
	mustBurst(t, []int64{7}, 7)
	mustPlan(t, []int64{4, 9}, 13, []Merge{{0, 0, 1}})
	mustMerge(t, []int64{4, 9}, 13)
	mustBurst(t, []int64{4, 9}, 45)
	mustMerge(t, []int64{5, 5, 5, 5, 5, 5, 5, 5}, 120)
	mustBurst(t, []int64{2, 2, 2, 2}, 22)
	mustMerge(t, []int64{0, 0, 0}, 0)
	mustBurst(t, []int64{0, 0}, 0)
	mustBurst(t, []int64{0, 5, 0}, 5)
	ones := make([]int64, 64)
	for i := range ones {
		ones[i] = 1
	}
	mustMerge(t, ones, 384)
	cases := map[string]int{"": 0, "x": 0, "ab": 1, "aa": 0, "aaaaaa": 0, strings.Repeat("ab", 30): 1}
	// Bytes, not characters: the two bytes of the UTF-8 e-acute differ, so "a e-acute a" is four
	// bytes and no palindrome (Python compares code points and returns 0).
	cases["a\xc3\xa9a"] = 3
	for s, want := range cases {
		if got := MinPalindromeCuts(s); got != want {
			t.Fatalf("MinPalindromeCuts(%q) = %d, want %d", s, got, want)
		}
	}
}

func TestInvalidInput(t *testing.T) {
	bad := []int64{3, -1, 2}
	_, err1 := MergePiles(bad)
	_, _, err2 := MergePilesPlan(bad)
	_, err3 := MergePilesMemo(bad)
	_, err4 := BurstBalloons(bad)
	_, err5 := MergePiles([]int64{-5})
	for i, err := range []error{err1, err2, err3, err4, err5} {
		if !errors.Is(err, ErrInvalidInput) {
			t.Fatalf("case %d: got %v, want ErrInvalidInput", i, err)
		}
	}
	if _, merges, _ := MergePilesPlan(bad); merges != nil {
		t.Fatalf("bad input returned merges %v", merges)
	}
}

func TestOverflow(t *testing.T) {
	const half = int64(1) << 62
	isOverflow := func(err error) bool { return errors.Is(err, ErrOverflow) }
	// 2^63 does not fit; 2^63 - 1 does.
	_, err1 := MergePiles([]int64{half, half})
	_, _, err2 := MergePilesPlan([]int64{half, half})
	_, err3 := MergePilesMemo([]int64{half, half})
	// The total fits, but every split costs more than math.MaxInt64: 5 * 2^61.
	_, err4 := MergePiles([]int64{1 << 61, 1 << 61, 1 << 61})
	_, err5 := MergePilesMemo([]int64{1 << 61, 1 << 61, 1 << 61})
	// Two piles whose total does not fit cannot be merged.
	_, err6 := MergePiles([]int64{math.MaxInt64, 1})
	// Coins: 3037000500^2 does not fit.
	_, err7 := BurstBalloons([]int64{3037000500, 3037000500})
	_, err8 := BurstBalloons([]int64{math.MaxInt64, 1})
	for i, err := range []error{err1, err2, err3, err4, err5, err6, err7, err8} {
		if !isOverflow(err) {
			t.Fatalf("case %d: got %v, want ErrOverflow", i, err)
		}
	}
	mustMerge(t, []int64{half, half - 1}, math.MaxInt64)
	// The split after pile 1 would cost 2^63 + 1; the minimum, after pile 0, fits.
	mustPlan(t, []int64{half, 0, 1}, half+2, []Merge{{1, 1, 2}, {0, 0, 2}})
	mustMerge(t, []int64{half, 0, 1}, half+2)
	// One pile costs 0 whatever its size.
	mustMerge(t, []int64{math.MaxInt64}, 0)
	mustBurst(t, []int64{3037000499, 3037000499}, 9223372033963249500)
	mustBurst(t, []int64{math.MaxInt64}, math.MaxInt64)
}

func TestWorkCounts(t *testing.T) {
	for n := 0; n <= 25; n++ {
		want := (n*n*n - n) / 6 // sum over lengths L of (n - L + 1)(L - 1)
		ones := make([]int64, n)
		for i := range ones {
			ones[i] = 1
		}
		var up, down, b, distinct, same counters
		fillMerge(ones, &up)
		fillMergeMemo(ones, &down)
		burst(ones, &b)
		letters := make([]byte, n)
		for i := range letters {
			letters[i] = byte('A' + i)
		}
		cuts(string(letters), &distinct) // no palindrome longer than one letter
		cuts(strings.Repeat("a", n), &same)
		if up.candidates != want || down.candidates != want || b.candidates != n*(n+1)*(n+2)/6 || distinct.candidates != want || same.candidates != 0 {
			t.Fatalf("n = %d: %d %d %d %d %d candidates, want %d", n, up.candidates, down.candidates, b.candidates, distinct.candidates, same.candidates, want)
		}
	}
	// A range that is not a palindrome tries its j - i cuts; a palindrome tries none.
	rng := rand.New(rand.NewSource(131))
	for n := 0; n < 200; n++ {
		var sb strings.Builder
		for size := rng.Intn(15); size > 0; size-- {
			sb.WriteByte("abc"[rng.Intn(3)])
		}
		s := sb.String()
		want := 0
		for i := range s {
			for j := i + 1; j < len(s); j++ {
				if !isPalindrome(s[i : j+1]) {
					want += j - i
				}
			}
		}
		var c counters
		cuts(s, &c)
		if c.candidates != want {
			t.Fatalf("%q: %d candidates, want %d", s, c.candidates, want)
		}
	}
	var counts []int
	for _, n := range []int{10, 20, 40, 80} {
		var c counters
		fillMerge(make([]int64, n), &c)
		counts = append(counts, c.candidates)
	}
	if !reflect.DeepEqual(counts, []int{165, 1330, 10660, 85320}) {
		t.Fatalf("counts %v", counts)
	}
}

// Outputs computed by running the Python implementation (interval_dp.py): fixed cases first,
// then seeded random ones. merge_piles_plan's cost and merges (merge_piles and
// merge_piles_memo return the same cost), burst_balloons, and min_palindrome_cuts.
type pythonMerge struct {
	piles  []int64
	cost   int64
	merges []Merge
}

type pythonBurst struct {
	nums  []int64
	coins int64
}

type pythonCut struct {
	s    string
	cuts int
}

var pythonMerges = []pythonMerge{
	{[]int64{3, 2, 4, 1}, 20, []Merge{{0, 0, 1}, {2, 2, 3}, {0, 1, 3}}},
	{[]int64{}, 0, []Merge{}},
	{[]int64{7}, 0, []Merge{}},
	{[]int64{4, 9}, 13, []Merge{{0, 0, 1}}},
	{[]int64{1, 1, 1}, 5, []Merge{{1, 1, 2}, {0, 0, 2}}},
	{[]int64{1, 1, 1, 1}, 8, []Merge{{0, 0, 1}, {2, 2, 3}, {0, 1, 3}}},
	{[]int64{2, 2, 2, 2, 2}, 24, []Merge{{0, 0, 1}, {3, 3, 4}, {2, 2, 4}, {0, 1, 4}}},
	{[]int64{0, 0, 0, 0}, 0, []Merge{{2, 2, 3}, {1, 1, 3}, {0, 0, 3}}},
	{[]int64{1, 2, 3}, 9, []Merge{{0, 0, 1}, {0, 1, 2}}},
	{[]int64{3, 2, 1}, 9, []Merge{{1, 1, 2}, {0, 0, 2}}},
	{[]int64{5, 1, 4, 2, 8, 3}, 58, []Merge{{1, 1, 2}, {1, 2, 3}, {0, 0, 3}, {4, 4, 5}, {0, 3, 5}}},
	{[]int64{10, 0, 10, 0, 10}, 70, []Merge{{1, 1, 2}, {3, 3, 4}, {1, 2, 4}, {0, 0, 4}}},
	{[]int64{4611686018427387904, 4611686018427387903}, 9223372036854775807, []Merge{{0, 0, 1}}},
	{[]int64{4611686018427387904, 0, 1}, 4611686018427387906, []Merge{{1, 1, 2}, {0, 0, 2}}},
	{[]int64{1000000000000000, 1000000000000000, 1000000000000000, 1000000000000000, 1000000000000000, 1000000000000000, 1000000000000000, 1000000000000000}, 24000000000000000, []Merge{{0, 0, 1}, {2, 2, 3}, {0, 1, 3}, {4, 4, 5}, {6, 6, 7}, {4, 5, 7}, {0, 3, 7}}},
	{[]int64{97, 3, 2, 5, 55, 1, 30, 15}, 476, []Merge{{1, 1, 2}, {1, 2, 3}, {1, 3, 4}, {5, 5, 6}, {5, 6, 7}, {1, 4, 7}, {0, 0, 7}}},
	{[]int64{85, 7, 5, 3, 3}, 138, []Merge{{3, 3, 4}, {2, 2, 4}, {1, 1, 4}, {0, 0, 4}}},
	{[]int64{25, 3, 98, 1, 90, 2, 2, 0}, 567, []Merge{{0, 0, 1}, {0, 1, 2}, {3, 3, 4}, {6, 6, 7}, {5, 5, 7}, {3, 4, 7}, {0, 2, 7}}},
	{[]int64{2, 16, 15, 2, 10, 29, 2}, 209, []Merge{{0, 0, 1}, {3, 3, 4}, {2, 2, 4}, {0, 1, 4}, {5, 5, 6}, {0, 4, 6}}},
	{[]int64{2, 14, 15, 35, 10, 0, 3, 91, 1}, 453, []Merge{{0, 0, 1}, {0, 1, 2}, {5, 5, 6}, {4, 4, 6}, {3, 3, 6}, {0, 2, 6}, {7, 7, 8}, {0, 6, 8}}},
	{[]int64{2, 1, 2, 10, 15, 25}, 108, []Merge{{1, 1, 2}, {0, 0, 2}, {0, 2, 3}, {0, 3, 4}, {0, 4, 5}}},
	{[]int64{1, 2, 13, 0, 75, 21, 3, 19}, 322, []Merge{{0, 0, 1}, {2, 2, 3}, {0, 1, 3}, {0, 3, 4}, {6, 6, 7}, {5, 5, 7}, {0, 4, 7}}},
	{[]int64{12, 3, 1, 1, 0, 6, 0, 1, 34}, 110, []Merge{{3, 3, 4}, {2, 2, 4}, {1, 1, 4}, {6, 6, 7}, {5, 5, 7}, {1, 4, 7}, {0, 0, 7}, {0, 7, 8}}},
	{[]int64{43, 1, 6, 1, 46}, 163, []Merge{{2, 2, 3}, {1, 1, 3}, {0, 0, 3}, {0, 3, 4}}},
	{[]int64{3, 7, 2, 2}, 28, []Merge{{0, 0, 1}, {2, 2, 3}, {0, 1, 3}}},
	{[]int64{1, 67}, 68, []Merge{{0, 0, 1}}},
	{[]int64{3, 2, 52, 99, 0, 19, 3, 3, 20}, 502, []Merge{{0, 0, 1}, {0, 1, 2}, {4, 4, 5}, {6, 6, 7}, {4, 5, 7}, {4, 7, 8}, {3, 3, 8}, {0, 2, 8}}},
	{[]int64{3, 2, 2, 2, 0}, 20, []Merge{{0, 0, 1}, {3, 3, 4}, {2, 2, 4}, {0, 1, 4}}},
	{[]int64{100, 77, 0, 63, 4}, 518, []Merge{{2, 2, 3}, {2, 3, 4}, {1, 1, 4}, {0, 0, 4}}},
	{[]int64{90, 48, 6, 77}, 406, []Merge{{1, 1, 2}, {1, 2, 3}, {0, 0, 3}}},
	{[]int64{3, 10, 10, 13, 27}, 135, []Merge{{0, 0, 1}, {2, 2, 3}, {0, 1, 3}, {0, 3, 4}}},
	{[]int64{2, 82, 9, 2}, 190, []Merge{{0, 0, 1}, {2, 2, 3}, {0, 1, 3}}},
	{[]int64{20, 5, 7, 8}, 72, []Merge{{1, 1, 2}, {1, 2, 3}, {0, 0, 3}}},
	{[]int64{17, 11, 1}, 41, []Merge{{1, 1, 2}, {0, 0, 2}}},
	{[]int64{16, 90, 88, 1, 3, 0, 2, 3, 66}, 633, []Merge{{0, 0, 1}, {3, 3, 4}, {5, 5, 6}, {5, 6, 7}, {3, 4, 7}, {3, 7, 8}, {2, 2, 8}, {0, 1, 8}}},
	{[]int64{11, 17, 66, 14, 0}, 230, []Merge{{0, 0, 1}, {3, 3, 4}, {2, 2, 4}, {0, 1, 4}}},
	{[]int64{14, 6, 0, 74, 4, 2, 0, 1, 20}, 279, []Merge{{1, 1, 2}, {0, 0, 2}, {0, 2, 3}, {6, 6, 7}, {5, 5, 7}, {4, 4, 7}, {4, 7, 8}, {0, 3, 8}}},
	{[]int64{9, 39, 0, 63, 55}, 364, []Merge{{1, 1, 2}, {0, 0, 2}, {0, 2, 3}, {0, 3, 4}}},
	{[]int64{1, 6, 1, 14, 1, 8, 1}, 88, []Merge{{1, 1, 2}, {0, 0, 2}, {0, 2, 3}, {5, 5, 6}, {4, 4, 6}, {0, 3, 6}}},
	{[]int64{1, 16, 3, 2, 14, 14, 1}, 139, []Merge{{0, 0, 1}, {2, 2, 3}, {0, 1, 3}, {5, 5, 6}, {4, 4, 6}, {0, 3, 6}}},
}

var pythonBursts = []pythonBurst{
	{[]int64{3, 1, 5, 8}, 167},
	{[]int64{1, 5}, 10},
	{[]int64{}, 0},
	{[]int64{7}, 7},
	{[]int64{4, 9}, 45},
	{[]int64{2, 2, 2, 2}, 22},
	{[]int64{0, 0}, 0},
	{[]int64{0, 5, 0}, 5},
	{[]int64{3037000499, 3037000499}, 9223372033963249500},
	{[]int64{9223372036854775807}, 9223372036854775807},
	{[]int64{48, 5, 2}, 624},
	{[]int64{3, 56, 2, 42}, 11928},
	{[]int64{2, 5, 19}, 247},
	{[]int64{2, 10, 0, 3, 1}, 72},
	{[]int64{3}, 3},
	{[]int64{39, 3, 6}, 975},
	{[]int64{88, 1, 5, 76}, 40656},
	{[]int64{3, 1, 5}, 35},
	{[]int64{62, 12, 4, 3}, 3968},
	{[]int64{13, 0, 18, 0, 2, 2}, 579},
	{[]int64{3, 5, 30, 1}, 600},
	{[]int64{1, 4, 0, 15, 3, 56}, 6216},
	{[]int64{4}, 4},
	{[]int64{93, 34, 27, 8, 65}, 285378},
}

var pythonCuts = []pythonCut{
	{"aab", 1},
	{"", 0},
	{"x", 0},
	{"ab", 1},
	{"aa", 0},
	{"banana", 1},
	{"abcde", 4},
	{"racecar", 0},
	{"aaaaaa", 0},
	{"abacdc", 1},
	{"abababababababababababababababababababababababababababababab", 1},
	{"bababaadbccaaa", 5},
	{"ababaadaaaba", 3},
	{"cab", 2},
	{"cbaac", 3},
	{"bdbcaaab", 3},
	{"badbabbbabaab", 5},
	{"bdbbc", 2},
	{"abaaccdacb", 6},
	{"caca", 1},
	{"aa", 0},
	{"bbbbbbc", 1},
	{"abacbaac", 4},
	{"cbabaababaab", 3},
}

func TestAgreementWithPython(t *testing.T) {
	for i, c := range pythonMerges {
		cost, merges, err := MergePilesPlan(c.piles)
		best, err2 := MergePiles(c.piles)
		memo, err3 := MergePilesMemo(c.piles)
		if err != nil || err2 != nil || err3 != nil || cost != c.cost || best != c.cost || memo != c.cost || !reflect.DeepEqual(merges, c.merges) {
			t.Fatalf("merge case %d differs from Python: %d %v %d %d", i, cost, merges, best, memo)
		}
	}
	for i, c := range pythonBursts {
		if coins, err := BurstBalloons(c.nums); err != nil || coins != c.coins {
			t.Fatalf("burst case %d differs from Python: %d %v", i, coins, err)
		}
	}
	for i, c := range pythonCuts {
		if got := MinPalindromeCuts(c.s); got != c.cuts {
			t.Fatalf("cuts case %d differs from Python: %d", i, got)
		}
	}
}
