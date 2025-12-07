package main

// StrassenMultiply multiplies two matrices using Strassen's algorithm
// Time Complexity: O(n^log₂ 7) ≈ O(n^2.81)
func StrassenMultiply(A, B [][]int) [][]int {
	n := len(A)

	if n == 1 {
		return [][]int{{A[0][0] * B[0][0]}}
	}

	if n <= 64 {
		return naiveMultiply(A, B)
	}

	// Split matrices into quadrants
	A11, A12, A21, A22 := splitMatrix(A)
	B11, B12, B21, B22 := splitMatrix(B)

	// Calculate 7 products (Strassen's key insight)
	P1 := StrassenMultiply(A11, matrixSubtract(B12, B22))
	P2 := StrassenMultiply(matrixAdd(A11, A12), B22)
	P3 := StrassenMultiply(matrixAdd(A21, A22), B11)
	P4 := StrassenMultiply(A22, matrixSubtract(B21, B11))
	P5 := StrassenMultiply(matrixAdd(A11, A22), matrixAdd(B11, B22))
	P6 := StrassenMultiply(matrixSubtract(A12, A22), matrixAdd(B21, B22))
	P7 := StrassenMultiply(matrixSubtract(A11, A21), matrixAdd(B11, B12))

	// Calculate result quadrants
	C11 := matrixAdd(matrixSubtract(matrixAdd(P5, P4), P2), P6)
	C12 := matrixAdd(P1, P2)
	C21 := matrixAdd(P3, P4)
	C22 := matrixSubtract(matrixSubtract(matrixAdd(P5, P1), P3), P7)

	// Combine quadrants
	return combineMatrices(C11, C12, C21, C22)
}

func matrixAdd(A, B [][]int) [][]int {
	n := len(A)
	C := make([][]int, n)
	for i := range C {
		C[i] = make([]int, n)
		for j := range C[i] {
			C[i][j] = A[i][j] + B[i][j]
		}
	}
	return C
}

func matrixSubtract(A, B [][]int) [][]int {
	n := len(A)
	C := make([][]int, n)
	for i := range C {
		C[i] = make([]int, n)
		for j := range C[i] {
			C[i][j] = A[i][j] - B[i][j]
		}
	}
	return C
}

func splitMatrix(matrix [][]int) ([][]int, [][]int, [][]int, [][]int) {
	n := len(matrix)
	mid := n / 2

	A11 := make([][]int, mid)
	A12 := make([][]int, mid)
	A21 := make([][]int, mid)
	A22 := make([][]int, mid)

	for i := 0; i < mid; i++ {
		A11[i] = make([]int, mid)
		A12[i] = make([]int, mid)
		A21[i] = make([]int, mid)
		A22[i] = make([]int, mid)

		for j := 0; j < mid; j++ {
			A11[i][j] = matrix[i][j]
			A12[i][j] = matrix[i][j+mid]
			A21[i][j] = matrix[i+mid][j]
			A22[i][j] = matrix[i+mid][j+mid]
		}
	}

	return A11, A12, A21, A22
}

func combineMatrices(C11, C12, C21, C22 [][]int) [][]int {
	n := len(C11)
	C := make([][]int, 2*n)
	for i := range C {
		C[i] = make([]int, 2*n)
	}

	for i := 0; i < n; i++ {
		for j := 0; j < n; j++ {
			C[i][j] = C11[i][j]
			C[i][j+n] = C12[i][j]
			C[i+n][j] = C21[i][j]
			C[i+n][j+n] = C22[i][j]
		}
	}

	return C
}

func naiveMultiply(A, B [][]int) [][]int {
	n := len(A)
	C := make([][]int, n)
	for i := range C {
		C[i] = make([]int, n)
		for j := range C[i] {
			for k := 0; k < n; k++ {
				C[i][j] += A[i][k] * B[k][j]
			}
		}
	}
	return C
}
