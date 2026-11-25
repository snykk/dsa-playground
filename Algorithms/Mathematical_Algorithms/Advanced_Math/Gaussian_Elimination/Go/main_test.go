package main

import (
	"errors"
	"math"
	"math/big"
	"math/rand"
	"reflect"
	"strings"
	"testing"
)

// The pinned values (between the PINNED markers) were computed by the Python implementation
// (gaussian_elimination.py): the modular results exactly, the floating-point ones within a
// tolerance. The rest checks random systems with a known solution, singular and inconsistent
// systems built on purpose, rank and determinant against cofactor expansion in math/big,
// non-square systems, the pivoting example, the edge cases and the errors.

type pinnedModCase struct {
	A       [][]int64
	b       []int64
	p       uint64
	kind    Kind
	x       []uint64
	rank    int
	pivots  []int
	swaps   int
	updates int
}

type pinnedDetModCase struct {
	A   [][]int64
	p   uint64
	det uint64
}

type pinnedFloatCase struct {
	A       [][]float64
	b       []float64
	kind    Kind
	x       []float64
	rank    int
	pivots  []int
	swaps   int
	updates int
}

type pinnedDetCase struct {
	A   [][]float64
	det float64
}

// PINNED (generated from Python)
var pinnedMod = []pinnedModCase{
	{[][]int64{{2, 1, -1}, {-3, -1, 2}, {-2, 1, 2}}, []int64{8, -11, -3}, 7, Unique, []uint64{2, 3, 6}, 3, []int{0, 1, 2}, 0, 8},
	{[][]int64{{2, 1, -1}, {-3, -1, 2}, {-2, 1, 2}}, []int64{8, -11, -3}, 1000000007, Unique, []uint64{2, 3, 1000000006}, 3, []int{0, 1, 2}, 0, 8},
	{[][]int64{{2, 1, -1}, {-3, -1, 2}, {-2, 1, 2}}, []int64{8, -11, -3}, 2, Unique, []uint64{0, 1, 1}, 3, []int{0, 1, 2}, 1, 2},
	{[][]int64{{2, 1, -1}, {-3, -1, 2}, {-2, 1, 2}}, []int64{8, -11, -3}, 3, Unique, []uint64{2, 0, 2}, 3, []int{0, 1, 2}, 0, 5},
	{[][]int64{{1, 2}, {2, 4}}, []int64{3, 6}, 13, Infinite, []uint64{3, 0}, 1, []int{0}, 0, 2},
	{[][]int64{{1, 2}, {2, 4}}, []int64{3, 7}, 13, NoSolution, nil, 1, []int{0}, 0, 2},
	{[][]int64{{5}}, []int64{3}, 7, Unique, []uint64{2}, 1, []int{0}, 0, 0},
	{[][]int64{{0}}, []int64{0}, 5, Infinite, []uint64{0}, 0, []int{}, 0, 0},
	{[][]int64{{0}}, []int64{4}, 5, NoSolution, nil, 0, []int{}, 0, 0},
	{[][]int64{{7}}, []int64{3}, 7, NoSolution, nil, 0, []int{}, 0, 0},
	{[][]int64{{0, 0, 0}, {0, 0, 0}}, []int64{0, 0}, 11, Infinite, []uint64{0, 0, 0}, 0, []int{}, 0, 0},
	{[][]int64{{0, 0}, {0, 0}, {0, 0}}, []int64{0, 1, 0}, 11, NoSolution, nil, 0, []int{}, 0, 0},
	{[][]int64{{1, 2, 3}, {0, 1, 4}, {5, 6, 0}}, []int64{0, 0, 0}, 101, Unique, []uint64{0, 0, 0}, 3, []int{0, 1, 2}, 0, 5},
	{[][]int64{{1, 2, 3}, {2, 4, 6}, {1, 0, 1}}, []int64{0, 0, 0}, 101, Infinite, []uint64{0, 0, 0}, 2, []int{0, 1}, 1, 6},
	{[][]int64{{1, 1}, {1, 2}, {2, 3}, {3, 5}}, []int64{3, 5, 8, 13}, 1009, Unique, []uint64{1, 2}, 2, []int{0, 1}, 0, 8},
	{[][]int64{{1, 1}, {1, 2}, {2, 3}, {3, 5}}, []int64{3, 5, 8, 14}, 1009, NoSolution, nil, 2, []int{0, 1}, 0, 8},
	{[][]int64{{1, 2, 3, 4}, {5, 6, 7, 8}}, []int64{1, 2}, 1009, Infinite, []uint64{504, 253, 0, 0}, 2, []int{0, 1}, 0, 4},
	{[][]int64{{1, 2, 3, 4}, {2, 4, 7, 9}}, []int64{5, 11}, 1009, Infinite, []uint64{2, 0, 1, 0}, 2, []int{0, 2}, 0, 4},
	{[][]int64{{-1, -2}, {-3, -4}}, []int64{-5, -6}, 1000000007, Unique, []uint64{1000000003, 500000008}, 2, []int{0, 1}, 0, 2},
	{[][]int64{{0, 1}, {1, 0}}, []int64{2, 3}, 5, Unique, []uint64{3, 2}, 2, []int{0, 1}, 1, 0},
	{[][]int64{{0, 1, 2}, {0, 2, 5}, {0, 3, 7}}, []int64{1, 2, 3}, 13, Infinite, []uint64{0, 1, 0}, 2, []int{1, 2}, 0, 5},
	{[][]int64{{3, 1}, {6, 2}}, []int64{1, 2}, 3, Infinite, []uint64{0, 1}, 1, []int{1}, 0, 1},
	{[][]int64{{-28, 36, -50, -45}, {36, 38, -33, 27}, {9, 12, -30, 47}, {6, 4, 49, 22}}, []int64{-19, -41, 42, -50}, 998244353, Unique, []uint64{515992288, 296635012, 558304060, 649083976}, 4, []int{0, 1, 2, 3}, 0, 20},
	{[][]int64{{9223372036854775807, 2, 3}, {5, -9223372036854775807, 7}, {11, 13, 9223372036854775806}}, []int64{9223372036854775807, math.MinInt64, 1}, 2305843009213693951, Unique, []uint64{2120702329641791514, 2053378446161099725, 353450388273631922}, 3, []int{0, 1, 2}, 0, 8},
	{[][]int64{{9223372036854775807, math.MinInt64, 3}, {5, 9223372036854775800, -11}, {-9223372036854775807, 13, 9223372036854775807}}, []int64{1, 9223372036854775807, math.MinInt64}, 18446744073709551557, Unique, []uint64{10136804533795096339, 18128638826461175054, 17401701131164709028}, 3, []int{0, 1, 2}, 0, 8},
	{[][]int64{{0, 0, 1, 1}, {0, 1, 1, 0}, {0, 1, 0, 1}, {1, 0, 1, 1}}, []int64{1, 1, 0, 1}, 2, Infinite, []uint64{0, 0, 1, 0}, 3, []int{0, 1, 2}, 1, 5},
	{[][]int64{{-9, 0, -8, -5, -9}, {0, 7, 5, 3, 6}, {3, 7, 4, -3, 1}, {-3, -4, -6, -3, 6}, {3, -3, -7, 4, -4}}, []int64{4, 3, 6, -6, 5}, 13, Unique, []uint64{4, 1, 6, 4, 1}, 5, []int{0, 1, 2, 3, 4}, 0, 35},
	{[][]int64{{-91, 24, 94, 6, 47}, {94, -75, -91, 26, -44}, {43, -6, 27, -57, 72}, {-63, 89, 20, 75, -17}}, []int64{-91, -32, 4, -1}, 10007, Infinite, []uint64{6203, 8653, 5038, 537, 0}, 4, []int{0, 1, 2, 3}, 0, 26},
	{[][]int64{{2, 7, 1}, {9, -7, -9}, {-7, -5, 8}, {-1, -2, 4}, {8, 7, -7}}, []int64{-3, -8, 5, -8, -9}, 97, NoSolution, nil, 3, []int{0, 1, 2}, 0, 20},
	{[][]int64{{2, 4, 6}, {1, 2, 3}, {3, 6, 9}}, []int64{2, 1, 3}, 7, Infinite, []uint64{1, 0, 0}, 1, []int{0}, 0, 6},
	{[][]int64{{2, 4, 6}, {1, 2, 3}, {3, 6, 9}}, []int64{2, 1, 4}, 7, NoSolution, nil, 1, []int{0}, 0, 6},
	{[][]int64{{1, 0, 0, 0}, {0, 0, 1, 0}, {0, 0, 0, 1}}, []int64{4, 5, 6}, 1000003, Infinite, []uint64{4, 0, 5, 6}, 3, []int{0, 2, 3}, 0, 0},
	{[][]int64{{1, 5, 0}, {6, 3, -3}, {3, -2, -3}, {5, -1, -3}, {2, 2, -1}}, []int64{227, 147, -84, -35, 94}, 97, Unique, []uint64{2, 45, 0}, 3, []int{0, 1, 2}, 0, 20},
}
var pinnedDetMod = []pinnedDetModCase{
	{[][]int64{{2, 1, -1}, {-3, -1, 2}, {-2, 1, 2}}, 7, 6},
	{[][]int64{{2, 1, -1}, {-3, -1, 2}, {-2, 1, 2}}, 1000000007, 1000000006},
	{[][]int64{{0, 1}, {1, 0}}, 5, 4},
	{[][]int64{{1, 2}, {2, 4}}, 13, 0},
	{[][]int64{{-3}}, 7, 4},
	{[][]int64{{0}}, 2, 0},
	{[][]int64{{1, 1, 0}, {0, 1, 1}, {1, 0, 1}}, 2, 0},
	{[][]int64{{75, 27, -14, 47}, {-1, 68, 68, -96}, {90, -65, 61, -50}, {79, -40, -45, 98}}, 998244353, 4733599},
	{[][]int64{{9223372036854775807, math.MinInt64, 3}, {5, 9223372036854775800, -11}, {-9223372036854775807, 13, 9223372036854775807}}, 18446744073709551557, 16140901064495876140},
	{[][]int64{{0, 0, 1}, {0, 1, 0}, {1, 0, 0}}, 1000003, 1000002},
}
var pinnedFloat = []pinnedFloatCase{
	{[][]float64{{2.0, 1.0, -1.0}, {-3.0, -1.0, 2.0}, {-2.0, 1.0, 2.0}}, []float64{8.0, -11.0, -3.0}, Unique, []float64{2.0, 3.0000000000000004, -0.9999999999999999}, 3, []int{0, 1, 2}, 2, 8},
	{[][]float64{{1e-08, 0.0, 1.0}, {1.0, 1e-08, 0.0}, {0.0, 1.0, 0.0}}, []float64{1.0, 2.0, 3.0}, Unique, []float64{1.99999997, 3.0, 0.9999999800000003}, 3, []int{0, 1, 2}, 2, 5},
	{[][]float64{{1.0, 2.0}, {2.0, 4.0}}, []float64{3.0, 6.0}, Infinite, []float64{3.0, 0.0}, 1, []int{0}, 1, 2},
	{[][]float64{{1.0, 2.0}, {2.0, 4.0}}, []float64{3.0, 7.0}, NoSolution, nil, 1, []int{0}, 1, 2},
	{[][]float64{{1.0, 1.0}, {1.0, 2.0}, {2.0, 3.0}, {3.0, 5.0}}, []float64{3.0, 5.0, 8.0, 13.0}, Unique, []float64{1.0, 2.0}, 2, []int{0, 1}, 2, 8},
	{[][]float64{{1.0, 1.0}, {1.0, 2.0}, {2.0, 3.0}, {3.0, 5.0}}, []float64{3.0, 5.0, 8.0, 14.0}, NoSolution, nil, 2, []int{0, 1}, 2, 8},
	{[][]float64{{1.0, 2.0, 3.0, 4.0}, {2.0, 4.0, 7.0, 9.0}}, []float64{5.0, 11.0}, Infinite, []float64{2.0, 0.0, 1.0, 0.0}, 2, []int{0, 2}, 1, 4},
	{[][]float64{{1.0, 1.0}, {-1.0, 1.0}}, []float64{2.0, 0.0}, Unique, []float64{1.0, 1.0}, 2, []int{0, 1}, 0, 2},
	{[][]float64{{4.0}}, []float64{2.0}, Unique, []float64{0.5}, 1, []int{0}, 0, 0},
	{[][]float64{{1e-10}}, []float64{1.0}, NoSolution, nil, 0, []int{}, 0, 0},
	{[][]float64{{0.0, 0.0}, {0.0, 0.0}}, []float64{0.0, 0.0}, Infinite, []float64{0.0, 0.0}, 0, []int{}, 0, 0},
	{[][]float64{{0.5, -1.25, 2.0}, {3.0, 0.75, -1.0}, {-2.0, 4.0, 0.125}}, []float64{1.0, -2.0, 3.0}, Unique, []float64{-0.4800462695199537, 0.48120300751879697, 0.9207634470792365}, 3, []int{0, 1, 2}, 2, 8},
}
var pinnedDet = []pinnedDetCase{
	{[][]float64{{2.0, 1.0, -1.0}, {-3.0, -1.0, 2.0}, {-2.0, 1.0, 2.0}}, -0.9999999999999993},
	{[][]float64{{0.0, 1.0}, {1.0, 0.0}}, -1.0},
	{[][]float64{{1.0, 2.0}, {2.0, 4.0}}, 0.0},
	{[][]float64{{2.0, -1.0, 0.0, 3.0}, {1.0, 4.0, -2.0, 0.0}, {0.0, 5.0, 1.0, -1.0}, {3.0, 0.0, 2.0, 2.0}}, -74.0},
	{[][]float64{{7.5}}, 7.5},
}

