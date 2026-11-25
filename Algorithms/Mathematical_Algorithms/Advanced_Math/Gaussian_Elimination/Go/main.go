// Gaussian Elimination (Go)
//
// Solves A x = b, n equations in m unknowns, by reducing the augmented matrix [A | b] to row
// echelon form and substituting back from the last pivot up.
//
//   - Solve: float64 with partial pivoting. The pivot of a column is the entry of largest
//     absolute value at or below the current row (the upper row wins a tie), and |v| <= eps
//     counts as zero (pass Eps = 1e-9 for the default). SolveWithoutPivoting takes the first
//     entry that is not zero instead, to show why pivoting matters.
//   - SolveMod: exact arithmetic modulo a prime p up to 2^64 - 1. The pivot is the first nonzero
//     entry; dividing by it multiplies by its inverse a^(p - 2) mod p (Fermat). Products go
//     through MulMod (bits.Mul64 and bits.Rem64), so no product overflows.
//
// Both report NoSolution (a row reads 0 = c, c not zero), Unique or Infinite (a column without
// a pivot: its unknown is free and set to 0 in X). Determinant and DeterminantMod: the product
// of the pivots, negated once per row swap.
//
// Invalid input returns an error wrapping ErrShape (an empty or ragged A, a b of the wrong
// length, a matrix that is not square for a determinant), ErrModulus (p < 2) or ErrNoInverse
// (a pivot with no inverse: p is not prime).
package main

import (
	"errors"
	"fmt"
	"math"
	"math/bits"
)

// Eps is the default tolerance: an entry with |v| <= Eps counts as zero.
const Eps = 1e-9

var (
	// ErrShape is returned for an empty or ragged A, a b of the wrong length, or a matrix that
	// is not square where a determinant is asked for.
	ErrShape = errors.New("the matrix does not have the required shape")
	// ErrModulus is returned for a modulus below 2.
	ErrModulus = errors.New("the modulus must be a prime, so at least 2")
	// ErrNoInverse is returned when a pivot has no inverse modulo p, which means p is not prime.
	ErrNoInverse = errors.New("p must be prime")
)

// Kind says how many solutions a system has.
type Kind int

const (
	// NoSolution: a row of the echelon form reads 0 = c with c not zero.
	NoSolution Kind = iota
	// Unique: every column has a pivot.
	Unique
	// Infinite: a column has no pivot, so its unknown is free.
	Infinite
)

// String returns "no solution", "unique" or "infinite", the names the Python and C++ versions use.
func (k Kind) String() string {
	switch k {
	case NoSolution:
		return "no solution"
	case Unique:
		return "unique"
	default:
		return "infinite"
	}
}

// Solution is what Solve and SolveWithoutPivoting return. X is nil for NoSolution.
type Solution struct {
	Kind      Kind
	X         []float64 // one solution, free unknowns 0
	Rank      int       // the number of pivots: the rank of A
	PivotCols []int     // the column of each pivot row, increasing
	Swaps     int       // row swaps made while choosing pivots
	Updates   int       // entries the forward elimination recomputed: the work
}

// ModSolution is what SolveMod returns: the same fields, X in [0, p).
type ModSolution struct {
	Kind      Kind
	X         []uint64
	Rank      int
	PivotCols []int
	Swaps     int
	Updates   int
}

func checkShape(n, bLen int, rowLen func(int) int) error {
	if n == 0 {
		return fmt.Errorf("A has no rows: a system needs at least one equation: %w", ErrShape)
	}
	m := rowLen(0)
	if m == 0 {
		return fmt.Errorf("A has no columns: a system needs at least one unknown: %w", ErrShape)
	}
	for i := 0; i < n; i++ {
		if rowLen(i) != m {
			return fmt.Errorf("row %d of A has %d entries, but row 0 has %d: %w", i, rowLen(i), m, ErrShape)
		}
	}
	if bLen != n {
		return fmt.Errorf("b has %d entries, but A has %d rows: %w", bLen, n, ErrShape)
	}
	return nil
}

