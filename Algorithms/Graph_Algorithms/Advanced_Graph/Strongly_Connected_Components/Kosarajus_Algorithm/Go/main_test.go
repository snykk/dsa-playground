package main

import (
	"reflect"
	"sort"
	"testing"
)

func TestKosarajuSCC(t *testing.T) {
	graph := map[int][]int{
		1: {2},
		2: {3},
		3: {1},
		4: {5},
		5: {6},
		6: {4},
	}

	sccs := KosarajuSCC(graph)
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

	graph2 := map[int][]int{
		1: {2},
		2: {3},
		3: {},
	}

	if IsStronglyConnected(graph2) {
		t.Error("Graph should not be strongly connected")
	}
}

func sortedComponents(sccs [][]int) [][]int {
	out := make([][]int, len(sccs))
	for i, c := range sccs {
		out[i] = append([]int(nil), c...)
		sort.Ints(out[i])
	}
	sort.Slice(out, func(a, b int) bool { return out[a][0] < out[b][0] })
	return out
}

func TestComponentContents(t *testing.T) {
	graph := map[int][]int{0: {1}, 1: {2}, 2: {0, 3}, 3: {4}, 4: {3, 5}, 5: {}}
	got := sortedComponents(KosarajuSCC(graph))
	want := [][]int{{0, 1, 2}, {3, 4}, {5}}
	if !reflect.DeepEqual(got, want) {
		t.Errorf("Expected %v, got %v", want, got)
	}
}

func TestNeighborOnlyVertex(t *testing.T) {
	got := sortedComponents(KosarajuSCC(map[int][]int{0: {1}}))
	want := [][]int{{0}, {1}}
	if !reflect.DeepEqual(got, want) {
		t.Errorf("Expected %v, got %v", want, got)
	}
}

func TestSelfLoopAndEmpty(t *testing.T) {
	if got := KosarajuSCCCount(map[int][]int{7: {7}}); got != 1 {
		t.Errorf("Expected 1 SCC for a self-loop, got %d", got)
	}
	if got := KosarajuSCC(map[int][]int{}); len(got) != 0 {
		t.Errorf("Expected no SCCs for an empty graph, got %v", got)
	}
}

func TestLongCycle(t *testing.T) {
	const n = 200000
	graph := make(map[int][]int, n)
	for i := 0; i < n; i++ {
		graph[i] = []int{(i + 1) % n}
	}
	if got := KosarajuSCCCount(graph); got != 1 {
		t.Errorf("Expected 1 SCC, got %d", got)
	}
}
