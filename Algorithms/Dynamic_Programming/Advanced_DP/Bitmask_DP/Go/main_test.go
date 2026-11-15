package main

import (
	"math"
	"math/rand"
	"testing"
)

var inf = math.Inf(1)

func TestTravelingSalesmanDP(t *testing.T) {
	tests := []struct {
		name      string
		distances [][]float64
		want      float64
	}{
		{"small", [][]float64{
			{0, 10, 15, 20},
			{10, 0, 35, 25},
			{15, 35, 0, 30},
			{20, 25, 30, 0},
		}, 80},
		// A city with no edges to the others: no tour exists (not a free tour).
		{"no tour is infinite", [][]float64{{0, 1, inf}, {1, 0, inf}, {inf, inf, 0}}, inf},
		{"no cities", [][]float64{}, 0},
		{"nil matrix", nil, 0},
		{"one city", [][]float64{{0}}, 0},
		{"two cities", [][]float64{{0, 7}, {7, 0}}, 14},
		{"triangle", [][]float64{{0, 1, 4}, {1, 0, 2}, {4, 2, 0}}, 7},
	}
	for _, tc := range tests {
		if got := TravelingSalesmanDP(tc.distances); got != tc.want {
			t.Errorf("%s: got %v, want %v", tc.name, got, tc.want)
		}
	}
}

// Expected values printed by the Python traveling_salesman_dp on the same matrices.
func TestTravelingSalesmanDPAgreesWithPython(t *testing.T) {
	tests := []struct {
		name      string
		distances [][]float64
		want      float64
	}{
		{"one city closes with its self-distance", [][]float64{{5}}, 5},
		{"asymmetric floats", [][]float64{
			{0, 1.5, 2.25, 9.0, 0.1},
			{3.0, 0, 0.7, 4.4, 2.0},
			{1.1, 6.0, 0, 0.3, 5.5},
			{2.2, 0.9, 7.1, 0, 1.3},
			{0.4, 3.3, 2.8, 6.6, 0},
		}, 4.2},
		{"six cities", [][]float64{
			{0, 12, 29, 22, 13, 24},
			{12, 0, 19, 3, 25, 6},
			{29, 19, 0, 21, 23, 28},
			{22, 3, 21, 0, 4, 5},
			{13, 25, 23, 4, 0, 16},
			{24, 6, 28, 5, 16, 0},
		}, 76},
		{"one cycle only", [][]float64{{0, 2, inf, inf}, {inf, 0, 3, inf}, {inf, inf, 0, 4}, {5, inf, inf, 0}}, 14},
	}
	for _, tc := range tests {
		if got := TravelingSalesmanDP(tc.distances); got != tc.want {
			t.Errorf("%s: got %v, want %v", tc.name, got, tc.want)
		}
	}
}

// bruteForceTour tries every order of cities 1..n-1.
func bruteForceTour(distances [][]float64) float64 {
	n := len(distances)
	best := inf
	used := make([]bool, n)
	var extend func(at, count int, cost float64)
	extend = func(at, count int, cost float64) {
		if count == n {
			best = math.Min(best, cost+distances[at][0])
			return
		}
		for city := 1; city < n; city++ {
			if !used[city] {
				used[city] = true
				extend(city, count+1, cost+distances[at][city])
				used[city] = false
			}
		}
	}
	extend(0, 1, 0)
	return best
}

func TestTravelingSalesmanDPMatchesBruteForce(t *testing.T) {
	rng := rand.New(rand.NewSource(20261115))
	for trial := 0; trial < 300; trial++ {
		n := 1 + rng.Intn(8)
		distances := make([][]float64, n)
		for i := range distances {
			distances[i] = make([]float64, n)
			for j := range distances[i] {
				// About one edge in six is missing; the matrix is not symmetric.
				if rng.Intn(6) == 0 {
					distances[i][j] = inf
				} else {
					distances[i][j] = float64(rng.Intn(50))
				}
			}
		}
		if got, want := TravelingSalesmanDP(distances), bruteForceTour(distances); got != want {
			t.Fatalf("trial %d: got %v, want %v for %v", trial, got, want, distances)
		}
	}
}
