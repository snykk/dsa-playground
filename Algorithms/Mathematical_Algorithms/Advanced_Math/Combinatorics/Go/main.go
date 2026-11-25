// Combinatorics (Go)
//
// Binomial coefficients C(n, k) three ways, then Catalan numbers, stars and bars and
// derangements. Every count is a uint64; a count that does not fit returns an error wrapping
// ErrOverflow instead of wrapping around.
//
//   - PascalTriangle and BinomialPascal: Pascal's rule C(n, k) = C(n-1, k-1) + C(n-1, k),
//     additions only. Rows 0..67 fit in 64 bits; row 68 holds C(68, 34) > 2^64 - 1.
//   - Binomial: the multiplicative formula in min(k, n-k) steps. Each step is value*m/i with
//     the gcd of value and i divided out first, so the product equals the next value, itself a
//     binomial no larger than the answer: nothing overflows unless the answer does.
//   - ModBinomial: i! and (i!)^-1 modulo a prime p > nMax, with one modular inverse
//     (fact[nMax]^(p-2), Euler's theorem for a prime) and InvFact filled backwards; then
//     C(n, k) mod p in O(1). Products go through MulMod (bits.Mul64 and bits.Rem64), so any p
//     up to 2^64 - 1 works.
//   - CatalanNumbers (the recurrence) and Catalan (C(2n, n) / (n+1)); StarsAndBars and
//     StarsAndBarsPositive; DerangementNumbers.
//
// C(n, k) is 0 for k < 0 or k > n. Invalid input returns an error wrapping ErrNegative,
// ErrNotPrime, ErrNotBelowP or ErrPastTable.
package main

import (
	"errors"
	"fmt"
	"math"
	"math/bits"
)

var (
	// ErrNegative is returned for a negative count or size.
	ErrNegative = errors.New("must not be negative")
	// ErrOverflow is returned when a count does not fit in 64 bits.
	ErrOverflow = errors.New("does not fit in 64 bits")
	// ErrNotPrime is returned by NewModBinomial for p < 2, and when fact[nMax]^(p-2) is not an
	// inverse of nMax! modulo p, which never happens for a prime p > nMax.
	ErrNotPrime = errors.New("the modulus must be a prime")
	// ErrNotBelowP is returned by NewModBinomial for nMax >= p: p divides n! from n = p on.
	ErrNotBelowP = errors.New("Lucas's theorem handles n >= p")
	// ErrPastTable is returned by ModBinomial.Binomial for n > NMax.
	ErrPastTable = errors.New("past the table")
)

func binomialName(n, k int64) string { return fmt.Sprintf("C(%d, %d)", n, k) }

func checkedAdd(a, b uint64, what string) (uint64, error) {
	sum, carry := bits.Add64(a, b, 0)
	if carry != 0 {
		return 0, fmt.Errorf("%s %w", what, ErrOverflow)
	}
	return sum, nil
}

func checkedMul(a, b uint64, what string) (uint64, error) {
	hi, lo := bits.Mul64(a, b)
	if hi != 0 {
		return 0, fmt.Errorf("%s %w", what, ErrOverflow)
	}
	return lo, nil
}

func checkNotNegative(value int64, what string) error {
	if value < 0 {
		return fmt.Errorf("%s = %d %w", what, value, ErrNegative)
	}
	return nil
}

// PascalTriangle returns rows 0..n of Pascal's triangle, rows[r][j] = C(r, j), with
// n(n-1)/2 additions.
func PascalTriangle(n int) ([][]uint64, error) {
	if err := checkNotNegative(int64(n), "n"); err != nil {
		return nil, err
	}
	rows := [][]uint64{{1}}
	for r := 1; r <= n; r++ {
		above := rows[r-1]
		row := make([]uint64, r+1)
		row[0], row[r] = 1, 1 // C(r, 0) = C(r, r) = 1
		for j := 1; j < r; j++ {
			v, err := checkedAdd(above[j-1], above[j], binomialName(int64(r), int64(j)))
			if err != nil {
				return nil, err
			}
			row[j] = v
		}
		rows = append(rows, row)
	}
	return rows, nil
}

// BinomialPascal returns C(n, k) by Pascal's rule on one row of min(k, n-k)+1 cells:
// O(n * min(k, n-k)) additions. Every cell is C(r, j) with r <= n and j <= min(k, n-k), never
// more than the answer.
func BinomialPascal(n, k int64) (uint64, error) {
	if k < 0 || k > n {
		return 0, nil
	}
	name := binomialName(n, k)
	k = min(k, n-k)
	// C(n, k) >= C(2k, k) >= C(68, 34) > 2^64 - 1 once k >= 34: say so before allocating the row.
	if k >= 34 {
		return 0, fmt.Errorf("%s %w", name, ErrOverflow)
	}
	row := make([]uint64, k+1)
	row[0] = 1
	for r := int64(1); r <= n; r++ {
		// Right to left, so row[j-1] still holds row r-1 when row[j] reads it.
		for j := min(r, k); j >= 1; j-- {
			v, err := checkedAdd(row[j], row[j-1], binomialName(r, j))
			if err != nil {
				return 0, err
			}
			row[j] = v
		}
	}
	return row[k], nil
}

