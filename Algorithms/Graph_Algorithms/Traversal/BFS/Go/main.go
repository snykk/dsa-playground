package main

// BFSAdjacencyList performs BFS traversal using adjacency list
// Returns vertices in BFS order
// Time Complexity: O(V + E), Space Complexity: O(V)
func BFSAdjacencyList(graph map[int][]int, start int) []int {
	if _, exists := graph[start]; !exists {
		return []int{}
	}

	result := []int{}
	queue := []int{start}
	visited := make(map[int]bool)
	visited[start] = true

	for len(queue) > 0 {
		vertex := queue[0]
		queue = queue[1:]
		result = append(result, vertex)

		// Visit all neighbors
		for _, neighbor := range graph[vertex] {
			if !visited[neighbor] {
				visited[neighbor] = true
				queue = append(queue, neighbor)
			}
		}
	}

	return result
}

// BFSWithPath finds shortest path from start to target (unweighted graph)
// Returns shortest path as slice of vertices
// Time Complexity: O(V + E), Space Complexity: O(V)
func BFSWithPath(graph map[int][]int, start, target int) []int {
	if start == target {
		return []int{start}
	}

	if _, exists := graph[start]; !exists {
		return []int{}
	}
	if _, exists := graph[target]; !exists {
		return []int{}
	}

	type pathNode struct {
		vertex int
		path   []int
	}

	queue := []pathNode{{vertex: start, path: []int{start}}}
	visited := make(map[int]bool)
	visited[start] = true

	for len(queue) > 0 {
		current := queue[0]
		queue = queue[1:]

		for _, neighbor := range graph[current.vertex] {
			if neighbor == target {
				return append(current.path, neighbor)
			}

			if !visited[neighbor] {
				visited[neighbor] = true
				newPath := make([]int, len(current.path))
				copy(newPath, current.path)
				newPath = append(newPath, neighbor)
				queue = append(queue, pathNode{vertex: neighbor, path: newPath})
			}
		}
	}

	return []int{} // No path found
}

// BFSLevelOrder returns vertices grouped by level
// Returns slice of slices, where each inner slice contains vertices at that level
// Time Complexity: O(V + E), Space Complexity: O(V)
func BFSLevelOrder(graph map[int][]int, start int) [][]int {
	if _, exists := graph[start]; !exists {
		return [][]int{}
	}

	result := [][]int{}
	queue := []int{start}
	visited := make(map[int]bool)
	visited[start] = true

	for len(queue) > 0 {
		levelSize := len(queue)
		level := []int{}

		for i := 0; i < levelSize; i++ {
			vertex := queue[0]
			queue = queue[1:]
			level = append(level, vertex)

			for _, neighbor := range graph[vertex] {
				if !visited[neighbor] {
					visited[neighbor] = true
					queue = append(queue, neighbor)
				}
			}
		}

		result = append(result, level)
	}

	return result
}

// BFSShortestDistance finds shortest distance from start to all reachable vertices
// Returns map of vertex to distance
// Time Complexity: O(V + E), Space Complexity: O(V)
func BFSShortestDistance(graph map[int][]int, start int) map[int]int {
	distances := make(map[int]int)

	if _, exists := graph[start]; !exists {
		return distances
	}

	queue := []int{start}
	distances[start] = 0

	for len(queue) > 0 {
		vertex := queue[0]
		queue = queue[1:]
		currentDistance := distances[vertex]

		for _, neighbor := range graph[vertex] {
			if _, exists := distances[neighbor]; !exists {
				distances[neighbor] = currentDistance + 1
				queue = append(queue, neighbor)
			}
		}
	}

	return distances
}

