package main

import (
	"container/list"
	"fmt"
)

// TopologicalSortKahn performs topological sort using Kahn's algorithm
func TopologicalSortKahn(graph map[int][]int) []int {
	if len(graph) == 0 {
		return []int{}
	}

	// Calculate in-degrees
	inDegree := make(map[int]int)
	for v := range graph {
		inDegree[v] = 0
	}

	for _, neighbors := range graph {
		for _, neighbor := range neighbors {
			inDegree[neighbor]++
		}
	}

	// Find vertices with in-degree 0
	queue := list.New()
	for v, degree := range inDegree {
		if degree == 0 {
			queue.PushBack(v)
		}
	}

	var result []int

	for queue.Len() > 0 {
		front := queue.Front()
		vertex := front.Value.(int)
		queue.Remove(front)
		result = append(result, vertex)

		// Reduce in-degree of neighbors
		for _, neighbor := range graph[vertex] {
			inDegree[neighbor]--
			if inDegree[neighbor] == 0 {
				queue.PushBack(neighbor)
			}
		}
	}

	// Check for cycle
	if len(result) != len(inDegree) {
		return []int{} // Cycle detected
	}

	return result
}

// IsDAG checks if graph is a Directed Acyclic Graph.
// The empty graph is a DAG. Otherwise TopologicalSortKahn returns every vertex
// (including vertices that only appear as neighbors, which are not map keys)
// for a DAG and an empty slice for a cyclic graph.
func IsDAG(graph map[int][]int) bool {
	if len(graph) == 0 {
		return true
	}
	return len(TopologicalSortKahn(graph)) > 0
}

func main() {
	// Example usage
	graph := map[int][]int{
		1: {2, 4},
		2: {3},
		3: {},
		4: {},
	}

	fmt.Println("Topological Sort Example:")
	fmt.Printf("Graph: %v\n", graph)

	order := TopologicalSortKahn(graph)
	fmt.Printf("Topological order: %v\n", order)
	fmt.Printf("Is DAG: %v\n", IsDAG(graph))

	// Graph with cycle
	graphCycle := map[int][]int{
		1: {2},
		2: {3},
		3: {1}, // Cycle
	}
	fmt.Printf("\nGraph with cycle: %v\n", graphCycle)
	orderCycle := TopologicalSortKahn(graphCycle)
	fmt.Printf("Topological order: %v (empty if cycle detected)\n", orderCycle)
	fmt.Printf("Is DAG: %v\n", IsDAG(graphCycle))
}
