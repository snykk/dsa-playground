package main

import (
	"fmt"
)

func isValid(board [][]int, row, col, num int) bool {
	// Check row
	for j := 0; j < 9; j++ {
		if board[row][j] == num {
			return false
		}
	}

	// Check column
	for i := 0; i < 9; i++ {
		if board[i][col] == num {
			return false
		}
	}

	// Check 3x3 box
	boxRow := (row / 3) * 3
	boxCol := (col / 3) * 3
	for i := boxRow; i < boxRow+3; i++ {
		for j := boxCol; j < boxCol+3; j++ {
			if board[i][j] == num {
				return false
			}
		}
	}

	return true
}

func findEmpty(board [][]int) (int, int, bool) {
	for i := 0; i < 9; i++ {
		for j := 0; j < 9; j++ {
			if board[i][j] == 0 {
				return i, j, true
			}
		}
	}
	return 0, 0, false
}

func solveSudoku(board [][]int) bool {
	row, col, found := findEmpty(board)
	if !found {
		return true // Puzzle solved
	}

	for num := 1; num <= 9; num++ {
		if isValid(board, row, col, num) {
			board[row][col] = num

			if solveSudoku(board) {
				return true
			}

			// Backtrack
			board[row][col] = 0
		}
	}

	return false
}

func printBoard(board [][]int) {
	for i := 0; i < 9; i++ {
		if i%3 == 0 && i != 0 {
			fmt.Println("- - - - - - - - - - -")
		}
		for j := 0; j < 9; j++ {
			if j%3 == 0 && j != 0 {
				fmt.Print("| ")
			}
			if board[i][j] == 0 {
				fmt.Print(". ")
			} else {
				fmt.Printf("%d ", board[i][j])
			}
		}
		fmt.Println()
	}
}

func main() {
	fmt.Println("Sudoku Solver Examples:")
	fmt.Println()

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

	fmt.Println("Original puzzle:")
	printBoard(board)
	fmt.Println()

	if solveSudoku(board) {
		fmt.Println("Solution:")
		printBoard(board)
	} else {
		fmt.Println("No solution exists")
	}
}
