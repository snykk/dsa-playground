package main

import "fmt"

func fordFulkerson(graph map[int]map[int]int, source, sink int) int {
	if source == sink {
		return 0
	}

	// Create residual graph
	residual := make(map[int]map[int]int)
	for u, neighbors := range graph {
		residual[u] = make(map[int]int)
		for v, cap := range neighbors {
			residual[u][v] = cap
			if residual[v] == nil {
				residual[v] = make(map[int]int)
			}
			if residual[v][u] == 0 {
				residual[v][u] = 0
			}
		}
	}

	maxFlow := 0

	for {
		visited := make(map[int]bool)
		path := dfsFindPath(residual, source, sink, visited, []int{source})
		if len(path) == 0 {
			break
		}

		minCapacity := int(^uint(0) >> 1)
		for i := 0; i < len(path)-1; i++ {
			u, v := path[i], path[i+1]
			if residual[u][v] < minCapacity {
				minCapacity = residual[u][v]
			}
		}

		for i := 0; i < len(path)-1; i++ {
			u, v := path[i], path[i+1]
			residual[u][v] -= minCapacity
			residual[v][u] += minCapacity
		}

		maxFlow += minCapacity
	}

	return maxFlow
}

func dfsFindPath(residual map[int]map[int]int, u, sink int, visited map[int]bool, path []int) []int {
	if u == sink {
		return path
	}

	visited[u] = true
	for v, capacity := range residual[u] {
		if !visited[v] && capacity > 0 {
			newPath := dfsFindPath(residual, v, sink, visited, append(path, v))
			if len(newPath) > 0 {
				return newPath
			}
		}
	}
	return []int{}
}

func main() {
	// Example usage
	graph := map[int]map[int]int{
		0: {1: 16, 2: 13},
		1: {2: 10, 3: 12},
		2: {1: 4, 4: 14},
		3: {2: 9, 5: 20},
		4: {3: 7, 5: 4},
	}

	fmt.Println("Ford-Fulkerson Algorithm Example:")
	maxFlow := fordFulkerson(graph, 0, 5)
	fmt.Printf("Maximum flow: %d\n", maxFlow) // 23
}