func gcd(a, b uint64) uint64 {
	for b != 0 {
		a, b = b, a%b
	}
	return a
}

// Binomial returns C(n, k) by the multiplicative formula in min(k, n-k) steps. Before step i
// the value is C(n-k+i-1, i-1); times (n-k+i)/i it is C(n-k+i, i). With g = gcd(value, i),
// i/g divides n-k+i, so (value/g) * ((n-k+i)/(i/g)) is that next value exactly.
func Binomial(n, k int64) (uint64, error) {
	if k < 0 || k > n {
		return 0, nil
	}
	name := binomialName(n, k)
	k = min(k, n-k)
	result := uint64(1)
	for i := int64(1); i <= k; i++ {
		m, d := uint64(n-k+i), uint64(i)
		g := gcd(result, d)
		v, err := checkedMul(result/g, m/(d/g), name)
		if err != nil {
			return 0, err
		}
		result = v
	}
	return result, nil
}

// MulMod returns a*b mod m for any 64-bit values, m >= 1: the 128-bit product comes from
// bits.Mul64 and its remainder from bits.Rem64.
func MulMod(a, b, m uint64) uint64 {
	hi, lo := bits.Mul64(a, b)
	return bits.Rem64(hi, lo, m)
}

// PowMod returns base^exp mod m for m >= 1 by square and multiply, and the number of MulMod
// calls it made: one squaring per bit of exp and one product per set bit.
func PowMod(base, exp, m uint64) (uint64, int) {
	result := 1 % m
	base %= m
	made := 0
	for exp > 0 {
		if exp&1 == 1 {
			result = MulMod(result, base, m)
			made++
		}
		base = MulMod(base, base, m)
		made++
		exp >>= 1
	}
	return result, made
}

// ModBinomial holds i! and (i!)^-1 modulo a prime P for every i <= NMax, so that C(n, k) mod P
// is O(1). Multiplications counts the products of the build: NMax for Fact, those of the one
// power, NMax for InvFact.
type ModBinomial struct {
	NMax            int
	P               uint64
	Fact            []uint64
	InvFact         []uint64
	Multiplications int
}

// NewModBinomial builds the tables in O(nMax + log p) with one modular inverse. It fails with
// ErrNegative for nMax < 0, ErrNotPrime for p < 2 or when fact[nMax]^(p-2) is not an inverse,
// and ErrNotBelowP for nMax >= p.
func NewModBinomial(nMax int, p uint64) (*ModBinomial, error) {
	if err := checkNotNegative(int64(nMax), "nMax"); err != nil {
		return nil, err
	}
	if p < 2 {
		return nil, fmt.Errorf("p = %d is not prime: %w", p, ErrNotPrime)
	}
	if uint64(nMax) >= p {
		return nil, fmt.Errorf("nMax = %d >= p = %d: p divides n! for every n >= p, so n! has no inverse modulo p; %w", nMax, p, ErrNotBelowP)
	}
	b := &ModBinomial{NMax: nMax, P: p, Fact: make([]uint64, nMax+1), InvFact: make([]uint64, nMax+1)}
	b.Fact[0] = 1
	for i := 1; i <= nMax; i++ {
		b.Fact[i] = MulMod(b.Fact[i-1], uint64(i), p)
		b.Multiplications++
	}
	inverse, made := PowMod(b.Fact[nMax], p-2, p)
	b.Multiplications += made
	if check := MulMod(b.Fact[nMax], inverse, p); check != 1 {
		return nil, fmt.Errorf("p = %d is not prime: %d * %d %% %d = %d, so the power p - 2 did not invert %d! modulo p: %w",
			p, b.Fact[nMax], inverse, p, check, nMax, ErrNotPrime)
	}
	b.InvFact[nMax] = inverse
	for i := nMax; i >= 1; i-- {
		b.InvFact[i-1] = MulMod(b.InvFact[i], uint64(i), p) // 1/(i-1)! = i * 1/i!
		b.Multiplications++
	}
	return b, nil
}

// Binomial returns C(n, k) mod P: 0 for k < 0 or k > n, ErrPastTable for n > NMax.
func (b *ModBinomial) Binomial(n, k int64) (uint64, error) {
	if k < 0 || k > n {
		return 0, nil
	}
	if n > int64(b.NMax) {
		return 0, fmt.Errorf("n = %d is %w: it was built for n <= %d", n, ErrPastTable, b.NMax)
	}
	return MulMod(MulMod(b.Fact[n], b.InvFact[k], b.P), b.InvFact[n-k], b.P), nil
}

