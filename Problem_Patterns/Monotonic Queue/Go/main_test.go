package main

import (
	"reflect"
	"testing"
)

func TestSlidingWindowMax(t *testing.T) {
	tests := []struct {
		name string
		arr  []int
		k    int
		want []int
	}{
		{"leetcode example", []int{1, 3, -1, -3, 5, 3, 6, 7}, 3, []int{3, 3, 5, 5, 6, 7}},
		{"window equals length", []int{2, 1, 3}, 3, []int{3}},
		{"window size one", []int{1, 2, 3}, 1, []int{1, 2, 3}},
		{"all equal", []int{5, 5, 5, 5}, 2, []int{5, 5, 5}},
		{"decreasing", []int{5, 4, 3, 2, 1}, 3, []int{5, 4, 3}},
		{"increasing", []int{1, 2, 3, 4, 5}, 3, []int{3, 4, 5}},
		{"empty array", []int{}, 3, []int{}},
		{"window larger than array", []int{1, 2}, 3, []int{}},
		{"window zero", []int{1, 2, 3}, 0, []int{}},
		{"negative values", []int{-5, -3, -8, -1, -2, -7}, 3, []int{-3, -1, -1, -1}},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := SlidingWindowMax(tt.arr, tt.k)
			if !reflect.DeepEqual(got, tt.want) {
				t.Errorf("SlidingWindowMax(%v, %d) = %v, want %v",
					tt.arr, tt.k, got, tt.want)
			}
		})
	}
}

func TestSlidingWindowMin(t *testing.T) {
	tests := []struct {
		name string
		arr  []int
		k    int
		want []int
	}{
		{"basic", []int{1, 3, -1, -3, 5, 3, 6, 7}, 3, []int{-1, -3, -3, -3, 3, 3}},
		{"all equal", []int{5, 5, 5, 5}, 2, []int{5, 5, 5}},
		{"window size one", []int{3, 1, 2}, 1, []int{3, 1, 2}},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := SlidingWindowMin(tt.arr, tt.k)
			if !reflect.DeepEqual(got, tt.want) {
				t.Errorf("SlidingWindowMin(%v, %d) = %v, want %v",
					tt.arr, tt.k, got, tt.want)
			}
		})
	}
}
