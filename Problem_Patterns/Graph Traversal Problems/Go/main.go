package main

import (
	"fmt"
)

// BFSShortestPath finds the shortest path distance from start to target.
// Returns -1 if not reachable.
func BFSShortestPath(graph map[int][]int, start, target int) int {
	if _, exists := graph[start]; !exists {
		return -1
	}
	if start == target {
		return 0
	}

	queue := [][]int{{start, 0}}
	visited := make(map[int]bool)
	visited[start] = true

	for len(queue) > 0 {
		curr := queue[0]
		queue = queue[1:]
		node, dist := curr[0], curr[1]

		if node == target {
			return dist
		}

		for _, neighbor := range graph[node] {
			if !visited[neighbor] {
				visited[neighbor] = true
				queue = append(queue, []int{neighbor, dist + 1})
			}
		}
	}

	return -1
}

// NumIslands counts connected '1's in a grid.
func NumIslands(grid [][]byte) int {
	if len(grid) == 0 || len(grid[0]) == 0 {
		return 0
	}

	rows, cols := len(grid), len(grid[0])
	count := 0

	var dfs func(r, c int)
	dfs = func(r, c int) {
		if r < 0 || c < 0 || r >= rows || c >= cols || grid[r][c] != '1' {
			return
		}
		grid[r][c] = '0' // Sink island

		dfs(r+1, c)
		dfs(r-1, c)
		dfs(r, c+1)
		dfs(r, c-1)
	}

	for r := 0; r < rows; r++ {
		for c := 0; c < cols; c++ {
			if grid[r][c] == '1' {
				count++
				dfs(r, c)
			}
		}
	}

	return count
}

// TopologicalSort performs Kahn's Algorithm.
func TopologicalSort(n int, edges [][]int) []int {
	adj := make(map[int][]int)
	inDegree := make(map[int]int)

	for i := 0; i < n; i++ {
		adj[i] = []int{}
		inDegree[i] = 0
	}

	for _, edge := range edges {
		u, v := edge[0], edge[1]
		adj[u] = append(adj[u], v)
		inDegree[v]++
	}

	queue := []int{}
	for i := 0; i < n; i++ {
		if inDegree[i] == 0 {
			queue = append(queue, i)
		}
	}

	result := []int{}
	for len(queue) > 0 {
		u := queue[0]
		queue = queue[1:]
		result = append(result, u)

		for _, v := range adj[u] {
			inDegree[v]--
			if inDegree[v] == 0 {
				queue = append(queue, v)
			}
		}
	}

	if len(result) != n {
		return []int{} // Cycle detected
	}
	return result
}

func main() {
	// BFS
	graph := map[int][]int{
		0: {1, 2},
		1: {0, 3},
		2: {0, 3},
		3: {1, 2, 4},
		4: {3},
	}
	fmt.Printf("BFS Distance 0->4: %d\n", BFSShortestPath(graph, 0, 4)) // 3

	// Islands
	grid := [][]byte{
		{'1', '1', '0', '0', '0'},
		{'1', '1', '0', '0', '0'},
		{'0', '0', '1', '0', '0'},
		{'0', '0', '0', '1', '1'},
	}
	// Copy grid
	gridCopy := make([][]byte, len(grid))
	for i := range grid {
		gridCopy[i] = make([]byte, len(grid[i]))
		copy(gridCopy[i], grid[i])
	}
	fmt.Printf("Number of Islands: %d\n", NumIslands(gridCopy)) // 3

	// Topo Sort
	edges := [][]int{{1, 0}, {2, 0}, {3, 1}, {3, 2}}
	fmt.Printf("Topological Sort: %v\n", TopologicalSort(4, edges)) // [3 1 2 0]
}
