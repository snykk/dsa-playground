package main

import (
	"errors"
	"math"
	"math/big"
	"reflect"
	"testing"
)

// The pinned values (between the PINNED markers) were computed by the Python implementation
// (eulers_totient.py). The rest checks Phi against a count of gcds, the sieve against Phi, the
// properties the code relies on, Euler's theorem and the inverse against math/big's
// ModInverse (an extended Euclid), the edge cases and the 64-bit limits.

// PINNED (generated from Python)
var pinnedPhi = [][2]uint64{
	{1, 1}, {2, 1}, {3, 2},
	{4, 2}, {5, 4}, {6, 2},
	{7, 6}, {8, 4}, {9, 6},
	{10, 4}, {12, 4}, {30, 8},
	{36, 12}, {97, 96}, {100, 40},
	{360, 96}, {1001, 720}, {1024, 512},
	{65536, 32768}, {65537, 65536}, {999983, 999982},
	{4294967291, 4294967290}, {12884901873, 8589934580}, {999999999989, 999999999988},
	{1000000000000000000, 400000000000000000}, {9223372036854775808, 4611686018427387904}, {12157665459056928801, 8105110306037952534},
	{9223372036854775807, 7713001620195508224}, {18446744073709551614, 7713001620195508224}, {18446691297133592627, 18446673704946499656},
	{18446744073709551615, 9208981628670443520},
}
var pinnedFactors = []struct {
	n       uint64
	factors []Factor
}{
	{1, []Factor{}},
	{2, []Factor{{2, 1}}},
	{360, []Factor{{2, 3}, {3, 2}, {5, 1}}},
	{1001, []Factor{{7, 1}, {11, 1}, {13, 1}}},
	{9223372036854775808, []Factor{{2, 63}}},
	{1000000000000000000, []Factor{{2, 18}, {5, 18}}},
	{9223372036854775807, []Factor{{7, 2}, {73, 1}, {127, 1}, {337, 1}, {92737, 1}, {649657, 1}}},
	{18446744073709551615, []Factor{{3, 1}, {5, 1}, {17, 1}, {257, 1}, {641, 1}, {65537, 1}, {6700417, 1}}},
}
var pinnedInverses = [][3]uint64{
	{3, 7, 5}, {7, 360, 103},
	{2, 18446744073709551615, 9223372036854775808}, {1, 1, 0},
	{5, 1, 0}, {10, 17, 12},
	{3, 1000000000000000000, 666666666666666667}, {999999999999999999, 1000000000000000000, 999999999999999999},
	{12345, 9223372036854775808, 5288216061308878345}, {2, 4294967291, 2147483646},
	{7, 18446744073709551615, 15811494920322472813},
}
var sieve30Phi = []int{0, 1, 1, 2, 2, 4, 2, 6, 4, 6, 4, 10, 4, 12, 6, 8, 8, 16, 6, 18, 8, 12, 10, 22, 8, 20, 12, 18, 12, 28, 8}
var sieve30SPF = []int{0, 0, 2, 3, 2, 5, 2, 7, 2, 3, 2, 11, 2, 13, 2, 3, 2, 17, 2, 19, 2, 3, 2, 23, 2, 5, 2, 3, 2, 29, 2}
var sieve30Primes = []int{2, 3, 5, 7, 11, 13, 17, 19, 23, 29}

const sieve30Crossings = 19

// END PINNED

func mustPhi(t *testing.T, n uint64) uint64 {
	t.Helper()
	f, err := Phi(n)
	if err != nil {
		t.Fatalf("Phi(%d): %v", n, err)
	}
	return f
}

func mustFactors(t *testing.T, n uint64) []Factor {
	t.Helper()
	fs, err := PrimeFactors(n)
	if err != nil {
		t.Fatalf("PrimeFactors(%d): %v", n, err)
	}
	return fs
}

func mustSieve(t *testing.T, n int) TotientSieve {
	t.Helper()
	s, err := LinearSieve(n)
	if err != nil {
		t.Fatalf("LinearSieve(%d): %v", n, err)
	}
	return s
}