// CatalanNumbers returns [C_0, ..., C_n] by C_m = sum of C_i * C_(m-1-i): O(n^2). It fits up
// to C_36; C_37 returns ErrOverflow.
func CatalanNumbers(n int) ([]uint64, error) {
	if err := checkNotNegative(int64(n), "n"); err != nil {
		return nil, err
	}
	cat := []uint64{1}
	for m := 1; m <= n; m++ {
		// Every product and partial sum is at most C_m, so the first overflow is C_m's own.
		name := fmt.Sprintf("the Catalan number C_%d", m)
		var sum uint64
		for i := 0; i < m; i++ {
			prod, err := checkedMul(cat[i], cat[m-1-i], name)
			if err != nil {
				return nil, err
			}
			if sum, err = checkedAdd(sum, prod, name); err != nil {
				return nil, err
			}
		}
		cat = append(cat, sum)
	}
	return cat, nil
}

// Catalan returns C_n = C(2n, n) / (n+1). C(2n, n) must fit, so n <= 33; ErrOverflow above.
func Catalan(n int64) (uint64, error) {
	if err := checkNotNegative(n, "n"); err != nil {
		return 0, err
	}
	if n > math.MaxInt64/2 {
		return 0, fmt.Errorf("C(2 * %d, %d) %w", n, n, ErrOverflow)
	}
	c, err := Binomial(2*n, n)
	if err != nil {
		return 0, err
	}
	return c / uint64(n+1), nil
}

// StarsAndBars returns the ways to put n identical items into k boxes, C(n+k-1, k-1); for
// k = 0 it is 1 if n == 0 and 0 otherwise.
func StarsAndBars(n, k int64) (uint64, error) {
	if err := checkNotNegative(n, "n"); err != nil {
		return 0, err
	}
	if err := checkNotNegative(k, "k"); err != nil {
		return 0, err
	}
	if k == 0 {
		if n == 0 {
			return 1, nil
		}
		return 0, nil
	}
	if n > math.MaxInt64-k {
		return 0, fmt.Errorf("C(%d + %d - 1, %d - 1) %w", n, k, k, ErrOverflow)
	}
	return Binomial(n+k-1, k-1)
}

// StarsAndBarsPositive returns the same count with at least one item per box,
// C(n-1, k-1), which is 0 when n < k.
func StarsAndBarsPositive(n, k int64) (uint64, error) {
	if err := checkNotNegative(n, "n"); err != nil {
		return 0, err
	}
	if err := checkNotNegative(k, "k"); err != nil {
		return 0, err
	}
	if k == 0 {
		if n == 0 {
			return 1, nil
		}
		return 0, nil
	}
	return Binomial(n-1, k-1)
}

// DerangementNumbers returns [D(0), ..., D(n)] by D(m) = (m-1)(D(m-1) + D(m-2)). It fits up to
// D(20); D(21) returns ErrOverflow.
func DerangementNumbers(n int) ([]uint64, error) {
	if err := checkNotNegative(int64(n), "n"); err != nil {
		return nil, err
	}
	d := []uint64{1}
	if n >= 1 {
		d = append(d, 0)
	}
	for m := 2; m <= n; m++ {
		name := fmt.Sprintf("D(%d)", m)
		sum, err := checkedAdd(d[m-1], d[m-2], name)
		if err != nil {
			return nil, err
		}
		v, err := checkedMul(uint64(m-1), sum, name)
		if err != nil {
			return nil, err
		}
		d = append(d, v)
	}
	return d, nil
}

func main() {
	rows, _ := PascalTriangle(6)
	fmt.Println("Pascal's triangle, rows 0..6:")
	for _, row := range rows {
		fmt.Println("   ", row)
	}
	a, _ := BinomialPascal(10, 3)
	b, _ := Binomial(10, 3)
	t10, _ := NewModBinomial(10, 1000000007)
	c, _ := t10.Binomial(10, 3)
	fmt.Println("C(10, 3) three ways:", a, b, c)
	big, _ := Binomial(67, 33)
	fmt.Printf("C(67, 33) = %d (row 67 is the last that fits)\n", big)
	_, err := Binomial(68, 34)
	fmt.Println("Binomial(68, 34):", err)
	table, _ := NewModBinomial(1000000, 1000000007)
	mid, _ := table.Binomial(1000000, 500000)
	fmt.Printf("C(10^6, 5 * 10^5) mod 10^9 + 7 = %d (%d multiplications to build)\n", mid, table.Multiplications)
	cat, _ := CatalanNumbers(10)
	c10, _ := Catalan(10)
	fmt.Println("Catalan C_0..C_10:", cat, " Catalan(10) =", c10)
	s, _ := StarsAndBars(5, 3)
	sp, _ := StarsAndBarsPositive(5, 3)
	fmt.Println("StarsAndBars(5, 3) =", s, " StarsAndBarsPositive(5, 3) =", sp)
	d, _ := DerangementNumbers(20)
	fmt.Println("D(0..10):", d[:11])
	fmt.Printf("D(20) = %d (the last that fits)\n", d[20])
	_, err = NewModBinomial(9, 7)
	fmt.Println("NewModBinomial(9, 7):", err)
}