// END PINNED

const p64 = 18446744073709551557 // the largest prime below 2^64

var primes = []uint64{2, 3, 5, 7, 13, 97, 1009, 998244353, 1000000007, 2305843009213693951, p64}

func near(got, want, tol float64) bool {
	return math.Abs(got-want) <= tol*math.Max(1, math.Abs(want))
}

func nearAll(got, want []float64, tol float64) bool {
	if len(got) != len(want) {
		return false
	}
	for i := range got {
		if !near(got[i], want[i], tol) {
			return false
		}
	}
	return true
}

// detCofactor is the determinant by cofactor expansion along the first row, exact in math/big.
func detCofactor(M [][]int64) *big.Int {
	n := len(M)
	if n == 1 {
		return big.NewInt(M[0][0])
	}
	total := new(big.Int)
	for j := 0; j < n; j++ {
		if M[0][j] == 0 {
			continue
		}
		minor := make([][]int64, 0, n-1)
		for r := 1; r < n; r++ {
			row := make([]int64, 0, n-1)
			for c := 0; c < n; c++ {
				if c != j {
					row = append(row, M[r][c])
				}
			}
			minor = append(minor, row)
		}
		term := new(big.Int).Mul(big.NewInt(M[0][j]), detCofactor(minor))
		if j%2 == 1 {
			total.Sub(total, term)
		} else {
			total.Add(total, term)
		}
	}
	return total
}

