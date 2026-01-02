package main

import (
	"fmt"
)

func isSafe(graph [][]int, v int, color []int, c int) bool {
	for i := 0; i < len(graph); i++ {
		if graph[v][i] == 1 && color[i] == c {
			return false
		}
	}
	return true
}

func graphColoringUtil(graph [][]int, m int, color []int, v int) bool {
	n := len(graph)
	if v == n {
		return true
	}

	for c := 1; c <= m; c++ {
		if isSafe(graph, v, color, c) {
			color[v] = c

			if graphColoringUtil(graph, m, color, v+1) {
				return true
			}

			// Backtrack
			color[v] = 0
		}
	}

	return false
}

func graphColoring(graph [][]int, m int) []int {
	n := len(graph)
	color := make([]int, n)

	if graphColoringUtil(graph, m, color, 0) {
		return color
	}

	return nil
}

func chromaticNumber(graph [][]int) int {
	n := len(graph)
	for m := 1; m <= n; m++ {
		color := graphColoring(graph, m)
		if color != nil {
			return m
		}
	}
	return n
}

func main() {
	fmt.Println("Graph Coloring Examples:")
	fmt.Println()

	graph := [][]int{
		{0, 1, 1, 1},
		{1, 0, 1, 0},
		{1, 1, 0, 1},
		{1, 0, 1, 0},
	}

	fmt.Println("Graph adjacency matrix:")
	for _, row := range graph {
		fmt.Println(row)
	}
	fmt.Println()

	m := 3
	color := graphColoring(graph, m)
	if color != nil {
		fmt.Printf("Graph can be colored with %d colors:\n", m)
		fmt.Printf("Color assignment: %v\n", color)
	} else {
		fmt.Printf("Graph cannot be colored with %d colors\n", m)
	}

	fmt.Printf("\nChromatic number: %d\n", chromaticNumber(graph))
}
