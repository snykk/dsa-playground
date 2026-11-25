package main

import (
	"errors"
	"math"
	"math/big"
	"math/bits"
	"reflect"
	"slices"
	"strings"
	"testing"
)

// The pinned values (between the PINNED markers) were computed by the Python implementation
// (combinatorics.py). The rest checks every count against a brute-force enumeration on small
// inputs, the three binomial methods against each other and against math/big's Binomial, the
// modular tables against Pascal's triangle taken modulo p, the edge cases and errors, and the
// 64-bit limits: the last row of Pascal's triangle that fits, and the first count that fails.

// PINNED (generated from Python)
var pinnedBinomials = []struct {
	n, k  int64
	value uint64
}{
	{0, 0, 1}, {1, 0, 1}, {1, 1, 1},
	{5, 2, 10}, {6, 3, 20}, {10, 3, 120},
	{10, 7, 120}, {10, -1, 0}, {10, 11, 0},
	{-3, 2, 0}, {-1, -1, 0}, {20, 10, 184756},
	{30, 15, 155117520}, {52, 5, 2598960}, {60, 30, 118264581564861424},
	{62, 31, 465428353255261088}, {64, 32, 1832624140942590534}, {66, 33, 7219428434016265740},
	{67, 33, 14226520737620288370}, {67, 34, 14226520737620288370}, {100, 3, 161700},
	{100, 97, 161700}, {1000, 2, 499500}, {1000, 5, 8250291250200},
	{4294967296, 2, 9223372034707292160}, {1000000000, 2, 499999999500000000}, {1000000000000000000, 1, 1000000000000000000},
	{9223372036854775807, 1, 9223372036854775807}, {9223372036854775807, 9223372036854775806, 9223372036854775807}, {9223372036854775807, 9223372036854775807, 1},
}
var pinnedOverflows = [][2]int64{
	{68, 34}, {68, 33}, {100, 50}, {1000000000000000000, 2}, {8589934592, 3}, {9223372036854775807, 2},
}
var pascalRow10 = []uint64{1, 10, 45, 120, 210, 252, 210, 120, 45, 10, 1}
var pascalRow67 = []uint64{
	1, 67, 2211, 47905,
	766480, 9657648, 99795696, 869648208,
	6522361560, 42757703560, 247994680648, 1285063345176,
	5996962277488, 25371763481680, 97862516286480, 345780890878896,
	1123787895356412, 3371363686069236, 9364899127970100, 24151581961607100,
	57963796707857040, 129728497393775280, 271250494550621040, 530707489338171600,
	972963730453314600, 1673497616379701112, 2703342303382594104, 4105075349580976232,
	5864393356544251760, 7886597962249166160, 9989690752182277136, 11923179284862717872,
	13413576695470557606, 14226520737620288370, 14226520737620288370, 13413576695470557606,
	11923179284862717872, 9989690752182277136, 7886597962249166160, 5864393356544251760,
	4105075349580976232, 2703342303382594104, 1673497616379701112, 972963730453314600,
	530707489338171600, 271250494550621040, 129728497393775280, 57963796707857040,
	24151581961607100, 9364899127970100, 3371363686069236, 1123787895356412,
	345780890878896, 97862516286480, 25371763481680, 5996962277488,
	1285063345176, 247994680648, 42757703560, 6522361560,
	869648208, 99795696, 9657648, 766480,
	47905, 2211, 67, 1,
}

type modQuery struct {
	n, k  int64
	value uint64
}

