package main

import "testing"

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

