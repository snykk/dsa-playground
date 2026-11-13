package main

import (
	"container/list"
	"fmt"
)

func edmondsKarp(graph map[int]map[int]int, source, sink int) int {
	if source == sink {
		return 0
	}

	// Residual graph: forward capacities plus a 0-capacity reverse entry per edge.
	residual := make(map[int]map[int]int)
	ensure := func(u int) {
		if residual[u] == nil {
			residual[u] = make(map[int]int)
		}
	}
	for u, neighbors := range graph {
		ensure(u)
		for v, cap := range neighbors {
			ensure(v)
			residual[u][v] += cap
			residual[v][u] += 0
		}
	}

	maxFlow := 0

	for {
		parent := make(map[int]int)
		queue := list.New()
		queue.PushBack(source)
		parent[source] = -1

		found := false
		for queue.Len() > 0 {
			front := queue.Front()
			u := front.Value.(int)
			queue.Remove(front)

			if u == sink {
				pathFlow := int(^uint(0) >> 1)
				for v := sink; v != source; v = parent[v] {
					u := parent[v]
					if residual[u][v] < pathFlow {
						pathFlow = residual[u][v]
					}
				}
				for v := sink; v != source; v = parent[v] {
					u := parent[v]
					residual[u][v] -= pathFlow
					residual[v][u] += pathFlow
				}
				maxFlow += pathFlow
				found = true
				break
			}

			for v, cap := range residual[u] {
				if _, visited := parent[v]; !visited && cap > 0 {
					parent[v] = u
					queue.PushBack(v)
				}
			}
		}

		if !found {
			break
		}
	}

	return maxFlow
}

func main() {
	// Example usage
	graph := map[int]map[int]int{
		0: {1: 16, 2: 13},
		1: {2: 10, 3: 12},
		2: {1: 4, 4: 14},
		3: {2: 9, 5: 20},
		4: {3: 7, 5: 4},
	}

	fmt.Println("Edmonds-Karp Algorithm Example:")
	maxFlow := edmondsKarp(graph, 0, 5)
	fmt.Printf("Maximum flow: %d\n", maxFlow) // 23
}
