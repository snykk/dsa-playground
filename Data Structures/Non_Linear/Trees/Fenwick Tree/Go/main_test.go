package main

import (
	"math/rand"
	"testing"
)

func TestQuery(t *testing.T) {
	arr := []int{1, 3, 5, 7, 9, 11}
	ft := NewFenwickTree(arr)
	if ft.Query(0, 2) != 9 {
		t.Errorf("Expected 9, got %d", ft.Query(0, 2))
	}
	if ft.Query(1, 3) != 15 {
		t.Errorf("Expected 15, got %d", ft.Query(1, 3))
	}
}

func TestUpdate(t *testing.T) {
	arr := []int{1, 3, 5, 7, 9, 11}
	ft := NewFenwickTree(arr)
	ft.Update(2, 5)
	if ft.Get(2) != 10 {
		t.Errorf("Expected 10, got %d", ft.Get(2))
	}
	if ft.Query(0, 2) != 14 {
		t.Errorf("Expected 14, got %d", ft.Query(0, 2))
	}
}

// Regression: Update(-1, x) used to loop forever.
func TestOutOfRangePanics(t *testing.T) {
	ft := NewFenwickTree([]int{1, 2, 3})
	calls := map[string]func(){
		"update -1":  func() { ft.Update(-1, 5) },
		"update n":   func() { ft.Update(3, 5) },
		"prefix n":   func() { ft.PrefixSum(3) },
		"query l>r":  func() { ft.Query(2, 1) },
		"query -1,1": func() { ft.Query(-1, 1) },
	}
	for name, call := range calls {
		func() {
			defer func() {
				if recover() == nil {
					t.Errorf("%s: expected a panic", name)
				}
			}()
			call()
		}()
	}
}

func TestEmptyAndSingle(t *testing.T) {
	ft := NewFenwickTree([]int{})
	defer func() {
		if recover() == nil {
			t.Error("prefix of an empty tree should panic")
		}
	}()
	one := NewFenwickTree([]int{5})
	if one.Query(0, 0) != 5 {
		t.Error("single element")
	}
	ft.PrefixSum(0)
}

func TestRandomAgainstBruteForce(t *testing.T) {
	rng := rand.New(rand.NewSource(7))
	for n := 1; n < 40; n++ {
		ref := make([]int, n)
		for i := range ref {
			ref[i] = rng.Intn(101) - 50
		}
		ft := NewFenwickTree(ref)
		for step := 0; step < 60; step++ {
			if rng.Intn(2) == 0 {
				i, d := rng.Intn(n), rng.Intn(41)-20
				ref[i] += d
				ft.Update(i, d)
			} else {
				l := rng.Intn(n)
				r := l + rng.Intn(n-l)
				want := 0
				for _, v := range ref[l : r+1] {
					want += v
				}
				if ft.Query(l, r) != want {
					t.Fatalf("n=%d query(%d,%d) mismatch", n, l, r)
				}
			}
		}
	}
}
