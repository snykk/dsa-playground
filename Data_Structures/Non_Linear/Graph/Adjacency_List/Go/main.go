package main

import (
	"container/list"
	"fmt"
)

type Edge struct {
	To     int
	Weight float64
}

type AdjacencyList struct {
	directed      bool
	weighted     bool
	adjacencyList map[int][]Edge
	vertices      map[int]bool
}

func NewAdjacencyList(directed, weighted bool) *AdjacencyList {
	return &AdjacencyList{
		directed:      directed,
		weighted:     weighted,
		adjacencyList: make(map[int][]Edge),
		vertices:      make(map[int]bool),
	}
}

func (al *AdjacencyList) AddVertex(vertex int) {
	if !al.vertices[vertex] {
		al.vertices[vertex] = true
		al.adjacencyList[vertex] = []Edge{}
	}
}

func (al *AdjacencyList) AddEdge(fromVertex, toVertex int, weight float64) {
	al.AddVertex(fromVertex)
	al.AddVertex(toVertex)

	al.removeOneWay(fromVertex, toVertex)

	al.adjacencyList[fromVertex] = append(al.adjacencyList[fromVertex], Edge{To: toVertex, Weight: weight})

	if !al.directed {
		al.removeOneWay(toVertex, fromVertex)
		al.adjacencyList[toVertex] = append(al.adjacencyList[toVertex], Edge{To: fromVertex, Weight: weight})
	}
}

// RemoveEdge removes fromVertex -> toVertex and, on an undirected graph,
// toVertex -> fromVertex as well.
func (al *AdjacencyList) RemoveEdge(fromVertex, toVertex int) {
	al.removeOneWay(fromVertex, toVertex)
	if !al.directed {
		al.removeOneWay(toVertex, fromVertex)
	}
}

func (al *AdjacencyList) removeOneWay(fromVertex, toVertex int) {
	neighbors, ok := al.adjacencyList[fromVertex]
	if !ok {
		return
	}
	newNeighbors := []Edge{}
	for _, edge := range neighbors {
		if edge.To != toVertex {
			newNeighbors = append(newNeighbors, edge)
		}
	}
	al.adjacencyList[fromVertex] = newNeighbors
}

func (al *AdjacencyList) HasEdge(fromVertex, toVertex int) bool {
	neighbors, exists := al.adjacencyList[fromVertex]
	if !exists {
		return false
	}
	for _, edge := range neighbors {
		if edge.To == toVertex {
			return true
		}
	}
	return false
}

func (al *AdjacencyList) GetNeighbors(vertex int) []int {
	neighbors := []int{}
	edges, exists := al.adjacencyList[vertex]
	if !exists {
		return neighbors
	}
	for _, edge := range edges {
		neighbors = append(neighbors, edge.To)
	}
	return neighbors
}

func (al *AdjacencyList) BFS(startVertex int) []int {
	if !al.vertices[startVertex] {
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

		neighbors := al.GetNeighbors(vertex)
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
	graph := NewAdjacencyList(false, true)
	graph.AddEdge(1, 2, 5.0)
	graph.AddEdge(2, 3, 3.0)

	fmt.Println("Has edge 1->2:", graph.HasEdge(1, 2))
	fmt.Println("Neighbors of 2:", graph.GetNeighbors(2))
}

