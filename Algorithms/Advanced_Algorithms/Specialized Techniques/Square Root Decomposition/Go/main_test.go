package main

import (
	"testing"
)

func TestQuery(t *testing.T) {
	arr := []int{1, 2, 3, 4, 5, 6, 7, 8, 9, 10}
	sd := NewSqrtDecomposition(arr)
	sum := 0
	for _, val := range arr {
		sum += val
	}
	if sd.Query(0, 9) != sum {
		t.Errorf("Expected sum %d, got %d", sum, sd.Query(0, 9))
	}
}

func TestUpdate(t *testing.T) {
	arr := []int{1, 2, 3, 4, 5}
	sd := NewSqrtDecomposition(arr)
	sd.Update(2, 10)
	expected := 1 + 2 + 10 + 4 + 5
	if sd.Query(0, 4) != expected {
		t.Errorf("Expected %d, got %d", expected, sd.Query(0, 4))
	}
}