func phiByGcd(n uint64) uint64 {
	var count uint64
	for k := uint64(1); k <= n; k++ {
		if gcd(k, n) == 1 {
			count++
		}
	}
	return count
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

func divisorsFromFactors(factors []Factor) []uint64 {
	ds := []uint64{1}
	for _, f := range factors {
		var next []uint64
		for _, d := range ds {
			power := uint64(1)
			for e := 0; e <= f.Exp; e++ {
				next = append(next, d*power)
				if e < f.Exp {
					power *= f.Prime
				}
			}
		}
		ds = next
	}
	return ds
}

// inverseByExtendedGcd is the reference: math/big's ModInverse, an extended Euclid.
func inverseByExtendedGcd(a, n uint64) (uint64, bool) {
	if n == 1 {
		return 0, true
	}
	var x big.Int
	if x.ModInverse(new(big.Int).SetUint64(a%n), new(big.Int).SetUint64(n)) == nil {
		return 0, false
	}
	return x.Uint64(), true
}

func TestPinnedValues(t *testing.T) {
	for _, c := range pinnedPhi {
		if got := mustPhi(t, c[0]); got != c[1] {
			t.Errorf("Phi(%d) = %d, want %d", c[0], got, c[1])
		}
	}
	for _, c := range pinnedFactors {
		if got := mustFactors(t, c.n); !reflect.DeepEqual(got, c.factors) {
			t.Errorf("PrimeFactors(%d) = %v, want %v", c.n, got, c.factors)
		}
	}
	for _, c := range pinnedInverses {
		got, err := ModInverseEuler(c[0], c[1])
		if err != nil || got != c[2] {
			t.Errorf("ModInverseEuler(%d, %d) = %d, %v, want %d", c[0], c[1], got, err, c[2])
		}
	}
	s := mustSieve(t, 30)
	if !reflect.DeepEqual(s.Phi, sieve30Phi) || !reflect.DeepEqual(s.SPF, sieve30SPF) || !reflect.DeepEqual(s.Primes, sieve30Primes) || s.Crossings != sieve30Crossings {
		t.Errorf("LinearSieve(30) = %+v", s)
	}
}

func TestAgainstGcdCount(t *testing.T) {
	for n := uint64(1); n <= 3000; n++ {
		if got, want := mustPhi(t, n), phiByGcd(n); got != want {
			t.Fatalf("Phi(%d) = %d, want %d", n, got, want)
		}
	}
}

func TestOneZeroAndPrimes(t *testing.T) {
	if mustPhi(t, 1) != 1 || len(mustFactors(t, 1)) != 0 {
		t.Error("Phi(1) must be 1 with no prime factors")
	}
	if _, err := Phi(0); !errors.Is(err, ErrZero) {
		t.Errorf("Phi(0) error = %v, want ErrZero", err)
	}
	if _, err := PrimeFactors(0); !errors.Is(err, ErrZero) {
		t.Errorf("PrimeFactors(0) error = %v, want ErrZero", err)
	}
	primes := []uint64{65537, 999983, 4294967291, 999999999989}
	for p := uint64(2); p < 2000; p++ {
		if isPrime(p) {
			primes = append(primes, p)
		}
	}
	for _, p := range primes {
		if mustPhi(t, p) != p-1 || !reflect.DeepEqual(mustFactors(t, p), []Factor{{p, 1}}) {
			t.Errorf("prime %d", p)
		}
	}
}

func TestPrimePowers(t *testing.T) {
	// Phi(p^k) = p^k - p^(k-1), up to the largest power below 2^64.
	for _, p := range []uint64{2, 3, 5, 7, 11, 13, 101, 65537} {
		prev, pk := uint64(1), p
		for k := 1; ; k++ {
			if mustPhi(t, pk) != pk-prev || !reflect.DeepEqual(mustFactors(t, pk), []Factor{{p, k}}) {
				t.Errorf("Phi(%d^%d)", p, k)
			}
			if pk > math.MaxUint64/p {
				break
			}
			prev, pk = pk, pk*p
		}
	}
}

func TestMultiplicative(t *testing.T) {
	for m := uint64(1); m <= 120; m++ {
		for n := uint64(1); n <= 120; n++ {
			g := gcd(m, n)
			lhs, rhs := mustPhi(t, m*n)*mustPhi(t, g), mustPhi(t, m)*mustPhi(t, n)*g
			if lhs != rhs || (g == 1 && mustPhi(t, m*n) != mustPhi(t, m)*mustPhi(t, n)) {
				t.Fatalf("multiplicativity fails for %d, %d", m, n)
			}
		}
	}
	if mustPhi(t, 4) == mustPhi(t, 2)*mustPhi(t, 2) {
		t.Error("2 and 2 are not coprime: Phi(4) must differ from Phi(2)^2")
	}
}

func TestDivisorSum(t *testing.T) {
	for n := uint64(1); n <= 3000; n++ {
		var sum uint64
		for d := uint64(1); d <= n; d++ {
			if n%d == 0 {
				sum += mustPhi(t, d)
			}
		}
		if sum != n {
			t.Fatalf("sum of Phi(d) over the divisors of %d = %d", n, sum)
		}
	}
	// At 64 bits the partial sums stay below n, so they cannot overflow.
	for _, n := range []uint64{9223372036854775808, 1000000000000000000, 9223372036854775807, math.MaxUint64} {
		var sum uint64
		for _, d := range divisorsFromFactors(mustFactors(t, n)) {
			sum += mustPhi(t, d)
		}
		if sum != n {
			t.Errorf("sum of Phi(d) over the divisors of %d = %d", n, sum)
		}
	}
}

func TestFactorsMultiplyBack(t *testing.T) {
	for n := uint64(1); n <= 5000; n++ {
		product, last := uint64(1), uint64(0)
		for _, f := range mustFactors(t, n) {
			if f.Prime <= last || !isPrime(f.Prime) || f.Exp < 1 {
				t.Fatalf("PrimeFactors(%d) = %v", n, mustFactors(t, n))
			}
			last = f.Prime
			for e := 0; e < f.Exp; e++ {
				product *= f.Prime
			}
		}
		if product != n {
			t.Fatalf("PrimeFactors(%d) multiplies back to %d", n, product)
		}
	}
}

func TestLargest64Bit(t *testing.T) {
	if mustPhi(t, math.MaxUint64) != 9208981628670443520 || mustPhi(t, math.MaxUint64) != 2*4*16*256*640*65536*6700416 {
		t.Error("Phi(2^64 - 1)")
	}
	// A product of two primes just below 2^20 and 2^44: trial division runs to about 2^22.
	if got := mustFactors(t, 18446691297133592627); !reflect.DeepEqual(got, []Factor{{1048573, 1}, {17592186044399, 1}}) {
		t.Errorf("PrimeFactors(18446691297133592627) = %v", got)
	}
}

func TestSieveAgainstPhi(t *testing.T) {
	const n = 5000
	s := mustSieve(t, n)
	if len(s.Phi) != n+1 || len(s.SPF) != n+1 {
		t.Fatal("table lengths")
	}
	var primes []int
	for i := 1; i <= n; i++ {
		if uint64(s.Phi[i]) != mustPhi(t, uint64(i)) {
			t.Fatalf("Phi[%d] = %d", i, s.Phi[i])
		}
		if i >= 2 && uint64(s.SPF[i]) != mustFactors(t, uint64(i))[0].Prime {
			t.Fatalf("SPF[%d] = %d", i, s.SPF[i])
		}
		if isPrime(uint64(i)) {
			primes = append(primes, i)
		}
	}
	if !reflect.DeepEqual(s.Primes, primes) {
		t.Error("primes")
	}
}

func TestEachCompositeCrossedOnce(t *testing.T) {
	// Crossings counts every write; every composite needs at least one (its SPF is set and
	// right), so Crossings == the number of composites means exactly one each.
	for _, n := range []int{0, 1, 2, 3, 4, 5, 9, 30, 100, 1000, 10007, 65536} {
		s := mustSieve(t, n)
		composites := 0
		for m := 4; m <= n; m++ {
			if !isPrime(uint64(m)) {
				composites++
				if uint64(s.SPF[m]) != mustFactors(t, uint64(m))[0].Prime {
					t.Fatalf("n = %d: SPF[%d] = %d", n, m, s.SPF[m])
				}
			}
		}
		if s.Crossings != composites || s.Crossings != max(0, n-1)-len(s.Primes) {
			t.Errorf("n = %d: %d crossings for %d composites", n, s.Crossings, composites)
		}
	}
}

func TestSieveEdgesAndMillion(t *testing.T) {
	cases := []struct {
		n                int
		phi, spf, primes []int
		crossings        int
	}{
		{0, []int{0}, []int{0}, []int{}, 0},
		{1, []int{0, 1}, []int{0, 0}, []int{}, 0},
		{2, []int{0, 1, 1}, []int{0, 0, 2}, []int{2}, 0},
		{4, []int{0, 1, 1, 2, 2}, []int{0, 0, 2, 3, 2}, []int{2, 3}, 1},
	}
	for _, c := range cases {
		s := mustSieve(t, c.n)
		if !reflect.DeepEqual(s.Phi, c.phi) || !reflect.DeepEqual(s.SPF, c.spf) || !reflect.DeepEqual(s.Primes, c.primes) || s.Crossings != c.crossings {
			t.Errorf("LinearSieve(%d) = %+v", c.n, s)
		}
	}
	if _, err := LinearSieve(-1); !errors.Is(err, ErrNegativeLimit) {
		t.Errorf("LinearSieve(-1) error = %v", err)
	}
	s := mustSieve(t, 1000000)
	sum := 0
	for _, v := range s.Phi {
		sum += v
	}
	if len(s.Primes) != 78498 || s.Crossings != 1000000-1-78498 || sum != 303963552392 {
		t.Errorf("LinearSieve(10^6): %d primes, %d crossings, sum %d", len(s.Primes), s.Crossings, sum)
	}
}

func TestSieveDivisorSum(t *testing.T) {
	const n = 20000
	s := mustSieve(t, n)
	sums := make([]int, n+1)
	for d := 1; d <= n; d++ {
		for m := d; m <= n; m += d {
			sums[m] += s.Phi[d]
		}
	}
	for m := 1; m <= n; m++ {
		if sums[m] != m {
			t.Fatalf("sum of Phi[d] over the divisors of %d = %d", m, sums[m])
		}
	}
}

func TestMulModAndPowMod(t *testing.T) {
	// (-1) * (-1) = 1 and 2^63 * 2 = 2^64 = 1 modulo 2^64 - 1: the products need 128 bits.
	if MulMod(math.MaxUint64-1, math.MaxUint64-1, math.MaxUint64) != 1 || MulMod(1<<63, 2, math.MaxUint64) != 1 {
		t.Error("MulMod at 64 bits")
	}
	if PowMod(2, 64, math.MaxUint64) != 1 || PowMod(5, 0, 1) != 0 || PowMod(0, 0, 7) != 1 || PowMod(3, 200, 1000000007) != 136318165 {
		t.Error("PowMod")
	}
}

func TestEulersTheorem(t *testing.T) {
	for n := uint64(1); n <= 300; n++ {
		f := mustPhi(t, n)
		for a := uint64(0); a < n; a++ {
			got := PowMod(a, f, n)
			if gcd(a, n) == 1 && got != 1%n {
				t.Fatalf("%d^Phi(%d) mod %d = %d", a, n, n, got)
			}
			if gcd(a, n) != 1 && n > 1 && got == 1 {
				t.Fatalf("%d^Phi(%d) mod %d = 1 although gcd > 1", a, n, n)
			}
		}
	}
	for _, n := range []uint64{math.MaxUint64, 9223372036854775808, 1000000000000000000, 4294967291} {
		f := mustPhi(t, n)
		for _, a := range []uint64{2, 3, 7, 1000000007, math.MaxUint64 - 2} {
			if gcd(a, n) == 1 && PowMod(a, f, n) != 1 {
				t.Errorf("%d^Phi(%d) mod %d != 1", a, n, n)
			}
		}
	}
}

func TestInverseAgainstExtendedEuclid(t *testing.T) {
	for n := uint64(1); n <= 400; n++ {
		for a := uint64(0); a < 2*n; a++ {
			want, ok := inverseByExtendedGcd(a, n)
			got, err := ModInverseEuler(a, n)
			if ok && (err != nil || got != want || a*got%n != 1%n) {
				t.Fatalf("ModInverseEuler(%d, %d) = %d, %v, want %d", a, n, got, err, want)
			}
			if !ok && !errors.Is(err, ErrNotCoprime) {
				t.Fatalf("ModInverseEuler(%d, %d): error %v, want ErrNotCoprime", a, n, err)
			}
		}
	}
	for _, c := range pinnedInverses {
		if want, ok := inverseByExtendedGcd(c[0], c[1]); !ok || want != c[2] {
			t.Errorf("extended Euclid disagrees on %v", c)
		}
	}
	const p = 4294967291
	for _, a := range []uint64{2, 3, 12345, p - 1} {
		if got, _ := ModInverseEuler(a, p); got != PowMod(a, p-2, p) {
			t.Errorf("ModInverseEuler(%d, p) is not Fermat's a^(p-2)", a)
		}
	}
}

func TestInverseErrors(t *testing.T) {
	for _, c := range [][3]uint64{{0, 1, 0}, {5, 1, 0}, {10, 7, 5}} {
		if got, err := ModInverseEuler(c[0], c[1]); err != nil || got != c[2] {
			t.Errorf("ModInverseEuler(%d, %d) = %d, %v", c[0], c[1], got, err)
		}
	}
	_, err := ModInverseEuler(6, 9)
	if !errors.Is(err, ErrNotCoprime) || err.Error() != "6 has no inverse modulo 9: gcd(6, 9) = 3: a and n are not coprime" {
		t.Errorf("ModInverseEuler(6, 9) error = %v", err)
	}
	if _, err := ModInverseEuler(0, 5); !errors.Is(err, ErrNotCoprime) {
		t.Errorf("ModInverseEuler(0, 5) error = %v", err)
	}
	if _, err := ModInverseEuler(3, 0); !errors.Is(err, ErrZero) {
		t.Errorf("ModInverseEuler(3, 0) error = %v", err)
	}
}
