package main

import (
	"math/big"
	"testing"
)

func TestMatrixIdentity(t *testing.T) {
	I := MatrixIdentity(3)
	if len(I) != 3 || len(I[0]) != 3 {
		t.Error("MatrixIdentity(3) should return 3x3 matrix")
	}
	if I[0][0] != 1 || I[0][1] != 0 || I[0][2] != 0 {
		t.Error("MatrixIdentity first row incorrect")
	}
	if I[1][0] != 0 || I[1][1] != 1 || I[1][2] != 0 {
		t.Error("MatrixIdentity second row incorrect")
	}
	if I[2][0] != 0 || I[2][1] != 0 || I[2][2] != 1 {
		t.Error("MatrixIdentity third row incorrect")
	}
}

func TestMatrixMultiply(t *testing.T) {
	A := [][]int64{{1, 2}, {3, 4}}
	B := [][]int64{{5, 6}, {7, 8}}
	result := MatrixMultiply(A, B, -1)

	if result[0][0] != 19 || result[0][1] != 22 {
		t.Error("MatrixMultiply first row incorrect")
	}
	if result[1][0] != 43 || result[1][1] != 50 {
		t.Error("MatrixMultiply second row incorrect")
	}
}

func TestMatrixPower(t *testing.T) {
	A := [][]int64{{1, 1}, {1, 0}}
	A_2 := MatrixPower(A, 2, -1)
	if A_2[0][0] != 2 || A_2[0][1] != 1 {
		t.Error("MatrixPower(A, 2) first row incorrect")
	}
	if A_2[1][0] != 1 || A_2[1][1] != 1 {
		t.Error("MatrixPower(A, 2) second row incorrect")
	}
}

func TestMatrixPowerIterative(t *testing.T) {
	A := [][]int64{{1, 1}, {1, 0}}
	result1 := MatrixPower(A, 5, -1)
	result2 := MatrixPowerIterative(A, 5, -1)

	if len(result1) != len(result2) {
		t.Error("MatrixPower and MatrixPowerIterative should return same size")
	}
	for i := range result1 {
		for j := range result1[i] {
			if result1[i][j] != result2[i][j] {
				t.Errorf("MatrixPower and MatrixPowerIterative differ at [%d][%d]", i, j)
			}
		}
	}
}

func TestMatrixPowerWithMod(t *testing.T) {
	A := [][]int64{{1, 1}, {1, 0}}
	result := MatrixPower(A, 10, 1000)

	// [[1,1],[1,0]]^10 = [[89, 55], [55, 34]]
	expected := [][]int64{{89, 55}, {55, 34}}
	for i := range expected {
		for j := range expected[i] {
			if result[i][j] != expected[i][j] {
				t.Errorf("MatrixPower(A, 10, 1000)[%d][%d] = %d, expected %d", i, j, result[i][j], expected[i][j])
			}
		}
	}
	// [[1,1],[1,0]]^11 = [[144, 89], [89, 55]], reduced mod 100
	r11 := MatrixPower(A, 11, 100)
	want := [][]int64{{44, 89}, {89, 55}}
	for i := range want {
		for j := range want[i] {
			if r11[i][j] != want[i][j] {
				t.Errorf("MatrixPower(A, 11, 100)[%d][%d] = %d, expected %d", i, j, r11[i][j], want[i][j])
			}
		}
	}
}

func TestFibonacciMatrix(t *testing.T) {
	tests := []struct {
		n        int64
		expected int64
	}{
		{0, 0},
		{1, 1},
		{2, 1},
		{3, 2},
		{4, 3},
		{5, 5},
		{6, 8},
		{7, 13},
	}

	for _, tt := range tests {
		result := FibonacciMatrix(tt.n, -1)
		if result != tt.expected {
			t.Errorf("FibonacciMatrix(%d) = %d, expected %d", tt.n, result, tt.expected)
		}
	}
}

