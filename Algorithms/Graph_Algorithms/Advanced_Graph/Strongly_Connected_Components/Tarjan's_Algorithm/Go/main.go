package main

import "fmt"

// TarjanSCC finds all strongly connected components using Tarjan's algorithm
func TarjanSCC(graph map[int][]int) [][]int {
	if len(graph) == 0 {
		return [][]int{}
	}

	indices := make(map[int]int)
	lowLink := make(map[int]int)
	onStack := make(map[int]bool)
	var stack []int
	var sccs [][]int
	index := 0

	var strongConnect func(int)
	strongConnect = func(vertex int) {
		indices[vertex] = index
		lowLink[vertex] = index
		index++
		stack = append(stack, vertex)
		onStack[vertex] = true

		for _, neighbor := range graph[vertex] {
			if _, visited := indices[neighbor]; !visited {
				strongConnect(neighbor)
				if lowLink[neighbor] < lowLink[vertex] {
					lowLink[vertex] = lowLink[neighbor]
				}
			} else if onStack[neighbor] {
				if indices[neighbor] < lowLink[vertex] {
					lowLink[vertex] = indices[neighbor]
				}
			}
		}

		if lowLink[vertex] == indices[vertex] {
			var component []int
			for {
				w := stack[len(stack)-1]
				stack = stack[:len(stack)-1]
				onStack[w] = false
				component = append(component, w)
				if w == vertex {
					break
				}
			}
			sccs = append(sccs, component)
		}
	}

	for vertex := range graph {
		if _, visited := indices[vertex]; !visited {
			strongConnect(vertex)
		}
	}

	return sccs
}

// TarjanSCCCount counts number of strongly connected components
func TarjanSCCCount(graph map[int][]int) int {
	return len(TarjanSCC(graph))
}

// IsStronglyConnected checks if graph is strongly connected
func IsStronglyConnected(graph map[int][]int) bool {
	return TarjanSCCCount(graph) == 1
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

	fmt.Println("Tarjan's Algorithm Example:")
	fmt.Printf("Graph: %v\n", graph)

	sccs := TarjanSCC(graph)
	fmt.Printf("Strongly Connected Components: %v\n", sccs)
	fmt.Printf("Number of SCCs: %d\n", TarjanSCCCount(graph))
	fmt.Printf("Is strongly connected: %v\n", IsStronglyConnected(graph))
}

