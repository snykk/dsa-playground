package main

import (
	"testing"
)

func TestGraphColoringValid(t *testing.T) {
	graph := [][]int{
		{0, 1, 1, 1},
		{1, 0, 1, 0},
		{1, 1, 0, 1},
		{1, 0, 1, 0},
	}
	color := graphColoring(graph, 3)
	if color == nil {
		t.Errorf("Should find a valid coloring")
	}
	if len(color) != 4 {
		t.Errorf("Color array should have 4 elements")
	}
}

func TestGraphColoringInsufficientColors(t *testing.T) {
	graph := [][]int{
		{0, 1, 1},
		{1, 0, 1},
		{1, 1, 0},
	}
	color := graphColoring(graph, 2)
	if color != nil {
		t.Errorf("Triangle should need 3 colors")
	}
}

func TestChromaticNumber(t *testing.T) {
	graph := [][]int{
		{0, 1, 1, 1},
		{1, 0, 1, 0},
		{1, 1, 0, 1},
		{1, 0, 1, 0},
	}
	if chromaticNumber(graph) != 3 {
		t.Errorf("Chromatic number should be 3")
	}
}

func TestIsSafe(t *testing.T) {
	graph := [][]int{
		{0, 1, 1},
		{1, 0, 1},
		{1, 1, 0},
	}
	color := []int{1, 0, 0}
	if !isSafe(graph, 1, color, 2) {
		t.Errorf("Should be safe")
	}
	if isSafe(graph, 1, color, 1) {
		t.Errorf("Should not be safe (adjacent vertex has color 1)")
	}
}

func isValidColoring(g [][]int, c []int, m int) bool {
	n := len(g)
	if len(c) != n {
		return false
	}
	for i := 0; i < n; i++ {
		if c[i] < 1 || c[i] > m {
			return false
		}
		for j := 0; j < n; j++ {
			if g[i][j] == 1 && c[i] == c[j] {
				return false
			}
		}
	}
	return true
}

func cycleGraph(n int) [][]int {
	g := make([][]int, n)
	for i := range g {
		g[i] = make([]int, n)
	}
	for i := 0; i < n; i++ {
		g[i][(i+1)%n] = 1
		g[(i+1)%n][i] = 1
	}
	return g
}

func TestColoringIsValid(t *testing.T) {
	graph := [][]int{
		{0, 1, 1, 1},
		{1, 0, 1, 0},
		{1, 1, 0, 1},
		{1, 0, 1, 0},
	}
	if !isValidColoring(graph, graphColoring(graph, 3), 3) {
		t.Errorf("returned coloring is not valid")
	}
}

func TestEmptyGraph(t *testing.T) {
	color := graphColoring([][]int{}, 1)
	if color == nil || len(color) != 0 {
		t.Errorf("empty graph should give an empty, non-nil coloring")
	}
	if chromaticNumber([][]int{}) != 0 {
		t.Errorf("empty graph needs 0 colors")
	}
}

func TestNoEdges(t *testing.T) {
	g := make([][]int, 4)
	for i := range g {
		g[i] = make([]int, 4)
	}
	if chromaticNumber(g) != 1 {
		t.Errorf("edgeless graph needs 1 color")
	}
}

func TestCycles(t *testing.T) {
	even := cycleGraph(6)
	if chromaticNumber(even) != 2 || !isValidColoring(even, graphColoring(even, 2), 2) {
		t.Errorf("even cycle should be 2-colorable")
	}
	odd := cycleGraph(5)
	if graphColoring(odd, 2) != nil || chromaticNumber(odd) != 3 {
		t.Errorf("odd cycle needs exactly 3 colors")
	}
	if !isValidColoring(odd, graphColoring(odd, 3), 3) {
		t.Errorf("odd cycle coloring invalid")
	}
}

func TestCompleteGraph(t *testing.T) {
	g := make([][]int, 5)
	for i := range g {
		g[i] = make([]int, 5)
		for j := range g[i] {
			if i != j {
				g[i][j] = 1
			}
		}
	}
	if chromaticNumber(g) != 5 || graphColoring(g, 4) != nil {
		t.Errorf("K5 needs exactly 5 colors")
	}
}
