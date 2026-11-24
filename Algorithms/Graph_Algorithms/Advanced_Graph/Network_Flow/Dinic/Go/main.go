package main

import (
	"fmt"
	"sort"
)

// Maximum flow with Dinic's algorithm: level graphs and blocking flows.
//
// Each phase runs one BFS from the source over the residual graph and gives every vertex it
// reaches a level, its distance in residual edges. Then depth-first searches push a blocking
// flow through the level graph, stepping only from level d to level d + 1, until no such path
// reaches the sink. A current-arc pointer per vertex remembers which residual entry to try
// next, so within one phase each entry is passed over at most once. The run stops when the BFS
// no longer reaches the sink; the vertices it did reach are the source side of a minimum cut.
//
// The input is the one edmondsKarp takes, graph[u][v] = capacity, and the residual graph is a
// map of maps as well. Go iterates maps in random order, so every search tries the residual
// entries of a vertex from a sorted slice, in increasing order of the neighbour: the result is
// the one the Python and C++ versions return.

// DinicResult is what dinicFlow returns.
type DinicResult struct {
	MaxFlow int
	// Flows[u][v]: the flow on the edge u -> v, for every edge of the input graph.
	Flows map[int]map[int]int
	// The vertices the last BFS reached, in increasing order: the source side of a minimum cut.
	SourceSide []int
	// BFS runs, the last one (which no longer reaches the sink) included.
	Phases int
	// Residual entries the depth-first searches looked at, over all phases.
	EdgeVisits int
}

// buildResidual copies the capacities and adds a 0-capacity reverse entry for every edge
// without one.
func buildResidual(graph map[int]map[int]int) map[int]map[int]int {
	residual := make(map[int]map[int]int)
	ensure := func(u int) {
		if residual[u] == nil {
			residual[u] = make(map[int]int)
		}
	}
	for u, neighbors := range graph {
		ensure(u)
		for v, capacity := range neighbors {
			ensure(v)
			residual[u][v] += capacity
			residual[v][u] += 0
		}
	}
	return residual
}

// neighbours returns adj[u]: the residual entries of u in increasing order, the order every
// search tries.
func neighbours(residual map[int]map[int]int) map[int][]int {
	adj := make(map[int][]int, len(residual))
	for u, row := range residual {
		list := make([]int, 0, len(row))
		for v := range row {
			list = append(list, v)
		}
		sort.Ints(list)
		adj[u] = list
	}
	return adj
}

// bfsLevels returns level[v], the fewest residual edges with room on a path from the source to
// v, for every vertex the BFS reaches.
func bfsLevels(residual map[int]map[int]int, adj map[int][]int, source int) map[int]int {
	level := map[int]int{source: 0}
	queue := []int{source}
	for len(queue) > 0 {
		u := queue[0]
		queue = queue[1:]
		for _, v := range adj[u] {
			if _, seen := level[v]; !seen && residual[u][v] > 0 {
				level[v] = level[u] + 1
				queue = append(queue, v)
			}
		}
	}
	return level
}

// findPath runs one depth-first search from the source through the level graph. It steps from
// u to v only when residual[u][v] > 0 and level[v] == level[u] + 1, and each vertex resumes at
// current[u], its current arc: an entry that cannot be used now cannot be used later in the
// phase either, so the pointer only moves forward. A vertex whose pointer reaches the end is a
// dead end: it is popped, and the vertex before it moves past the entry that led there.
// It returns the path to the sink, or nil when the source itself is a dead end, and how many
// residual entries it looked at.
func findPath(residual map[int]map[int]int, adj map[int][]int, level map[int]int, current map[int]int, source, sink int) ([]int, int) {
	path := []int{source}
	visits := 0
	for len(path) > 0 {
		u := path[len(path)-1]
		if u == sink {
			return path, visits
		}
		row := adj[u]
		stepped := false
		for current[u] < len(row) {
			v := row[current[u]]
			visits++
			if lv, ok := level[v]; ok && residual[u][v] > 0 && lv == level[u]+1 {
				path = append(path, v)
				stepped = true
				break
			}
			current[u]++
		}
		if !stepped {
			// A dead end for the rest of the phase: back up and skip the entry that led here.
			path = path[:len(path)-1]
			if len(path) > 0 {
				current[path[len(path)-1]]++
			}
		}
	}
	return nil, visits
}

