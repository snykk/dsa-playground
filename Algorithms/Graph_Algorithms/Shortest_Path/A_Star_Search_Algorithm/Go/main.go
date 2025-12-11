package main

import (
	"container/heap"
)

// Node represents a node in A* search
type Node struct {
	vertex int
	gScore int
	fScore int
	path   []int
	index  int
}

// PriorityQueue implements heap.Interface
type PriorityQueue []*Node

func (pq PriorityQueue) Len() int { return len(pq) }

func (pq PriorityQueue) Less(i, j int) bool {
	return pq[i].fScore < pq[j].fScore
}

func (pq PriorityQueue) Swap(i, j int) {
	pq[i], pq[j] = pq[j], pq[i]
	pq[i].index = i
	pq[j].index = j
}

func (pq *PriorityQueue) Push(x interface{}) {
	n := len(*pq)
	item := x.(*Node)
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

// AStar finds shortest path from start to goal using A* search
// heuristic: function that estimates distance from node to goal
// Returns (distance, path) or (-1, nil) if no path exists
// Time Complexity: O(b^d), Space Complexity: O(b^d)
func AStar(graph map[int][]struct {
	Neighbor int
	Weight   int
}, start, goal int, heuristic func(int) int) (int, []int) {
	pq := make(PriorityQueue, 0)
	visited := make(map[int]bool)
	gScores := make(map[int]int)

	startNode := &Node{
		vertex: start,
		gScore: 0,
		fScore: heuristic(start),
		path:   []int{start},
	}

	heap.Push(&pq, startNode)
	gScores[start] = 0

	for pq.Len() > 0 {
		current := heap.Pop(&pq).(*Node)

		if current.vertex == goal {
			return current.gScore, current.path
		}

		if visited[current.vertex] {
			continue
		}

		visited[current.vertex] = true

		for _, edge := range graph[current.vertex] {
			neighbor := edge.Neighbor
			weight := edge.Weight

			if visited[neighbor] {
				continue
			}

			tentativeG := current.gScore + weight

			if gScore, exists := gScores[neighbor]; !exists || tentativeG < gScore {
				gScores[neighbor] = tentativeG

				neighborNode := &Node{
					vertex: neighbor,
					gScore: tentativeG,
					fScore: tentativeG + heuristic(neighbor),
					path:   append([]int{}, current.path...),
				}
				neighborNode.path = append(neighborNode.path, neighbor)

				heap.Push(&pq, neighborNode)
			}
		}
	}

	return -1, nil // No path found
}
