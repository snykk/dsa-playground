package main

import "container/heap"

// Edge represents an edge in the graph
type Edge struct {
	To     int
	Weight int
}

// PriorityQueue implements heap.Interface
type PriorityQueue []struct {
	Weight int
	From   int
	To     int
}

func (pq PriorityQueue) Len() int { return len(pq) }

func (pq PriorityQueue) Less(i, j int) bool {
	return pq[i].Weight < pq[j].Weight
}

func (pq PriorityQueue) Swap(i, j int) {
	pq[i], pq[j] = pq[j], pq[i]
}

func (pq *PriorityQueue) Push(x interface{}) {
	*pq = append(*pq, x.(struct {
		Weight int
		From   int
		To     int
	}))
}

func (pq *PriorityQueue) Pop() interface{} {
	old := *pq
	n := len(old)
	item := old[n-1]
	*pq = old[0 : n-1]
	return item
}

// PrimMST finds MST using Prim's algorithm
func PrimMST(graph map[int][]Edge, start int) ([][]int, int) {
	if len(graph) == 0 {
		return [][]int{}, 0
	}

	visited := make(map[int]bool)
	var mst [][]int
	totalWeight := 0

	pq := make(PriorityQueue, 0)
	heap.Init(&pq)
	heap.Push(&pq, struct {
		Weight int
		From   int
		To     int
	}{0, start, start})

	for pq.Len() > 0 && len(mst) < len(graph)-1 {
		item := heap.Pop(&pq).(struct {
			Weight int
			From   int
			To     int
		})

		weight, from, to := item.Weight, item.From, item.To

		if visited[to] {
			continue
		}

		visited[to] = true

		if from != to {
			mst = append(mst, []int{from, to, weight})
			totalWeight += weight
		}

		// Add neighbors to priority queue
		for _, edge := range graph[to] {
			if !visited[edge.To] {
				heap.Push(&pq, struct {
					Weight int
					From   int
					To     int
				}{edge.Weight, to, edge.To})
			}
		}
	}

	return mst, totalWeight
}

// PrimMSTAdjacencyList is a simpler interface
func PrimMSTAdjacencyList(graph map[int][]Edge, start int) ([][]int, int) {
	return PrimMST(graph, start)
}
