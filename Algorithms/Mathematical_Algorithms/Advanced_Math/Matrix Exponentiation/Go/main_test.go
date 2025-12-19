package main

import "testing"

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

	for _, row := range result {
		for _, val := range row {
			if val < 0 || val >= 1000 {
				t.Errorf("MatrixPower with mod should return values in [0, 1000), got %d", val)
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
	fib_100 := FibonacciMatrix(100, 1000)
	if fib_100 < 0 || fib_100 >= 1000 {
		t.Errorf("FibonacciMatrix(100, 1000) = %d, should be in [0, 1000)", fib_100)
	}
}
