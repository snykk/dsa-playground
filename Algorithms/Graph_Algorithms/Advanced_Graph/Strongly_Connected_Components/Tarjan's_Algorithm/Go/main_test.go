package main

import (
	"reflect"
	"sort"
	"testing"
)

func TestTarjanSCC(t *testing.T) {
	graph := map[int][]int{
		1: {2},
		2: {3},
		3: {1},
		4: {5},
		5: {6},
		6: {4},
	}

	sccs := TarjanSCC(graph)
	if len(sccs) != 2 {
		t.Errorf("Expected 2 SCCs, got %d", len(sccs))
	}
}

func TestIsStronglyConnected(t *testing.T) {
	graph := map[int][]int{
		1: {2},
		2: {3},
		3: {1},
	}

	if !IsStronglyConnected(graph) {
		t.Error("Graph should be strongly connected")
	}
}

func sortedComponents(sccs [][]int) [][]int {
	out := make([][]int, len(sccs))
	for i, c := range sccs {
		out[i] = append([]int(nil), c...)
		sort.Ints(out[i])
	}
	return out
}

func TestComponentContentsAndOrder(t *testing.T) {
	// Components come out sinks first: {5}, then {3,4}, then {0,1,2}.
	graph := map[int][]int{0: {1}, 1: {2}, 2: {0, 3}, 3: {4}, 4: {3, 5}, 5: {}}
	got := sortedComponents(TarjanSCC(graph))
	want := [][]int{{5}, {3, 4}, {0, 1, 2}}
	if !reflect.DeepEqual(got, want) {
		t.Errorf("Expected %v, got %v", want, got)
	}
}

func TestNeighborOnlyVertex(t *testing.T) {
	got := sortedComponents(TarjanSCC(map[int][]int{0: {1}}))
	want := [][]int{{1}, {0}}
	if !reflect.DeepEqual(got, want) {
		t.Errorf("Expected %v, got %v", want, got)
	}
}

func TestSelfLoopAndEmpty(t *testing.T) {
	if got := TarjanSCCCount(map[int][]int{7: {7}}); got != 1 {
		t.Errorf("Expected 1 SCC for a self-loop, got %d", got)
	}
	if got := TarjanSCC(map[int][]int{}); len(got) != 0 {
		t.Errorf("Expected no SCCs for an empty graph, got %v", got)
	}
}

func TestLongCycle(t *testing.T) {
	const n = 200000
	graph := make(map[int][]int, n)
	for i := 0; i < n; i++ {
		graph[i] = []int{(i + 1) % n}
	}
	if got := TarjanSCCCount(graph); got != 1 {
		t.Errorf("Expected 1 SCC, got %d", got)
	}
}
