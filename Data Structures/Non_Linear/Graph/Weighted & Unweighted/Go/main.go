package main

import (
	"container/list"
	"fmt"
)

type WeightedGraph struct {
	directed      bool
	adjacencyList map[int][]Edge
	vertices      map[int]bool
}

type Edge struct {
	To     int
	Weight float64
}

func NewWeightedGraph(directed bool) *WeightedGraph {
	return &WeightedGraph{
		directed:      directed,
		adjacencyList: make(map[int][]Edge),
		vertices:      make(map[int]bool),
	}
}

func (g *WeightedGraph) AddVertex(vertex int) {
	if !g.vertices[vertex] {
		g.vertices[vertex] = true
		g.adjacencyList[vertex] = []Edge{}
	}
}

func (g *WeightedGraph) AddEdge(fromVertex, toVertex int, weight float64) {
	g.AddVertex(fromVertex)
	g.AddVertex(toVertex)

	g.RemoveEdge(fromVertex, toVertex)

	g.adjacencyList[fromVertex] = append(g.adjacencyList[fromVertex], Edge{To: toVertex, Weight: weight})

	if !g.directed {
		g.RemoveEdge(toVertex, fromVertex)
		g.adjacencyList[toVertex] = append(g.adjacencyList[toVertex], Edge{To: fromVertex, Weight: weight})
	}
}

func (g *WeightedGraph) RemoveEdge(fromVertex, toVertex int) {
	neighbors := g.adjacencyList[fromVertex]
	newNeighbors := []Edge{}
	for _, edge := range neighbors {
		if edge.To != toVertex {
			newNeighbors = append(newNeighbors, edge)
		}
	}
	g.adjacencyList[fromVertex] = newNeighbors

	if !g.directed {
		reverseNeighbors := g.adjacencyList[toVertex]
		newReverseNeighbors := []Edge{}
		for _, edge := range reverseNeighbors {
			if edge.To != fromVertex {
				newReverseNeighbors = append(newReverseNeighbors, edge)
			}
		}
		g.adjacencyList[toVertex] = newReverseNeighbors
	}
}

func (g *WeightedGraph) HasEdge(fromVertex, toVertex int) bool {
	neighbors, exists := g.adjacencyList[fromVertex]
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

func (g *WeightedGraph) GetWeight(fromVertex, toVertex int) float64 {
	neighbors, exists := g.adjacencyList[fromVertex]
	if !exists {
		return -1.0
	}
	for _, edge := range neighbors {
		if edge.To == toVertex {
			return edge.Weight
		}
	}
	return -1.0
}

func (g *WeightedGraph) GetNeighbors(vertex int) []int {
	neighbors := []int{}
	edges, exists := g.adjacencyList[vertex]
	if !exists {
		return neighbors
	}
	for _, edge := range edges {
		neighbors = append(neighbors, edge.To)
	}
	return neighbors
}

func (g *WeightedGraph) BFS(startVertex int) []int {
	if !g.vertices[startVertex] {
		return []int{}
	}

	visited := make(map[int]bool)
	queue := list.New()
	result := []int{}

	queue.PushBack(startVertex)

	for queue.Len() > 0 {
		front := queue.Front()
		vertex := front.Value.(int)
		queue.Remove(front)

		if !visited[vertex] {
			visited[vertex] = true
			result = append(result, vertex)

			for _, neighbor := range g.GetNeighbors(vertex) {
				if !visited[neighbor] {
					queue.PushBack(neighbor)
				}
			}
		}
	}

	return result
}

func (g *WeightedGraph) GetTotalWeight() float64 {
	total := 0.0
	visitedEdges := make(map[string]bool)

	for fromVertex, edges := range g.adjacencyList {
		for _, edge := range edges {
			toVertex := edge.To
			weight := edge.Weight

			if !g.directed {
				key1 := fmt.Sprintf("%d-%d", fromVertex, toVertex)
				key2 := fmt.Sprintf("%d-%d", toVertex, fromVertex)
				if !visitedEdges[key1] && !visitedEdges[key2] {
					total += weight
					visitedEdges[key1] = true
					visitedEdges[key2] = true
				}
			} else {
				total += weight
			}
		}
	}

	return total
}

func main() {
	graph := NewWeightedGraph(false)
	graph.AddEdge(1, 2, 5.0)
	graph.AddEdge(2, 3, 3.0)

	fmt.Println("Weight:", graph.GetWeight(1, 2))
	fmt.Println("Total Weight:", graph.GetTotalWeight())
}

