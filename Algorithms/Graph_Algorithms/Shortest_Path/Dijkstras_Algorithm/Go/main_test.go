package main

import (
	"math"
	"reflect"
	"testing"
	"time"
)

// TestDijkstra tests basic Dijkstra's algorithm.
func TestDijkstra(t *testing.T) {
	graph := map[int][]struct {
		Neighbor int
		Weight   int
	}{
		1: {{Neighbor: 2, Weight: 4}, {Neighbor: 3, Weight: 2}},
		2: {{Neighbor: 4, Weight: 5}},
		3: {{Neighbor: 4, Weight: 1}},
		4: {},
	}
	
	distances := Dijkstra(graph, 1)
	
	if distances[1] != 0 {
		t.Errorf("Expected distance to 1 to be 0, got %d", distances[1])
	}
	if distances[2] != 4 {
		t.Errorf("Expected distance to 2 to be 4, got %d", distances[2])
	}
	if distances[3] != 2 {
		t.Errorf("Expected distance to 3 to be 2, got %d", distances[3])
	}
	if distances[4] != 3 {
		t.Errorf("Expected distance to 4 to be 3, got %d", distances[4])
	}
	if len(distances) != 4 {
		t.Errorf("Expected 4 distances, got %d", len(distances))
	}
}

// TestDijkstraMultiplePaths tests Dijkstra's with multiple paths to same vertex.
func TestDijkstraMultiplePaths(t *testing.T) {
	graph := map[int][]struct {
		Neighbor int
		Weight   int
	}{
		1: {{Neighbor: 2, Weight: 1}, {Neighbor: 3, Weight: 4}},
		2: {{Neighbor: 3, Weight: 2}, {Neighbor: 4, Weight: 5}},
		3: {{Neighbor: 4, Weight: 1}},
		4: {},
	}
	
	distances := Dijkstra(graph, 1)
	if distances[3] != 3 { // 1 -> 2 -> 3 = 1 + 2 = 3 (better than 1 -> 3 = 4)
		t.Errorf("Expected distance to 3 to be 3, got %d", distances[3])
	}
	if distances[4] != 4 { // 1 -> 2 -> 3 -> 4 = 1 + 2 + 1 = 4
		t.Errorf("Expected distance to 4 to be 4, got %d", distances[4])
	}
}

// TestDijkstraWithPath tests Dijkstra's with path reconstruction.
func TestDijkstraWithPath(t *testing.T) {
	graph := map[int][]struct {
		Neighbor int
		Weight   int
	}{
		1: {{Neighbor: 2, Weight: 4}, {Neighbor: 3, Weight: 2}},
		2: {{Neighbor: 4, Weight: 5}},
		3: {{Neighbor: 4, Weight: 1}},
		4: {},
	}
	
	distance, path := DijkstraWithPath(graph, 1, 4)
	
	if distance != 3 {
		t.Errorf("Expected distance to be 3, got %d", distance)
	}
	
	expectedPath := []int{1, 3, 4}
	if !reflect.DeepEqual(path, expectedPath) {
		t.Errorf("Expected path %v, got %v", expectedPath, path)
	}
	if path[0] != 1 {
		t.Errorf("Expected path to start at 1, got %d", path[0])
	}
	if path[len(path)-1] != 4 {
		t.Errorf("Expected path to end at 4, got %d", path[len(path)-1])
	}
}

// TestDijkstraWithPathSameVertex tests path finding from vertex to itself.
func TestDijkstraWithPathSameVertex(t *testing.T) {
	graph := map[int][]struct {
		Neighbor int
		Weight   int
	}{
		1: {{Neighbor: 2, Weight: 4}, {Neighbor: 3, Weight: 2}},
		2: {{Neighbor: 4, Weight: 5}},
		3: {{Neighbor: 4, Weight: 1}},
		4: {},
	}
	
	distance, path := DijkstraWithPath(graph, 1, 1)
	if distance != 0 {
		t.Errorf("Expected distance to be 0, got %d", distance)
	}
	if len(path) != 1 {
		t.Errorf("Expected path length 1, got %d", len(path))
	}
	if path[0] != 1 {
		t.Errorf("Expected path to contain 1, got %v", path)
	}
}

// TestDijkstraNoPath tests Dijkstra's when no path exists.
func TestDijkstraNoPath(t *testing.T) {
	graph := map[int][]struct {
		Neighbor int
		Weight   int
	}{
		1: {{Neighbor: 2, Weight: 1}},
		2: {},
		3: {},
	}
	
	distances := Dijkstra(graph, 1)
	if distances[1] != 0 {
		t.Errorf("Expected distance to 1 to be 0, got %d", distances[1])
	}
	if distances[2] != 1 {
		t.Errorf("Expected distance to 2 to be 1, got %d", distances[2])
	}
	if distances[3] != math.MaxInt {
		t.Errorf("Expected distance to 3 to be MaxInt, got %d", distances[3])
	}
}