func checkSquare(n int, rowLen func(int) int) error {
	if n == 0 {
		return fmt.Errorf("A has no rows: the determinant needs a square matrix of size at least 1: %w", ErrShape)
	}
	for i := 0; i < n; i++ {
		if rowLen(i) != n {
			return fmt.Errorf("row %d of A has %d entries, but A has %d rows: the determinant needs a square matrix: %w", i, rowLen(i), n, ErrShape)
		}
	}
	return nil
}

type echelon struct {
	pivotCols []int
	inverses  []uint64 // modular version only: one inverse per pivot
	swaps     int
	updates   int
}

// forward reduces M to row echelon form in place, with pivots in columns 0..cols-1. A row whose
// entry is already 0 is skipped. float64(factor * M[row][c]) rounds the product on its own, so
// the compiler cannot fuse it with the subtraction into one FMA (Go may on arm64): the results
// then match Python's bit for bit.
func forward(M [][]float64, cols int, eps float64, partial bool) echelon {
	e := echelon{pivotCols: []int{}}
	n := len(M)
	row := 0
	for col := 0; col < cols && row < n; col++ {
		pick := -1
		if partial {
			best := row
			for r := row + 1; r < n; r++ {
				if math.Abs(M[r][col]) > math.Abs(M[best][col]) { // strict: a tie keeps the upper row
					best = r
				}
			}
			if math.Abs(M[best][col]) > eps {
				pick = best
			}
		} else {
			for r := row; r < n && pick < 0; r++ {
				if math.Abs(M[r][col]) > eps {
					pick = r
				}
			}
		}
		if pick < 0 {
			continue // no pivot: col is a free column
		}
		if pick != row {
			M[row], M[pick] = M[pick], M[row]
			e.swaps++
		}
		width := len(M[row])
		for target := row + 1; target < n; target++ {
			if M[target][col] == 0 {
				continue // already zero: nothing to subtract
			}
			factor := M[target][col] / M[row][col]
			M[target][col] = 0
			for c := col + 1; c < width; c++ {
				M[target][c] -= float64(factor * M[row][c])
			}
			e.updates += width - col - 1
		}
		e.pivotCols = append(e.pivotCols, col)
		row++
	}
	return e
}

func solveFloat(A [][]float64, b []float64, eps float64, partial bool) (Solution, error) {
	if err := checkShape(len(A), len(b), func(i int) int { return len(A[i]) }); err != nil {
		return Solution{}, err
	}
	n, m := len(A), len(A[0])
	M := make([][]float64, n)
	for i := range A {
		M[i] = append(append(make([]float64, 0, m+1), A[i]...), b[i])
	}
	e := forward(M, m, eps, partial)
	s := Solution{Rank: len(e.pivotCols), PivotCols: e.pivotCols, Swaps: e.swaps, Updates: e.updates}
	for r := s.Rank; r < n; r++ {
		if math.Abs(M[r][m]) > eps { // the row reads 0 = M[r][m]
			s.Kind = NoSolution
			return s, nil
		}
	}
	s.X = make([]float64, m)
	for i := s.Rank - 1; i >= 0; i-- {
		c := e.pivotCols[i]
		sum := M[i][m]
		for j := c + 1; j < m; j++ {
			sum -= float64(M[i][j] * s.X[j])
		}
		s.X[c] = sum / M[i][c]
	}
	if s.Rank == m {
		s.Kind = Unique
	} else {
		s.Kind = Infinite
	}
	return s, nil
}

// Solve solves A x = b in float64 with partial pivoting; |v| <= eps counts as zero. A and b are
// not modified. Time: O(min(n, m) * n * m), O(n^3) for a square system.
func Solve(A [][]float64, b []float64, eps float64) (Solution, error) {
	return solveFloat(A, b, eps, true)
}

// SolveWithoutPivoting is Solve with the first entry above eps as the pivot, however small.
func SolveWithoutPivoting(A [][]float64, b []float64, eps float64) (Solution, error) {
	return solveFloat(A, b, eps, false)
}

