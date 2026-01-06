// Constructive Algorithm Techniques for Competitive Programming (Go)

package main

import (
	"container/heap"
	"fmt"
)

// ConstructPermutation builds permutation with k distinct differences
func ConstructPermutation(n, k int) []int {
	if k >= n {
		return nil
	}

	perm := make([]int, n)
	for i := 0; i < n; i++ {
		perm[i] = i + 1
	}

	// Reverse suffix
	for i, j := n-k-1, n-1; i < j; i, j = i+1, j-1 {
		perm[i], perm[j] = perm[j], perm[i]
	}

	return perm
}

// ConstructArrayWithSum builds array with given sum and constraints
func ConstructArrayWithSum(n, total, minVal, maxVal int) []int {
	if total < n*minVal || total > n*maxVal {
		return nil
	}

	arr := make([]int, n)
	for i := range arr {
		arr[i] = minVal
	}

	remaining := total - n*minVal
	for i := 0; i < n && remaining > 0; i++ {
		add := remaining
		if add > maxVal-minVal {
			add = maxVal - minVal
		}
		arr[i] += add
		remaining -= add
	}

	return arr
}

// Edge represents a graph edge
type Edge struct {
	U, V int
}

// ConstructGraph builds graph with given degree sequence
func ConstructGraph(degrees []int) []Edge {
	var edges []Edge

	// Priority queue: (-degree, node)
	type Node struct {
		deg  int
		node int
	}
	pq := make(PriorityQueue, 0)
	heap.Init(&pq)

	for i, d := range degrees {
		if d > 0 {
			heap.Push(&pq, &Node{deg: -d, node: i})
		}
	}

	for pq.Len() > 0 {
		item := heap.Pop(&pq).(*Node)
		deg := -item.deg
		u := item.node

		if deg == 0 {
			continue
		}

		var neighbors []*Node
		for i := 0; i < deg && pq.Len() > 0; i++ {
			neighbors = append(neighbors, heap.Pop(&pq).(*Node))
		}

		if len(neighbors) < deg {
			return nil
		}

		for _, neighbor := range neighbors {
			edges = append(edges, Edge{U: u, V: neighbor.node})
			if neighbor.deg < -1 {
				neighbor.deg++
				heap.Push(&pq, neighbor)
			}
		}
	}

	return edges
}

// PriorityQueue implementation
type PriorityQueue []*Node

type Node struct {
	deg  int
	node int
}

func (pq PriorityQueue) Len() int { return len(pq) }

func (pq PriorityQueue) Less(i, j int) bool {
	return pq[i].deg < pq[j].deg
}

func (pq PriorityQueue) Swap(i, j int) {
	pq[i], pq[j] = pq[j], pq[i]
}

func (pq *PriorityQueue) Push(x interface{}) {
	*pq = append(*pq, x.(*Node))
}

func (pq *PriorityQueue) Pop() interface{} {
	old := *pq
	n := len(old)
	item := old[n-1]
	*pq = old[0 : n-1]
	return item
}

func main() {
	perm := ConstructPermutation(5, 2)
	fmt.Printf("Permutation: %v\n", perm)

	arr := ConstructArrayWithSum(5, 20, 1, 5)
	fmt.Printf("Array: %v\n", arr)
}
