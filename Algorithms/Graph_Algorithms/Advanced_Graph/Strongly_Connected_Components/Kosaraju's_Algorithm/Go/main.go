package main

// KosarajuSCC finds all strongly connected components using Kosaraju's algorithm
func KosarajuSCC(graph map[int][]int) [][]int {
	if len(graph) == 0 {
		return [][]int{}
	}

	visited := make(map[int]bool)
	var finishOrder []int

	// First DFS: get finish order
	var dfs1 func(int)
	dfs1 = func(vertex int) {
		visited[vertex] = true
		for _, neighbor := range graph[vertex] {
			if !visited[neighbor] {
				dfs1(neighbor)
			}
		}
		finishOrder = append(finishOrder, vertex)
	}

	for vertex := range graph {
		if !visited[vertex] {
			dfs1(vertex)
		}
	}

	// Reverse graph
	reversedGraph := make(map[int][]int)
	for vertex := range graph {
		reversedGraph[vertex] = []int{}
	}
	for vertex, neighbors := range graph {
		for _, neighbor := range neighbors {
			reversedGraph[neighbor] = append(reversedGraph[neighbor], vertex)
		}
	}

	// Second DFS on reversed graph
	visited = make(map[int]bool)
	var sccs [][]int

	var dfs2 func(int, []int) []int
	dfs2 = func(vertex int, component []int) []int {
		visited[vertex] = true
		component = append(component, vertex)
		for _, neighbor := range reversedGraph[vertex] {
			if !visited[neighbor] {
				component = dfs2(neighbor, component)
			}
		}
		return component
	}

	// Process in reverse finish order
	for i := len(finishOrder) - 1; i >= 0; i-- {
		vertex := finishOrder[i]
		if !visited[vertex] {
			component := dfs2(vertex, []int{})
			sccs = append(sccs, component)
		}
	}

	return sccs
}

// KosarajuSCCCount counts number of strongly connected components
func KosarajuSCCCount(graph map[int][]int) int {
	return len(KosarajuSCC(graph))
}

// IsStronglyConnected checks if graph is strongly connected
func IsStronglyConnected(graph map[int][]int) bool {
	return KosarajuSCCCount(graph) == 1
}

func main() {
	// Example usage
	graph := map[int][]int{
		1: {2},
		2: {3},
		3: {1}, // Cycle: 1 -> 2 -> 3 -> 1
		4: {5},
		5: {6},
		6: {4}, // Cycle: 4 -> 5 -> 6 -> 4
	}

	fmt.Println("Kosaraju's Algorithm Example:")
	fmt.Printf("Graph: %v\n", graph)

	sccs := KosarajuSCC(graph)
	fmt.Printf("Strongly Connected Components: %v\n", sccs)
	fmt.Printf("Number of SCCs: %d\n", KosarajuSCCCount(graph))
	fmt.Printf("Is strongly connected: %v\n", IsStronglyConnected(graph))

	// Strongly connected graph
	graphSC := map[int][]int{
		1: {2},
		2: {3},
		3: {1},
	}
	fmt.Printf("\nStrongly connected graph: %v\n", graphSC)
	fmt.Printf("Is strongly connected: %v\n", IsStronglyConnected(graphSC))
}