var pinnedMod = []struct {
	nMax            int
	p               uint64
	queries         []modQuery
	multiplications int
}{
	{6, 13, []modQuery{{6, 2, 2}, {6, 3, 7}, {5, 2, 10}, {0, 0, 1}, {6, 7, 0}, {6, -1, 0}}, 19},
	{10, 1000000007, []modQuery{{10, 3, 120}, {10, 5, 252}, {7, 7, 1}}, 65},
	{1000, 1000000007, []modQuery{{1000, 500, 159835829}, {1000, 3, 166167000}, {999, 1, 999}}, 2045},
	{12, 13, []modQuery{{12, 6, 1}, {12, 1, 12}, {11, 4, 5}}, 31},
	{50, 998244353, []modQuery{{50, 25, 927528656}, {40, 20, 88808106}}, 158},
	{30, 2305843009213693951, []modQuery{{30, 15, 155117520}, {25, 12, 5200300}}, 181},
	{20, 18446744073709551557, []modQuery{{20, 10, 184756}, {20, 1, 20}}, 164},
	{1, 2, []modQuery{{1, 0, 1}, {1, 1, 1}, {0, 0, 1}}, 2},
	{0, 2, []modQuery{{0, 0, 1}, {0, 1, 0}}, 0},
}
var fact6Mod13 = []uint64{1, 1, 2, 6, 11, 3, 5}
var invFact6Mod13 = []uint64{1, 1, 7, 11, 6, 9, 8}
var catalan0To36 = []uint64{
	1, 1, 2, 5,
	14, 42, 132, 429,
	1430, 4862, 16796, 58786,
	208012, 742900, 2674440, 9694845,
	35357670, 129644790, 477638700, 1767263190,
	6564120420, 24466267020, 91482563640, 343059613650,
	1289904147324, 4861946401452, 18367353072152, 69533550916004,
	263747951750360, 1002242216651368, 3814986502092304, 14544636039226909,
	55534064877048198, 212336130412243110, 812944042149730764, 3116285494907301262,
	11959798385860453492,
}
var derangements0To20 = []uint64{
	1, 0, 1, 2,
	9, 44, 265, 1854,
	14833, 133496, 1334961, 14684570,
	176214841, 2290792932, 32071101049, 481066515734,
	7697064251745, 130850092279664, 2355301661033953, 44750731559645106,
	895014631192902121,
}
var pinnedStars = []struct {
	n, k            int64
	plain, positive uint64
}{
	{0, 0, 1, 1}, {5, 0, 0, 0}, {0, 3, 1, 0},
	{5, 3, 21, 6}, {3, 5, 35, 0}, {5, 5, 126, 1},
	{10, 4, 286, 84}, {1, 1, 1, 1}, {7, 1, 1, 1},
	{100, 10, 4263421511271, 1731030945644}, {60, 8, 869648208, 341149446},
}

// END PINNED

const mod = 1000000007

// musts returns helpers that unwrap a (value, error) pair and fail the test on an error, one
// per result type: a count, a list of counts, the rows of a triangle and a ModBinomial.
func musts(t *testing.T) (func(uint64, error) uint64, func([]uint64, error) []uint64, func([][]uint64, error) [][]uint64, func(*ModBinomial, error) *ModBinomial) {
	fail := func(err error) {
		t.Helper()
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
	}
	return func(v uint64, err error) uint64 { t.Helper(); fail(err); return v },
		func(v []uint64, err error) []uint64 { t.Helper(); fail(err); return v },
		func(v [][]uint64, err error) [][]uint64 { t.Helper(); fail(err); return v },
		func(v *ModBinomial, err error) *ModBinomial { t.Helper(); fail(err); return v }
}

func isPrime(n uint64) bool {
	if n < 2 {
		return false
	}
	for d := uint64(2); d <= n/d; d++ {
		if n%d == 0 {
			return false
		}
	}
	return true
}

// pascalModM is Pascal's triangle with every addition taken modulo m: an independent C(n, k) mod m.
func pascalModM(n int, m uint64) [][]uint64 {
	rows := [][]uint64{{1 % m}}
	for r := 1; r <= n; r++ {
		row := make([]uint64, r+1)
		row[0], row[r] = 1%m, 1%m
		for j := 1; j < r; j++ {
			row[j] = (rows[r-1][j-1] + rows[r-1][j]) % m
		}
		rows = append(rows, row)
	}
	return rows
}

func subsetsOfSize(n, k int) uint64 {
	var count uint64
	for mask := uint32(0); mask < 1<<n; mask++ {
		if bits.OnesCount32(mask) == k {
			count++
		}
	}
	return count
}

