package main

import (
	"reflect"
	"testing"
)

func TestBuildFromArray(t *testing.T) {
	array := []int{9, 3, 7, 1, 8, 12, 10, 20, 15, 18, 5}
	tree := NewCartesianTreeFromArray(array)

	result := tree.InorderTraversal()
	if !reflect.DeepEqual(result, array) {
		t.Errorf("Expected %v, got %v", array, result)
	}
}

func TestEmptyArray(t *testing.T) {
	array := []int{}
	tree := NewCartesianTreeFromArray(array)

	if !tree.IsEmpty() {
		t.Error("Expected tree to be empty")
	}

	result := tree.InorderTraversal()
	if len(result) != 0 {
		t.Error("Expected empty traversal result")
	}

	if tree.Size() != 0 {
		t.Errorf("Expected size 0, got %d", tree.Size())
	}
}

func TestSingleElement(t *testing.T) {
	array := []int{42}
	tree := NewCartesianTreeFromArray(array)

	if tree.IsEmpty() {
		t.Error("Expected tree not to be empty")
	}

	result := tree.InorderTraversal()
	if !reflect.DeepEqual(result, array) {
		t.Errorf("Expected %v, got %v", array, result)
	}

	if tree.root.value != 42 {
		t.Errorf("Expected root value 42, got %d", tree.root.value)
	}

	if tree.Size() != 1 {
		t.Errorf("Expected size 1, got %d", tree.Size())
	}
}

func TestSortedArray(t *testing.T) {
	array := []int{1, 2, 3, 4, 5}
	tree := NewCartesianTreeFromArray(array)

	result := tree.InorderTraversal()
	if !reflect.DeepEqual(result, array) {
		t.Errorf("Expected %v, got %v", array, result)
	}

	if tree.GetRootValue() != 1 {
		t.Errorf("Expected root value 1, got %d", tree.GetRootValue())
	}
}

func TestTraversals(t *testing.T) {
	array := []int{9, 3, 7, 1, 8}
	tree := NewCartesianTreeFromArray(array)

	inorder := tree.InorderTraversal()
	if !reflect.DeepEqual(inorder, array) {
		t.Errorf("Expected inorder %v, got %v", array, inorder)
	}

	preorder := tree.PreorderTraversal()
	if preorder[0] != 1 {
		t.Errorf("Expected preorder to start with 1, got %d", preorder[0])
	}
}

func TestSize(t *testing.T) {
	array := []int{9, 3, 7, 1, 8, 12, 10}
	tree := NewCartesianTreeFromArray(array)

	if tree.Size() != len(array) {
		t.Errorf("Expected size %d, got %d", len(array), tree.Size())
	}
}


func TestMinIndexMatchesBruteForce(t *testing.T) {
	seed := uint32(17)
	next := func() uint32 {
		seed = seed*1664525 + 1013904223
		return seed >> 8
	}
	for round := 0; round < 60; round++ {
		n := 1 + int(next()%25)
		array := make([]int, n)
		for i := range array {
			array[i] = int(next()%11) - 5
		}
		tree := NewCartesianTreeFromArray(array)
		for l := 0; l < n; l++ {
			for r := l; r < n; r++ {
				best := l
				for k := l; k <= r; k++ {
					if array[k] < array[best] {
						best = k
					}
				}
				if got := tree.GetMinIndex(l, r); got != best {
					t.Fatalf("%v [%d,%d]: got %d want %d", array, l, r, got, best)
				}
			}
		}
	}
}

func TestMinIndexInvalidRanges(t *testing.T) {
	tree := NewCartesianTreeFromArray([]int{4, 2, 6})
	if tree.GetMinIndex(2, 1) != -1 || tree.GetMinIndex(-1, 1) != -1 || tree.GetMinIndex(0, 3) != -1 {
		t.Error("expected -1 for invalid ranges")
	}
	if NewCartesianTree().GetMinIndex(0, 0) != -1 {
		t.Error("expected -1 on an empty tree")
	}
}

func TestSortedInputIsAChain(t *testing.T) {
	array := make([]int, 100000)
	for i := range array {
		array[i] = i
	}
	tree := NewCartesianTreeFromArray(array)
	if tree.Height() != len(array)-1 || tree.Size() != len(array) {
		t.Errorf("height %d size %d", tree.Height(), tree.Size())
	}
	if tree.GetMinIndex(500, 99999) != 500 {
		t.Error("expected 500")
	}
}
