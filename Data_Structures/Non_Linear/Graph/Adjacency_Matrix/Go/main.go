package main

import (
	"container/list"
	"fmt"
	"math"
)

type AdjacencyMatrix struct {
	numVertices int
	directed    bool
	weighted    bool
	matrix      [][]float64
	// present records which edges exist, so weight 0 (or +Inf) is still a valid weight.
	present [][]bool
}

func NewAdjacencyMatrix(numVertices int, directed, weighted bool) *AdjacencyMatrix {
	matrix := make([][]float64, numVertices)
	present := make([][]bool, numVertices)
	for i := range matrix {
		matrix[i] = make([]float64, numVertices)
		present[i] = make([]bool, numVertices)
		if weighted {
			for j := range matrix[i] {
				if i == j {
					matrix[i][j] = 0
				} else {
					matrix[i][j] = math.Inf(1)
				}
			}
		}
	}

	return &AdjacencyMatrix{
		numVertices: numVertices,
		directed:    directed,
		weighted:    weighted,
		matrix:      matrix,
		present:     present,
	}
}

func (am *AdjacencyMatrix) AddEdge(fromVertex, toVertex int, weight float64) {
	if fromVertex < 0 || fromVertex >= am.numVertices ||
		toVertex < 0 || toVertex >= am.numVertices {
		return
	}

	am.setCell(fromVertex, toVertex, weight)
	if !am.directed {
		am.setCell(toVertex, fromVertex, weight)
	}
}

func (am *AdjacencyMatrix) setCell(u, v int, weight float64) {
	am.present[u][v] = true
	if am.weighted {
		am.matrix[u][v] = weight
	} else {
		am.matrix[u][v] = 1
	}
}

func (am *AdjacencyMatrix) HasEdge(fromVertex, toVertex int) bool {
	if fromVertex < 0 || fromVertex >= am.numVertices ||
		toVertex < 0 || toVertex >= am.numVertices {
		return false
	}

	return am.present[fromVertex][toVertex]
}

func (am *AdjacencyMatrix) GetNeighbors(vertex int) []int {
	if vertex < 0 || vertex >= am.numVertices {
		return []int{}
	}

	neighbors := []int{}
	for i := 0; i < am.numVertices; i++ {
		if am.HasEdge(vertex, i) {
			neighbors = append(neighbors, i)
		}
	}
	return neighbors
}

func (am *AdjacencyMatrix) BFS(startVertex int) []int {
	if startVertex < 0 || startVertex >= am.numVertices {
		return []int{}
	}

	visited := make(map[int]bool)
	queue := list.New()
	result := []int{}

	visited[startVertex] = true
	queue.PushBack(startVertex)

	for queue.Len() > 0 {
		front := queue.Front()
		vertex := front.Value.(int)
		queue.Remove(front)

		result = append(result, vertex)

		neighbors := am.GetNeighbors(vertex)
		for _, neighbor := range neighbors {
			if !visited[neighbor] {
				visited[neighbor] = true
				queue.PushBack(neighbor)
			}
		}
	}

	return result
}

func main() {
	graph := NewAdjacencyMatrix(5, false, false)
	graph.AddEdge(0, 1, 1.0)
	graph.AddEdge(1, 2, 1.0)

	fmt.Println("Has edge 0->1:", graph.HasEdge(0, 1))
	fmt.Println("Neighbors of 1:", graph.GetNeighbors(1))
}
