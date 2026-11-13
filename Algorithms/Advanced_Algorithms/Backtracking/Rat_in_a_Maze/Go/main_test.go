package main

import (
	"testing"
)

func TestSolveMazeValid(t *testing.T) {
	maze := [][]int{
		{1, 0, 0, 0},
		{1, 1, 0, 1},
		{0, 1, 0, 0},
		{1, 1, 1, 1},
	}
	solution := solveMaze(maze)
	if solution == nil {
		t.Errorf("Should find a solution")
	}
	if solution[0][0] != 1 || solution[3][3] != 1 {
		t.Errorf("Solution should start and end at corners")
	}
}

func TestSolveMazeNoSolution(t *testing.T) {
	maze := [][]int{
		{1, 0, 0, 0},
		{0, 0, 0, 0},
		{0, 0, 0, 0},
		{0, 0, 0, 1},
	}
	solution := solveMaze(maze)
	if solution != nil {
		t.Errorf("Should not find a solution")
	}
}

func TestIsSafe(t *testing.T) {
	maze := [][]int{
		{1, 0, 0},
		{1, 1, 0},
		{0, 1, 1},
	}
	if !isSafe(maze, 0, 0, 3) {
		t.Errorf("Should be safe")
	}
	if isSafe(maze, 0, 1, 3) {
		t.Errorf("Should not be safe (wall)")
	}
	if isSafe(maze, -1, 0, 3) {
		t.Errorf("Should not be safe (out of bounds)")
	}
}

// pathIsValid: marked cells are open, include both corners and connect them through marked cells.
func pathIsValid(maze, sol [][]int) bool {
	n := len(maze)
	if sol[0][0] != 1 || sol[n-1][n-1] != 1 {
		return false
	}
	for i := 0; i < n; i++ {
		for j := 0; j < n; j++ {
			if sol[i][j] == 1 && maze[i][j] != 1 {
				return false
			}
		}
	}
	seen := make([][]bool, n)
	for i := range seen {
		seen[i] = make([]bool, n)
	}
	seen[0][0] = true
	stack := [][2]int{{0, 0}}
	for len(stack) > 0 {
		c := stack[len(stack)-1]
		stack = stack[:len(stack)-1]
		for _, d := range [][2]int{{1, 0}, {-1, 0}, {0, 1}, {0, -1}} {
			x, y := c[0]+d[0], c[1]+d[1]
			if x >= 0 && x < n && y >= 0 && y < n && sol[x][y] == 1 && !seen[x][y] {
				seen[x][y] = true
				stack = append(stack, [2]int{x, y})
			}
		}
	}
	return seen[n-1][n-1]
}

func TestPathNeedingUpAndLeftMoves(t *testing.T) {
	maze := [][]int{
		{1, 0, 1, 1, 1},
		{1, 0, 1, 0, 1},
		{1, 0, 1, 0, 1},
		{1, 1, 1, 0, 1},
		{0, 0, 0, 0, 1},
	}
	solution := solveMaze(maze)
	if solution == nil {
		t.Fatalf("a path exists but none was found")
	}
	if !pathIsValid(maze, solution) {
		t.Errorf("returned path is not valid")
	}
}

func TestReturnedPathIsValid(t *testing.T) {
	maze := [][]int{
		{1, 0, 0, 0},
		{1, 1, 0, 1},
		{0, 1, 0, 0},
		{1, 1, 1, 1},
	}
	solution := solveMaze(maze)
	if solution == nil || !pathIsValid(maze, solution) {
		t.Errorf("expected a valid path")
	}
}

func TestUnreachableDestinationIsFast(t *testing.T) {
	n := 30
	maze := make([][]int, n)
	for i := range maze {
		maze[i] = make([]int, n)
		for j := range maze[i] {
			maze[i][j] = 1
		}
	}
	maze[n-2][n-1] = 0
	maze[n-1][n-2] = 0
	if solveMaze(maze) != nil {
		t.Errorf("destination is walled off")
	}
}

func TestEdgeCases(t *testing.T) {
	if s := solveMaze([][]int{{1}}); s == nil || s[0][0] != 1 {
		t.Errorf("1x1 open maze is solved by its single cell")
	}
	if solveMaze([][]int{{0}}) != nil || solveMaze([][]int{}) != nil {
		t.Errorf("blocked or empty maze has no path")
	}
	if solveMaze([][]int{{1, 1, 1}, {1, 1, 1}}) != nil {
		t.Errorf("non-square maze is rejected")
	}
}
