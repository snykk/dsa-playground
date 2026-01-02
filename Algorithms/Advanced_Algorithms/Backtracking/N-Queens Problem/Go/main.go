package main

import (
	"fmt"
)

func isSafe(board [][]int, row, col, n int) bool {
	// Check column
	for i := 0; i < row; i++ {
		if board[i][col] == 1 {
			return false
		}
	}

	// Check upper-left diagonal
	for i, j := row-1, col-1; i >= 0 && j >= 0; i, j = i-1, j-1 {
		if board[i][j] == 1 {
			return false
		}
	}

	// Check upper-right diagonal
	for i, j := row-1, col+1; i >= 0 && j < n; i, j = i-1, j+1 {
		if board[i][j] == 1 {
			return false
		}
	}

	return true
}

func solveNQueensUtil(board [][]int, row, n int, solutions *[][][]int, findAll bool) bool {
	if row == n {
		// Found a solution, save it
		solution := make([][]int, n)
		for i := range board {
			solution[i] = make([]int, n)
			copy(solution[i], board[i])
		}
		*solutions = append(*solutions, solution)
		return !findAll // Return true to stop if finding first solution only
	}

	for col := 0; col < n; col++ {
		if isSafe(board, row, col, n) {
			board[row][col] = 1

			if solveNQueensUtil(board, row+1, n, solutions, findAll) {
				return true
			}

			// Backtrack
			board[row][col] = 0
		}
	}

	return false
}

func solveNQueens(n int, findAll bool) [][]int {
	board := make([][]int, n)
	for i := range board {
		board[i] = make([]int, n)
	}

	var allSolutions [][][]int

	if findAll {
		solveNQueensUtil(board, 0, n, &allSolutions, findAll)
		if len(allSolutions) > 0 {
			return allSolutions[0] // Return first solution for simplicity
		}
	} else {
		// Find first solution only
		var solution [][]int
		var solveFirst func([][]int, int) bool
		solveFirst = func(board [][]int, row int) bool {
			if row == n {
				solution = make([][]int, n)
				for i := range board {
					solution[i] = make([]int, n)
					copy(solution[i], board[i])
				}
				return true
			}

			for col := 0; col < n; col++ {
				if isSafe(board, row, col, n) {
					board[row][col] = 1
					if solveFirst(board, row+1) {
						return true
					}
					board[row][col] = 0
				}
			}
			return false
		}
		if solveFirst(board, 0) {
			return solution
		}
	}

	return nil
}

func solveNQueensAll(n int) [][][]int {
	board := make([][]int, n)
	for i := range board {
		board[i] = make([]int, n)
	}

	var allSolutions [][][]int
	solveNQueensUtil(board, 0, n, &allSolutions, true)
	return allSolutions
}

func printSolution(board [][]int) {
	n := len(board)
	for i := 0; i < n; i++ {
		for j := 0; j < n; j++ {
			if board[i][j] == 1 {
				fmt.Print("Q ")
			} else {
				fmt.Print(". ")
			}
		}
		fmt.Println()
	}
}

func main() {
	fmt.Println("N-Queens Problem Examples:")
	fmt.Println()

	n := 4
	fmt.Printf("Solving %d-Queens problem:\n", n)
	allSolutions := solveNQueensAll(n)
	fmt.Printf("Found %d solution(s)\n", len(allSolutions))

	if len(allSolutions) > 0 {
		fmt.Println("\nFirst solution:")
		printSolution(allSolutions[0])
	}
}