// push sends the bottleneck of the path along it and returns the bottleneck.
func push(residual map[int]map[int]int, path []int) int {
	bottleneck := residual[path[0]][path[1]]
	for k := 1; k+1 < len(path); k++ {
		if r := residual[path[k]][path[k+1]]; r < bottleneck {
			bottleneck = r
		}
	}
	for k := 0; k+1 < len(path); k++ {
		residual[path[k]][path[k+1]] -= bottleneck
		residual[path[k+1]][path[k]] += bottleneck
	}
	return bottleneck
}

// run runs the phases and returns the flow, the final residual graph, the levels of the last
// BFS, the number of phases and the edge visits.
func run(graph map[int]map[int]int, source, sink int) (int, map[int]map[int]int, map[int]int, int, int) {
	residual := buildResidual(graph)
	adj := neighbours(residual)
	maxFlow, phases, edgeVisits := 0, 0, 0
	for {
		level := bfsLevels(residual, adj, source)
		phases++
		if _, reached := level[sink]; !reached {
			return maxFlow, residual, level, phases, edgeVisits
		}
		current := make(map[int]int, len(adj))
		for {
			path, visits := findPath(residual, adj, level, current, source, sink)
			edgeVisits += visits
			if path == nil {
				break
			}
			maxFlow += push(residual, path)
		}
	}
}

// dinic returns the maximum flow from source to sink; 0 when source == sink or the sink cannot
// be reached. O(V^2 E) time; O(E sqrt(V)) on unit networks. O(V + E) space.
func dinic(graph map[int]map[int]int, source, sink int) int {
	if source == sink {
		return 0
	}
	maxFlow, _, _, _, _ := run(graph, source, sink)
	return maxFlow
}

// dinicFlow returns the maximum flow, the flow on every edge, the source side of a minimum cut
// and the work done. Two anti-parallel edges share their residual entries, so only their net
// flow is defined: it is given to the edge it runs along, and the other edge gets 0. When
// source == sink nothing is sent: every flow is 0, Phases and EdgeVisits are 0 and SourceSide
// is [source].
func dinicFlow(graph map[int]map[int]int, source, sink int) DinicResult {
	flows := make(map[int]map[int]int, len(graph))
	if source == sink {
		for u, neighbors := range graph {
			flows[u] = make(map[int]int, len(neighbors))
			for v := range neighbors {
				flows[u][v] = 0
			}
		}
		return DinicResult{Flows: flows, SourceSide: []int{source}}
	}
	maxFlow, residual, level, phases, edgeVisits := run(graph, source, sink)
	for u, neighbors := range graph {
		flows[u] = make(map[int]int, len(neighbors))
		for v, capacity := range neighbors {
			flows[u][v] = max(0, capacity-residual[u][v])
		}
	}
	side := make([]int, 0, len(level))
	for v := range level {
		side = append(side, v)
	}
	sort.Ints(side)
	return DinicResult{MaxFlow: maxFlow, Flows: flows, SourceSide: side, Phases: phases, EdgeVisits: edgeVisits}
}

func main() {
	graph := map[int]map[int]int{
		0: {1: 16, 2: 13},
		1: {2: 10, 3: 12},
		2: {1: 4, 4: 14},
		3: {2: 9, 5: 20},
		4: {3: 7, 5: 4},
	}

	fmt.Println("Dinic's Algorithm Example:")
	fmt.Printf("Maximum flow: %d\n", dinic(graph, 0, 5)) // 23

	result := dinicFlow(graph, 0, 5)
	fmt.Printf("Source side of a minimum cut: %v\n", result.SourceSide)           // [0 1 2 4]
	fmt.Printf("Phases: %d, edge visits: %d\n", result.Phases, result.EdgeVisits) // 3, 40
}
