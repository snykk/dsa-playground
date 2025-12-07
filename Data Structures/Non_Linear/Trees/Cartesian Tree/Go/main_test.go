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

