package main

import "math"

// FloydWarshall finds shortest distances between all pairs of vertices
// Returns nil if a negative cycle exists
// Time Complexity: O(V^3), Space Complexity: O(V^2)
func FloydWarshall(graph map[int][]struct {
	Neighbor int
	Weight   int
}, numVertices int) [][]int {
	dist := make([][]int, numVertices)
	for i := range dist {
		dist[i] = make([]int, numVertices)
		for j := range dist[i] {
			if i == j {
				dist[i][j] = 0
			} else {
				dist[i][j] = math.MaxInt
			}
		}
	}
	
	// Initialize with direct edges; keep the cheapest of parallel edges, and a
	// positive self-loop never raises dist[u][u] above 0
	for u := 0; u < numVertices; u++ {
		for _, edge := range graph[u] {
			if edge.Weight < dist[u][edge.Neighbor] {
				dist[u][edge.Neighbor] = edge.Weight
			}
		}
	}
	
	// Floyd-Warshall algorithm
	for k := 0; k < numVertices; k++ {
		for i := 0; i < numVertices; i++ {
			for j := 0; j < numVertices; j++ {
				if dist[i][k] != math.MaxInt && dist[k][j] != math.MaxInt {
					if dist[i][j] > dist[i][k]+dist[k][j] {
						dist[i][j] = dist[i][k] + dist[k][j]
					}
				}
			}
		}
		// Check for negative cycles after every round, before values can run away
		for i := 0; i < numVertices; i++ {
			if dist[i][i] < 0 {
				return nil // Negative cycle detected
			}
		}
	}
	
	return dist
}


