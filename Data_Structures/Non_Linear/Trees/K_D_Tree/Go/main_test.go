package main

import (
	"math/rand"
	"reflect"
	"sort"
	"testing"
)

func bruteNearest(pts []Point, q Point) Point {
	best := pts[0]
	bd := squaredDistance(q, best)
	for _, p := range pts {
		d := squaredDistance(q, p)
		if d < bd {
			bd = d
			best = p
		}
	}
	return best
}

func pointsEqual(a, b Point) bool {
	if len(a) != len(b) {
		return false
	}
	for i := range a {
		if a[i] != b[i] {
			return false
		}
	}
	return true
}

func TestEmpty(t *testing.T) {
	tree := NewKDTree(nil)
	if tree.Nearest(Point{0, 0}) != nil {
		t.Errorf("empty tree should return nil")
	}
}

func TestSinglePoint(t *testing.T) {
	tree := NewKDTree([]Point{{5, 5}})
	if !pointsEqual(tree.Nearest(Point{0, 0}), Point{5, 5}) {
		t.Errorf("expected (5,5)")
	}
}

func TestTextbook2D(t *testing.T) {
	pts := []Point{{7, 2}, {5, 4}, {9, 6}, {2, 3}, {4, 7}, {8, 1}}
	tree := NewKDTree(pts)
	if !pointsEqual(tree.Nearest(Point{6, 5}), Point{5, 4}) {
		t.Errorf("nearest to (6,5) should be (5,4)")
	}
}

func TestNearestIsSelf(t *testing.T) {
	tree := NewKDTree([]Point{{1, 1}, {2, 2}, {3, 3}})
	if !pointsEqual(tree.Nearest(Point{2, 2}), Point{2, 2}) {
		t.Errorf("nearest to (2,2) should be (2,2) exactly")
	}
}

func TestRandom2DCrossCheckBrute(t *testing.T) {
	rng := rand.New(rand.NewSource(42))
	pts := make([]Point, 100)
	for i := range pts {
		pts[i] = Point{rng.Float64()*200 - 100, rng.Float64()*200 - 100}
	}
	tree := NewKDTree(pts)
	for i := 0; i < 50; i++ {
		q := Point{rng.Float64()*200 - 100, rng.Float64()*200 - 100}
		got := tree.Nearest(q)
		want := bruteNearest(pts, q)
		if !pointsEqual(got, want) {
			t.Errorf("query %v: got %v, want %v", q, got, want)
		}
	}
}

func TestIncrementalInsert(t *testing.T) {
	tree := NewKDTree([]Point{{5, 5}})
	tree.Insert(Point{1, 1})
	tree.Insert(Point{9, 9})
	if !pointsEqual(tree.Nearest(Point{0, 0}), Point{1, 1}) {
		t.Errorf("(0,0)'s nearest should be (1,1)")
	}
	if !pointsEqual(tree.Nearest(Point{10, 10}), Point{9, 9}) {
		t.Errorf("(10,10)'s nearest should be (9,9)")
	}
}

func TestRangeSearch(t *testing.T) {
	pts := []Point{{1, 1}, {2, 2}, {3, 3}, {10, 10}}
	tree := NewKDTree(pts)
	got := tree.RangeSearch(Point{0, 0}, Point{5, 5})
	if len(got) != 3 {
		t.Errorf("expected 3 points in range, got %d (%v)", len(got), got)
	}
	empty := tree.RangeSearch(Point{20, 20}, Point{30, 30})
	if len(empty) != 0 {
		t.Errorf("expected no points, got %v", empty)
	}
}

func TestRangeSearchCrossCheck(t *testing.T) {
	rng := rand.New(rand.NewSource(99))
	pts := make([]Point, 50)
	for i := range pts {
		pts[i] = Point{rng.Float64() * 100, rng.Float64() * 100}
	}
	tree := NewKDTree(pts)
	for i := 0; i < 20; i++ {
		lo := Point{rng.Float64() * 100, rng.Float64() * 100}
		hi := Point{lo[0] + rng.Float64()*30, lo[1] + rng.Float64()*30}
		var brute []Point
		for _, p := range pts {
			if lo[0] <= p[0] && p[0] <= hi[0] && lo[1] <= p[1] && p[1] <= hi[1] {
				brute = append(brute, p)
			}
		}
		got := tree.RangeSearch(lo, hi)
		sortByCoords(got)
		sortByCoords(brute)
		if len(got) != len(brute) {
			t.Errorf("range %v-%v: got %d, want %d", lo, hi, len(got), len(brute))
			continue
		}
		if !reflect.DeepEqual(got, brute) {
			t.Errorf("range %v-%v mismatch: got %v, want %v", lo, hi, got, brute)
		}
	}
}

func sortByCoords(pts []Point) {
	sort.Slice(pts, func(i, j int) bool {
		for axis := 0; axis < len(pts[i]); axis++ {
			if pts[i][axis] != pts[j][axis] {
				return pts[i][axis] < pts[j][axis]
			}
		}
		return false
	})
}

func Test3D(t *testing.T) {
	pts := []Point{{1, 1, 1}, {2, 2, 2}, {10, 10, 10}}
	tree := NewKDTree(pts)
	if tree.Dimensionality() != 3 {
		t.Errorf("k = %d, want 3", tree.Dimensionality())
	}
	if !pointsEqual(tree.Nearest(Point{0, 0, 0}), Point{1, 1, 1}) {
		t.Errorf("3D nearest broken")
	}
}

// Regression: a query with the wrong dimensionality used to panic with an
// index error (or silently read garbage); it now fails with a clear message.
func TestQueryDimensionMismatchPanics(t *testing.T) {
	tree := NewKDTree([]Point{{1, 2}, {3, 4}, {5, 6}})
	calls := map[string]func(){
		"nearest":      func() { tree.Nearest(Point{1}) },
		"range lo":     func() { tree.RangeSearch(Point{0}, Point{1, 1}) },
		"range hi":     func() { tree.RangeSearch(Point{0, 0}, Point{1, 1, 1}) },
		"insert wrong": func() { tree.Insert(Point{1, 2, 3}) },
	}
	for name, call := range calls {
		func() {
			defer func() {
				r := recover()
				if r == nil {
					t.Errorf("%s: expected a panic", name)
				} else if _, ok := r.(string); !ok {
					t.Errorf("%s: expected a descriptive string panic, got %v", name, r)
				}
			}()
			call()
		}()
	}
}