func balancedStrings(n int) uint64 {
	var count uint64
	for mask := uint32(0); mask < 1<<(2*n); mask++ {
		depth := 0
		ok := true
		for i := 0; i < 2*n && ok; i++ {
			if mask>>i&1 == 1 {
				depth++
			} else {
				depth--
			}
			ok = depth >= 0
		}
		if ok && depth == 0 {
			count++
		}
	}
	return count
}

// derangementsByEnumeration counts the permutations of 0..n-1 with no fixed point.
func derangementsByEnumeration(n int) uint64 {
	used := make([]bool, n)
	var count uint64
	var place func(i int)
	place = func(i int) {
		if i == n {
			count++
			return
		}
		for v := 0; v < n; v++ {
			if !used[v] && v != i {
				used[v] = true
				place(i + 1)
				used[v] = false
			}
		}
	}
	place(0)
	return count
}

func distributions(n, k, atLeast int) uint64 {
	if k == 0 {
		if n == 0 {
			return 1
		}
		return 0
	}
	var count uint64
	for first := atLeast; first <= n; first++ {
		count += distributions(n-first, k-1, atLeast)
	}
	return count
}

func TestPinnedValues(t *testing.T) {
	mustU, mustList, mustRows, mustTable := musts(t)
	for _, c := range pinnedBinomials {
		if got := mustU(Binomial(c.n, c.k)); got != c.value {
			t.Errorf("Binomial(%d, %d) = %d, want %d", c.n, c.k, got, c.value)
		}
		if c.n <= 2000 {
			if got := mustU(BinomialPascal(c.n, c.k)); got != c.value {
				t.Errorf("BinomialPascal(%d, %d) = %d, want %d", c.n, c.k, got, c.value)
			}
		}
	}
	for _, c := range pinnedOverflows {
		if _, err := Binomial(c[0], c[1]); !errors.Is(err, ErrOverflow) {
			t.Errorf("Binomial(%d, %d): err = %v, want ErrOverflow", c[0], c[1], err)
		}
		if c[0] <= 2000 {
			if _, err := BinomialPascal(c[0], c[1]); !errors.Is(err, ErrOverflow) {
				t.Errorf("BinomialPascal(%d, %d): err = %v, want ErrOverflow", c[0], c[1], err)
			}
		}
	}
	if rows := mustRows(PascalTriangle(10)); !slices.Equal(rows[10], pascalRow10) {
		t.Errorf("row 10 = %v", rows[10])
	}
	for _, c := range pinnedMod {
		b := mustTable(NewModBinomial(c.nMax, c.p))
		if b.Multiplications != c.multiplications {
			t.Errorf("NewModBinomial(%d, %d).Multiplications = %d, want %d", c.nMax, c.p, b.Multiplications, c.multiplications)
		}
		for _, q := range c.queries {
			if got := mustU(b.Binomial(q.n, q.k)); got != q.value {
				t.Errorf("C(%d, %d) mod %d = %d, want %d", q.n, q.k, c.p, got, q.value)
			}
		}
	}
	b := mustTable(NewModBinomial(6, 13))
	if !slices.Equal(b.Fact, fact6Mod13) || !slices.Equal(b.InvFact, invFact6Mod13) {
		t.Errorf("tables mod 13: %v %v", b.Fact, b.InvFact)
	}
	if got := mustList(CatalanNumbers(36)); !slices.Equal(got, catalan0To36) {
		t.Errorf("CatalanNumbers(36) = %v", got)
	}
	for n := int64(0); n <= 33; n++ {
		if got := mustU(Catalan(n)); got != catalan0To36[n] {
			t.Errorf("Catalan(%d) = %d", n, got)
		}
	}
	if got := mustList(DerangementNumbers(20)); !slices.Equal(got, derangements0To20) {
		t.Errorf("DerangementNumbers(20) = %v", got)
	}
	for _, c := range pinnedStars {
		if got := mustU(StarsAndBars(c.n, c.k)); got != c.plain {
			t.Errorf("StarsAndBars(%d, %d) = %d, want %d", c.n, c.k, got, c.plain)
		}
		if got := mustU(StarsAndBarsPositive(c.n, c.k)); got != c.positive {
			t.Errorf("StarsAndBarsPositive(%d, %d) = %d, want %d", c.n, c.k, got, c.positive)
		}
	}
}

