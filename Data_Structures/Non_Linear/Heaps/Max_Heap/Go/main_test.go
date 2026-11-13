package main

import (
	"math/rand"
	"sort"
	"testing"
)

func TestInsertAndPeek(t *testing.T) {
	heap := NewMaxHeap()
	heap.Insert(5)
	heap.Insert(3)
	heap.Insert(7)
	if heap.Peek() != 7 {
		t.Errorf("Expected 7, got %d", heap.Peek())
	}
}

func TestExtractMax(t *testing.T) {
	heap := NewMaxHeap()
	heap.Insert(5)
	heap.Insert(3)
	heap.Insert(7)
	heap.Insert(1)

	if heap.ExtractMax() != 7 {
		t.Errorf("Expected 7, got %d", heap.ExtractMax())
	}
	if heap.ExtractMax() != 5 {
		t.Errorf("Expected 5, got %d", heap.ExtractMax())
	}
	if heap.ExtractMax() != 3 {
		t.Errorf("Expected 3, got %d", heap.ExtractMax())
	}
	if heap.ExtractMax() != 1 {
		t.Errorf("Expected 1, got %d", heap.ExtractMax())
	}
}

func TestHeapify(t *testing.T) {
	arr := []int{5, 3, 7, 1, 9, 2}
	heap := NewMaxHeapFromArray(arr)

	result := []int{}
	for !heap.IsEmpty() {
		result = append(result, heap.ExtractMax())
	}

	expected := []int{9, 7, 5, 3, 2, 1}
	if len(result) != len(expected) {
		t.Errorf("Expected length %d, got %d", len(expected), len(result))
	}
	for i := range expected {
		if result[i] != expected[i] {
			t.Errorf("Expected %d, got %d", expected[i], result[i])
		}
	}
}

func TestIsEmpty(t *testing.T) {
	heap := NewMaxHeap()
	if !heap.IsEmpty() {
		t.Error("Expected empty heap")
	}
	heap.Insert(5)
	if heap.IsEmpty() {
		t.Error("Expected non-empty heap")
	}
}

func TestSize(t *testing.T) {
	heap := NewMaxHeap()
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
	heap := NewMaxHeap()
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
	heap := NewMaxHeap()
	heap.Insert(5)
	if heap.Peek() != 5 {
		t.Errorf("Expected 5, got %d", heap.Peek())
	}
	if heap.ExtractMax() != 5 {
		t.Errorf("Expected 5, got %d", heap.ExtractMax())
	}
	if !heap.IsEmpty() {
		t.Error("Expected empty heap")
	}
}


func TestRandomWithDuplicatesMatchesSort(t *testing.T) {
	rng := rand.New(rand.NewSource(5))
	ref := make([]int, 1000)
	for i := range ref {
		ref[i] = rng.Intn(201) - 100
	}
	heap := NewMaxHeapFromArray(ref)
	sort.Sort(sort.Reverse(sort.IntSlice(ref)))
	for i, want := range ref {
		if got := heap.ExtractMax(); got != want {
			t.Fatalf("pop %d: expected %d, got %d", i, want, got)
		}
	}
}

func TestFromArrayDoesNotModifyInput(t *testing.T) {
	in := []int{3, 1, 2}
	NewMaxHeapFromArray(in)
	if in[0] != 3 || in[1] != 1 || in[2] != 2 {
		t.Errorf("input modified: %v", in)
	}
}

func TestEmptyHeapPanics(t *testing.T) {
	heap := NewMaxHeap()
	for name, f := range map[string]func(){"Peek": func() { heap.Peek() }, "ExtractMax": func() { heap.ExtractMax() }} {
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
