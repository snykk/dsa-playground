package main

import "testing"

func TestKnapsack01(t *testing.T) {
	cases := []struct {
		name            string
		weights, values []int
		capacity, want  int
	}{
		{"classic", []int{1, 3, 4, 5}, []int{1, 4, 5, 7}, 7, 9},
		{"greedy by ratio fails", []int{10, 20, 30}, []int{60, 100, 120}, 50, 220},
		{"zero capacity", []int{1, 2}, []int{5, 6}, 0, 0},
		{"zero weight is free", []int{0, 2}, []int{5, 6}, 0, 5},
		{"too heavy", []int{5}, []int{9}, 4, 0},
		{"exact fit", []int{4}, []int{9}, 4, 9},
		{"no items", nil, nil, 10, 0},
	}
	for _, c := range cases {
		if got := Knapsack01(c.weights, c.values, c.capacity); got != c.want {
			t.Errorf("%s: got %d, want %d", c.name, got, c.want)
		}
	}
}
