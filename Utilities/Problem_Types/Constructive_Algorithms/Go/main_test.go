package main

import "testing"

func TestConstructPermutation(t *testing.T) {
	perm := ConstructPermutation(5, 2)
	if perm == nil {
		t.Error("Should construct permutation")
	}
	if len(perm) != 5 {
		t.Error("Wrong length")
	}
}

func TestConstructArrayWithSum(t *testing.T) {
	arr := ConstructArrayWithSum(5, 20, 1, 5)
	if arr == nil {
		t.Error("Should construct array")
	}
	sum := 0
	for _, x := range arr {
		sum += x
	}
	if sum != 20 {
		t.Errorf("Expected sum 20, got %d", sum)
	}
}