func detModRef(M [][]int64, p uint64) uint64 {
	d := detCofactor(M)
	return new(big.Int).Mod(d, new(big.Int).SetUint64(p)).Uint64()
}

func combos(n, k int) [][]int {
	var out [][]int
	var rec func(start int, cur []int)
	rec = func(start int, cur []int) {
		if len(cur) == k {
			out = append(out, append([]int(nil), cur...))
			return
		}
		for i := start; i < n; i++ {
			rec(i+1, append(cur, i))
		}
	}
	rec(0, nil)
	return out
}

// rankBrute is the largest k with a k x k minor that is not zero (modulo p when p > 0).
func rankBrute(M [][]int64, p uint64) int {
	n, m := len(M), len(M[0])
	for k := min(n, m); k > 0; k-- {
		for _, rs := range combos(n, k) {
			for _, cs := range combos(m, k) {
				minor := make([][]int64, k)
				for i, r := range rs {
					minor[i] = make([]int64, k)
					for j, c := range cs {
						minor[i][j] = M[r][c]
					}
				}
				if p == 0 && detCofactor(minor).Sign() != 0 || p > 0 && detModRef(minor, p) != 0 {
					return k
				}
			}
		}
	}
	return 0
}

func toFloat(A [][]int64) [][]float64 {
	out := make([][]float64, len(A))
	for i, row := range A {
		out[i] = make([]float64, len(row))
		for j, v := range row {
			out[i][j] = float64(v)
		}
	}
	return out
}

func residual(A [][]float64, x, b []float64) float64 {
	worst := 0.0
	for i, row := range A {
		s := 0.0
		for j, v := range x {
			s += row[j] * v
		}
		worst = math.Max(worst, math.Abs(s-b[i]))
	}
	return worst
}

