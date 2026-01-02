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