// Determinant returns det(A) for a square A: the product of the pivots with partial pivoting,
// negated once per row swap; 0 when a column has no pivot (|v| <= eps).
func Determinant(A [][]float64, eps float64) (float64, error) {
	if err := checkSquare(len(A), func(i int) int { return len(A[i]) }); err != nil {
		return 0, err
	}
	n := len(A)
	M := make([][]float64, n)
	for i := range A {
		M[i] = append([]float64(nil), A[i]...)
	}
	e := forward(M, n, eps, true)
	if len(e.pivotCols) < n {
		return 0, nil
	}
	det := 1.0
	if e.swaps%2 == 1 {
		det = -1.0
	}
	for i := 0; i < n; i++ {
		det *= M[i][i]
	}
	return det, nil
}

/* ---------- modulo a prime ---------- */

// MulMod returns a*b mod m for m >= 1, from the 128-bit product of bits.Mul64.
func MulMod(a, b, m uint64) uint64 {
	hi, lo := bits.Mul64(a, b)
	return bits.Rem64(hi, lo, m)
}

// PowMod returns base^exp mod m for m >= 1 by square and multiply.
func PowMod(base, exp, m uint64) uint64 {
	result := 1 % m
	base %= m
	for exp > 0 {
		if exp&1 == 1 {
			result = MulMod(result, base, m)
		}
		base = MulMod(base, base, m)
		exp >>= 1
	}
	return result
}

// ReduceMod returns v mod p in [0, p), as Python's % gives it, for any int64 v.
func ReduceMod(v int64, p uint64) uint64 {
	if v >= 0 {
		return uint64(v) % p
	}
	r := (uint64(-(v+1))%p + 1) % p // |v| = -(v + 1) + 1, without overflowing at math.MinInt64
	return (p - r) % p
}

// subMod returns a - b mod p for a, b in [0, p), without overflow for p near 2^64.
func subMod(a, b, p uint64) uint64 {
	if a >= b {
		return a - b
	}
	return a + (p - b)
}

// InverseMod returns the inverse of a nonzero a modulo a prime p: a^(p - 2) mod p (Fermat's
// little theorem). The result is checked: if a times it is not 1, p was not prime, and the
// error wraps ErrNoInverse.
func InverseMod(a, p uint64) (uint64, error) {
	inv := PowMod(a, p-2, p)
	if MulMod(a, inv, p) != 1 {
		return 0, fmt.Errorf("%d has no inverse modulo %d by Fermat's little theorem: %w", a, p, ErrNoInverse)
	}
	return inv, nil
}

func checkModulus(p uint64) error {
	if p < 2 {
		return fmt.Errorf("p = %d: %w", p, ErrModulus)
	}
	return nil
}

// forwardMod is forward modulo p: the first nonzero entry is the pivot, one inverse per pivot.
func forwardMod(M [][]uint64, cols int, p uint64) (echelon, error) {
	e := echelon{pivotCols: []int{}}
	n := len(M)
	row := 0
	for col := 0; col < cols && row < n; col++ {
		pick := -1
		for r := row; r < n && pick < 0; r++ {
			if M[r][col] != 0 {
				pick = r
			}
		}
		if pick < 0 {
			continue
		}
		if pick != row {
			M[row], M[pick] = M[pick], M[row]
			e.swaps++
		}
		inv, err := InverseMod(M[row][col], p)
		if err != nil {
			return e, err
		}
		width := len(M[row])
		for target := row + 1; target < n; target++ {
			if M[target][col] == 0 {
				continue
			}
			factor := MulMod(M[target][col], inv, p)
			M[target][col] = 0
			for c := col + 1; c < width; c++ {
				M[target][c] = subMod(M[target][c], MulMod(factor, M[row][c], p), p)
			}
			e.updates += width - col - 1
		}
		e.pivotCols = append(e.pivotCols, col)
		e.inverses = append(e.inverses, inv)
		row++
	}
	return e, nil
}

