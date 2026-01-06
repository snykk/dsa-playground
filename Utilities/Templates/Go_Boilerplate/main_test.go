package main

import (
	"testing"
)

func TestGCD(t *testing.T) {
	tests := []struct {
		a, b, expected int64
	}{
		{12, 18, 6},
		{17, 13, 1},
		{100, 25, 25},
		{7, 7, 7},
	}

	for _, tt := range tests {
		result := gcd(tt.a, tt.b)
		if result != tt.expected {
			t.Errorf("gcd(%d, %d) = %d; want %d", tt.a, tt.b, result, tt.expected)
		}
	}
}

func TestLCM(t *testing.T) {
	tests := []struct {
		a, b, expected int64
	}{
		{4, 6, 12},
		{3, 5, 15},
		{12, 18, 36},
		{7, 1, 7},
	}

	for _, tt := range tests {
		result := lcm(tt.a, tt.b)
		if result != tt.expected {
			t.Errorf("lcm(%d, %d) = %d; want %d", tt.a, tt.b, result, tt.expected)
		}
	}
}

func TestPower(t *testing.T) {
	tests := []struct {
		base, exp, mod, expected int64
	}{
		{2, 10, MOD, 1024},
		{3, 5, MOD, 243},
		{2, 0, MOD, 1},
		{5, 1, MOD, 5},
	}

	for _, tt := range tests {
		result := power(tt.base, tt.exp, tt.mod)
		if result != tt.expected {
			t.Errorf("power(%d, %d, %d) = %d; want %d", tt.base, tt.exp, tt.mod, result, tt.expected)
		}
	}
}

func TestModInverse(t *testing.T) {
	a := int64(12345)
	inv := modInverse(a, MOD)
	if (a*inv)%MOD != 1 {
		t.Errorf("modInverse failed: %d * %d mod %d != 1", a, inv, MOD)
	}
}

func TestIsPrime(t *testing.T) {
	tests := []struct {
		n        int64
		expected bool
	}{
		{0, false},
		{1, false},
		{2, true},
		{3, true},
		{4, false},
		{17, true},
		{100, false},
	}

	for _, tt := range tests {
		result := isPrime(tt.n)
		if result != tt.expected {
			t.Errorf("isPrime(%d) = %v; want %v", tt.n, result, tt.expected)
		}
	}
}

func TestDSU(t *testing.T) {
	dsu := NewDSU(5)

	// Initially all elements in their own set
	if dsu.Find(0) != 0 || dsu.Find(1) != 1 {
		t.Error("Initial find failed")
	}

	// Unite 0 and 1
	if !dsu.Unite(0, 1) {
		t.Error("Unite(0, 1) should return true")
	}
	if !dsu.Connected(0, 1) {
		t.Error("0 and 1 should be connected")
	}

	// Unite 2 and 3
	dsu.Unite(2, 3)
	if !dsu.Connected(2, 3) {
		t.Error("2 and 3 should be connected")
	}

	// 0,1 and 2,3 are different sets
	if dsu.Connected(0, 2) {
		t.Error("0 and 2 should not be connected")
	}

	// Unite the two sets
	dsu.Unite(1, 3)
	if !dsu.Connected(0, 2) {
		t.Error("0 and 2 should be connected after union")
	}

	// Cannot unite already connected elements
	if dsu.Unite(0, 2) {
		t.Error("Unite(0, 2) should return false")
	}
}

func TestSegTree(t *testing.T) {
	st := NewSegTree(5)

	// Initial tree is all zeros
	if st.Query(0, 4) != 0 {
		t.Errorf("Initial query should be 0")
	}

	// Update individual elements
	st.Update(0, 1)
	st.Update(1, 2)
	st.Update(2, 3)
	st.Update(3, 4)
	st.Update(4, 5)

	// Test range queries
	if st.Query(0, 4) != 15 {
		t.Errorf("Query(0, 4) = %d; want 15", st.Query(0, 4))
	}
	if st.Query(0, 2) != 6 {
		t.Errorf("Query(0, 2) = %d; want 6", st.Query(0, 2))
	}
	if st.Query(2, 4) != 12 {
		t.Errorf("Query(2, 4) = %d; want 12", st.Query(2, 4))
	}
}

func TestCombinatorics(t *testing.T) {
	comb := NewCombinatorics(1000, MOD)

	tests := []struct {
		n, r     int
		expected int64
	}{
		{5, 2, 10},
		{10, 5, 252},
		{5, 0, 1},
		{5, 5, 1},
		{5, 6, 0},
	}

	for _, tt := range tests {
		result := comb.NCr(tt.n, tt.r)
		if result != tt.expected {
			t.Errorf("NCr(%d, %d) = %d; want %d", tt.n, tt.r, result, tt.expected)
		}
	}
}

func TestGraph(t *testing.T) {
	g := NewGraph(5)
	g.AddEdge(0, 1, false)
	g.AddEdge(1, 2, false)
	g.AddEdge(2, 3, false)
	g.AddEdge(3, 4, false)

	// Test BFS
	dist := g.BFS(0)
	expected := []int{0, 1, 2, 3, 4}
	for i, d := range dist {
		if d != expected[i] {
			t.Errorf("BFS dist[%d] = %d; want %d", i, d, expected[i])
		}
	}

	// Test DFS
	visited := g.DFS(0)
	for i, v := range visited {
		if !v {
			t.Errorf("DFS should visit node %d", i)
		}
	}
}

func TestBinarySearch(t *testing.T) {
	arr := []int{1, 2, 3, 4, 5, 6, 7, 8, 9, 10}

	if lowerBound(arr, 5) != 4 {
		t.Errorf("lowerBound(arr, 5) = %d; want 4", lowerBound(arr, 5))
	}
	if upperBound(arr, 5) != 5 {
		t.Errorf("upperBound(arr, 5) = %d; want 5", upperBound(arr, 5))
	}
}