func TestFibonacciMatrixLarge(t *testing.T) {
	fib_10 := FibonacciMatrix(10, -1)
	if fib_10 != 55 {
		t.Errorf("FibonacciMatrix(10) = %d, expected 55", fib_10)
	}

	fib_20 := FibonacciMatrix(20, -1)
	if fib_20 != 6765 {
		t.Errorf("FibonacciMatrix(20) = %d, expected 6765", fib_20)
	}
}

func TestFibonacciMatrixWithMod(t *testing.T) {
	// F(100) = 354224848179261915075
	if got := FibonacciMatrix(100, 1000); got != 75 {
		t.Errorf("FibonacciMatrix(100, 1000) = %d, expected 75", got)
	}
	if got := FibonacciMatrix(100, 1000000007); got != 687995182 {
		t.Errorf("FibonacciMatrix(100, 1e9+7) = %d, expected 687995182", got)
	}
}

func TestMatrixPowerFiveExact(t *testing.T) {
	a5 := MatrixPower([][]int64{{1, 1}, {1, 0}}, 5, -1)
	if a5[0][0] != 8 || a5[0][1] != 5 || a5[1][0] != 5 || a5[1][1] != 3 {
		t.Errorf("A^5 = %v, expected [[8 5] [5 3]]", a5)
	}
}

func TestNegativeEntriesReduceIntoRange(t *testing.T) {
	A := [][]int64{{-1}}
	if got := MatrixPower(A, 3, 5)[0][0]; got != 4 {
		t.Errorf("MatrixPower({{-1}}, 3, 5) = %d, expected 4", got)
	}
	if got := MatrixPowerIterative(A, 3, 5)[0][0]; got != 4 {
		t.Errorf("MatrixPowerIterative({{-1}}, 3, 5) = %d, expected 4", got)
	}
}

func TestLargeModulus(t *testing.T) {
	// 4e9 * 4e9 + 1 = 16000000000000000001 overflows int64
	A := [][]int64{{4000000000, 1}, {1, 0}}
	got := MatrixPower(A, 2, 5000000011)[0][0]

	expected := new(big.Int).Mul(big.NewInt(4000000000), big.NewInt(4000000000))
	expected.Add(expected, big.NewInt(1))
	expected.Mod(expected, big.NewInt(5000000011))
	if got != expected.Int64() {
		t.Errorf("MatrixPower(..., 5000000011)[0][0] = %d, expected %d", got, expected.Int64())
	}
}

func TestNegativeExponentPanics(t *testing.T) {
	A := [][]int64{{1, 1}, {1, 0}}
	for name, f := range map[string]func(){
		"MatrixPower":          func() { MatrixPower(A, -1, -1) },
		"MatrixPowerIterative": func() { MatrixPowerIterative(A, -1, -1) },
		"FibonacciMatrix":      func() { FibonacciMatrix(-1, -1) },
	} {
		func() {
			defer func() {
				if recover() == nil {
					t.Errorf("%s: expected a panic for a negative argument", name)
				}
			}()
			f()
		}()
	}
}

func TestModulusOneAndZero(t *testing.T) {
	A := [][]int64{{1, 1}, {1, 0}}
	z := MatrixPower(A, 0, 1)
	if z[0][0] != 0 || z[1][1] != 0 {
		t.Errorf("A^0 mod 1 = %v, expected the zero matrix", z)
	}
	// mod 0 means "no modulus" instead of a division by zero
	r := MatrixPower(A, 5, 0)
	if r[0][0] != 8 || r[1][1] != 3 {
		t.Errorf("MatrixPower(A, 5, 0) = %v, expected A^5", r)
	}
}

func TestFibonacciOverflowGuard(t *testing.T) {
	if got := FibonacciMatrix(92, -1); got != 7540113804746346429 {
		t.Errorf("FibonacciMatrix(92) = %d", got)
	}
	defer func() {
		if recover() == nil {
			t.Error("expected a panic for n > 92 without a modulus")
		}
	}()
	FibonacciMatrix(93, -1)
}
