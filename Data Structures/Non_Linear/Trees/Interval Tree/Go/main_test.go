package main

import (
	"math/rand"
	"reflect"
	"sort"
	"testing"
	"time"
)

type pair [2]int

func sorted(v []Interval) []pair {
	out := []pair{}
	for _, i := range v {
		out = append(out, pair{i.Low, i.High})
	}
	sort.Slice(out, func(a, b int) bool {
		if out[a][0] != out[b][0] {
			return out[a][0] < out[b][0]
		}
		return out[a][1] < out[b][1]
	})
	return out
}

func checkMax(t *testing.T, n *IntervalNode) int {
	t.Helper()
	if n == nil {
		return -1 << 62
	}
	best := n.interval.High
	if l := checkMax(t, n.left); l > best {
		best = l
	}
	if r := checkMax(t, n.right); r > best {
		best = r
	}
	if n.max != best {
		t.Fatalf("node %v has max %d, want %d", n.interval, n.max, best)
	}
	return best
}

func TestInsertAndSearch(t *testing.T) {
	tree := NewIntervalTree()
	for _, iv := range []pair{{15, 20}, {10, 30}, {17, 19}, {5, 20}, {12, 15}, {30, 40}} {
		tree.Insert(NewInterval(iv[0], iv[1]))
	}
	want := []pair{{5, 20}, {10, 30}, {12, 15}, {15, 20}}
	if got := sorted(tree.SearchOverlapping(NewInterval(14, 16))); !reflect.DeepEqual(got, want) {
		t.Errorf("got %v, want %v", got, want)
	}
}

func TestSearchPoint(t *testing.T) {
	tree := NewIntervalTree()
	tree.Insert(NewInterval(10, 20))
	tree.Insert(NewInterval(15, 25))
	tree.Insert(NewInterval(30, 40))

	want := []pair{{10, 20}, {15, 25}}
	if got := sorted(tree.SearchContainingPoint(15)); !reflect.DeepEqual(got, want) {
		t.Errorf("point 15: got %v", got)
	}
	if got := sorted(tree.SearchContainingPoint(20)); !reflect.DeepEqual(got, want) {
		t.Errorf("point 20: got %v", got)
	}
	if len(tree.SearchContainingPoint(26)) != 0 {
		t.Error("point 26 should hit nothing")
	}
}

func TestEmptyTree(t *testing.T) {
	tree := NewIntervalTree()
	if !tree.IsEmpty() || tree.Size() != 0 {
		t.Error("Expected tree to be empty")
	}
	if len(tree.SearchOverlapping(NewInterval(10, 20))) != 0 {
		t.Error("Expected empty result from empty tree")
	}
}

func TestContainedAndDelete(t *testing.T) {
	tree := NewIntervalTree()
	for _, iv := range []pair{{10, 20}, {15, 18}, {12, 16}, {25, 30}, {4, 8}, {4, 8}} {
		tree.Insert(NewInterval(iv[0], iv[1]))
	}
	want := []pair{{10, 20}, {12, 16}, {15, 18}}
	if got := sorted(tree.SearchContainedIn(NewInterval(10, 20))); !reflect.DeepEqual(got, want) {
		t.Errorf("contained: got %v", got)
	}
	if !tree.Delete(NewInterval(4, 8)) || tree.Size() != 5 {
		t.Error("first delete of (4,8)")
	}
	if !tree.Delete(NewInterval(4, 8)) || tree.Delete(NewInterval(4, 8)) {
		t.Error("second and third delete of (4,8)")
	}
	if !tree.Delete(NewInterval(10, 20)) || tree.Size() != 3 {
		t.Error("delete of (10,20)")
	}
	checkMax(t, tree.root)
}

// Regression: every insert used to recompute max over the whole tree (O(n^2) total),
// and the package had no main function so it did not build.
func TestInsertIsNotQuadratic(t *testing.T) {
	tree := NewIntervalTree()
	rng := rand.New(rand.NewSource(1))
	start := time.Now()
	for i := 0; i < 100000; i++ {
		low := rng.Intn(1000000)
		tree.Insert(NewInterval(low, low+rng.Intn(1000)))
	}
	if time.Since(start) > 5*time.Second {
		t.Fatal("100000 random inserts took too long")
	}
	checkMax(t, tree.root)
}

func TestRandomAgainstBruteForce(t *testing.T) {
	for seed := 0; seed < 100; seed++ {
		rng := rand.New(rand.NewSource(int64(seed)))
		tree := NewIntervalTree()
		ref := []pair{}
		for step := 0; step < 80; step++ {
			if len(ref) > 0 && rng.Intn(10) < 3 {
				idx := rng.Intn(len(ref))
				v := ref[idx]
				if !tree.Delete(NewInterval(v[0], v[1])) {
					t.Fatal("delete of a stored interval failed")
				}
				ref = append(ref[:idx], ref[idx+1:]...)
			} else {
				low := rng.Intn(40)
				high := low + rng.Intn(15)
				tree.Insert(NewInterval(low, high))
				ref = append(ref, pair{low, high})
			}
			checkMax(t, tree.root)
			lo := rng.Intn(50)
			hi := lo + rng.Intn(15)
			wantOverlap, wantContained := []Interval{}, []Interval{}
			for _, iv := range ref {
				if !(iv[1] < lo || hi < iv[0]) {
					wantOverlap = append(wantOverlap, Interval{iv[0], iv[1]})
				}
				if lo <= iv[0] && iv[1] <= hi {
					wantContained = append(wantContained, Interval{iv[0], iv[1]})
				}
			}
			q := NewInterval(lo, hi)
			if !reflect.DeepEqual(sorted(tree.SearchOverlapping(q)), sorted(wantOverlap)) {
				t.Fatalf("seed %d step %d: overlap mismatch", seed, step)
			}
			if !reflect.DeepEqual(sorted(tree.SearchContainedIn(q)), sorted(wantContained)) {
				t.Fatalf("seed %d step %d: contained mismatch", seed, step)
			}
		}
		if tree.Size() != len(ref) {
			t.Fatal("size mismatch")
		}
	}
}
