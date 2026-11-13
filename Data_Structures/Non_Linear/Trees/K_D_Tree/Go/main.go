// Package main implements a K-D Tree with runtime-variable dimensionality.
//
// Points are []float64; all points in a single tree must share the same
// length k. Supports build, insert, nearest-neighbor, and range queries.
package main

import (
	"fmt"
	"sort"
)

// Point is a k-dimensional point.
type Point []float64

type node struct {
	point       Point
	axis        int
	left, right *node
}

// KDTree supports nearest-neighbor and range queries over k-dimensional points.
type KDTree struct {
	root *node
	k    int
}

// NewKDTree builds a balanced tree from the given points. All points must
// share the same dimensionality.
func NewKDTree(points []Point) *KDTree {
	if len(points) == 0 {
		return &KDTree{}
	}
	k := len(points[0])
	for _, p := range points {
		if len(p) != k {
			panic("all points must share dimensionality")
		}
	}
	pts := make([]Point, len(points))
	copy(pts, points)
	t := &KDTree{k: k}
	t.root = t.build(pts, 0)
	return t
}

// Dimensionality returns k.
func (t *KDTree) Dimensionality() int { return t.k }

func (t *KDTree) build(pts []Point, depth int) *node {
	if len(pts) == 0 {
		return nil
	}
	axis := depth % t.k
	sort.Slice(pts, func(i, j int) bool {
		return pts[i][axis] < pts[j][axis]
	})
	mid := len(pts) / 2
	return &node{
		point: pts[mid],
		axis:  axis,
		left:  t.build(pts[:mid], depth+1),
		right: t.build(pts[mid+1:], depth+1),
	}
}

// Insert adds a point to the tree. Does not rebalance.
func (t *KDTree) Insert(p Point) {
	if t.root == nil {
		t.k = len(p)
		t.root = &node{point: p, axis: 0}
		return
	}
	if len(p) != t.k {
		panic(fmt.Sprintf("expected %d-dim point, got %d", t.k, len(p)))
	}

	n := t.root
	depth := 0
	for {
		axis := depth % t.k
		if p[axis] < n.point[axis] {
			if n.left == nil {
				n.left = &node{point: p, axis: (depth + 1) % t.k}
				return
			}
			n = n.left
		} else {
			if n.right == nil {
				n.right = &node{point: p, axis: (depth + 1) % t.k}
				return
			}
			n = n.right
		}
		depth++
	}
}

// Nearest returns the point in the tree closest to query (Euclidean).
// Returns nil if the tree is empty.
func (t *KDTree) Nearest(query Point) Point {
	if t.root == nil {
		return nil
	}
	if len(query) != t.k {
		panic(fmt.Sprintf("expected %d-dim query, got %d", t.k, len(query)))
	}
	best := t.root.point
	bestDist := squaredDistance(query, best)
	t.nearestHelper(t.root, query, &best, &bestDist)
	return best
}

func (t *KDTree) nearestHelper(n *node, q Point, best *Point, bestDist *float64) {
	if n == nil {
		return
	}
	d := squaredDistance(q, n.point)
	if d < *bestDist {
		*bestDist = d
		*best = n.point
	}
	diff := q[n.axis] - n.point[n.axis]
	var near, far *node
	if diff < 0 {
		near, far = n.left, n.right
	} else {
		near, far = n.right, n.left
	}
	t.nearestHelper(near, q, best, bestDist)
	if diff*diff < *bestDist {
		t.nearestHelper(far, q, best, bestDist)
	}
}

// RangeSearch returns every point p with lo[i] <= p[i] <= hi[i] for all i.
func (t *KDTree) RangeSearch(lo, hi Point) []Point {
	if t.root != nil && (len(lo) != t.k || len(hi) != t.k) {
		panic(fmt.Sprintf("bounds must be %d-dim", t.k))
	}
	var out []Point
	t.rangeHelper(t.root, lo, hi, &out)
	return out
}

func (t *KDTree) rangeHelper(n *node, lo, hi Point, out *[]Point) {
	if n == nil {
		return
	}
	inside := true
	for i := 0; i < t.k; i++ {
		if n.point[i] < lo[i] || n.point[i] > hi[i] {
			inside = false
			break
		}
	}
	if inside {
		*out = append(*out, n.point)
	}
	if lo[n.axis] <= n.point[n.axis] {
		t.rangeHelper(n.left, lo, hi, out)
	}
	if hi[n.axis] >= n.point[n.axis] {
		t.rangeHelper(n.right, lo, hi, out)
	}
}

func squaredDistance(a, b Point) float64 {
	d := 0.0
	for i := range a {
		diff := a[i] - b[i]
		d += diff * diff
	}
	return d
}

func main() {
	pts := []Point{{7, 2}, {5, 4}, {9, 6}, {2, 3}, {4, 7}, {8, 1}}
	tree := NewKDTree(pts)
	fmt.Printf("Nearest to (6, 5): %v\n", tree.Nearest(Point{6, 5}))
	fmt.Printf("In rect (3,3)-(8,7): %v\n",
		tree.RangeSearch(Point{3, 3}, Point{8, 7}))
}
