package main

import (
	"container/list"
	"fmt"
)

type Graph struct {
	directed      bool
	adjacencyList map[int][]int
	vertices      map[int]bool
}

func NewGraph(directed bool) *Graph {
	return &Graph{
		directed:      directed,
		adjacencyList: make(map[int][]int),
		vertices:      make(map[int]bool),
	}
}

func (g *Graph) AddVertex(vertex int) {
	if !g.vertices[vertex] {
		g.vertices[vertex] = true
		g.adjacencyList[vertex] = []int{}
	}
}

func (g *Graph) AddEdge(fromVertex, toVertex int) {
	g.AddVertex(fromVertex)
	g.AddVertex(toVertex)

	// Check if edge already exists
	neighbors := g.adjacencyList[fromVertex]
	exists := false
	for _, v := range neighbors {
		if v == toVertex {
			exists = true
			break
		}
	}

	if !exists {
		g.adjacencyList[fromVertex] = append(g.adjacencyList[fromVertex], toVertex)
	}

	// For undirected graph, add reverse edge
	if !g.directed {
		reverseNeighbors := g.adjacencyList[toVertex]
		exists = false
		for _, v := range reverseNeighbors {
			if v == fromVertex {
				exists = true
				break
			}
		}
		if !exists {
			g.adjacencyList[toVertex] = append(g.adjacencyList[toVertex], fromVertex)
		}
	}
}

func (g *Graph) RemoveEdge(fromVertex, toVertex int) {
	g.removeOneWay(fromVertex, toVertex)

	// For undirected graph, remove reverse edge
	if !g.directed {
		g.removeOneWay(toVertex, fromVertex)
	}
}

// removeOneWay ignores unknown vertices so it never creates empty map entries.
func (g *Graph) removeOneWay(fromVertex, toVertex int) {
	neighbors, ok := g.adjacencyList[fromVertex]
	if !ok {
		return
	}
	kept := []int{}
	for _, v := range neighbors {
		if v != toVertex {
			kept = append(kept, v)
		}
	}
	g.adjacencyList[fromVertex] = kept
}

func (g *Graph) HasEdge(fromVertex, toVertex int) bool {
	neighbors, exists := g.adjacencyList[fromVertex]
	if !exists {
		return false
	}
	for _, v := range neighbors {
		if v == toVertex {
			return true
		}
	}
	return false
}

func (g *Graph) GetNeighbors(vertex int) []int {
	neighbors, exists := g.adjacencyList[vertex]
	if !exists {
		return []int{}
	}
	return append([]int{}, neighbors...)
}

func (g *Graph) GetVertices() []int {
	vertices := []int{}
	for v := range g.vertices {
		vertices = append(vertices, v)
	}
	return vertices
}

func (g *Graph) GetEdges() [][]int {
	edges := [][]int{}
	visitedEdges := make(map[string]bool)

	for fromVertex, neighbors := range g.adjacencyList {
		for _, toVertex := range neighbors {
			if !g.directed {
				// For undirected, avoid duplicate edges
				key1 := fmt.Sprintf("%d-%d", fromVertex, toVertex)
				key2 := fmt.Sprintf("%d-%d", toVertex, fromVertex)
				if !visitedEdges[key1] && !visitedEdges[key2] {
					edges = append(edges, []int{fromVertex, toVertex})
					visitedEdges[key1] = true
					visitedEdges[key2] = true
				}
			} else {
				edges = append(edges, []int{fromVertex, toVertex})
			}
		}
	}

	return edges
}

func (g *Graph) BFS(startVertex int) []int {
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

			for _, neighbor := range g.adjacencyList[vertex] {
				if !visited[neighbor] {
					queue.PushBack(neighbor)
				}
			}
		}
	}

	return result
}

func (g *Graph) DFS(startVertex int) []int {
	if !g.vertices[startVertex] {
		return []int{}
	}

	visited := make(map[int]bool)
	stack := list.New()
	result := []int{}

	stack.PushBack(startVertex)

	for stack.Len() > 0 {
		back := stack.Back()
		vertex := back.Value.(int)
		stack.Remove(back)

		if !visited[vertex] {
			visited[vertex] = true
			result = append(result, vertex)

			neighbors := g.adjacencyList[vertex]
			// Add neighbors in reverse order
			for i := len(neighbors) - 1; i >= 0; i-- {
				neighbor := neighbors[i]
				if !visited[neighbor] {
					stack.PushBack(neighbor)
				}
			}
		}
	}

	return result
}

func (g *Graph) DFSRecursive(startVertex int) []int {
	if !g.vertices[startVertex] {
		return []int{}
	}

	visited := make(map[int]bool)
	result := []int{}

	var dfs func(int)
	dfs = func(vertex int) {
		visited[vertex] = true
		result = append(result, vertex)

		for _, neighbor := range g.adjacencyList[vertex] {
			if !visited[neighbor] {
				dfs(neighbor)
			}
		}
	}

	dfs(startVertex)
	return result
}

func (g *Graph) IsConnected() bool {
	if g.directed {
		panic("IsConnected() is only for undirected graphs")
	}

	if len(g.vertices) == 0 {
		return true
	}

	// Get first vertex
	var start int
	for v := range g.vertices {
		start = v
		break
	}

	visited := g.BFS(start)
	return len(visited) == len(g.vertices)
}

func (g *Graph) GetDegree(vertex int) int {
	neighbors, exists := g.adjacencyList[vertex]
	if !exists {
		return 0
	}

	degree := len(neighbors)

	if g.directed {
		// Count in-degree
		inDegree := 0
		for _, neighbors := range g.adjacencyList {
			for _, v := range neighbors {
				if v == vertex {
					inDegree++
				}
			}
		}
		return degree + inDegree
	}

	return degree
}

func main() {
	// Example usage
	undirectedGraph := NewGraph(false)
	undirectedGraph.AddEdge(1, 2)
	undirectedGraph.AddEdge(2, 3)
	undirectedGraph.AddEdge(1, 4)

	fmt.Println("Undirected Graph BFS from 1:", undirectedGraph.BFS(1))
	fmt.Println("Undirected Graph DFS from 1:", undirectedGraph.DFS(1))
	fmt.Println("Is connected:", undirectedGraph.IsConnected())

	directedGraph := NewGraph(true)
	directedGraph.AddEdge(1, 2)
	directedGraph.AddEdge(2, 3)

	fmt.Println("\nDirected Graph BFS from 1:", directedGraph.BFS(1))
}
