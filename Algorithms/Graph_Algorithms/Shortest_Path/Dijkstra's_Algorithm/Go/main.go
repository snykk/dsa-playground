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

// Dijkstra finds shortest distances from start to all vertices
// Time Complexity: O((V + E) log V), Space Complexity: O(V)
func Dijkstra(graph map[int][]struct {
	Neighbor int
	Weight   int
}, start int) map[int]int {
	distances := make(map[int]int)

	if len(graph) == 0 {
		return distances
	}

	// Initialize distances
	for vertex := range graph {
		distances[vertex] = math.MaxInt
	}
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
// Time Complexity: O((V + E) log V), Space Complexity: O(V)
func DijkstraWithPath(graph map[int][]struct {
	Neighbor int
	Weight   int
}, start, target int) (int, []int) {
	distances := make(map[int]int)
	previous := make(map[int]int)
	
	for vertex := range graph {
		distances[vertex] = math.MaxInt
		previous[vertex] = -1
	}
	distances[start] = 0
	
	pq := make(PriorityQueue, 0)
	heap.Push(&pq, &Item{vertex: start, distance: 0})
	visited := make(map[int]bool)
	
	for pq.Len() > 0 {
		item := heap.Pop(&pq).(*Item)
		current := item.vertex
		currentDist := item.distance
		
		if current == target {
			// Reconstruct path
			path := []int{}
			node := target
			for node != -1 {
				path = append([]int{node}, path...)
				node = previous[node]
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