func addMod(a, b, p uint64) uint64 {
	if a >= p-b {
		return a - (p - b)
	}
	return a + b
}

func matVecMod(A [][]int64, x []uint64, p uint64) []uint64 {
	out := make([]uint64, len(A))
	for i, row := range A {
		for j, v := range x {
			out[i] = addMod(out[i], MulMod(ReduceMod(row[j], p), v, p), p)
		}
	}
	return out
}

// asInt64 turns a residue in [0, p) into an int64 that reduces to it.
func asInt64(v, p uint64) int64 {
	if v <= math.MaxInt64 {
		return int64(v)
	}
	return -int64(p - v)
}

func mustSolve(t *testing.T, A [][]float64, b []float64) Solution {
	t.Helper()
	s, err := Solve(A, b, Eps)
	if err != nil {
		t.Fatalf("Solve(%v, %v): %v", A, b, err)
	}
	return s
}

func mustSolveMod(t *testing.T, A [][]int64, b []int64, p uint64) ModSolution {
	t.Helper()
	s, err := SolveMod(A, b, p)
	if err != nil {
		t.Fatalf("SolveMod(%v, %v, %d): %v", A, b, p, err)
	}
	return s
}

var workedA = [][]float64{{2, 1, -1}, {-3, -1, 2}, {-2, 1, 2}}
var workedAI = [][]int64{{2, 1, -1}, {-3, -1, 2}, {-2, 1, 2}}

/* ---------- floating point ---------- */

func TestWorkedExample(t *testing.T) {
	s := mustSolve(t, workedA, []float64{8, -11, -3})
	if s.Kind != Unique || s.Kind.String() != "unique" || s.Rank != 3 || s.Swaps != 2 || s.Updates != 8 || !reflect.DeepEqual(s.PivotCols, []int{0, 1, 2}) {
		t.Fatalf("got %+v", s)
	}
	if !nearAll(s.X, []float64{2, 3, -1}, Eps) {
		t.Fatalf("x = %v", s.X)
	}
	if d, _ := Determinant(workedA, Eps); !near(d, -1, Eps) {
		t.Fatalf("det = %v", d)
	}
}

func TestRandomSystemsWithAKnownSolution(t *testing.T) {
	rng := rand.New(rand.NewSource(1))
	checked := 0
	for trial := 0; trial < 400; trial++ {
		n := 1 + rng.Intn(6)
		A := make([][]int64, n)
		for i := range A {
			A[i] = make([]int64, n)
			for j := range A[i] {
				A[i][j] = int64(rng.Intn(19) - 9)
			}
		}
		if detCofactor(A).Sign() == 0 {
			continue
		}
		xTrue := make([]float64, n)
		for j := range xTrue {
			xTrue[j] = float64(rng.Intn(19) - 9)
		}
		b := make([]float64, n)
		for i := range A {
			for j := range xTrue {
				b[i] += float64(A[i][j]) * xTrue[j]
			}
		}
		s := mustSolve(t, toFloat(A), b)
		if s.Kind != Unique || s.Rank != n {
			t.Fatalf("A = %v: %+v", A, s)
		}
		for j := range xTrue {
			if math.Abs(s.X[j]-xTrue[j]) > Eps {
				t.Fatalf("A = %v, b = %v: x = %v, want %v", A, b, s.X, xTrue)
			}
		}
		checked++
	}
	if checked < 300 {
		t.Fatalf("only %d nonsingular systems", checked)
	}
	for trial := 0; trial < 300; trial++ {
		n := 1 + rng.Intn(10)
		A := make([][]float64, n)
		for i := range A {
			A[i] = make([]float64, n)
			for j := range A[i] {
				A[i][j] = rng.Float64()*20 - 10
			}
		}
		xTrue := make([]float64, n)
		for j := range xTrue {
			xTrue[j] = rng.Float64()*20 - 10
		}
		b := make([]float64, n)
		for i := range A {
			for j := range xTrue {
				b[i] += A[i][j] * xTrue[j]
			}
		}
		s := mustSolve(t, A, b)
		if s.Kind != Unique || !nearAll(s.X, xTrue, 1e-6) || residual(A, s.X, b) > Eps {
			t.Fatalf("A = %v: %+v", A, s)
		}
	}
}

func TestSingularAndInconsistentBuiltOnPurpose(t *testing.T) {
	rng := rand.New(rand.NewSource(3))
	for trial := 0; trial < 300; trial++ {
		n, m := 2+rng.Intn(5), 2+rng.Intn(5)
		A := make([][]int64, n)
		for i := 0; i < n-1; i++ {
			A[i] = make([]int64, m)
			for j := range A[i] {
				A[i][j] = int64(rng.Intn(11) - 5)
			}
		}
		A[n-1] = make([]int64, m)
		for i := 0; i < n-1; i++ {
			w := int64(rng.Intn(7) - 3)
			for j := 0; j < m; j++ {
				A[n-1][j] += w * A[i][j]
			}
		}
		xTrue := make([]float64, m)
		for j := range xTrue {
			xTrue[j] = float64(rng.Intn(11) - 5)
		}
		b := make([]float64, n)
		for i := range A {
			for j := range xTrue {
				b[i] += float64(A[i][j]) * xTrue[j]
			}
		}
		Af := toFloat(A)
		s := mustSolve(t, Af, b)
		want := Infinite
		if s.Rank == m {
			want = Unique
		}
		if s.Kind != want || s.Rank >= n || residual(Af, s.X, b) > 1e-7 {
			t.Fatalf("A = %v, b = %v: %+v", A, b, s)
		}
		if n <= 4 && m <= 4 && s.Rank != rankBrute(A, 0) {
			t.Fatalf("A = %v: rank %d, brute force %d", A, s.Rank, rankBrute(A, 0))
		}
		b[n-1]++
		if bad := mustSolve(t, Af, b); bad.Kind != NoSolution || bad.X != nil || bad.Kind.String() != "no solution" {
			t.Fatalf("A = %v, b = %v: %+v", A, b, bad)
		}
	}
}

