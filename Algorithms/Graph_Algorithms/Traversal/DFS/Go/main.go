package main

// DFSAdjacencyList performs DFS traversal using adjacency list (iterative)
// Returns vertices in DFS order
// Time Complexity: O(V + E), Space Complexity: O(V)
func DFSAdjacencyList(graph map[int][]int, start int) []int {
	if _, exists := graph[start]; !exists {
		return []int{}
	}

	result := []int{}
	stack := []int{start}
	visited := make(map[int]bool)

	for len(stack) > 0 {
		vertex := stack[len(stack)-1]
		stack = stack[:len(stack)-1]

		if !visited[vertex] {
			visited[vertex] = true
			result = append(result, vertex)

			// Add neighbors in reverse order to maintain left-to-right traversal
			neighbors := graph[vertex]
			for i := len(neighbors) - 1; i >= 0; i-- {
				neighbor := neighbors[i]
				if !visited[neighbor] {
					stack = append(stack, neighbor)
				}
			}
		}
	}

	return result
}

// DFSRecursive performs DFS traversal using recursion
// Returns vertices in DFS order
// Time Complexity: O(V + E), Space Complexity: O(V)
func DFSRecursive(graph map[int][]int, start int) []int {
	if _, exists := graph[start]; !exists {
		return []int{}
	}

	visited := make(map[int]bool)
	result := []int{}

	var dfs func(int)
	dfs = func(vertex int) {
		visited[vertex] = true
		result = append(result, vertex)

		for _, neighbor := range graph[vertex] {
			if !visited[neighbor] {
				dfs(neighbor)
			}
		}
	}

	dfs(start)
	return result
}

// DFSWithPath finds path from start to target using DFS
// Returns path as slice of vertices
// Time Complexity: O(V + E), Space Complexity: O(V)
func DFSWithPath(graph map[int][]int, start, target int) []int {
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

	stack := []pathNode{{vertex: start, path: []int{start}}}
	visited := make(map[int]bool)

	for len(stack) > 0 {
		current := stack[len(stack)-1]
		stack = stack[:len(stack)-1]

		if current.vertex == target {
			return current.path
		}

		if !visited[current.vertex] {
			visited[current.vertex] = true

			neighbors := graph[current.vertex]
			for i := len(neighbors) - 1; i >= 0; i-- {
				neighbor := neighbors[i]
				if !visited[neighbor] {
					newPath := make([]int, len(current.path))
					copy(newPath, current.path)
					newPath = append(newPath, neighbor)
					stack = append(stack, pathNode{vertex: neighbor, path: newPath})
				}
			}
		}
	}

	return []int{} // No path found
}

// DFSDetectCycle detects cycle in graph using DFS
// Returns true if cycle exists
// Time Complexity: O(V + E), Space Complexity: O(V)
func DFSDetectCycle(graph map[int][]int, directed bool) bool {
	visited := make(map[int]bool)
	recStack := make(map[int]bool)

	var hasCycle func(int, int) bool
	hasCycle = func(vertex, parent int) bool {
		visited[vertex] = true
		if directed {
			recStack[vertex] = true
		}

		for _, neighbor := range graph[vertex] {
			if !visited[neighbor] {
				parentVal := parent
				if !directed {
					parentVal = vertex
				}
				if hasCycle(neighbor, parentVal) {
					return true
				}
			} else if directed {
				if recStack[neighbor] {
					return true
				}
			} else if neighbor != parent {
				return true
			}
		}

		if directed {
			delete(recStack, vertex)
		}
		return false
	}

	for vertex := range graph {
		if !visited[vertex] {
			if hasCycle(vertex, -1) {
				return true
			}
		}
	}

	return false
}

