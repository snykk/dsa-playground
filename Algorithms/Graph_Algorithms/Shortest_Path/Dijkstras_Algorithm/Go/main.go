package main

import (
	"container/heap"
	"math"
)

// Item represents an item in the priority queue
type Item struct {
	vertex   int
	distance int
	index    int
}

// PriorityQueue implements heap.Interface
type PriorityQueue []*Item

func (pq PriorityQueue) Len() int { return len(pq) }

func (pq PriorityQueue) Less(i, j int) bool {
	return pq[i].distance < pq[j].distance
}

func (pq PriorityQueue) Swap(i, j int) {
	pq[i], pq[j] = pq[j], pq[i]
	pq[i].index = i
	pq[j].index = j
}

func (pq *PriorityQueue) Push(x interface{}) {
	n := len(*pq)
	item := x.(*Item)
	item.index = n
	*pq = append(*pq, item)
}

func (pq *PriorityQueue) Pop() interface{} {
	old := *pq
	n := len(old)
	item := old[n-1]
	old[n-1] = nil
	item.index = -1
	*pq = old[0 : n-1]
	return item
}

// unreachedDistances maps every vertex to math.MaxInt: the map keys AND the
// vertices that only appear as neighbors.
func unreachedDistances(graph map[int][]struct {
	Neighbor int
	Weight   int
}) map[int]int {
	distances := make(map[int]int)
	for vertex, edges := range graph {
		distances[vertex] = math.MaxInt
		for _, edge := range edges {
			distances[edge.Neighbor] = math.MaxInt
		}
	}
	return distances
}

// Dijkstra finds shortest distances from start to all vertices
// Time Complexity: O((V + E) log V), Space Complexity: O(V + E) (the heap can hold one entry per edge)
func Dijkstra(graph map[int][]struct {
	Neighbor int
	Weight   int
}, start int) map[int]int {
	if len(graph) == 0 {
		return make(map[int]int)
	}

	// Initialize distances
	distances := unreachedDistances(graph)
	distances[start] = 0

	pq := make(PriorityQueue, 0)
	heap.Push(&pq, &Item{vertex: start, distance: 0})
	visited := make(map[int]bool)
	
	for pq.Len() > 0 {
		item := heap.Pop(&pq).(*Item)
		current := item.vertex
		currentDist := item.distance
		
		if visited[current] {
			continue
		}
		
		visited[current] = true
		
		for _, edge := range graph[current] {
			neighbor := edge.Neighbor
			weight := edge.Weight
			
			if visited[neighbor] {
				continue
			}
			
			newDist := currentDist + weight
			if newDist < distances[neighbor] {
				distances[neighbor] = newDist
				heap.Push(&pq, &Item{vertex: neighbor, distance: newDist})
			}
		}
	}
	
	return distances
}

// DijkstraWithPath finds shortest path from start to target
// Returns (distance, path) or (-1, nil) if no path exists
// Time Complexity: O((V + E) log V), Space Complexity: O(V + E)
func DijkstraWithPath(graph map[int][]struct {
	Neighbor int
	Weight   int
}, start, target int) (int, []int) {
	distances := unreachedDistances(graph)
	previous := make(map[int]int) // vertex -> predecessor on the best path so far
	distances[start] = 0
	
	pq := make(PriorityQueue, 0)
	heap.Push(&pq, &Item{vertex: start, distance: 0})
	visited := make(map[int]bool)
	
	for pq.Len() > 0 {
		item := heap.Pop(&pq).(*Item)
		current := item.vertex
		currentDist := item.distance
		
		if current == target {
			// Reconstruct path: follow predecessors back to the start vertex
			path := []int{target}
			for path[len(path)-1] != start {
				path = append(path, previous[path[len(path)-1]])
			}
			for i, j := 0, len(path)-1; i < j; i, j = i+1, j-1 {
				path[i], path[j] = path[j], path[i]
			}
			return currentDist, path
		}
		
		if visited[current] {
			continue
		}
		
		visited[current] = true
		
		for _, edge := range graph[current] {
			neighbor := edge.Neighbor
			weight := edge.Weight
			
			if visited[neighbor] {
				continue
			}
			
			newDist := currentDist + weight
			if newDist < distances[neighbor] {
				distances[neighbor] = newDist
				previous[neighbor] = current
				heap.Push(&pq, &Item{vertex: neighbor, distance: newDist})
			}
		}
	}
	
	return -1, nil // No path found
}


