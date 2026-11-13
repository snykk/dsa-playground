package main

import (
	"reflect"
	"testing"
	"time"
)

// TestDFSAdjacencyList tests basic DFS traversal on simple graph.
func TestDFSAdjacencyList(t *testing.T) {
	graph := map[int][]int{
		1: {2, 4},
		2: {3},
		3: {},
		4: {},
	}

	result := DFSAdjacencyList(graph, 1)

	if len(result) != 4 {
		t.Errorf("Expected 4 vertices, got %d", len(result))
	}

	if result[0] != 1 {
		t.Errorf("Expected first vertex to be 1, got %d", result[0])
	}
	
	// Check all vertices are present
	vertices := make(map[int]bool)
	for _, v := range result {
		vertices[v] = true
	}
	for i := 1; i <= 4; i++ {
		if !vertices[i] {
			t.Errorf("Vertex %d not found in result", i)
		}
	}
}

// TestDFSAdjacencyListUndirected tests DFS on undirected graph.
func TestDFSAdjacencyListUndirected(t *testing.T) {
	graph := map[int][]int{
		1: {2, 5},
		2: {1, 3},
		3: {2, 4},
		4: {3},
		5: {1},
	}

	result := DFSAdjacencyList(graph, 1)
	if len(result) != 5 {
		t.Errorf("Expected 5 vertices, got %d", len(result))
	}
	if result[0] != 1 {
		t.Errorf("Expected first vertex to be 1, got %d", result[0])
	}
	
	// Check all vertices are present
	vertices := make(map[int]bool)
	for _, v := range result {
		vertices[v] = true
	}
	for i := 1; i <= 5; i++ {
		if !vertices[i] {
			t.Errorf("Vertex %d not found in result", i)
		}
	}
}

// TestDFSRecursive tests recursive DFS traversal.
func TestDFSRecursive(t *testing.T) {
	graph := map[int][]int{
		1: {2, 4},
		2: {3},
		3: {},
		4: {},
	}

	result := DFSRecursive(graph, 1)

	if len(result) != 4 {
		t.Errorf("Expected 4 vertices, got %d", len(result))
	}

	if result[0] != 1 {
		t.Errorf("Expected first vertex to be 1, got %d", result[0])
	}
	
	// Check all vertices are present
	vertices := make(map[int]bool)
	for _, v := range result {
		vertices[v] = true
	}
	for i := 1; i <= 4; i++ {
		if !vertices[i] {
			t.Errorf("Vertex %d not found in result", i)
		}
	}
}

// TestDFSWithPath tests finding path when path exists.
func TestDFSWithPath(t *testing.T) {
	graph := map[int][]int{
		1: {2, 4},
		2: {3},
		3: {},
		4: {},
	}

	path := DFSWithPath(graph, 1, 3)

	if len(path) == 0 {
		t.Error("Expected path to be found")
	}

	if path[0] != 1 {
		t.Errorf("Expected path to start with 1, got %d", path[0])
	}

	if path[len(path)-1] != 3 {
		t.Errorf("Expected path to end with 3, got %d", path[len(path)-1])
	}
	
	// Check that path contains 2
	has2 := false
	for _, v := range path {
		if v == 2 {
			has2 = true
			break
		}
	}
	if !has2 {
		t.Error("Expected path to contain vertex 2")
	}
}

// TestDFSWithPathNotFound tests finding path when no path exists.
func TestDFSWithPathNotFound(t *testing.T) {
	graph := map[int][]int{
		1: {2},
		2: {1},
		3: {4},
		4: {3},
	}

	path := DFSWithPath(graph, 1, 3)
	if path != nil && len(path) != 0 {
		t.Errorf("Expected empty path, got %v", path)
	}
}

// TestDFSWithPathSameVertex tests finding path from vertex to itself.
func TestDFSWithPathSameVertex(t *testing.T) {
	graph := map[int][]int{
		1: {2, 4},
		2: {3},
		3: {},
		4: {},
	}

	path := DFSWithPath(graph, 1, 1)
	if len(path) != 1 {
		t.Errorf("Expected path length 1, got %d", len(path))
	}
	if path[0] != 1 {
		t.Errorf("Expected path to contain 1, got %v", path)
	}
}

// TestDFSDetectCycle tests cycle detection in directed graph.
func TestDFSDetectCycle(t *testing.T) {
	cyclicGraph := map[int][]int{
		1: {2},
		2: {3},
		3: {1},
	}

	hasCycle := DFSDetectCycle(cyclicGraph, true)
	if !hasCycle {
		t.Error("Expected cycle to be detected")
	}

	acyclicGraph := map[int][]int{
		1: {2},
		2: {3},
		3: {},
	}

	hasCycle = DFSDetectCycle(acyclicGraph, true)
	if hasCycle {
		t.Error("Expected no cycle")
	}
}

