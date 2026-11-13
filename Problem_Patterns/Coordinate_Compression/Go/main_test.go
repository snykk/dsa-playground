package main

import (
	"reflect"
	"testing"
)

func TestCompressCoordinates(t *testing.T) {
	coords := []int{1000, 5, 200, 1000, 5, 50}
	mapping := compressCoordinates(coords)
	if len(mapping) != 4 {
		t.Errorf("Compress failed")
	}
	want := map[int]int{5: 0, 50: 1, 200: 2, 1000: 3}
	if !reflect.DeepEqual(mapping, want) {
		t.Errorf("mapping = %v, want %v", mapping, want)
	}
	ranks := make([]int, len(coords))
	for i, c := range coords {
		ranks[i] = mapping[c]
	}
	if !reflect.DeepEqual(ranks, []int{3, 0, 2, 3, 0, 1}) {
		t.Errorf("ranks = %v", ranks)
	}
}

func TestDecompressCoordinates(t *testing.T) {
	coords := []int{1000, 5, 200, 50}
	mapping := compressCoordinates(coords)
	decompressed := decompressCoordinates(mapping)
	if len(decompressed) != 4 {
		t.Errorf("Decompress failed")
	}
	if !reflect.DeepEqual(decompressed, []int{5, 50, 200, 1000}) {
		t.Errorf("decompressed = %v", decompressed)
	}
}

func TestNegativeAndEmpty(t *testing.T) {
	if got := compressCoordinates(nil); len(got) != 0 {
		t.Errorf("empty input gave %v", got)
	}
	if got := decompressCoordinates(map[int]int{}); len(got) != 0 {
		t.Errorf("empty mapping gave %v", got)
	}
	got := compressCoordinates([]int{7, -3, 0, -3})
	if want := map[int]int{-3: 0, 0: 1, 7: 2}; !reflect.DeepEqual(got, want) {
		t.Errorf("got %v, want %v", got, want)
	}
}

func TestCompress2D(t *testing.T) {
	points := [][]int{{1000, 500}, {5, 10}, {200, 300}, {5, 500}}
	xs, ys := compress2DCoordinates(points)
	if want := map[int]int{5: 0, 200: 1, 1000: 2}; !reflect.DeepEqual(xs, want) {
		t.Errorf("x mapping = %v, want %v", xs, want)
	}
	if want := map[int]int{10: 0, 300: 1, 500: 2}; !reflect.DeepEqual(ys, want) {
		t.Errorf("y mapping = %v, want %v", ys, want)
	}
}