// TestDijkstraNoPathWithPath tests path finding when no path exists.
func TestDijkstraNoPathWithPath(t *testing.T) {
	graph := map[int][]struct {
		Neighbor int
		Weight   int
	}{
		1: {{Neighbor: 2, Weight: 1}},
		2: {},
		3: {},
	}
	
	distance, path := DijkstraWithPath(graph, 1, 3)
	if distance != -1 {
		t.Errorf("Expected distance to be -1, got %d", distance)
	}
	if path != nil && len(path) != 0 {
		t.Errorf("Expected empty path, got %v", path)
	}
}

// TestDijkstraSingleVertex tests Dijkstra's on graph with single vertex.
func TestDijkstraSingleVertex(t *testing.T) {
	graph := map[int][]struct {
		Neighbor int
		Weight   int
	}{
		1: {},
	}
	
	distances := Dijkstra(graph, 1)
	if distances[1] != 0 {
		t.Errorf("Expected distance to 1 to be 0, got %d", distances[1])
	}
	if len(distances) != 1 {
		t.Errorf("Expected 1 distance, got %d", len(distances))
	}
}

// TestDijkstraEmptyGraph tests Dijkstra's on empty graph.
func TestDijkstraEmptyGraph(t *testing.T) {
	graph := map[int][]struct {
		Neighbor int
		Weight   int
	}{}
	
	distances := Dijkstra(graph, 1)
	if len(distances) != 0 {
		t.Errorf("Expected empty distances, got %v", distances)
	}
}


// TestDijkstraNeighborOnlyVertex: a vertex that appears only as a neighbor
// (not a map key) still gets its distance and can be a path target.
func TestDijkstraNeighborOnlyVertex(t *testing.T) {
	graph := map[int][]struct {
		Neighbor int
		Weight   int
	}{
		0: {{Neighbor: 1, Weight: 5}},
	}

	distances := Dijkstra(graph, 0)
	if !reflect.DeepEqual(distances, map[int]int{0: 0, 1: 5}) {
		t.Errorf("Expected map[0:0 1:5], got %v", distances)
	}

	distance, path := DijkstraWithPath(graph, 0, 1)
	if distance != 5 || !reflect.DeepEqual(path, []int{0, 1}) {
		t.Errorf("Expected (5, [0 1]), got (%d, %v)", distance, path)
	}

	// Unreachable neighbor-only vertices are reported as MaxInt, like key vertices.
	split := map[int][]struct {
		Neighbor int
		Weight   int
	}{0: {}, 2: {{Neighbor: 3, Weight: 1}}}
	splitDistances := Dijkstra(split, 0)
	if len(splitDistances) != 3 || splitDistances[3] != math.MaxInt {
		t.Errorf("Expected 3 vertices with dist[3] = MaxInt, got %v", splitDistances)
	}
}

// TestDijkstraWithPathStartNotInGraph: start == target outside the graph must
// return (0, [start]) instead of following default predecessors forever.
func TestDijkstraWithPathStartNotInGraph(t *testing.T) {
	type result struct {
		distance int
		path     []int
	}
	run := func(graph map[int][]struct {
		Neighbor int
		Weight   int
	}, start, target int) result {
		done := make(chan result, 1)
		go func() {
			d, p := DijkstraWithPath(graph, start, target)
			done <- result{d, p}
		}()
		select {
		case r := <-done:
			return r
		case <-time.After(2 * time.Second):
			t.Fatalf("DijkstraWithPath(%v, %d, %d) did not return", graph, start, target)
			return result{}
		}
	}

	empty := map[int][]struct {
		Neighbor int
		Weight   int
	}{}
	if r := run(empty, 5, 5); r.distance != 0 || !reflect.DeepEqual(r.path, []int{5}) {
		t.Errorf("Expected (0, [5]) on an empty graph, got (%d, %v)", r.distance, r.path)
	}

	single := map[int][]struct {
		Neighbor int
		Weight   int
	}{0: {}}
	if r := run(single, 5, 5); r.distance != 0 || !reflect.DeepEqual(r.path, []int{5}) {
		t.Errorf("Expected (0, [5]), got (%d, %v)", r.distance, r.path)
	}
	if r := run(single, 5, 0); r.distance != -1 || len(r.path) != 0 {
		t.Errorf("Expected (-1, []), got (%d, %v)", r.distance, r.path)
	}
}
