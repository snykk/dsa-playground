package main

import (
	"testing"
)

func TestN4Solutions(t *testing.T) {
	solutions := solveNQueensAll(4)
	if len(solutions) != 2 {
		t.Errorf("4-queens should have 2 solutions, got %d", len(solutions))
	}
}

func TestN4FirstSolution(t *testing.T) {
	solution := solveNQueens(4, false)
	if len(solution) == 0 {
		t.Errorf("Should find at least one solution")
	}
}

func TestN8HasSolutions(t *testing.T) {
	solution := solveNQueens(8, false)
	if len(solution) == 0 {
		t.Errorf("Should find at least one solution for 8-queens")
	}
}

func TestIsSafe(t *testing.T) {
	board := make([][]int, 4)
	for i := range board {
		board[i] = make([]int, 4)
	}

	if !isSafe(board, 0, 0, 4) {
		t.Errorf("Should be safe to place queen at (0,0)")
	}

	board[0][0] = 1
	if isSafe(board, 1, 0, 4) {
		t.Errorf("Should not be safe (same column)")
	}
	if isSafe(board, 1, 1, 4) {
		t.Errorf("Should not be safe (diagonal)")
	}
}

func validBoard(b [][]int) bool {
	n := len(b)
	type cell struct{ r, c int }
	var q []cell
	for r := 0; r < n; r++ {
		for c := 0; c < n; c++ {
			if b[r][c] == 1 {
				q = append(q, cell{r, c})
			}
		}
	}
	if len(q) != n {
		return false
	}
	abs := func(x int) int {
		if x < 0 {
			return -x
		}
		return x
	}
	for i := 0; i < n; i++ {
		for j := i + 1; j < n; j++ {
			if q[i].r == q[j].r || q[i].c == q[j].c || abs(q[i].r-q[j].r) == abs(q[i].c-q[j].c) {
				return false
			}
		}
	}
	return true
}

func TestCountsMatchOeis(t *testing.T) {
	expected := []int{1, 1, 0, 0, 2, 10, 4, 40, 92, 352} // A000170
	for n, want := range expected {
		if got := len(solveNQueensAll(n)); got != want {
			t.Errorf("n=%d: got %d solutions, want %d", n, got, want)
		}
	}
}

func TestNoSolutionFor2And3(t *testing.T) {
	if solveNQueens(2, false) != nil || solveNQueens(3, false) != nil {
		t.Errorf("2 and 3 queens have no solution")
	}
}

func TestBoardsAreValid(t *testing.T) {
	for _, b := range solveNQueensAll(6) {
		if !validBoard(b) {
			t.Fatalf("invalid board returned")
		}
	}
	if !validBoard(solveNQueens(8, false)) || !validBoard(solveNQueens(8, true)) {
		t.Errorf("8-queens board invalid")
	}
}

func TestFirstSolutionIsLexicographicallyFirst(t *testing.T) {
	b := solveNQueens(4, false)
	want := []int{1, 3, 0, 2}
	for r := 0; r < 4; r++ {
		if b[r][want[r]] != 1 {
			t.Errorf("row %d: expected queen in column %d", r, want[r])
		}
	}
}