// SolveMod solves A x = b modulo a prime p, exactly; entries are reduced into [0, p) first,
// negative ones too. Primality is not tested: a pivot without an inverse returns ErrNoInverse.
func SolveMod(A [][]int64, b []int64, p uint64) (ModSolution, error) {
	if err := checkModulus(p); err != nil {
		return ModSolution{}, err
	}
	if err := checkShape(len(A), len(b), func(i int) int { return len(A[i]) }); err != nil {
		return ModSolution{}, err
	}
	n, m := len(A), len(A[0])
	M := make([][]uint64, n)
	for i := range A {
		M[i] = make([]uint64, m+1)
		for j, v := range A[i] {
			M[i][j] = ReduceMod(v, p)
		}
		M[i][m] = ReduceMod(b[i], p)
	}
	e, err := forwardMod(M, m, p)
	if err != nil {
		return ModSolution{}, err
	}
	s := ModSolution{Rank: len(e.pivotCols), PivotCols: e.pivotCols, Swaps: e.swaps, Updates: e.updates}
	for r := s.Rank; r < n; r++ {
		if M[r][m] != 0 {
			s.Kind = NoSolution
			return s, nil
		}
	}
	s.X = make([]uint64, m)
	for i := s.Rank - 1; i >= 0; i-- {
		c := e.pivotCols[i]
		sum := M[i][m]
		for j := c + 1; j < m; j++ {
			sum = subMod(sum, MulMod(M[i][j], s.X[j], p), p)
		}
		s.X[c] = MulMod(sum, e.inverses[i], p)
	}
	if s.Rank == m {
		s.Kind = Unique
	} else {
		s.Kind = Infinite
	}
	return s, nil
}

// DeterminantMod returns det(A) mod p in [0, p) for a square A: the product of the pivots,
// negated once per row swap.
func DeterminantMod(A [][]int64, p uint64) (uint64, error) {
	if err := checkModulus(p); err != nil {
		return 0, err
	}
	if err := checkSquare(len(A), func(i int) int { return len(A[i]) }); err != nil {
		return 0, err
	}
	n := len(A)
	M := make([][]uint64, n)
	for i := range A {
		M[i] = make([]uint64, n)
		for j, v := range A[i] {
			M[i][j] = ReduceMod(v, p)
		}
	}
	e, err := forwardMod(M, n, p)
	if err != nil {
		return 0, err
	}
	if len(e.pivotCols) < n {
		return 0, nil
	}
	det := uint64(1)
	if e.swaps%2 == 1 {
		det = p - 1
	}
	for i := 0; i < n; i++ {
		det = MulMod(det, M[i][i], p)
	}
	return det, nil
}

func main() {
	A := [][]float64{{2, 1, -1}, {-3, -1, 2}, {-2, 1, 2}}
	b := []float64{8, -11, -3}
	s, _ := Solve(A, b, Eps)
	fmt.Printf("Solve: %v, x = %v, rank %d, swaps %d, updates %d\n", s.Kind, s.X, s.Rank, s.Swaps, s.Updates)
	det, _ := Determinant(A, Eps)
	fmt.Println("Determinant:", det)
	sm, _ := SolveMod([][]int64{{2, 1, -1}, {-3, -1, 2}, {-2, 1, 2}}, []int64{8, -11, -3}, 7)
	fmt.Printf("SolveMod(p = 7): %v, x = %v\n", sm.Kind, sm.X)
	dm, _ := DeterminantMod([][]int64{{2, 1, -1}, {-3, -1, 2}, {-2, 1, 2}}, 7)
	fmt.Println("DeterminantMod(p = 7):", dm)
	P := [][]float64{{1e-8, 0, 1}, {1, 1e-8, 0}, {0, 1, 0}}
	naive, _ := SolveWithoutPivoting(P, []float64{1, 2, 3}, Eps)
	good, _ := Solve(P, []float64{1, 2, 3}, Eps)
	fmt.Println("pivoting example, without pivoting:", naive.X)
	fmt.Println("pivoting example, partial pivoting:", good.X)
}
