package main

import (
	"container/list"
	"fmt"
)

type Edge struct {
	From   int
	To     int
	Weight float64
}

type EdgeList struct {
	directed bool
	weighted bool
	edges    []Edge
	vertices map[int]bool
}

func NewEdgeList(directed, weighted bool) *EdgeList {
	return &EdgeList{
		directed: directed,
		weighted: weighted,
		edges:    []Edge{},
		vertices: make(map[int]bool),
	}
}

func (el *EdgeList) AddEdge(fromVertex, toVertex int, weight float64) {
	el.vertices[fromVertex] = true
	el.vertices[toVertex] = true

	el.RemoveEdge(fromVertex, toVertex)

	if el.weighted {
		el.edges = append(el.edges, Edge{From: fromVertex, To: toVertex, Weight: weight})
	} else {
		el.edges = append(el.edges, Edge{From: fromVertex, To: toVertex, Weight: 1.0})
	}

	if !el.directed {
		el.RemoveEdge(toVertex, fromVertex)
		if el.weighted {
			el.edges = append(el.edges, Edge{From: toVertex, To: fromVertex, Weight: weight})
		} else {
			el.edges = append(el.edges, Edge{From: toVertex, To: fromVertex, Weight: 1.0})
		}
	}
}

func (el *EdgeList) RemoveEdge(fromVertex, toVertex int) {
	newEdges := []Edge{}
	for _, edge := range el.edges {
		if !(edge.From == fromVertex && edge.To == toVertex) {
			newEdges = append(newEdges, edge)
		}
	}
	el.edges = newEdges
}

func (el *EdgeList) HasEdge(fromVertex, toVertex int) bool {
	for _, edge := range el.edges {
		if edge.From == fromVertex && edge.To == toVertex {
			return true
		}
	}
	return false
}

func (el *EdgeList) GetWeight(fromVertex, toVertex int) float64 {
	if !el.weighted {
		return -1.0
	}
	for _, edge := range el.edges {
		if edge.From == fromVertex && edge.To == toVertex {
			return edge.Weight
		}
	}
	return -1.0
}

func (el *EdgeList) GetNeighbors(vertex int) []int {
	neighbors := []int{}
	seen := make(map[int]bool)

	for _, edge := range el.edges {
		if edge.From == vertex && !seen[edge.To] {
			neighbors = append(neighbors, edge.To)
			seen[edge.To] = true
		}
	}

	return neighbors
}

func (el *EdgeList) GetEdgeCount() int {
	if el.directed {
		return len(el.edges)
	}
	return len(el.edges) / 2
}

func (el *EdgeList) BFS(startVertex int) []int {
	if !el.vertices[startVertex] {
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

			neighbors := el.GetNeighbors(vertex)
			for _, neighbor := range neighbors {
				if !visited[neighbor] {
					queue.PushBack(neighbor)
				}
			}
		}
	}

	return result
}

func main() {
	graph := NewEdgeList(false, true)
	graph.AddEdge(1, 2, 5.0)
	graph.AddEdge(2, 3, 3.0)

	fmt.Println("Has edge 1->2:", graph.HasEdge(1, 2))
	fmt.Println("Weight 1->2:", graph.GetWeight(1, 2))
	fmt.Println("Edge count:", graph.GetEdgeCount())
}

