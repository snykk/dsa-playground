package main

import "slices"

// DFSAdjacencyList performs DFS traversal using adjacency list (iterative)
// Returns vertices in DFS order
// Time Complexity: O(V + E), Space Complexity: O(V + E) (a vertex is marked
// when popped, so the stack can hold one entry per edge)
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
// Time Complexity: O(V + E), Space Complexity: O(V + E) (the stack can hold
// one entry per edge)
func DFSWithPath(graph map[int][]int, start, target int) []int {
	if start == target {
		return []int{start}
	}

	// The target does not have to be a key: a vertex without outgoing edges
	// may appear only in neighbor lists.
	if _, exists := graph[start]; !exists {
		return []int{}
	}

	// Stack entries are (vertex, vertex that pushed it). parent[v] is recorded
	// when v is popped and visited (the map doubles as the visited set), so
	// the path is rebuilt once from the target instead of being copied into
	// every stack entry.
	type stackEntry struct {
		vertex int
		via    int
	}

	stack := []stackEntry{{vertex: start, via: start}}
	parent := make(map[int]int)

	for len(stack) > 0 {
		current := stack[len(stack)-1]
		stack = stack[:len(stack)-1]

		if current.vertex == target {
			path := []int{target}
			for node := current.via; node != start; node = parent[node] {
				path = append(path, node)
			}
			path = append(path, start)
			slices.Reverse(path)
			return path
		}

		if _, seen := parent[current.vertex]; !seen {
			parent[current.vertex] = current.via

			neighbors := graph[current.vertex]
			for i := len(neighbors) - 1; i >= 0; i-- {
				neighbor := neighbors[i]
				if _, seen := parent[neighbor]; !seen {
					stack = append(stack, stackEntry{vertex: neighbor, via: current.vertex})
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

	// hasParent says whether parent is meaningful (false for a DFS root), so no
	// vertex value has to serve as a "no parent" sentinel: every int, including
	// -1, is a valid vertex. parent is only used for undirected graphs.
	var hasCycle func(vertex, parent int, hasParent bool) bool
	hasCycle = func(vertex, parent int, hasParent bool) bool {
		visited[vertex] = true
		if directed {
			recStack[vertex] = true
		}

		for _, neighbor := range graph[vertex] {
			if !visited[neighbor] {
				if hasCycle(neighbor, vertex, true) {
					return true
				}
			} else if directed {
				if recStack[neighbor] {
					return true
				}
			} else if !hasParent || neighbor != parent {
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
			if hasCycle(vertex, 0, false) {
				return true
			}
		}
	}

	return false
}

