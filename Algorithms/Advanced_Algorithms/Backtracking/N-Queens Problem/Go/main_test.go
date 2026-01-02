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