// TestDFSDetectCycleUndirected tests cycle detection in undirected graph.
func TestDFSDetectCycleUndirected(t *testing.T) {
	cyclicGraph := map[int][]int{
		1: {2, 3},
		2: {1, 3},
		3: {2, 1},
	}

	hasCycle := DFSDetectCycle(cyclicGraph, false)
	if !hasCycle {
		t.Error("Expected cycle to be detected")
	}

	acyclicGraph := map[int][]int{
		1: {2},
		2: {1},
		3: {},
	}

	hasCycle = DFSDetectCycle(acyclicGraph, false)
	if hasCycle {
		t.Error("Expected no cycle")
	}
}

// TestDFSEmptyGraph tests DFS on empty graph.
func TestDFSEmptyGraph(t *testing.T) {
	graph := map[int][]int{}
	result := DFSAdjacencyList(graph, 1)
	if len(result) != 0 {
		t.Errorf("Expected empty result, got %v", result)
	}
}

// TestDFSSingleVertex tests DFS on graph with single vertex.
func TestDFSSingleVertex(t *testing.T) {
	graph := map[int][]int{1: {}}
	result := DFSAdjacencyList(graph, 1)
	if len(result) != 1 {
		t.Errorf("Expected 1 vertex, got %d", len(result))
	}
	if result[0] != 1 {
		t.Errorf("Expected vertex 1, got %d", result[0])
	}
}

// TestDFSStartNotInGraph tests DFS when start vertex not in graph.
func TestDFSStartNotInGraph(t *testing.T) {
	graph := map[int][]int{
		1: {2},
		2: {3},
		3: {},
	}
	result := DFSAdjacencyList(graph, 99)
	if len(result) != 0 {
		t.Errorf("Expected empty result, got %v", result)
	}
}

// TestDFSWithPathNeighborOnlyTarget: a target that only appears in neighbor
// lists (no key of its own) is still reachable.
func TestDFSWithPathNeighborOnlyTarget(t *testing.T) {
	if path := DFSWithPath(map[int][]int{0: {1}}, 0, 1); !reflect.DeepEqual(path, []int{0, 1}) {
		t.Errorf("Expected [0 1], got %v", path)
	}
	branching := map[int][]int{0: {1, 2}, 1: {3}}
	if path := DFSWithPath(branching, 0, 3); !reflect.DeepEqual(path, []int{0, 1, 3}) {
		t.Errorf("Expected [0 1 3], got %v", path)
	}
	if path := DFSWithPath(map[int][]int{0: {1}}, 0, 2); len(path) != 0 {
		t.Errorf("Expected empty path to an unknown vertex, got %v", path)
	}
}

// TestDFSWithPathFollowsDFSOrder: the path is the one DFS walked. Vertex 4 is
// first pushed from 1, but DFS reaches it through 2 first.
func TestDFSWithPathFollowsDFSOrder(t *testing.T) {
	graph := map[int][]int{1: {2, 4}, 2: {4}, 4: {}}
	if path := DFSWithPath(graph, 1, 4); !reflect.DeepEqual(path, []int{1, 2, 4}) {
		t.Errorf("Expected [1 2 4], got %v", path)
	}
	longer := map[int][]int{1: {2, 4}, 2: {3}, 3: {4}, 4: {}}
	if path := DFSWithPath(longer, 1, 4); !reflect.DeepEqual(path, []int{1, 2, 3, 4}) {
		t.Errorf("Expected [1 2 3 4], got %v", path)
	}
}

// TestDFSWithPathLongPath: the path is rebuilt from parent links once, so a
// 200000-vertex chain is fast (the old path copy per push was O(V^2)).
func TestDFSWithPathLongPath(t *testing.T) {
	const n = 200000
	graph := make(map[int][]int, n)
	for i := 0; i+1 < n; i++ {
		graph[i] = []int{i + 1}
	}
	graph[n-1] = []int{}

	started := time.Now()
	path := DFSWithPath(graph, 0, n-1)
	elapsed := time.Since(started)

	if len(path) != n {
		t.Fatalf("Expected path length %d, got %d", n, len(path))
	}
	for i, v := range path {
		if v != i {
			t.Fatalf("Expected path[%d] = %d, got %d", i, i, v)
		}
	}
	if elapsed > 2*time.Second {
		t.Errorf("Expected a linear-time search, took %v", elapsed)
	}
}

// TestDFSDetectCycleNegativeVertex: -1 is an ordinary vertex and must not be
// mistaken for the "no parent" marker of a DFS root.
func TestDFSDetectCycleNegativeVertex(t *testing.T) {
	if !DFSDetectCycle(map[int][]int{-1: {-1}}, false) {
		t.Error("Expected the self-loop on -1 to be a cycle")
	}
	// A single edge -1 - 0 is not a cycle, whichever end the search starts from.
	if DFSDetectCycle(map[int][]int{-1: {0}, 0: {-1}}, false) {
		t.Error("Expected no cycle for the single edge -1 - 0")
	}
	triangle := map[int][]int{-1: {0, 1}, 0: {-1, 1}, 1: {0, -1}}
	if !DFSDetectCycle(triangle, false) {
		t.Error("Expected the triangle through -1 to be a cycle")
	}
}