func TestRankAndDeterminantAgainstBruteForce(t *testing.T) {
	rng := rand.New(rand.NewSource(4))
	choices := []int64{0, 0, 1, -1, 2, 3}
	for trial := 0; trial < 500; trial++ {
		n, m := 1+rng.Intn(4), 1+rng.Intn(4)
		A := make([][]int64, n)
		for i := range A {
			A[i] = make([]int64, m)
			for j := range A[i] {
				A[i][j] = choices[rng.Intn(6)]
			}
		}
		if rng.Intn(10) < 3 && n > 1 {
			for j := 0; j < m; j++ {
				A[n-1][j] = 2 * A[0][j]
			}
		}
		if s := mustSolve(t, toFloat(A), make([]float64, n)); s.Rank != rankBrute(A, 0) {
			t.Fatalf("A = %v: rank %d, brute force %d", A, s.Rank, rankBrute(A, 0))
		}
	}
	for trial := 0; trial < 400; trial++ {
		n := 1 + rng.Intn(6)
		A := make([][]int64, n)
		for i := range A {
			A[i] = make([]int64, n)
			for j := range A[i] {
				A[i][j] = int64(rng.Intn(19) - 9)
			}
		}
		if rng.Intn(5) == 0 && n > 1 {
			copy(A[n-1], A[0])
		}
		want, _ := new(big.Float).SetInt(detCofactor(A)).Float64()
		if got, _ := Determinant(toFloat(A), Eps); !near(got, want, Eps) {
			t.Fatalf("A = %v: det %v, want %v", A, got, want)
		}
	}
}

func TestNonSquare(t *testing.T) {
	tall := [][]float64{{1, 1}, {1, 2}, {2, 3}, {3, 5}}
	if s := mustSolve(t, tall, []float64{3, 5, 8, 13}); s.Kind != Unique || s.Rank != 2 || !nearAll(s.X, []float64{1, 2}, Eps) {
		t.Fatalf("tall: %+v", s)
	}
	if s := mustSolve(t, tall, []float64{3, 5, 8, 14}); s.Kind != NoSolution {
		t.Fatalf("tall, inconsistent: %+v", s)
	}
	if s := mustSolve(t, [][]float64{{1, 1}, {2, 2}, {3, 3}}, []float64{2, 4, 6}); s.Kind != Infinite || s.Rank != 1 {
		t.Fatalf("same column: %+v", s)
	}
	s := mustSolve(t, [][]float64{{1, 2, 3, 4}, {2, 4, 7, 9}}, []float64{5, 11})
	if s.Kind != Infinite || !reflect.DeepEqual(s.PivotCols, []int{0, 2}) || !nearAll(s.X, []float64{2, 0, 1, 0}, Eps) {
		t.Fatalf("wide: %+v", s)
	}
	rng := rand.New(rand.NewSource(6))
	for trial := 0; trial < 200; trial++ {
		n := 1 + rng.Intn(4)
		m := n + 1 + rng.Intn(6-n)
		A := make([][]float64, n)
		b := make([]float64, n)
		for i := range A {
			A[i] = make([]float64, m)
			for j := range A[i] {
				A[i][j] = float64(rng.Intn(11) - 5)
			}
			b[i] = float64(rng.Intn(11) - 5)
		}
		w := mustSolve(t, A, b)
		if w.Kind == Unique || w.Kind == Infinite && residual(A, w.X, b) > 1e-7 {
			t.Fatalf("A = %v, b = %v: %+v", A, b, w)
		}
	}
}

func TestThePivotingExample(t *testing.T) {
	P := [][]float64{{1e-8, 0, 1}, {1, 1e-8, 0}, {0, 1, 0}}
	naive, _ := SolveWithoutPivoting(P, []float64{1, 2, 3}, Eps)
	good := mustSolve(t, P, []float64{1, 2, 3})
	if naive.Kind != Unique || naive.Swaps != 0 || math.Abs(naive.X[1]-3) <= 1 {
		t.Fatalf("without pivoting: %+v", naive)
	}
	// The same wrong digits as Python: float64(...) rounds the product before the subtraction.
	if !nearAll(naive.X, []float64{1.9999999545383673, 4.470348358154297, 0.9999999800000005}, Eps) {
		t.Fatalf("without pivoting: x = %v", naive.X)
	}
	if good.Swaps != 2 || !nearAll(good.X, []float64{1.99999997, 3.0, 0.9999999800000003}, 1e-15) {
		t.Fatalf("partial pivoting: %+v", good)
	}
	D := [][]float64{{10, 1, 2}, {1, 12, -3}, {2, -1, 9}}
	a := mustSolve(t, D, []float64{1, 2, 3})
	c, _ := SolveWithoutPivoting(D, []float64{1, 2, 3}, Eps)
	if !reflect.DeepEqual(a.X, c.X) {
		t.Fatalf("diagonally dominant: %v vs %v", a.X, c.X)
	}
	if z, _ := SolveWithoutPivoting([][]float64{{0, 1}, {1, 0}}, []float64{2, 3}, Eps); z.Swaps != 1 || !nearAll(z.X, []float64{3, 2}, Eps) {
		t.Fatalf("zero pivot: %+v", z)
	}
}