func TestAgainstEnumeration(t *testing.T) {
	mustU, mustList, _, _ := musts(t)
	for n := 0; n <= 16; n++ {
		for k := -2; k <= n+2; k++ {
			var want uint64
			if k >= 0 && k <= n {
				want = subsetsOfSize(n, k)
			}
			if got := mustU(Binomial(int64(n), int64(k))); got != want {
				t.Errorf("Binomial(%d, %d) = %d, want %d", n, k, got, want)
			}
			if got := mustU(BinomialPascal(int64(n), int64(k))); got != want {
				t.Errorf("BinomialPascal(%d, %d) = %d, want %d", n, k, got, want)
			}
		}
	}
	for n := 0; n <= 10; n++ {
		want := balancedStrings(n)
		cat := mustList(CatalanNumbers(n))
		if cat[n] != want || mustU(Catalan(int64(n))) != want {
			t.Errorf("Catalan %d: %d and %d, want %d", n, cat[n], mustU(Catalan(int64(n))), want)
		}
	}
	d := mustList(DerangementNumbers(9))
	for n := 0; n <= 9; n++ {
		if want := derangementsByEnumeration(n); d[n] != want {
			t.Errorf("D(%d) = %d, want %d", n, d[n], want)
		}
	}
	for n := 0; n <= 8; n++ {
		for k := 0; k <= 5; k++ {
			if got, want := mustU(StarsAndBars(int64(n), int64(k))), distributions(n, k, 0); got != want {
				t.Errorf("StarsAndBars(%d, %d) = %d, want %d", n, k, got, want)
			}
			if got, want := mustU(StarsAndBarsPositive(int64(n), int64(k))), distributions(n, k, 1); got != want {
				t.Errorf("StarsAndBarsPositive(%d, %d) = %d, want %d", n, k, got, want)
			}
		}
	}
}

func TestThreeMethodsAgree(t *testing.T) {
	mustU, _, mustRows, mustTable := musts(t)
	rows := mustRows(PascalTriangle(67))
	table := mustTable(NewModBinomial(67, mod))
	for n := 0; n <= 67; n++ {
		for k := -1; k <= n+1; k++ {
			var want uint64
			if k >= 0 && k <= n {
				want = rows[n][k]
				if exact := new(big.Int).Binomial(int64(n), int64(k)); !exact.IsUint64() || exact.Uint64() != want {
					t.Fatalf("row %d column %d = %d, math/big says %v", n, k, want, exact)
				}
			}
			if got := mustU(Binomial(int64(n), int64(k))); got != want {
				t.Errorf("Binomial(%d, %d) = %d, want %d", n, k, got, want)
			}
			if got := mustU(BinomialPascal(int64(n), int64(k))); got != want {
				t.Errorf("BinomialPascal(%d, %d) = %d, want %d", n, k, got, want)
			}
			if got := mustU(table.Binomial(int64(n), int64(k))); got != want%mod {
				t.Errorf("C(%d, %d) mod p = %d, want %d", n, k, got, want%mod)
			}
		}
	}
	// Large n, small k (as far as C(n, k) fits): against math/big and the symmetric side.
	for _, c := range [][2]int64{{1000, 3}, {2000000, 3}, {4294967296, 2}, {1000000000000, 1}} {
		n := c[0]
		for k := int64(0); k <= c[1]; k++ {
			a, b := mustU(Binomial(n, k)), mustU(Binomial(n, n-k))
			if exact := new(big.Int).Binomial(n, k); a != b || exact.Uint64() != a {
				t.Errorf("C(%d, %d): %d, %d, math/big %v", n, k, a, b, exact)
			}
		}
	}
}

