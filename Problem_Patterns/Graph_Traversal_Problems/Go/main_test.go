package main

import (
	"reflect"
	"testing"
)

func TestBFSShortestPath(t *testing.T) {
	graph := map[int][]int{
		0: {1, 2},
		1: {0, 3},
		2: {0, 3, 4},
		3: {1, 2},
		4: {2},
	}

	if dist := BFSShortestPath(graph, 0, 3); dist != 2 {
		t.Errorf("Dist 0->3 = %d; want 2", dist)
	}
	if dist := BFSShortestPath(graph, 0, 5); dist != -1 {
		t.Errorf("Dist 0->5 = %d; want -1", dist)
	}
}

func TestNumIslands(t *testing.T) {
	grid := [][]byte{
		{'1', '1', '0'},
		{'1', '1', '0'},
		{'0', '0', '1'},
	}
	// Make a copy since NumIslands mutates grid
	gridCopy := make([][]byte, len(grid))
	for i := range grid {
		gridCopy[i] = make([]byte, len(grid[i]))
		copy(gridCopy[i], grid[i])
	}

	if n := NumIslands(gridCopy); n != 2 {
		t.Errorf("NumIslands = %d; want 2", n)
	}
}

func TestTopologicalSort(t *testing.T) {
	edges := [][]int{{0, 1}, {1, 2}}
	res := TopologicalSort(3, edges)
	expected := []int{0, 1, 2}

	if !reflect.DeepEqual(res, expected) {
		t.Errorf("TopoSort = %v; want %v", res, expected)
	}

	edgesCycle := [][]int{{0, 1}, {1, 0}}
	resCycle := TopologicalSort(2, edgesCycle)
	if len(resCycle) != 0 {
		t.Errorf("TopoSort cycle should be empty, got %v", resCycle)
	}
}
