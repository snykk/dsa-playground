package main

import (
	"fmt"
	"sort"
)

func compressCoordinates(coords []int) map[int]int {
	unique := make(map[int]bool)
	for _, c := range coords {
		unique[c] = true
	}
	sorted := make([]int, 0, len(unique))
	for c := range unique {
		sorted = append(sorted, c)
	}
	sort.Ints(sorted)
	mapping := make(map[int]int)
	for i, c := range sorted {
		mapping[c] = i
	}
	return mapping
}

func decompressCoordinates(mapping map[int]int) []int {
	reverseMapping := make(map[int]int)
	for k, v := range mapping {
		reverseMapping[v] = k
	}
	result := make([]int, len(reverseMapping))
	for i := 0; i < len(result); i++ {
		result[i] = reverseMapping[i]
	}
	return result
}

func compress2DCoordinates(points [][]int) (map[int]int, map[int]int) {
	xCoords := make([]int, len(points))
	yCoords := make([]int, len(points))
	for i, p := range points {
		xCoords[i] = p[0]
		yCoords[i] = p[1]
	}
	return compressCoordinates(xCoords), compressCoordinates(yCoords)
}

func main() {
	coords := []int{1000, 5, 200, 1000, 5, 50}
	mapping := compressCoordinates(coords)
	fmt.Printf("Compressed mapping size: %d\n", len(mapping))

	decompressed := decompressCoordinates(mapping)
	fmt.Printf("Decompressed: %v\n", decompressed)
}
