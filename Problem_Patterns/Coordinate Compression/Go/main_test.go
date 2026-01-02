package main

import "testing"

func TestCompressCoordinates(t *testing.T) {
	coords := []int{1000, 5, 200, 1000, 5, 50}
	mapping := compressCoordinates(coords)
	if len(mapping) != 4 {
		t.Errorf("Compress failed")
	}
}

func TestDecompressCoordinates(t *testing.T) {
	coords := []int{1000, 5, 200, 50}
	mapping := compressCoordinates(coords)
	decompressed := decompressCoordinates(mapping)
	if len(decompressed) != 4 {
		t.Errorf("Decompress failed")
	}
}