func TestModAgainstPascalModP(t *testing.T) {
	mustU, _, _, mustTable := musts(t)
	for p := uint64(2); p < 200; p++ {
		if !isPrime(p) {
			continue
		}
		table := mustTable(NewModBinomial(int(p)-1, p)) // the largest table p allows
		rows := pascalModM(int(p)-1, p)
		for n := 0; n < int(p); n++ {
			for k := 0; k <= n; k++ {
				if got := mustU(table.Binomial(int64(n), int64(k))); got != rows[n][k] {
					t.Fatalf("C(%d, %d) mod %d = %d, want %d", n, k, p, got, rows[n][k])
				}
			}
		}
	}
	// 64-bit moduli: the products need 128 bits; the exact values are small enough to compare.
	for _, p := range []uint64{2305843009213693951, 18446744073709551557, 998244353} {
		table := mustTable(NewModBinomial(40, p))
		for n := int64(0); n <= 40; n++ {
			for k := int64(0); k <= n; k++ {
				if got, want := mustU(table.Binomial(n, k)), mustU(Binomial(n, k))%p; got != want {
					t.Fatalf("C(%d, %d) mod %d = %d, want %d", n, k, p, got, want)
				}
			}
		}
	}
	large := mustTable(NewModBinomial(1000000, mod))
	if got := mustU(large.Binomial(1000000, 500000)); got != 996692777 {
		t.Errorf("C(10^6, 5 * 10^5) mod p = %d", got)
	}
}

func TestCompositeModulus(t *testing.T) {
	mustU, _, _, _ := musts(t)
	// Either NewModBinomial refuses m, or every answer it gives is right.
	accepted := 0
	for m := uint64(2); m < 160; m++ {
		rows := pascalModM(24, m)
		for nMax := 0; nMax < int(min(m, 25)); nMax++ {
			table, err := NewModBinomial(nMax, m)
			if err != nil {
				if isPrime(m) || !errors.Is(err, ErrNotPrime) {
					t.Fatalf("NewModBinomial(%d, %d): %v", nMax, m, err)
				}
				continue
			}
			if !isPrime(m) {
				accepted++
			}
			for n := 0; n <= nMax; n++ {
				for k := 0; k <= n; k++ {
					if got := mustU(table.Binomial(int64(n), int64(k))); got != rows[n][k] {
						t.Fatalf("C(%d, %d) mod %d = %d, want %d", n, k, m, got, rows[n][k])
					}
				}
			}
		}
	}
	if accepted == 0 {
		t.Error("no composite modulus passed, though nMax <= 1 always does")
	}
	_, err := NewModBinomial(6, 8)
	if want := "p = 8 is not prime: 0 * 0 % 8 = 0, so the power p - 2 did not invert 6! modulo p: the modulus must be a prime"; err == nil || err.Error() != want {
		t.Errorf("NewModBinomial(6, 8): %v", err)
	}
	_, err = NewModBinomial(2, 9)
	if err == nil || !strings.HasPrefix(err.Error(), "p = 9 is not prime: 2 * 2 % 9 = 4") {
		t.Errorf("NewModBinomial(2, 9): %v", err)
	}
}

func TestWorkCounters(t *testing.T) {
	_, _, _, mustTable := musts(t)
	// One modular inverse: the build makes 2 * nMax products plus those of a single power.
	for _, c := range []struct {
		nMax int
		p    uint64
	}{{0, 2}, {10, 13}, {1000, mod}, {100000, 998244353}, {20, 18446744073709551557}} {
		b := mustTable(NewModBinomial(c.nMax, c.p))
		_, power := PowMod(b.Fact[c.nMax], c.p-2, c.p)
		if b.Multiplications != 2*c.nMax+power || b.Multiplications > 2*c.nMax+128 {
			t.Errorf("NewModBinomial(%d, %d): %d multiplications, power %d", c.nMax, c.p, b.Multiplications, power)
		}
	}
	if v, n := PowMod(2, 10, 1000); v != 24 || n != 6 {
		t.Errorf("PowMod(2, 10, 1000) = %d, %d", v, n)
	}
	if v, n := PowMod(5, 11, 13); v != 8 || n != 7 {
		t.Errorf("PowMod(5, 11, 13) = %d, %d", v, n)
	}
	if v, _ := PowMod(7, 0, 1); v != 0 {
		t.Errorf("PowMod(7, 0, 1) = %d", v)
	}
	if MulMod(math.MaxUint64-1, math.MaxUint64-1, math.MaxUint64) != 1 {
		t.Error("MulMod needs 128 bits")
	}
}

