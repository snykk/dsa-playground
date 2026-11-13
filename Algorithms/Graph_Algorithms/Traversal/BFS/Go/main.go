package main

import "slices"

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

	// The target does not have to be a key: a vertex without outgoing edges
	// may appear only in neighbor lists.
	if _, exists := graph[start]; !exists {
		return []int{}
	}

	// parent[v] is the vertex that discovered v (the map doubles as the
	// visited set). One entry per vertex instead of a copy of the whole path
	// per queue entry keeps this O(V + E); the path is rebuilt once at the end.
	parent := map[int]int{start: start}
	queue := []int{start}

	for len(queue) > 0 {
		vertex := queue[0]
		queue = queue[1:]

		for _, neighbor := range graph[vertex] {
			if neighbor == target {
				path := []int{neighbor, vertex}
				for node := vertex; node != start; {
					node = parent[node]
					path = append(path, node)
				}
				slices.Reverse(path)
				return path
			}

			if _, seen := parent[neighbor]; !seen {
				parent[neighbor] = vertex
				queue = append(queue, neighbor)
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

