package main

import (
	"errors"
	"math/rand"
	"testing"
)

var (
	larger = map[int][]int{0: {1, 2, 3}, 1: {2, 4}, 2: {4, 5}, 3: {5}, 4: {6}, 5: {6}, 6: {}}
	// dag12 and sparseIDs: expected values printed by the Python dag_longest_path.
	dag12 = map[int][]int{0: {1, 4, 7}, 1: {2, 5}, 2: {3, 9}, 3: {11}, 4: {5, 8}, 5: {6, 10},
		6: {3, 11}, 7: {8}, 8: {9, 6}, 9: {10}, 10: {11}, 11: {}}
	sparseIDs = map[int][]int{-5: {100, 7}, 100: {7, 42}, 7: {42}, 42: {}}
)

func TestDAGLongestPath(t *testing.T) {
	tests := []struct {
		name  string
		graph map[int][]int
		start int
		want  int
	}{
		{"diamond", map[int][]int{0: {1, 2}, 1: {3}, 2: {3}, 3: {}}, 0, 2},
		{"larger dag from 0", larger, 0, 4},
		{"larger dag from 3", larger, 3, 2},
		{"larger dag from the sink", larger, 6, 0},
		{"missing node is a sink", map[int][]int{}, 5, 0},
		{"nil graph", nil, 5, 0},
		{"successor without an entry", map[int][]int{0: {1}}, 0, 1},
		{"unreachable cycle is ignored", map[int][]int{0: {1}, 1: {}, 5: {6}, 6: {5}}, 0, 1},
		{"shared node visited once is not a cycle", map[int][]int{0: {1, 2}, 1: {3}, 2: {3}, 3: {}}, 0, 2},
		{"python: dag12 from 0", dag12, 0, 5},
		{"python: dag12 from 4", dag12, 4, 4},
		{"python: dag12 from 7", dag12, 7, 4},
		{"python: sparse ids", sparseIDs, -5, 3},
	}
	for _, tc := range tests {
		got, err := DAGLongestPath(tc.graph, tc.start)
		if err != nil || got != tc.want {
			t.Errorf("%s: got (%d, %v), want (%d, nil)", tc.name, got, err, tc.want)
		}
	}
}

func TestDAGLongestPathCycle(t *testing.T) {
	tests := []struct {
		name  string
		graph map[int][]int
	}{
		// A cycle is an error, not a path of length 2.
		{"cycle", map[int][]int{0: {1}, 1: {2}, 2: {0}}},
		{"self-loop", map[int][]int{0: {0}}},
		{"python: cycle below a dag", map[int][]int{0: {1, 2}, 1: {3}, 2: {3}, 3: {4}, 4: {3}}},
	}
	for _, tc := range tests {
		if _, err := DAGLongestPath(tc.graph, 0); !errors.Is(err, ErrCycle) {
			t.Errorf("%s: got error %v, want ErrCycle", tc.name, err)
		}
	}
}

// bruteForceLongest tries every simple path from node; it sets cycle if a
// path can step back onto itself (a cycle is reachable).
func bruteForceLongest(graph map[int][]int, node int, onPath []bool, cycle *bool) int {
	onPath[node] = true
	best := 0
	for _, next := range graph[node] {
		if onPath[next] {
			*cycle = true
		} else {
			best = max(best, 1+bruteForceLongest(graph, next, onPath, cycle))
		}
	}
	onPath[node] = false
	return best
}

func TestDAGLongestPathMatchesBruteForce(t *testing.T) {
	rng := rand.New(rand.NewSource(20261115))
	for trial := 0; trial < 500; trial++ {
		n := 1 + rng.Intn(8)
		acyclic := rng.Intn(2) == 0 // edges only go to larger ids
		graph := map[int][]int{}
		for u := 0; u < n; u++ {
			if rng.Intn(5) == 0 {
				continue // no entry: a sink
			}
			successors := []int{}
			for v := 0; v < n; v++ {
				if (!acyclic || v > u) && rng.Intn(3) == 0 {
					successors = append(successors, v)
				}
			}
			graph[u] = successors
		}
		start := rng.Intn(n)
		cycle := false
		want := bruteForceLongest(graph, start, make([]bool, n), &cycle)
		got, err := DAGLongestPath(graph, start)
		if cycle && !errors.Is(err, ErrCycle) {
			t.Fatalf("trial %d: got (%d, %v), want ErrCycle for %v from %d", trial, got, err, graph, start)
		}
		if !cycle && (err != nil || got != want) {
			t.Fatalf("trial %d: got (%d, %v), want %d for %v from %d", trial, got, err, want, graph, start)
		}
	}
}