func wantError(t *testing.T, err, target error, message string) {
	t.Helper()
	if !errors.Is(err, target) {
		t.Errorf("err = %v, want %v", err, target)
	} else if message != "" && err.Error() != message {
		t.Errorf("message %q, want %q", err.Error(), message)
	}
}

func Test64BitLimits(t *testing.T) {
	mustU, mustList, mustRows, _ := musts(t)
	// Row 67 is the last row of Pascal's triangle that fits in 64 bits; row 66 the last in int64.
	rows := mustRows(PascalTriangle(67))
	if !slices.Equal(rows[67], pascalRow67) {
		t.Errorf("row 67 = %v", rows[67])
	}
	if slices.Max(rows[66]) > math.MaxInt64 || slices.Max(rows[67]) <= math.MaxInt64 {
		t.Error("row 66 should be the last that fits in int64")
	}
	_, err := PascalTriangle(68)
	wantError(t, err, ErrOverflow, "C(68, 31) does not fit in 64 bits")
	if got := mustU(Binomial(67, 33)); got != 14226520737620288370 {
		t.Errorf("Binomial(67, 33) = %d", got)
	}
	_, err = Binomial(68, 34)
	wantError(t, err, ErrOverflow, "C(68, 34) does not fit in 64 bits")
	_, err = BinomialPascal(68, 34)
	wantError(t, err, ErrOverflow, "C(68, 34) does not fit in 64 bits")
	_, err = BinomialPascal(100, 20) // k = 20: found by a sum that wraps
	wantError(t, err, ErrOverflow, "")
	if got := mustU(BinomialPascal(67, 34)); got != 14226520737620288370 {
		t.Errorf("BinomialPascal(67, 34) = %d", got)
	}
	if got := mustU(Binomial(math.MaxInt64, math.MaxInt64-1)); got != math.MaxInt64 {
		t.Errorf("Binomial(MaxInt64, MaxInt64 - 1) = %d", got)
	}
	_, err = Binomial(math.MaxInt64, 2)
	wantError(t, err, ErrOverflow, "")
	// Catalan: the recurrence reaches C_36; the closed form needs C(2n, n) and stops at n = 33.
	if cat := mustList(CatalanNumbers(36)); cat[36] != 11959798385860453492 {
		t.Errorf("C_36 = %d", cat[36])
	}
	_, err = CatalanNumbers(37)
	wantError(t, err, ErrOverflow, "the Catalan number C_37 does not fit in 64 bits")
	if got := mustU(Catalan(33)); got != 212336130412243110 {
		t.Errorf("Catalan(33) = %d", got)
	}
	_, err = Catalan(34)
	wantError(t, err, ErrOverflow, "C(68, 34) does not fit in 64 bits")
	_, err = Catalan(math.MaxInt64)
	wantError(t, err, ErrOverflow, "")
	if d := mustList(DerangementNumbers(20)); d[20] != 895014631192902121 {
		t.Errorf("D(20) = %d", d[20])
	}
	_, err = DerangementNumbers(21)
	wantError(t, err, ErrOverflow, "D(21) does not fit in 64 bits")
	_, err = DerangementNumbers(1000000000) // stops at D(21), allocates nothing big
	wantError(t, err, ErrOverflow, "")
	_, err = StarsAndBars(math.MaxInt64, 2)
	wantError(t, err, ErrOverflow, "")
}

