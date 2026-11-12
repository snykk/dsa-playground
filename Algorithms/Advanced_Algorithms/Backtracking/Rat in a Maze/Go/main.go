package main

import (
	"fmt"
)

func isSafe(maze [][]int, x, y, n int) bool {
	return x >= 0 && x < n && y >= 0 && y < n && maze[x][y] == 1
}

// Moves in order: right, down, left, up.
var dx = [4]int{0, 1, 0, -1}
var dy = [4]int{1, 0, -1, 0}

// solveMazeUtil searches in four directions and enters every cell at most once, so it is
// O(n^2). A cell that failed once fails again, so it stays in visited after backtracking.
func solveMazeUtil(maze [][]int, x, y, n int, solution [][]int, visited [][]bool) bool {
	if !isSafe(maze, x, y, n) || visited[x][y] {
		return false
	}

	visited[x][y] = true
	solution[x][y] = 1

	// Base case: reached destination
	if x == n-1 && y == n-1 {
		return true
	}

	for d := 0; d < 4; d++ {
		if solveMazeUtil(maze, x+dx[d], y+dy[d], n, solution, visited) {
			return true
		}
	}

	// No direction works: this cell is not on the path
	solution[x][y] = 0
	return false
}

func solveMaze(maze [][]int) [][]int {
	n := len(maze)
	if n == 0 {
		return nil
	}
	for _, row := range maze {
		if len(row) != n {
			return nil // only square mazes are supported
		}
	}
	if maze[0][0] == 0 || maze[n-1][n-1] == 0 {
		return nil
	}

	solution := make([][]int, n)
	visited := make([][]bool, n)
	for i := range solution {
		solution[i] = make([]int, n)
		visited[i] = make([]bool, n)
	}

	if solveMazeUtil(maze, 0, 0, n, solution, visited) {
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
