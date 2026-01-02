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
