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