func TestToleranceAndTies(t *testing.T) {
	if s := mustSolve(t, [][]float64{{1e-10}}, []float64{1}); s.Kind != NoSolution || s.Rank != 0 {
		t.Fatalf("1e-10: %+v", s)
	}
	if s, _ := Solve([][]float64{{1e-10}}, []float64{1}, 1e-12); s.Kind != Unique || !near(s.X[0], 1e10, Eps) {
		t.Fatalf("eps 1e-12: %+v", s)
	}
	if s := mustSolve(t, [][]float64{{1e-10}}, []float64{1e-10}); s.Kind != Infinite {
		t.Fatalf("0 = 0: %+v", s)
	}
	if s := mustSolve(t, [][]float64{{1, 1}, {-1, 1}}, []float64{2, 0}); s.Swaps != 0 {
		t.Fatalf("a tie keeps the upper row: %+v", s)
	}
	if s := mustSolve(t, [][]float64{{1, 2}, {3, 4}}, []float64{5, 6}); s.Swaps != 1 {
		t.Fatalf("swap: %+v", s)
	}
}

func TestEdgeCases(t *testing.T) {
	if s := mustSolve(t, [][]float64{{4}}, []float64{2}); s.Kind != Unique || !reflect.DeepEqual(s.X, []float64{0.5}) || s.Updates != 0 {
		t.Fatalf("[[4]]: %+v", s)
	}
	if s := mustSolve(t, [][]float64{{0}}, []float64{0}); s.Kind != Infinite || !reflect.DeepEqual(s.X, []float64{0}) || s.Rank != 0 {
		t.Fatalf("[[0]], 0: %+v", s)
	}
	if s := mustSolve(t, [][]float64{{0}}, []float64{3}); s.Kind != NoSolution {
		t.Fatalf("[[0]], 3: %+v", s)
	}
	if d, _ := Determinant([][]float64{{-2.5}}, Eps); d != -2.5 {
		t.Fatalf("det [[-2.5]] = %v", d)
	}
	if d, _ := Determinant([][]float64{{0}}, Eps); d != 0 {
		t.Fatalf("det [[0]] = %v", d)
	}
	for _, nm := range [][2]int{{1, 3}, {3, 1}, {3, 3}, {2, 5}} {
		n, m := nm[0], nm[1]
		Z := make([][]float64, n)
		for i := range Z {
			Z[i] = make([]float64, m)
		}
		if z := mustSolve(t, Z, make([]float64, n)); z.Kind != Infinite || z.Rank != 0 || z.Updates != 0 || !reflect.DeepEqual(z.X, make([]float64, m)) {
			t.Fatalf("zero %dx%d: %+v", n, m, z)
		}
		b := make([]float64, n)
		b[n-1] = 1
		if z := mustSolve(t, Z, b); z.Kind != NoSolution {
			t.Fatalf("zero %dx%d, b != 0: %+v", n, m, z)
		}
	}
	if s := mustSolve(t, [][]float64{{1, 2}, {3, 4}}, []float64{0, 0}); s.Kind != Unique || !nearAll(s.X, []float64{0, 0}, Eps) {
		t.Fatalf("homogeneous: %+v", s)
	}
	if s := mustSolve(t, [][]float64{{1, 2, 3}, {2, 4, 6}, {1, 0, 1}}, []float64{0, 0, 0}); s.Kind != Infinite || s.Rank != 2 {
		t.Fatalf("homogeneous, singular: %+v", s)
	}
}

func TestErrors(t *testing.T) {
	expect := func(err error, target error, needle string) {
		t.Helper()
		if !errors.Is(err, target) || !strings.Contains(err.Error(), needle) {
			t.Fatalf("got %v, want %v containing %q", err, target, needle)
		}
	}
	_, err := Solve(nil, nil, Eps)
	expect(err, ErrShape, "no rows")
	_, err = Solve([][]float64{{}}, []float64{1}, Eps)
	expect(err, ErrShape, "no columns")
	_, err = Solve([][]float64{{1, 2}, {3}}, []float64{1, 2}, Eps)
	expect(err, ErrShape, "row 1 of A has 1 entries")
	_, err = SolveWithoutPivoting([][]float64{{1, 2}, {3, 4}}, []float64{1}, Eps)
	expect(err, ErrShape, "b has 1 entries")
	_, err = Determinant([][]float64{{1, 2}}, Eps)
	expect(err, ErrShape, "square")
	_, err = SolveMod([][]int64{{1}}, []int64{1}, 1)
	expect(err, ErrModulus, "at least 2")
	_, err = SolveMod([][]int64{{1, 2}, {3}}, []int64{1, 2}, 7)
	expect(err, ErrShape, "row 1 of A")
	_, err = SolveMod([][]int64{{2}}, []int64{1}, 4)
	expect(err, ErrNoInverse, "p must be prime")
	_, err = DeterminantMod([][]int64{{3, 1}, {1, 1}}, 9)
	expect(err, ErrNoInverse, "no inverse modulo 9")
	_, err = DeterminantMod([][]int64{{1, 2}}, 7)
	expect(err, ErrShape, "square")
	_, err = DeterminantMod([][]int64{{1}}, 0)
	expect(err, ErrModulus, "p = 0")
}

func TestPinnedFloat(t *testing.T) {
	for _, c := range pinnedFloat {
		s := mustSolve(t, c.A, c.b)
		if s.Kind != c.kind || s.Rank != c.rank || !reflect.DeepEqual(s.PivotCols, c.pivots) || s.Swaps != c.swaps || s.Updates != c.updates || !nearAll(s.X, c.x, Eps) {
			t.Fatalf("A = %v, b = %v: got %+v, want %+v", c.A, c.b, s, c)
		}
	}
	for _, c := range pinnedDet {
		if d, _ := Determinant(c.A, Eps); !near(d, c.det, Eps) {
			t.Fatalf("det %v = %v, want %v", c.A, d, c.det)
		}
	}
}

