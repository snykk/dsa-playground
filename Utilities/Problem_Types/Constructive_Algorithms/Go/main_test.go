package main

import "testing"

func TestConstructPermutation(t *testing.T) {
	perm := ConstructPermutation(5, 2)
	if perm == nil {
		t.Error("Should construct permutation")
	}
	if len(perm) != 5 {
		t.Error("Wrong length")
	}
}

func TestConstructArrayWithSum(t *testing.T) {
	arr := ConstructArrayWithSum(5, 20, 1, 5)
	if arr == nil {
		t.Error("Should construct array")
	}
	sum := 0
	for _, x := range arr {
		sum += x
	}
	if sum != 20 {
		t.Errorf("Expected sum 20, got %d", sum)
	}
}

func distinctDiffs(p []int) int {
	seen := map[int]bool{}
	for i := 0; i+1 < len(p); i++ {
		d := p[i+1] - p[i]
		if d < 0 {
			d = -d
		}
		seen[d] = true
	}
	return len(seen)
}

func TestConstructPermutationAllSmall(t *testing.T) {
	for n := 1; n <= 12; n++ {
		for k := 0; k <= n+1; k++ {
			perm := ConstructPermutation(n, k)
			valid := (n == 1 && k == 0) || (n >= 2 && k >= 1 && k <= n-1)
			if !valid {
				if perm != nil {
					t.Errorf("n=%d k=%d: expected nil, got %v", n, k, perm)
				}
				continue
			}
			seen := make([]bool, n+1)
			for _, x := range perm {
				if x < 1 || x > n || seen[x] {
					t.Fatalf("n=%d k=%d: not a permutation: %v", n, k, perm)
				}
				seen[x] = true
			}
			if len(perm) != n || distinctDiffs(perm) != k {
				t.Errorf("n=%d k=%d: %v has %d distinct differences", n, k, perm, distinctDiffs(perm))
			}
		}
	}
}

func TestConstructGraph(t *testing.T) {
	edges := ConstructGraph([]int{2, 2, 2})
	if len(edges) != 3 {
		t.Fatalf("expected 3 edges, got %v", edges)
	}
	got := make([]int, 3)
	for _, e := range edges {
		got[e.U]++
		got[e.V]++
	}
	for i, d := range got {
		if d != 2 {
			t.Errorf("node %d has degree %d, want 2", i, d)
		}
	}
	if ConstructGraph([]int{3, 1, 1}) != nil {
		t.Error("degree sequence {3,1,1} is not graphical")
	}
}
