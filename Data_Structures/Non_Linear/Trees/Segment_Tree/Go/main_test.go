package main

import (
	"math/rand"
	"testing"
)

func TestQuery(t *testing.T) {
	arr := []int{1, 3, 5, 7, 9, 11}
	st := NewSegmentTree(arr)
	if st.Query(0, 2) != 9 {
		t.Errorf("Expected 9, got %d", st.Query(0, 2))
	}
	if st.Query(1, 3) != 15 {
		t.Errorf("Expected 15, got %d", st.Query(1, 3))
	}
}

func TestUpdate(t *testing.T) {
	arr := []int{1, 3, 5, 7, 9, 11}
	st := NewSegmentTree(arr)
	st.Update(2, 10)
	if st.Get(2) != 10 {
		t.Errorf("Expected 10, got %d", st.Get(2))
	}
	if st.Query(0, 2) != 14 {
		t.Errorf("Expected 14, got %d", st.Query(0, 2))
	}
}

func TestOutOfRangePanics(t *testing.T) {
	st := NewSegmentTree([]int{1, 2, 3})
	calls := map[string]func(){
		"get -1":    func() { st.Get(-1) },
		"query -1":  func() { st.Query(-1, 2) },
		"query n":   func() { st.Query(0, 3) },
		"query l>r": func() { st.Query(2, 1) },
		"update n":  func() { st.Update(3, 1) },
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

func TestNegativeValuesAndNonPowerOfTwo(t *testing.T) {
	st := NewSegmentTree([]int{-4, 2, -7, 5, 1})
	if st.Query(0, 4) != -3 || st.Query(2, 3) != -2 {
		t.Error("wrong sums")
	}
	st.Update(2, 10)
	if st.Query(1, 3) != 17 {
		t.Error("wrong sum after update")
	}
}

func TestRandomAgainstBruteForce(t *testing.T) {
	rng := rand.New(rand.NewSource(3))
	for n := 1; n <= 40; n++ {
		ref := make([]int, n)
		for i := range ref {
			ref[i] = rng.Intn(101) - 50
		}
		st := NewSegmentTree(ref)
		for step := 0; step < 60; step++ {
			if rng.Intn(10) < 4 {
				i, v := rng.Intn(n), rng.Intn(101)-50
				ref[i] = v
				st.Update(i, v)
			} else {
				l := rng.Intn(n)
				r := l + rng.Intn(n-l)
				want := 0
				for _, v := range ref[l : r+1] {
					want += v
				}
				if st.Query(l, r) != want {
					t.Fatalf("n=%d query(%d,%d) mismatch", n, l, r)
				}
			}
		}
	}
}