/* ---------- modulo a prime ---------- */

func TestModWorkedExample(t *testing.T) {
	s := mustSolveMod(t, workedAI, []int64{8, -11, -3}, 7)
	if s.Kind != Unique || !reflect.DeepEqual(s.X, []uint64{2, 3, 6}) || s.Updates != 8 {
		t.Fatalf("got %+v", s)
	}
	if d, _ := DeterminantMod(workedAI, 7); d != 6 {
		t.Fatalf("det = %d", d)
	}
	if inv, _ := InverseMod(5, 7); inv != 3 || MulMod(5, 3, 7) != 1 || PowMod(2, 10, 1000) != 24 {
		t.Fatal("helpers")
	}
	if ReduceMod(-1, 7) != 6 || ReduceMod(math.MinInt64, p64) != p64-9223372036854775808 {
		t.Fatal("ReduceMod")
	}
}

func TestModRandomSystemsWithAKnownSolution(t *testing.T) {
	rng := rand.New(rand.NewSource(7))
	for _, p := range primes {
		for trial := 0; trial < 60; trial++ {
			n, m := 1+rng.Intn(6), 1+rng.Intn(6)
			A := make([][]int64, n)
			for i := range A {
				A[i] = make([]int64, m)
				for j := range A[i] {
					A[i][j] = int64(rng.Uint64()) // any int64, negative ones too
				}
			}
			xTrue := make([]uint64, m)
			for j := range xTrue {
				xTrue[j] = rng.Uint64() % p
			}
			bu := matVecMod(A, xTrue, p)
			b := make([]int64, n)
			for i, v := range bu {
				b[i] = asInt64(v, p)
			}
			s := mustSolveMod(t, A, b, p)
			if s.Kind == NoSolution || !reflect.DeepEqual(matVecMod(A, s.X, p), bu) {
				t.Fatalf("p = %d, A = %v: %+v", p, A, s)
			}
			if s.Rank == m && (s.Kind != Unique || !reflect.DeepEqual(s.X, xTrue)) || s.Rank < m && s.Kind != Infinite {
				t.Fatalf("p = %d, A = %v: %+v, want x = %v", p, A, s, xTrue)
			}
		}
	}
}

func TestModRankAndDeterminantAgainstBruteForce(t *testing.T) {
	rng := rand.New(rand.NewSource(8))
	for _, p := range []uint64{2, 3, 5, 7, 1009} {
		for trial := 0; trial < 150; trial++ {
			n, m := 1+rng.Intn(4), 1+rng.Intn(4)
			A := make([][]int64, n)
			for i := range A {
				A[i] = make([]int64, m)
				for j := range A[i] {
					if rng.Intn(10) < 7 {
						A[i][j] = int64(rng.Uint64() % p)
					}
				}
			}
			if s := mustSolveMod(t, A, make([]int64, n), p); s.Rank != rankBrute(A, p) {
				t.Fatalf("p = %d, A = %v: rank %d, brute force %d", p, A, s.Rank, rankBrute(A, p))
			}
		}
	}
	for _, p := range primes {
		for trial := 0; trial < 40; trial++ {
			n := 1 + rng.Intn(5)
			A := make([][]int64, n)
			for i := range A {
				A[i] = make([]int64, n)
				for j := range A[i] {
					A[i][j] = int64(rng.Uint64())
				}
			}
			if d, _ := DeterminantMod(A, p); d != detModRef(A, p) {
				t.Fatalf("p = %d, A = %v: det %d, want %d", p, A, d, detModRef(A, p))
			}
		}
	}
}

func TestModSingularAndInconsistent(t *testing.T) {
	rng := rand.New(rand.NewSource(10))
	for _, p := range []uint64{5, 13, 998244353} {
		for trial := 0; trial < 80; trial++ {
			n, m := 2+rng.Intn(4), 1+rng.Intn(5)
			A := make([][]int64, n)
			for i := range A {
				A[i] = make([]int64, m)
			}
			w := make([]uint64, n-1)
			for i := 0; i < n-1; i++ {
				w[i] = rng.Uint64() % p
				for j := range A[i] {
					A[i][j] = int64(rng.Uint64() % p)
				}
			}
			for j := 0; j < m; j++ {
				var s uint64
				for i := 0; i < n-1; i++ {
					s = addMod(s, MulMod(w[i], uint64(A[i][j]), p), p)
				}
				A[n-1][j] = int64(s)
			}
			xTrue := make([]uint64, m)
			for j := range xTrue {
				xTrue[j] = rng.Uint64() % p
			}
			bu := matVecMod(A, xTrue, p)
			b := make([]int64, n)
			for i, v := range bu {
				b[i] = int64(v)
			}
			s := mustSolveMod(t, A, b, p)
			if s.Rank >= n || !reflect.DeepEqual(matVecMod(A, s.X, p), bu) {
				t.Fatalf("p = %d, A = %v: %+v", p, A, s)
			}
			b[n-1] = int64((bu[n-1] + 1) % p)
			if bad := mustSolveMod(t, A, b, p); bad.Kind != NoSolution || bad.X != nil {
				t.Fatalf("p = %d, A = %v, b = %v: %+v", p, A, b, bad)
			}
		}
	}
}

