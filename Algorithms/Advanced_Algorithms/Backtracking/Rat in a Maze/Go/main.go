package main

import (
	"fmt"
)

func isSafe(maze [][]int, x, y, n int) bool {
	return x >= 0 && x < n && y >= 0 && y < n && maze[x][y] == 1
}

func solveMazeUtil(maze [][]int, x, y, n int, solution [][]int) bool {
	// Base case: reached destination
	if x == n-1 && y == n-1 {
		solution[x][y] = 1
		return true
	}

	if isSafe(maze, x, y, n) {
		// Mark current cell as part of solution
		solution[x][y] = 1

		// Move right
		if solveMazeUtil(maze, x, y+1, n, solution) {
			return true
		}

		// Move down
		if solveMazeUtil(maze, x+1, y, n, solution) {
			return true
		}

		// If none of the above work, backtrack
		solution[x][y] = 0
		return false
	}

	return false
}

func solveMaze(maze [][]int) [][]int {
	n := len(maze)
	if n == 0 || maze[0][0] == 0 || maze[n-1][n-1] == 0 {
		return nil
	}

	solution := make([][]int, n)
	for i := range solution {
		solution[i] = make([]int, n)
	}

	if solveMazeUtil(maze, 0, 0, n, solution) {
		return solution
	}

	return nil
}

func printSolution(solution [][]int) {
	n := len(solution)
	for i := 0; i < n; i++ {
		for j := 0; j < n; j++ {
			fmt.Printf("%d ", solution[i][j])
		}
		fmt.Println()
	}
}

func main() {
	fmt.Println("Rat in a Maze Examples:")
	fmt.Println()

	maze := [][]int{
		{1, 0, 0, 0},
		{1, 1, 0, 1},
		{0, 1, 0, 0},
		{1, 1, 1, 1},
	}

	fmt.Println("Maze:")
	for _, row := range maze {
		fmt.Println(row)
	}
	fmt.Println()

	solution := solveMaze(maze)
	if solution != nil {
		fmt.Println("Solution path:")
		printSolution(solution)
	} else {
		fmt.Println("No solution exists")
	}
}
