package main

import (
	"reflect"
	"testing"
)

func TestSingleEdge(t *testing.T) {
	r := FindBridgesAndArticulations(2, []Edge{{0, 1}})
	if len(r.Bridges) != 1 || r.Bridges[0] != (Edge{0, 1}) {
		t.Errorf("bridges = %v, want [{0 1}]", r.Bridges)
	}
	if len(r.Articulations) != 0 {
		t.Errorf("articulations = %v, want empty", r.Articulations)
	}
}

func TestTriangleNoBridges(t *testing.T) {
	r := FindBridgesAndArticulations(3, []Edge{{0, 1}, {1, 2}, {2, 0}})
	if len(r.Bridges) != 0 || len(r.Articulations) != 0 {
		t.Errorf("expected no bridges/APs in triangle; got %v / %v",
			r.Bridges, r.Articulations)
	}
}

func TestTrianglePlusTail(t *testing.T) {
	r := FindBridgesAndArticulations(4, []Edge{{0, 1}, {1, 2}, {2, 0}, {2, 3}})
	if !reflect.DeepEqual(r.Bridges, []Edge{{2, 3}}) {
		t.Errorf("bridges = %v, want [{2 3}]", r.Bridges)
	}
	if !reflect.DeepEqual(r.Articulations, []int{2}) {
		t.Errorf("articulations = %v, want [2]", r.Articulations)
	}
}

func TestLinearChain(t *testing.T) {
	r := FindBridgesAndArticulations(4, []Edge{{0, 1}, {1, 2}, {2, 3}})
	want := []Edge{{0, 1}, {1, 2}, {2, 3}}
	if !reflect.DeepEqual(r.Bridges, want) {
		t.Errorf("bridges = %v, want %v", r.Bridges, want)
	}
	if !reflect.DeepEqual(r.Articulations, []int{1, 2}) {
		t.Errorf("articulations = %v, want [1 2]", r.Articulations)
	}
}

func TestIsolatedVertices(t *testing.T) {
	r := FindBridgesAndArticulations(3, nil)
	if len(r.Bridges) != 0 || len(r.Articulations) != 0 {
		t.Errorf("expected nothing on isolated vertices")
	}
}

func TestStarGraph(t *testing.T) {
	r := FindBridgesAndArticulations(4, []Edge{{0, 1}, {0, 2}, {0, 3}})
	if len(r.Bridges) != 3 {
		t.Errorf("bridges = %v, want 3 edges", r.Bridges)
	}
	if !reflect.DeepEqual(r.Articulations, []int{0}) {
		t.Errorf("articulations = %v, want [0]", r.Articulations)
	}
}

func TestLeetCodeExample(t *testing.T) {
	edges := []Edge{{0, 1}, {1, 2}, {2, 0}, {1, 3}}
	r := FindBridgesAndArticulations(4, edges)
	if !reflect.DeepEqual(r.Bridges, []Edge{{1, 3}}) {
		t.Errorf("bridges = %v, want [{1 3}]", r.Bridges)
	}
	if !reflect.DeepEqual(r.Articulations, []int{1}) {
		t.Errorf("articulations = %v, want [1]", r.Articulations)
	}
}

func TestParallelEdges(t *testing.T) {
	r := FindBridgesAndArticulations(2, []Edge{{0, 1}, {0, 1}})
	if len(r.Bridges) != 0 {
		t.Errorf("parallel edges should not be bridges; got %v", r.Bridges)
	}
}

func TestDisconnectedComponents(t *testing.T) {
	edges := []Edge{{0, 1}, {1, 2}, {2, 0}, {3, 4}, {4, 5}, {5, 3}}
	r := FindBridgesAndArticulations(6, edges)
	if len(r.Bridges) != 0 || len(r.Articulations) != 0 {
		t.Errorf("two triangles should have no bridges/APs; got %v / %v",
			r.Bridges, r.Articulations)
	}
}
