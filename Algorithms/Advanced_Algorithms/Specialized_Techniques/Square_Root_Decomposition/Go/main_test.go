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

func TestEmptyInput(t *testing.T) {
	sd := NewSqrtDecomposition([]int{})
	if len(sd.blocks) != 0 {
		t.Errorf("Expected no blocks, got %v", sd.blocks)
	}
}

func TestUpdateDoesNotChangeCallersSlice(t *testing.T) {
	arr := []int{1, 2, 3}
	sd := NewSqrtDecomposition(arr)
	sd.Update(0, 100)
	if arr[0] != 1 {
		t.Errorf("caller's slice was modified: %v", arr)
	}
	if sd.Query(0, 2) != 105 {
		t.Errorf("Expected 105, got %d", sd.Query(0, 2))
	}
}

func TestPartialLastBlock(t *testing.T) {
	arr := []int{1, 2, 3, 4, 5, 6, 7, 8, 9, 10}
	sd := NewSqrtDecomposition(arr)
	if got := sd.Query(8, 9); got != 19 {
		t.Errorf("Expected 19, got %d", got)
	}
	if got := sd.Query(3, 9); got != 49 {
		t.Errorf("Expected 49, got %d", got)
	}
}
