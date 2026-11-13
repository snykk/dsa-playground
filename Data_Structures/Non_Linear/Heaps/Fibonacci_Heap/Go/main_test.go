package main

import (
	"math/rand"
	"sort"
	"testing"
)

func TestInsertAndPeek(t *testing.T) {
	heap := NewFibonacciHeap()
	heap.Insert(5)
	heap.Insert(3)
	heap.Insert(7)
	if heap.Peek() != 3 {
		t.Errorf("Expected 3, got %d", heap.Peek())
	}
}

func TestExtractMin(t *testing.T) {
	heap := NewFibonacciHeap()
	heap.Insert(5)
	heap.Insert(3)
	heap.Insert(7)
	heap.Insert(1)

	if heap.ExtractMin() != 1 {
		t.Errorf("Expected 1, got %d", heap.ExtractMin())
	}
	if heap.ExtractMin() != 3 {
		t.Errorf("Expected 3, got %d", heap.ExtractMin())
	}
	if heap.ExtractMin() != 5 {
		t.Errorf("Expected 5, got %d", heap.ExtractMin())
	}
	if heap.ExtractMin() != 7 {
		t.Errorf("Expected 7, got %d", heap.ExtractMin())
	}
}

func TestIsEmpty(t *testing.T) {
	heap := NewFibonacciHeap()
	if !heap.IsEmpty() {
		t.Error("Expected empty heap")
	}
	heap.Insert(5)
	if heap.IsEmpty() {
		t.Error("Expected non-empty heap")
	}
}

func TestSize(t *testing.T) {
	heap := NewFibonacciHeap()
	if heap.Size() != 0 {
		t.Errorf("Expected size 0, got %d", heap.Size())
	}
	heap.Insert(5)
	heap.Insert(3)
	if heap.Size() != 2 {
		t.Errorf("Expected size 2, got %d", heap.Size())
	}
}

func TestClear(t *testing.T) {
	heap := NewFibonacciHeap()
	heap.Insert(5)
	heap.Insert(3)
	heap.Clear()
	if !heap.IsEmpty() {
		t.Error("Expected empty heap after clear")
	}
	if heap.Size() != 0 {
		t.Errorf("Expected size 0, got %d", heap.Size())
	}
}

func TestSingleElement(t *testing.T) {
	heap := NewFibonacciHeap()
	heap.Insert(5)
	if heap.Peek() != 5 {
		t.Errorf("Expected 5, got %d", heap.Peek())
	}
	if heap.ExtractMin() != 5 {
		t.Errorf("Expected 5, got %d", heap.ExtractMin())
	}
	if !heap.IsEmpty() {
		t.Error("Expected empty heap")
	}
}

func TestMultipleExtracts(t *testing.T) {
	heap := NewFibonacciHeap()
	arr := []int{5, 3, 7, 1, 9, 2}
	for _, val := range arr {
		heap.Insert(val)
	}

	result := []int{}
	for !heap.IsEmpty() {
		result = append(result, heap.ExtractMin())
	}

	expected := []int{1, 2, 3, 5, 7, 9}
	if len(result) != len(expected) {
		t.Errorf("Expected length %d, got %d", len(expected), len(result))
	}
	for i := range expected {
		if result[i] != expected[i] {
			t.Errorf("Expected %d, got %d", expected[i], result[i])
		}
	}
}


func TestScaleWithDuplicatesAndNegatives(t *testing.T) {
	rng := rand.New(rand.NewSource(7))
	heap := NewFibonacciHeap()
	vals := make([]int, 2000)
	for i := range vals {
		vals[i] = rng.Intn(501) - 250
		heap.Insert(vals[i])
	}
	sort.Ints(vals)
	for i, want := range vals {
		if got := heap.ExtractMin(); got != want {
			t.Fatalf("extract %d: expected %d, got %d", i, want, got)
		}
	}
	if !heap.IsEmpty() {
		t.Error("expected empty heap")
	}
}

func TestEmptyHeapPanics(t *testing.T) {
	heap := NewFibonacciHeap()
	for name, f := range map[string]func(){"Peek": func() { heap.Peek() }, "ExtractMin": func() { heap.ExtractMin() }} {
		func() {
			defer func() {
				if recover() == nil {
					t.Errorf("%s on empty heap should panic", name)
				}
			}()
			f()
		}()
	}
}
