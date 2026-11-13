package main

import (
	"testing"
)

func TestSolveValidSudoku(t *testing.T) {
	board := [][]int{
		{5, 3, 0, 0, 7, 0, 0, 0, 0},
		{6, 0, 0, 1, 9, 5, 0, 0, 0},
		{0, 9, 8, 0, 0, 0, 0, 6, 0},
		{8, 0, 0, 0, 6, 0, 0, 0, 3},
		{4, 0, 0, 8, 0, 3, 0, 0, 1},
		{7, 0, 0, 0, 2, 0, 0, 0, 6},
		{0, 6, 0, 0, 0, 0, 2, 8, 0},
		{0, 0, 0, 4, 1, 9, 0, 0, 5},
		{0, 0, 0, 0, 8, 0, 0, 7, 9},
	}
	if !solveSudoku(board) {
		t.Errorf("Should solve valid Sudoku")
	}
	// Check that all cells are filled
	for _, row := range board {
		for _, cell := range row {
			if cell == 0 {
				t.Errorf("All cells should be filled")
			}
		}
	}
}

func TestIsValid(t *testing.T) {
	board := [][]int{
		{5, 3, 0, 0, 7, 0, 0, 0, 0},
		{6, 0, 0, 1, 9, 5, 0, 0, 0},
		{0, 9, 8, 0, 0, 0, 0, 6, 0},
		{8, 0, 0, 0, 6, 0, 0, 0, 3},
		{4, 0, 0, 8, 0, 3, 0, 0, 1},
		{7, 0, 0, 0, 2, 0, 0, 0, 6},
		{0, 6, 0, 0, 0, 0, 2, 8, 0},
		{0, 0, 0, 4, 1, 9, 0, 0, 5},
		{0, 0, 0, 0, 8, 0, 0, 7, 9},
	}
	if !isValid(board, 0, 2, 1) {
		t.Errorf("Should be valid")
	}
	if isValid(board, 0, 2, 5) {
		t.Errorf("Should not be valid (already in row)")
	}
	if isValid(board, 0, 2, 6) {
		t.Errorf("Should not be valid (already in column)")
	}
}

func solutionGrid() [][]int {
	return [][]int{
		{5, 3, 4, 6, 7, 8, 9, 1, 2},
		{6, 7, 2, 1, 9, 5, 3, 4, 8},
		{1, 9, 8, 3, 4, 2, 5, 6, 7},
		{8, 5, 9, 7, 6, 1, 4, 2, 3},
		{4, 2, 6, 8, 5, 3, 7, 9, 1},
		{7, 1, 3, 9, 2, 4, 8, 5, 6},
		{9, 6, 1, 5, 3, 7, 2, 8, 4},
		{2, 8, 7, 4, 1, 9, 6, 3, 5},
		{3, 4, 5, 2, 8, 6, 1, 7, 9},
	}
}

func puzzleGrid() [][]int {
	return [][]int{
		{5, 3, 0, 0, 7, 0, 0, 0, 0},
		{6, 0, 0, 1, 9, 5, 0, 0, 0},
		{0, 9, 8, 0, 0, 0, 0, 6, 0},
		{8, 0, 0, 0, 6, 0, 0, 0, 3},
		{4, 0, 0, 8, 0, 3, 0, 0, 1},
		{7, 0, 0, 0, 2, 0, 0, 0, 6},
		{0, 6, 0, 0, 0, 0, 2, 8, 0},
		{0, 0, 0, 4, 1, 9, 0, 0, 5},
		{0, 0, 0, 0, 8, 0, 0, 7, 9},
	}
}

func copyGrid(b [][]int) [][]int {
	out := make([][]int, len(b))
	for i := range b {
		out[i] = append([]int(nil), b[i]...)
	}
	return out
}

func sameGrid(a, b [][]int) bool {
	if len(a) != len(b) {
		return false
	}
	for i := range a {
		if len(a[i]) != len(b[i]) {
			return false
		}
		for j := range a[i] {
			if a[i][j] != b[i][j] {
				return false
			}
		}
	}
	return true
}

func isCompleteValidGrid(b [][]int) bool {
	for i := 0; i < 9; i++ {
		rowMask, colMask, boxMask := 0, 0, 0
		for j := 0; j < 9; j++ {
			rowMask |= 1 << b[i][j]
			colMask |= 1 << b[j][i]
			boxMask |= 1 << b[3*(i/3)+j/3][3*(i%3)+j%3]
		}
		if rowMask != 0x3FE || colMask != 0x3FE || boxMask != 0x3FE {
			return false
		}
	}
	return true
}

func zeroGrid(rows, cols int) [][]int {
	g := make([][]int, rows)
	for i := range g {
		g[i] = make([]int, cols)
	}
	return g
}

func TestSolutionIsExactAndKeepsGivens(t *testing.T) {
	board := puzzleGrid()
	if !solveSudoku(board) || !sameGrid(board, solutionGrid()) || !isCompleteValidGrid(board) {
		t.Errorf("expected the known unique solution")
	}
}

func TestRejectsDuplicateInRow(t *testing.T) {
	board := solutionGrid()
	board[0][0] = board[0][1]
	before := copyGrid(board)
	if solveSudoku(board) {
		t.Errorf("a board with a duplicate in a row must be rejected")
	}
	if !sameGrid(board, before) {
		t.Errorf("rejected board must stay unchanged")
	}
}

func TestRejectsConflictingGivensWithBlanks(t *testing.T) {
	for _, c := range [][4]int{{0, 0, 0, 5}, {0, 0, 5, 0}, {0, 0, 2, 2}} {
		board := zeroGrid(9, 9)
		board[c[0]][c[1]] = 7
		board[c[2]][c[3]] = 7
		before := copyGrid(board)
		if solveSudoku(board) || !sameGrid(board, before) {
			t.Errorf("conflicting givens %v must be rejected without changes", c)
		}
	}
}

func TestRejectsOutOfRangeAndBadShape(t *testing.T) {
	board := puzzleGrid()
	board[4][4] = 10
	if isValidPuzzle(board) {
		t.Errorf("10 is out of range")
	}
	board[4][4] = -1
	if solveSudoku(board) || solveSudoku(zeroGrid(8, 9)) || solveSudoku(zeroGrid(9, 8)) {
		t.Errorf("bad boards must be rejected")
	}
}

func TestUnsolvablePuzzleRestoresBoard(t *testing.T) {
	board := zeroGrid(9, 9)
	for j := 0; j < 8; j++ {
		board[0][j] = j + 1
	}
	board[1][8] = 9 // cell (0, 8) needs a 9, but column 8 already has one
	before := copyGrid(board)
	if !isValidPuzzle(board) {
		t.Fatalf("givens do not conflict")
	}
	if solveSudoku(board) || !sameGrid(board, before) {
		t.Errorf("unsolvable puzzle: expected false and an unchanged board")
	}
}

func TestSolvedAndEmptyBoards(t *testing.T) {
	board := solutionGrid()
	if !solveSudoku(board) || !sameGrid(board, solutionGrid()) {
		t.Errorf("a solved board stays solved")
	}
	empty := zeroGrid(9, 9)
	if !solveSudoku(empty) || !isCompleteValidGrid(empty) {
		t.Errorf("an empty board has a solution")
	}
}
