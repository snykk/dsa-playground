package main

import (
	"fmt"
	"math"
)

// Edge represents a weighted edge in the graph
type Edge struct {
	U, V, Weight int
}

// BellmanFord finds shortest distances from start to all vertices
// Returns nil if negative cycle exists
// Panics if an edge endpoint is outside 0..numVertices-1
// Time Complexity: O(V * E), Space Complexity: O(V)
func BellmanFord(edges []Edge, numVertices, start int) map[int]int {
	for _, edge := range edges {
		if edge.U < 0 || edge.U >= numVertices || edge.V < 0 || edge.V >= numVertices {
			panic(fmt.Sprintf("BellmanFord: edge (%d, %d) has an endpoint outside 0..%d", edge.U, edge.V, numVertices-1))
		}
	}

	distances := make(map[int]int)

	if numVertices == 0 {
		return distances
	}

	// Initialize distances
	for i := 0; i < numVertices; i++ {
		distances[i] = math.MaxInt
	}
	distances[start] = 0
	
	// Relax edges V-1 times
	for i := 0; i < numVertices-1; i++ {
		for _, edge := range edges {
			if distances[edge.U] != math.MaxInt &&
				distances[edge.U]+edge.Weight < distances[edge.V] {
				distances[edge.V] = distances[edge.U] + edge.Weight
			}
		}
	}
	
	// Check for negative cycles
	for _, edge := range edges {
		if distances[edge.U] != math.MaxInt &&
			distances[edge.U]+edge.Weight < distances[edge.V] {
			return nil // Negative cycle detected
		}
	}
	
	return distances
}