func TestEdgesAndErrors(t *testing.T) {
	mustU, mustList, mustRows, mustTable := musts(t)
	for _, f := range []func(n, k int64) (uint64, error){Binomial, BinomialPascal} {
		cases := [][3]int64{{0, 0, 1}, {0, 1, 0}, {0, -1, 0}, {5, -1, 0}, {5, 6, 0}, {-4, 2, 0}, {-4, -5, 0}, {7, 0, 1}, {7, 7, 1}, {7, 1, 7}}
		for _, c := range cases {
			if got := mustU(f(c[0], c[1])); got != uint64(c[2]) {
				t.Errorf("C(%d, %d) = %d, want %d", c[0], c[1], got, c[2])
			}
		}
	}
	if rows := mustRows(PascalTriangle(0)); !reflect.DeepEqual(rows, [][]uint64{{1}}) {
		t.Errorf("PascalTriangle(0) = %v", rows)
	}
	if got := mustList(CatalanNumbers(0)); !slices.Equal(got, []uint64{1}) {
		t.Errorf("CatalanNumbers(0) = %v", got)
	}
	if mustU(Catalan(0)) != 1 || mustU(Catalan(1)) != 1 {
		t.Error("Catalan(0) and Catalan(1) are 1")
	}
	if got := mustList(DerangementNumbers(0)); !slices.Equal(got, []uint64{1}) {
		t.Errorf("DerangementNumbers(0) = %v", got)
	}
	if got := mustList(DerangementNumbers(1)); !slices.Equal(got, []uint64{1, 0}) {
		t.Errorf("DerangementNumbers(1) = %v", got)
	}
	stars := [][4]int64{{0, 0, 1, 1}, {4, 0, 0, 0}, {0, 4, 1, 0}, {3, 4, 20, 0}, {4, 4, 35, 1}}
	for _, c := range stars {
		if mustU(StarsAndBars(c[0], c[1])) != uint64(c[2]) || mustU(StarsAndBarsPositive(c[0], c[1])) != uint64(c[3]) {
			t.Errorf("stars and bars (%d, %d)", c[0], c[1])
		}
	}
	_, err := PascalTriangle(-1)
	wantError(t, err, ErrNegative, "n = -1 must not be negative")
	_, err = CatalanNumbers(-1)
	wantError(t, err, ErrNegative, "")
	_, err = Catalan(-1)
	wantError(t, err, ErrNegative, "")
	_, err = DerangementNumbers(-1)
	wantError(t, err, ErrNegative, "")
	_, err = StarsAndBars(-1, 3)
	wantError(t, err, ErrNegative, "")
	_, err = StarsAndBars(3, -1)
	wantError(t, err, ErrNegative, "k = -1 must not be negative")
	_, err = StarsAndBarsPositive(-1, -1)
	wantError(t, err, ErrNegative, "")
	_, err = NewModBinomial(-1, 13)
	wantError(t, err, ErrNegative, "nMax = -1 must not be negative")
	_, err = NewModBinomial(0, 1)
	wantError(t, err, ErrNotPrime, "p = 1 is not prime: the modulus must be a prime")
	_, err = NewModBinomial(0, 0)
	wantError(t, err, ErrNotPrime, "")
	for _, c := range []struct {
		nMax int
		p    uint64
	}{{7, 7}, {9, 7}, {2, 2}, {100, 97}} {
		_, err = NewModBinomial(c.nMax, c.p)
		wantError(t, err, ErrNotBelowP, "")
	}
	_, err = NewModBinomial(9, 7)
	wantError(t, err, ErrNotBelowP, "nMax = 9 >= p = 7: p divides n! for every n >= p, so n! has no inverse modulo p; Lucas's theorem handles n >= p")
	b := mustTable(NewModBinomial(5, 13))
	_, err = b.Binomial(6, 2)
	wantError(t, err, ErrPastTable, "n = 6 is past the table: it was built for n <= 5")
	if mustU(b.Binomial(6, 7)) != 0 || mustU(b.Binomial(-1, 0)) != 0 {
		t.Error("the guard comes before the table")
	}
	smallest := mustTable(NewModBinomial(0, 2))
	if mustU(smallest.Binomial(0, 0)) != 1 || smallest.Multiplications != 0 {
		t.Error("NewModBinomial(0, 2)")
	}
}