func TestModEdgeCases(t *testing.T) {
	if s := mustSolveMod(t, [][]int64{{5}}, []int64{3}, 7); s.Kind != Unique || !reflect.DeepEqual(s.X, []uint64{2}) {
		t.Fatalf("[[5]]: %+v", s)
	}
	if s := mustSolveMod(t, [][]int64{{0}}, []int64{0}, 5); s.Kind != Infinite || !reflect.DeepEqual(s.X, []uint64{0}) || s.Rank != 0 {
		t.Fatalf("[[0]]: %+v", s)
	}
	for _, c := range []struct {
		a, b int64
		want Kind
	}{{0, 4, NoSolution}, {7, 3, NoSolution}, {7, 14, Infinite}} {
		if s := mustSolveMod(t, [][]int64{{c.a}}, []int64{c.b}, map[bool]uint64{true: 5, false: 7}[c.a == 0]); s.Kind != c.want {
			t.Fatalf("[[%d]] x = %d: %+v", c.a, c.b, s)
		}
	}
	if s := mustSolveMod(t, [][]int64{{0, 0, 0}, {0, 0, 0}}, []int64{0, 0}, 11); !reflect.DeepEqual(s.X, []uint64{0, 0, 0}) {
		t.Fatalf("zero matrix: %+v", s)
	}
	for _, c := range []struct {
		A    [][]int64
		p    uint64
		want uint64
	}{{[][]int64{{0, 0}, {0, 0}}, 11, 0}, {[][]int64{{-3}}, 7, 4}, {[][]int64{{0, 1}, {1, 0}}, 5, 4}, {[][]int64{{0, 1}, {1, 0}}, 2, 1}} {
		if d, _ := DeterminantMod(c.A, c.p); d != c.want {
			t.Fatalf("det %v mod %d = %d, want %d", c.A, c.p, d, c.want)
		}
	}
	if s := mustSolveMod(t, [][]int64{{1, 2, 3}, {0, 1, 4}, {5, 6, 0}}, []int64{0, 0, 0}, 101); !reflect.DeepEqual(s.X, []uint64{0, 0, 0}) {
		t.Fatalf("homogeneous: %+v", s)
	}
	if s := mustSolveMod(t, [][]int64{{1, 2, 3}, {2, 4, 6}, {1, 0, 1}}, []int64{0, 0, 0}, 101); s.Kind != Infinite {
		t.Fatalf("homogeneous, singular: %+v", s)
	}
}

func TestModPinned(t *testing.T) {
	for _, c := range pinnedMod {
		s := mustSolveMod(t, c.A, c.b, c.p)
		want := ModSolution{c.kind, c.x, c.rank, c.pivots, c.swaps, c.updates}
		if !reflect.DeepEqual(s, want) {
			t.Fatalf("A = %v, b = %v, p = %d: got %+v, want %+v", c.A, c.b, c.p, s, want)
		}
	}
	for _, c := range pinnedDetMod {
		if d, _ := DeterminantMod(c.A, c.p); d != c.det {
			t.Fatalf("det %v mod %d = %d, want %d", c.A, c.p, d, c.det)
		}
	}
}

/* ---------- the work ---------- */

func TestWorkCount(t *testing.T) {
	rng := rand.New(rand.NewSource(11))
	for _, n := range []int{1, 2, 3, 5, 10, 20, 40, 80} {
		A := make([][]float64, n)
		b := make([]float64, n)
		for i := range A {
			A[i] = make([]float64, n)
			for j := range A[i] {
				A[i][j] = 1 + rng.Float64()
			}
			b[i] = 1
		}
		if s := mustSolve(t, A, b); s.Updates != (n-1)*n*(n+1)/3 {
			t.Fatalf("n = %d: %d updates, want %d", n, s.Updates, (n-1)*n*(n+1)/3)
		}
	}
	for _, nm := range [][2]int{{5, 3}, {3, 5}, {8, 2}, {2, 8}} {
		n, m := nm[0], nm[1]
		A := make([][]float64, n)
		for i := range A {
			A[i] = make([]float64, m)
			for j := range A[i] {
				A[i][j] = 1 + rng.Float64()
			}
		}
		want := 0
		for k := 0; k < min(n, m); k++ {
			want += (n - 1 - k) * (m - k)
		}
		if s := mustSolve(t, A, make([]float64, n)); s.Updates != want {
			t.Fatalf("%dx%d: %d updates, want %d", n, m, s.Updates, want)
		}
	}
	for _, n := range []int{1, 4, 9} {
		I := make([][]float64, n)
		U := make([][]float64, n)
		b := make([]float64, n)
		for i := 0; i < n; i++ {
			I[i] = make([]float64, n)
			U[i] = make([]float64, n)
			I[i][i] = 1
			for j := i; j < n; j++ {
				U[i][j] = 1
			}
			b[i] = 1
		}
		if s := mustSolve(t, I, b); s.Updates != 0 { // rows already zero are skipped
			t.Fatalf("identity %d: %d updates", n, s.Updates)
		}
		if s := mustSolve(t, U, b); s.Updates != 0 {
			t.Fatalf("upper %d: %d updates", n, s.Updates)
		}
	}
	if s := mustSolveMod(t, [][]int64{{1, 0, 0}, {0, 1, 0}, {0, 0, 1}}, []int64{1, 2, 3}, 7); s.Updates != 0 {
		t.Fatalf("identity mod 7: %d updates", s.Updates)
	}
}

func TestInputIsNotModified(t *testing.T) {
	A := [][]float64{{0, 1}, {1, 0}}
	b := []float64{2, 3}
	if _, err := Solve(A, b, Eps); err != nil || !reflect.DeepEqual(A, [][]float64{{0, 1}, {1, 0}}) || !reflect.DeepEqual(b, []float64{2, 3}) {
		t.Fatalf("Solve changed its input: %v %v", A, b)
	}
	if _, err := Determinant(A, Eps); err != nil || !reflect.DeepEqual(A, [][]float64{{0, 1}, {1, 0}}) {
		t.Fatalf("Determinant changed its input: %v", A)
	}
}
